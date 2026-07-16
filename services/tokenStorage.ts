import * as SecureStore from 'expo-secure-store';

import type { UserRole } from '@/types/user';

const ACCESS_TOKEN_KEY = 'vanmos.accessToken';
const REFRESH_TOKEN_KEY = 'vanmos.refreshToken';
const USER_KEY = 'vanmos.user';

// Minimal, non-sensitive user snapshot kept alongside the tokens so the app
// can restore a logged-in UI without a network round trip on cold start.
// Never includes a password of any kind.
export interface StoredSessionUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  placaVan?: string | null;
  modeloVan?: string | null;
}

export interface StoredSession {
  user: StoredSessionUser;
  accessToken: string;
  refreshToken: string;
}

export async function saveSession(user: StoredSessionUser, accessToken: string, refreshToken: string): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
  ]);
}

export async function updateAccessToken(accessToken: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
}

export async function updateStoredUser(user: StoredSessionUser): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function loadSession(): Promise<StoredSession | null> {
  const [accessToken, refreshToken, userRaw] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.getItemAsync(USER_KEY),
  ]);

  if (!accessToken || !refreshToken || !userRaw) return null;

  try {
    const user = JSON.parse(userRaw) as StoredSessionUser;
    return { user, accessToken, refreshToken };
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
}
