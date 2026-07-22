import { authorizedRequest } from '@/services/api/client';
import type { RotaParadaDTO } from '@/types/api';
import type { RouteStop } from '@/types';

function toRouteStop(dto: RotaParadaDTO): RouteStop {
  return {
    id: String(dto.id),
    alunoId: String(dto.alunoId),
    nome: dto.nome,
    enderecoEmbarque: dto.enderecoEmbarque,
    enderecoDesembarque: dto.enderecoDesembarque,
    escola: dto.escola,
    turno: dto.turno,
    ordem: dto.ordem,
  };
}

// GET /api/rotas — rota padronizada do motorista logado, já ordenada.
export async function listRouteStops(): Promise<RouteStop[]> {
  const paradas = await authorizedRequest<RotaParadaDTO[]>('/rotas');
  return paradas.map(toRouteStop);
}

// POST /api/rotas — adiciona um aluno (já cadastrado pelo motorista) como
// próxima parada da rota.
export async function addRouteStop(alunoId: string): Promise<RouteStop> {
  const parada = await authorizedRequest<RotaParadaDTO>('/rotas', {
    method: 'POST',
    body: { alunoId: Number(alunoId) },
  });
  return toRouteStop(parada);
}

// DELETE /api/rotas/{id} — remove uma parada da rota.
export async function removeRouteStop(id: string): Promise<void> {
  await authorizedRequest<void>(`/rotas/${id}`, { method: 'DELETE' });
}

// PUT /api/rotas/reordenar — `ids` precisa ser a lista completa de paradas
// atuais na nova ordem (ver RotaParadaService.reordenar no backend).
export async function reorderRouteStops(ids: string[]): Promise<RouteStop[]> {
  const paradas = await authorizedRequest<RotaParadaDTO[]>('/rotas/reordenar', {
    method: 'PUT',
    body: { ids: ids.map(Number) },
  });
  return paradas.map(toRouteStop);
}
