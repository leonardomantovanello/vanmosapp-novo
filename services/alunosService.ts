import { authorizedRequest } from '@/services/api/client';
import type { AlunoDTO } from '@/types/api';

export interface Passenger {
  id: string;
  name: string;
  motoristaId: number | null;
}

// GET /api/alunos. The backend filters server-side by role: a RESPONSAVEL
// (passenger/guardian) token only gets their own kids (responsavel_id FK +
// ownership check), and a MOTORISTA token only gets students they
// registered (motorista_id FK + ownership check) — no client-side
// filtering needed or possible either way.
export async function listAlunos(): Promise<Passenger[]> {
  const alunos = await authorizedRequest<AlunoDTO[]>('/alunos');
  return alunos.map((aluno) => ({ id: String(aluno.id), name: aluno.nome, motoristaId: aluno.motoristaId }));
}
