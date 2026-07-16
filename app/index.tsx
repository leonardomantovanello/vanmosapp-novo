import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#aa00ff', '#ff00cc']} style={[styles.circle, styles.circleTopRight]} />
      <LinearGradient colors={['#6600cc', '#ff00aa']} style={[styles.circle, styles.circleBottomLeft]} />

      <Text style={styles.title}>YOU ARE</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/login', params: { role: 'passenger' } })}>
        <MaterialIcons name="person" size={32} color="#cc44cc" />
        <Text style={styles.buttonText}>PASSENGER</Text>
        <MaterialIcons name="play-arrow" size={24} color="#cc44cc" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/login', params: { role: 'driver' } })}>
        <MaterialIcons name="directions-car" size={32} color="#cc44cc" />
        <Text style={styles.buttonText}>DRIVER</Text>
        <MaterialIcons name="play-arrow" size={24} color="#cc44cc" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  circle: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  circleTopRight: {
    top: -60,
    right: -60,
  },
  circleBottomLeft: {
    bottom: -60,
    left: -60,
  },
  title: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 40,
    letterSpacing: 2,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#cc44cc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    letterSpacing: 2,
  },
});
