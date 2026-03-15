import { StyleSheet, Platform } from 'react-native';
import { TOMI_THEME as T } from '../../constants/theme';
import { F } from '../../constants/fonts';

const shadowSm = {
  shadowColor: '#8891A5', shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.16, shadowRadius: 8, elevation: 4,
} as const;

const shadowMd = {
  shadowColor: '#8891A5', shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.22, shadowRadius: 14, elevation: 6,
} as const;

const card = { backgroundColor: '#FFFFFF', borderRadius: 22, ...shadowSm } as const;

export const avatarPageStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EDEAE3' },
  scroll: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 120 },

  /* ── Loading / Error ─────────────────────────────── */
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 10, fontSize: 14, fontFamily: F.medium, color: T.textMuted },
  errorText: { fontSize: 15, fontFamily: F.medium, color: T.danger, textAlign: 'center', marginBottom: 16 },
  retryButton: {
    paddingHorizontal: 24, paddingVertical: 10,
    backgroundColor: T.primary, borderRadius: 14,
  },
  retryText: { color: '#FFF', fontFamily: F.bold, fontSize: 15 },

  /* ── Header ──────────────────────────────────────── */
  companionPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: T.successTint,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    marginBottom: 10,
  },
  companionPillText: { fontSize: 13, fontFamily: F.semiBold, color: T.success },
  headerTitle: { fontSize: 28, fontFamily: F.headline, color: T.textPrimary, letterSpacing: -0.8 },
  headerSubtitle: { fontSize: 13, fontFamily: F.regular, color: T.textMuted, marginTop: 3, marginBottom: 20 },

  /* ── Avatar Card ─────────────────────────────────── */
  avatarCard: {
    ...card, borderRadius: 24, padding: 0, overflow: 'hidden', marginBottom: 18,
  },
  avatarCardInner: { padding: 18 },

  /* Top row: name + level */
  avatarTopRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarNickname: { fontSize: 22, fontFamily: F.headlineMd, color: T.textPrimary, letterSpacing: -0.4 },
  avatarMeta: { fontSize: 12, fontFamily: F.regular, color: T.textMuted, marginTop: 2 },
  levelBadge: {
    alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: T.primaryTint, borderRadius: 14,
  },
  levelBadgeLabel: { fontSize: 10, fontFamily: F.semiBold, color: T.primary, letterSpacing: 0.4, textTransform: 'uppercase' },
  levelBadgeValue: { fontSize: 22, fontFamily: F.black, color: T.primary, letterSpacing: -0.5 },

  /* Living room scene — matches Home page exactly */
  livingRoom: {
    backgroundColor: '#F5E6C8',
    borderRadius: 24,
    height: 220,
    marginBottom: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  roomWall: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: '58%' as any,
    backgroundColor: '#FDF1DC',
  },
  roomWainscoting: {
    position: 'absolute', top: '55%' as any, left: 0, right: 0,
    height: 6, backgroundColor: '#E8D5B0',
  },
  roomFloor: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 90, backgroundColor: '#C49A6C',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },

  /* Window with curtains */
  roomWindow: {
    position: 'absolute', top: 10, right: 16,
    width: 72, height: 70, alignItems: 'center',
  },
  windowGlass: {
    width: 54, height: 52, backgroundColor: '#B8E4FF',
    borderRadius: 6, borderWidth: 3, borderColor: '#F0EAD6',
    overflow: 'hidden', justifyContent: 'flex-end',
  },
  windowSky: { ...StyleSheet.absoluteFillObject, backgroundColor: '#ADE0FF' },
  windowCloud: {
    position: 'absolute', top: 10, left: 6,
    width: 22, height: 10, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 5,
  },
  windowCurtainLeft: {
    position: 'absolute', top: 0, left: 0,
    width: 14, height: 62, backgroundColor: '#E8A87C',
    borderTopLeftRadius: 4, borderBottomLeftRadius: 8, opacity: 0.7, zIndex: 1,
  },
  windowCurtainRight: {
    position: 'absolute', top: 0, right: 0,
    width: 14, height: 62, backgroundColor: '#E8A87C',
    borderTopRightRadius: 4, borderBottomRightRadius: 8, opacity: 0.7, zIndex: 1,
  },
  windowSill: {
    width: 66, height: 6, backgroundColor: '#E0D4BC',
    borderRadius: 3, marginTop: -1,
  },

  /* Picture frame */
  roomPictureFrame: {
    position: 'absolute', top: 14, right: 96,
    width: 34, height: 28, backgroundColor: '#DFC9A5',
    borderRadius: 4, borderWidth: 3, borderColor: '#C4A472',
    justifyContent: 'center', alignItems: 'center',
  },
  pictureInner: {
    width: 22, height: 16, backgroundColor: '#FFF5E0',
    borderRadius: 2, justifyContent: 'center', alignItems: 'center',
  },

  /* Rug */
  roomRug: {
    position: 'absolute', bottom: 24, width: 120, height: 35,
    backgroundColor: '#E8A87C', borderRadius: 50, opacity: 0.35, alignSelf: 'center',
  },

  /* Sofa */
  roomSofa: {
    position: 'absolute', bottom: 22, right: 10, width: 70, height: 42,
  },
  sofaBack: {
    position: 'absolute', top: 0, left: 4, right: 4, height: 20,
    backgroundColor: '#D98C5F',
    borderTopLeftRadius: 10, borderTopRightRadius: 10,
    borderBottomLeftRadius: 4, borderBottomRightRadius: 4,
  },
  sofaSeat: {
    position: 'absolute', bottom: 4, left: 2, right: 2, height: 18,
    backgroundColor: '#E8A272', borderRadius: 8,
  },
  sofaCushionLeft: {
    position: 'absolute', bottom: 8, left: 6, width: 18, height: 14,
    backgroundColor: '#F0B88A', borderRadius: 6,
  },
  sofaCushionRight: {
    position: 'absolute', bottom: 8, right: 6, width: 18, height: 14,
    backgroundColor: '#F0B88A', borderRadius: 6,
  },
  sofaArmLeft: {
    position: 'absolute', bottom: 4, left: 0, width: 10, height: 28,
    backgroundColor: '#CC8050', borderRadius: 6,
  },
  sofaArmRight: {
    position: 'absolute', bottom: 4, right: 0, width: 10, height: 28,
    backgroundColor: '#CC8050', borderRadius: 6,
  },

  /* Floor lamp with glow */
  roomLampContainer: {
    position: 'absolute', bottom: 18, left: 14, alignItems: 'center',
  },
  roomLampGlow: {
    position: 'absolute', top: -14, width: 44, height: 44,
    borderRadius: 22, backgroundColor: 'rgba(251,191,36,0.15)',
  },
  roomLampShade: {
    width: 26, height: 18, backgroundColor: '#FDE68A',
    borderTopLeftRadius: 10, borderTopRightRadius: 10,
    borderBottomLeftRadius: 2, borderBottomRightRadius: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  roomLampPole: { width: 3, height: 34, backgroundColor: '#B8956A' },
  roomLampBase: { width: 18, height: 5, backgroundColor: '#B8956A', borderRadius: 3 },

  /* Side table + coffee */
  roomSideTable: {
    position: 'absolute', bottom: 24, left: 46, alignItems: 'center',
  },
  sideTableTop: {
    width: 32, height: 18, backgroundColor: '#D4A574',
    borderRadius: 4, borderTopLeftRadius: 6, borderTopRightRadius: 6,
    justifyContent: 'center', alignItems: 'center',
  },
  sideTableLeg: {
    width: 4, height: 10, backgroundColor: '#B8956A', borderRadius: 2,
  },

  /* Plant */
  roomPlant: {
    position: 'absolute', bottom: 24, right: 86, alignItems: 'center',
  },
  plantLeaves: { marginBottom: -4, zIndex: 1 },
  plantPot: {
    width: 16, height: 14, backgroundColor: '#D97B5A',
    borderBottomLeftRadius: 4, borderBottomRightRadius: 4,
    borderTopLeftRadius: 2, borderTopRightRadius: 2,
  },

  /* Bookshelf */
  roomBookshelf: {
    position: 'absolute', top: 16, left: 14, alignItems: 'center',
  },
  bookshelfShelf: {
    width: 46, height: 4, backgroundColor: '#C4A472',
    borderRadius: 2, marginBottom: 2,
  },
  bookRow: { flexDirection: 'row', gap: 2, paddingHorizontal: 3 },
  book: { width: 8, borderRadius: 2 },

  /* Avatar in room */
  avatarTouchable: {
    alignItems: 'center', zIndex: 20,
    position: 'absolute', bottom: 8, alignSelf: 'center',
  },
  avatarContainer: {
    width: 110, height: 110,
    justifyContent: 'flex-end', alignItems: 'center', marginTop: -8,
  },
  avatarShadowPlatform: {
    width: 60, height: 10,
    backgroundColor: 'rgba(0,0,0,0.10)', borderRadius: 30,
    alignSelf: 'center', zIndex: -1,
  },
  avatarPlaceholder: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
  },

  /* XP Progress */
  xpRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8,
  },
  xpLabel: { fontSize: 13, fontFamily: F.semiBold, color: T.textPrimary },
  xpValue: { fontSize: 13, fontFamily: F.bold, color: T.primary },
  xpBarTrack: {
    width: '100%', height: 8, backgroundColor: '#F0EDE8',
    borderRadius: 4, overflow: 'hidden', marginBottom: 16,
  },
  xpBarFill: { height: '100%', borderRadius: 4 },

  /* Mood compact row */
  moodRow: {
    flexDirection: 'row', gap: 10, marginBottom: 16,
  },
  moodPill: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F7F5F0', borderRadius: 14,
    paddingVertical: 10, paddingHorizontal: 14,
  },
  moodPillIcon: { opacity: 0.8 },
  moodPillLabel: { fontSize: 12, fontFamily: F.medium, color: T.textPrimary },
  moodPillValue: { fontSize: 13, fontFamily: F.bold, marginLeft: 'auto' as any },
  moodBarMini: {
    width: '100%', height: 4, backgroundColor: '#E8E5DE',
    borderRadius: 2, overflow: 'hidden', marginTop: 6,
  },
  moodBarMiniFill: { height: '100%', borderRadius: 2 },

  /* Action buttons */
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 13, borderRadius: 16,
  },
  actionBtnFeed: { backgroundColor: T.successTint },
  actionBtnRest: { backgroundColor: T.secondaryTint },
  actionBtnText: { fontSize: 15, fontFamily: F.bold },
  actionBtnTextFeed: { color: T.success },
  actionBtnTextRest: { color: T.secondary },

  /* ── Tab Bar ─────────────────────────────────────── */
  tabBar: {
    flexDirection: 'row', gap: 0,
    backgroundColor: '#FFFFFF', borderRadius: 16,
    padding: 4, marginBottom: 22,
    ...shadowSm,
  },
  tab: {
    flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12,
  },
  tabActive: { backgroundColor: T.primary },
  tabText: { fontSize: 13, fontFamily: F.semiBold, color: T.textMuted },
  tabTextActive: { color: '#FFFFFF' },

  /* ── Customize Tab ───────────────────────────────── */
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontFamily: F.headlineMd, color: T.textPrimary, letterSpacing: -0.4 },
  avatarGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28,
  },
  avatarOption: {
    width: '22%' as any, aspectRatio: 1, ...card, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  avatarOptionSelected: { borderWidth: 2.5, borderColor: T.primary },
  avatarOptionLocked: { opacity: 0.45 },
  avatarOptionImage: { width: '70%', height: '70%' },
  avatarOptionName: {
    fontSize: 10, fontFamily: F.medium, color: T.textMuted,
    textAlign: 'center', marginTop: 4,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.55)',
    justifyContent: 'center', alignItems: 'center', borderRadius: 18,
  },

  accessoryGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20,
  },
  accessoryOption: {
    width: '22%' as any, aspectRatio: 1, ...card, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  accessorySelected: { borderWidth: 2.5, borderColor: T.primary },
  accessoryLocked: { opacity: 0.45 },
  accessoryName: { fontSize: 10, fontFamily: F.medium, color: T.textMuted, textAlign: 'center', marginTop: 4 },

  /* ── Evolution Tab ───────────────────────────────── */
  evolutionCurrentCard: {
    ...card, borderRadius: 20, padding: 20, marginBottom: 20,
    borderWidth: 2, borderColor: T.primaryTint,
  },
  evolutionCurrentLabel: {
    fontSize: 11, fontFamily: F.semiBold, color: T.primary,
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8,
  },
  evolutionCurrentRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  evolutionIconBox: {
    width: 52, height: 52, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  evolutionName: { fontSize: 20, fontFamily: F.headlineMd, color: T.primary, letterSpacing: -0.3 },
  evolutionDesc: { fontSize: 12, fontFamily: F.regular, color: T.textMuted, marginTop: 2, lineHeight: 17 },
  evolutionPerksList: { gap: 8, marginTop: 4 },
  evolutionPerk: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  evolutionPerkDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.primary },
  evolutionPerkText: { fontSize: 13, fontFamily: F.medium, color: T.textPrimary },

  nextEvoCard: {
    ...card, borderRadius: 20, padding: 18, marginBottom: 20,
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  nextEvoInfo: { flex: 1 },
  nextEvoLabel: { fontSize: 18, fontFamily: F.headlineMd, color: T.textPrimary, letterSpacing: -0.3 },
  nextEvoSubtitle: { fontSize: 12, fontFamily: F.regular, color: T.textMuted, marginTop: 2 },
  nextEvoLevelRange: { fontSize: 11, fontFamily: F.medium, color: T.textMuted, marginTop: 8 },
  nextEvoLevelsToGo: { fontSize: 11, fontFamily: F.semiBold, color: T.primary },
  nextEvoProgress: { width: '100%', height: 6, backgroundColor: '#F0EDE8', borderRadius: 3, overflow: 'hidden', marginTop: 8 },
  nextEvoProgressFill: { height: '100%', borderRadius: 3, backgroundColor: T.secondary },
  nextEvoBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: T.secondaryTint, borderRadius: 10,
  },
  nextEvoBadgeText: { fontSize: 11, fontFamily: F.bold, color: T.secondary },

  evoPathTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  evoPathItem: {
    flexDirection: 'row', alignItems: 'flex-start', marginBottom: 0,
  },
  evoPathLine: {
    width: 3, alignSelf: 'stretch', marginLeft: 23, marginRight: 14,
    backgroundColor: T.secondary,
  },
  evoPathLinePending: { backgroundColor: '#E0E0E0' },
  evoPathDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: T.secondary,
    position: 'absolute', left: 19, top: 18,
    zIndex: 2,
  },
  evoPathDotPending: { backgroundColor: '#D0D0D0' },
  evoPathCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14,
  },
  evoPathIconBox: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  evoPathName: { fontSize: 15, fontFamily: F.headlineMd, color: T.textPrimary, letterSpacing: -0.2 },
  evoPathDesc: { fontSize: 11, fontFamily: F.regular, color: T.textMuted, marginTop: 1 },
  evoPathBadge: {
    marginLeft: 'auto' as any, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  evoPathBadgeText: { fontSize: 10, fontFamily: F.bold, color: '#FFF' },
  evoPathDone: {
    flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 'auto' as any,
  },
  evoPathDoneText: { fontSize: 10, fontFamily: F.semiBold, color: T.success },

  /* ── Stats Tab ───────────────────────────────────── */
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20,
  },
  statCard: {
    width: '47%' as any, ...card, borderRadius: 20, paddingVertical: 22,
    alignItems: 'center', ...shadowMd,
  },
  statIconBox: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  statValue: { fontSize: 28, fontFamily: F.black, color: T.textPrimary, letterSpacing: -0.6 },
  statLabel: {
    fontSize: 11, fontFamily: F.semiBold, color: T.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4,
  },

  milestoneCard: {
    ...card, borderRadius: 20, padding: 20, marginBottom: 20,
    borderWidth: 1.5, borderColor: T.primaryTint,
  },
  milestoneHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  milestoneTitle: { fontSize: 16, fontFamily: F.headlineMd, color: T.textPrimary, letterSpacing: -0.3 },
  milestoneLvl: { fontSize: 13, fontFamily: F.bold, color: T.primary },
  milestoneBar: { width: '100%', height: 10, backgroundColor: '#F0EDE8', borderRadius: 5, overflow: 'hidden', marginBottom: 12 },
  milestoneBarFill: { height: '100%', borderRadius: 5 },
  milestoneDesc: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: T.primaryTint, borderRadius: 12, padding: 14,
  },
  milestoneDescText: { fontSize: 12, fontFamily: F.medium, color: T.textPrimary, flex: 1, lineHeight: 17 },

  /* ── Shop Tab ────────────────────────────────────── */
  shopEmpty: { alignItems: 'center', paddingVertical: 40 },
  shopEmptyText: { fontSize: 14, fontFamily: F.medium, color: T.textMuted, marginTop: 10, textAlign: 'center' },

  /* ── General ─────────────────────────────────────── */
  container: { flex: 1, backgroundColor: '#EDEAE3' },
  content: { padding: 18, paddingBottom: 120 },
});
