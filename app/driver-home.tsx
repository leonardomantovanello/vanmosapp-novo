import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { SideMenu } from '@/components/features/home/SideMenu';
import { commonStrings } from '@/constants/strings';
import { theme } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { ApiError } from '@/services/api/client';
import { listAlunos, type Passenger } from '@/services/alunosService';
import { advanceRoute, endRoute, getRouteProgress, startRoute } from '@/services/routeProgressService';
import type { RotaProgressoDTO } from '@/types/api';

export default function DriverHome() {
  const router = useRouter();
  const session = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loadingPassengers, setLoadingPassengers] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [progress, setProgress] = useState<RotaProgressoDTO | null>(null);
  const [progressBusy, setProgressBusy] = useState(false);

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
        <Avatar size={64} iconSize={40} />
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

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar..."
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Buscar passageiro"
        />
        <MaterialIcons name="search" size={22} color={theme.colors.textMuted} />
      </View>

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
            <Pressable
              hitSlop={8}
              onPress={() => router.push({ pathname: '/attendance', params: { contactName: item.name, alunoId: item.id } })}
              accessibilityRole="button"
              accessibilityLabel={`Ver faltas de ${item.name}`}>
              <MaterialIcons name="event-busy" size={22} color={theme.colors.white} />
            </Pressable>
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
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
  },
  list: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.lg,
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
});
