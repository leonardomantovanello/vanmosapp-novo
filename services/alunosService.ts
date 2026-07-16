import { authorizedRequest } from '@/services/api/client';
import type { AlunoDTO } from '@/types/api';

export interface Passenger {
  id: string;
  name: string;
}

// GET /api/alunos. For a RESPONSAVEL (passenger/guardian) token the backend
// now filters server-side to that guardian's own kids (responsavel_id FK +
// ownership check, added on the backend). For a MOTORISTA token it
// currently still returns EVERY student system-wide — Aluno has no
// motorista_id/van_id FK yet to scope by route (documented as a known gap
// in AlunoController's javadoc on the backend). No client-side filtering is
// needed or possible here either way.
export async function listAlunos(): Promise<Passenger[]> {
  const alunos = await authorizedRequest<AlunoDTO[]>('/alunos');
  return alunos.map((aluno) => ({ id: String(aluno.id), name: aluno.nome }));
}
