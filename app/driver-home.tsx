import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { Avatar } from '@/components/ui/Avatar';
import { FloatingCircle, GLOW_COLORS } from '@/components/ui/FloatingCircle';
import { SideMenu } from '@/components/features/home/SideMenu';
import { TextField } from '@/components/ui/TextField';
import { commonStrings } from '@/constants/strings';
import { theme } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { usePulse } from '@/hooks/use-pulse';
import { ApiError } from '@/services/api/client';
import { listAlunos, type Passenger } from '@/services/alunosService';
import { listFaltasHoje } from '@/services/faltaService';
import { getProfile } from '@/services/profileService';
import {
  configureNotificationChannel,
  ensureNotificationPermission,
  showLocalNotification,
} from '@/services/notifications/localNotifications';
import { advanceRoute, endRoute, getRouteProgress, startRoute } from '@/services/routeProgressService';
import type { FaltaDTO, RotaProgressoDTO } from '@/types/api';

const FALTAS_POLL_MS = 15000;
const FALTA_TITLE = 'VanMos';
function faltaBody(nome: string): string {
  return `${nome} faltou hoje. Removido da sua rota.`;
}

export default function DriverHome() {
  const router = useRouter();
  const session = useSession();
  const startGlow = usePulse(2200);
  const startGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.35 + startGlow.value * 0.35,
    shadowRadius: 14 + startGlow.value * 14,
  }));
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loadingPassengers, setLoadingPassengers] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [progress, setProgress] = useState<RotaProgressoDTO | null>(null);
  const [progressBusy, setProgressBusy] = useState(false);
  const [faltasHoje, setFaltasHoje] = useState<FaltaDTO[]>([]);
  // SessionUser não carrega avatarUri (login só devolve id/nome/email/tipo
  // — ver SessionContext.tsx), então busca o perfil completo à parte pra
  // exibir a foto de verdade em vez do ícone genérico sempre.
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  // Guarda os ids ausentes conhecidos do poll anterior pra notificar só as
  // ausências NOVAS. Começa null pra não disparar notificação em rajada no
  // primeiro carregamento (mesmo padrão de previousIsNextRef em
  // passenger-home.tsx).
  const knownAusentesRef = useRef<Set<number> | null>(null);

  useEffect(() => {
    let isMounted = true;
    listAlunos()
      .then((data) => {
        if (!isMounted) return;
        setPassengers(data);
        setLoadingPassengers(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setLoadError(err instanceof ApiError ? err.message : commonStrings.feedback.genericError);
        setLoadingPassengers(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = passengers.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const driverName = session.user?.name ?? 'Motorista';
  const vanInfo = [session.user?.modeloVan, session.user?.placaVan].filter(Boolean).join(' • ');

  useEffect(() => {
    const userId = session.user?.id;
    if (!userId) return;
    let isMounted = true;
    getProfile({ id: userId, role: 'driver' })
      .then((profile) => {
        if (isMounted) setAvatarUri(profile.avatarUri);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [session.user?.id]);

  // O progresso vive no servidor (não é mais um GPS watch local), então
  // sobrevive a recarregar o app — buscamos o estado atual ao montar.
  useEffect(() => {
    let isMounted = true;
    getRouteProgress()
      .then((data) => {
        if (isMounted) setProgress(data);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Faltas de hoje na rota — não há push remoto no projeto, então quem
  // avisa o motorista é o próprio app dele, com polling + notificação local
  // (mesmo padrão já usado em passenger-home.tsx pro "motorista chegando").
  // Depende de [passengers] porque o corpo da notificação usa o nome do
  // aluno — passengers só muda uma vez, quando o listAlunos() inicial
  // resolve, então isso não causa polling excessivo na prática.
  useEffect(() => {
    let isMounted = true;
    ensureNotificationPermission();
    configureNotificationChannel();

    function fetchFaltasHoje() {
      listFaltasHoje()
        .then((data) => {
          if (!isMounted) return;
          setFaltasHoje(data);
          const currentIds = new Set(data.map((f) => f.alunoId));
          if (knownAusentesRef.current) {
            for (const id of currentIds) {
              if (!knownAusentesRef.current.has(id)) {
                const nome = passengers.find((p) => Number(p.id) === id)?.name ?? 'Um aluno';
                showLocalNotification(FALTA_TITLE, faltaBody(nome));
              }
            }
          }
          knownAusentesRef.current = currentIds;
        })
        .catch(() => {});
    }
    fetchFaltasHoje();
    const interval = setInterval(fetchFaltasHoje, FALTAS_POLL_MS);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [passengers]);

  function handleLogout() {
    setMenuOpen(false);
    session.logout();
    router.replace('/');
  }

  async function handleStartRide() {
    setProgressBusy(true);
    try {
      setProgress(await startRoute());
    } catch (err) {
      Alert.alert('Não foi possível iniciar', err instanceof ApiError ? err.message : commonStrings.feedback.genericError);
    } finally {
      setProgressBusy(false);
    }
  }

  async function handleAdvance() {
    setProgressBusy(true);
    try {
      setProgress(await advanceRoute());
    } catch (err) {
      Alert.alert('Não foi possível avançar', err instanceof ApiError ? err.message : commonStrings.feedback.genericError);
    } finally {
      setProgressBusy(false);
    }
  }

  async function handleEndRide() {
    setProgressBusy(true);
    try {
      setProgress(await endRoute());
    } catch (err) {
      Alert.alert('Não foi possível encerrar', err instanceof ApiError ? err.message : commonStrings.feedback.genericError);
    } finally {
      setProgressBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <FloatingCircle colors={GLOW_COLORS.purple} style={styles.circleTopRight} driftX={16} driftY={12} duration={5800} />
      <FloatingCircle colors={GLOW_COLORS.pink} style={styles.circleBottomLeft} driftX={-14} driftY={16} duration={7000} />

      <SideMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onProfilePress={() => {
          setMenuOpen(false);
          router.push('/profile');
        }}
        onLogoutPress={handleLogout}
      />

      <View style={styles.header}>
        <Pressable
          onPress={() => setMenuOpen(true)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Abrir menu">
          <MaterialIcons name="menu" size={28} color={theme.colors.white} />
        </Pressable>
        <Pressable
          onPress={() => router.push('/notifications')}
          style={styles.notifButton}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Ver notificações">
          <MaterialIcons name="notifications" size={26} color={theme.colors.white} />
          <View style={styles.notifDot} />
        </Pressable>
      </View>

      <View style={styles.greetingRow}>
        <View style={styles.avatarGlow}>
          <Avatar uri={avatarUri} size={64} iconSize={40} />
        </View>
        <View>
          <Text style={styles.greetingTop}>BOM DIA</Text>
          <Text style={styles.greetingName}>{driverName.toUpperCase()}</Text>
          {vanInfo ? <Text style={styles.vanInfo}>{vanInfo}</Text> : null}
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          style={({ pressed }) => [styles.actionButtonDark, pressed && styles.actionPressed]}
          onPress={() => router.push('/edit-route')}
          accessibilityRole="button"
          accessibilityLabel="Editar corrida">
          <MaterialIcons name="edit" size={28} color={theme.colors.white} />
          <Text style={styles.actionText}>Editar corrida</Text>
        </Pressable>
        {!progress?.ativo ? (
          <Animated.View style={[styles.startGlow, startGlowStyle]}>
            <Pressable
              onPress={handleStartRide}
              disabled={progressBusy}
              accessibilityRole="button"
              accessibilityLabel="Começar corrida"
              style={({ pressed }) => [pressed && styles.actionPressed]}>
              <LinearGradient colors={theme.gradients.action} style={styles.actionButtonGradient}>
                <View style={styles.actionButtonInner}>
                  <MaterialIcons name="place" size={28} color={theme.colors.white} />
                  <Text style={styles.actionText}>começar</Text>
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        ) : null}
      </View>

      {progress?.ativo ? (
        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>BUSCANDO AGORA</Text>
          <Text style={styles.progressName}>{progress.alunoAtualNome ?? '—'}</Text>
          <Text style={styles.progressCount}>
            Parada {progress.ordemAtual} de {progress.totalParadas}
          </Text>
          <View style={styles.progressActions}>
            <Pressable
              style={({ pressed }) => [styles.progressButton, pressed && styles.actionPressed]}
              onPress={handleAdvance}
              disabled={progressBusy}
              accessibilityRole="button"
              accessibilityLabel="Próxima parada">
              <Text style={styles.progressButtonText}>Próxima parada</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.progressButtonOutline, pressed && styles.actionPressed]}
              onPress={handleEndRide}
              disabled={progressBusy}
              accessibilityRole="button"
              accessibilityLabel="Encerrar corrida">
              <Text style={styles.progressButtonOutlineText}>Encerrar</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>PASSAGEIROS</Text>

      <TextField
        variant="filled"
        icon="search"
        placeholder="Buscar..."
        value={search}
        onChangeText={setSearch}
        accessibilityLabel="Buscar passageiro"
        containerStyle={styles.searchField}
      />

      {loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}
      {loadingPassengers ? <Text style={styles.hintText}>{commonStrings.feedback.loading}</Text> : null}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.passengerItem, styles.passengerRow]}>
            <Pressable
              style={styles.passengerMain}
              onPress={() => router.push({ pathname: '/chat', params: { contactName: item.name, alunoId: item.id } })}
              accessibilityRole="button"
              accessibilityLabel={`Conversar com ${item.name}`}>
              <Avatar size={48} iconSize={28} />
              <Text style={styles.passengerName}>{item.name.toUpperCase()}</Text>
            </Pressable>
            {faltasHoje.some((f) => f.alunoId === Number(item.id)) ? (
              <View style={styles.faltaBadge}>
                <MaterialIcons name="event-busy" size={14} color={theme.colors.white} />
                <Text style={styles.faltaBadgeText}>Faltou hoje</Text>
              </View>
            ) : null}
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  circleTopRight: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    top: -20,
    right: -30,
    overflow: 'hidden',
  },
  circleBottomLeft: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    bottom: -20,
    left: -40,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  notifButton: {
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.warning,
    top: 0,
    right: 0,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xxl + theme.spacing.xs,
  },
  avatarGlow: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(170,68,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(170,68,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingTop: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 1,
  },
  greetingName: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.black,
    letterSpacing: 1,
  },
  vanInfo: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.sm,
  },
  hintText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xxl + theme.spacing.xs,
  },
  actionPressed: {
    opacity: 0.8,
  },
  actionButtonDark: {
    flex: 1,
    backgroundColor: theme.colors.surfaceInput,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(204,68,204,0.15)',
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  startGlow: {
    shadowColor: theme.colors.magenta,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  actionButtonGradient: {
    flex: 1,
    borderRadius: theme.radius.lg,
  },
  actionButtonInner: {
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  actionText: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.md,
  },
  progressCard: {
    backgroundColor: theme.colors.surfaceInput,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(204,68,204,0.2)',
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
    gap: theme.spacing.xs,
  },
  progressLabel: {
    color: theme.colors.purpleAlt,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 1,
  },
  progressName: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.black,
  },
  progressCount: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.sm,
  },
  progressActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  progressButton: {
    flex: 1,
    backgroundColor: theme.colors.purpleAlt,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  progressButtonText: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.sm,
  },
  progressButtonOutline: {
    flex: 1,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.borderMuted,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  progressButtonOutlineText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.sm,
  },
  sectionTitle: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.black,
    fontSize: theme.fontSize.xl,
    letterSpacing: 2,
    marginBottom: theme.spacing.md,
  },
  searchField: {
    marginBottom: theme.spacing.lg,
  },
  list: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(204,68,204,0.15)',
  },
  passengerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md + 2,
  },
  passengerRow: {
    justifyContent: 'space-between',
  },
  passengerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.md + 2,
  },
  passengerName: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.md,
    flex: 1,
    letterSpacing: 1,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.borderMuted,
    marginHorizontal: theme.spacing.lg,
  },
  faltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.dangerStrong,
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
  },
  faltaBadgeText: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.xs,
  },
});
