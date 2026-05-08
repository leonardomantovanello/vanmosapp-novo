import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const NOTIFICATIONS = [
  { id: '1', message: 'Seu motorista chegou', date: '14/07', read: false },
  { id: '2', message: 'Seu motorista está quase chegando', date: '14/07', read: false },
  { id: '3', message: 'Vc foi adicionado em uma turma', date: '14/07', read: false },
  { id: '4', message: 'Nova mensagem', date: '14/07', read: false },
  { id: '5', message: 'Horário determinado', date: '14/07', read: false },
  { id: '6', message: 'Novo contato', date: '14/07', read: true },
  { id: '7', message: 'Novo contato', date: '14/07', read: true },
];

export default function Notifications() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={22} color="#aa44ff" />
        </TouchableOpacity>
        <Text style={styles.title}>Notificações</Text>
      </View>

      <FlatList
        data={NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={28} color="#fff" />
            </View>
            <Text style={styles.message}>{item.message}</Text>
            <View style={styles.right}>
              <Text style={styles.date}>{item.date}</Text>
              <View style={[styles.dot, item.read && styles.dotRead]} />
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  title: {
    color: '#aa44ff',
    fontSize: 18,
    fontWeight: '700',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
  },
  date: {
    color: '#888',
    fontSize: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff8800',
  },
  dotRead: {
    backgroundColor: '#555',
  },
  separator: {
    height: 1,
    backgroundColor: '#222',
    marginHorizontal: 20,
  },
});
