import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from '../../locales/i18n';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useAvatarPage } from '../../hooks/useAvatarPage';
import { useGamification } from '../../hooks/useGamification';
import { evolutionService } from '../../services/resources/evolution.service';
import { userAvatarService } from '../../services/resources/userAvatar.service';
import { invalidateDashboardCache } from '../../hooks/useDashboardData';
import { EvolutionModal } from '../../components/gamification';
import type { EvolutionStateDto, EvolutionNodeDto } from '../../models/dto/Evolution.dto';
import { createAvatarPageStyles } from '../../styles/home/avatarPage.styles';
import { useTheme } from '../../contexts/ThemeContext';
import type { TomiThemeColors } from '../../constants/theme';

type AvatarPageStyles = ReturnType<typeof createAvatarPageStyles>;

type TabId = 'customize' | 'evolution' | 'stats' | 'shop';
const TABS: { id: TabId; label: string }[] = [
  { id: 'customize', label: 'Customize' },
  { id: 'evolution',  label: 'Evolution' },
  { id: 'stats',      label: 'Stats' },
  { id: 'shop',       label: 'Shop' },
];

const STAGE_LABELS: Record<string, string> = { baby: 'Baby', teen: 'Teen', adult: 'Adult' };

function isUsableUrl(url?: string | null): boolean {
  if (!url) return false;
  if (url.includes('example.com')) return false;
  return true;
}

/* ── Accessory placeholders ─────────────────────────────────────────── */
const ACCESSORIES = [
  { id: 'crown',   name: 'Crown',    icon: 'crown' as const,               unlocked: true },
  { id: 'star_bg', name: 'Star B.',   icon: 'star-four-points' as const,    unlocked: false },
  { id: 'sparkle', name: 'Sparkle',  icon: 'shimmer' as const,             unlocked: false },
  { id: 'trophy',  name: 'Trophy',   icon: 'trophy' as const,              unlocked: false },
];

