import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { createFormInputStyles } from '../../styles/auth/formInput.styles';
import { useTheme } from '../../contexts/ThemeContext';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function FormInput({ label, error, style, onFocus, onBlur, ...props }: FormInputProps) {
  const { colors } = useTheme();
  const formInputStyles = useMemo(() => createFormInputStyles(colors), [colors]);
  const [focused, setFocused] = useState(false);

  return (
    <View style={formInputStyles.inputGroup}>
      <Text style={[formInputStyles.label, focused && !error && formInputStyles.labelFocused]}>
        {label}
      </Text>
      <TextInput
        style={[
          formInputStyles.input,
          focused && !error && formInputStyles.inputFocused,
          error && formInputStyles.inputError,
          style,
        ]}
        placeholderTextColor={colors.textLight}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
      {error ? <Text style={formInputStyles.errorText}>{error}</Text> : null}
    </View>
  );
}
