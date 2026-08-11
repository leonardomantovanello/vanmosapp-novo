import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayCircle } from '@/components/features/calendar/DayCircle';
import { MonthCalendarModal } from '@/components/features/calendar/MonthCalendarModal';
import { SideMenu } from '@/components/features/home/SideMenu';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { ModalSheet } from '@/components/ui/ModalSheet';
import { TextField } from '@/components/ui/TextField';
import { commonStrings } from '@/constants/strings';
import { theme } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { listAlunos, type Passenger } from '@/services/alunosService';
import { desmarcarFalta, listFaltas, marcarFalta } from '@/services/faltaService';
import {
  configureNotificationChannel,
  ensureNotificationPermission,
  showLocalNotification,
} from '@/services/notifications/localNotifications';
import { getRouteProgress } from '@/services/routeProgressService';
import type { FaltaDTO, RotaProgressoDTO } from '@/types/api';
import type { AttendanceStatus } from '@/types';

const ROUTE_PROGRESS_POLL_MS = 15000;
const DRIVER_APPROACHING_TITLE = 'VanMos';
const DRIVER_APPROACHING_BODY = 'Seu motorista está chegando. Prepare-se para o embarque.';

function routeStatusMessage(progress: RotaProgressoDTO | null): string {
  if (!progress || !progress.ativo) return 'Aguardando o motorista iniciar a corrida.';
  if (progress.vocEhAtual) return 'O motorista está te buscando agora!';
  if (progress.vocEhOProximo) return 'Você será o próximo a ser buscado!';
  if (progress.suaOrdem == null) return 'Você ainda não está na rota do motorista.';
  if (progress.ordemAtual != null && progress.suaOrdem > progress.ordemAtual) {
    const faltam = progress.suaOrdem - progress.ordemAtual;
    return `Faltam ${faltam} ${faltam === 1 ? 'parada' : 'paradas'} até chegar em você.`;
  }
  return 'Corrida em andamento.';
}

