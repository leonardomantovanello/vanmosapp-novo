import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { ModalSheet } from '@/components/ui/ModalSheet';
import { commonStrings } from '@/constants/strings';
import { theme } from '@/constants/theme';

export interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  onProfilePress: () => void;
  onLogoutPress: () => void;
  // Opcional: nem toda tela que usa o SideMenu tem uma área de configurações
  // ainda (só passenger-home por enquanto) — sem isso, o item nem aparece.
  onSettingsPress?: () => void;
}

export function SideMenu({ visible, onClose, onProfilePress, onLogoutPress, onSettingsPress }: SideMenuProps) {
  return (
    <ModalSheet visible={visible} onClose={onClose} align="top-right" closeAccessibilityLabel="Fechar menu">
      <Pressable
        style={styles.item}
        onPress={onProfilePress}
        accessibilityRole="button"
        accessibilityLabel={commonStrings.actions.myProfile}>
        <MaterialIcons name="person" size={20} color={theme.colors.white} />
        <Text style={styles.itemText}>{commonStrings.actions.myProfile}</Text>
      </Pressable>
      {onSettingsPress ? (
        <Pressable
          style={styles.item}
          onPress={onSettingsPress}
          accessibilityRole="button"
          accessibilityLabel={commonStrings.actions.settings}>
          <MaterialIcons name="settings" size={20} color={theme.colors.white} />
          <Text style={styles.itemText}>{commonStrings.actions.settings}</Text>
        </Pressable>
      ) : null}
      <Pressable
        style={styles.item}
        onPress={onLogoutPress}
        accessibilityRole="button"
        accessibilityLabel={commonStrings.actions.logout}>
        <MaterialIcons name="logout" size={20} color={theme.colors.white} />
        <Text style={styles.itemText}>{commonStrings.actions.logout}</Text>
      </Pressable>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md - 2,
    paddingVertical: theme.spacing.md - 2,
  },
  itemText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.lg,
  },
});
