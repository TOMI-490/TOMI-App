import { StyleSheet } from 'react-native';

export const leaderboardPreviewCardStyles = StyleSheet.create({
  container: {
    marginVertical: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  scope: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
  },
  topSection: {
    marginBottom: 8,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#FFF',
  },
  userEntry: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  userEntryBelow: {
    marginTop: 8,
  },
  medal: {
    fontSize: 24,
    marginRight: 12,
    width: 36,
    textAlign: 'center',
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  entryScore: {
    fontSize: 12,
    color: '#666',
  },
});
