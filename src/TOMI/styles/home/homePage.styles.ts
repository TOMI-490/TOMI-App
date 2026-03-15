/**
 * HomeScreen styles — polished aesthetic revision
 */

import { StyleSheet, Dimensions } from 'react-native';
import { TOMI_THEME as T } from '../../constants/theme';
import { F } from '../../constants/fonts';

const { width: SCREEN_W } = Dimensions.get('window');

/* ─── Shadow presets ─────────────────────────────────────────────────────── */
const shadowXs = {
  shadowColor:   '#8891A5',
  shadowOffset:  { width: 0, height: 2 },
  shadowOpacity: 0.18,
  shadowRadius:  6,
  elevation:     3,
} as const;

const shadowSm = {
  shadowColor:   '#8891A5',
  shadowOffset:  { width: 0, height: 3 },
  shadowOpacity: 0.22,
  shadowRadius:  10,
  elevation:     5,
} as const;

const shadowMd = {
  shadowColor:   '#8891A5',
  shadowOffset:  { width: 0, height: 6 },
  shadowOpacity: 0.28,
  shadowRadius:  16,
  elevation:     8,
} as const;

const shadowLg = {
  shadowColor:   '#8891A5',
  shadowOffset:  { width: 0, height: 10 },
  shadowOpacity: 0.30,
  shadowRadius:  24,
  elevation:     12,
} as const;

const shadowXl = {
  shadowColor:   T.primary,
  shadowOffset:  { width: 0, height: 12 },
  shadowOpacity: 0.36,
  shadowRadius:  30,
  elevation:     16,
} as const;

/* ─── Shared card base ───────────────────────────────────────────────────── */
const card = {
  backgroundColor: T.cardBg,
  borderRadius:    20,
} as const;

