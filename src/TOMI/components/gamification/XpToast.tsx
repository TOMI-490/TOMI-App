import React, { useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import { xpToastStyles as styles } from '../../styles/gamification/xpToast.styles';

interface XpToastProps {
  xpDelta: number;
  visible: boolean;
  onDismiss: () => void;
}

export const XpToast: React.FC<XpToastProps> = ({ xpDelta, visible, onDismiss }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (visible) {
      // Fade in and slide down
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 2.5 seconds
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => onDismiss());
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [visible, fadeAnim, slideAnim, onDismiss]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.icon}>✨</Text>
      <Text style={styles.text}>+{xpDelta} XP</Text>
    </Animated.View>
  );
};
