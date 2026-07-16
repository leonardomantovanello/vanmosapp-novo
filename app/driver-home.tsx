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

export default function DriverHome() {
  const router = useRouter();
  const session = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loadingPassengers, setLoadingPassengers] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  function handleLogout() {
    setMenuOpen(false);
    session.logout();
    router.replace('/');
  }

  function handleStartRide() {
    Alert.alert('Em breve', commonStrings.feedback.featureInDevelopment);
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
        <Pressable
          onPress={handleStartRide}
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
      </View>

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
          <Pressable
            style={({ pressed }) => [styles.passengerItem, pressed && styles.actionPressed]}
            onPress={() => router.push({ pathname: '/chat', params: { contactName: item.name } })}
            accessibilityRole="button"
            accessibilityLabel={`Conversar com ${item.name}`}>
            <Avatar size={48} iconSize={28} />
            <Text style={styles.passengerName}>{item.name.toUpperCase()}</Text>
            <MaterialIcons name="arrow-forward-ios" size={18} color={theme.colors.white} />
          </Pressable>
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
