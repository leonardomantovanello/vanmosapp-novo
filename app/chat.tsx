import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const INITIAL_MESSAGES: { id: string; text: string; mine: boolean }[] = [];

export default function Chat() {
  const router = useRouter();
  const { contactName } = useLocalSearchParams<{ contactName: string }>();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  function sendMessage() {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), text: text.trim(), mine: true }]);
    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={22} color="#aa44ff" />
        </TouchableOpacity>
        <MaterialIcons name="account-circle" size={36} color="#888" />
        <Text style={styles.headerName}>{contactName || 'Contato'}</Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.mine ? styles.bubbleMine : styles.bubbleOther]}>
            <Text style={styles.bubbleText}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <MaterialIcons name="sentiment-satisfied" size={26} color="#888" />
        <TextInput
          style={styles.input}
          placeholder="Send a message"
          placeholderTextColor="#666"
          value={text}
          onChangeText={setText}
          onSubmitEditing={sendMessage}
        />
        <MaterialIcons name="attach-file" size={24} color="#888" />
        <MaterialIcons name="camera-alt" size={24} color="#888" />
        <TouchableOpacity style={styles.micButton} onPress={sendMessage}>
          <MaterialIcons name={text.trim() ? 'send' : 'mic'} size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  messagesList: {
    padding: 16,
    gap: 12,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
  },
  bubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: '#cc00ff',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: '#2a2a2a',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    paddingVertical: 6,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#aa00ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
