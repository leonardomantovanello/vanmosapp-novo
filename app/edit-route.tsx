import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Route = {
  id: string;
  nome: string;
  cep: string;
  numero: string;
  referencia: string;
  parada: string;
};

export default function EditRoute() {
  const router = useRouter();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [nome, setNome] = useState('');
  const [cep, setCep] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [numero, setNumero] = useState('');
  const [referencia, setReferencia] = useState('');
  const [parada, setParada] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);

  async function handleCepChange(value: string) {
    setCep(value);
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 8) {
      setLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setNome(data.logradouro || '');
          setBairro(data.bairro || '');
          setCidade(data.localidade || '');
        }
      } catch {}
      setLoadingCep(false);
    }
  }

  function handleAdd() {
    if (!nome.trim()) return;
    setRoutes((prev) => [...prev, { id: Date.now().toString(), nome, cep, numero, referencia, parada }]);
    setNome(''); setCep(''); setBairro(''); setCidade(''); setNumero(''); setReferencia(''); setParada('');
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back-ios" size={22} color="#aa44ff" />
      </TouchableOpacity>

      {/* Rotas adicionadas */}
      <View style={styles.routeList}>
        {routes.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma rota adicionada</Text>
        ) : (
          <FlatList
            data={routes}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View style={styles.routeItem}>
                <View style={styles.dotLine}>
                  <View style={[styles.dot, index === 0 && styles.dotActive]} />
                  {index < routes.length - 1 && <View style={styles.line} />}
                </View>
                <Text style={styles.routeName}>{item.nome}</Text>
              </View>
            )}
          />
        )}
        <View style={styles.addDot}>
          <MaterialIcons name="add" size={20} color="#fff" />
        </View>
      </View>

      <View style={styles.divider} />

      {/* Formulário */}
      <View style={styles.form}>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Nome</Text>
          <TextInput style={styles.input} placeholderTextColor="#555" value={nome} onChangeText={setNome} />
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Cep</Text>
          <View style={styles.cepContainer}>
            <TextInput style={styles.cepInput} placeholderTextColor="#555" keyboardType="numeric" value={cep} onChangeText={handleCepChange} maxLength={9} />
            {loadingCep && <Text style={styles.hint}>Buscando...</Text>}
            {bairro ? <Text style={styles.hint}>{bairro} - {cidade}</Text> : null}
          </View>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Nº casa</Text>
          <TextInput style={[styles.input, styles.inputSmall]} placeholderTextColor="#555" keyboardType="numeric" value={numero} onChangeText={setNumero} />
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Ponto de{'\n'}referência</Text>
          <TextInput style={styles.input} placeholderTextColor="#555" value={referencia} onChangeText={setReferencia} />
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Parada</Text>
          <TextInput style={styles.input} placeholderTextColor="#555" value={parada} onChangeText={setParada} />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Adicionar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  back: {
    marginBottom: 20,
  },
  routeList: {
    minHeight: 120,
    justifyContent: 'center',
  },
  emptyText: {
    color: '#555',
    fontSize: 13,
    marginBottom: 12,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 4,
  },
  dotLine: {
    alignItems: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#aa44ff',
    backgroundColor: '#0d0d0d',
  },
  dotActive: {
    backgroundColor: '#aa44ff',
  },
  line: {
    width: 2,
    height: 32,
    backgroundColor: '#aa44ff',
  },
  routeName: {
    color: '#fff',
    fontSize: 14,
    paddingTop: 2,
  },
  addDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#aa44ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#222',
    marginVertical: 20,
  },
  form: {
    gap: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    color: '#aaa',
    fontSize: 13,
    width: 80,
    textAlign: 'right',
  },
  input: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 14,
  },
  inputSmall: {
    flex: 0,
    width: 80,
    minWidth: 80,
  },
  addButton: {
    backgroundColor: '#aa00ff',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  cepContainer: {
    flex: 1,
    gap: 4,
  },
  cepInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 14,
  },
  hint: {
    color: '#aa44ff',
    fontSize: 12,
    marginTop: 4,
  },
});
