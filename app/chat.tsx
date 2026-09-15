import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { formatDuration } from '@/components/features/chat/AudioMessagePlayer';
import { MessageBubble } from '@/components/features/chat/MessageBubble';
import { EmptyState } from '@/components/ui/EmptyState';
import { FloatingCircle, GLOW_COLORS } from '@/components/ui/FloatingCircle';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { commonStrings } from '@/constants/strings';
import { theme } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { getMessages, sendMessage, toChatMessage } from '@/services/messageService';
import { subscribeTopic } from '@/services/realtime/stompClient';
import { AttachmentTooLargeError, readUriAsDataUri } from '@/utils/attachments';
import { guessMimeType } from '@/utils/mime';
import type { ChatMessage, ChatMessageType } from '@/types';
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
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);

  useEffect(() => {
    if (!alunoId) return;
    getMessages(alunoId, currentUserId).then(setMessages).catch(() => {});
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
    const messageText = text.trim();
    try {
      // Não depende só do eco via STOMP pra mostrar a própria mensagem — se
      // a conexão em tempo real cair ou nunca tiver conectado (ver
      // subscribeTopic, que vira no-op sem client), a mensagem já fica
      // salva no backend mas nunca aparecia na tela de quem enviou. O dedup
      // por id no efeito do STOMP acima evita duplicar quando o eco chega.
      const sent = await sendMessage(alunoId, currentUserId, messageText);
      setMessages((prev) => (prev.some((m) => m.id === sent.id) ? prev : [...prev, sent]));
      setText('');
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível enviar a mensagem.');
    }
  }

  async function handleSendAttachment(tipo: ChatMessageType, uri: string, name: string, mimeTypeHint?: string) {
    if (!alunoId) return;
    setSending(true);
    try {
      const anexoBase64 = await readUriAsDataUri(uri, name, mimeTypeHint);
      const sent = await sendMessage(alunoId, currentUserId, { tipo, anexoBase64, anexoNome: name });
      setMessages((prev) => (prev.some((m) => m.id === sent.id) ? prev : [...prev, sent]));
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      if (error instanceof AttachmentTooLargeError) {
        Alert.alert('Arquivo muito grande', error.message);
      } else {
        Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível enviar o anexo.');
      }
    } finally {
      setSending(false);
    }
  }

  async function handleStartRecording() {
    if (sending || recorderState.isRecording) return;
    if (Platform.OS === 'web') {
      Alert.alert('Indisponível', 'A gravação de áudio não é suportada no navegador. Use o aplicativo instalado no celular.');
      return;
    }
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso ao microfone para gravar áudios.');
      return;
    }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
  }

  async function handleStopAndSendRecording() {
    if (!recorderState.isRecording) return;
    await recorder.stop();
    const uri = recorder.uri;
    if (!uri) return;
    await handleSendAttachment('AUDIO', uri, `audio-${Date.now()}.m4a`, 'audio/mp4');
  }

  async function handleCancelRecording() {
    if (!recorderState.isRecording) return;
    await recorder.stop();
  }

  function handleMicOrSendPress() {
    if (text.trim()) {
      handleSend();
      return;
    }
    handleStartRecording();
  }

  async function handleCameraPress() {
    if (sending || recorderState.isRecording) return;
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso à câmera para tirar fotos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.6, base64: true });
    const asset = result.canceled ? null : result.assets?.[0];
    if (!asset?.base64) return;
    const mimeType = asset.mimeType ?? 'image/jpeg';
    const fileName = asset.fileName ?? `foto-${Date.now()}.jpg`;
    await handleSendAttachment('ARQUIVO', `data:${mimeType};base64,${asset.base64}`, fileName);
  }

  function handleFeatureInDevelopment() {
    Alert.alert('Em breve', commonStrings.feedback.featureInDevelopment);
  }

  async function handleAttachPress() {
    if (sending || recorderState.isRecording) return;
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    const asset = result.canceled ? null : result.assets?.[0];
    if (!asset) return;
    const uri = asset.base64 ? `data:${asset.mimeType ?? guessMimeType(asset.name)};base64,${asset.base64}` : asset.uri;
    await handleSendAttachment('ARQUIVO', uri, asset.name, asset.mimeType);
  }

  return (
    <Screen
      keyboardAvoiding
      contentContainerStyle={styles.container}
      decorations={
        <>
          <FloatingCircle colors={GLOW_COLORS.violet} style={styles.circleTopRight} driftX={16} driftY={12} duration={5600} />
          <FloatingCircle colors={GLOW_COLORS.pink} style={styles.circleBottomLeft} driftX={-14} driftY={16} duration={6800} />
        </>
      }>
      <Header
        variant="gradient"
        gradientColors={theme.gradients.header}
        onBack={() => router.back()}
        center={
          <View style={styles.headerCenter}>
            <View style={styles.headerAvatar}>
              <MaterialIcons name="account-circle" size={34} color={theme.colors.white} />
            </View>
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

      <View style={styles.inputBar}>
        {recorderState.isRecording ? (
          <>
            <View style={styles.recordingPill}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>
                Gravando… {formatDuration(recorderState.durationMillis / 1000)}
              </Text>
            </View>
            <Pressable
              style={styles.cancelButton}
              onPress={handleCancelRecording}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Cancelar gravação">
              <MaterialIcons name="delete-outline" size={22} color={theme.colors.textMuted} />
            </Pressable>
            <Pressable
              style={styles.sendButton}
              onPress={handleStopAndSendRecording}
              accessibilityRole="button"
              accessibilityLabel="Enviar áudio">
              <MaterialIcons name="check" size={22} color={theme.colors.white} />
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.inputPill}>
              <Pressable
                onPress={handleFeatureInDevelopment}
                disabled={sending}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Enviar emoji">
                <MaterialIcons name="sentiment-satisfied" size={24} color={sending ? theme.colors.textDim : theme.colors.textMuted} />
              </Pressable>
              <Pressable
                onPress={handleAttachPress}
                disabled={sending}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Anexar arquivo">
                <MaterialIcons name="attach-file" size={22} color={sending ? theme.colors.textDim : theme.colors.textMuted} />
              </Pressable>
              <TextInput
                style={styles.input}
                placeholder="Enviar mensagem"
                placeholderTextColor={theme.colors.textDim}
                value={text}
                onChangeText={setText}
                onSubmitEditing={handleSend}
                editable={!sending}
                accessibilityLabel="Campo de mensagem"
              />
              <Pressable
                onPress={handleCameraPress}
                disabled={sending}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Tirar foto">
                <MaterialIcons name="camera-alt" size={22} color={sending ? theme.colors.textDim : theme.colors.textMuted} />
              </Pressable>
            </View>
            <Pressable
              style={styles.sendButton}
              onPress={handleMicOrSendPress}
              disabled={sending}
              accessibilityRole="button"
              accessibilityLabel={text.trim() ? 'Enviar mensagem' : 'Gravar áudio'}>
              {sending ? (
                <ActivityIndicator color={theme.colors.white} size="small" />
              ) : (
                <MaterialIcons name={text.trim() ? 'send' : 'mic'} size={22} color={theme.colors.white} />
              )}
            </Pressable>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  circleTopRight: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    top: 60,
    right: -40,
    overflow: 'hidden',
  },
  circleBottomLeft: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    bottom: 120,
    left: -40,
    overflow: 'hidden',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm + 2,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
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
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  inputPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(204,68,204,0.18)',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  input: {
    flex: 1,
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    paddingVertical: theme.spacing.md,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.magenta,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.magenta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  recordingPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm + 2,
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.35)',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.danger,
  },
  recordingText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
  },
  cancelButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.borderMuted,
  },
});
