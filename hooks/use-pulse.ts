import { useEffect } from 'react';
import { Easing, useSharedValue, withRepeat, withTiming, type SharedValue } from 'react-native-reanimated';

// Valor 0 -> 1 -> 0 continuamente, tipo uma "respiração" — base pra
// qualquer efeito de pulso (sombra, cor de borda, escala etc.). Cada
// useAnimatedStyle que consumir isso decide o que fazer com o valor.
export function usePulse(duration = 2400): SharedValue<number> {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true);
    // duration só é lido na primeira montagem — mudar em runtime não
    // reinicia a animação, o que é intencional (evita reiniciar o pulso a
    // cada re-render por outro motivo).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return progress;
}
