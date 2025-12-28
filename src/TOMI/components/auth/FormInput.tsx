import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { formInputStyles } from '../../styles/auth/formInput.styles';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function FormInput({ label, error, style, ...props }: FormInputProps) {
  return (
    <View style={formInputStyles.inputGroup}>
      <Text style={formInputStyles.label}>{label}</Text>
      <TextInput
        style={[formInputStyles.input, error && formInputStyles.inputError, style]}
        placeholderTextColor="#999"
        {...props}
      />
      {error && <Text style={formInputStyles.errorText}>{error}</Text>}
    </View>
  );
}
