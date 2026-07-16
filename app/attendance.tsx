import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { DayCircle } from '@/components/features/calendar/DayCircle';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { ModalSheet } from '@/components/ui/ModalSheet';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { theme } from '@/constants/theme';
import { desmarcarFalta, listFaltas, marcarFalta } from '@/services/faltaService';
import type { FaltaDTO } from '@/types/api';

const MONTH_NAMES = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO',
];
const WEEK_DAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function toIsoDate(year: number, monthIndex: number, day: number): string {
  const mm = String(monthIndex + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

// Calendário de faltas do motorista — só ele (nunca o responsável) pode
// marcar/desmarcar aqui (o backend recusa a escrita de qualquer outra role,
// ver FaltaController; isso não é só uma restrição de UI). Um dia sem falta
// registrada é presumido presente.
export default function Attendance() {
  const router = useRouter();
  const { alunoId: alunoIdParam, contactName } = useLocalSearchParams<{ alunoId?: string; contactName?: string }>();
  const alunoId = Number(alunoIdParam);
  const studentName = contactName || 'Aluno';

  const [faltas, setFaltas] = useState<FaltaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [justificativa, setJustificativa] = useState('');
  const [saving, setSaving] = useState(false);

  const today = new Date();
  const monthIndex = today.getMonth();
  const year = today.getFullYear();
  const todayDateOnly = new Date(year, monthIndex, today.getDate());
  const isPastOrToday = (day: number) => new Date(year, monthIndex, day) <= todayDateOnly;

  function loadFaltas() {
    if (!alunoId) return;
    setLoading(true);
    listFaltas(alunoId)
      .then(setFaltas)
      .catch(() => setFaltas([]))
      .finally(() => setLoading(false));
  }

  useEffect(loadFaltas, [alunoId]);

  const faltaPorDia = new Map(faltas.map((falta) => [falta.data, falta]));
  const firstWeekDay = new Date(year, monthIndex, 1).getDay();
  const monthDays = [
    ...Array.from({ length: firstWeekDay }, () => null),
    ...Array.from({ length: new Date(year, monthIndex + 1, 0).getDate() }, (_, index) => index + 1),
  ];

  function handleDayPress(day: number) {
    const iso = toIsoDate(year, monthIndex, day);
    setJustificativa(faltaPorDia.get(iso)?.justificativa ?? '');
    setSelectedDay(day);
  }

  async function handleSalvarFalta() {
    if (!selectedDay || !justificativa.trim()) return;
    setSaving(true);
    try {
      await marcarFalta(alunoId, toIsoDate(year, monthIndex, selectedDay), justificativa.trim());
      setSelectedDay(null);
      loadFaltas();
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível registrar a falta.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoverFalta() {
    if (!selectedDay) return;
    setSaving(true);
    try {
      await desmarcarFalta(alunoId, toIsoDate(year, monthIndex, selectedDay));
      setSelectedDay(null);
      loadFaltas();
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível remover a falta.');
    } finally {
      setSaving(false);
    }
  }

  const jaTemFalta = selectedDay ? faltaPorDia.has(toIsoDate(year, monthIndex, selectedDay)) : false;

  return (
    <Screen contentContainerStyle={styles.container}>
      <Header title={`Faltas — ${studentName}`} onBack={() => router.back()} />

      <Text style={styles.monthTitle}>{MONTH_NAMES[monthIndex]} {year}</Text>
      <Text style={styles.hint}>{loading ? 'Carregando...' : `${faltas.length} falta${faltas.length === 1 ? '' : 's'} no mês`}</Text>

      <View style={styles.weekDayRow}>
        {WEEK_DAY_LABELS.map((label, index) => (
          <Text key={`${label}-${index}`} style={styles.weekDayLabel}>{label}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {monthDays.map((day, index) =>
          day ? (
            <DayCircle
              key={day}
              day={day}
              status={faltaPorDia.has(toIsoDate(year, monthIndex, day)) ? 'absent' : undefined}
              enabled={isPastOrToday(day)}
              onPress={() => handleDayPress(day)}
              size={44}
            />
          ) : (
            <View key={`empty-${index}`} style={styles.emptyDay} />
          )
        )}
      </View>

      <ModalSheet visible={selectedDay !== null} onClose={() => setSelectedDay(null)} closeAccessibilityLabel="Fechar">
        <Text style={styles.modalTitle}>
          {selectedDay ? `${selectedDay} de ${MONTH_NAMES[monthIndex].toLowerCase()}` : ''}
        </Text>
        <TextField
          label="Justificativa da falta"
          value={justificativa}
          onChangeText={setJustificativa}
          placeholder="Ex: aluno doente, não avisou, viagem..."
          containerStyle={styles.field}
        />
        <Button
          title={jaTemFalta ? 'Atualizar falta' : 'Marcar falta'}
          onPress={handleSalvarFalta}
          loading={saving}
          disabled={!justificativa.trim()}
          fullWidth
          style={styles.saveButton}
        />
        {jaTemFalta ? (
          <Button title="Remover falta (presente)" onPress={handleRemoverFalta} variant="outline" loading={saving} fullWidth />
        ) : null}
      </ModalSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  monthTitle: {
    color: theme.colors.white,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.extraBold,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  hint: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  weekDayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  weekDayLabel: {
    color: theme.colors.textMuted,
    width: 36,
    textAlign: 'center',
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md - 2,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyDay: {
    width: 44,
    height: 44,
    marginBottom: theme.spacing.md - 2,
  },
  modalTitle: {
    color: theme.colors.white,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.extraBold,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  field: {
    marginBottom: theme.spacing.lg,
  },
  saveButton: {
    marginBottom: theme.spacing.md,
  },
});
