export type UserRole = 'passenger' | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  school: string;
  role: UserRole;
  cnh?: string;
  avatarUri: string | null;
}

export type UserProfileInput = Omit<User, 'id' | 'role' | 'avatarUri'> & {
  avatarUri?: string | null;
};
