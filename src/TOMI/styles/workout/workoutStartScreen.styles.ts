import { StyleSheet } from 'react-native';
import { TOMI_THEME as T } from '../../constants/theme';
import { F } from '../../constants/fonts';

const shadowSm = {
  shadowColor: '#8891A5', shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.18, shadowRadius: 8, elevation: 4,
} as const;

const shadowMd = {
  shadowColor: '#8891A5', shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.24, shadowRadius: 16, elevation: 7,
} as const;

const shadowLg = {
  shadowColor: '#8891A5', shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.28, shadowRadius: 22, elevation: 10,
} as const;

const card = { backgroundColor: '#FFFFFF', borderRadius: 20, ...shadowSm } as const;

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EDEAE3' },
  scroll: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 120 },

  /* ── Loading ───────────────────────────────────── */
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EDEAE3' },
  loadingText: { marginTop: 10, fontSize: 14, fontFamily: F.medium, color: T.textMuted },

  /* ── Header ────────────────────────────────────── */
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 22 },
  headerIconBox: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: T.primaryTintMed,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'rgba(255,122,61,0.12)',
  },
  headerTitle: { fontSize: 30, fontFamily: F.headline, color: T.textPrimary, letterSpacing: -1 },
  headerSubtitle: { fontSize: 13, fontFamily: F.medium, color: T.textMuted, marginTop: 2 },

  /* ── Stats row ─────────────────────────────────── */
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1, ...card, paddingVertical: 16, paddingHorizontal: 8,
    alignItems: 'center', borderRadius: 18,
  },
  statIconRow: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: T.primaryTint, justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 24, fontFamily: F.black, color: T.textPrimary, letterSpacing: -0.6 },
  statLabel: {
    fontSize: 9, fontFamily: F.semiBold, color: T.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.7, textAlign: 'center', marginTop: 3,
  },

  /* ── Quick Start ───────────────────────────────── */
  quickStartCard: {
    ...card, borderRadius: 20, padding: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 14, ...shadowMd,
  },
  quickStartLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  quickStartIconBox: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: T.primaryTint, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,122,61,0.15)',
  },
  quickStartTitle: { fontSize: 16, fontFamily: F.bold, color: T.textPrimary },
  quickStartSubtitle: { fontSize: 11, fontFamily: F.regular, color: T.textMuted, marginTop: 2, lineHeight: 15 },
  quickStartBtn: {
    backgroundColor: T.primary, borderRadius: 14,
    paddingVertical: 11, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    ...shadowMd, shadowColor: T.primary, shadowOpacity: 0.45,
  },
  quickStartBtnText: { fontSize: 14, fontFamily: F.bold, color: '#FFF' },

  /* ── Sensor / BLE test ─────────────────────────── */
  sensorBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: T.secondaryTint,
    borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14,
    marginBottom: 24, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(78,155,232,0.18)',
  },
  sensorBtnText: { fontSize: 11, fontFamily: F.semiBold, color: T.secondary },

  /* ── Section header ────────────────────────────── */
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionIcon: { opacity: 0.8 },
  sectionTitle: { fontSize: 22, fontFamily: F.headline, color: T.textPrimary, letterSpacing: -0.6 },
  viewAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: T.primaryTint, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
  },
  viewAllText: { fontSize: 12, fontFamily: F.semiBold, color: T.primary },

  /* ── Categories grid ───────────────────────────── */
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  categoryCard: {
    width: '47%' as any, ...card, borderRadius: 20,
    paddingVertical: 22, paddingHorizontal: 16, alignItems: 'flex-start',
    ...shadowMd,
  },
  categoryIconBox: {
    width: 52, height: 52, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  categoryName: { fontSize: 17, fontFamily: F.bold, color: T.textPrimary, letterSpacing: -0.2 },
  categoryCount: { fontSize: 11, fontFamily: F.regular, color: T.textMuted, marginTop: 3 },

  /* ── Featured workout card ─────────────────────── */
  featuredCard: {
    ...card, borderRadius: 22, padding: 20, marginBottom: 16, ...shadowMd,
  },
  featuredTop: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  featuredIconBox: {
    width: 56, height: 56, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  featuredInfo: { flex: 1 },
  featuredNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  featuredName: { fontSize: 18, fontFamily: F.headlineMd, color: T.textPrimary, letterSpacing: -0.4 },
  difficultyPill: { borderRadius: 10, paddingVertical: 3, paddingHorizontal: 10 },
  difficultyText: { fontSize: 10, fontFamily: F.bold, color: '#FFF', letterSpacing: 0.2 },
  featuredDesc: { fontSize: 12, fontFamily: F.regular, color: T.textMuted, lineHeight: 18 },
  featuredDivider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: 14 },
  featuredMeta: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, fontFamily: F.medium, color: T.textMuted },
  featuredBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  xpChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: T.primaryTint, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
  },
  xpChipText: { fontSize: 12, fontFamily: F.black, color: T.primary },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: T.primary, borderRadius: 16,
    paddingVertical: 12, paddingHorizontal: 22,
    ...shadowLg, shadowColor: T.primary, shadowOpacity: 0.50,
  },
  startBtnText: { fontSize: 14, fontFamily: F.bold, color: '#FFF' },

  /* ── Do It Again ───────────────────────────────── */
  pastCard: {
    ...card, borderRadius: 18, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 10,
  },
  pastAccent: {
    width: 4, borderRadius: 2, alignSelf: 'stretch', marginRight: 12,
  },
  pastIconBox: {
    width: 48, height: 48, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  pastInfo: { flex: 1 },
  pastName: { fontSize: 15, fontFamily: F.headlineMd, color: T.textPrimary, letterSpacing: -0.2 },
  pastMeta: { fontSize: 11, fontFamily: F.regular, color: T.textMuted, marginTop: 3 },
  pastXp: { flexDirection: 'row', alignItems: 'center', gap: 3, marginRight: 12 },
  pastXpText: { fontSize: 12, fontFamily: F.bold, color: T.primary },
  pastPlayBtn: {
    width: 38, height: 38, borderRadius: 14,
    backgroundColor: T.primaryTint, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,122,61,0.15)',
  },

  /* ── Create Custom CTA ─────────────────────────── */
  customCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 28,
    alignItems: 'center', marginTop: 12, marginBottom: 10,
    ...shadowLg,
  },
  customIconBox: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: T.primaryTint, justifyContent: 'center', alignItems: 'center',
    marginBottom: 16, borderWidth: 2, borderColor: 'rgba(255,122,61,0.15)',
  },
  customTitle: { fontSize: 19, fontFamily: F.headlineMd, color: T.textPrimary, marginBottom: 6 },
  customSubtitle: { fontSize: 13, fontFamily: F.regular, color: T.textMuted, marginBottom: 18, textAlign: 'center', lineHeight: 19 },
  customBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: T.primary, borderRadius: 16,
    paddingVertical: 13, paddingHorizontal: 24,
    ...shadowLg, shadowColor: T.primary, shadowOpacity: 0.50,
  },
  customBtnText: { fontSize: 14, fontFamily: F.bold, color: '#FFF' },
});
