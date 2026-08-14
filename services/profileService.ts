import { authorizedRequest } from '@/services/api/client';
import type { MotoristaDTO, PassageiroDTO } from '@/types/api';
import type { User, UserProfileInput, UserRole } from '@/types';

interface ProfileRef {
  id: number;
  role: UserRole;
}

function fromPassageiro(dto: PassageiroDTO): User {
  return {
    id: String(dto.id),
    name: dto.nome,
    email: dto.email,
    role: 'passenger',
    cpf: dto.cpf,
    idade: dto.idade,
    genero: dto.genero,
    cnh: null,
    modeloVan: null,
    placaVan: null,
    avatarUri: dto.avatarBase64,
  };
}

function fromMotorista(dto: MotoristaDTO): User {
  return {
    id: String(dto.id),
    name: dto.nome,
    email: dto.email,
    role: 'driver',
    cpf: dto.cpf,
    idade: dto.idade,
    genero: dto.genero,
    cnh: dto.cnh,
    modeloVan: dto.modeloVan,
    placaVan: dto.placaVan,
    avatarUri: dto.avatarBase64,
  };
}

export async function getProfile({ id, role }: ProfileRef): Promise<User> {
  if (role === 'driver') {
    return fromMotorista(await authorizedRequest<MotoristaDTO>(`/motoristas/${id}`));
  }
  return fromPassageiro(await authorizedRequest<PassageiroDTO>(`/passageiros/${id}`));
}

// PUT /api/passageiros/{id} and PUT /api/motoristas/{id} are partial
// updates server-side (see PassageiroService/MotoristaService) — blank text
// fields are left unchanged, but avatarBase64 always overwrites (null there
// means "no photo", a real state, not "field not sent" — see the comment on
// existente.setAvatarBase64 in both services). Never send `senha` here:
// neither endpoint needs it for a profile edit, and the dedicated
// password-change flow lives in services/settingsService.ts.
export async function updateProfile(input: UserProfileInput, { id, role }: ProfileRef): Promise<User> {
  if (role === 'driver') {
    const dto = await authorizedRequest<MotoristaDTO>(`/motoristas/${id}`, {
      method: 'PUT',
      body: {
        nome: input.name,
        email: input.email,
        cpf: input.cpf,
        cnh: input.cnh,
        modeloVan: input.modeloVan,
        placaVan: input.placaVan,
        avatarBase64: input.avatarUri,
      },
    });
    return fromMotorista(dto);
  }

  const dto = await authorizedRequest<PassageiroDTO>(`/passageiros/${id}`, {
    method: 'PUT',
    body: {
      nome: input.name,
      email: input.email,
      cpf: input.cpf,
      idade: input.idade,
      genero: input.genero,
      avatarBase64: input.avatarUri,
    },
  });
  return fromPassageiro(dto);
}
