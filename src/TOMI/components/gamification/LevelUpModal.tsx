import React, { useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Animated } from 'react-native';
import { levelUpModalStyles as styles } from '../../styles/gamification/levelUpModal.styles';

interface LevelUpModalProps {
  visible: boolean;
  level: number | null;
  onDismiss: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ visible, level, onDismiss }) => {
  const scaleAnim = React.useRef(new Animated.Value(0.5)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Scale and rotate animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.5);
      rotateAnim.setValue(0);
    }
  }, [visible, scaleAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.trophy,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          >
            🏆
          </Animated.Text>
          
          <Text style={styles.title}>Level Up!</Text>
          <Text style={styles.levelText}>Level {level}</Text>
          <Text style={styles.message}>Your TOMI is getting stronger!</Text>

          {/* Simple confetti effect - just dots */}
          <View style={styles.confetti}>
            <Text style={[styles.confettiDot, { top: 20, left: 30 }]}>•</Text>
            <Text style={[styles.confettiDot, { top: 40, left: 60 }]}>•</Text>
            <Text style={[styles.confettiDot, { top: 30, right: 40 }]}>•</Text>
            <Text style={[styles.confettiDot, { top: 50, right: 70 }]}>•</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={onDismiss}>
            <Text style={styles.buttonText}>Awesome!</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};
