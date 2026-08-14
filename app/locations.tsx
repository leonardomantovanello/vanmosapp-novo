import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { FloatingCircle, GLOW_COLORS } from '@/components/ui/FloatingCircle';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { theme } from '@/constants/theme';
import { listAlunos, type Passenger } from '@/services/alunosService';
import { getRouteProgress } from '@/services/routeProgressService';
import type { RotaProgressoDTO } from '@/types/api';

// Não há GPS no sistema (RotaProgressoService avança "manualmente" parada
// por parada — ver passenger-home.tsx), então esta tela NÃO é um mapa com
// posição real. É uma linha do tempo esquemática das paradas da rota,
// construída só com o que /api/rotas/progresso já retorna pro responsável:
// totalParadas, ordemAtual (onde o motorista está) e suaOrdem (onde o seu
// filho está). O backend nunca expõe nome/endereço de OUTRO aluno da rota
// pra um responsável (ver RotaProgressoService#obterParaResponsavel) — por
// isso as paradas de outras famílias aparecem só como "Parada N", nunca com
// nome ou endereço.
export default function Locations() {
  const router = useRouter();
  const [meuAluno, setMeuAluno] = useState<Passenger | null>(null);
  const [progress, setProgress] = useState<RotaProgressoDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([listAlunos(), getRouteProgress()])
      .then(([alunos, progressData]) => {
        if (!isMounted) return;
        setMeuAluno(alunos[0] ?? null);
        setProgress(progressData);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const paradas = progress && progress.ativo && progress.totalParadas > 0
    ? Array.from({ length: progress.totalParadas }, (_, index) => {
        const ordem = index + 1;
        const isAtual = ordem === progress.ordemAtual;
        const isVoce = ordem === progress.suaOrdem;
        const isPassada = progress.ordemAtual != null && ordem < progress.ordemAtual;
        return { ordem, isAtual, isVoce, isPassada };
      })
    : [];

  return (
    <Screen
      scroll
      contentContainerStyle={styles.container}
      decorations={
        <>
          <FloatingCircle colors={GLOW_COLORS.violet} style={styles.circleTopRight} driftX={16} driftY={12} duration={5600} />
          <FloatingCircle colors={GLOW_COLORS.purple} style={styles.circleBottomLeft} driftX={-14} driftY={16} duration={6800} />
        </>
      }>
      <Header variant="gradient" gradientColors={theme.gradients.header} title="LOCAIS" onBack={() => router.back()} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SEUS PONTOS</Text>
        {meuAluno?.enderecoEmbarque || meuAluno?.enderecoDesembarque || meuAluno?.escola ? (
          <View style={styles.pointsCard}>
            {meuAluno?.enderecoEmbarque ? (
              <View style={styles.pointRow}>
                <MaterialIcons name="my-location" size={20} color={theme.colors.purpleDeep} />
                <View style={styles.pointText}>
                  <Text style={styles.pointLabel}>Embarque</Text>
                  <Text style={styles.pointValue}>{meuAluno.enderecoEmbarque}</Text>
                </View>
              </View>
            ) : null}
            {meuAluno?.enderecoDesembarque ? (
              <View style={styles.pointRow}>
                <MaterialIcons name="flag" size={20} color={theme.colors.magenta} />
                <View style={styles.pointText}>
                  <Text style={styles.pointLabel}>Desembarque</Text>
                  <Text style={styles.pointValue}>{meuAluno.enderecoDesembarque}</Text>
                </View>
              </View>
            ) : null}
            {meuAluno?.escola ? (
              <View style={styles.pointRow}>
                <MaterialIcons name="school" size={20} color={theme.colors.purpleAlt} />
                <View style={styles.pointText}>
                  <Text style={styles.pointLabel}>Escola</Text>
                  <Text style={styles.pointValue}>{meuAluno.escola}</Text>
                </View>
              </View>
            ) : null}
          </View>
        ) : !loading ? (
          <EmptyState icon="place" title="Nenhum ponto cadastrado ainda" />
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PROGRESSO DA ROTA</Text>

        {loading ? null : (
          <View style={styles.progressCard}>
            {paradas.length === 0 ? (
              <EmptyState
                icon="route"
                title={progress?.suaOrdem == null ? 'Você não está na rota hoje' : 'Aguardando o motorista iniciar a corrida'}
              />
            ) : (
              <View style={styles.timeline}>
                {paradas.map((parada, index) => (
                  <View key={parada.ordem} style={styles.timelineRow}>
                    <View style={styles.timelineMarkerColumn}>
                      <View
                        style={[
                          styles.timelineDot,
                          parada.isPassada && styles.timelineDotDone,
                          parada.isAtual && styles.timelineDotAtual,
                          parada.isVoce && styles.timelineDotVoce,
                        ]}>
                        {parada.isAtual ? (
                          <MaterialIcons name="directions-bus" size={14} color={theme.colors.white} />
                        ) : parada.isPassada ? (
                          <MaterialIcons name="check" size={14} color={theme.colors.white} />
                        ) : null}
                      </View>
                      {index < paradas.length - 1 ? <View style={styles.timelineLine} /> : null}
                    </View>
                    <View style={styles.timelineTextColumn}>
                      <Text style={[styles.timelineLabel, parada.isVoce && styles.timelineLabelVoce]}>
                        {parada.isVoce ? 'Você' : `Parada ${parada.ordem}`}
                      </Text>
                      {parada.isAtual ? <Text style={styles.timelineSubLabel}>Motorista está aqui agora</Text> : null}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: theme.spacing.xxxl,
  },
  circleTopRight: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    top: 40,
    right: -40,
    overflow: 'hidden',
  },
  circleBottomLeft: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    bottom: 60,
    left: -40,
    overflow: 'hidden',
  },
  section: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.extraBold,
    fontSize: theme.fontSize.sm,
    letterSpacing: 2,
    marginBottom: theme.spacing.md,
  },
  pointsCard: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(204,68,204,0.15)',
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  progressCard: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(204,68,204,0.15)',
    padding: theme.spacing.lg,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  pointText: {
    flex: 1,
  },
  pointLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 1,
    marginBottom: 2,
  },
  pointValue: {
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
  },
  timeline: {
    marginTop: theme.spacing.sm,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineMarkerColumn: {
    alignItems: 'center',
    width: 32,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotDone: {
    backgroundColor: theme.colors.purpleDeep,
  },
  timelineDotAtual: {
    backgroundColor: theme.colors.magenta,
  },
  timelineDotVoce: {
    borderWidth: 2,
    borderColor: theme.colors.purpleAlt,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: theme.spacing.xl,
    backgroundColor: theme.colors.borderMuted,
  },
  timelineTextColumn: {
    flex: 1,
    paddingBottom: theme.spacing.lg,
    paddingLeft: theme.spacing.md,
  },
  timelineLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
  },
  timelineLabelVoce: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
  },
  timelineSubLabel: {
    color: theme.colors.magenta,
    fontSize: theme.fontSize.xs,
    marginTop: 2,
  },
});
