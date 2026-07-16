import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { commonStrings } from '@/constants/strings';
import { theme } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { ApiError, login as loginRequest } from '@/services/authService';
import type { UserRole } from '@/types';
import { validateLoginForm } from '@/utils/validation';

export default function Login() {
  const router = useRouter();
  const session = useSession();
  const { role: roleParam } = useLocalSearchParams<{ role?: string }>();
  const role: UserRole = roleParam === 'driver' ? 'driver' : 'passenger';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGo() {
    const validationError = validateLoginForm(email, password);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // Passenger/guardian goes through POST /api/login (Cadastro); driver
      // goes through POST /api/motoristas-admin/login (MotoristasAdmin) —
      // two different endpoints against two different backend tables. See
      // services/authService.ts for the (inconsistent) response shapes.
      const result = await loginRequest(email.trim(), password, role);
      session.login({
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        placaVan: result.placaVan ?? null,
        modeloVan: result.modeloVan ?? null,
      });
      router.replace(role === 'driver' ? '/driver-home' : '/passenger-home');
    } catch (err) {
      // ApiError.message carries the backend's `mensagem` directly — e.g.
      // "Credenciais inválidas" (401) or "Conta inativa. Entre em contato
      // com o administrador." (403, ativo: false).
      setError(err instanceof ApiError ? err.message : commonStrings.feedback.genericError);
    } finally {
      setLoading(false);
    }
  }

  function handleSocialLogin() {
    Alert.alert('Em breve', commonStrings.feedback.featureInDevelopment);
  }

  return (
    <Screen keyboardAvoiding contentContainerStyle={styles.container}>
      <LinearGradient colors={theme.gradients.purpleMagenta} style={styles.circleTopRight} />
      <LinearGradient colors={theme.gradients.purplePink} style={styles.circleBottomLeft} />
      <LinearGradient colors={[theme.colors.pinkDeep, theme.colors.pinkLight]} style={styles.circleBottomRight} />

      <Text style={styles.header}>login</Text>

      <View style={styles.card}>
        <Image source={require('@/assets/images/logo vanmos.png')} style={styles.logo} resizeMode="contain" />

        <TextField
          variant="underline"
          label="E-MAIL"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          containerStyle={styles.field}
        />
        <TextField
          variant="underline"
          label="SENHA"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          containerStyle={styles.field}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="GO" onPress={handleGo} loading={loading} variant="outline" style={styles.goButton} />

        <Text style={styles.orText}>ou entre com</Text>

        <View style={styles.socialRow}>
          <Pressable
            style={styles.socialButton}
            onPress={handleSocialLogin}
            accessibilityRole="button"
            accessibilityLabel="Entrar com Google">
            <Text style={styles.socialIcon}>G</Text>
          </Pressable>
          <Pressable
            style={styles.socialButton}
            onPress={handleSocialLogin}
            accessibilityRole="button"
            accessibilityLabel="Entrar com Facebook">
            <Text style={styles.socialIcon}>f</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleTopRight: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -30,
    right: -30,
  },
  circleBottomLeft: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    bottom: 40,
    left: -40,
  },
  circleBottomRight: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    bottom: 80,
    right: -20,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 32,
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.lg,
  },
  card: {
    width: '80%',
    backgroundColor: 'rgba(30,10,50,0.85)',
    borderRadius: theme.radius.xxl,
    padding: theme.spacing.xxl + 4,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: theme.spacing.xxl,
  },
  field: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  goButton: {
    paddingHorizontal: theme.spacing.xxxl + theme.spacing.lg,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  orText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.lg,
  },
  socialRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xxl + 4,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.purpleDeep,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.purpleAlt,
  },
  socialIcon: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.black,
    color: theme.colors.white,
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.sm,
  },
});
