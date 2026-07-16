import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { theme } from '@/constants/theme';

export interface ModalSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  align?: 'top-right' | 'center';
  contentStyle?: StyleProp<ViewStyle>;
  closeAccessibilityLabel?: string;
}

export function ModalSheet({
  visible,
  onClose,
  children,
  align = 'center',
  contentStyle,
  closeAccessibilityLabel = 'Fechar',
}: ModalSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[styles.overlay, align === 'top-right' && styles.overlayTopRight]}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={closeAccessibilityLabel}>
        <View style={[align === 'top-right' ? styles.panelTopRight : styles.panelCenter, contentStyle]}>{children}</View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
  },
  overlayTopRight: {
    backgroundColor: theme.colors.overlay,
  },
  panelTopRight: {
    backgroundColor: theme.colors.surfaceCard,
    width: 180,
    margin: theme.spacing.xl,
    marginTop: 60,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
  },
  panelCenter: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.xxl,
    padding: theme.spacing.xl,
    marginHorizontal: theme.spacing.xxl,
    shadowColor: theme.colors.black,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
});
