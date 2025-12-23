import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
}

export function SecondaryButton({ title, onPress, style }: SecondaryButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 50,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#2C2C2C',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
  },
});
