import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

export interface EmptyStateProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description?: string;
}

export function EmptyState({ icon = 'info-outline', title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <MaterialIcons name={icon} size={32} color={theme.colors.textFaint} />
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxxl,
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    textAlign: 'center',
  },
  description: {
    color: theme.colors.textFaint,
    fontSize: theme.fontSize.xs,
    textAlign: 'center',
  },
});
