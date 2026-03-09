/**
 * HomeScreen styles — high-fidelity revision
 *
 * Design token values are sourced from src/TOMI/constants/theme.ts (TOMI_THEME)
 * so all colour references stay in sync with styles/theme.css and tailwind.config.js.
 *
 * Glass-morphism in React Native:
 *   • True `backdrop-filter: blur()` is not available natively.
 *   • We approximate with semi-transparent white backgrounds + strong drop
 *     shadows + near-white borders — visually very close on-device.
 *   • Critical frosted surfaces layer a rgba(255,255,255,0.20) View on top.
 */

import { StyleSheet } from 'react-native';
import { TOMI_THEME as T } from '../../constants/theme';

/* ─── Shared shadow presets ─────────────────────────────────────────────────── */
const shadowSm = {
  shadowColor:   '#000',
  shadowOffset:  { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius:  6,
  elevation:     3,
} as const;

const shadowMd = {
  shadowColor:   '#000',
  shadowOffset:  { width: 0, height: 4 },
  shadowOpacity: 0.10,
  shadowRadius:  12,
  elevation:     6,
} as const;

const shadowLg = {
  shadowColor:   '#000',
  shadowOffset:  { width: 0, height: 8 },
  shadowOpacity: 0.15,
  shadowRadius:  20,
  elevation:     10,
} as const;

const shadowXl = {
  shadowColor:   '#000',
  shadowOffset:  { width: 0, height: 12 },
  shadowOpacity: 0.22,
  shadowRadius:  28,
  elevation:     14,
} as const;

/* ─── Reusable glass surfaces ───────────────────────────────────────────────── */
const glassSurface = {
  backgroundColor: T.glassBg,
  borderWidth:     1,
  borderColor:     T.glassBorder,
} as const;

const glassSurfaceSubtle = {
  backgroundColor: T.glassBgSubtle,
  borderWidth:     1,
  borderColor:     T.glassBorder,
} as const;

/* ─── StyleSheet ─────────────────────────────────────────────────────────────── */
export const homePageStyles = StyleSheet.create({

  /* ── Scaffold ──────────────────────────────────────────────────────────────── */
  screen: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop:        24,
    paddingBottom:     104,
  },
  sectionGap: { height: 20 },

  /* ── Loading / Error ───────────────────────────────────────────────────────── */
  loadingContainer: {
    flex: 1,
    justifyContent:  'center',
    alignItems:      'center',
    backgroundColor: T.background,
  },
  loadingText: {
    marginTop:  12,
    fontSize:   16,
    fontFamily: 'Montserrat-Medium',
    color:      T.textMuted,
  },
  errorContainer: {
    flex:            1,
    justifyContent:  'center',
    alignItems:      'center',
    padding:         24,
    backgroundColor: T.background,
  },
  errorText: {
    fontSize:     15,
    fontFamily:   'Montserrat-Regular',
    color:        T.danger,
    textAlign:    'center',
    marginBottom: 16,
    lineHeight:   22,
  },
  retryBtn: {
    backgroundColor:   T.primary,
    paddingVertical:   12,
    paddingHorizontal: 24,
    borderRadius:      12,
  },
  retryBtnText: {
    fontSize:   15,
    fontWeight: '700',
    fontFamily: 'Montserrat-Bold',
    color:      '#FFF',
  },

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* Section 1 — Greeting                                                         */
  /* ─────────────────────────────────────────────────────────────────────────── */
  greetingPill: {
    alignSelf:         'flex-start',
    backgroundColor:   'rgba(255,140,66,0.12)',
    borderRadius:      20,
    paddingVertical:   5,
    paddingHorizontal: 14,
    marginBottom:      10,
    borderWidth:       1,
    borderColor:       'rgba(255,140,66,0.25)',
  },
  greetingPillText: {
    fontSize:      13,
    fontWeight:    '600',
    fontFamily:    'Montserrat-SemiBold',
    color:         T.primary,
    letterSpacing: 0.2,
  },
  greetingTitle: {
    fontSize:      38,
    fontWeight:    '900',
    fontFamily:    'SangBleu-Black',
    color:         T.textPrimary,
    lineHeight:    44,
    marginBottom:  6,
    letterSpacing: -0.8,
  },
  greetingSubtitle: {
    fontSize:      15,
    fontWeight:    '500',
    fontFamily:    'Montserrat-Medium',
    color:         T.textMuted,
    lineHeight:    22,
  },

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* Section 2 — Stats overview (3-column grid)                                   */
  /* ─────────────────────────────────────────────────────────────────────────── */
  statsRow: {
    flexDirection: 'row',
    gap:           12,
  },
  statCard: {
    flex:              1,
    backgroundColor:   '#FFFFFF',
    borderRadius:      18,
    paddingVertical:   18,
    paddingHorizontal: 12,
    alignItems:        'center',
    ...shadowMd,
    borderWidth:       1,
    borderColor:       'rgba(0,0,0,0.05)',
  },
  statIconBox: {
    width:          48,
    height:         48,
    borderRadius:   24,
    justifyContent: 'center',
    alignItems:     'center',
    marginBottom:   10,
  },
  statValue: {
    fontSize:      28,
    fontWeight:    '900',
    fontFamily:    'Montserrat-Black',
    color:         T.textPrimary,
    marginBottom:  2,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize:      10,
    fontWeight:    '600',
    fontFamily:    'Montserrat-SemiBold',
    color:         T.textMuted,
    textAlign:     'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* Section 3 — Avatar Living-Room card                                          */
  /* ─────────────────────────────────────────────────────────────────────────── */
  avatarCard: {
    borderRadius:    24,
    overflow:        'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth:     1,
    borderColor:     'rgba(0,0,0,0.06)',
    ...shadowXl,
  },
  avatarCardGlassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.12)',
    zIndex:          0,
  },
  avatarCardInner: {
    padding: 24,
    zIndex:  1,
  },
  avatarCardHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   20,
  },
  avatarName: {
    fontSize:      24,
    fontWeight:    '900',
    fontFamily:    'SangBleu-Bold',
    color:         T.textPrimary,
    marginBottom:  2,
    letterSpacing: -0.4,
  },
  avatarSubtitle: {
    fontSize:      13,
    fontWeight:    '500',
    fontFamily:    'Montserrat-Medium',
    color:         T.textMuted,
  },
  xpPill: {
    backgroundColor:   'rgba(255,140,66,0.08)',
    borderRadius:      12,
    paddingHorizontal: 12,
    paddingVertical:    8,
    alignItems:        'center',
    borderWidth:       1,
    borderColor:       'rgba(255,140,66,0.20)',
  },
  xpPillLabel: {
    fontSize:      9,
    fontWeight:    '700',
    fontFamily:    'Montserrat-Bold',
    color:         T.primary,
    marginBottom:  2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  xpPillValue: {
    fontSize:      14,
    fontWeight:    '900',
    fontFamily:    'Montserrat-Black',
    color:         T.primary,
  },

  /* Living-room scene */
  livingRoom: {
    backgroundColor: '#FEF3D8',
    borderRadius:    16,
    height:          210,
    marginBottom:    20,
    borderWidth:     1,
    borderColor:     'rgba(230,195,120,0.45)',
    overflow:        'hidden',
    alignItems:      'center',
    justifyContent:  'center',
  },
  roomSkyTop: {
    position:         'absolute',
    top:              0,
    left:             0,
    right:            0,
    height:           '48%',
    backgroundColor:  'rgba(255,248,230,0.60)',
  },
  roomFloor: {
    position:                'absolute',
    bottom:                  0,
    left:                    0,
    right:                   0,
    height:                  80,
    backgroundColor:         '#D4A874',
    borderBottomLeftRadius:  16,
    borderBottomRightRadius: 16,
  },
  roomWindow: {
    position:        'absolute',
    top:             14,
    right:           14,
    width:           84,
    height:          84,
    backgroundColor: 'rgba(100,190,255,0.55)',
    borderRadius:    10,
    borderWidth:     4,
    borderColor:     'rgba(255,255,255,0.95)',
    flexDirection:   'row',
    flexWrap:        'wrap',
    padding:         8,
    ...shadowMd,
  },
  windowPane: {
    width:           '46%',
    height:          '46%',
    backgroundColor: 'rgba(200,235,255,0.65)',
    borderRadius:    4,
    margin:          '2%',
  },
  roomSofa: {
    position:        'absolute',
    bottom:          22,
    right:           18,
    backgroundColor: 'rgba(255,140,66,0.18)',
    borderRadius:    14,
    padding:         10,
    borderWidth:     2,
    borderColor:     'rgba(255,140,66,0.35)',
    ...shadowSm,
  },
  roomLampContainer: {
    position:   'absolute',
    bottom:     16,
    left:       20,
    alignItems: 'center',
  },
  roomLampShade: {
    width:           32,
    height:          32,
    backgroundColor: T.warningTint,
    borderRadius:    16,
    borderWidth:     2,
    borderColor:     T.glassBorder,
    justifyContent:  'center',
    alignItems:      'center',
    ...shadowSm,
  },
  roomLampPole: {
    width:           3,
    height:          14,
    backgroundColor: 'rgba(160,120,60,0.45)',
  },
  roomTable: {
    width:           44,
    height:          28,
    backgroundColor: T.glassBg,
    borderRadius:    8,
    borderWidth:     2,
    borderColor:     T.glassBorder,
    ...shadowSm,
  },
  roomTableBase: {
    width:           52,
    height:          6,
    backgroundColor: T.glassBgSubtle,
    borderRadius:    6,
    marginTop:       2,
    borderWidth:     1,
    borderColor:     T.glassBorderWeak,
    alignSelf:       'center',
  },
  roomCoffeeCup: {
    position:        'absolute',
    bottom:          62,
    left:            52,
    backgroundColor: T.glassBg,
    padding:         6,
    borderRadius:    8,
    borderWidth:     1,
    borderColor:     T.glassBorder,
    ...shadowSm,
  },
  avatarTouchable: {
    alignItems: 'center',
    zIndex:     20,
  },
  avatarCircle: {
    width:           116,
    height:          116,
    borderRadius:    58,
    backgroundColor: T.primary,
    justifyContent:  'center',
    alignItems:      'center',
    borderWidth:     5,
    borderColor:     'rgba(255,255,255,0.92)',
    overflow:        'hidden',
    ...shadowXl,
  },
  avatarShadowPlatform: {
    width:           80,
    height:          14,
    backgroundColor: 'rgba(0,0,0,0.10)',
    borderRadius:    40,
    marginTop:       -4,
    alignSelf:       'center',
  },
  xpBarTrack: {
    height:          14,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius:    7,
    overflow:        'hidden',
    marginBottom:    16,
  },
  xpBarFill: {
    height:          '100%',
    borderRadius:    7,
    backgroundColor: T.secondary,
  },
  moodGrid: {
    flexDirection: 'row',
    gap:           12,
  },
  moodCard: {
    flex:            1,
    backgroundColor: '#FFFFFF',
    borderRadius:    14,
    padding:         14,
    ...shadowMd,
    borderWidth:     1,
    borderColor:     'rgba(0,0,0,0.06)',
  },
  moodLabelRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
    marginBottom:  4,
  },
  moodLabel: {
    fontSize:      10,
    fontWeight:    '700',
    fontFamily:    'Montserrat-Bold',
    color:         T.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  moodValue: {
    fontSize:      28,
    fontWeight:    '900',
    fontFamily:    'Montserrat-Black',
    letterSpacing: -0.5,
    marginTop:     2,
  },

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* Section 4 — Start Workout CTA                                                */
  /* ─────────────────────────────────────────────────────────────────────────── */
  startWorkoutBtn: {
    backgroundColor: T.primary,
    borderRadius:    24,
    padding:         24,
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.22)',
    overflow:        'hidden',
    ...shadowLg,
    shadowOpacity:   0.28,
    shadowRadius:    24,
  },
  startWorkoutGloss: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.15)',
    zIndex:          0,
  },
  startWorkoutLeft: {
    flex:   1,
    zIndex: 1,
  },
  startWorkoutLabel: {
    fontSize:      13,
    fontWeight:    '600',
    fontFamily:    'Montserrat-SemiBold',
    color:         'rgba(255,255,255,0.88)',
    marginBottom:  4,
    letterSpacing: 0.3,
  },
  startWorkoutTitle: {
    fontSize:      26,
    fontWeight:    '900',
    fontFamily:    'Montserrat-Black',
    color:         '#FFF',
    letterSpacing: -0.5,
  },
  startWorkoutIconBox: {
    width:           56,
    height:          56,
    borderRadius:    16,
    backgroundColor: 'rgba(255,255,255,0.30)',
    justifyContent:  'center',
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.40)',
    zIndex:          1,
    ...shadowSm,
  },

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* Shared section header row                                                    */
  /* ─────────────────────────────────────────────────────────────────────────── */
  sectionHeaderRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   12,
  },
  sectionTitle: {
    fontSize:      18,
    fontWeight:    '900',
    fontFamily:    'SangBleu-Bold',
    color:         T.textPrimary,
    letterSpacing: -0.3,
  },
  viewAllBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               4,
    ...glassSurface,
    paddingHorizontal: 10,
    paddingVertical:    5,
    borderRadius:      10,
    ...shadowSm,
  },
  viewAllText: {
    fontSize:      13,
    fontWeight:    '600',
    fontFamily:    'Montserrat-SemiBold',
    color:         T.primary,
  },

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* Section 5 — Daily Challenges                                                 */
  /* ─────────────────────────────────────────────────────────────────────────── */
  questCard: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             14,
    backgroundColor: '#FFFFFF',
    borderWidth:     1,
    borderColor:     'rgba(0,0,0,0.07)',
    borderRadius:    16,
    padding:         16,
    ...shadowMd,
    marginBottom:    10,
    overflow:        'hidden',
  },
  questIconBox: {
    width:          44,
    height:         44,
    borderRadius:   12,
    justifyContent: 'center',
    alignItems:     'center',
    borderWidth:    1,
    borderColor:    T.glassBorderWeak,
    ...shadowSm,
  },
  questContent: { flex: 1 },
  questTitleRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   4,
  },
  questTitle: {
    fontSize:      15,
    fontWeight:    '700',
    fontFamily:    'Montserrat-Bold',
    color:         T.textPrimary,
    flex:          1,
    marginRight:   8,
  },
  questXpChip: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               3,
    backgroundColor:   T.warningTint,
    paddingHorizontal: 8,
    paddingVertical:   4,
    borderRadius:      8,
    borderWidth:       1,
    borderColor:       'rgba(245,158,11,0.30)',
  },
  questXpText: {
    fontSize:      11,
    fontWeight:    '900',
    fontFamily:    'Montserrat-Black',
    color:         T.warning,
  },
  questProgressText: {
    fontSize:     12,
    fontFamily:   'Montserrat-Regular',
    color:        T.textMuted,
    marginBottom: 6,
  },
  questBarTrack: {
    height:          8,
    backgroundColor: T.glassBg,
    borderRadius:    4,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     T.glassBorderWeak,
  },
  questBarFill: {
    height:       '100%',
    borderRadius: 4,
  },

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* Skeleton loaders                                                              */
  /* ─────────────────────────────────────────────────────────────────────────── */
  skeletonCard: {
    ...glassSurfaceSubtle,
    borderRadius: 16,
    padding:      20,
    marginBottom: 12,
    ...shadowSm,
    overflow:     'hidden',
  },
  skeletonLine: {
    backgroundColor: 'rgba(0,0,0,0.07)',
    borderRadius:    8,
    marginBottom:    10,
  },
  skeletonLineShort: {
    width:           '40%',
    height:          10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius:    6,
  },

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* Section 6 — Achievements preview                                             */
  /* ─────────────────────────────────────────────────────────────────────────── */
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           12,
  },
  achievementCard: {
    borderRadius: 16,
    padding:      12,
    alignItems:   'center',
    borderWidth:  1,
    ...shadowMd,
  },
  achievementCardUnlocked: {
    backgroundColor: '#FFFFFF',
    borderColor:     'rgba(0,0,0,0.08)',
  },
  achievementCardLocked: {
    backgroundColor: 'rgba(255,255,255,0.30)',
    borderColor:     'rgba(255,255,255,0.40)',
    opacity:         0.60,
  },
  achievementIconBox: {
    width:          40,
    height:         40,
    borderRadius:   12,
    justifyContent: 'center',
    alignItems:     'center',
    marginBottom:   6,
    borderWidth:    1,
    borderColor:    T.glassBorderWeak,
  },
  achievementIconBoxUnlocked: { backgroundColor: T.primaryTint },
  achievementIconBoxLocked:   { backgroundColor: T.glassBgSubtle },
  achievementLabel: {
    fontSize:   10,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
    color:      T.textMuted,
    textAlign:  'center',
    lineHeight: 13,
  },

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* Section 7 — Rewards Shop CTA                                                 */
  /* ─────────────────────────────────────────────────────────────────────────── */
  rewardsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius:    24,
    padding:         24,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    overflow:        'hidden',
    ...shadowLg,
    borderWidth:     1,
    borderColor:     'rgba(0,0,0,0.06)',
  },
  rewardsGloss: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(74,144,226,0.04)',
    zIndex:          0,
  },
  rewardsLeft: {
    flex:   1,
    marginRight: 12,
    zIndex: 1,
  },
  rewardsTitle: {
    fontSize:      18,
    fontWeight:    '900',
    fontFamily:    'SangBleu-Bold',
    color:         T.textPrimary,
    marginBottom:  4,
    letterSpacing: -0.3,
  },
  rewardsSubtitle: {
    fontSize:      13,
    fontFamily:    'Montserrat-Regular',
    color:         T.textMuted,
    marginBottom:  14,
    lineHeight:    19,
  },
  rewardsShopBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    backgroundColor:   T.secondary,
    paddingVertical:   10,
    paddingHorizontal: 16,
    borderRadius:      12,
    alignSelf:         'flex-start',
    ...shadowSm,
  },
  rewardsShopBtnText: {
    fontSize:      14,
    fontWeight:    '700',
    fontFamily:    'Montserrat-Bold',
    color:         '#FFF',
  },
  rewardsIconBox: {
    width:           64,
    height:          64,
    borderRadius:    16,
    backgroundColor: T.secondaryTint,
    justifyContent:  'center',
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     T.glassBorderWeak,
    zIndex:          1,
    ...shadowSm,
  },

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* Inline error pill (non-fatal section errors)                                 */
  /* ─────────────────────────────────────────────────────────────────────────── */
  inlineErrorPill: {
    backgroundColor:   'rgba(239,68,68,0.08)',
    borderRadius:      10,
    paddingHorizontal: 12,
    paddingVertical:   8,
    borderWidth:       1,
    borderColor:       'rgba(239,68,68,0.20)',
    marginBottom:      12,
  },
  inlineErrorText: {
    fontSize:   12,
    fontFamily: 'Montserrat-Regular',
    color:      T.danger,
  },
});
