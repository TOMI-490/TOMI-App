import { StyleSheet, Dimensions } from 'react-native';
import { TOMI_THEME as T } from '../../constants/theme';
import { F } from '../../constants/fonts';

const { width: SCREEN_W } = Dimensions.get('window');
const MODAL_W = Math.min(SCREEN_W * 0.92, 400);
const CARD_W = MODAL_W * 0.52;

export const evolutionModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28,30,39,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalContent: {
    backgroundColor: '#FDFCFA',
    borderRadius: 32,
    paddingTop: 36,
    paddingBottom: 28,
    alignItems: 'center',
    width: MODAL_W,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.25,
    shadowRadius: 36,
    elevation: 24,
    overflow: 'hidden',
  },

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
    fontFamily: F.black,
  },

  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(124,58,237,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  title: {
    fontSize: 24,
    fontFamily: F.headline,
    color: T.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.5,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    fontFamily: F.medium,
    color: T.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },

  divider: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(124,58,237,0.18)',
    marginBottom: 20,
  },

  carouselContainer: {
    width: '100%',
    marginBottom: 20,
  },

  carouselContent: {
    paddingHorizontal: (MODAL_W - CARD_W) / 2,
  },

  optionCard: {
    width: CARD_W,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.06)',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  optionCardSelected: {
    borderColor: '#7C3AED',
    backgroundColor: 'rgba(124,58,237,0.04)',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },

  selectedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  avatarImageContainer: {
    width: CARD_W * 0.65,
    height: CARD_W * 0.65,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  fallbackContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(124,58,237,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  optionName: {
    fontSize: 16,
    fontFamily: F.bold,
    color: T.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.2,
  },

  optionStage: {
    fontSize: 12,
    fontFamily: F.semiBold,
    color: T.textMuted,
    textAlign: 'center',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 22,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },

  dotActive: {
    backgroundColor: '#7C3AED',
    width: 20,
    borderRadius: 4,
  },

  evolveButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 44,
    paddingVertical: 16,
    borderRadius: 20,
    minWidth: 200,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
    marginHorizontal: 28,
  },

  evolveButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },

  evolveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: F.bold,
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },

  loadingText: {
    fontSize: 14,
    fontFamily: F.medium,
    color: T.textMuted,
  },

  CARD_W,
});
