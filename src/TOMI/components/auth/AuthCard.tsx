import React, { useMemo } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { createAuthCardStyles } from '../../styles/auth/authCard.styles';
import { useTheme } from '../../contexts/ThemeContext';

interface AuthCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function AuthCard({ children, style }: AuthCardProps) {
  const { colors } = useTheme();
  const authCardStyles = useMemo(() => createAuthCardStyles(colors), [colors]);

  return (
    <View style={[authCardStyles.cardOuter, style]}>
      <View style={authCardStyles.cardInner}>{children}</View>
    </View>
  );
}
