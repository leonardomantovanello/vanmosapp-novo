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

// POST /api/login — passenger/guardian, authenticates against Cadastro.
// Response is flat (no ApiEnvelope), so we call apiFetch directly and read
// accessToken/refreshToken/usuario off the top level. See
// types/auth.ts#CadastroLoginResponse for the full shape.
async function loginPassenger(emailOuCpf: string, senha: string): Promise<AuthResult> {
  const payload = await apiFetch<CadastroLoginResponse>('/login', {
    method: 'POST',
    body: { emailOuCpf, senha },
  });

  return {
    id: payload.usuario.id,
    name: payload.usuario.nome,
    email: payload.usuario.email,
    role: 'passenger',
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
export async function login(emailOuCpf: string, senha: string, role: UserRole): Promise<AuthResult> {
  return role === 'driver' ? loginDriver(emailOuCpf, senha) : loginPassenger(emailOuCpf, senha);
}
