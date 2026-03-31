import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createXpToastStyles } from '../../styles/gamification/xpToast.styles';
import { useTheme } from '../../contexts/ThemeContext';

interface XpToastProps {
  xpDelta: number;
  visible: boolean;
  onDismiss: () => void;
}

export const XpToast: React.FC<XpToastProps> = ({ xpDelta, visible, onDismiss }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createXpToastStyles(colors), [colors]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(fadeAnim, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: -50, duration: 250, useNativeDriver: true }),
        ]).start(() => onDismiss());
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [visible, fadeAnim, slideAnim, scaleAnim, onDismiss]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.iconBox}>
        <MaterialCommunityIcons name="lightning-bolt" size={18} color={colors.primary} />
      </View>
      <View>
        <Text style={styles.text}>+{xpDelta} XP</Text>
        <Text style={styles.label}>Experience earned</Text>
      </View>
    </Animated.View>
  );
};
