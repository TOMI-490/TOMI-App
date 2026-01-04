import { StyleSheet } from 'react-native';

export const badgesCardStyles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  badgeScroll: {
    marginBottom: 8,
  },
  earnedBadge: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeEmoji: {
    fontSize: 30,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    color: '#000',
  },
  badgeDate: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  upcomingBadge: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'column',
  },
  badgeInfo: {
    marginBottom: 8,
  },
  badgeProgress: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
});
