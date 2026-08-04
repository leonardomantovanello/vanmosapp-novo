import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import type { UserRole } from '@/types/user';

const ACCESS_TOKEN_KEY = 'vanmos.accessToken';
const REFRESH_TOKEN_KEY = 'vanmos.refreshToken';
const USER_KEY = 'vanmos.user';

// expo-secure-store has no web implementation, so the web build falls back
// to localStorage (less secure, but this is a browser tab, not a keychain).
const storage = {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

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
    storage.setItem(ACCESS_TOKEN_KEY, accessToken),
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken),
    storage.setItem(USER_KEY, JSON.stringify(user)),
  ]);
}

export async function updateAccessToken(accessToken: string): Promise<void> {
  await storage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export async function updateStoredUser(user: StoredSessionUser): Promise<void> {
  await storage.setItem(USER_KEY, JSON.stringify(user));
}

export async function loadSession(): Promise<StoredSession | null> {
  const [accessToken, refreshToken, userRaw] = await Promise.all([
    storage.getItem(ACCESS_TOKEN_KEY),
    storage.getItem(REFRESH_TOKEN_KEY),
    storage.getItem(USER_KEY),
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
    storage.deleteItem(ACCESS_TOKEN_KEY),
    storage.deleteItem(REFRESH_TOKEN_KEY),
    storage.deleteItem(USER_KEY),
  ]);
}