export default function AvatarPage() {
  const { t } = useTranslation();
  const { colors: T } = useTheme();
  const styles = useMemo(() => createAvatarPageStyles(T), [T]);
  const { authId } = useAuth();
  const { user } = useCurrentUser(authId || undefined);
  const { avatar, loading, error, refresh } = useAvatarPage(user?.userId);
  const { data: gamData } = useGamification(user?.userId);

  const [activeTab, setActiveTab] = useState<TabId>('customize');

  const themeColor = avatar?.themeColor ?? T.primary;
  const stageName = avatar?.evolutionStage
    ? STAGE_LABELS[avatar.evolutionStage] ?? avatar.evolutionStage
    : 'Baby';

  const fullnessPercent   = avatar ? 100 - avatar.hungerLevel : 0;
  const energyPercent     = avatar ? 100 - avatar.sleepinessLevel : 0;
  const funPercent        = avatar ? 100 - avatar.boredomeLevel : 0;
  const happinessPercent  = avatar ? avatar.happinessLevel : 0;

  const leaderboard = gamData?.leaderboards?.[0];
  const userRank = leaderboard?.userEntry?.rank ?? 0;

  if (loading && !avatar) {
    return (
      <ScreenWrapper style={styles.screen}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={T.primary} />
          <Text style={styles.loadingText}>{t('avatar.loading')}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (error && !avatar) {
    return (
      <ScreenWrapper style={styles.screen}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error.message ?? t('avatar.noAvatarFound')}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryText}>{t('avatar.retry')}</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  const nickname = avatar?.nickname ?? 'Buddy';
  const level = avatar?.level ?? 1;
  const xp = avatar?.xp ?? 0;
  const nextLevelXp = avatar?.nextLevelXp ?? 100;
  const xpPercent = avatar?.xpProgress ?? 0;
  const ageDays = avatar?.ageDays ?? 0;
  const avatarGif = avatar?.animationActiveUrl || avatar?.animationIdleUrl;

  return (
    <ScreenWrapper style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ─────────────────────────────────────── */}
        <View style={styles.companionPill}>
          <MaterialCommunityIcons name="paw" size={14} color={T.success} />
          <Text style={styles.companionPillText}>My Companion</Text>
        </View>
        <Text style={styles.headerTitle}>{nickname}'s Room</Text>
        <Text style={styles.headerSubtitle}>Your cozy little companion lives here</Text>

        {/* ── Avatar Card ────────────────────────────────── */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCardInner}>

            {/* Top row: name + level badge */}
            <View style={styles.avatarTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.avatarNickname}>{nickname}</Text>
                <Text style={styles.avatarMeta}>{ageDays} days old · {stageName} Stage</Text>
              </View>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeLabel}>Level</Text>
                <Text style={styles.levelBadgeValue}>{level}</Text>
              </View>
            </View>

            {/* Living room scene — matches Home page */}
            <View style={styles.livingRoom}>
              <View style={styles.roomWall} pointerEvents="none" />
              <View style={styles.roomWainscoting} pointerEvents="none" />
              <View style={styles.roomFloor} pointerEvents="none" />

              {/* Window with curtains */}
              <View style={styles.roomWindow} pointerEvents="none">
                <View style={styles.windowCurtainLeft} />
                <View style={styles.windowGlass}>
                  <View style={styles.windowSky} />
                  <View style={styles.windowCloud} />
                </View>
                <View style={styles.windowCurtainRight} />
                <View style={styles.windowSill} />
              </View>

              {/* Picture frame */}
              <View style={styles.roomPictureFrame} pointerEvents="none">
                <View style={styles.pictureInner}>
                  <Ionicons name="heart" size={14} color="#E8A87C" />
                </View>
              </View>

              {/* Rug */}
              <View style={styles.roomRug} pointerEvents="none" />

              {/* Sofa */}
              <View style={styles.roomSofa} pointerEvents="none">
                <View style={styles.sofaBack} />
                <View style={styles.sofaSeat} />
                <View style={styles.sofaCushionLeft} />
                <View style={styles.sofaCushionRight} />
                <View style={styles.sofaArmLeft} />
                <View style={styles.sofaArmRight} />
              </View>

              {/* Floor lamp */}
              <View style={styles.roomLampContainer} pointerEvents="none">
                <View style={styles.roomLampGlow} />
                <View style={styles.roomLampShade}>
                  <Ionicons name="bulb" size={12} color="#FBBF24" />
                </View>
                <View style={styles.roomLampPole} />
                <View style={styles.roomLampBase} />
              </View>

              {/* Side table with coffee */}
              <View style={styles.roomSideTable} pointerEvents="none">
                <View style={styles.sideTableTop}>
                  <Ionicons name="cafe" size={13} color="#92400e" />
                </View>
                <View style={styles.sideTableLeg} />
              </View>

              {/* Plant */}
              <View style={styles.roomPlant} pointerEvents="none">
                <View style={styles.plantLeaves}>
                  <Ionicons name="leaf" size={16} color="#4ADE80" />
                </View>
                <View style={styles.plantPot} />
              </View>

              {/* Bookshelf */}
              <View style={styles.roomBookshelf} pointerEvents="none">
                <View style={styles.bookshelfShelf} />
                <View style={styles.bookRow}>
                  <View style={[styles.book, { backgroundColor: '#F87171', height: 16 }]} />
                  <View style={[styles.book, { backgroundColor: '#60A5FA', height: 18 }]} />
                  <View style={[styles.book, { backgroundColor: '#FBBF24', height: 14 }]} />
                  <View style={[styles.book, { backgroundColor: '#34D399', height: 17 }]} />
                </View>
              </View>

              {/* Avatar */}
              <View style={styles.avatarTouchable}>
                <View style={styles.avatarShadowPlatform} />
                <View style={styles.avatarContainer}>
                  {avatarGif ? (
                    <Image source={{ uri: avatarGif }} style={{ width: 130, height: 130 }} contentFit="contain" autoplay />
                  ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: themeColor + '33' }]}>
                      <Ionicons name="sparkles" size={52} color={themeColor} />
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* XP Progress */}
            <View style={styles.xpRow}>
              <Text style={styles.xpLabel}>XP Progress</Text>
              <Text style={styles.xpValue}>{xp}/{nextLevelXp}</Text>
            </View>
            <View style={styles.xpBarTrack}>
              <View style={[styles.xpBarFill, { width: `${Math.min(xpPercent, 100)}%` as any, backgroundColor: themeColor }]} />
            </View>

            {/* Mood stats — 2x2 grid */}
            <View style={styles.moodGrid}>
              <View style={styles.moodStat}>
                <View style={styles.moodStatHeader}>
                  <Ionicons name="restaurant-outline" size={14} color={T.success} />
                  <Text style={styles.moodStatLabel}>Fullness</Text>
                  <Text style={[styles.moodStatValue, { color: T.success }]}>{fullnessPercent}%</Text>
                </View>
                <View style={styles.moodBarTrack}>
                  <View style={[styles.moodBarFill, { width: `${fullnessPercent}%` as any, backgroundColor: T.success }]} />
                </View>
              </View>
              <View style={styles.moodStat}>
                <View style={styles.moodStatHeader}>
                  <MaterialCommunityIcons name="lightning-bolt" size={14} color={T.secondary} />
                  <Text style={styles.moodStatLabel}>Energy</Text>
                  <Text style={[styles.moodStatValue, { color: T.secondary }]}>{energyPercent}%</Text>
                </View>
                <View style={styles.moodBarTrack}>
                  <View style={[styles.moodBarFill, { width: `${energyPercent}%` as any, backgroundColor: T.secondary }]} />
                </View>
              </View>
              <View style={styles.moodStat}>
                <View style={styles.moodStatHeader}>
                  <Ionicons name="game-controller-outline" size={14} color={T.warning} />
                  <Text style={styles.moodStatLabel}>Fun</Text>
                  <Text style={[styles.moodStatValue, { color: T.warning }]}>{funPercent}%</Text>
                </View>
                <View style={styles.moodBarTrack}>
                  <View style={[styles.moodBarFill, { width: `${funPercent}%` as any, backgroundColor: T.warning }]} />
                </View>
              </View>
              <View style={styles.moodStat}>
                <View style={styles.moodStatHeader}>
                  <Ionicons name="heart" size={14} color={T.danger} />
                  <Text style={styles.moodStatLabel}>Happiness</Text>
                  <Text style={[styles.moodStatValue, { color: T.danger }]}>{happinessPercent}%</Text>
                </View>
                <View style={styles.moodBarTrack}>
                  <View style={[styles.moodBarFill, { width: `${happinessPercent}%` as any, backgroundColor: T.danger }]} />
                </View>
              </View>
            </View>

            {/* Workout hint */}
            <View style={styles.moodHint}>
              <MaterialCommunityIcons name="dumbbell" size={14} color={T.textMuted} />
              <Text style={styles.moodHintText}>Complete workouts to boost your TOMI's mood!</Text>
            </View>

          </View>
        </View>

        {/* ── Tab Bar ─────────────────────────────────────── */}
        <View style={styles.tabBar}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Tab Content ─────────────────────────────────── */}
        {activeTab === 'customize' && <CustomizeContent styles={styles} T={T} />}
        {activeTab === 'evolution' && (
          <EvolutionContent userId={user?.userId} onEvolved={refresh} styles={styles} T={T} />
        )}
        {activeTab === 'stats' && (
          <StatsContent xp={xp} level={level} ageDays={ageDays} rank={userRank} nextLevelXp={nextLevelXp} xpPercent={xpPercent} styles={styles} T={T} />
        )}
        {activeTab === 'shop' && <ShopContent styles={styles} T={T} />}

      </ScrollView>
    </ScreenWrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Tab content components
   ═══════════════════════════════════════════════════════════════════════ */

