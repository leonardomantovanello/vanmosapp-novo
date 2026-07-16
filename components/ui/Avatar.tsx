import { MaterialIcons } from '@expo/vector-icons';
import { Image, StyleSheet, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';

import { theme } from '@/constants/theme';

export interface AvatarProps {
  uri?: string | null;
  size?: number;
  iconSize?: number;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  backgroundColor?: string;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({
  uri,
  size = 56,
  iconSize,
  iconName = 'person',
  backgroundColor = theme.colors.surfaceMuted,
  iconColor = theme.colors.white,
  style,
}: AvatarProps) {
  const dimensionStyle = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, dimensionStyle, style] as StyleProp<ImageStyle>}
        accessibilityIgnoresInvertColors
      />
    );
  }

  return (
    <View style={[styles.placeholder, dimensionStyle, { backgroundColor }, style]}>
      <MaterialIcons name={iconName} size={iconSize ?? size * 0.55} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
});
