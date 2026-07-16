import { MOCK_NOTIFICATIONS } from '@/mocks/notifications';
import type { AppNotification } from '@/types';

export async function getNotifications(): Promise<AppNotification[]> {
  return MOCK_NOTIFICATIONS;
}
