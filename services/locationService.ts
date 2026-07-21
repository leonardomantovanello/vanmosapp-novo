import * as Location from 'expo-location';

import { publish } from '@/services/realtime/stompClient';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface LocalizacaoBroadcast extends Partial<LatLng> {
  motoristaId: number;
  sharing: boolean;
  timestamp: string;
}

let watchSubscription: Location.LocationSubscription | null = null;

/**
 * Pede permissão de localização em primeiro plano e começa a publicar a
 * posição do motorista via STOMP em /app/localizacao (ver
 * LocalizacaoController no backend). Não persiste nada — é só um "ao vivo"
 * enquanto a corrida está em andamento.
 */
export async function startSharingLocation(onError?: (message: string) => void): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    onError?.('Permissão de localização negada. Não é possível compartilhar a corrida.');
    return false;
  }

  await stopSharingLocation();

  watchSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 5000,
      distanceInterval: 20,
    },
    (position) => {
      publish('/app/localizacao', {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    }
  );

  return true;
}

export async function stopSharingLocation(): Promise<void> {
  watchSubscription?.remove();
  watchSubscription = null;
  publish('/app/localizacao/parar', {});
}

export function isSharingLocation(): boolean {
  return watchSubscription !== null;
}
