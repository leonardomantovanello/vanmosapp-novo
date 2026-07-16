import Constants from 'expo-constants';

import type { ApiEnvelope } from '@/types/api';

const DEFAULT_API_BASE_URL = 'http://localhost:8080/api';

// Base URL is injected by app.config.js (from EXPO_PUBLIC_API_BASE_URL / a
// local .env file — see .env.example) and surfaced here via expo-constants,
// so switching between a local Spring Boot instance and the Render
// deployment never requires touching this file.
export const API_BASE_URL: string =
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  DEFAULT_API_BASE_URL;

const REQUEST_TIMEOUT_MS = 15000;

export class ApiError extends Error {
  readonly status: number;
  readonly errors?: string[];

  constructor(message: string, status: number, errors?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
}

/**
 * Low-level request helper. Sends/receives JSON, attaches
 * `Authorization: Bearer <token>` when a token is given, and centralizes
 * error handling: any network failure, timeout, or non-2xx response is
 * thrown as an ApiError whose `.message` is the backend's `mensagem` (or a
 * sensible fallback) so callers can show it directly to the user.
 */
export async function apiFetch<TResponse>(path: string, options: ApiRequestOptions = {}): Promise<TResponse> {
  const { method = 'GET', body, token, headers } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('A conexão com o servidor demorou demais. Verifique sua internet.', 0);
    }
    throw new ApiError('Não foi possível conectar ao servidor. Verifique sua internet.', 0);
  } finally {
    clearTimeout(timeoutId);
  }

  // Read as text first: some error responses (proxy/5xx pages, empty
  // bodies for 204s) aren't valid JSON, and we still want a usable message.
  const raw = await response.text();
  let payload: unknown = null;
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const body = payload as { mensagem?: string; erros?: string[] } | null;
    throw new ApiError(
      body?.mensagem ?? 'Ocorreu um erro inesperado. Tente novamente.',
      response.status,
      body?.erros
    );
  }

  return payload as TResponse;
}

/**
 * Higher-level helper for the standard `{ sucesso, mensagem, dados }`
 * envelope used by most endpoints (see dto/ApiResponse.java on the
 * backend). Unwraps `dados` and throws ApiError if the backend reports
 * `sucesso: false` even on a 2xx status (shouldn't normally happen given
 * how the backend is written, but we don't trust that blindly).
 *
 * NOT every endpoint uses this envelope — notably the two login endpoints
 * don't agree with each other on shape either. See services/authService.ts,
 * which calls apiFetch directly instead of apiRequest for that reason.
 */
export async function apiRequest<TData>(path: string, options: ApiRequestOptions = {}): Promise<TData> {
  const payload = await apiFetch<ApiEnvelope<TData>>(path, options);
  if (!payload.sucesso) {
    throw new ApiError(
      payload.mensagem ?? 'Ocorreu um erro inesperado. Tente novamente.',
      payload.status ?? 200,
      payload.erros
    );
  }
  return payload.dados as TData;
}

// --- Token-aware requests (used by every protected endpoint) ---------------

interface TokenHandlers {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  onTokensRefreshed: (tokens: { accessToken: string }) => void;
  onSessionExpired: () => void;
}

let tokenHandlers: TokenHandlers | null = null;

// SessionContext calls this once on mount so this module can read the
// current tokens / react to a forced logout without importing
// context/SessionContext.tsx directly (that would create an import cycle,
// since SessionContext itself needs to call registerTokenHandlers).
export function registerTokenHandlers(handlers: TokenHandlers): void {
  tokenHandlers = handlers;
}

let refreshInFlight: Promise<string | null> | null = null;

/**
 * POST /api/auth/refresh.
 *
 * BACKEND QUIRK: AuthController.refresh() looks the token's subject up via
 * `cadastroRepository.findByEmailIgnoreCase(subject)` unconditionally — it
 * only ever checks the Cadastro (RESPONSAVEL/passenger) table. There is no
 * equivalent lookup against MotoristasAdmin. So this refresh call always
 * succeeds for passenger sessions and always fails with 401 for driver
 * sessions, even with a perfectly valid, unexpired driver refresh token.
 * Drivers currently have no way to silently extend a session past the
 * 15-minute access token lifetime — see onSessionExpired below, which is
 * the fallback this forces for them.
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenHandlers?.getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const payload = await apiFetch<{ sucesso: boolean; accessToken?: string }>('/auth/refresh', {
          method: 'POST',
          body: { refreshToken },
        });
        if (payload.sucesso && payload.accessToken) {
          tokenHandlers?.onTokensRefreshed({ accessToken: payload.accessToken });
          return payload.accessToken;
        }
        return null;
      } catch {
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

/**
 * Request helper for endpoints that require `Authorization: Bearer`.
 * Attaches the current access token automatically, and on a 401 attempts
 * one refresh-and-retry before giving up and calling onSessionExpired
 * (which SessionContext wires up to clear the session and bounce to
 * login). This is a "refresh-on-401" strategy rather than proactively
 * refreshing before the 15-minute expiry — simpler, and sufficient given
 * the access token lifetime.
 */
export async function authorizedRequest<TData>(path: string, options: ApiRequestOptions = {}): Promise<TData> {
  const token = options.token ?? tokenHandlers?.getAccessToken() ?? null;
  try {
    return await apiRequest<TData>(path, { ...options, token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401 && tokenHandlers) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return await apiRequest<TData>(path, { ...options, token: newToken });
      }
      tokenHandlers.onSessionExpired();
    }
    throw error;
  }
}
