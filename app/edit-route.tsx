import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { RouteTimeline } from '@/components/features/route/RouteTimeline';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { commonStrings } from '@/constants/strings';
import { theme } from '@/constants/theme';
import { lookupCep } from '@/services/cepService';
import { addRouteStop } from '@/services/routeService';
import type { RouteStop } from '@/types';
import { maskCep } from '@/utils/masks';
import { isRequired, isValidCep } from '@/utils/validation';

function FieldRow({
  label,
  value,
  onChangeText,
  keyboardType,
  maxLength,
  narrow,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  narrow?: boolean;
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, narrow && styles.inputSmall]}
        placeholderTextColor={theme.colors.textFaint}
        keyboardType={keyboardType}
        maxLength={maxLength}
        value={value}
        onChangeText={onChangeText}
        accessibilityLabel={label}
      />
    </View>
  );
}

export default function EditRoute() {
  const router = useRouter();
  const [routes, setRoutes] = useState<RouteStop[]>([]);
  const [nome, setNome] = useState('');
  const [cep, setCep] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [numero, setNumero] = useState('');
  const [referencia, setReferencia] = useState('');
  const [parada, setParada] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleCepChange(value: string) {
    const masked = maskCep(value);
    setCep(masked);
    setCepError(null);

    if (!isValidCep(masked)) {
      setBairro('');
      setCidade('');
      return;
    }

    setLoadingCep(true);
    const result = await lookupCep(masked);
    setLoadingCep(false);

    switch (result.status) {
      case 'success':
        setNome(result.data.logradouro || nome);
        setBairro(result.data.bairro);
        setCidade(result.data.localidade);
        break;
      case 'not_found':
        setBairro('');
        setCidade('');
        setCepError(commonStrings.cep.notFound);
        break;
      case 'invalid':
        setCepError(commonStrings.cep.invalid);
        break;
      case 'timeout':
        setCepError(commonStrings.cep.timeout);
        break;
      case 'network_error':
        setCepError(commonStrings.cep.networkError);
        break;
    }
  }

  async function handleAdd() {
    if (!isRequired(nome)) {
      setFormError('Informe o nome do ponto de parada.');
      return;
    }
    if (!isValidCep(cep)) {
      setFormError(commonStrings.validation.invalidCep);
      return;
    }

    setFormError(null);
    const stop = await addRouteStop({ nome, cep, bairro, cidade, numero, referencia, parada });
    setRoutes((prev) => [...prev, stop]);
    setNome('');
    setCep('');
    setBairro('');
    setCidade('');
    setNumero('');
    setReferencia('');
    setParada('');
  }

  return (
    <Screen keyboardAvoiding scroll contentContainerStyle={styles.container}>
      <Header onBack={() => router.back()} />

      <RouteTimeline stops={routes} />

      <View style={styles.divider} />

      <View style={styles.form}>
        <FieldRow label="Nome" value={nome} onChangeText={setNome} />

        <View style={styles.fieldRow}>
          <Text style={styles.label}>Cep</Text>
          <View style={styles.cepContainer}>
            <TextInput
              style={styles.cepInput}
              placeholderTextColor={theme.colors.textFaint}
              keyboardType="numeric"
              value={cep}
              onChangeText={handleCepChange}
              maxLength={9}
              accessibilityLabel="CEP"
            />
            {loadingCep ? <Text style={styles.hint}>{commonStrings.cep.searching}</Text> : null}
            {!loadingCep && cepError ? <Text style={styles.errorHint}>{cepError}</Text> : null}
            {!loadingCep && !cepError && bairro ? <Text style={styles.hint}>{bairro} - {cidade}</Text> : null}
          </View>
        </View>

        <FieldRow label="Nº casa" value={numero} onChangeText={setNumero} keyboardType="numeric" narrow />
        <FieldRow label={'Ponto de\nreferência'} value={referencia} onChangeText={setReferencia} />
        <FieldRow label="Parada" value={parada} onChangeText={setParada} />

        {formError ? <Text style={styles.errorHint}>{formError}</Text> : null}

        <Button title="Adicionar" onPress={handleAdd} variant="solid" style={styles.addButton} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.xxl,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.xl,
  },
  form: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    width: 80,
    textAlign: 'right',
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surfaceInput,
    borderRadius: theme.radius.sm,
    borderWidth: 1.5,
    borderColor: theme.colors.surfaceInput,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
  },
  inputSmall: {
    flex: 0,
    width: 80,
    minWidth: 80,
  },
  addButton: {
    marginTop: theme.spacing.sm,
  },
  cepContainer: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  cepInput: {
    backgroundColor: theme.colors.surfaceInput,
    borderRadius: theme.radius.sm,
    borderWidth: 1.5,
    borderColor: theme.colors.surfaceInput,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
  },
  hint: {
    color: theme.colors.purpleAlt,
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
  errorHint: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
});
