import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useLanguage } from '../../hooks/useLanguage';
import { useTranslation } from '../../locales/i18n';
import { communityService } from '../../services/community';
import { communityStyles as styles } from '../../styles/community.styles';
import type {
  UserSearchResult,
  FriendListItem,
  FriendRequestsResponse,
  LeaderboardResponse,
} from '../../models/dto/Community.dto';

type Tab = 'friends' | 'leaderboard';
type LeaderboardScope = 'friends' | 'global';
type LeaderboardPeriod = 'week' | 'month';

export default function CommunityPage() {
  const router = useRouter();
  const { authId } = useAuth();
  const { user } = useCurrentUser(authId || undefined);
  useLanguage(user);
  const { t } = useTranslation();

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('friends');

  // Friends tab state
  const [friends, setFriends] = useState<FriendListItem[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequestsResponse>({
    incoming: [],
    outgoing: [],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Leaderboard tab state
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [leaderboardScope, setLeaderboardScope] = useState<LeaderboardScope>('friends');
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<LeaderboardPeriod>('week');

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId, activeTab]);

  // Search users with debounce
  useEffect(() => {
    if (!user || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchUsers();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, user?.userId]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'friends') {
        await loadFriendsData();
      } else {
        await loadLeaderboardData();
      }
    } catch (err: any) {
      console.error('[CommunityPage] Error loading data:', err);
      setError(err.message || t('community.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const loadFriendsData = async () => {
    if (!user) return;

    const [friendsData, requestsData] = await Promise.all([
      communityService.getFriends(user.userId),
      communityService.getFriendRequests(user.userId),
    ]);

    setFriends(friendsData);
    setFriendRequests(requestsData);
  };

  const loadLeaderboardData = async () => {
    if (!user) return;

    const leaderboardData = await communityService.getLeaderboard(
      user.userId,
      leaderboardScope,
      leaderboardPeriod
    );

    setLeaderboard(leaderboardData);
  };

  const searchUsers = async () => {
    if (!user || searchQuery.trim().length < 2) return;

    try {
      setSearchLoading(true);
      const results = await communityService.searchUsers(user.userId, searchQuery.trim());
      setSearchResults(results);
    } catch (err: any) {
      console.error('[CommunityPage] Error searching users:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSendFriendRequest = async (toUserId: number) => {
    if (!user) return;

    try {
      await communityService.sendFriendRequest(user.userId, toUserId);
      Alert.alert(t('common.success'), t('community.requestSent'));
      await loadFriendsData();
      await searchUsers();
    } catch (err: any) {
      console.error('[CommunityPage] Error sending friend request:', err);
      Alert.alert(t('common.error'), err.message || t('community.errorSendingRequest'));
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    if (!user) return;

    try {
      await communityService.acceptFriendRequest(user.userId, requestId);
      Alert.alert(t('common.success'), t('community.requestAccepted'));
      await loadFriendsData();
    } catch (err: any) {
      console.error('[CommunityPage] Error accepting request:', err);
      Alert.alert(t('common.error'), err.message || t('community.errorAcceptingRequest'));
    }
  };

  const handleDeclineRequest = async (requestId: number) => {
    if (!user) return;

    try {
      await communityService.declineFriendRequest(user.userId, requestId);
      Alert.alert(t('common.success'), t('community.requestDeclined'));
      await loadFriendsData();
    } catch (err: any) {
      console.error('[CommunityPage] Error declining request:', err);
      Alert.alert(t('common.error'), err.message || t('community.errorDecliningRequest'));
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    if (!user) return;

    try {
      await communityService.cancelFriendRequest(user.userId, requestId);
      Alert.alert(t('common.success'), t('community.requestCancelled'));
      await loadFriendsData();
      await searchUsers();
    } catch (err: any) {
      console.error('[CommunityPage] Error cancelling request:', err);
      Alert.alert(t('common.error'), err.message || t('community.errorCancellingRequest'));
    }
  };

  const handleVisitFriend = (friendId: number) => {
    router.push({
      pathname: '/(tabs)/friend-visit',
      params: { friendId },
    });
  };

  const handleLeaderboardScopeChange = async (scope: LeaderboardScope) => {
    setLeaderboardScope(scope);
    if (user) {
      try {
        const leaderboardData = await communityService.getLeaderboard(user.userId, scope, leaderboardPeriod);
        setLeaderboard(leaderboardData);
      } catch (err: any) {
        console.error('[CommunityPage] Error loading leaderboard:', err);
      }
    }
  };

  const handleLeaderboardPeriodChange = async (period: LeaderboardPeriod) => {
    setLeaderboardPeriod(period);
    if (user) {
      try {
        const leaderboardData = await communityService.getLeaderboard(user.userId, leaderboardScope, period);
        setLeaderboard(leaderboardData);
      } catch (err: any) {
        console.error('[CommunityPage] Error loading leaderboard:', err);
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderSearchResultAction = (result: UserSearchResult) => {
    const getButtonStyle = () => {
      switch (result.relationship) {
        case 'friends':
          return styles.searchResultActionDisabled;
        case 'outgoing_request':
        case 'incoming_request':
          return styles.searchResultActionSecondary;
        default:
          return styles.searchResultActionPrimary;
      }
    };

    const getButtonTextStyle = () => {
      switch (result.relationship) {
        case 'friends':
        case 'outgoing_request':
        case 'incoming_request':
          return styles.searchResultActionTextSecondary;
        default:
          return styles.searchResultActionTextPrimary;
      }
    };

    const getButtonText = () => {
      switch (result.relationship) {
        case 'friends':
          return t('community.friends');
        case 'outgoing_request':
          return t('community.pending');
        case 'incoming_request':
          return t('community.pending');
        default:
          return t('community.add');
      }
    };

    const isDisabled = result.relationship !== 'none';

    return (
      <TouchableOpacity
        style={[styles.searchResultAction, getButtonStyle()]}
        onPress={() => !isDisabled && handleSendFriendRequest(result.userId)}
        disabled={isDisabled}
      >
        <Text style={[styles.searchResultActionText, getButtonTextStyle()]}>{getButtonText()}</Text>
      </TouchableOpacity>
    );
  };

  const renderFriendsTab = () => {
    const totalPendingRequests = friendRequests.incoming.length + friendRequests.outgoing.length;
    const hasSearchResults = searchResults.length > 0 && searchQuery.trim().length >= 2;
    const hasIncomingRequests = friendRequests.incoming.length > 0;
    const hasOutgoingRequests = friendRequests.outgoing.length > 0;

    return (
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Compact Community Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>{t('community.friendsOverview')}</Text>
          <View style={styles.summaryPills}>
            <View style={styles.summaryPill}>
              <Text style={styles.summaryPillText}>{t('community.friends')}:</Text>
              <Text style={styles.summaryPillCount}>{friends.length}</Text>
            </View>
            {totalPendingRequests > 0 && (
              <View style={styles.summaryPill}>
                <Text style={styles.summaryPillText}>{t('community.pending')}:</Text>
                <Text style={styles.summaryPillCount}>{totalPendingRequests}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Clean Search Card */}
        <View style={styles.searchCard}>
          <Text style={styles.searchLabel}>{t('community.searchUsers')}</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t('community.searchPlaceholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchLoading && (
            <ActivityIndicator size="small" color="#4A90E2" style={{ marginTop: 8 }} />
          )}
          {hasSearchResults && (
            <View style={styles.searchResults}>
              {searchResults.map((result) => (
                <View key={result.userId} style={styles.searchResultRow}>
                  <View style={styles.searchResultAvatar}>
                    <Text style={styles.searchResultAvatarText}>{getInitials(result.displayName)}</Text>
                  </View>
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultName}>{result.displayName}</Text>
                    {result.level && (
                      <Text style={styles.searchResultLevel}>
                        {t('community.leaderboardLevel').replace('{level}', result.level.toString())}
                      </Text>
                    )}
                  </View>
                  {renderSearchResultAction(result)}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Collapsible Friend Requests Section (only if has requests) */}
        {(hasIncomingRequests || hasOutgoingRequests) && (
          <View style={styles.requestsSection}>
            <View style={styles.requestsHeader}>
              <Text style={styles.requestsTitle}>{t('community.friendRequests')}</Text>
              <Text style={styles.requestsCount}>{totalPendingRequests}</Text>
            </View>

            {/* Incoming Requests */}
            {hasIncomingRequests && (
              <>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#6C757D', marginBottom: 8, marginTop: 4 }}>
                  {t('community.incomingRequests')}
                </Text>
                <View style={styles.requestsList}>
                  {friendRequests.incoming.map((request) => (
                    <View key={request.requestId} style={styles.requestRow}>
                      <View style={styles.requestAvatar}>
                        <Text style={styles.requestAvatarText}>{getInitials(request.displayName)}</Text>
                      </View>
                      <View style={styles.requestInfo}>
                        <Text style={styles.requestName}>{request.displayName}</Text>
                        {request.level && (
                          <Text style={styles.requestLevel}>
                            {t('community.leaderboardLevel').replace('{level}', request.level.toString())}
                          </Text>
                        )}
                      </View>
                      <View style={styles.requestActions}>
                        <TouchableOpacity
                          style={[styles.requestButton, styles.requestButtonPrimary]}
                          onPress={() => handleAcceptRequest(request.requestId)}
                        >
                          <Text style={[styles.requestButtonText, styles.requestButtonTextPrimary]}>
                            {t('community.accept')}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.requestButton, styles.requestButtonSecondary]}
                          onPress={() => handleDeclineRequest(request.requestId)}
                        >
                          <Text style={[styles.requestButtonText, styles.requestButtonTextSecondary]}>
                            {t('community.decline')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Outgoing Requests */}
            {hasOutgoingRequests && (
              <>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: '#6C757D',
                    marginBottom: 8,
                    marginTop: hasIncomingRequests ? 12 : 4,
                  }}
                >
                  {t('community.outgoingRequests')}
                </Text>
                <View style={styles.requestsList}>
                  {friendRequests.outgoing.map((request) => (
                    <View key={request.requestId} style={styles.requestRow}>
                      <View style={styles.requestAvatar}>
                        <Text style={styles.requestAvatarText}>{getInitials(request.displayName)}</Text>
                      </View>
                      <View style={styles.requestInfo}>
                        <Text style={styles.requestName}>{request.displayName}</Text>
                        {request.level && (
                          <Text style={styles.requestLevel}>
                            {t('community.leaderboardLevel').replace('{level}', request.level.toString())}
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity
                        style={[styles.requestButton, styles.requestButtonSecondary]}
                        onPress={() => handleCancelRequest(request.requestId)}
                      >
                        <Text style={[styles.requestButtonText, styles.requestButtonTextSecondary]}>
                          {t('community.cancel')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {/* Improved Friends List with Clean Rows */}
        <View style={styles.friendsSection}>
          <View style={styles.friendsHeader}>
            <Text style={styles.friendsTitle}>{t('community.friendsList')}</Text>
            <Text style={styles.friendsCount}>{friends.length}</Text>
          </View>
          {friends.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#8E8E93" />
              <Text style={styles.emptyStateText}>{t('community.noFriends')}</Text>
            </View>
          ) : (
            <View style={styles.friendsList}>
              {friends.map((friend, index) => (
                <View
                  key={friend.userId}
                  style={[styles.friendRow, index === friends.length - 1 && styles.friendRowLast]}
                >
                  <View style={styles.friendAvatar}>
                    <Text style={styles.friendAvatarText}>{getInitials(friend.displayName)}</Text>
                  </View>
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{friend.displayName}</Text>
                    {friend.level && (
                      <Text style={styles.friendLevel}>
                        {t('community.leaderboardLevel').replace('{level}', friend.level.toString())}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.friendVisitButton}
                    onPress={() => handleVisitFriend(friend.userId)}
                  >
                    <Text style={styles.friendVisitButtonText}>{t('community.visit')}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderLeaderboardTab = () => {
    return (
      <View style={styles.content}>
        {/* Leaderboard Controls */}
        <View style={styles.leaderboardControls}>
          <Text style={styles.headerText}>{t('community.leaderboardOverview')}</Text>
          <View style={styles.leaderboardFilters}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                leaderboardScope === 'friends' && styles.filterButtonActive,
              ]}
              onPress={() => handleLeaderboardScopeChange('friends')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  leaderboardScope === 'friends' && styles.filterButtonTextActive,
                ]}
              >
                {t('community.leaderboardScopeFriends')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                leaderboardScope === 'global' && styles.filterButtonActive,
              ]}
              onPress={() => handleLeaderboardScopeChange('global')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  leaderboardScope === 'global' && styles.filterButtonTextActive,
                ]}
              >
                {t('community.leaderboardScopeGlobal')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                leaderboardPeriod === 'week' && styles.filterButtonActive,
              ]}
              onPress={() => handleLeaderboardPeriodChange('week')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  leaderboardPeriod === 'week' && styles.filterButtonTextActive,
                ]}
              >
                {t('community.leaderboardPeriodWeek')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                leaderboardPeriod === 'month' && styles.filterButtonActive,
              ]}
              onPress={() => handleLeaderboardPeriodChange('month')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  leaderboardPeriod === 'month' && styles.filterButtonTextActive,
                ]}
              >
                {t('community.leaderboardPeriodMonth')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Leaderboard List */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {!leaderboard || leaderboard.entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>{t('community.leaderboardEmpty')}</Text>
            </View>
          ) : (
            <>
              {leaderboard.entries.map((entry) => (
                <View
                  key={entry.userId}
                  style={[
                    styles.leaderboardItem,
                    user && entry.userId === user.userId && styles.leaderboardItemCurrent,
                  ]}
                >
                  <View style={styles.leaderboardRank}>
                    <Text
                      style={[
                        styles.leaderboardRankText,
                        entry.rank <= 3 && styles.leaderboardRankTop,
                      ]}
                    >
                      {entry.rank}
                    </Text>
                  </View>
                  <View style={styles.leaderboardAvatar}>
                    <Text style={styles.leaderboardAvatarText}>{getInitials(entry.displayName)}</Text>
                  </View>
                  <View style={styles.leaderboardInfo}>
                    <Text style={styles.leaderboardName}>{entry.displayName}</Text>
                    {entry.level && (
                      <Text style={styles.leaderboardLevel}>
                        {t('community.leaderboardLevel').replace('{level}', entry.level.toString())}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.leaderboardXp}>{t('community.leaderboardXp').replace('{xp}', entry.xp.toString())}</Text>
                </View>
              ))}

              {/* Your Position Card (if not in top entries) */}
              {leaderboard.currentUser && leaderboard.currentUser.rank > 50 && (
                <View style={styles.leaderboardYourPosition}>
                  <Text style={styles.yourPositionText}>{t('community.leaderboardYourPosition')}</Text>
                  <View style={styles.yourPositionStats}>
                    <Text style={styles.yourPositionRank}>
                      {t('community.leaderboardRank').replace('{rank}', leaderboard.currentUser.rank.toString())}
                    </Text>
                    <Text style={styles.yourPositionXp}>
                      {t('community.leaderboardXp').replace('{xp}', leaderboard.currentUser.xp.toString())}
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    );
  };

  if (!user || loading) {
    return (
      <ScreenWrapper style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>{t('community.loading')}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.errorRetryButton} onPress={loadData}>
            <Text style={styles.errorRetryButtonText}>{t('community.retry')}</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={styles.container}>
      {/* Tab Control */}
      <View style={styles.tabContainer}>
        <View style={styles.tabControl}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'friends' && styles.tabButtonActive]}
            onPress={() => setActiveTab('friends')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'friends' && styles.tabButtonTextActive,
              ]}
            >
              {t('community.friends')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'leaderboard' && styles.tabButtonActive]}
            onPress={() => setActiveTab('leaderboard')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'leaderboard' && styles.tabButtonTextActive,
              ]}
            >
              {t('community.leaderboard')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Content */}
      {activeTab === 'friends' ? renderFriendsTab() : renderLeaderboardTab()}
    </ScreenWrapper>
  );
}
