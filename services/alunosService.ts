import { authorizedRequest } from '@/services/api/client';
import type { AlunoDTO } from '@/types/api';

export interface Passenger {
  id: string;
  name: string;
  motoristaId: number | null;
  enderecoEmbarque: string | null;
  enderecoDesembarque: string | null;
  escola: string | null;
}

// GET /api/alunos. The backend filters server-side by role: a RESPONSAVEL
// (passenger/guardian) token only gets their own kids (responsavel_id FK +
// ownership check), and a MOTORISTA token only gets students they
// registered (motorista_id FK + ownership check) — no client-side
// filtering needed or possible either way. Address/school fields are safe
// to expose here precisely because of that server-side filtering — it's
// always the caller's own kid(s), never another family's data (used by the
// "Locais" screen, see app/locations.tsx).
export async function listAlunos(): Promise<Passenger[]> {
  const alunos = await authorizedRequest<AlunoDTO[]>('/alunos');
  return alunos.map((aluno) => ({
    id: String(aluno.id),
    name: aluno.nome,
    motoristaId: aluno.motoristaId,
    enderecoEmbarque: aluno.enderecoEmbarque,
    enderecoDesembarque: aluno.enderecoDesembarque,
    escola: aluno.escola,
  }));
}
