import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PASSENGERS = [
  { id: '1', name: 'Emily Carter' },
  { id: '2', name: 'Jhon Smith' },
  { id: '3', name: 'Trevor Jamal' },
];

export default function DriverHome() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = PASSENGERS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Menu Burger Modal */}
      <Modal visible={menuOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setMenuOpen(false)}>
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); router.replace('/'); }}>
              <MaterialIcons name="logout" size={20} color="#fff" />
              <Text style={styles.menuItemText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuOpen(true)}>
          <MaterialIcons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.notifButton}>
          <MaterialIcons name="notifications" size={26} color="#fff" />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      {/* Greeting */}
      <View style={styles.greetingRow}>
        <View style={styles.avatar}>
          <MaterialIcons name="person" size={40} color="#fff" />
        </View>
        <View>
          <Text style={styles.greetingTop}>BOM DIA</Text>
          <Text style={styles.greetingName}>{(name || 'Motorista').toUpperCase()}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButtonDark} onPress={() => router.push('/edit-route')}>
          <MaterialIcons name="edit" size={28} color="#fff" />
          <Text style={styles.actionText}>Editar corrida</Text>
        </TouchableOpacity>
        <LinearGradient colors={['#cc00ff', '#ff00aa']} style={styles.actionButtonGradient}>
          <TouchableOpacity style={styles.actionButtonInner}>
            <MaterialIcons name="place" size={28} color="#fff" />
            <Text style={styles.actionText}>começar</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Passengers */}
      <Text style={styles.sectionTitle}>PASSENGERS</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
        />
        <MaterialIcons name="search" size={22} color="#888" />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.passengerItem}
            onPress={() => router.push({ pathname: '/chat', params: { contactName: item.name } })}
          >
            <View style={styles.passengerAvatar}>
              <MaterialIcons name="person" size={28} color="#fff" />
            </View>
            <Text style={styles.passengerName}>{item.name.toUpperCase()}</Text>
            <MaterialIcons name="arrow-forward-ios" size={18} color="#fff" />
          </TouchableOpacity>
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
    paddingHorizontal: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  menu: {
    backgroundColor: '#1a1a1a',
    width: 180,
    margin: 20,
    marginTop: 60,
    borderRadius: 12,
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  menuItemText: {
    color: '#fff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  notifButton: {
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff8800',
    top: 0,
    right: 0,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 28,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingTop: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  greetingName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 28,
  },
  actionButtonDark: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  actionButtonGradient: {
    flex: 1,
    borderRadius: 16,
  },
  actionButtonInner: {
    padding: 20,
    gap: 8,
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 2,
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
  },
  list: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
  },
  passengerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  passengerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passengerName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    flex: 1,
    letterSpacing: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    marginHorizontal: 16,
  },
});
