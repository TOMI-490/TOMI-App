import React from 'react';
import { View } from 'react-native';
import { progressBarStyles } from '../../styles/auth/progressBar.styles';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  backgroundColor?: string;
  height?: number;
}

export function ProgressBar({
  progress,
  color = '#4CAF50',
  backgroundColor = '#E0E0E0',
  height = 6,
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={[progressBarStyles.container, { backgroundColor, height }]}>
      <View
        style={[
          progressBarStyles.fill,
          {
            width: `${clampedProgress}%`,
            backgroundColor: color,
            height,
          },
        ]}
      />
    </View>
  );
}
