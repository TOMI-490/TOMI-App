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
    backgroundColor: '#FFFFFF', borderRadius: 24, marginBottom: 18,
    ...shadowMd,
  },
  avatarCardInner: { padding: 18, overflow: 'hidden', borderRadius: 24 },

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
    height: 260,
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
    height: 105, backgroundColor: '#C49A6C',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },

  /* Window with curtains */
  roomWindow: {
    position: 'absolute', top: 14, right: 20,
    width: 80, height: 78, alignItems: 'center',
  },
  windowGlass: {
    width: 60, height: 58, backgroundColor: '#B8E4FF',
    borderRadius: 6, borderWidth: 3, borderColor: '#F0EAD6',
    overflow: 'hidden', justifyContent: 'flex-end',
  },
  windowSky: { ...StyleSheet.absoluteFillObject, backgroundColor: '#ADE0FF' },
  windowCloud: {
    position: 'absolute', top: 12, left: 8,
    width: 24, height: 12, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 6,
  },
  windowCurtainLeft: {
    position: 'absolute', top: 0, left: 0,
    width: 16, height: 70, backgroundColor: '#E8A87C',
    borderTopLeftRadius: 4, borderBottomLeftRadius: 8, opacity: 0.7, zIndex: 1,
  },
  windowCurtainRight: {
    position: 'absolute', top: 0, right: 0,
    width: 16, height: 70, backgroundColor: '#E8A87C',
    borderTopRightRadius: 4, borderBottomRightRadius: 8, opacity: 0.7, zIndex: 1,
  },
  windowSill: {
    width: 74, height: 6, backgroundColor: '#E0D4BC',
    borderRadius: 3, marginTop: -1,
  },

  /* Picture frame */
  roomPictureFrame: {
    position: 'absolute', top: 18, right: 110,
    width: 38, height: 32, backgroundColor: '#DFC9A5',
    borderRadius: 4, borderWidth: 3, borderColor: '#C4A472',
    justifyContent: 'center', alignItems: 'center',
  },
  pictureInner: {
    width: 26, height: 20, backgroundColor: '#FFF5E0',
    borderRadius: 2, justifyContent: 'center', alignItems: 'center',
  },

  /* Rug */
  roomRug: {
    position: 'absolute', bottom: 30, width: 140, height: 40,
    backgroundColor: '#E8A87C', borderRadius: 50, opacity: 0.35, alignSelf: 'center',
  },

  /* Sofa */
  roomSofa: {
    position: 'absolute', bottom: 28, right: 12, width: 80, height: 48,
  },
  sofaBack: {
    position: 'absolute', top: 0, left: 4, right: 4, height: 24,
    backgroundColor: '#D98C5F',
    borderTopLeftRadius: 12, borderTopRightRadius: 12,
    borderBottomLeftRadius: 4, borderBottomRightRadius: 4,
  },
  sofaSeat: {
    position: 'absolute', bottom: 4, left: 2, right: 2, height: 20,
    backgroundColor: '#E8A272', borderRadius: 8,
  },
  sofaCushionLeft: {
    position: 'absolute', bottom: 8, left: 6, width: 22, height: 16,
    backgroundColor: '#F0B88A', borderRadius: 6,
  },
  sofaCushionRight: {
    position: 'absolute', bottom: 8, right: 6, width: 22, height: 16,
    backgroundColor: '#F0B88A', borderRadius: 6,
  },
  sofaArmLeft: {
    position: 'absolute', bottom: 4, left: 0, width: 12, height: 32,
    backgroundColor: '#CC8050', borderRadius: 6,
  },
  sofaArmRight: {
    position: 'absolute', bottom: 4, right: 0, width: 12, height: 32,
    backgroundColor: '#CC8050', borderRadius: 6,
  },

  /* Floor lamp with glow */
  roomLampContainer: {
    position: 'absolute', bottom: 24, left: 16, alignItems: 'center',
  },
  roomLampGlow: {
    position: 'absolute', top: -16, width: 50, height: 50,
    borderRadius: 25, backgroundColor: 'rgba(251,191,36,0.15)',
  },
  roomLampShade: {
    width: 28, height: 20, backgroundColor: '#FDE68A',
    borderTopLeftRadius: 12, borderTopRightRadius: 12,
    borderBottomLeftRadius: 2, borderBottomRightRadius: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  roomLampPole: { width: 3, height: 40, backgroundColor: '#B8956A' },
  roomLampBase: { width: 20, height: 6, backgroundColor: '#B8956A', borderRadius: 3 },

  /* Side table + coffee */
  roomSideTable: {
    position: 'absolute', bottom: 30, left: 52, alignItems: 'center',
  },
  sideTableTop: {
    width: 36, height: 20, backgroundColor: '#D4A574',
    borderRadius: 4, borderTopLeftRadius: 6, borderTopRightRadius: 6,
    justifyContent: 'center', alignItems: 'center',
  },
  sideTableLeg: {
    width: 4, height: 12, backgroundColor: '#B8956A', borderRadius: 2,
  },

  /* Plant */
  roomPlant: {
    position: 'absolute', bottom: 30, right: 100, alignItems: 'center',
  },
  plantLeaves: { marginBottom: -4, zIndex: 1 },
  plantPot: {
    width: 18, height: 16, backgroundColor: '#D97B5A',
    borderBottomLeftRadius: 5, borderBottomRightRadius: 5,
    borderTopLeftRadius: 2, borderTopRightRadius: 2,
  },

  /* Bookshelf */
  roomBookshelf: {
    position: 'absolute', top: 18, left: 16, alignItems: 'center',
  },
  bookshelfShelf: {
    width: 52, height: 5, backgroundColor: '#C4A472',
    borderRadius: 2, marginBottom: 2,
  },
  bookRow: { flexDirection: 'row', gap: 3, paddingHorizontal: 4 },
  book: { width: 9, borderRadius: 2 },

  /* Avatar in room */
  avatarTouchable: {
    alignItems: 'center', zIndex: 20,
    position: 'absolute', bottom: 14, alignSelf: 'center',
  },
  avatarContainer: {
    width: 130, height: 130,
    justifyContent: 'flex-end', alignItems: 'center', marginTop: -8,
  },
  avatarShadowPlatform: {
    width: 70, height: 12,
    backgroundColor: 'rgba(0,0,0,0.10)', borderRadius: 30,
    alignSelf: 'center', zIndex: -1,
  },
  avatarPlaceholder: {
    width: 90, height: 90, borderRadius: 45,
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

  /* ── Mood 2x2 grid ──────────────────────────────── */
  moodGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16,
  },
  moodStat: {
    width: '47%' as any,
    backgroundColor: '#F7F5F0', borderRadius: 14,
    paddingVertical: 10, paddingHorizontal: 12,
  },
  moodStatHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6,
  },
  moodStatLabel: { fontSize: 11, fontFamily: F.semiBold, color: T.textPrimary, flex: 1 },
  moodStatValue: { fontSize: 12, fontFamily: F.bold },
  moodBarTrack: {
    width: '100%', height: 5, backgroundColor: '#E8E5DE',
    borderRadius: 3, overflow: 'hidden',
  },
  moodBarFill: { height: '100%', borderRadius: 3 },

  /* ── Mood hint ──────────────────────────────────── */
  moodHint: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F7F5F0', borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 14,
  },
  moodHintText: {
    fontSize: 12, fontFamily: F.medium, color: T.textMuted, flex: 1,
  },

  /* ── Tab Bar ─────────────────────────────────────── */
  tabBar: {
    flexDirection: 'row', gap: 0,
    backgroundColor: '#FFFFFF', borderRadius: 18,
    padding: 4, marginBottom: 24,
    ...shadowMd,
  },
  tab: {
    flex: 1, paddingVertical: 11, alignItems: 'center', borderRadius: 14,
  },
  tabActive: {
    backgroundColor: T.primary,
    ...shadowSm, shadowColor: T.primary, shadowOpacity: 0.35,
  },
  tabText: { fontSize: 13, fontFamily: F.semiBold, color: T.textMuted },
  tabTextActive: { color: '#FFFFFF', fontFamily: F.bold },

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
    ...card, borderRadius: 22, padding: 22, marginBottom: 22,
    borderWidth: 2, borderColor: T.primaryTint,
    ...shadowMd, shadowColor: T.primary, shadowOpacity: 0.12,
  },
  evolutionCurrentLabel: {
    fontSize: 10, fontFamily: F.bold, color: T.primary,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
  },
  evolutionCurrentRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  evolutionIconBox: {
    width: 54, height: 54, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  evolutionName: { fontSize: 22, fontFamily: F.headlineMd, color: T.primary, letterSpacing: -0.3 },
  evolutionDesc: { fontSize: 12, fontFamily: F.regular, color: T.textMuted, marginTop: 3, lineHeight: 18 },
  evolutionPerksList: { gap: 10, marginTop: 6 },
  evolutionPerk: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  evolutionPerkDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.primary },
  evolutionPerkText: { fontSize: 13, fontFamily: F.medium, color: T.textPrimary },

  nextEvoCard: {
    ...card, borderRadius: 22, padding: 20, marginBottom: 22,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    ...shadowMd,
  },
  nextEvoInfo: { flex: 1 },
  nextEvoLabel: { fontSize: 18, fontFamily: F.headlineMd, color: T.textPrimary, letterSpacing: -0.3 },
  nextEvoSubtitle: { fontSize: 12, fontFamily: F.regular, color: T.textMuted, marginTop: 2 },
  nextEvoLevelRange: { fontSize: 11, fontFamily: F.medium, color: T.textMuted, marginTop: 8 },
  nextEvoLevelsToGo: { fontSize: 11, fontFamily: F.semiBold, color: T.primary },
  nextEvoProgress: { width: '100%', height: 7, backgroundColor: '#F0EDE8', borderRadius: 4, overflow: 'hidden', marginTop: 8 },
  nextEvoProgressFill: { height: '100%', borderRadius: 4, backgroundColor: T.secondary },
  nextEvoBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: T.secondaryTint, borderRadius: 10,
  },
  nextEvoBadgeText: { fontSize: 11, fontFamily: F.bold, color: T.secondary },

  evoPathTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  evoPathContainer: { position: 'relative', paddingLeft: 28, marginLeft: 10 },
  evoPathRail: {
    position: 'absolute', left: 14, top: 28, bottom: 28,
    width: 3, borderRadius: 1.5,
  },
  evoPathItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  evoPathDotWrap: {
    position: 'absolute', left: -28, width: 28, alignItems: 'center',
  },
  evoPathDotOuter: {
    width: 16, height: 16, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  evoPathDotInner: { width: 8, height: 8, borderRadius: 4 },
  evoPathCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  evoPathIconBox: {
    width: 46, height: 46, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
  },
  evoPathName: { fontSize: 16, fontFamily: F.headlineMd, color: T.textPrimary, letterSpacing: -0.2 },
  evoPathDesc: { fontSize: 11, fontFamily: F.regular, color: T.textMuted, marginTop: 2 },
  evoPathBadge: {
    marginLeft: 'auto' as any, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  evoPathBadgeText: { fontSize: 10, fontFamily: F.bold, color: '#FFF' },
  evoPathDone: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' as any,
  },
  evoPathDoneText: { fontSize: 11, fontFamily: F.semiBold, color: T.success },

  /* ── Evolution: Eligibility banner ──────────────── */
  evoBanner: {
    ...card, borderRadius: 20, padding: 20, marginBottom: 22,
    borderWidth: 2, borderColor: T.warningTint,
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  evoBannerIconBox: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: T.warningTint,
    justifyContent: 'center', alignItems: 'center',
  },
  evoBannerTitle: { fontSize: 17, fontFamily: F.headlineMd, color: T.textPrimary, letterSpacing: -0.3 },
  evoBannerSub: { fontSize: 12, fontFamily: F.regular, color: T.textMuted, marginTop: 2 },

  /* ── Evolution: Selection cards ────────────────── */
  evoOptionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24,
  },
  evoOptionCard: {
    width: '47%' as any, ...card, borderRadius: 20,
    paddingVertical: 20, paddingHorizontal: 14,
    alignItems: 'center',
  },
  evoOptionCardSelected: {
    borderWidth: 2.5, borderColor: T.primary,
  },
  evoOptionAvatar: {
    width: 72, height: 72, borderRadius: 18, marginBottom: 10,
  },
  evoOptionFallback: {
    width: 72, height: 72, borderRadius: 18,
    backgroundColor: T.primaryTint,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  evoOptionName: {
    fontSize: 14, fontFamily: F.headlineMd, color: T.textPrimary,
    textAlign: 'center', letterSpacing: -0.2,
  },
  evoOptionStage: {
    fontSize: 11, fontFamily: F.semiBold, color: T.primary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 3,
  },

  /* ── Evolution: Confirm button ─────────────────── */
  evoConfirmBtn: {
    backgroundColor: T.primary, borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
    marginBottom: 24,
    ...shadowSm, shadowColor: T.primary, shadowOpacity: 0.35,
  },
  evoConfirmBtnDisabled: { opacity: 0.5 },
  evoConfirmBtnText: { fontSize: 16, fontFamily: F.bold, color: '#FFF' },

  /* ── Evolution: Fully evolved state ────────────── */
  evoFullCard: {
    ...card, borderRadius: 22, padding: 28, marginBottom: 22,
    alignItems: 'center',
    borderWidth: 2, borderColor: '#E0DAF5',
    ...shadowMd, shadowColor: '#7C3AED', shadowOpacity: 0.10,
  },
  evoFullIconBox: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  evoFullTitle: {
    fontSize: 22, fontFamily: F.headlineMd, color: '#7C3AED', letterSpacing: -0.3, marginBottom: 4,
  },
  evoFullSub: {
    fontSize: 13, fontFamily: F.regular, color: T.textMuted, textAlign: 'center', lineHeight: 19,
  },

  /* ── Evolution: Current stage info ─────────────── */
  evoStageRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18,
  },
  evoStageAvatar: {
    width: 60, height: 60, borderRadius: 16,
  },
  evoStageFallback: {
    width: 60, height: 60, borderRadius: 16,
    backgroundColor: T.primaryTint,
    justifyContent: 'center', alignItems: 'center',
  },
  evoStageName: { fontSize: 20, fontFamily: F.headlineMd, color: T.textPrimary, letterSpacing: -0.3 },
  evoStageBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: T.primaryTint, borderRadius: 10, marginTop: 4,
    alignSelf: 'flex-start',
  },
  evoStageBadgeText: { fontSize: 11, fontFamily: F.bold, color: T.primary, textTransform: 'uppercase' },

  /* ── Evolution: Next threshold info ────────────── */
  evoNextInfo: {
    ...card, borderRadius: 18, padding: 16, marginBottom: 22,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  evoNextIconBox: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: T.secondaryTint,
    justifyContent: 'center', alignItems: 'center',
  },
  evoNextLabel: { fontSize: 14, fontFamily: F.semiBold, color: T.textPrimary },
  evoNextSub: { fontSize: 12, fontFamily: F.regular, color: T.textMuted, marginTop: 2 },

  /* ── Stats Tab ───────────────────────────────────── */
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 22,
  },
  statCard: {
    width: '47%' as any, ...card, borderRadius: 22, paddingVertical: 24,
    alignItems: 'center', ...shadowMd,
  },
  statIconBox: {
    width: 54, height: 54, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  statValue: { fontSize: 30, fontFamily: F.black, color: T.textPrimary, letterSpacing: -0.6 },
  statLabel: {
    fontSize: 10, fontFamily: F.bold, color: T.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 4,
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
