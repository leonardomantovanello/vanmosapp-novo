import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { MessageBubble } from '@/components/features/chat/MessageBubble';
import { EmptyState } from '@/components/ui/EmptyState';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { commonStrings } from '@/constants/strings';
import { theme } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { getMessages, sendMessage, toChatMessage } from '@/services/messageService';
import { subscribeTopic } from '@/services/realtime/stompClient';
import type { ChatMessage } from '@/types';
import type { MensagemDTO } from '@/types/api';

export default function Chat() {
  const router = useRouter();
  const session = useSession();
  const { contactName, alunoId: alunoIdParam } = useLocalSearchParams<{ contactName?: string; alunoId?: string }>();
  const contact = contactName || 'Contato';
  const alunoId = Number(alunoIdParam);
  const currentUserId = session.user?.id ?? 0;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (!alunoId) return;
    getMessages(alunoId, currentUserId).then(setMessages);
  }, [alunoId, currentUserId]);

  // Entrega em tempo real: assina o tópico STOMP da conversa deste aluno.
  // O envio continua sendo por REST (handleSend abaixo) — o backend publica
  // no tópico depois de persistir, então tanto quem manda quanto quem
  // recebe veem a mensagem chegar por aqui, sem duplicar lógica de envio.
  useEffect(() => {
    if (!alunoId) return;
    const unsubscribe = subscribeTopic<MensagemDTO>(`/topic/mensagens/aluno/${alunoId}`, (mensagem) => {
      const chatMessage = toChatMessage(mensagem, currentUserId);
      setMessages((prev) => (prev.some((m) => m.id === chatMessage.id) ? prev : [...prev, chatMessage]));
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return unsubscribe;
  }, [alunoId, currentUserId]);

  async function handleSend() {
    if (!text.trim() || !alunoId) return;
    await sendMessage(alunoId, currentUserId, text.trim());
    setText('');
  }

  function handleFeatureInDevelopment() {
    Alert.alert('Em breve', commonStrings.feedback.featureInDevelopment);
  }

  return (
    <Screen keyboardAvoiding contentContainerStyle={styles.container}>
      <Header
        onBack={() => router.back()}
        center={
          <View style={styles.headerCenter}>
            <MaterialIcons name="account-circle" size={36} color={theme.colors.textMuted} />
            <Text style={styles.headerName}>{contact}</Text>
          </View>
        }
      />

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        renderItem={({ item }) => <MessageBubble message={item} />}
        ListEmptyComponent={<EmptyState icon="chat-bubble-outline" title="Nenhuma mensagem ainda" description="Envie a primeira mensagem para iniciar a conversa." />}
      />

      <View style={styles.inputRow}>
        <Pressable onPress={handleFeatureInDevelopment} hitSlop={8} accessibilityRole="button" accessibilityLabel="Enviar emoji">
          <MaterialIcons name="sentiment-satisfied" size={26} color={theme.colors.textMuted} />
        </Pressable>
        <TextInput
          style={styles.input}
          placeholder="Enviar mensagem"
          placeholderTextColor={theme.colors.textDim}
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSend}
          accessibilityLabel="Campo de mensagem"
        />
        <Pressable onPress={handleFeatureInDevelopment} hitSlop={8} accessibilityRole="button" accessibilityLabel="Anexar arquivo">
          <MaterialIcons name="attach-file" size={24} color={theme.colors.textMuted} />
        </Pressable>
        <Pressable onPress={handleFeatureInDevelopment} hitSlop={8} accessibilityRole="button" accessibilityLabel="Tirar foto">
          <MaterialIcons name="camera-alt" size={24} color={theme.colors.textMuted} />
        </Pressable>
        <Pressable
          style={styles.sendButton}
          onPress={text.trim() ? handleSend : handleFeatureInDevelopment}
          accessibilityRole="button"
          accessibilityLabel={text.trim() ? 'Enviar mensagem' : 'Gravar áudio'}>
          <MaterialIcons name={text.trim() ? 'send' : 'mic'} size={24} color={theme.colors.white} />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm + 2,
  },
  headerName: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
  },
  messagesList: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceCard,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    gap: theme.spacing.md - 2,
  },
  input: {
    flex: 1,
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    paddingVertical: theme.spacing.xs + 2,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
