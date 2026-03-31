import React from 'react';
import { View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  safeArea?: boolean;
}

export function ScreenWrapper({ children, style, safeArea = true }: ScreenWrapperProps) {
  const Container = safeArea ? SafeAreaView : View;
  return (
    <Container style={style}>
      {children}
    </Container>
  );
}
