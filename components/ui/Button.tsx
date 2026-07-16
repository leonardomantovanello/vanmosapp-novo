import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { theme } from '@/constants/theme';

type ButtonVariant = 'solid' | 'outline' | 'gradient' | 'ghost';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  gradientColors?: readonly [string, string, ...string[]];
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export function Button({
  title,
  onPress,
  variant = 'solid',
  gradientColors = theme.gradients.action,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? theme.colors.purpleLight : theme.colors.white} />
      ) : (
        <>
          {icon && iconPosition === 'left' ? icon : null}
          <Text style={[styles.text, variant === 'outline' && styles.textOutline, textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' ? icon : null}
        </>
      )}
    </View>
  );

  const pressableStyle = ({ pressed }: { pressed: boolean }) => [
    styles.base,
    variant === 'solid' && styles.solid,
    variant === 'outline' && styles.outline,
    variant === 'ghost' && styles.ghost,
    fullWidth && styles.fullWidth,
    pressed && !isDisabled && styles.pressed,
    isDisabled && styles.disabled,
    style,
  ];

  if (variant === 'gradient') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        hitSlop={8}
        style={({ pressed }) => [fullWidth && styles.fullWidth, pressed && !isDisabled && styles.pressed, isDisabled && styles.disabled, style]}>
        <LinearGradient colors={gradientColors} style={[styles.base, styles.gradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      hitSlop={8}
      style={pressableStyle}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.md,
  },
  gradient: {
    width: '100%',
  },
  solid: {
    backgroundColor: theme.colors.purpleDeep,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: theme.colors.purpleLight,
    backgroundColor: theme.colors.transparent,
  },
  ghost: {
    backgroundColor: theme.colors.transparent,
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  text: {
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.extraBold,
    fontSize: theme.fontSize.lg,
    letterSpacing: 1,
  },
  textOutline: {
    letterSpacing: 3,
  },
});
