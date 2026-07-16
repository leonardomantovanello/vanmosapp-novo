import { authorizedRequest } from '@/services/api/client';

// PUT /api/passageiros/{id}/senha — exige a senha atual (o backend confere
// com BCrypt antes de trocar, ver PassageiroService#alterarSenha). Ownership
// é checado no servidor: só dá pra trocar a própria senha, mesmo com o id
// certo na URL.
export async function changePassword(id: number, senhaAtual: string, novaSenha: string): Promise<void> {
  await authorizedRequest<void>(`/passageiros/${id}/senha`, {
    method: 'PUT',
    body: { senhaAtual, novaSenha },
  });
}
