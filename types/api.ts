// Types that mirror the real VanMos backend (Spring Boot, package com.vanmos.van)
// as closely as possible at the API boundary. Field names are kept in
// Portuguese here on purpose — they match the JSON the API actually sends,
// so there's no silent renaming to trip over while debugging. UI-facing
// shapes (with English field names) live in types/user.ts and are produced
// by mapping these DTOs in the relevant service (see services/profileService.ts,
// services/authService.ts, services/alunosService.ts).

// Standard response envelope used by most endpoints — see dto/ApiResponse.java.
// NOTE: the two login endpoints do NOT use this envelope consistently — see
// types/auth.ts for their actual (quirkier) shapes.
export interface ApiEnvelope<T> {
  sucesso: boolean;
  status?: number;
  mensagem?: string;
  dados?: T;
  erros?: string[];
  timestamp?: string;
}

// Mirrors model/entity/Passageiro.java (guardian/responsável signup +
// login — table was renamed from "cadastro" to "passageiros", see
// V2__rename_cadastro_to_passageiros.sql). `senha` is intentionally
// omitted — the API never returns it (stripped server-side in every
// controller method before the response is built).
export interface PassageiroDTO {
  id: number;
  nome: string;
  idade: number | null;
  cpf: string | null;
  genero: string | null;
  email: string;
  aceitouTermos: boolean;
  ativo: boolean;
  // Data URI ("data:image/jpeg;base64,...") — no file storage/CDN set up
  // for the project, so the image itself lives in this column (see V9).
  avatarBase64: string | null;
}

// Mirrors model/entity/MotoristasAdmin.java (driver profile + login).
// `senha` is intentionally omitted for the same reason as above.
export interface MotoristaAdminDTO {
  id: number;
  cnh: string | null;
  cpf: string | null;
  gmail: string;
  modeloVan: string | null;
  nomeCompleto: string;
  placaVan: string | null;
  ativo: boolean;
  avatarBase64: string | null;
}

// Mirrors model/entity/Aluno.java. GET /api/alunos is filtered server-side:
// RESPONSAVEL gets only their own kids (responsavelId), MOTORISTA gets only
// students they registered (motoristaId), ADMIN gets everyone.
export interface AlunoDTO {
  id: number;
  nome: string;
  telefoneResponsavel: string | null;
  enderecoEmbarque: string | null;
  enderecoDesembarque: string | null;
  escola: string | null;
  turno: string | null;
  ativo: boolean;
  responsavelId: number | null;
  motoristaId: number | null;
}

// Mirrors model/entity/Mensagem.java. GET/POST /api/mensagens/aluno/{alunoId}
// — one conversation per aluno, shared by that aluno's motorista and
// responsavel (see MensagemController for the ownership check).
export interface MensagemDTO {
  id: number;
  alunoId: number;
  remetenteTipo: 'MOTORISTA' | 'RESPONSAVEL' | 'ADMIN';
  remetenteId: number;
  texto: string;
  criadoEm: string;
}

// Mirrors model/entity/Falta.java. GET /api/faltas/aluno/{alunoId} (read —
// motorista or responsavel of that aluno) / POST+DELETE (write — responsavel
// only, see FaltaController). GET /api/faltas/hoje (motorista-only) returns
// today's Falta rows for the driver's own students. A day with no Falta
// record is presumed present; there's no explicit "present" status stored.
export interface FaltaDTO {
  id: number;
  alunoId: number;
  data: string; // ISO date, "yyyy-MM-dd"
  justificativa: string | null;
  registradoPorId: number;
  criadoEm: string;
}

// Mirrors dto/RotaParadaDTO.java. GET/POST/DELETE /api/rotas + PUT
// /api/rotas/reordenar — sempre a rota do motorista autenticado (ver
// RotaController.validarMotorista, não aceita motoristaId por parâmetro).
export interface RotaParadaDTO {
  id: number;
  alunoId: number;
  nome: string;
  enderecoEmbarque: string | null;
  enderecoDesembarque: string | null;
  escola: string | null;
  turno: string | null;
  ordem: number;
}

// Mirrors dto/RotaProgressoDTO.java. GET /api/rotas/progresso is
// role-branched server-side: MOTORISTA gets alunoAtualNome filled in and
// suaOrdem/vocEhAtual/vocEhOProximo null; RESPONSAVEL gets the opposite —
// only their own child's position, never another student's name/address.
export interface RotaProgressoDTO {
  ativo: boolean;
  ordemAtual: number | null;
  totalParadas: number;
  alunoAtualNome: string | null;
  suaOrdem: number | null;
  vocEhAtual: boolean | null;
  vocEhOProximo: boolean | null;
}
