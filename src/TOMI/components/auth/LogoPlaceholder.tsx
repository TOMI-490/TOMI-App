import React from 'react';
import { View, Text } from 'react-native';
import { logoPlaceholderStyles } from '../../styles/auth/logoPlaceholder.styles';

interface LogoPlaceholderProps {
  text: string;
}

export function LogoPlaceholder({ text }: LogoPlaceholderProps) {
  return (
    <View style={logoPlaceholderStyles.logoContainer}>
      <Text style={logoPlaceholderStyles.logoText}>{text}</Text>
    </View>
  );
}
