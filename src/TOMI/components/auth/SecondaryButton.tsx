import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
} from 'react-native';
import { createSecondaryButtonStyles } from '../../styles/auth/secondaryButton.styles';
import { useTheme } from '../../contexts/ThemeContext';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
}

export function SecondaryButton({ title, onPress, style }: SecondaryButtonProps) {
  const { colors } = useTheme();
  const secondaryButtonStyles = useMemo(() => createSecondaryButtonStyles(colors), [colors]);

  return (
    <TouchableOpacity style={[secondaryButtonStyles.button, style]} onPress={onPress} activeOpacity={0.8}>
      <Text style={secondaryButtonStyles.text}>{title}</Text>
    </TouchableOpacity>
  );
}
