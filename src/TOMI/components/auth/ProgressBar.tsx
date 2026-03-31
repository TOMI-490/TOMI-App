import React from 'react';
import { View } from 'react-native';
import { progressBarStyles } from '../../styles/auth/progressBar.styles';
import { useThemeColors } from '../../contexts/ThemeContext';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  backgroundColor?: string;
  height?: number;
}

export function ProgressBar({
  progress,
  color,
  backgroundColor,
  height = 6,
}: ProgressBarProps) {
  const colors = useThemeColors();
  const fillColor = color ?? colors.success;
  const trackColor = backgroundColor ?? colors.borderLight;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={[progressBarStyles.container, { backgroundColor: trackColor, height }]}>
      <View
        style={[
          progressBarStyles.fill,
          {
            width: `${clampedProgress}%`,
            backgroundColor: fillColor,
            height,
          },
        ]}
      />
    </View>
  );
}
