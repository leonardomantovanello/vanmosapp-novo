import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

// Gradientes com o último stop transparente — em vez de um degradê neon
// sólido e chapado (duro contra fundos escuros), a bolha se dissolve
// suavemente nas bordas, como um brilho difuso.
export const GLOW_COLORS = {
  purple: ['rgba(153,51,214,0.8)', 'rgba(187,51,214,0.45)', 'rgba(187,51,214,0)'] as const,
  violet: ['rgba(140,51,214,0.75)', 'rgba(214,51,163,0.4)', 'rgba(214,51,163,0)'] as const,
  pink: ['rgba(214,51,133,0.75)', 'rgba(214,89,163,0.4)', 'rgba(214,89,163,0)'] as const,
};

export interface FloatingCircleProps {
  colors: readonly [string, string, ...string[]];
  style: StyleProp<ViewStyle>;
  driftX?: number;
  driftY?: number;
  duration?: number;
}

// Bolha decorativa com um vaivém suave e contínuo (translateX/Y oscilando
// via Reanimated) — cada instância deve usar amplitude/duração diferentes
// pra não ficarem sincronizadas, dando uma sensação mais orgânica.
//
// `style` precisa incluir position/width/height/borderRadius (e
// overflow: 'hidden', pra recortar o gradiente no formato do círculo).
export function FloatingCircle({ colors, style, driftX = 16, driftY = 16, duration = 5000 }: FloatingCircleProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [duration, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: (progress.value - 0.5) * 2 * driftX },
      { translateY: (progress.value - 0.5) * 2 * driftY },
    ],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      <LinearGradient colors={colors} style={styles.fill} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    width: '100%',
    height: '100%',
  },
});
