import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from '../../locales/i18n';
import { levelUpModalStyles as styles } from '../../styles/gamification/levelUpModal.styles';
import { TOMI_THEME as T } from '../../constants/theme';

interface LevelUpModalProps {
  visible: boolean;
  level: number | null;
  onDismiss: () => void;
}

const PARTICLE_COLORS = [T.primary, T.secondary, T.success, T.warning, '#FFD700', T.primaryLight];

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ visible, level, onDismiss }) => {
  const { t } = useTranslation();

  const scaleAnim = useRef(new Animated.Value(0.4)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const badgeRotate = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      anim: new Animated.Value(0),
      x: 15 + Math.random() * 70,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      size: 8 + Math.random() * 10,
      delay: i * 60,
    })),
  []);

  useEffect(() => {
    if (visible) {
      // Card entrance
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 9, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();

      // Badge bounce-in with subtle wobble
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.spring(badgeScale, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
          Animated.timing(badgeRotate, {
            toValue: 1, duration: 600, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Confetti burst
      particles.forEach(p => {
        p.anim.setValue(0);
        Animated.timing(p.anim, {
          toValue: 1, duration: 900 + Math.random() * 400,
          delay: 300 + p.delay, easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }).start();
      });
    } else {
      scaleAnim.setValue(0.4);
      badgeScale.setValue(0);
      badgeRotate.setValue(0);
      fadeAnim.setValue(0);
      particles.forEach(p => p.anim.setValue(0));
    }
  }, [visible, scaleAnim, badgeScale, badgeRotate, fadeAnim, particles]);

  const wobble = badgeRotate.interpolate({
    inputRange: [0, 0.3, 0.6, 1],
    outputRange: ['0deg', '-8deg', '5deg', '0deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>

          {/* Confetti particles */}
          <View style={styles.confetti} pointerEvents="none">
            {particles.map(p => (
              <Animated.Text
                key={p.id}
                style={[
                  styles.confettiDot,
                  {
                    left: `${p.x}%` as any,
                    fontSize: p.size,
                    color: p.color,
                    opacity: p.anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 0] }),
                    transform: [{
                      translateY: p.anim.interpolate({ inputRange: [0, 1], outputRange: [60, -120] }),
                    }],
                  },
                ]}
              >
                {p.id % 3 === 0 ? '★' : p.id % 3 === 1 ? '●' : '◆'}
              </Animated.Text>
            ))}
          </View>

          {/* Glowing badge */}
          <Animated.View
            style={[
              styles.glowRing,
              { transform: [{ scale: badgeScale }, { rotate: wobble }] },
            ]}
          >
            <View style={styles.badge}>
              <MaterialCommunityIcons name="arrow-up-bold" size={38} color="#FFFFFF" />
            </View>
          </Animated.View>

          <Text style={styles.title}>{t('levelUp.title')}</Text>
          <View style={styles.divider} />
          <Text style={styles.levelText}>
            {t('levelUp.levelText').replace('{level}', String(level))}
          </Text>
          <Text style={styles.message}>{t('levelUp.message')}</Text>

          <TouchableOpacity style={styles.button} onPress={onDismiss} activeOpacity={0.8}>
            <Text style={styles.buttonText}>{t('levelUp.button')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
