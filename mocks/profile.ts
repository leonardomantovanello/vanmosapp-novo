import type { User } from '@/types';

export const MOCK_PROFILE: Omit<User, 'id' | 'role'> = {
  name: '',
  email: '',
  phone: '',
  address: '',
  school: '',
  cnh: '',
  avatarUri: null,
};
