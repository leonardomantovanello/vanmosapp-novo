import { authorizedRequest } from '@/services/api/client';
import type { UserRole } from '@/types';

// PUT /api/passageiros/{id}/senha ou /api/motoristas-admin/{id}/senha,
// dependendo do papel de quem está logado — os dois exigem a senha atual (o
// backend confere com BCrypt antes de trocar, ver PassageiroService/
// MotoristasAdminService#alterarSenha). Ownership é checado no servidor: só
// dá pra trocar a própria senha, mesmo com o id certo na URL.
export async function changePassword(
  id: number,
  role: UserRole,
  senhaAtual: string,
  novaSenha: string
): Promise<void> {
  const path = role === 'driver' ? `/motoristas-admin/${id}/senha` : `/passageiros/${id}/senha`;
  await authorizedRequest<void>(path, {
    method: 'PUT',
    body: { senhaAtual, novaSenha },
  });
}