const MONTH_NAMES = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO',
];
const WEEK_DAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function PassengerHome() {
  const router = useRouter();
  const session = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  // Quem marca/desmarca falta é o responsável, aqui mesmo (ver
  // FaltaController, que recusa escrita de qualquer outra role no servidor,
  // não só na UI). Marcar falta pra hoje remove a parada da rota do
  // motorista (ver RotaProgressoService no backend) — só é permitido pra
  // hoje/futuro, nunca pra um dia que já passou. Um dia sem falta
  // registrada é presumido presente.
  const [faltas, setFaltas] = useState<FaltaDTO[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [justificativa, setJustificativa] = useState('');
  const [savingFalta, setSavingFalta] = useState(false);
  // GET /api/alunos is filtered server-side to this responsável's own kids.
  // Chat/faltas são escopados por aluno, então precisamos de um aluno id
  // antes de poder abrir o chat ou carregar as faltas. Pega o primeiro
  // filho se houver mais de um — não existe seletor ainda pra esse caso.
  const [meuAluno, setMeuAluno] = useState<Passenger | null>(null);
  const [routeProgress, setRouteProgress] = useState<RotaProgressoDTO | null>(null);
  // Guarda o vocEhOProximo do fetch anterior pra detectar a borda de subida
  // (false -> true) e não notificar de novo a cada poll enquanto continuar
  // "próximo". Começa em null pra não notificar no primeiro fetch da tela
  // (evita disparo imediato ao abrir o app já com o motorista próximo).
  const previousIsNextRef = useRef<boolean | null>(null);

  // Sem WebSocket aqui — o backend resolve a posição do próprio filho na
  // rota do motorista por trás de GET /api/rotas/progresso, então só
  // buscamos de novo periodicamente enquanto a tela está aberta.
  //
  // Notificação de aproximação: não há GPS no sistema (RotaProgressoService
  // avança "manualmente" parada por parada), então "motorista chegando" é
  // aproximado pelo motorista virar vocEhOProximo=true — a parada logo antes
  // da sua. É uma notificação LOCAL (expo-notifications), não push remoto:
  // só dispara com o app aberto/recente em segundo plano, não com o app
  // totalmente encerrado — ver services/notifications/localNotifications.ts.
  useEffect(() => {
    let isMounted = true;
    ensureNotificationPermission();
    configureNotificationChannel();

    function fetchProgress() {
      getRouteProgress()
        .then((data) => {
          if (!isMounted) return;
          setRouteProgress(data);
          if (previousIsNextRef.current === false && data.vocEhOProximo) {
            showLocalNotification(DRIVER_APPROACHING_TITLE, DRIVER_APPROACHING_BODY);
          }
          previousIsNextRef.current = data.vocEhOProximo;
        })
        .catch(() => {});
    }
    fetchProgress();
    const interval = setInterval(fetchProgress, ROUTE_PROGRESS_POLL_MS);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    listAlunos()
      .then((alunos) => {
        if (isMounted) setMeuAluno(alunos[0] ?? null);
      })
      .catch(() => {
        if (isMounted) setMeuAluno(null);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  function loadFaltas() {
    if (!meuAluno) return;
    listFaltas(Number(meuAluno.id))
      .then(setFaltas)
      .catch(() => setFaltas([]));
  }

  useEffect(loadFaltas, [meuAluno]);

  const passengerName = session.user?.name ?? 'Passageiro';
  const today = new Date();
  const monthIndex = today.getMonth();
  const year = today.getFullYear();
  const monthName = MONTH_NAMES[monthIndex];
  const todayDateOnly = new Date(year, monthIndex, today.getDate());

  // Só é permitido marcar/desmarcar falta pra hoje ou dias futuros — um dia
  // que já passou não pode mais ser removido da corrida (mesma regra
  // aplicada no backend, ver FaltaController).
  const isTodayOrFuture = (day: number) => new Date(year, monthIndex, day) >= todayDateOnly;

  // yyyy-MM-dd do mês/ano atual em exibição, pra casar com FaltaDTO.data.
  function isoDateFor(day: number): string {
    const mm = String(monthIndex + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }

  const faltaPorDia = new Map(faltas.map((falta) => [falta.data, falta]));
  const statusFor = (day: number): AttendanceStatus | undefined => (faltaPorDia.has(isoDateFor(day)) ? 'absent' : undefined);

  function handleDayPress(day: number) {
    if (!isTodayOrFuture(day)) return;
    setJustificativa(faltaPorDia.get(isoDateFor(day))?.justificativa ?? '');
    setSelectedDay(day);
  }

  const jaTemFaltaNoDiaSelecionado = selectedDay ? faltaPorDia.has(isoDateFor(selectedDay)) : false;

  async function handleSalvarFalta() {
    if (!selectedDay || !meuAluno || !justificativa.trim()) return;
    setSavingFalta(true);
    try {
      await marcarFalta(Number(meuAluno.id), isoDateFor(selectedDay), justificativa.trim());
      setSelectedDay(null);
      loadFaltas();
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível registrar a falta.');
    } finally {
      setSavingFalta(false);
    }
  }

  async function handleRemoverFalta() {
    if (!selectedDay || !meuAluno) return;
    setSavingFalta(true);
    try {
      await desmarcarFalta(Number(meuAluno.id), isoDateFor(selectedDay));
      setSelectedDay(null);
      loadFaltas();
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível remover a falta.');
    } finally {
      setSavingFalta(false);
    }
  }

  const absences = faltas.filter((falta) => falta.data.startsWith(`${year}-${String(monthIndex + 1).padStart(2, '0')}`)).length;
  const firstWeekDay = new Date(year, monthIndex, 1).getDay();
  const monthDays = [
    ...Array.from({ length: firstWeekDay }, () => null),
    ...Array.from({ length: new Date(year, monthIndex + 1, 0).getDate() }, (_, index) => {
      const day = index + 1;
      return { day, status: statusFor(day) };
    }),
  ];

  const weekDays = Array.from({ length: 5 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + index);
    return { day: date.getDate(), status: statusFor(date.getDate()) };
  });

  function handleLogout() {
    setMenuOpen(false);
    session.logout();
    router.replace('/');
  }

  function handleFeatureInDevelopment() {
    Alert.alert('Em breve', commonStrings.feedback.featureInDevelopment);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <SideMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onProfilePress={() => {
          setMenuOpen(false);
          router.push('/profile');
        }}
        onSettingsPress={() => {
          setMenuOpen(false);
          router.push('/settings');
        }}
        onLogoutPress={handleLogout}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={theme.gradients.action} style={styles.header}>
          <Pressable onPress={() => setMenuOpen(true)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Abrir menu">
            <MaterialIcons name="menu" size={28} color={theme.colors.white} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Avatar size={60} iconSize={34} backgroundColor="rgba(255,255,255,0.3)" />
            <Text style={styles.greeting}>Olá, {passengerName}!</Text>
          </View>
          <Pressable
            onPress={() => router.push('/notifications')}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Ver notificações">
            <MaterialIcons name="notifications-none" size={28} color={theme.colors.white} />
          </Pressable>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SEU MOTORISTA</Text>
          <Avatar size={80} iconSize={48} style={styles.driverAvatar} />

          <View style={styles.statusCard}>
            <MaterialIcons
              name={routeProgress?.vocEhAtual ? 'directions-bus' : 'place'}
              size={20}
              color={theme.colors.white}
            />
            <Text style={styles.statusText}>{routeStatusMessage(routeProgress)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <MaterialIcons name="schedule" size={28} color={theme.colors.textSecondary} style={styles.scheduleIcon} />
          <Text style={styles.monthTitle}>{monthName}</Text>
          <View style={styles.calendarHeader}>
            <Text style={styles.monthInfoText}>{absences} falta{absences === 1 ? '' : 's'} no mês</Text>
            <Pressable
              style={styles.viewAllButton}
              onPress={() => setShowCalendar(true)}
              accessibilityRole="button"
              accessibilityLabel={commonStrings.actions.seeAllDays}>
              <Text style={styles.viewAllButtonText}>{commonStrings.actions.seeAllDays}</Text>
            </Pressable>
          </View>
          <View style={styles.daysRow}>
            {weekDays.map((item) => (
              <DayCircle
                key={item.day}
                day={item.day}
                status={item.status}
                enabled={isTodayOrFuture(item.day)}
                onPress={() => handleDayPress(item.day)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <MonthCalendarModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        monthName={monthName}
        year={year}
        weekDays={WEEK_DAY_LABELS}
        absences={absences}
        monthDays={monthDays}
        isDayEnabled={isTodayOrFuture}
        onDayPress={handleDayPress}
      />

      <ModalSheet visible={selectedDay !== null} onClose={() => setSelectedDay(null)} closeAccessibilityLabel="Fechar">
        <Text style={styles.modalTitle}>
          {selectedDay ? `${selectedDay} de ${monthName.toLowerCase()}` : ''}
        </Text>
        <TextField
          label="Justificativa da falta"
          value={justificativa}
          onChangeText={setJustificativa}
          placeholder="Ex: vou viajar, aluno doente..."
          containerStyle={styles.field}
        />
        <Button
          title={jaTemFaltaNoDiaSelecionado ? 'Atualizar falta' : 'Marcar falta'}
          onPress={handleSalvarFalta}
          loading={savingFalta}
          disabled={!justificativa.trim()}
          fullWidth
          style={styles.saveButton}
        />
        {jaTemFaltaNoDiaSelecionado ? (
          <Button title="Remover falta (presente)" onPress={handleRemoverFalta} variant="outline" loading={savingFalta} fullWidth />
        ) : null}
      </ModalSheet>

      <View style={styles.bottomNav}>
        <View style={styles.navItem}>
          <MaterialIcons name="home" size={26} color={theme.colors.magenta} />
        </View>
        <Pressable style={styles.navItem} onPress={handleFeatureInDevelopment} accessibilityRole="button" accessibilityLabel="Horários">
          <MaterialIcons name="schedule" size={26} color={theme.colors.textFaint} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={handleFeatureInDevelopment} accessibilityRole="button" accessibilityLabel="Locais">
          <MaterialIcons name="place" size={26} color={theme.colors.textFaint} />
        </Pressable>
        <Pressable
          style={styles.navItem}
          onPress={() =>
            meuAluno
              ? router.push({ pathname: '/chat', params: { contactName: 'Motorista', alunoId: meuAluno.id } })
              : handleFeatureInDevelopment()
          }
          accessibilityRole="button"
          accessibilityLabel="Abrir chat com o motorista">
          <MaterialIcons name="chat-bubble-outline" size={26} color={theme.colors.textFaint} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundAlt,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.xxl,
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
  },
  headerCenter: {
    alignItems: 'center',
    gap: theme.spacing.xs + 2,
  },
  greeting: {
    color: theme.colors.white,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  section: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
  },
  sectionTitle: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.extraBold,
    fontSize: theme.fontSize.md,
    letterSpacing: 2,
    marginBottom: theme.spacing.lg,
  },
  driverAvatar: {
    marginBottom: theme.spacing.sm + 2,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.magenta,
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
    width: '100%',
  },
  statusText: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.base,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderMuted,
    marginHorizontal: theme.spacing.xxl,
  },
  scheduleIcon: {
    alignSelf: 'center',
  },
  monthTitle: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.extraBold,
    fontSize: theme.fontSize.sm,
    letterSpacing: 2,
    marginVertical: theme.spacing.md,
  },
  calendarHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  monthInfoText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  viewAllButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 2,
    backgroundColor: theme.colors.magenta,
    borderRadius: theme.radius.pill,
  },
  viewAllButtonText: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.xs,
  },
  daysRow: {
    flexDirection: 'row',
    gap: theme.spacing.md - 2,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceCard,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
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
