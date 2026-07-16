// Login response shapes. These are deliberately NOT unified into one type:
// the two backend login endpoints return genuinely different shapes, and
// that's a backend quirk worth keeping visible here rather than papering
// over with a shared interface.

// POST /api/login (passenger/guardian, authenticates against Cadastro).
// Unlike almost every other endpoint in this API, this one does NOT use the
// { sucesso, mensagem, dados } ApiEnvelope — accessToken/refreshToken/usuario
// are top-level fields. See LoginController.login() on the backend.
export interface CadastroLoginResponse {
  sucesso: boolean;
  mensagem: string;
  accessToken: string;
  refreshToken: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
  };
}

// Payload nested under `dados` for POST /api/motoristas-admin/login (driver,
// authenticates against MotoristasAdmin). This endpoint DOES use the
// standard ApiEnvelope (see MotoristasAdminController.login()), so the outer
// shape is ApiEnvelope<MotoristaLoginData> — accessToken/refreshToken live
// one level deeper than in CadastroLoginResponse above.
export interface MotoristaLoginData {
  id: number;
  nomeCompleto: string;
  gmail: string;
  placaVan: string | null;
  modeloVan: string | null;
  accessToken: string;
  refreshToken: string;
}