/* ─── StyleSheet ─────────────────────────────────────────────────────────── */
export const homePageStyles = StyleSheet.create({

  /* ── Scaffold ────────────────────────────────────────────────────────────── */
  screen: {
    flex: 1,
    backgroundColor: '#EDEAE3',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop:        20,
    paddingBottom:     108,
  },
  sectionGap: { height: 22 },

  /* ── Loading / Error ─────────────────────────────────────────────────────── */
  loadingContainer: {
    flex:            1,
    justifyContent:  'center',
    alignItems:      'center',
    backgroundColor: T.background,
  },
  loadingText: {
    marginTop:  12,
    fontSize:   15,
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
    marginBottom: 18,
    lineHeight:   22,
  },
  retryBtn: {
    backgroundColor:   T.primary,
    paddingVertical:   12,
    paddingHorizontal: 26,
    borderRadius:      14,
    ...shadowSm,
  },
  retryBtnText: {
    fontSize:   15,
    fontFamily: 'Montserrat-Bold',
    color:      '#FFF',
  },

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* Section 1 — Greeting                                                          */
  /* ─────────────────────────────────────────────────────────────────────────── */
  greetingPill: {
    alignSelf:         'flex-start',
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   T.primaryTintMed,
    borderRadius:      100,
    paddingVertical:   6,
    paddingHorizontal: 14,
    marginBottom:      12,
    borderWidth:       1,
    borderColor:       'rgba(255,122,61,0.28)',
    gap:               5,
  },
  greetingPillDot: {
    width:           6,
    height:          6,
    borderRadius:    3,
    backgroundColor: T.primary,
  },
  greetingPillText: {
    fontSize:      13,
    fontFamily:    'Montserrat-SemiBold',
    color:         T.primary,
    letterSpacing: 0.1,
  },
  greetingTitle: {
    fontSize:      36,
    fontFamily:    F.headline,
    color:         T.textPrimary,
    lineHeight:    42,
    marginBottom:  5,
    letterSpacing: -1,
  },
  greetingSubtitle: {
    fontSize:      14,
    fontFamily:    'Montserrat-Medium',
    color:         T.textMuted,
    lineHeight:    20,
  },

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* Section 2 — Stats Grid (3-column)                                             */
  /* ─────────────────────────────────────────────────────────────────────────── */
  statsRow: {
    flexDirection: 'row',
    gap:           10,
  },
  statCard: {
    flex:              1,
    ...card,
    paddingVertical:   16,
    paddingHorizontal: 10,
    alignItems:        'center',
    ...shadowMd,
  },
  statIconBox: {
    width:          44,
    height:         44,
    borderRadius:   22,
    justifyContent: 'center',
    alignItems:     'center',
    marginBottom:   9,
  },
  statValue: {
    fontSize:      26,
    fontFamily:    'Montserrat-Black',
    color:         T.textPrimary,
    marginBottom:  1,
    letterSpacing: -0.8,
  },
  statLabel: {
    fontSize:      9,
    fontFamily:    'Montserrat-SemiBold',
    color:         T.textMuted,
    textAlign:     'center',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* Section 3 — Avatar Living-Room card                                           */
  /* ─────────────────────────────────────────────────────────────────────────── */
  avatarCard: {
    ...card,
    borderRadius: 26,
    overflow:     'hidden',
    ...shadowLg,
  },
  avatarCardGlassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.08)',
    zIndex:          0,
  },
  avatarCardInner: {
    padding: 20,
    zIndex:  1,
  },
  avatarCardHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   16,
  },
  avatarName: {
    fontSize:      22,
    fontFamily:    F.headlineMd,
    color:         T.textPrimary,
    marginBottom:  2,
    letterSpacing: -0.5,
  },
  avatarSubtitle: {
    fontSize:      12,
    fontFamily:    'Montserrat-Medium',
    color:         T.textMuted,
  },
  xpPill: {
    backgroundColor:   T.primaryTint,
    borderRadius:      14,
    paddingHorizontal: 12,
    paddingVertical:    9,
    alignItems:        'center',
  },
  xpPillLabel: {
    fontSize:      9,
    fontFamily:    'Montserrat-Bold',
    color:         T.primary,
    marginBottom:  2,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  xpPillValue: {
    fontSize:      15,
    fontFamily:    'Montserrat-Black',
    color:         T.primary,
    letterSpacing: -0.3,
  },

  /* Living-room scene */
  livingRoom: {
    backgroundColor: '#F5E6C8',
    borderRadius:    24,
    height:          220,
    marginBottom:    16,
    overflow:        'hidden',
    alignItems:      'center',
    justifyContent:  'flex-end',
  },
  roomWall: {
    position:        'absolute',
    top:             0,
    left:            0,
    right:           0,
    height:          '58%',
    backgroundColor: '#FDF1DC',
  },
  roomWainscoting: {
    position:        'absolute',
    top:             '55%',
    left:            0,
    right:           0,
    height:          6,
    backgroundColor: '#E8D5B0',
  },
  roomFloor: {
    position:                'absolute',
    bottom:                  0,
    left:                    0,
    right:                   0,
    height:                  90,
    backgroundColor:         '#C49A6C',
    borderBottomLeftRadius:  24,
    borderBottomRightRadius: 24,
  },

  /* ─ Window with curtains ─ */
  roomWindow: {
    position:        'absolute',
    top:             10,
    right:           16,
    width:           72,
    height:          70,
    alignItems:      'center',
  },
  windowGlass: {
    width:           54,
    height:          52,
    backgroundColor: '#B8E4FF',
    borderRadius:    6,
    borderWidth:     3,
    borderColor:     '#F0EAD6',
    overflow:        'hidden',
    justifyContent:  'flex-end',
  },
  windowSky: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ADE0FF',
  },
  windowCloud: {
    position:        'absolute',
    top:             10,
    left:            6,
    width:           22,
    height:          10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius:    5,
  },
  windowCurtainLeft: {
    position:           'absolute',
    top:                0,
    left:               0,
    width:              14,
    height:             62,
    backgroundColor:    '#E8A87C',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 8,
    opacity:            0.7,
    zIndex:             1,
  },
  windowCurtainRight: {
    position:            'absolute',
    top:                 0,
    right:               0,
    width:               14,
    height:              62,
    backgroundColor:     '#E8A87C',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 8,
    opacity:             0.7,
    zIndex:              1,
  },
  windowSill: {
    width:           66,
    height:          6,
    backgroundColor: '#E0D4BC',
    borderRadius:    3,
    marginTop:       -1,
  },

  /* ─ Picture frame ─ */
  roomPictureFrame: {
    position:        'absolute',
    top:             14,
    right:           96,
    width:           34,
    height:          28,
    backgroundColor: '#DFC9A5',
    borderRadius:    4,
    borderWidth:     3,
    borderColor:     '#C4A472',
    justifyContent:  'center',
    alignItems:      'center',
  },
  pictureInner: {
    width:           22,
    height:          16,
    backgroundColor: '#FFF5E0',
    borderRadius:    2,
    justifyContent:  'center',
    alignItems:      'center',
  },

  /* ─ Rug ─ */
  roomRug: {
    position:        'absolute',
    bottom:          24,
    width:           120,
    height:          35,
    backgroundColor: '#E8A87C',
    borderRadius:    50,
    opacity:         0.35,
    alignSelf:       'center',
  },

  /* ─ Sofa (built from shapes) ─ */
  roomSofa: {
    position:        'absolute',
    bottom:          22,
    right:           10,
    width:           70,
    height:          42,
  },
  sofaBack: {
    position:        'absolute',
    top:             0,
    left:            4,
    right:           4,
    height:          20,
    backgroundColor: '#D98C5F',
    borderTopLeftRadius:  10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  sofaSeat: {
    position:        'absolute',
    bottom:          4,
    left:            2,
    right:           2,
    height:          18,
    backgroundColor: '#E8A272',
    borderRadius:    8,
  },
  sofaCushionLeft: {
    position:        'absolute',
    bottom:          8,
    left:            6,
    width:           18,
    height:          14,
    backgroundColor: '#F0B88A',
    borderRadius:    6,
  },
  sofaCushionRight: {
    position:        'absolute',
    bottom:          8,
    right:           6,
    width:           18,
    height:          14,
    backgroundColor: '#F0B88A',
    borderRadius:    6,
  },
  sofaArmLeft: {
    position:        'absolute',
    bottom:          4,
    left:            0,
    width:           10,
    height:          28,
    backgroundColor: '#CC8050',
    borderRadius:    6,
  },
  sofaArmRight: {
    position:        'absolute',
    bottom:          4,
    right:           0,
    width:           10,
    height:          28,
    backgroundColor: '#CC8050',
    borderRadius:    6,
  },

  /* ─ Floor lamp with glow ─ */
  roomLampContainer: {
    position:   'absolute',
    bottom:     18,
    left:       14,
    alignItems: 'center',
  },
  roomLampGlow: {
    position:        'absolute',
    top:             -14,
    width:           44,
    height:          44,
    borderRadius:    22,
    backgroundColor: 'rgba(251,191,36,0.15)',
  },
  roomLampShade: {
    width:              26,
    height:             18,
    backgroundColor:    '#FDE68A',
    borderTopLeftRadius:   10,
    borderTopRightRadius:  10,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    justifyContent:  'center',
    alignItems:      'center',
  },
  roomLampPole: {
    width:           3,
    height:          34,
    backgroundColor: '#B8956A',
  },
  roomLampBase: {
    width:           18,
    height:          5,
    backgroundColor: '#B8956A',
    borderRadius:    3,
  },

  /* ─ Side table + coffee ─ */
  roomSideTable: {
    position:   'absolute',
    bottom:     24,
    left:       46,
    alignItems: 'center',
  },
  sideTableTop: {
    width:           32,
    height:          18,
    backgroundColor: '#D4A574',
    borderRadius:    4,
    borderTopLeftRadius:  6,
    borderTopRightRadius: 6,
    justifyContent:  'center',
    alignItems:      'center',
  },
  sideTableLeg: {
    width:           4,
    height:          10,
    backgroundColor: '#B8956A',
    borderRadius:    2,
  },

  /* ─ Plant ─ */
  roomPlant: {
    position:   'absolute',
    bottom:     24,
    right:      86,
    alignItems: 'center',
  },
  plantLeaves: {
    marginBottom: -4,
    zIndex:       1,
  },
  plantPot: {
    width:           16,
    height:          14,
    backgroundColor: '#D97B5A',
    borderBottomLeftRadius:  4,
    borderBottomRightRadius: 4,
    borderTopLeftRadius:     2,
    borderTopRightRadius:    2,
  },

  /* ─ Bookshelf ─ */
  roomBookshelf: {
    position:   'absolute',
    top:        16,
    left:       14,
    alignItems: 'center',
  },
  bookshelfShelf: {
    width:           46,
    height:          4,
    backgroundColor: '#C4A472',
    borderRadius:    2,
    marginBottom:    2,
  },
  bookRow: {
    flexDirection: 'row',
    gap:           2,
    paddingHorizontal: 3,
  },
  book: {
    width:        8,
    borderRadius: 2,
  },
  avatarTouchable: {
    alignItems:    'center',
    zIndex:        20,
    position:      'absolute',
    bottom:        8,
    alignSelf:     'center',
  },
  avatarContainer: {
    width:           110,
    height:          110,
    justifyContent:  'flex-end',
    alignItems:      'center',
    marginTop:       -8,
  },
  avatarShadowPlatform: {
    width:           60,
    height:          10,
    backgroundColor: 'rgba(0,0,0,0.10)',
    borderRadius:    30,
    alignSelf:       'center',
    zIndex:          -1,
  },

  /* XP bar */
  xpBarTrack: {
    height:          10,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius:    5,
    overflow:        'hidden',
    marginBottom:    14,
  },
  xpBarFill: {
    height:       '100%',
    borderRadius: 5,
    backgroundColor: T.secondary,
  },

  /* Mood indicators */
  moodGrid: {
    flexDirection: 'row',
    gap:           10,
  },
  moodCard: {
    flex:            1,
    backgroundColor: T.cardBgAlt,
    borderRadius:    16,
    padding:         14,
    ...shadowSm,
  },
  moodLabelRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           5,
    marginBottom:  5,
  },
  moodLabel: {
    fontSize:      10,
    fontFamily:    'Montserrat-Bold',
    color:         T.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  moodValue: {
    fontSize:      26,
    fontFamily:    'Montserrat-Black',
    letterSpacing: -0.8,
    marginTop:     1,
  },

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* Section 4 — Start Workout CTA                                                 */
  /* ─────────────────────────────────────────────────────────────────────────── */
  startWorkoutBtn: {
    backgroundColor: T.primary,
    borderRadius:    22,
    paddingVertical:   22,
    paddingHorizontal: 22,
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.20)',
    overflow:        'hidden',
    ...shadowLg,
    shadowColor:     T.primary,
    shadowOpacity:   0.55,
    shadowRadius:    22,
  },
  startWorkoutGloss: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.12)',
    zIndex:          0,
  },
  startWorkoutLeft: {
    flex:   1,
    zIndex: 1,
  },
  startWorkoutLabel: {
    fontSize:      12,
    fontFamily:    'Montserrat-SemiBold',
    color:         'rgba(255,255,255,0.82)',
    marginBottom:  3,
    letterSpacing: 0.4,
  },
  startWorkoutTitle: {
    fontSize:      24,
    fontFamily:    'Montserrat-Black',
    color:         '#FFF',
    letterSpacing: -0.6,
  },
  startWorkoutIconBox: {
    width:           52,
    height:          52,
    borderRadius:    16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent:  'center',
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.35)',
    zIndex:          1,
  },

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* Shared section header row                                                     */
  /* ─────────────────────────────────────────────────────────────────────────── */
  sectionHeaderRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  sectionTitleAccent: {
    width:           4,
    height:          18,
    borderRadius:    2,
    backgroundColor: T.primary,
  },
  sectionTitle: {
    fontSize:      17,
    fontFamily:    F.headlineMd,
    color:         T.textPrimary,
    letterSpacing: -0.3,
  },
  viewAllBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               3,
    backgroundColor:   T.primaryTint,
    paddingHorizontal: 10,
    paddingVertical:    5,
    borderRadius:      10,
  },
  viewAllText: {
    fontSize:      12,
    fontFamily:    'Montserrat-SemiBold',
    color:         T.primary,
  },

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* Section 5 — Daily Challenges                                                  */
  /* ─────────────────────────────────────────────────────────────────────────── */
  questCard: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             12,
    backgroundColor: T.cardBg,
    borderRadius:    18,
    padding:         14,
    ...shadowSm,
    marginBottom:    10,
    overflow:        'hidden',
  },
  questIconBox: {
    width:          42,
    height:         42,
    borderRadius:   13,
    justifyContent: 'center',
    alignItems:     'center',
  },
  questContent: { flex: 1 },
  questTitleRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   3,
  },
  questTitle: {
    fontSize:    14,
    fontFamily:  'Montserrat-Bold',
    color:       T.textPrimary,
    flex:        1,
    marginRight: 8,
  },
  questXpChip: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               3,
    backgroundColor:   T.warningTint,
    paddingHorizontal: 7,
    paddingVertical:   3,
    borderRadius:      8,
    borderWidth:       1,
    borderColor:       'rgba(244,166,35,0.28)',
  },
  questXpText: {
    fontSize:   10,
    fontFamily: 'Montserrat-Black',
    color:      T.warning,
  },
  questProgressText: {
    fontSize:     11,
    fontFamily:   'Montserrat-Regular',
    color:        T.textMuted,
    marginBottom: 7,
  },
  questBarTrack: {
    height:          7,
    backgroundColor: 'rgba(0,0,0,0.055)',
    borderRadius:    3.5,
    overflow:        'hidden',
  },
  questBarFill: {
    height:       '100%',
    borderRadius: 3.5,
  },

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* Skeleton loaders                                                               */
  /* ─────────────────────────────────────────────────────────────────────────── */
  skeletonCard: {
    backgroundColor: T.glassBgSubtle,
    borderWidth:     1,
    borderColor:     T.borderSubtle,
    borderRadius:    18,
    padding:         18,
    marginBottom:    10,
    ...shadowXs,
    overflow:        'hidden',
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
  /* Section 6 — Achievements preview                                              */
  /* ─────────────────────────────────────────────────────────────────────────── */
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           10,
  },
  achievementCard: {
    borderRadius: 18,
    padding:      12,
    alignItems:   'center',
    ...shadowSm,
  },
  achievementCardUnlocked: {
    backgroundColor: T.cardBg,
  },
  achievementCardLocked: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    opacity:         0.55,
  },
  achievementIconBox: {
    width:          40,
    height:         40,
    borderRadius:   13,
    justifyContent: 'center',
    alignItems:     'center',
    marginBottom:   7,
  },
  achievementIconBoxUnlocked: { backgroundColor: T.primaryTint },
  achievementIconBoxLocked:   { backgroundColor: 'rgba(0,0,0,0.04)' },
  achievementLabel: {
    fontSize:   10,
    fontFamily: 'Montserrat-SemiBold',
    color:      T.textMuted,
    textAlign:  'center',
    lineHeight: 14,
  },

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* Section 7 — Rewards Shop CTA                                                  */
  /* ─────────────────────────────────────────────────────────────────────────── */
  rewardsCard: {
    ...card,
    borderRadius:    24,
    padding:         22,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    overflow:        'hidden',
    ...shadowMd,
  },
  rewardsGloss: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(78,155,232,0.04)',
    zIndex:          0,
  },
  rewardsLeft: {
    flex:        1,
    marginRight: 14,
    zIndex:      1,
  },
  rewardsTitle: {
    fontSize:      17,
    fontFamily:    F.headlineMd,
    color:         T.textPrimary,
    marginBottom:  4,
    letterSpacing: -0.3,
  },
  rewardsSubtitle: {
    fontSize:     13,
    fontFamily:   'Montserrat-Regular',
    color:        T.textMuted,
    marginBottom: 14,
    lineHeight:   19,
  },
  rewardsShopBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    backgroundColor:   T.secondary,
    paddingVertical:   9,
    paddingHorizontal: 16,
    borderRadius:      12,
    alignSelf:         'flex-start',
    ...shadowSm,
    shadowColor:       T.secondary,
    shadowOpacity:     0.32,
  },
  rewardsShopBtnText: {
    fontSize:   13,
    fontFamily: 'Montserrat-Bold',
    color:      '#FFF',
  },
  rewardsIconBox: {
    width:           60,
    height:          60,
    borderRadius:    18,
    backgroundColor: T.secondaryTintMed,
    justifyContent:  'center',
    alignItems:      'center',
    zIndex:          1,
  },

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* Inline error / empty state pill                                               */
  /* ─────────────────────────────────────────────────────────────────────────── */
  inlineErrorPill: {
    backgroundColor:   'rgba(240,84,92,0.07)',
    borderRadius:      12,
    paddingHorizontal: 14,
    paddingVertical:   10,
    borderWidth:       1,
    borderColor:       'rgba(240,84,92,0.18)',
    marginBottom:      10,
  },
  inlineErrorText: {
    fontSize:   12,
    fontFamily: 'Montserrat-Regular',
    color:      T.danger,
    lineHeight: 18,
  },
});
