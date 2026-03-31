import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { createPrimaryButtonStyles } from '../../styles/auth/primaryButton.styles';
import { useTheme } from '../../contexts/ThemeContext';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
}: PrimaryButtonProps) {
  const { colors } = useTheme();
  const primaryButtonStyles = useMemo(() => createPrimaryButtonStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={[primaryButtonStyles.button, disabled && primaryButtonStyles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={primaryButtonStyles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
