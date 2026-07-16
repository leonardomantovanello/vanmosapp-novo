import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { TextField } from '@/components/ui/TextField';
import { theme } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { ApiError } from '@/services/api/client';
import { changePassword } from '@/services/settingsService';
import { isRequired } from '@/utils/validation';

export default function Settings() {
  const router = useRouter();
  const session = useSession();
  const userId = session.user?.id;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  }

  async function handleChangePassword() {
    setError(null);
    setFeedback(null);

    if (!isRequired(currentPassword) || !isRequired(newPassword) || !isRequired(confirmNewPassword)) {
      setError('Preencha a senha atual e a nova senha (nos dois campos).');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('A nova senha e a confirmação não são iguais.');
      return;
    }
    if (!userId) {
      setError('Sessão inválida. Faça login novamente.');
      return;
    }

    setSaving(true);
    try {
      await changePassword(userId, currentPassword, newPassword);
      setFeedback('Senha alterada com sucesso.');
      resetForm();
    } catch (err) {
      // ApiError.message carrega a mensagem do backend direto — ex: "Senha
      // atual incorreta" (422) ou a regra de formato da nova senha (400).
      setError(err instanceof ApiError ? err.message : 'Não foi possível alterar a senha.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header
        variant="gradient"
        gradientColors={theme.gradients.header}
        title="CONFIGURAÇÕES"
        onBack={() => router.back()}
        backAccessibilityLabel="Voltar"
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>ALTERAR SENHA</Text>

          <TextField
            label="Senha atual"
            placeholder="Digite sua senha atual"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            containerStyle={styles.field}
          />
          <TextField
            label="Nova senha"
            placeholder="Digite a nova senha"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            hint="Mínimo 8 caracteres, com maiúscula, minúscula e número."
            containerStyle={styles.field}
          />
          <TextField
            label="Confirmar nova senha"
            placeholder="Digite a nova senha novamente"
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            secureTextEntry
            containerStyle={styles.field}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {feedback ? <Text style={styles.successText}>{feedback}</Text> : null}

          <Button title="Alterar senha" onPress={handleChangePassword} loading={saving} style={styles.saveButton} />
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
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl + theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xxl,
    padding: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.extraBold,
    fontSize: theme.fontSize.sm,
    letterSpacing: 2,
    marginBottom: theme.spacing.sm,
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
