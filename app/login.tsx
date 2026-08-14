import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { FloatingCircle, GLOW_COLORS } from '@/components/ui/FloatingCircle';
import { GlowingCard } from '@/components/ui/GlowingCard';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { commonStrings } from '@/constants/strings';
import { theme } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { ApiError, login as loginRequest } from '@/services/authService';
import { validateLoginForm } from '@/utils/validation';

export default function Login() {
  const router = useRouter();
  const session = useSession();

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
      // The role that actually matters comes back from the backend (see
      // authService.ts) — a given email/CPF belongs to a driver or a
      // passenger account regardless of which button was pressed here, so
      // routing/session below use result.role, not the `role` selected on
      // this screen.
      const result = await loginRequest(email.trim(), password);
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
      router.replace(result.role === 'driver' ? '/driver-home' : '/passenger-home');
    } catch (err) {
      // ApiError.message carries the backend's `mensagem` directly — e.g.
      // "Credenciais inválidas" (401) or "Conta inativa. Entre em contato
      // com o administrador." (403, ativo: false).
      setError(err instanceof ApiError ? err.message : commonStrings.feedback.genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen keyboardAvoiding contentContainerStyle={styles.container}>
      <FloatingCircle colors={GLOW_COLORS.purple} style={styles.circleTopRight} driftX={18} driftY={14} duration={5200} />
      <FloatingCircle colors={GLOW_COLORS.violet} style={styles.circleBottomLeft} driftX={-16} driftY={18} duration={6400} />
      <FloatingCircle colors={GLOW_COLORS.pink} style={styles.circleBottomRight} driftX={14} driftY={-16} duration={4600} />

      <Text style={styles.header}>Bem-vindo de volta</Text>

      <GlowingCard style={styles.cardShadow} cardStyle={styles.card}>
        <View style={styles.logoBadge}>
          <Image source={require('@/assets/images/logo vanmos.png')} style={styles.logo} resizeMode="contain" />
        </View>

        <TextField
          variant="filled"
          icon="mail-outline"
          label="E-MAIL"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          containerStyle={styles.field}
        />
        <TextField
          variant="filled"
          icon="lock-outline"
          label="SENHA"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          containerStyle={styles.field}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title="ENTRAR"
          onPress={handleGo}
          loading={loading}
          variant="gradient"
          fullWidth
          style={styles.goButton}
        />
      </GlowingCard>
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
    overflow: 'hidden',
  },
  circleBottomLeft: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    bottom: 40,
    left: -40,
    overflow: 'hidden',
  },
  circleBottomRight: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    bottom: 80,
    right: -20,
    overflow: 'hidden',
  },
  header: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.extraBold,
    marginBottom: theme.spacing.xxl,
    letterSpacing: 0.5,
  },
  cardShadow: {
    width: '85%',
    maxWidth: 400,
  },
  card: {
    backgroundColor: 'rgba(30,10,50,0.9)',
    borderRadius: theme.radius.xxl,
    padding: theme.spacing.xxl + 4,
    alignItems: 'center',
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(170,68,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(170,68,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logo: {
    width: 64,
    height: 64,
  },
  field: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  goButton: {
    marginTop: theme.spacing.md,
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.sm,
  },
});
