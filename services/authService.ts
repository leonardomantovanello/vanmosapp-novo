import { apiFetch, apiRequest, ApiError } from '@/services/api/client';
import type { CadastroLoginResponse, MotoristaLoginData } from '@/types/auth';
import type { UserRole } from '@/types/user';

export { ApiError };

export interface AuthResult {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
  placaVan?: string | null;
  modeloVan?: string | null;
}

// POST /api/login — authenticates against the Passageiro table, which holds
// BOTH drivers and passengers/guardians, discriminated by `tipo`. The real
// role always comes from `payload.usuario.tipo`, never from which button the
// user pressed on the login screen — the screen can't know a given
// email/CPF belongs to a driver or a passenger account before the backend
// answers. Response is flat (no ApiEnvelope), so we call apiFetch directly.
// See types/auth.ts#CadastroLoginResponse for the full shape.
async function loginCadastro(emailOuCpf: string, senha: string): Promise<AuthResult> {
  const payload = await apiFetch<CadastroLoginResponse>('/login', {
    method: 'POST',
    body: { emailOuCpf, senha },
  });

  return {
    id: payload.usuario.id,
    name: payload.usuario.nome,
    email: payload.usuario.email,
    role: payload.usuario.tipo === 'MOTORISTA' ? 'driver' : 'passenger',
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  };
}

// POST /api/motoristas-admin/login — driver, authenticates against
// MotoristasAdmin. Unlike /api/login above, this one DOES use the standard
// ApiEnvelope, with accessToken/refreshToken nested one level deeper under
// `dados` alongside the driver's van info. See
// types/auth.ts#MotoristaLoginData.
async function loginDriver(emailOuCpf: string, senha: string): Promise<AuthResult> {
  const dados = await apiRequest<MotoristaLoginData>('/motoristas-admin/login', {
    method: 'POST',
    body: { emailOuCpf, senha },
  });

  return {
    id: dados.id,
    name: dados.nomeCompleto,
    email: dados.gmail,
    role: 'driver',
    accessToken: dados.accessToken,
    refreshToken: dados.refreshToken,
    placaVan: dados.placaVan,
    modeloVan: dados.modeloVan,
  };
}

// Both endpoints return 401 with a generic "Credenciais inválidas" message
// for bad email/CPF+senha combos (user-enumeration hardening on the
// backend — it deliberately doesn't distinguish "no such user" from "wrong
// password"), and 403 with "Conta inativa..." when `ativo` is false.
// apiFetch/apiRequest already turn both into ApiError with that `mensagem`
// as `.message`, so callers (app/login.tsx) just need to catch ApiError.
//
// There's no "which table do I check" decision to make here anymore: the
// login screen can't know whether a given email/CPF belongs to a driver or
// a passenger before the backend answers, so we always try Passageiro
// first (that's where every real account lives today — both roles,
// discriminated by `tipo`) and only fall back to the separate
// MotoristasAdmin table if the account isn't found there at all (401).
// That fallback exists for drivers created directly in MotoristasAdmin
// (with van info) instead of through self-registration — MotoristasAdmin
// is empty today, so in practice this always resolves via Passageiro.
export async function login(emailOuCpf: string, senha: string): Promise<AuthResult> {
  try {
    return await loginCadastro(emailOuCpf, senha);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return loginDriver(emailOuCpf, senha);
    }
    throw error;
  }
}
