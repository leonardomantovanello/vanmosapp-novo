import { MOCK_PROFILE } from '@/mocks/profile';
import type { User, UserProfileInput, UserRole } from '@/types';

// "Banco" mockado em memória — substituir por chamadas HTTP quando
// houver backend, mantendo as assinaturas getProfile/updateProfile.
let currentProfile: User | null = null;

export async function getProfile(role: UserRole): Promise<User> {
  if (!currentProfile) {
    currentProfile = { id: 'mock-user', role, ...MOCK_PROFILE };
  }
  return currentProfile;
}

export async function updateProfile(input: UserProfileInput, role: UserRole): Promise<User> {
  currentProfile = {
    id: currentProfile?.id ?? 'mock-user',
    role,
    name: input.name,
    email: input.email,
    phone: input.phone,
    address: input.address,
    school: input.school,
    cnh: input.cnh,
    avatarUri: input.avatarUri ?? null,
  };
  return currentProfile;
}
