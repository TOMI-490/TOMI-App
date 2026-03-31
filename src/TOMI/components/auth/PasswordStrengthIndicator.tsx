import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { ProgressBar } from './ProgressBar';
import { passwordStrengthIndicatorStyles } from '../../styles/auth/passwordStrengthIndicator.styles';
import { useTheme } from '../../contexts/ThemeContext';
import type { TomiThemeColors } from '../../constants/theme';

interface PasswordStrengthIndicatorProps {
  password: string;
}

function calculateStrength(pwd: string, T: TomiThemeColors): { strength: number; label: string; color: string } {
  if (!pwd) {
    return { strength: 0, label: '', color: T.borderLight };
  }

  let strength = 0;

  if (pwd.length >= 6) strength += 25;
  if (pwd.length >= 10) strength += 15;
  if (/[a-z]/.test(pwd)) strength += 15;
  if (/[A-Z]/.test(pwd)) strength += 15;
  if (/\d/.test(pwd)) strength += 15;
  if (/[^a-zA-Z0-9]/.test(pwd)) strength += 15;

  let label = '';
  let color = '';

  if (strength < 30) {
    label = 'Weak';
    color = T.danger;
  } else if (strength < 60) {
    label = 'Fair';
    color = T.warning;
  } else if (strength < 80) {
    label = 'Good';
    color = T.successLight;
  } else {
    label = 'Strong';
    color = T.success;
  }

  return { strength, label, color };
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const { colors: T } = useTheme();
  const { strength, label, color } = useMemo(() => calculateStrength(password, T), [password, T]);

  if (!password) {
    return null;
  }

  return (
    <View style={passwordStrengthIndicatorStyles.container}>
      <ProgressBar progress={strength} color={color} height={6} />
      {label && <Text style={[passwordStrengthIndicatorStyles.label, { color }]}>{label}</Text>}
    </View>
  );
}
