import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvatarPicker } from '@/components/features/profile/AvatarPicker';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { TextField } from '@/components/ui/TextField';
import { theme } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { ApiError } from '@/services/api/client';
import { getProfile, updateProfile } from '@/services/profileService';
import { maskCnh, maskPhone } from '@/utils/masks';
import { isRequired, isValidEmail } from '@/utils/validation';

export default function Profile() {
  const router = useRouter();
  const session = useSession();
  const role = session.user?.role ?? 'passenger';
  const userId = session.user?.id;

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [school, setSchool] = useState('');
  const [cnh, setCnh] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    getProfile({ id: userId, role })
      .then((profile) => {
        if (!isMounted) return;
        setAvatarUri(profile.avatarUri);
        setFullName(profile.name || session.user?.name || '');
        setEmail(profile.email || session.user?.email || '');
        setPhone(profile.phone);
        setAddress(profile.address);
        setSchool(profile.school);
        setCnh(profile.cnh ?? '');
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof ApiError ? err.message : 'Não foi possível carregar seu perfil.');
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, role]);

  const profileName = fullName.trim() || 'Seu nome aqui';

  async function handleSave() {
    if (!isRequired(fullName)) {
      setError('Informe seu nome.');
      setFeedback(null);
      return;
    }
    if (!isValidEmail(email)) {
      setError('Informe um e-mail válido.');
      setFeedback(null);
      return;
    }
    if (role === 'driver' && !isRequired(cnh)) {
      setError('Informe o número da CNH.');
      setFeedback(null);
      return;
    }
    // The backend requires the current password to be re-sent on every
    // profile save (see services/profileService.ts for exactly why — short
    // version: it's a real constraint of the update endpoints, not a
    // gratuitous UX choice on our end).
    if (!isRequired(currentPassword)) {
      setError('Informe sua senha atual para salvar as alterações.');
      setFeedback(null);
      return;
    }
    if (!userId) {
      setError('Sessão inválida. Faça login novamente.');
      setFeedback(null);
      return;
    }

    setError(null);
    setFeedback(null);
    setSaving(true);
    try {
      await updateProfile(
        {
          name: fullName.trim(),
          email: email.trim(),
          phone,
          address,
          school,
          cnh: role === 'driver' ? cnh : undefined,
          avatarUri,
          currentPassword,
        },
        { id: userId, role }
      );
      session.updateUser({ name: fullName.trim(), email: email.trim() });
      setFeedback('Alterações salvas com sucesso.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar as alterações.');
    } finally {
      // Cleared on both success and failure — never kept around longer than
      // the single request that needed it.
      setCurrentPassword('');
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header
        variant="gradient"
        gradientColors={theme.gradients.header}
        title="MEU PERFIL"
        onBack={() => router.back()}
        backAccessibilityLabel="Voltar"
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <AvatarPicker uri={avatarUri} onChange={setAvatarUri} />
          <Text style={styles.profileName}>{profileName}</Text>
          <Text style={styles.profileRole}>{role === 'driver' ? 'MOTORISTA' : 'PASSAGEIRO'}</Text>
        </View>

        <View style={styles.card}>
          <TextField
            label="Nome completo"
            placeholder="Digite seu nome"
            value={fullName}
            onChangeText={setFullName}
            editable={!loading}
            containerStyle={styles.field}
          />
          <TextField
            label="E-mail"
            placeholder="Digite seu e-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
            containerStyle={styles.field}
          />
          <TextField
            label="Telefone"
            placeholder="Digite seu telefone"
            value={phone}
            onChangeText={(text) => setPhone(maskPhone(text))}
            keyboardType="phone-pad"
            editable={!loading}
            containerStyle={styles.field}
          />
          <TextField
            label="Endereço"
            placeholder="Digite seu endereço"
            value={address}
            onChangeText={setAddress}
            editable={!loading}
            containerStyle={styles.field}
          />
          <TextField
            label="Escola"
            placeholder="Digite sua escola"
            value={school}
            onChangeText={setSchool}
            editable={!loading}
            containerStyle={styles.field}
          />
          {role === 'driver' ? (
            <TextField
              label="CNH"
              placeholder="Número da CNH"
              value={cnh}
              onChangeText={(text) => setCnh(maskCnh(text))}
              keyboardType="numeric"
              maxLength={11}
              editable={!loading}
              containerStyle={styles.field}
            />
          ) : null}

          <TextField
            label="Senha atual"
            placeholder="Confirme sua senha para salvar"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            editable={!loading}
            hint="Necessária para confirmar as alterações do seu perfil."
            containerStyle={styles.field}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {feedback ? <Text style={styles.successText}>{feedback}</Text> : null}

          <Button title="Salvar" onPress={handleSave} loading={saving} disabled={loading} style={styles.saveButton} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundDarkest,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl + theme.spacing.sm,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: -40,
    marginBottom: theme.spacing.xxl,
  },
  profileName: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.extraBold,
    marginTop: theme.spacing.lg,
  },
  profileRole: {
    color: theme.colors.magenta,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    marginTop: theme.spacing.xs + 2,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xxl,
    padding: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  field: {
    marginBottom: theme.spacing.xs,
  },
  saveButton: {
    marginTop: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.sm,
  },
  successText: {
    color: theme.colors.success,
    fontSize: theme.fontSize.sm,
  },
});
