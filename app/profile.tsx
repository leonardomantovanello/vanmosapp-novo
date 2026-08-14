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
import { maskCnh } from '@/utils/masks';
import { isRequired, isValidEmail } from '@/utils/validation';

export default function Profile() {
  const router = useRouter();
  const session = useSession();
  const role = session.user?.role ?? 'passenger';
  const userId = session.user?.id;

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [idade, setIdade] = useState('');
  const [genero, setGenero] = useState('');
  const [cnh, setCnh] = useState('');
  const [modeloVan, setModeloVan] = useState('');
  const [placaVan, setPlacaVan] = useState('');
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
        setCpf(profile.cpf ?? '');
        setIdade(profile.idade != null ? String(profile.idade) : '');
        setGenero(profile.genero ?? '');
        setCnh(profile.cnh ?? '');
        setModeloVan(profile.modeloVan ?? '');
        setPlacaVan(profile.placaVan ?? '');
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
          cpf: cpf.trim() || null,
          idade: role === 'passenger' && idade.trim() ? Number(idade) : null,
          genero: role === 'passenger' ? genero.trim() || null : null,
          cnh: role === 'driver' ? cnh : null,
          modeloVan: role === 'driver' ? modeloVan.trim() || null : null,
          placaVan: role === 'driver' ? placaVan.trim() || null : null,
          avatarUri,
        },
        { id: userId, role }
      );
      session.updateUser({ name: fullName.trim(), email: email.trim() });
      setFeedback('Alterações salvas com sucesso.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar as alterações.');
    } finally {
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

      {/*
        Fora do ScrollView de propósito: o overlap com o Header depende do
        marginTop negativo abaixo, e um ScrollView recorta (clip) qualquer
        conteúdo do seu próprio conjunto que ultrapasse os limites da área
        rolável — cortando bem a fatia de cima do avatar que deveria ficar
        por cima do Header, como se a barra "comesse" a bolha.
      */}
      <View style={styles.avatarSection}>
        <AvatarPicker uri={avatarUri} onChange={setAvatarUri} />
        <Text style={styles.profileName}>{profileName}</Text>
        <Text style={styles.profileRole}>{role === 'driver' ? 'MOTORISTA' : 'PASSAGEIRO'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
            label="CPF"
            placeholder="Digite seu CPF"
            value={cpf}
            onChangeText={setCpf}
            keyboardType="numeric"
            editable={!loading}
            containerStyle={styles.field}
          />

          {role === 'passenger' ? (
            <>
              <TextField
                label="Idade"
                placeholder="Digite sua idade"
                value={idade}
                onChangeText={setIdade}
                keyboardType="numeric"
                maxLength={3}
                editable={!loading}
                containerStyle={styles.field}
              />
              <TextField
                label="Gênero"
                placeholder="Digite seu gênero"
                value={genero}
                onChangeText={setGenero}
                editable={!loading}
                containerStyle={styles.field}
              />
            </>
          ) : (
            <>
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
              <TextField
                label="Modelo da van"
                placeholder="Digite o modelo"
                value={modeloVan}
                onChangeText={setModeloVan}
                editable={!loading}
                containerStyle={styles.field}
              />
              <TextField
                label="Placa da van"
                placeholder="Digite a placa"
                value={placaVan}
                onChangeText={setPlacaVan}
                autoCapitalize="characters"
                editable={!loading}
                containerStyle={styles.field}
              />
            </>
          )}

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
