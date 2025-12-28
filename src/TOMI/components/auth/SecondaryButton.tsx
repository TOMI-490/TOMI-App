import React from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';
import { secondaryButtonStyles } from '../../styles/auth/secondaryButton.styles';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
}

export function SecondaryButton({ title, onPress, style }: SecondaryButtonProps) {
  return (
    <TouchableOpacity
      style={[secondaryButtonStyles.button, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={secondaryButtonStyles.text}>{title}</Text>
    </TouchableOpacity>
  );
}
