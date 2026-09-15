import { MaterialIcons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

export interface AudioMessagePlayerProps {
  uri: string;
  mine: boolean;
}

// Player de áudio dentro da bolha de mensagem — cada bolha tem sua própria
// instância (useAudioPlayer já cuida de descarregar o player ao desmontar).
export function AudioMessagePlayer({ uri, mine }: AudioMessagePlayerProps) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);

  function handleToggle() {
    if (status.playing) {
      player.pause();
      return;
    }
    if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration)) {
      player.seekTo(0);
    }
    player.play();
  }

  const progress = status.duration > 0 ? Math.min(1, status.currentTime / status.duration) : 0;
  const timeLabel = formatDuration(status.currentTime > 0 ? status.currentTime : status.duration);

  return (
    <View style={styles.row}>
      <Pressable
        onPress={handleToggle}
        hitSlop={8}
        style={[styles.playButton, mine ? styles.playButtonMine : styles.playButtonOther]}
        accessibilityRole="button"
        accessibilityLabel={status.playing ? 'Pausar áudio' : 'Reproduzir áudio'}>
        <MaterialIcons
          name={status.playing ? 'pause' : 'play-arrow'}
          size={20}
          color={mine ? theme.colors.white : theme.colors.purpleLight}
        />
      </Pressable>
      <View style={styles.trackColumn}>
        <View style={[styles.track, mine && styles.trackMine]}>
          <View style={[styles.trackFill, { width: `${progress * 100}%` }, mine && styles.trackFillMine]} />
        </View>
        <Text style={[styles.time, mine && styles.timeMine]}>{timeLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm + 2,
    minWidth: 170,
  },
  playButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonMine: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  playButtonOther: {
    backgroundColor: 'rgba(170,68,255,0.16)',
  },
  trackColumn: {
    flex: 1,
    gap: theme.spacing.xs - 1,
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(170,68,255,0.2)',
    overflow: 'hidden',
  },
  trackMine: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  trackFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: theme.colors.purpleLight,
  },
  trackFillMine: {
    backgroundColor: theme.colors.white,
  },
  time: {
    color: theme.colors.textFaint,
    fontSize: theme.fontSize.xs - 1,
  },
  timeMine: {
    color: 'rgba(255,255,255,0.75)',
  },
});
