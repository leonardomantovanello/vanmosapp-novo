import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';

import { AudioMessagePlayer } from '@/components/features/chat/AudioMessagePlayer';
import { theme } from '@/constants/theme';
import { isImageFile } from '@/utils/mime';
import type { ChatMessage } from '@/types';

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function BubbleContent({ message }: { message: ChatMessage }) {
  if (message.tipo === 'AUDIO' && message.attachmentUri) {
    return <AudioMessagePlayer uri={message.attachmentUri} mine={message.mine} />;
  }

  if (message.tipo === 'ARQUIVO' && message.attachmentUri) {
    if (isImageFile(message.attachmentName)) {
      return (
        <Image
          source={{ uri: message.attachmentUri }}
          style={styles.imageAttachment}
          accessibilityLabel={message.attachmentName ?? 'Imagem enviada'}
          accessibilityIgnoresInvertColors
        />
      );
    }
    return (
      <View style={styles.fileRow}>
        <View style={[styles.fileIcon, message.mine && styles.fileIconMine]}>
          <MaterialIcons name="insert-drive-file" size={20} color={message.mine ? theme.colors.white : theme.colors.purpleLight} />
        </View>
        <Text style={styles.fileName} numberOfLines={2}>
          {message.attachmentName ?? 'Arquivo'}
        </Text>
      </View>
    );
  }

  return <Text style={styles.text}>{message.text}</Text>;
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const time = formatTime(message.createdAt);
  const showCaption = message.tipo !== 'TEXTO' && message.text;

  if (message.mine) {
    return (
      <View style={styles.wrapperMine}>
        <LinearGradient colors={theme.gradients.action} style={[styles.bubble, styles.bubbleMine]}>
          <BubbleContent message={message} />
          {showCaption ? <Text style={[styles.text, styles.caption]}>{message.text}</Text> : null}
        </LinearGradient>
        {time ? <Text style={[styles.time, styles.timeMine]}>{time}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.wrapperOther}>
      <View style={[styles.bubble, styles.bubbleOther]}>
        <BubbleContent message={message} />
        {showCaption ? <Text style={[styles.text, styles.caption]}>{message.text}</Text> : null}
      </View>
      {time ? <Text style={styles.time}>{time}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapperMine: {
    alignSelf: 'flex-end',
    maxWidth: '75%',
    marginBottom: theme.spacing.sm + 2,
  },
  wrapperOther: {
    alignSelf: 'flex-start',
    maxWidth: '75%',
    marginBottom: theme.spacing.sm + 2,
  },
  bubble: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md + 2,
  },
  bubbleMine: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: theme.colors.surfaceInput,
    borderBottomLeftRadius: 4,
  },
  text: {
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    lineHeight: 22,
  },
  caption: {
    marginTop: theme.spacing.sm,
  },
  time: {
    color: theme.colors.textFaint,
    fontSize: theme.fontSize.xs - 1,
    marginTop: 3,
    marginLeft: theme.spacing.sm,
  },
  timeMine: {
    alignSelf: 'flex-end',
    marginLeft: 0,
    marginRight: theme.spacing.sm,
  },
  imageAttachment: {
    width: 220,
    height: 220,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceMuted,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm + 2,
    minWidth: 170,
  },
  fileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(170,68,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileIconMine: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  fileName: {
    flex: 1,
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
});
