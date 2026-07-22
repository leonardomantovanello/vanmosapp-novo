import { MaterialIcons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { theme } from '@/constants/theme';
import type { RouteStop } from '@/types';

export interface RouteTimelineProps {
  stops: RouteStop[];
  onRemove?: (id: string) => void;
}

export function RouteTimeline({ stops, onRemove }: RouteTimelineProps) {
  return (
    <View style={styles.container}>
      {stops.length === 0 ? (
        <EmptyState title="Nenhuma rota adicionada" />
      ) : (
        <FlatList
          data={stops}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item, index }) => (
            <View style={styles.item}>
              <View style={styles.dotLine}>
                <View style={[styles.dot, index === 0 && styles.dotActive]} />
                {index < stops.length - 1 && <View style={styles.line} />}
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.nome}</Text>
                {item.enderecoEmbarque ? (
                  <Text style={styles.address}>{item.enderecoEmbarque}</Text>
                ) : null}
              </View>
              {onRemove ? (
                <Pressable
                  onPress={() => onRemove(item.id)}
                  hitSlop={8}
                  accessibilityLabel={`Remover ${item.nome} da rota`}>
                  <MaterialIcons name="close" size={18} color={theme.colors.textMuted} />
                </Pressable>
              ) : null}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 120,
    justifyContent: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  dotLine: {
    alignItems: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.purpleAlt,
    backgroundColor: theme.colors.background,
  },
  dotActive: {
    backgroundColor: theme.colors.purpleAlt,
  },
  line: {
    width: 2,
    height: 32,
    backgroundColor: theme.colors.purpleAlt,
  },
  info: {
    flex: 1,
  },
  name: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    paddingTop: 2,
  },
  address: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
    marginTop: 2,
  },
});
