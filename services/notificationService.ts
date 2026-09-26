import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import type { AppNotification } from '@/types';

const MAX_NOTIFICATIONS = 30;

function storageKey(userId: number): string {
  return `vanmos.notifications.${userId}`;
}

// expo-secure-store has no web implementation, so the web build falls back
// to localStorage — same fallback used in services/tokenStorage.ts.
async function readRaw(userId: number): Promise<string | null> {
  if (Platform.OS === 'web') return localStorage.getItem(storageKey(userId));
  return SecureStore.getItemAsync(storageKey(userId));
}

async function writeRaw(userId: number, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(storageKey(userId), value);
    return;
  }
  await SecureStore.setItemAsync(storageKey(userId), value);
}

function formatDate(date: Date): string {
  return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// Não existe endpoint de notificação no backend ainda, então o histórico
// mostrado na tela do sininho (app/notifications.tsx) é guardado localmente,
// escopado por usuário, e alimentado pelos mesmos eventos que já disparam as
// notificações locais do SO (ver passenger-home.tsx e driver-home.tsx) — sem
// isso, elas apareciam na bandeja do sistema mas nunca no histórico do app.
export async function getNotifications(userId: number): Promise<AppNotification[]> {
  const raw = await readRaw(userId);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AppNotification[];
  } catch {
    return [];
  }
}

export async function addNotification(userId: number, message: string): Promise<void> {
  const current = await getNotifications(userId);
  const next: AppNotification[] = [
    { id: `${Date.now()}`, message, date: formatDate(new Date()), read: false },
    ...current,
  ].slice(0, MAX_NOTIFICATIONS);
  await writeRaw(userId, JSON.stringify(next));
}

export async function markAllNotificationsRead(userId: number): Promise<void> {
  const current = await getNotifications(userId);
  if (current.length === 0 || current.every((n) => n.read)) return;
  await writeRaw(userId, JSON.stringify(current.map((n) => ({ ...n, read: true }))));
}
