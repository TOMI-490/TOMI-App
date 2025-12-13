import React from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, ...props }: InputProps) {
  return (
    <View>
      {label && <Text>{label}</Text>}
      <TextInput {...props} />
    </View>
  );
}
