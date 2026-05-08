import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DAYS = [
  { day: 1, ok: true },
  { day: 2, ok: true },
  { day: 3, ok: true },
  { day: 4, ok: false },
  { day: 5, ok: true },
];

export default function PassengerHome() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const [menuOpen, setMenuOpen] = useState(false);

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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#cc00ff', '#ff00aa']} style={styles.header}>
          <TouchableOpacity onPress={() => setMenuOpen(true)}>
            <MaterialIcons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={36} color="#fff" />
            </View>
            <Text style={styles.greeting}>Olá, {name || 'Passageiro'}!</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/notifications')}>
            <MaterialIcons name="notifications-none" size={28} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Your Driver */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>YOUR DRIVER</Text>
          <View style={styles.driverAvatar}>
            <MaterialIcons name="person" size={48} color="#fff" />
          </View>
          <Text style={styles.driverStatus}>A caminho</Text>

          <TouchableOpacity style={styles.addressButton}>
            <MaterialIcons name="place" size={20} color="#fff" />
            <Text style={styles.addressText}>Rua Madalena</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Calendar */}
        <View style={styles.section}>
          <MaterialIcons name="schedule" size={28} color="#aaa" style={{ alignSelf: 'center' }} />
          <Text style={styles.monthTitle}>AGOSTO</Text>
          <View style={styles.daysRow}>
            {DAYS.map((item) => (
              <View key={item.day} style={[styles.dayCircle, !item.ok && styles.dayCircleInactive]}>
                <Text style={styles.dayNumber}>{item.day}</Text>
                <MaterialIcons name={item.ok ? 'check' : 'close'} size={14} color="#fff" />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="home" size={26} color="#cc00ff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="schedule" size={26} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="place" size={26} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push({ pathname: '/chat', params: { contactName: 'Motorista' } })}>
          <MaterialIcons name="chat-bubble-outline" size={26} color="#555" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerCenter: {
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    padding: 24,
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: 16,
  },
  driverAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  driverStatus: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 20,
  },
  addressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#cc00ff',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    width: '100%',
    justifyContent: 'space-between',
  },
  addressText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginHorizontal: 24,
  },
  monthTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 2,
    marginVertical: 12,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dayCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#cc00ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleInactive: {
    backgroundColor: '#444',
  },
  dayNumber: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
});
