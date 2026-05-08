import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterPassenger() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSignUp() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Preencha todos os campos.');
      return;
    }
    setError('');
    router.push({ pathname: '/login', params: { role: 'passenger' } });
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#aa00ff', '#ff00cc']} style={styles.circle} />

      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>CREATE{'\n'}ACCOUNT</Text>
      <Text style={styles.subtitle}>Passenger</Text>

      <TextInput style={styles.input} placeholder="Name" placeholderTextColor="#888" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email or phone" placeholderTextColor="#888" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#888" secureTextEntry value={password} onChangeText={setPassword} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign up</Text>
        <MaterialIcons name="arrow-forward" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  circle: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    top: -80,
    left: -60,
  },
  back: {
    marginBottom: 60,
  },
  title: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  subtitle: {
    color: '#cc44cc',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 40,
    letterSpacing: 1,
  },
  input: {
    color: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 28,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#6600cc',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    marginTop: 20,
  },
  error: {
    color: '#ff4444',
    fontSize: 13,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
});
