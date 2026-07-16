import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import type { ChatMessage } from '@/types';

export function MessageBubble({ message }: { message: ChatMessage }) {
  return (
    <View style={[styles.bubble, message.mine ? styles.bubbleMine : styles.bubbleOther]}>
      <Text style={styles.text}>{message.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '75%',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md + 2,
    marginBottom: theme.spacing.sm,
  },
  bubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.magenta,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surfaceInput,
    borderBottomLeftRadius: 4,
  },
  text: {
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    lineHeight: 22,
  },
});
