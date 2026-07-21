import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { EmptyState } from '@/components/ui/EmptyState';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { theme } from '@/constants/theme';
import { subscribeTopic } from '@/services/realtime/stompClient';
import type { LocalizacaoBroadcast } from '@/services/locationService';

export default function Tracking() {
  const router = useRouter();
  const { motoristaId: motoristaIdParam, contactName } = useLocalSearchParams<{
    motoristaId?: string;
    contactName?: string;
  }>();
  const motoristaId = Number(motoristaIdParam);
  const mapRef = useRef<MapView>(null);
  const [localizacao, setLocalizacao] = useState<LocalizacaoBroadcast | null>(null);

  useEffect(() => {
    if (!motoristaId) return;
    const unsubscribe = subscribeTopic<LocalizacaoBroadcast>(
      `/topic/localizacao/motorista/${motoristaId}`,
      (payload) => {
        setLocalizacao(payload);
        if (payload.sharing && payload.lat != null && payload.lng != null) {
          mapRef.current?.animateToRegion(
            { latitude: payload.lat, longitude: payload.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 },
            500
          );
        }
      }
    );
    return unsubscribe;
  }, [motoristaId]);

  const temPosicao = localizacao?.sharing && localizacao.lat != null && localizacao.lng != null;

  return (
    <Screen contentContainerStyle={styles.container}>
      <Header
        onBack={() => router.back()}
        title={contactName ? `Van de ${contactName}` : 'Localização da van'}
      />

      {temPosicao ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: localizacao!.lat!,
            longitude: localizacao!.lng!,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}>
          <Marker coordinate={{ latitude: localizacao!.lat!, longitude: localizacao!.lng! }} title="Van">
            <View style={styles.markerPin}>
              <MaterialIcons name="directions-bus" size={20} color={theme.colors.white} />
            </View>
          </Marker>
        </MapView>
      ) : (
        <EmptyState
          icon="place"
          title={localizacao && !localizacao.sharing ? 'Corrida encerrada' : 'Aguardando localização'}
          description={
            localizacao && !localizacao.sharing
              ? 'O motorista encerrou o compartilhamento da localização.'
              : 'Assim que o motorista iniciar a corrida, a van aparecerá aqui no mapa.'
          }
        />
      )}

      {temPosicao ? <Text style={styles.hint}>Atualizado em tempo real</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.magenta,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  hint: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
    paddingVertical: theme.spacing.sm,
  },
});
