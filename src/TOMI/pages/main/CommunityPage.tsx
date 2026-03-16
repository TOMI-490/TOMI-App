import React, { useState, useEffect, useCallback } from 'react';
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
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useLanguage } from '../../hooks/useLanguage';
import { useTranslation } from '../../locales/i18n';
import { communityService } from '../../services/community';
import { userAvatarService } from '../../services/resources/userAvatar.service';
import { TOMI_THEME as T } from '../../constants/theme';
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

  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const [showAddFriend, setShowAddFriend] = useState(false);

  const [friends, setFriends] = useState<FriendListItem[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequestsResponse>({
    incoming: [],
    outgoing: [],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [leaderboardScope, setLeaderboardScope] = useState<LeaderboardScope>('friends');
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<LeaderboardPeriod>('week');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map of userId -> animationActiveUrl for friend avatars
  const [avatarUrls, setAvatarUrls] = useState<Record<number, string>>({});

  useEffect(() => {
    if (user) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId, activeTab]);

  useEffect(() => {
    if (!user || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => searchUsers(), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, user?.userId]);

  const fetchFriendAvatars = useCallback(async (friendsList: FriendListItem[]) => {
    const urls: Record<number, string> = {};
    await Promise.all(
      friendsList.map(async (f) => {
        try {
          const avatar = await userAvatarService.getByUserId(f.userId);
          if (avatar?.animationActiveUrl) {
            urls[f.userId] = avatar.animationActiveUrl;
          }
        } catch {
          // Friend may not have an avatar — ignore
        }
      }),
    );
    setAvatarUrls((prev) => ({ ...prev, ...urls }));
  }, []);

  const loadData = async () => {
    if (!user) return;
    try {
      setError(null);
      // Only show loading spinner if we have no data yet (first load).
      // On subsequent loads the service-level cache returns stale data instantly.
      const hasData = friends.length > 0 || leaderboard != null;
      if (!hasData) setLoading(true);
      if (activeTab === 'friends') await loadFriendsData();
      else await loadLeaderboardData();
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
    fetchFriendAvatars(friendsData);
  };

  const loadLeaderboardData = async () => {
    if (!user) return;
    const data = await communityService.getLeaderboard(user.userId, leaderboardScope, leaderboardPeriod);
    setLeaderboard(data);
    if (data?.entries?.length) {
      fetchAvatarsForUsers(data.entries.map((e) => e.userId));
    }
  };

  const fetchAvatarsForUsers = async (userIds: number[]) => {
    const urls: Record<number, string> = {};
    await Promise.all(
      userIds.map(async (uid) => {
        if (avatarUrls[uid]) return;
        try {
          const avatar = await userAvatarService.getByUserId(uid);
          if (avatar?.animationActiveUrl) urls[uid] = avatar.animationActiveUrl;
        } catch { /* no avatar */ }
      }),
    );
    if (Object.keys(urls).length) setAvatarUrls((prev) => ({ ...prev, ...urls }));
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
      Alert.alert(t('common.error'), err.message || t('community.errorCancellingRequest'));
    }
  };

  const handleVisitFriend = (friendId: number) => {
    router.push({ pathname: '/(tabs)/friend-visit', params: { friendId } });
  };

  const handleLeaderboardScopeChange = async (scope: LeaderboardScope) => {
    setLeaderboardScope(scope);
    if (!user) return;
    try {
      const data = await communityService.getLeaderboard(user.userId, scope, leaderboardPeriod);
      setLeaderboard(data);
    } catch (err: any) {
      console.error('[CommunityPage] Error loading leaderboard:', err);
    }
  };

  const handleLeaderboardPeriodChange = async (period: LeaderboardPeriod) => {
    setLeaderboardPeriod(period);
    if (!user) return;
    try {
      const data = await communityService.getLeaderboard(user.userId, leaderboardScope, period);
      setLeaderboard(data);
    } catch (err: any) {
      console.error('[CommunityPage] Error loading leaderboard:', err);
    }
  };

  // ── Avatar renderer using expo-image (same as FriendVisitPage) ──
  const renderAvatar = (userId: number, size: number) => {
    const url = avatarUrls[userId];
    const r = size * 0.24;
    if (url) {
      return (
        <Image
          source={{ uri: url }}
          style={{ width: size, height: size, borderRadius: r }}
          contentFit="contain"
        />
      );
    }
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: r,
          backgroundColor: T.primaryTint,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Ionicons name="person" size={size * 0.5} color={T.primary} />
      </View>
    );
  };

  // ── Search result action button ──
  const renderSearchResultAction = (result: UserSearchResult) => {
    const buttonStyle =
      result.relationship === 'friends'
        ? styles.searchResultActionDisabled
        : result.relationship === 'outgoing_request' || result.relationship === 'incoming_request'
          ? styles.searchResultActionSecondary
          : styles.searchResultActionPrimary;

    const textStyle =
      result.relationship === 'none'
        ? styles.searchResultActionTextPrimary
        : styles.searchResultActionTextSecondary;

    const label =
      result.relationship === 'friends'
        ? t('community.friends')
        : result.relationship === 'outgoing_request' || result.relationship === 'incoming_request'
          ? t('community.pending')
          : t('community.add');

    const isDisabled = result.relationship !== 'none';

    return (
      <TouchableOpacity
        style={[styles.searchResultAction, buttonStyle]}
        onPress={() => !isDisabled && handleSendFriendRequest(result.userId)}
        disabled={isDisabled}
      >
        <Text style={[styles.searchResultActionText, textStyle]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const getFriendRankDisplay = (rank: number) => {
    if (rank === 1) return <Ionicons name="trophy" size={18} color="#F57F17" />;
    if (rank === 2) return <Ionicons name="shield-checkmark" size={16} color={T.textMuted} />;
    return <Text style={styles.squadCardMetricText}>#{rank}</Text>;
  };

  // ════════════════════════════════════════
  //  FRIENDS TAB
  // ════════════════════════════════════════
  const renderFriendsTab = () => {
    const totalPendingRequests = friendRequests.incoming.length + friendRequests.outgoing.length;
    const hasSearchResults = searchResults.length > 0 && searchQuery.trim().length >= 2;
    const hasIncomingRequests = friendRequests.incoming.length > 0;
    const hasOutgoingRequests = friendRequests.outgoing.length > 0;
    const sortedFriends = [...friends].sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0));

    return (
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* ── Add New Friend ── */}
        <TouchableOpacity
          style={styles.addNewFriendButton}
          onPress={() => setShowAddFriend(!showAddFriend)}
        >
          <Ionicons name="person-add-outline" size={20} color={T.primary} />
          <Text style={styles.addNewFriendButtonText}>{t('community.addNewFriend')}</Text>
        </TouchableOpacity>

        {/* ── Search (expandable) ── */}
        {showAddFriend && (
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
            {searchLoading && <ActivityIndicator size="small" color={T.secondary} style={{ marginTop: 8 }} />}
            {hasSearchResults && (
              <View style={styles.searchResults}>
                {searchResults.map((r) => (
                  <View key={r.userId} style={styles.searchResultRow}>
                    {renderAvatar(r.userId, 40)}
                    <View style={styles.searchResultInfo}>
                      <Text style={styles.searchResultName}>{r.displayName}</Text>
                      {r.level != null && (
                        <Text style={styles.searchResultLevel}>
                          {t('community.leaderboardLevel').replace('{level}', r.level.toString())}
                        </Text>
                      )}
                    </View>
                    {renderSearchResultAction(r)}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── Friend Requests ── */}
        {(hasIncomingRequests || hasOutgoingRequests) && (
          <View style={styles.requestsSection}>
            <View style={styles.requestsHeader}>
              <Text style={styles.requestsTitle}>{t('community.friendRequests')}</Text>
              <Text style={styles.requestsCount}>{totalPendingRequests}</Text>
            </View>
            {hasIncomingRequests && (
              <>
                <Text style={styles.requestSubheading}>
                  {t('community.incomingRequests')}
                </Text>
                <View style={styles.requestsList}>
                  {friendRequests.incoming.map((req) => (
                    <View key={req.requestId} style={styles.requestRow}>
                      {renderAvatar(req.userId, 40)}
                      <View style={styles.requestInfo}>
                        <Text style={styles.requestName}>{req.displayName}</Text>
                        {req.level != null && (
                          <Text style={styles.requestLevel}>
                            {t('community.leaderboardLevel').replace('{level}', req.level.toString())}
                          </Text>
                        )}
                      </View>
                      <View style={styles.requestActions}>
                        <TouchableOpacity
                          style={[styles.requestButton, styles.requestButtonPrimary]}
                          onPress={() => handleAcceptRequest(req.requestId)}
                        >
                          <Text style={[styles.requestButtonText, styles.requestButtonTextPrimary]}>
                            {t('community.accept')}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.requestButton, styles.requestButtonSecondary]}
                          onPress={() => handleDeclineRequest(req.requestId)}
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
            {hasOutgoingRequests && (
              <>
                <Text style={[styles.requestSubheading, hasIncomingRequests && { marginTop: 12 }]}>
                  {t('community.outgoingRequests')}
                </Text>
                <View style={styles.requestsList}>
                  {friendRequests.outgoing.map((req) => (
                    <View key={req.requestId} style={styles.requestRow}>
                      {renderAvatar(req.userId, 40)}
                      <View style={styles.requestInfo}>
                        <Text style={styles.requestName}>{req.displayName}</Text>
                        {req.level != null && (
                          <Text style={styles.requestLevel}>
                            {t('community.leaderboardLevel').replace('{level}', req.level.toString())}
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity
                        style={[styles.requestButton, styles.requestButtonSecondary]}
                        onPress={() => handleCancelRequest(req.requestId)}
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

        {/* ── Your Squad ── */}
        <View style={styles.squadSection}>
          <View style={styles.squadHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.squadTitle}>
              {t('community.yourSquad').replace('{count}', friends.length.toString())}
            </Text>
          </View>

          {friends.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={T.textMuted} />
              <Text style={styles.emptyStateText}>{t('community.noFriends')}</Text>
            </View>
          ) : (
            sortedFriends.map((friend, index) => {
              const rank = index + 1;
              return (
                <TouchableOpacity
                  key={friend.userId}
                  style={styles.squadCard}
                  onPress={() => handleVisitFriend(friend.userId)}
                  activeOpacity={0.7}
                >
                  <View style={styles.squadCardRow}>
                    {renderAvatar(friend.userId, 72)}

                    <View style={styles.squadCardContent}>
                      <Text style={styles.friendName}>{friend.displayName}</Text>

                      <View style={styles.squadCardMetrics}>
                        {friend.level != null && (
                          <View style={styles.squadCardMetric}>
                            <Ionicons name="shield-outline" size={14} color={T.primary} />
                            <Text style={styles.squadCardMetricLevel}>Lvl {friend.level}</Text>
                          </View>
                        )}
                        {friend.badgesCount != null && (
                          <View style={styles.squadCardMetric}>
                            <Ionicons name="flame" size={14} color={T.danger} />
                            <Text style={styles.squadCardMetricBadge}>{friend.badgesCount}</Text>
                          </View>
                        )}
                        {friend.xp != null && (
                          <View style={styles.squadCardMetric}>
                            <Ionicons name="trending-up" size={14} color={T.primary} />
                            <Text style={styles.squadCardMetricLevel}>{friend.xp}</Text>
                          </View>
                        )}
                      </View>

                      {friend.currentXp != null && friend.nextLevelXp != null && (
                        <>
                          <View style={styles.squadCardProgress}>
                            <View
                              style={[
                                styles.squadCardProgressFill,
                                { width: `${Math.min(100, friend.xpProgress ?? 0)}%` },
                              ]}
                            />
                          </View>
                          <Text style={styles.squadCardXpText}>
                            {friend.currentXp}/{friend.nextLevelXp} XP
                          </Text>
                        </>
                      )}
                    </View>

                    <View style={[styles.squadCardRank, rank === 1 && styles.squadCardRankCrown]}>
                      {getFriendRankDisplay(rank)}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* ── Find More Friends ── */}
        <View style={styles.findMoreFriendsCard}>
          <View style={styles.findMoreFriendsIcon}>
            <Ionicons name="search" size={24} color={T.primary} />
          </View>
          <Text style={styles.findMoreFriendsTitle}>{t('community.findMoreFriends')}</Text>
          <Text style={styles.findMoreFriendsSubtitle}>{t('community.findMoreFriendsSubtitle')}</Text>
          <TouchableOpacity style={styles.browseUsersButton} onPress={() => setShowAddFriend(true)}>
            <Text style={styles.browseUsersButtonText}>{t('community.browseUsers')} &gt;</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // ════════════════════════════════════════
  //  LEADERBOARD TAB
  // ════════════════════════════════════════
  const renderLeaderboardTab = () => {
    const top3 = leaderboard?.entries?.slice(0, 3) ?? [];
    const rest = leaderboard?.entries?.slice(3) ?? [];
    const first = top3[0];
    const second = top3[1];
    const third = top3[2];

    const renderPodiumEntry = (
      entry: typeof first,
      rank: 1 | 2 | 3,
    ) => {
      if (!entry) return null;
      const isFirst = rank === 1;
      const avatarSize = isFirst ? 80 : 60;
      const cardStyle = isFirst
        ? styles.leaderboardPodiumFirst
        : rank === 2
          ? styles.leaderboardPodiumSecond
          : styles.leaderboardPodiumThird;
      const badgeStyle = isFirst
        ? styles.podiumBadgeGold
        : rank === 2
          ? styles.podiumBadgeSilver
          : styles.podiumBadgeBronze;

      return (
        <View style={[styles.leaderboardPodiumCard, cardStyle]}>
          <View style={styles.podiumAvatarWrap}>
            {renderAvatar(entry.userId, avatarSize)}
            <View style={[styles.podiumBadge, badgeStyle]}>
              {isFirst ? (
                <Ionicons name="star" size={11} color="#FFF" />
              ) : (
                <Text style={{ color: '#FFF', fontSize: 10, fontFamily: 'Montserrat-Bold' }}>{rank}</Text>
              )}
            </View>
          </View>
          <Text
            style={[styles.podiumName, isFirst && { fontFamily: 'Montserrat-Bold' }]}
            numberOfLines={1}
          >
            {entry.displayName}
          </Text>
          <Text style={isFirst ? styles.podiumXpFirst : styles.podiumXp}>{entry.xp}</Text>
          <Text style={[styles.podiumXpLabel, isFirst && { color: T.primary }]}>XP</Text>
        </View>
      );
    };

    return (
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* ── Weekly Leaderboard Header ── */}
        <View style={styles.leaderboardWeeklyCard}>
          <View style={styles.leaderboardTrophyCircle}>
            <Ionicons name="trophy" size={30} color={T.warning} />
          </View>
          <Text style={styles.leaderboardWeeklyTitle}>{t('community.weeklyLeaderboard')}</Text>
          <Text style={styles.leaderboardWeeklySubtitle}>{t('community.resetsEveryMonday')}</Text>
        </View>

        {/* ── Podium ── */}
        {top3.length > 0 && (
          <View style={styles.leaderboardTop3}>
            {renderPodiumEntry(second, 2)}
            {renderPodiumEntry(first, 1)}
            {renderPodiumEntry(third, 3)}
          </View>
        )}

        {/* ── Divider ── */}
        {rest.length > 0 && (
          <View style={styles.leaderboardDivider}>
            <View style={styles.leaderboardDividerLine} />
            <Text style={styles.leaderboardDividerText}>Rankings</Text>
            <View style={styles.leaderboardDividerLine} />
          </View>
        )}

        {/* ── Leaderboard List ── */}
        {rest.length === 0 && (!leaderboard || leaderboard.entries.length === 0) ? (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={48} color={T.textLight} />
            <Text style={styles.emptyStateText}>{t('community.leaderboardEmpty')}</Text>
          </View>
        ) : (
          rest.map((entry) => {
            const isYou = user != null && entry.userId === user.userId;
            return (
              <View
                key={entry.userId}
                style={[styles.leaderboardRow, isYou && styles.leaderboardRowCurrent]}
              >
                <Text style={[styles.leaderboardRankText, isYou && { color: T.primary }]}>
                  {entry.rank}
                </Text>

                {isYou ? (
                  <View style={styles.leaderboardYouAvatar}>
                    <Ionicons name="star" size={20} color="#FFFFFF" />
                  </View>
                ) : (
                  <View style={{ marginRight: 12 }}>
                    {renderAvatar(entry.userId, 44)}
                  </View>
                )}

                <View style={styles.leaderboardInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.leaderboardName, isYou && { color: T.primary }]}>
                      {isYou ? t('gamification.you') : entry.displayName}
                    </Text>
                    {isYou && (
                      <View style={styles.leaderboardYouPill}>
                        <Text style={styles.leaderboardYouPillText}>{t('gamification.you')}</Text>
                      </View>
                    )}
                  </View>
                  {entry.level != null && (
                    <Text style={styles.leaderboardLevel}>
                      {t('community.leaderboardLevel').replace('{level}', entry.level.toString())}
                    </Text>
                  )}
                </View>

                <View style={styles.leaderboardXpColumn}>
                  <View style={styles.leaderboardXpRow}>
                    <Ionicons name="flash" size={14} color={T.primary} />
                    <Text style={[styles.leaderboardXp, isYou && { color: T.primary }]}>
                      {entry.xp}
                    </Text>
                  </View>
                  <Text style={styles.leaderboardXpLabel}>XP</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    );
  };

  // ════════════════════════════════════════
  //  LOADING / ERROR / MAIN RENDER
  // ════════════════════════════════════════
  if (!user || loading) {
    return (
      <ScreenWrapper style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={T.secondary} />
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
      {/* ── Header ── */}
      <View style={styles.headerSection}>
        <View style={styles.headerIcon}>
          <Ionicons name="people" size={22} color={T.secondary} />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{t('community.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('community.subtitle')}</Text>
        </View>
      </View>

      {/* ── Tab Control ── */}
      <View style={styles.tabContainer}>
        <View style={styles.tabControl}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'friends' ? styles.tabButtonActive : styles.tabButtonInactive]}
            onPress={() => setActiveTab('friends')}
          >
            <Ionicons name="people" size={18} color={activeTab === 'friends' ? '#FFFFFF' : T.textMuted} />
            <Text style={[styles.tabButtonText, activeTab === 'friends' ? styles.tabButtonTextActive : styles.tabButtonTextInactive]}>
              {t('community.friends')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'leaderboard' ? styles.tabButtonActive : styles.tabButtonInactive]}
            onPress={() => setActiveTab('leaderboard')}
          >
            <Ionicons name="trophy" size={18} color={activeTab === 'leaderboard' ? '#FFFFFF' : T.textMuted} />
            <Text style={[styles.tabButtonText, activeTab === 'leaderboard' ? styles.tabButtonTextActive : styles.tabButtonTextInactive]}>
              {t('community.leaderboard')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'friends' ? renderFriendsTab() : renderLeaderboardTab()}
    </ScreenWrapper>
  );
}
