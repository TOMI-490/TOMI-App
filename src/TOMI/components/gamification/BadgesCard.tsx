import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { EarnedBadge, UpcomingBadge } from '../../services/gamification';
import { useTranslation } from '../../locales/i18n';
import { getBadgeNameTranslation, getUnitTranslation } from '../../utils/badgeTranslations';
import { badgesCardStyles as styles } from '../../styles/gamification/badgesCard.styles';

type BadgeIconDef =
  | { lib: 'Ionicons'; name: React.ComponentProps<typeof Ionicons>['name']; color: string; bg: string }
  | { lib: 'MaterialCommunityIcons'; name: React.ComponentProps<typeof MaterialCommunityIcons>['name']; color: string; bg: string };

function getBadgeIcon(achievement: string): BadgeIconDef {
  const a = (achievement || '').toLowerCase();
  if (a.includes('step'))      return { lib: 'MaterialCommunityIcons', name: 'shoe-print',      color: '#7C3AED', bg: '#EDE9FE' };
  if (a.includes('run'))       return { lib: 'MaterialCommunityIcons', name: 'run',             color: '#EA580C', bg: '#FFF0E6' };
  if (a.includes('workout_1') && !a.includes('10') && !a.includes('100'))
                               return { lib: 'Ionicons',               name: 'checkmark-circle', color: '#16A34A', bg: '#DCFCE7' };
  if (a.includes('workout'))   return { lib: 'MaterialCommunityIcons', name: 'dumbbell',        color: '#2563EB', bg: '#DBEAFE' };
  if (a.includes('streak'))    return { lib: 'Ionicons',               name: 'flame',            color: '#FF6B35', bg: '#FFF0E8' };
  if (a.includes('distance'))  return { lib: 'MaterialCommunityIcons', name: 'map-marker-distance', color: '#0891B2', bg: '#E0F7FA' };
  if (a.includes('level'))     return { lib: 'Ionicons',               name: 'star',             color: '#D97706', bg: '#FEF3C7' };
  if (a.includes('social') || a.includes('friend'))
                               return { lib: 'Ionicons',               name: 'people',           color: '#DB2777', bg: '#FCE7F3' };
  return                              { lib: 'Ionicons',               name: 'ribbon',           color: '#7C3AED', bg: '#EDE9FE' };
}

function BadgeIcon({ achievement }: { achievement: string }) {
  const def = getBadgeIcon(achievement);
  return (
    <View style={[styles.badgeIcon, { backgroundColor: def.bg }]}>
      {def.lib === 'Ionicons'
        ? <Ionicons name={def.name as any} size={26} color={def.color} />
        : <MaterialCommunityIcons name={def.name as any} size={26} color={def.color} />}
    </View>
  );
}

interface BadgesCardProps {
  earned: EarnedBadge[];
  upcoming: UpcomingBadge[];
}

export const BadgesCard: React.FC<BadgesCardProps> = ({ earned, upcoming }) => {
  const { t } = useTranslation();

  if (!earned && !upcoming) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Earned Badges */}
      {earned && earned.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="trophy-outline" size={16} color="#FF9500" style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>{t('gamification.recentBadges')}</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.badgeScroll}
            nestedScrollEnabled={true}
            contentContainerStyle={styles.scrollContent}
          >
            {earned.slice(0, 6).map((badge) => {
              const translationKey = getBadgeNameTranslation(badge);
              const badgeName = translationKey.startsWith('gamification.badges.') 
                ? t(translationKey)
                : badge.name;

              return (
                <View key={badge.id} style={styles.earnedBadge}>
                  <BadgeIcon achievement={badge.achievement} />
                  <Text style={styles.badgeName} numberOfLines={2}>{badgeName}</Text>
                  <Text style={styles.badgeDate}>
                    {new Date(badge.awardedDate).toLocaleDateString()}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Upcoming Badges */}
      {upcoming && upcoming.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="flag-outline" size={16} color="#007AFF" style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>{t('gamification.nextMilestones')}</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.badgeScroll}
            nestedScrollEnabled={true}
            contentContainerStyle={styles.scrollContent}
          >
            {upcoming.slice(0, 6).map((badge) => {
              const translationKey = getBadgeNameTranslation(badge);
              const badgeName = translationKey.startsWith('gamification.badges.') 
                ? t(translationKey)
                : badge.name;
              
              const unitTranslationKey = getUnitTranslation(badge.unit);
              const unit = unitTranslationKey.startsWith('gamification.units.')
                ? t(unitTranslationKey)
                : badge.unit;

              return (
                <View key={badge.id} style={styles.upcomingBadge}>
                  <View style={styles.badgeInfo}>
                    <Text style={styles.badgeName}>{badgeName}</Text>
                    <Text style={styles.badgeProgress}>
                      {badge.current} / {badge.target} {unit}
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${Math.min(badge.progress, 100)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressPercent}>{Math.round(badge.progress)}%</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};
