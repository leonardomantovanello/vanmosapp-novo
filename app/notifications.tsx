import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { FloatingCircle, GLOW_COLORS } from '@/components/ui/FloatingCircle';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { theme } from '@/constants/theme';
import { getNotifications } from '@/services/notificationService';
import type { AppNotification } from '@/types';

export default function Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications().then((data) => {
      setNotifications(data);
      setLoading(false);
    });
  }, []);

  return (
    <Screen
      contentContainerStyle={styles.container}
      decorations={
        <>
          <FloatingCircle colors={GLOW_COLORS.violet} style={styles.circleTopRight} driftX={16} driftY={12} duration={5600} />
          <FloatingCircle colors={GLOW_COLORS.pink} style={styles.circleBottomLeft} driftX={-14} driftY={16} duration={6800} />
        </>
      }>
      <Header variant="gradient" gradientColors={theme.gradients.header} title="NOTIFICAÇÕES" onBack={() => router.back()} />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.item, !item.read && styles.itemUnread]}>
            <View style={[styles.iconBadge, !item.read && styles.iconBadgeUnread]}>
              <MaterialIcons
                name="notifications"
                size={22}
                color={item.read ? theme.colors.textFaint : theme.colors.purpleLight}
              />
            </View>
            <View style={styles.itemBody}>
              <Text style={[styles.message, !item.read && styles.messageUnread]}>{item.message}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
            {!item.read ? <View style={styles.unreadDot} /> : null}
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !loading ? <EmptyState icon="notifications-none" title="Nenhuma notificação por aqui" /> : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  circleTopRight: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    top: 60,
    right: -40,
    overflow: 'hidden',
  },
  circleBottomLeft: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    bottom: 100,
    left: -40,
    overflow: 'hidden',
  },
  list: {
    padding: theme.spacing.xl,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(204,68,204,0.15)',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  itemUnread: {
    borderColor: 'rgba(170,68,255,0.4)',
    backgroundColor: theme.colors.surfaceElevated,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: theme.colors.borderMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeUnread: {
    backgroundColor: 'rgba(170,68,255,0.14)',
    borderColor: 'rgba(170,68,255,0.35)',
  },
  itemBody: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  message: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    lineHeight: 20,
  },
  messageUnread: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.semibold,
  },
  date: {
    color: theme.colors.textFaint,
    fontSize: theme.fontSize.xs,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: theme.colors.magenta,
  },
  separator: {
    height: theme.spacing.md,
  },
});
