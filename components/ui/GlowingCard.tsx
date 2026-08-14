import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';

import { usePulse } from '@/hooks/use-pulse';

export interface GlowingCardProps {
  children: ReactNode;
  glowColor?: string;
  borderColorFrom?: string;
  borderColorTo?: string;
  style?: StyleProp<ViewStyle>;
  cardStyle?: StyleProp<ViewStyle>;
}

// Card com um brilho (sombra + borda) que pulsa devagar, tipo uma
// "lightbar" respirando — sombra e borda animam em sincronia pra dar a
// impressão de uma luz só, não dois efeitos separados. Usado em telas com o
// mesmo visual roxo/magenta do login.
export function GlowingCard({
  children,
  glowColor = 'rgba(204,0,255,1)',
  borderColorFrom = 'rgba(204,68,204,0.2)',
  borderColorTo = 'rgba(255,102,255,0.75)',
  style,
  cardStyle,
}: GlowingCardProps) {
  const glow = usePulse(2400);

  const shadowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.3 + glow.value * 0.4,
    shadowRadius: 20 + glow.value * 18,
  }));

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(glow.value, [0, 1], [borderColorFrom, borderColorTo]),
  }));

  return (
    <Animated.View style={[styles.shadow, { shadowColor: glowColor }, style, shadowStyle]}>
      <Animated.View style={[styles.card, cardStyle, borderStyle]}>{children}</Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  card: {
    borderWidth: 1,
  },
});
