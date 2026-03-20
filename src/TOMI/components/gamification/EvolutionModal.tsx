import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  FlatList,
  ActivityIndicator,
  type ViewToken,
  type ListRenderItemInfo,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { createEvolutionModalStyles } from '../../styles/gamification/evolutionModal.styles';
import { useTheme } from '../../contexts/ThemeContext';
import type { EvolutionNodeDto } from '../../models/dto/Evolution.dto';

interface EvolutionModalProps {
  visible: boolean;
  options: EvolutionNodeDto[];
  loading?: boolean;
  evolving?: boolean;
  onSelect: (node: EvolutionNodeDto) => void;
}

const PURPLE_PARTICLES = ['#7C3AED', '#A78BFA', '#FFD700'] as const;

const STAGE_LABELS: Record<string, string> = { baby: 'Baby', teen: 'Teen', adult: 'Adult' };

function isUsableUrl(url?: string | null): boolean {
  if (!url) return false;
  if (url.includes('example.com')) return false;
  return true;
}

function resolveAssetUrl(node: EvolutionNodeDto): string | null {
  // Prefer active animation, then idle, then static image
  const candidates = [
    node.animationActiveUrl,
    node.animationIdleUrl,
    node.imageUrl,
  ];
  for (const url of candidates) {
    if (isUsableUrl(url)) return url!;
  }
  return null;
}

export const EvolutionModal: React.FC<EvolutionModalProps> = ({
  visible,
  options,
  loading = false,
  evolving = false,
  onSelect,
}) => {
  const { colors } = useTheme();
  const { styles, CARD_W } = useMemo(() => createEvolutionModalStyles(colors), [colors]);

  const [selectedNode, setSelectedNode] = useState<EvolutionNodeDto | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scaleAnim = useRef(new Animated.Value(0.4)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerPulse = useRef(new Animated.Value(0.97)).current;

  const particleColors = useMemo(
    () => [...PURPLE_PARTICLES, colors.warning, colors.secondary, colors.success],
    [colors.warning, colors.secondary, colors.success],
  );

  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        anim: new Animated.Value(0),
        x: 10 + Math.random() * 80,
        color: particleColors[i % particleColors.length],
        size: 8 + Math.random() * 10,
        delay: i * 55,
      })),
    [particleColors],
  );

  useEffect(() => {
    if (visible) {
      setSelectedNode(null);
      setActiveIndex(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 55,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(headerPulse, {
            toValue: 1.03,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(headerPulse, {
            toValue: 0.97,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();

      particles.forEach((p) => {
        p.anim.setValue(0);
        Animated.timing(p.anim, {
          toValue: 1,
          duration: 1000 + Math.random() * 500,
          delay: 250 + p.delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });
    } else {
      scaleAnim.setValue(0.4);
      fadeAnim.setValue(0);
      headerPulse.setValue(0.97);
      particles.forEach((p) => p.anim.setValue(0));
    }
  }, [visible, scaleAnim, fadeAnim, headerPulse, particles]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;

  const handleConfirm = useCallback(() => {
    if (selectedNode && !evolving) {
      onSelect(selectedNode);
    }
  }, [selectedNode, evolving, onSelect]);

  const renderOption = useCallback(
    ({ item }: ListRenderItemInfo<EvolutionNodeDto>) => {
      const isSelected = selectedNode?.evolutionNodeId === item.evolutionNodeId;
      const assetUrl = resolveAssetUrl(item);
      const nodeColor = item.themeColor || '#7C3AED';

      return (
        <TouchableOpacity
          style={[styles.optionCard, isSelected && styles.optionCardSelected]}
          activeOpacity={0.8}
          onPress={() => setSelectedNode(isSelected ? null : item)}
        >
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Ionicons name="checkmark" size={16} color="#FFF" />
            </View>
          )}

          <View style={styles.avatarImageContainer}>
            {assetUrl ? (
              <Image
                source={{ uri: assetUrl }}
                style={styles.avatarImage}
                contentFit="contain"
                transition={300}
              />
            ) : (
              <View
                style={[
                  styles.fallbackContainer,
                  { backgroundColor: nodeColor + '14' },
                ]}
              >
                <Ionicons name="sparkles" size={44} color={nodeColor} />
              </View>
            )}
          </View>

          <Text style={styles.optionName}>{item.name}</Text>
          <Text style={styles.optionStage}>
            {STAGE_LABELS[item.stage] ?? item.stage} · Lv.{item.levelRequired}
          </Text>
        </TouchableOpacity>
      );
    },
    [selectedNode],
  );

  const keyExtractor = useCallback(
    (item: EvolutionNodeDto) => String(item.evolutionNodeId),
    [],
  );

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}
        >
          {/* Confetti particles */}
          <View style={styles.confetti} pointerEvents="none">
            {particles.map((p) => (
              <Animated.Text
                key={p.id}
                style={[
                  styles.confettiDot,
                  {
                    left: `${p.x}%` as any,
                    fontSize: p.size,
                    color: p.color,
                    opacity: p.anim.interpolate({
                      inputRange: [0, 0.3, 1],
                      outputRange: [0, 1, 0],
                    }),
                    transform: [
                      {
                        translateY: p.anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [80, -140],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {p.id % 4 === 0 ? '✦' : p.id % 4 === 1 ? '★' : p.id % 4 === 2 ? '◆' : '●'}
              </Animated.Text>
            ))}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7C3AED" />
              <Text style={styles.loadingText}>Checking evolution…</Text>
            </View>
          ) : (
            <>
              <Animated.View
                style={[styles.headerIcon, { transform: [{ scale: headerPulse }] }]}
              >
                <Ionicons name="sparkles" size={32} color="#7C3AED" />
              </Animated.View>

              <Text style={styles.title}>Time to Evolve!</Text>
              <View style={styles.divider} />
              <Text style={styles.subtitle}>
                Your TOMI has grown strong enough to evolve.{'\n'}Choose your next form
                to continue!
              </Text>

              {/* Horizontal carousel */}
              <View style={styles.carouselContainer}>
                <FlatList
                  data={options}
                  renderItem={renderOption}
                  keyExtractor={keyExtractor}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={CARD_W + 16}
                  decelerationRate="fast"
                  contentContainerStyle={styles.carouselContent}
                  onViewableItemsChanged={onViewableItemsChanged}
                  viewabilityConfig={viewabilityConfig}
                />
              </View>

              {/* Pagination dots */}
              {options.length > 1 && (
                <View style={styles.paginationRow}>
                  {options.map((_, i) => (
                    <View
                      key={i}
                      style={[styles.dot, i === activeIndex && styles.dotActive]}
                    />
                  ))}
                </View>
              )}

              {/* Confirm button */}
              <TouchableOpacity
                style={[
                  styles.evolveButton,
                  (!selectedNode || evolving) && styles.evolveButtonDisabled,
                ]}
                disabled={!selectedNode || evolving}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                {evolving ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.evolveButtonText}>
                    {selectedNode
                      ? `Evolve to ${selectedNode.name}`
                      : 'Select your evolution'}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
