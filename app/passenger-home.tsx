import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayCircle } from '@/components/features/calendar/DayCircle';
import { MonthCalendarModal } from '@/components/features/calendar/MonthCalendarModal';
import { SideMenu } from '@/components/features/home/SideMenu';
import { Avatar } from '@/components/ui/Avatar';
import { commonStrings } from '@/constants/strings';
import { theme } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { listAlunos, type Passenger } from '@/services/alunosService';
import { listFaltas } from '@/services/faltaService';
import { getRouteProgress } from '@/services/routeProgressService';
import type { FaltaDTO, RotaProgressoDTO } from '@/types/api';
import type { AttendanceStatus } from '@/types';

const ROUTE_PROGRESS_POLL_MS = 15000;

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
  // Faltas vêm do backend e são só leitura aqui — quem marca/desmarca é o
  // motorista (ver app/attendance.tsx e FaltaController, que recusa escrita
  // de qualquer outra role no servidor, não só na UI). Um dia sem falta
  // registrada é presumido presente.
  const [faltas, setFaltas] = useState<FaltaDTO[]>([]);
  // GET /api/alunos is filtered server-side to this responsável's own kids.
  // Chat/faltas são escopados por aluno, então precisamos de um aluno id
  // antes de poder abrir o chat ou carregar as faltas. Pega o primeiro
  // filho se houver mais de um — não existe seletor ainda pra esse caso.
  const [meuAluno, setMeuAluno] = useState<Passenger | null>(null);
  const [routeProgress, setRouteProgress] = useState<RotaProgressoDTO | null>(null);

  // Sem WebSocket aqui — o backend resolve a posição do próprio filho na
  // rota do motorista por trás de GET /api/rotas/progresso, então só
  // buscamos de novo periodicamente enquanto a tela está aberta.
  useEffect(() => {
    let isMounted = true;
    function fetchProgress() {
      getRouteProgress()
        .then((data) => {
          if (isMounted) setRouteProgress(data);
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

  useEffect(() => {
    if (!meuAluno) return;
    let isMounted = true;
    listFaltas(Number(meuAluno.id))
      .then((data) => {
        if (isMounted) setFaltas(data);
      })
      .catch(() => {
        if (isMounted) setFaltas([]);
      });
    return () => {
      isMounted = false;
    };
  }, [meuAluno]);

  const passengerName = session.user?.name ?? 'Passageiro';
  const today = new Date();
  const monthIndex = today.getMonth();
  const year = today.getFullYear();
  const monthName = MONTH_NAMES[monthIndex];
  const todayDateOnly = new Date(year, monthIndex, today.getDate());

  const isPastOrToday = (day: number) => new Date(year, monthIndex, day) <= todayDateOnly;

  // yyyy-MM-dd do mês/ano atual em exibição, pra casar com FaltaDTO.data.
  function isoDateFor(day: number): string {
    const mm = String(monthIndex + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }

  const faltaPorDia = new Map(faltas.map((falta) => [falta.data, falta]));
  const statusFor = (day: number): AttendanceStatus | undefined => (faltaPorDia.has(isoDateFor(day)) ? 'absent' : undefined);

  // Somente leitura: mostra a justificativa que o motorista registrou, sem
  // permitir marcar/desmarcar (isso é feito só no painel do motorista).
  function handleDayPress(day: number) {
    const falta = faltaPorDia.get(isoDateFor(day));
    if (!falta) return;
    Alert.alert(`Falta em ${day}/${monthIndex + 1}`, falta.justificativa || 'Sem justificativa registrada.');
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
                enabled={isPastOrToday(item.day)}
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
        isPastOrToday={isPastOrToday}
        onDayPress={handleDayPress}
      />

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
});
