import { authorizedRequest } from '@/services/api/client';
import type { RotaProgressoDTO } from '@/types/api';

// GET /api/rotas/progresso — role-branched no backend: motorista vê a
// própria corrida, responsável vê só a posição do próprio filho nela.
export async function getRouteProgress(): Promise<RotaProgressoDTO> {
  return authorizedRequest<RotaProgressoDTO>('/rotas/progresso');
}

// POST /api/rotas/progresso/iniciar — motorista começa a corrida na
// primeira parada da rota.
export async function startRoute(): Promise<RotaProgressoDTO> {
  return authorizedRequest<RotaProgressoDTO>('/rotas/progresso/iniciar', { method: 'POST' });
}

// POST /api/rotas/progresso/avancar — motorista avança pra próxima parada;
// avançar na última encerra a corrida (ver RotaProgressoService.avancar).
export async function advanceRoute(): Promise<RotaProgressoDTO> {
  return authorizedRequest<RotaProgressoDTO>('/rotas/progresso/avancar', { method: 'POST' });
}

// POST /api/rotas/progresso/encerrar — motorista encerra a corrida antes
// de chegar na última parada.
export async function endRoute(): Promise<RotaProgressoDTO> {
  return authorizedRequest<RotaProgressoDTO>('/rotas/progresso/encerrar', { method: 'POST' });
}
