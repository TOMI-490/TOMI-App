import { StyleSheet } from 'react-native';

export const badgesCardStyles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 24,
    overflow: 'visible',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  badgeScroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingRight: 16,
  },
  earnedBadge: {
    alignItems: 'center',
    marginRight: 14,
    width: 76,
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeEmoji: {
    fontSize: 30,
  },
  badgeName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1a1a1a',
    lineHeight: 15,
  },
  badgeDate: {
    fontSize: 10,
    color: '#999',
    marginTop: 3,
  },
  upcomingBadge: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 220,
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
