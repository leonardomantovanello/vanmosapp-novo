import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '@/constants/theme';
import type { AttendanceStatus } from '@/types';

export interface DayCircleProps {
  day: number;
  status?: AttendanceStatus;
  enabled: boolean;
  onPress: () => void;
  size?: number;
}

export function DayCircle({ day, status, enabled, onPress, size = 52 }: DayCircleProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!enabled}
      accessibilityRole="button"
      accessibilityLabel={`Dia ${day}${status === 'present' ? ', presente' : status === 'absent' ? ', falta' : ''}`}
      accessibilityState={{ disabled: !enabled }}
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2 },
        status === 'present' && styles.present,
        status === 'absent' && styles.absent,
        !enabled && styles.disabled,
      ]}>
      <Text style={[styles.number, !enabled && styles.numberDisabled]}>{day}</Text>
      {status ? <MaterialIcons name={status === 'present' ? 'check' : 'close'} size={size <= 44 ? 12 : 14} color={theme.colors.white} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  present: {
    backgroundColor: theme.colors.magenta,
  },
  absent: {
    backgroundColor: theme.colors.dangerStrong,
  },
  disabled: {
    backgroundColor: theme.colors.surfaceElevated,
  },
  number: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.extraBold,
    fontSize: theme.fontSize.md,
  },
  numberDisabled: {
    color: theme.colors.textDim,
  },
});
