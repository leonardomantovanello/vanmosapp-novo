import { authorizedRequest } from '@/services/api/client';
import type { FaltaDTO } from '@/types/api';

// GET/POST/DELETE /api/faltas/aluno/{alunoId} — a day with no Falta record
// is presumed present; there's no "present" status to set, only "absent"
// (create) or "undo" (delete). Only the aluno's responsavel can write; the
// motorista gets read-only access (enforced server-side, see
// FaltaController — this isn't just a UI restriction). Marking a falta for
// today removes that student's stop from the driver's route (see
// RotaProgressoService on the backend).
export async function listFaltas(alunoId: number): Promise<FaltaDTO[]> {
  return authorizedRequest<FaltaDTO[]>(`/faltas/aluno/${alunoId}`);
}

// GET /api/faltas/hoje — motorista-only; today's Falta rows across all of
// this driver's students. Used for the "Faltou hoje" badge and to detect
// newly-appeared absences for local-notification edge-detection (see
// app/driver-home.tsx).
export async function listFaltasHoje(): Promise<FaltaDTO[]> {
  return authorizedRequest<FaltaDTO[]>('/faltas/hoje');
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
