import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

export interface HeaderProps {
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
  center?: ReactNode;
  variant?: 'plain' | 'gradient';
  gradientColors?: readonly [string, string, ...string[]];
  backAccessibilityLabel?: string;
}

export function Header({
  title,
  onBack,
  right,
  center,
  variant = 'plain',
  gradientColors = theme.gradients.header,
  backAccessibilityLabel = 'Voltar',
}: HeaderProps) {
  const content = (
    <View style={styles.row}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          hitSlop={12}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={backAccessibilityLabel}>
          <MaterialIcons name="arrow-back-ios" size={22} color={variant === 'gradient' ? theme.colors.white : theme.colors.purpleAlt} />
        </Pressable>
      ) : (
        <View style={styles.backButton} />
      )}

      {center ?? (title ? <Text style={[styles.title, variant === 'gradient' && styles.titleGradient]}>{title}</Text> : null)}

      <View style={styles.rightSlot}>{right}</View>
    </View>
  );

  if (variant === 'gradient') {
    return <LinearGradient colors={gradientColors} style={styles.gradientContainer}>{content}</LinearGradient>;
  }

  return <View style={styles.plainContainer}>{content}</View>;
}

const styles = StyleSheet.create({
  plainContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxxl + theme.spacing.xxl,
    paddingBottom: theme.spacing.lg,
  },
  gradientContainer: {
    paddingTop: theme.spacing.xxxl + theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl + theme.spacing.xs,
    paddingHorizontal: theme.spacing.xl,
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSlot: {
    minWidth: 36,
    alignItems: 'flex-end',
  },
  title: {
    color: theme.colors.purpleAlt,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
  },
  titleGradient: {
    color: theme.colors.white,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.black,
    letterSpacing: 2,
  },
});
