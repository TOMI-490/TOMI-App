import React, { useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { createAuthContainerStyles } from '../../styles/auth/authContainer.styles';
import { useTheme } from '../../contexts/ThemeContext';

interface AuthContainerProps {
  children: React.ReactNode;
}

export function AuthContainer({ children }: AuthContainerProps) {
  const { colors } = useTheme();
  const authContainerStyles = useMemo(() => createAuthContainerStyles(colors), [colors]);

  return (
    <KeyboardAvoidingView
      style={authContainerStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={authContainerStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
