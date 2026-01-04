import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { EarnedBadge, UpcomingBadge } from '../../services/gamification';
import { useTranslation } from '../../locales/i18n';
import { getBadgeNameTranslation, getUnitTranslation } from '../../utils/badgeTranslations';
import { badgesCardStyles as styles } from '../../styles/gamification/badgesCard.styles';

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
          <Text style={styles.sectionTitle}>🏆 {t('gamification.recentBadges')}</Text>
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
                  <View style={styles.badgeIcon}>
                    <Text style={styles.badgeEmoji}>🏅</Text>
                  </View>
                  <Text style={styles.badgeName} numberOfLines={1}>{badgeName}</Text>
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
          <Text style={styles.sectionTitle}>🎯 {t('gamification.nextMilestones')}</Text>
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
