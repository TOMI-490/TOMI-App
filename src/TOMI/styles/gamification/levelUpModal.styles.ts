import { StyleSheet, Platform, Dimensions } from 'react-native';
import type { TomiThemeColors } from '../../constants/theme';
import { F } from '../../constants/fonts';

const { width: SCREEN_W } = Dimensions.get('window');

export function createLevelUpModalStyles(T: TomiThemeColors) {
  return StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalContent: {
    backgroundColor: T.cardBg,
    borderRadius: 32,
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
    width: SCREEN_W * 0.82,
    maxWidth: 360,
    shadowColor: T.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.30,
    shadowRadius: 32,
    elevation: 20,
  },

  /* ── Glow ring behind badge ──────────────────────── */
  glowRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: T.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
    shadowColor: T.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },

  badge: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: T.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: T.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },

  title: {
    fontSize: 26,
    fontFamily: F.headline,
    color: T.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.5,
  },

  levelText: {
    fontSize: 44,
    fontFamily: F.black,
    color: T.primary,
    marginBottom: 8,
    letterSpacing: -1,
  },

  message: {
    fontSize: 14,
    fontFamily: F.medium,
    color: T.textMuted,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
    paddingHorizontal: 8,
  },

  /* ── Confetti particles ──────────────────────────── */
  confetti: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    borderRadius: 32,
  },
  confettiDot: {
    position: 'absolute',
    fontSize: 18,
    fontFamily: F.black,
  },

  /* ── CTA button ──────────────────────────────────── */
  button: {
    backgroundColor: T.primary,
    paddingHorizontal: 42,
    paddingVertical: 15,
    borderRadius: 20,
    minWidth: 180,
    shadowColor: T.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: F.bold,
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  /* ── Accent divider ──────────────────────────────── */
  divider: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: T.primaryTint,
    marginBottom: 16,
  },
  });
}
