import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LogoPlaceholderProps {
  text: string;
}

export function LogoPlaceholder({ text }: LogoPlaceholderProps) {
  return (
    <View style={styles.logoContainer}>
      <Text style={styles.logoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    width: 140,
    height: 140,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginBottom: 32,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 2,
  },
});