function CustomizeContent({ styles, T }: { styles: AvatarPageStyles; T: TomiThemeColors }) {
  return (
    <>
      {/* Accessories */}
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="creation" size={20} color={T.primary} />
        <Text style={styles.sectionTitle}>Accessories</Text>
      </View>
      <View style={styles.accessoryGrid}>
        {ACCESSORIES.map(acc => (
          <TouchableOpacity
            key={acc.id}
            style={[styles.accessoryOption, !acc.unlocked && styles.accessoryLocked]}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name={acc.icon as any} size={26} color={acc.unlocked ? T.primary : T.textMuted} />
            {!acc.unlocked && (
              <View style={styles.lockOverlay}>
                <Ionicons name="lock-closed" size={16} color={T.textMuted} />
              </View>
            )}
            <Text style={styles.accessoryName}>{acc.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

function EvolutionContent({
  userId,
  onEvolved,
  styles,
  T,
}: {
  userId?: number;
  onEvolved: () => void;
  styles: AvatarPageStyles;
  T: TomiThemeColors;
}) {
  const [evoState, setEvoState] = useState<EvolutionStateDto | null>(null);
  const [loadingEvo, setLoadingEvo] = useState(true);
  const [showEvoModal, setShowEvoModal] = useState(false);
  const [evolving, setEvolving] = useState(false);

  const fetchState = useCallback(async (force = false) => {
    if (!userId) return;
    try {
      const state = await evolutionService.getEvolutionState(userId, force);
      setEvoState(state);
      // Auto-trigger the evolution modal if eligible
      if (state.isEligible && state.availableOptions.length > 0) {
        setShowEvoModal(true);
      }
    } catch {
      // leave null
    } finally {
      setLoadingEvo(false);
    }
  }, [userId]);

  useEffect(() => { fetchState(true); }, [fetchState]);

  const handleEvolveSelect = async (node: EvolutionNodeDto) => {
    if (!userId) return;
    setEvolving(true);
    try {
      const resp = await evolutionService.evolve(userId, node.evolutionNodeId);
      if (resp.success) {
        userAvatarService.invalidateCache();
        invalidateDashboardCache();
        setShowEvoModal(false);
        const freshState = await evolutionService.getEvolutionState(userId, true);
        setEvoState(freshState);
        onEvolved();
        Alert.alert('Evolution Complete!', resp.message);
      } else {
        Alert.alert('Cannot Evolve', resp.message);
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setEvolving(false);
    }
  };

  if (loadingEvo) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={T.primary} />
        <Text style={styles.loadingText}>Loading evolution…</Text>
      </View>
    );
  }

  if (!evoState) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={40} color={T.textMuted} />
        <Text style={styles.errorText}>Unable to load evolution data.</Text>
      </View>
    );
  }

  const { currentNode, currentStage, currentLevel, isEligible, availableOptions } = evoState;
  const fullyEvolved = currentStage === 'adult' && availableOptions.length === 0;

  const renderNodeAvatar = (node: EvolutionNodeDto, size: number) => {
    const candidates = [node.animationActiveUrl, node.animationIdleUrl, node.imageUrl];
    const url = candidates.find(isUsableUrl);
    if (url) {
      return (
        <Image
          source={{ uri: url }}
          style={{ width: size, height: size, borderRadius: size * 0.22 }}
          contentFit="contain"
        />
      );
    }
    return (
      <View style={[styles.evoStageFallback, { width: size, height: size, borderRadius: size * 0.22 }]}>
        <Ionicons name="sparkles" size={size * 0.45} color={T.primary} />
      </View>
    );
  };

  return (
    <>
      {/* ── Current Stage Card ──────────────────── */}
      <View style={styles.evolutionCurrentCard}>
        <Text style={styles.evolutionCurrentLabel}>Current Form</Text>
        <View style={styles.evoStageRow}>
          {renderNodeAvatar(currentNode, 60)}
          <View style={{ flex: 1 }}>
            <Text style={styles.evoStageName}>{currentNode.name}</Text>
            <View style={styles.evoStageBadge}>
              <Text style={styles.evoStageBadgeText}>
                {STAGE_LABELS[currentStage] ?? currentStage} · Lv.{currentLevel}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── Fully Evolved ───────────────────────── */}
      {fullyEvolved && (
        <View style={styles.evoFullCard}>
          <View style={styles.evoFullIconBox}>
            <Ionicons name="star" size={30} color="#7C3AED" />
          </View>
          <Text style={styles.evoFullTitle}>Fully Evolved!</Text>
          <Text style={styles.evoFullSub}>
            Your TOMI has reached its final form.{'\n'}You've unlocked everything this branch offers.
          </Text>
        </View>
      )}

      {/* ── Not Eligible Yet ────────────────────── */}
      {!isEligible && !fullyEvolved && (
        <View style={styles.evoNextInfo}>
          <View style={styles.evoNextIconBox}>
            <Ionicons name="lock-closed" size={20} color={T.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.evoNextLabel}>Next evolution locked</Text>
            <Text style={styles.evoNextSub}>
              Keep leveling up to unlock the next stage!
            </Text>
          </View>
        </View>
      )}

      {/* ── Eligible: banner + button to reopen modal ── */}
      {isEligible && availableOptions.length > 0 && (
        <>
          <View style={styles.evoBanner}>
            <View style={styles.evoBannerIconBox}>
              <Ionicons name="sparkles" size={24} color={T.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.evoBannerTitle}>Ready to Evolve!</Text>
              <Text style={styles.evoBannerSub}>Choose your next form to continue</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.evoConfirmBtn}
            onPress={() => setShowEvoModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.evoConfirmBtnText}>Choose Evolution</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Evolution choice modal */}
      <EvolutionModal
        visible={showEvoModal}
        options={availableOptions}
        evolving={evolving}
        onSelect={handleEvolveSelect}
      />
    </>
  );
}

function StatsContent({
  xp,
  level,
  ageDays,
  rank,
  nextLevelXp,
  xpPercent,
  styles,
  T,
}: {
  xp: number;
  level: number;
  ageDays: number;
  rank: number;
  nextLevelXp: number;
  xpPercent: number;
  styles: AvatarPageStyles;
  T: TomiThemeColors;
}) {
  const nextMilestoneLvl = Math.ceil(level / 5) * 5;
  const milestonePct = nextMilestoneLvl > 0 ? Math.min((level / nextMilestoneLvl) * 100, 100) : 0;

  return (
    <>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: T.primaryTint }]}>
            <MaterialCommunityIcons name="lightning-bolt" size={24} color={T.primary} />
          </View>
          <Text style={styles.statValue}>{xp.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: T.successTint }]}>
            <MaterialCommunityIcons name="chart-line" size={24} color={T.success} />
          </View>
          <Text style={styles.statValue}>{ageDays}</Text>
          <Text style={styles.statLabel}>Days Active</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: T.warningTint }]}>
            <Ionicons name="trophy" size={22} color={T.warning} />
          </View>
          <Text style={styles.statValue}>{level}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: T.secondaryTint }]}>
            <Ionicons name="star" size={22} color={T.secondary} />
          </View>
          <Text style={styles.statValue}>#{rank || '—'}</Text>
          <Text style={styles.statLabel}>Rank</Text>
        </View>
      </View>

      {/* Next Milestone */}
      <View style={styles.milestoneCard}>
        <View style={styles.milestoneHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="trophy" size={18} color={T.primary} />
            <Text style={styles.milestoneTitle}>Next Milestone</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={styles.milestoneTitle}>Level {nextMilestoneLvl} Reward</Text>
          <Text style={styles.milestoneLvl}>Lvl {level}/{nextMilestoneLvl}</Text>
        </View>
        <View style={styles.milestoneBar}>
          <View style={[styles.milestoneBarFill, { width: `${milestonePct}%` as any, backgroundColor: T.primary }]} />
        </View>
        <View style={styles.milestoneDesc}>
          <Ionicons name="trophy-outline" size={18} color={T.primary} />
          <Text style={styles.milestoneDescText}>Unlock exclusive champion avatar at Level {nextMilestoneLvl}</Text>
        </View>
      </View>
    </>
  );
}

function ShopContent({ styles, T }: { styles: AvatarPageStyles; T: TomiThemeColors }) {
  return (
    <View style={styles.shopEmpty}>
      <Ionicons name="storefront-outline" size={48} color={T.textMuted} />
      <Text style={styles.shopEmptyText}>Shop coming soon!{'\n'}Spend your XP on exclusive items.</Text>
    </View>
  );
}
