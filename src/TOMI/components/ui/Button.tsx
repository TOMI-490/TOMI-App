import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({ title, onPress, style }: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}
