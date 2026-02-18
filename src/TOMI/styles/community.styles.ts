import { StyleSheet } from 'react-native';

export const communityStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },  
  // Tab control
  tabContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  tabControl: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#4A90E2',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C757D',
  },
  tabButtonTextActive: {
    color: '#4A90E2',
  },

  // Content
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // Community Summary Card (Compact)
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 12,
    lineHeight: 20,
  },
  summaryPills: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  summaryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
  },
  summaryPillCount: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  viewRequestsButton: {
    marginTop: 8,
    paddingVertical: 4,
  },
  viewRequestsButtonText: {
    fontSize: 13,
    color: '#4A90E2',
    fontWeight: '600',
  },

  // Search
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C757D',
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchResults: {
    marginTop: 8,
    gap: 8,
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    gap: 12,
  },
  searchResultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  searchResultLevel: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  searchResultAction: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  searchResultActionPrimary: {
    backgroundColor: '#4A90E2',
  },
  searchResultActionSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchResultActionDisabled: {
    backgroundColor: '#F8F9FA',
  },
  searchResultActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  searchResultActionTextPrimary: {
    color: '#FFFFFF',
  },
  searchResultActionTextSecondary: {
    color: '#6C757D',
  },

  // Friend Requests (Collapsible Section)
  requestsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  requestsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  requestsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  requestsList: {
    gap: 8,
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    gap: 12,
  },
  requestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  requestLevel: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 6,
  },
  requestButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  requestButtonPrimary: {
    backgroundColor: '#28A745',
  },
  requestButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#DC3545',
  },
  requestButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  requestButtonTextPrimary: {
    color: '#FFFFFF',
  },
  requestButtonTextSecondary: {
    color: '#DC3545',
  },

  // Friends List (Clean Rows)
  friendsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  friendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  friendsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  friendsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C757D',
  },
  friendsList: {
    gap: 1,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  friendRowLast: {
    borderBottomWidth: 0,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  friendLevel: {
    fontSize: 13,
    color: '#6C757D',
    marginTop: 2,
  },
  friendVisitButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  friendVisitButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A90E2',
  },

  // Empty States
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Leaderboard
  leaderboardControls: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  leaderboardTitle: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 12,
  },
  leaderboardFilters: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  filterButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C757D',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  leaderboardList: {
    gap: 1,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
    gap: 12,
  },
  leaderboardRowCurrent: {
    backgroundColor: '#F0F8FF',
  },
  leaderboardRowLast: {
    borderBottomWidth: 0,
  },
  leaderboardRank: {
    width: 32,
    alignItems: 'center',
  },
  leaderboardRankText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6C757D',
  },
  leaderboardRankTop: {
    color: '#FFD700',
  },
  leaderboardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  leaderboardLevel: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  leaderboardXp: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4A90E2',
  },
  yourPositionCard: {
    backgroundColor: '#F0F8FF',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  yourPositionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 8,
  },
  yourPositionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  yourPositionRank: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  yourPositionXp: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4A90E2',
  },

  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6C757D',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#DC3545',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorRetryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
  },
  errorRetryButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },

});
