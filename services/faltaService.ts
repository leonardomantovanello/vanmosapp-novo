import { authorizedRequest } from '@/services/api/client';
import type { FaltaDTO } from '@/types/api';

// GET/POST/DELETE /api/faltas/aluno/{alunoId} — a day with no Falta record
// is presumed present; there's no "present" status to set, only "absent"
// (create) or "undo" (delete). Only the aluno's motorista can write; the
// responsavel gets read-only access (enforced server-side, see
// FaltaController — this isn't just a UI restriction).
export async function listFaltas(alunoId: number): Promise<FaltaDTO[]> {
  return authorizedRequest<FaltaDTO[]>(`/faltas/aluno/${alunoId}`);
}

export async function marcarFalta(alunoId: number, dataIso: string, justificativa: string): Promise<FaltaDTO> {
  return authorizedRequest<FaltaDTO>(`/faltas/aluno/${alunoId}`, {
    method: 'POST',
    body: { data: dataIso, justificativa },
  });
}

export async function desmarcarFalta(alunoId: number, dataIso: string): Promise<void> {
  await authorizedRequest<void>(`/faltas/aluno/${alunoId}/data/${dataIso}`, {
    method: 'DELETE',
  });
}
