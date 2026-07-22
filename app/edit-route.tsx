import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { RouteTimeline } from '@/components/features/route/RouteTimeline';
import { EmptyState } from '@/components/ui/EmptyState';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { theme } from '@/constants/theme';
import { listAlunos, type Passenger } from '@/services/alunosService';
import { addRouteStop, listRouteStops, removeRouteStop } from '@/services/routeService';
import type { RouteStop } from '@/types';
import { ApiError } from '@/services/api/client';

export default function EditRoute() {
  const router = useRouter();
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [alunos, setAlunos] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyAlunoId, setBusyAlunoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [routeStops, driverAlunos] = await Promise.all([listRouteStops(), listAlunos()]);
      setStops(routeStops);
      setAlunos(driverAlunos);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível carregar a rota.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(alunoId: string) {
    setBusyAlunoId(alunoId);
    setError(null);
    try {
      const stop = await addRouteStop(alunoId);
      setStops((prev) => [...prev, stop].sort((a, b) => a.ordem - b.ordem));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível adicionar à rota.');
    } finally {
      setBusyAlunoId(null);
    }
  }

  async function handleRemove(id: string) {
    setError(null);
    const previous = stops;
    setStops((prev) => prev.filter((stop) => stop.id !== id));
    try {
      await removeRouteStop(id);
    } catch (err) {
      setStops(previous);
      setError(err instanceof ApiError ? err.message : 'Não foi possível remover da rota.');
    }
  }

  const alunosNaRota = new Set(stops.map((stop) => stop.alunoId));
  const alunosDisponiveis = alunos.filter((aluno) => !alunosNaRota.has(aluno.id));

  return (
    <Screen scroll contentContainerStyle={styles.container}>
      <Header onBack={() => router.back()} title="Rota padronizada" />

      {loading ? (
        <ActivityIndicator color={theme.colors.purpleAlt} style={styles.loading} />
      ) : (
        <>
          <RouteTimeline stops={stops} onRemove={handleRemove} />

          {error ? <Text style={styles.errorHint}>{error}</Text> : null}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Adicionar aluno à rota</Text>

          {alunosDisponiveis.length === 0 ? (
            <EmptyState
              title={alunos.length === 0 ? 'Nenhum aluno cadastrado' : 'Todos os alunos já estão na rota'}
              description={
                alunos.length === 0 ? 'Cadastre alunos para poder montar a rota.' : undefined
              }
            />
          ) : (
            <View style={styles.list}>
              {alunosDisponiveis.map((aluno) => (
                <Pressable
                  key={aluno.id}
                  style={styles.alunoRow}
                  onPress={() => handleAdd(aluno.id)}
                  disabled={busyAlunoId !== null}
                  accessibilityLabel={`Adicionar ${aluno.name} à rota`}>
                  <Text style={styles.alunoName}>{aluno.name}</Text>
                  {busyAlunoId === aluno.id ? (
                    <ActivityIndicator color={theme.colors.purpleAlt} />
                  ) : (
                    <Text style={styles.addLabel}>Adicionar</Text>
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
  },
  loading: {
    marginTop: theme.spacing.xxl,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.xl,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.md,
  },
  list: {
    gap: theme.spacing.sm,
  },
  alunoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceInput,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  alunoName: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
  },
  addLabel: {
    color: theme.colors.purpleAlt,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  errorHint: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.sm,
  },
});
