import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayCircle } from '@/components/features/calendar/DayCircle';
import { MonthCalendarModal } from '@/components/features/calendar/MonthCalendarModal';
import { SideMenu } from '@/components/features/home/SideMenu';
import { Avatar } from '@/components/ui/Avatar';
import { commonStrings } from '@/constants/strings';
import { theme } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import type { AttendanceMap } from '@/types';

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
  const [dayStatus, setDayStatus] = useState<AttendanceMap>({});

  const passengerName = session.user?.name ?? 'Passageiro';
  const today = new Date();
  const monthIndex = today.getMonth();
  const year = today.getFullYear();
  const monthName = MONTH_NAMES[monthIndex];
  const todayDateOnly = new Date(year, monthIndex, today.getDate());

  const isPastOrToday = (day: number) => new Date(year, monthIndex, day) <= todayDateOnly;

  const toggleDayStatus = (day: number) => {
    setDayStatus((prev) => {
      const current = prev[day];
      const next = current === undefined ? 'present' : current === 'present' ? 'absent' : undefined;
      const nextState = { ...prev };
      if (next) {
        nextState[day] = next;
      } else {
        delete nextState[day];
      }
      return nextState;
    });
  };

  const absences = Object.values(dayStatus).filter((status) => status === 'absent').length;
  const firstWeekDay = new Date(year, monthIndex, 1).getDay();
  const monthDays = [
    ...Array.from({ length: firstWeekDay }, () => null),
    ...Array.from({ length: new Date(year, monthIndex + 1, 0).getDate() }, (_, index) => {
      const day = index + 1;
      return { day, status: dayStatus[day] };
    }),
  ];

  const weekDays = Array.from({ length: 5 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + index);
    return { day: date.getDate(), status: dayStatus[date.getDate()] };
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
          <Text style={styles.driverStatus}>A caminho</Text>

          <Pressable
            style={styles.addressButton}
            onPress={handleFeatureInDevelopment}
            accessibilityRole="button"
            accessibilityLabel="Ver localização no mapa">
            <MaterialIcons name="place" size={20} color={theme.colors.white} />
            <Text style={styles.addressText}>Rua Madalena</Text>
            <MaterialIcons name="arrow-forward" size={20} color={theme.colors.white} />
          </Pressable>
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
                onPress={() => toggleDayStatus(item.day)}
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
        onToggleDay={toggleDayStatus}
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
          onPress={() => router.push({ pathname: '/chat', params: { contactName: 'Motorista' } })}
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
  driverStatus: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing.xxl,
  },
  addressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.magenta,
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
    width: '100%',
    justifyContent: 'space-between',
  },
  addressText: {
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
