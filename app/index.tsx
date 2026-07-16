import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { theme } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import type { UserRole } from '@/types';

export default function RoleSelection() {
  const router = useRouter();
  const session = useSession();

  // If a session was restored from SecureStore on app start, skip straight
  // past role selection + login. Waits for isLoading to settle first so we
  // don't flash the role-selection buttons before the restore finishes.
  useEffect(() => {
    if (session.isLoading || !session.user) return;
    router.replace(session.user.role === 'driver' ? '/driver-home' : '/passenger-home');
  }, [session.isLoading, session.user, router]);

  function goToLogin(role: UserRole) {
    router.push({ pathname: '/login', params: { role } });
  }

  if (session.isLoading || session.user) {
    return <Screen contentContainerStyle={styles.container}>{null}</Screen>;
  }

  return (
    <Screen contentContainerStyle={styles.container}>
      <LinearGradient colors={theme.gradients.purplePink} style={[styles.circle, styles.circleTopRight]} />
      <LinearGradient colors={[theme.colors.purpleDeep, theme.colors.pinkDeep]} style={[styles.circle, styles.circleBottomLeft]} />

      <Text style={styles.title}>VOCÊ É</Text>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={() => goToLogin('passenger')}
        accessibilityRole="button"
        accessibilityLabel="Entrar como passageiro">
        <MaterialIcons name="person" size={32} color={theme.colors.purpleLight} />
        <Text style={styles.buttonText}>PASSAGEIRO</Text>
        <MaterialIcons name="play-arrow" size={24} color={theme.colors.purpleLight} />
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={() => goToLogin('driver')}
        accessibilityRole="button"
        accessibilityLabel="Entrar como motorista">
        <MaterialIcons name="directions-car" size={32} color={theme.colors.purpleLight} />
        <Text style={styles.buttonText}>MOTORISTA</Text>
        <MaterialIcons name="play-arrow" size={24} color={theme.colors.purpleLight} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxxl,
  },
  circle: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  circleTopRight: {
    top: -60,
    right: -60,
  },
  circleBottomLeft: {
    bottom: -60,
    left: -60,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.display,
    fontWeight: theme.fontWeight.black,
    marginBottom: theme.spacing.xxxl + theme.spacing.sm,
    letterSpacing: 2,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.purpleLight,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.extraBold,
    flex: 1,
    letterSpacing: 2,
  },
});
