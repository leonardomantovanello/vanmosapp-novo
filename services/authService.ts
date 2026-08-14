import { apiFetch, ApiError } from '@/services/api/client';
import type { CadastroLoginResponse } from '@/types/auth';
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

// POST /api/login — unified login, checks passageiros (responsável/passageiro)
// then motorista internally (see LoginController on the backend) and always
// returns the same flat shape, so there's no client-side fallback to manage
// anymore. Real role comes from `payload.usuario.tipo`, never from which
// button the user pressed on the login screen — the screen can't know a
// given email/CPF belongs to a driver or a passenger account before the
// backend answers. See types/auth.ts#CadastroLoginResponse for the full shape.
//
// Both outcomes (wrong email/CPF+senha, or account not found at all) come
// back as 401 "Credenciais inválidas" (user-enumeration hardening on the
// backend), and 403 "Conta inativa..."/pending-approval messages when the
// account isn't active. apiFetch turns both into ApiError with that
// `mensagem` as `.message`, so callers (app/login.tsx) just need to catch it.
export async function login(emailOuCpf: string, senha: string): Promise<AuthResult> {
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
