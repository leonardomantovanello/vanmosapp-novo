import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Notificações locais (disparadas pelo próprio app, sem backend/push
// remoto) — ver services/notifications/README inline abaixo em
// passenger-home.tsx para o motivo dessa escolha em vez de push real.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Android 8+ exige um canal pra notificação aparecer com som/prioridade
// normal; sem isso ela pode ser silenciosamente suprimida pelo sistema.
export async function configureNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

// Pede permissão uma vez; é no-op se já foi concedida (ou negada) antes.
export async function ensureNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Dispara imediatamente (trigger: null) — cai na bandeja de notificações do
// aparelho mesmo com o app em segundo plano recente; não sobrevive ao app
// sendo completamente encerrado, já que não há push remoto por trás disso.
export async function showLocalNotification(title: string, body: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
}
