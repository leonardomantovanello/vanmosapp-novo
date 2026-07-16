import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
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
    <Screen contentContainerStyle={styles.container}>
      <Header title="Notificações" onBack={() => router.back()} />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Avatar size={48} iconSize={28} />
            <Text style={styles.message}>{item.message}</Text>
            <View style={styles.right}>
              <Text style={styles.date}>{item.date}</Text>
              <View style={[styles.dot, item.read && styles.dotRead]} />
            </View>
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
  list: {
    paddingHorizontal: theme.spacing.xl,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md + 2,
  },
  message: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    flex: 1,
  },
  right: {
    alignItems: 'flex-end',
    gap: theme.spacing.xs + 2,
  },
  date: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.warning,
  },
  dotRead: {
    backgroundColor: theme.colors.textFaint,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.divider,
  },
});
