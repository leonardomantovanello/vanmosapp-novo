export type UserRole = 'passenger' | 'driver';

// Mirrors what's actually editable on the backend per role — Passageiro
// (passenger) and MotoristasAdmin (driver) don't have phone/address/school
// columns at all; that data lives on Aluno instead (see AlunoDTO). Fields
// that don't apply to a role stay null rather than being split into two
// separate types, matching how AlunoDTO/RotaParadaDTO already do this.
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  cpf: string | null;
  idade: number | null; // passenger only
  genero: string | null; // passenger only
  cnh: string | null; // driver only
  modeloVan: string | null; // driver only
  placaVan: string | null; // driver only
  avatarUri: string | null; // local-only — no backend support yet
}

export type UserProfileInput = Omit<User, 'id' | 'role'>;
