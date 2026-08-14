import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { theme } from '@/constants/theme';

export interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  keyboardAvoiding?: boolean;
  backgroundColor?: string;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  // Renderizado fora do ScrollView, como pano de fundo fixo — pensado pra
  // FloatingCircle/etc, que precisam de posicionamento absoluto sem rolar
  // junto com o conteúdo (um ScrollView recorta filhos posicionados fora
  // dos próprios limites, ver a mesma lição em app/profile.tsx).
  decorations?: ReactNode;
}

export function Screen({
  children,
  scroll = false,
  keyboardAvoiding = false,
  backgroundColor = theme.colors.background,
  edges = ['top', 'bottom', 'left', 'right'],
  style,
  contentContainerStyle,
  decorations,
}: ScreenProps) {
  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, contentContainerStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor }, style]} edges={edges}>
      {decorations}
      {keyboardAvoiding ? (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
