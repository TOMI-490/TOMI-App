import React from 'react';
import { View } from 'react-native';
import { authCardStyles } from '../../styles/auth/authCard.styles';

interface AuthCardProps {
  children: React.ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return <View style={authCardStyles.card}>{children}</View>;
}
