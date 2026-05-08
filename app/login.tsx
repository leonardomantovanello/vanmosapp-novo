import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Login() {
  const router = useRouter();
  const { name, role } = useLocalSearchParams<{ name: string; role: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleGo() {
    if (!email.trim() || !password.trim()) {
      setError('Preencha todos os campos.');
      return;
    }
    setError('');
    if (role === 'driver') {
      router.push({ pathname: '/driver-home', params: { name } });
    } else {
      router.push({ pathname: '/passenger-home', params: { name } });
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#aa00ff', '#cc00ff']} style={styles.circleTopRight} />
      <LinearGradient colors={['#aa00ff', '#ff00cc']} style={styles.circleBottomLeft} />
      <LinearGradient colors={['#ff00aa', '#ff44cc']} style={styles.circleBottomRight} />

      <Text style={styles.header}>login</Text>

      <View style={styles.card}>
        <Image source={require('@/assets/images/logo vanmos.png')} style={styles.logo} resizeMode="contain" />

        <Text style={styles.label}>EMAIL</Text>
        <TextInput style={styles.input} placeholderTextColor="#555" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />

        <Text style={styles.label}>PASSWORD</Text>
        <TextInput style={styles.input} placeholderTextColor="#555" secureTextEntry value={password} onChangeText={setPassword} />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.goButton} onPress={handleGo}>
          <Text style={styles.goText}>GO</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>or sing in with</Text>

        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialIcon}>G</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialIcon}>f</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push({ pathname: role === 'driver' ? '/register-driver' : '/register-passenger', params: { role } })}>
          <Text style={styles.accountText}>Não tem conta? <Text style={{ color: '#cc44cc' }}>Cadastrar</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleTopRight: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -30,
    right: -30,
  },
  circleBottomLeft: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    bottom: 40,
    left: -40,
  },
  circleBottomRight: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    bottom: 80,
    right: -20,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 32,
    color: '#888',
    fontSize: 16,
  },
  card: {
    width: '80%',
    backgroundColor: 'rgba(30,10,50,0.85)',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  label: {
    alignSelf: 'flex-start',
    color: '#aaa',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    color: '#fff',
    paddingVertical: 8,
    marginBottom: 24,
    fontSize: 16,
  },
  goButton: {
    borderWidth: 1.5,
    borderColor: '#cc44cc',
    borderRadius: 30,
    paddingHorizontal: 48,
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  goText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 4,
  },
  orText: {
    color: '#888',
    fontSize: 13,
    marginBottom: 16,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 28,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6600cc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#aa44ff',
  },
  socialIcon: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
  },
  accountText: {
    color: '#aaa',
    fontSize: 13,
  },
  error: {
    color: '#ff4444',
    fontSize: 13,
    marginBottom: 8,
  },
});
