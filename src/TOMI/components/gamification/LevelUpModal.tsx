import React, { useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../locales/i18n';
import { levelUpModalStyles as styles } from '../../styles/gamification/levelUpModal.styles';

interface LevelUpModalProps {
  visible: boolean;
  level: number | null;
  onDismiss: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ visible, level, onDismiss }) => {
  const { t } = useTranslation();
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
          <Animated.View
            style={[
              styles.trophy,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <Ionicons name="trophy" size={60} color="#FFD700" />
          </Animated.View>
          
          <Text style={styles.title}>{t('levelUp.title')}</Text>
          <Text style={styles.levelText}>{t('levelUp.levelText').replace('{level}', String(level))}</Text>
          <Text style={styles.message}>{t('levelUp.message')}</Text>

          {/* Simple confetti effect - just dots */}
          <View style={styles.confetti}>
            <Text style={[styles.confettiDot, { top: 20, left: 30 }]}>•</Text>
            <Text style={[styles.confettiDot, { top: 40, left: 60 }]}>•</Text>
            <Text style={[styles.confettiDot, { top: 30, right: 40 }]}>•</Text>
            <Text style={[styles.confettiDot, { top: 50, right: 70 }]}>•</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={onDismiss}>
            <Text style={styles.buttonText}>{t('levelUp.button')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};
