import { StyleSheet } from 'react-native';

export const avatarPageStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },

  // ── Loading / Error ──────────────────────────────────────────────
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 8,
  },
  errorText: {
    fontSize: 15,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 12,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
  },

  // ── Header ───────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },

  // ── Avatar card ──────────────────────────────────────────────────
  avatarCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  gifContainer: {
    width: 180,
    height: 180,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gifPlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nickname: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  levelLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 12,
  },

  // ── XP bar ───────────────────────────────────────────────────────
  xpSection: {
    width: '100%',
    marginBottom: 4,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  xpLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  xpValue: {
    fontSize: 12,
    color: '#8E8E93',
  },
  xpBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  // ── Age badge ────────────────────────────────────────────────────
  ageBadge: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#F0F0F5',
  },
  ageBadgeText: {
    fontSize: 12,
    color: '#636366',
    fontWeight: '500',
  },

  // ── Stats grid ───────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    marginTop: 4,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  moodCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  moodIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  moodLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 6,
    fontWeight: '500',
  },
  moodBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  moodBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  moodValue: {
    fontSize: 11,
    color: '#AEAEB2',
  },

  // ── Stats row ────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
});
