import React from 'react';
import { View, Text } from 'react-native';
import { LeaderboardPreview } from '../../services/gamification';
import { useTranslation } from '../../locales/i18n';
import { leaderboardPreviewCardStyles as styles } from '../../styles/gamification/leaderboardPreviewCard.styles';

interface LeaderboardPreviewCardProps {
  leaderboards: LeaderboardPreview[];
}

export const LeaderboardPreviewCard: React.FC<LeaderboardPreviewCardProps> = ({ leaderboards }) => {
  const { t } = useTranslation();

  if (!leaderboards || leaderboards.length === 0) {
    return null;
  }

  // Show first leaderboard (prefer friends scope)
  const leaderboard = leaderboards.find(lb => lb.scope === 'friends') || leaderboards[0];
  if (!leaderboard) return null;

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getScopeLabel = (scope: string) => {
    return scope === 'friends' 
      ? t('gamification.scopeFriends') 
      : t('gamification.scopeGlobal');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>🏁 {leaderboard.name}</Text>
      <Text style={styles.scope}>
        {getScopeLabel(leaderboard.scope)}
      </Text>

      {/* Top 3 */}
      {leaderboard.top3 && leaderboard.top3.length > 0 && (
        <View style={styles.topSection}>
          {leaderboard.top3.map((entry) => (
            <View
              key={entry.userId}
              style={[
                styles.entry,
                entry.userId === leaderboard.userEntry?.userId && styles.userEntry,
              ]}
            >
              <Text style={styles.medal}>{getMedalEmoji(entry.rank)}</Text>
              <View style={styles.entryInfo}>
                <Text style={styles.entryName} numberOfLines={1}>
                  {entry.userName}
                  {entry.userId === leaderboard.userEntry?.userId && ` (${t('gamification.you')})`}
                </Text>
                <Text style={styles.entryScore}>{entry.score.toLocaleString()} pts</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* User Entry (if not in top 3) */}
      {leaderboard.userEntry &&
        !leaderboard.top3.some((e) => e.userId === leaderboard.userEntry!.userId) && (
          <View style={[styles.entry, styles.userEntry, styles.userEntryBelow]}>
            <Text style={styles.medal}>{getMedalEmoji(leaderboard.userEntry.rank)}</Text>
            <View style={styles.entryInfo}>
              <Text style={styles.entryName}>
                {leaderboard.userEntry.userName} ({t('gamification.you')})
              </Text>
              <Text style={styles.entryScore}>
                {leaderboard.userEntry.score.toLocaleString()} pts
              </Text>
            </View>
          </View>
        )}
    </View>
  );
};
