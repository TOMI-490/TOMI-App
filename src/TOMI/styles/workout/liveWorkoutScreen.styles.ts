import { StyleSheet, Platform, Dimensions } from 'react-native';
import { TOMI_THEME as T } from '../../constants/theme';
import { F } from '../../constants/fonts';

const { height: SCREEN_H } = Dimensions.get('window');

const shadowSm = {
  shadowColor: '#8891A5', shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.14, shadowRadius: 8, elevation: 4,
} as const;

const shadowMd = {
  shadowColor: '#8891A5', shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.20, shadowRadius: 14, elevation: 6,
} as const;

const card = { backgroundColor: '#FFFFFF', borderRadius: 22, ...shadowSm } as const;

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EDEAE3' },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EDEAE3',
  },

  /* ── Header ──────────────────────────────────────── */
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 54 : 34, paddingBottom: 14,
  },
  headerIconBox: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: T.primaryTint, justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 24, fontFamily: F.headline, color: '#1A1A1A', letterSpacing: -0.6 },
  headerStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontFamily: F.semiBold },

  /* ── Map card ────────────────────────────────────── */
  mapCard: {
    marginHorizontal: 18, borderRadius: 22, overflow: 'hidden',
    height: SCREEN_H * 0.3,
    ...shadowMd,
  },
  map: { flex: 1 },
  noMapPlaceholder: {
    flex: 1, backgroundColor: '#F5F2ED', borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  placeholderAvatar: { width: 130, height: 130 },
  placeholderTypeName: {
    fontSize: 17, fontFamily: F.headlineMd, color: T.textMuted, marginTop: 8,
  },
  mapOverlay: {
    position: 'absolute', bottom: 12, left: 14, right: 14,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  mapPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 10,
    ...shadowSm,
  },
  mapPillValue: { fontSize: 17, fontFamily: F.black, color: T.textPrimary },
  mapPillUnit: { fontSize: 9, fontFamily: F.bold, color: T.textMuted, textTransform: 'uppercase' },

  /* ── Content area ────────────────────────────────── */
  content: { flex: 1, paddingHorizontal: 18 },
  contentScroll: { paddingTop: 18, paddingBottom: 8 },

  /* ── Timer card ──────────────────────────────────── */
  timerCard: {
    borderRadius: 22, backgroundColor: T.primary,
    paddingVertical: 20, paddingHorizontal: 16, alignItems: 'center',
    marginBottom: 16,
    ...shadowMd, shadowColor: T.primary, shadowOpacity: 0.35,
  },
  timerLabel: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
  timerLabelText: {
    fontSize: 10, fontFamily: F.bold, color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase', letterSpacing: 1.2,
  },
  timerRow: { flexDirection: 'row', alignItems: 'center' },
  timerBlock: { alignItems: 'center', minWidth: 60 },
  timerDigit: { fontSize: 46, fontFamily: F.black, color: '#FFFFFF', letterSpacing: -1 },
  timerUnit: { fontSize: 9, fontFamily: F.semiBold, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginTop: -4 },
  timerColon: { fontSize: 38, fontFamily: F.black, color: 'rgba(255,255,255,0.45)', marginHorizontal: 2, marginTop: -6 },

  /* ── Stats row ───────────────────────────────────── */
  statsRow: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  statCard: {
    flex: 1, ...card, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 14,
    alignItems: 'center',
  },
  statCardIconBox: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  statCardLabel: {
    fontSize: 9, fontFamily: F.bold, color: T.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
  },
  statCardValue: { fontSize: 28, fontFamily: F.black, color: T.textPrimary, letterSpacing: -0.6 },
  statCardUnit: { fontSize: 11, fontFamily: F.medium, color: T.textMuted, marginTop: 2 },

  /* ── XP inline row ───────────────────────────────── */
  xpRow: {
    ...card, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16,
  },
  xpIconBox: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: T.primaryTint, justifyContent: 'center', alignItems: 'center',
  },
  xpLabel: { fontSize: 12, fontFamily: F.semiBold, color: T.textMuted },
  xpValue: { fontSize: 22, fontFamily: F.black, color: T.primary, letterSpacing: -0.3 },
  xpSpacer: { flex: 1 },
  xpBadge: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: T.primaryTint, justifyContent: 'center', alignItems: 'center',
  },

  /* ── Controls ────────────────────────────────────── */
  controlsRow: {
    flexDirection: 'row', gap: 12, alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 34 : 18,
  },
  pauseBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 17, borderRadius: 20,
    backgroundColor: T.primary,
    ...shadowMd, shadowColor: T.primary, shadowOpacity: 0.35,
  },
  pauseBtnText: { fontSize: 17, fontFamily: F.bold, color: '#FFFFFF' },
  endBtn: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: '#FFF', borderWidth: 2, borderColor: T.danger,
    justifyContent: 'center', alignItems: 'center',
    ...shadowSm,
  },
});
