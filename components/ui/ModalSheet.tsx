import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

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
      {/* KeyboardAvoidingView: sem isso, o teclado empurrava/cortava o
          painel centralizado quando o campo de texto ganhava foco (ver
          TextField dentro do modal de marcar falta em passenger-home.tsx).
          O Modal nativo do RN abre em sua própria hierarquia de janela, que
          não recebe o ajuste automático de resize da tela principal, tanto
          no iOS ("padding") quanto no Android ("height"). */}
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable
          style={[styles.overlay, align === 'top-right' ? styles.overlayTopRight : styles.overlayCenter]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={closeAccessibilityLabel}>
          {/* Pressable com onPress vazio (não Fragment/View comum): sem
              isso, um toque em QUALQUER lugar do painel — inclusive no
              campo de texto — "vazava" pro Pressable do overlay acima e
              fechava o modal, porque um View simples não reivindica o
              toque no sistema de responder do RN. */}
          <Pressable
            style={[align === 'top-right' ? styles.panelTopRight : styles.panelCenter, contentStyle]}
            onPress={() => {}}>
            {children}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
  },
  // Centraliza o painel verticalmente — sem isso, o overlay (flex:1, sem
  // justifyContent) deixava o painel colado no topo da tela, cortado
  // quando o teclado abria. Não mexe em alignItems: o painel continua
  // largo por causa do marginHorizontal em panelCenter (alignItems:stretch
  // é o default), então essa mudança só afeta a posição vertical.
  overlayCenter: {
    justifyContent: 'center',
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
