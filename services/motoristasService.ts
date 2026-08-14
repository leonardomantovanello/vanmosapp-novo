import { apiRequest } from '@/services/api/client';
import type { MotoristaPublicoDTO } from '@/types/api';

// GET /api/motoristas/publico — public, unauthenticated. Used to fetch a
// passenger's own driver's avatar (see app/passenger-home.tsx), since
// GET /api/motoristas/{id} is ownership-restricted to the driver
// themself/ADMIN and a passenger's session token can't call it.
export async function listMotoristasPublico(): Promise<MotoristaPublicoDTO[]> {
  return apiRequest<MotoristaPublicoDTO[]>('/motoristas/publico');
}
