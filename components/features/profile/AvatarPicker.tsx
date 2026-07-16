import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { theme } from '@/constants/theme';

export interface AvatarPickerProps {
  uri: string | null;
  onChange: (uri: string) => void;
  size?: number;
}

export function AvatarPicker({ uri, onChange, size = 120 }: AvatarPickerProps) {
  async function handlePick() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== 'granted') {
      Alert.alert('Permissão necessária', 'Autorize o acesso às fotos para escolher uma imagem de perfil.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      onChange(result.assets[0].uri);
    }
  }

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Avatar uri={uri} size={size} iconSize={size * 0.47} />
      <Pressable
        onPress={handlePick}
        style={styles.editButton}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Alterar foto de perfil">
        <MaterialIcons name="photo-camera" size={18} color={theme.colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.black,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  editButton: {
    position: 'absolute',
    right: -4,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.magenta,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.backgroundDarkest,
  },
});
