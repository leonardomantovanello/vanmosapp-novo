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

// Mirrors model/entity/Cadastro.java (guardian/responsável signup + login).
// `senha` is intentionally omitted — the API never returns it (stripped
// server-side in every controller method before the response is built).
export interface CadastroDTO {
  id: number;
  nome: string;
  idade: number | null;
  cpf: string | null;
  genero: string | null;
  email: string;
  aceitouTermos: boolean;
  ativo: boolean;
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
}

// Mirrors model/entity/Aluno.java. GET /api/alunos is filtered server-side
// to the caller's own kids when the JWT role is RESPONSAVEL; MOTORISTA/ADMIN
// currently still see every student (no motorista/van FK on Aluno yet).
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
}
