import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { theme } from '@/constants/theme';

export interface TextFieldProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string | null;
  hint?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  maxLength?: number;
  variant?: 'filled' | 'underline';
  editable?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize = 'sentences',
  maxLength,
  variant = 'filled',
  editable = true,
  containerStyle,
  inputStyle,
  accessibilityLabel,
}: TextFieldProps) {
  const [isSecureVisible, setIsSecureVisible] = useState(false);
  const showToggle = secureTextEntry;

  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            variant === 'filled' ? styles.inputFilled : styles.inputUnderline,
            !editable && styles.inputDisabled,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textFaint}
          secureTextEntry={showToggle && !isSecureVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          editable={editable}
          accessibilityLabel={accessibilityLabel ?? label ?? placeholder}
        />
        {showToggle ? (
          <Pressable
            onPress={() => setIsSecureVisible((prev) => !prev)}
            hitSlop={8}
            style={styles.toggleButton}
            accessibilityRole="button"
            accessibilityLabel={isSecureVisible ? 'Ocultar senha' : 'Mostrar senha'}>
            <MaterialIcons
              name={isSecureVisible ? 'visibility-off' : 'visibility'}
              size={20}
              color={theme.colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 1,
    marginBottom: theme.spacing.xs + 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.lg,
    minHeight: 44,
  },
  inputFilled: {
    backgroundColor: theme.colors.surfaceInput,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.base,
  },
  inputUnderline: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderInput,
    paddingVertical: theme.spacing.sm,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  toggleButton: {
    marginLeft: -36,
    padding: theme.spacing.sm,
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
  hint: {
    color: theme.colors.purpleAlt,
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
});
