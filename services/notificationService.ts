import type { AppNotification } from '@/types';

// Não existe endpoint de notificação no backend ainda — retorna lista vazia
// (a tela já trata isso com um EmptyState, ver app/notifications.tsx) em vez
// de dado mockado. Quando o backend expuser notificações reais, troque o
// corpo desta função por uma chamada via authorizedRequest.
export async function getNotifications(): Promise<AppNotification[]> {
  return [];
}
