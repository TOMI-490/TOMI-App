import React from 'react';
import { View, Text } from 'react-native';
import { ProgressBar } from './ProgressBar';
import { passwordStrengthIndicatorStyles } from '../../styles/auth/passwordStrengthIndicator.styles';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const calculateStrength = (pwd: string): { strength: number; label: string; color: string } => {
    if (!pwd) {
      return { strength: 0, label: '', color: '#E0E0E0' };
    }

    let strength = 0;

    // Length check
    if (pwd.length >= 6) strength += 25;
    if (pwd.length >= 10) strength += 15;

    // Contains lowercase
    if (/[a-z]/.test(pwd)) strength += 15;

    // Contains uppercase
    if (/[A-Z]/.test(pwd)) strength += 15;

    // Contains numbers
    if (/\d/.test(pwd)) strength += 15;

    // Contains special characters
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 15;

    let label = '';
    let color = '';

    if (strength < 30) {
      label = 'Weak';
      color = '#FF4444';
    } else if (strength < 60) {
      label = 'Fair';
      color = '#FFA726';
    } else if (strength < 80) {
      label = 'Good';
      color = '#66BB6A';
    } else {
      label = 'Strong';
      color = '#4CAF50';
    }

    return { strength, label, color };
  };

  const { strength, label, color } = calculateStrength(password);

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
