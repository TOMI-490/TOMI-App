import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { ProgressRing } from '../../services/gamification';
import { useTranslation } from '../../locales/i18n';
import { progressRingsStyles as styles } from '../../styles/gamification/progressRings.styles';

interface ProgressRingsProps {
  rings: ProgressRing[];
}

export const ProgressRings: React.FC<ProgressRingsProps> = ({ rings }) => {
  const { t } = useTranslation();

  if (!rings || rings.length === 0) {
    return null;
  }

  const renderRing = (ring: ProgressRing, index: number) => {
    const size = 80;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(ring.progress, 100);
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    // Color based on progress
    const getColor = () => {
      if (progress >= 100) return '#4CAF50'; // Green
      if (progress >= 75) return '#2196F3'; // Blue
      if (progress >= 50) return '#FF9800'; // Orange
      return '#9E9E9E'; // Gray
    };

    return (
      <View key={ring.key} style={styles.ringContainer}>
        <View style={styles.svgContainer}>
          <Svg width={size} height={size}>
            {/* Background circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#E0E0E0"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={getColor()}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          </Svg>
          <View style={styles.ringCenter}>
            <Text style={styles.ringValue}>{ring.current}</Text>
            <Text style={styles.ringTarget}>/{ring.target}</Text>
          </View>
        </View>
        <Text style={styles.ringLabel}>{ring.label}</Text>
        <Text style={styles.ringUnit}>{ring.unit}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('gamification.todaysGoals')}</Text>
      <View style={styles.ringsRow}>
        {rings.slice(0, 3).map(renderRing)}
      </View>
    </View>
  );
};
