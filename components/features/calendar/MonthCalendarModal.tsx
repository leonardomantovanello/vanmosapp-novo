import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DayCircle } from '@/components/features/calendar/DayCircle';
import { ModalSheet } from '@/components/ui/ModalSheet';
import { theme } from '@/constants/theme';
import type { AttendanceStatus } from '@/types';

export interface MonthCalendarModalProps {
  visible: boolean;
  onClose: () => void;
  monthName: string;
  year: number;
  weekDays: string[];
  absences: number;
  monthDays: ({ day: number; status?: AttendanceStatus } | null)[];
  isDayEnabled: (day: number) => boolean;
  onDayPress: (day: number) => void;
}

export function MonthCalendarModal({
  visible,
  onClose,
  monthName,
  year,
  weekDays,
  absences,
  monthDays,
  isDayEnabled,
  onDayPress,
}: MonthCalendarModalProps) {
  return (
    <ModalSheet visible={visible} onClose={onClose} closeAccessibilityLabel="Fechar calendário">
      <View style={styles.header}>
        <Text style={styles.title}>{monthName} {year}</Text>
        <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Fechar">
          <MaterialIcons name="close" size={24} color={theme.colors.white} />
        </Pressable>
      </View>

      <View style={styles.summary}>
        <View style={styles.badge}>
          <MaterialIcons name="error-outline" size={16} color={theme.colors.white} />
          <Text style={styles.badgeText}>
            {absences} falta{absences === 1 ? '' : 's'} no mês
          </Text>
        </View>
      </View>

      <View style={styles.weekDayRow}>
        {weekDays.map((label, index) => (
          <Text key={`${label}-${index}`} style={styles.weekDayLabel}>{label}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {monthDays.map((item, index) =>
          item ? (
            <DayCircle
              key={item.day}
              day={item.day}
              status={item.status}
              enabled={isDayEnabled(item.day)}
              onPress={() => onDayPress(item.day)}
              size={44}
            />
          ) : (
            <View key={`empty-${index}`} style={styles.emptyDay} />
          )
        )}
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    color: theme.colors.white,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.extraBold,
    letterSpacing: 1.5,
  },
  summary: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.dangerStrong,
    paddingHorizontal: theme.spacing.lg - 2,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.xl,
  },
  badgeText: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.sm,
  },
  weekDayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    justifyContent: 'flex-start',
  },
  emptyDay: {
    width: 44,
    height: 44,
    marginBottom: theme.spacing.md - 2,
  },
});
