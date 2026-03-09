/**
 * TOMI Typography System
 *
 * Typefaces
 * ─────────
 * SangBleu   → commercial serif, loaded from assets/fonts/SangBleu-*.otf
 *              Until those files are placed in assets/fonts/, the app falls
 *              back to the best available system serif per platform:
 *                iOS    → 'Georgia'  (classic serif)
 *                Android → 'serif'   (Noto Serif / Roboto Slab)
 * Montserrat → open-source, always available via @expo-google-fonts/montserrat
 *
 * Usage
 * ─────
 * import { F } from '../constants/fonts';
 * style={{ fontFamily: F.headline, fontSize: 36 }}
 *
 * Activating SangBleu
 * ───────────────────
 * 1. Place font files in src/TOMI/assets/fonts/  (see README there)
 * 2. Uncomment the four 'SangBleu-*' entries in FONT_MAP below
 * 3. Change SANGBLEU_READY to true
 * 4. Rebuild the app (fonts are bundled at build time)
 */

import { Platform } from 'react-native';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  Montserrat_900Black,
  Montserrat_400Regular_Italic,
} from '@expo-google-fonts/montserrat';

/* ─── Toggle to true once SangBleu .otf files are in assets/fonts/ ──────── */
const SANGBLEU_READY = false;

/* ─── Font map passed to useFonts() ─────────────────────────────────────── */
export const FONT_MAP = {
  /* Montserrat — always bundled, no local files needed */
  'Montserrat-Regular':   Montserrat_400Regular,
  'Montserrat-Italic':    Montserrat_400Regular_Italic,
  'Montserrat-Medium':    Montserrat_500Medium,
  'Montserrat-SemiBold':  Montserrat_600SemiBold,
  'Montserrat-Bold':      Montserrat_700Bold,
  'Montserrat-ExtraBold': Montserrat_800ExtraBold,
  'Montserrat-Black':     Montserrat_900Black,

  /* SangBleu — uncomment after adding files to assets/fonts/ */
  // 'SangBleu-Regular': require('../assets/fonts/SangBleu-Regular.otf'),
  // 'SangBleu-Medium':  require('../assets/fonts/SangBleu-Medium.otf'),
  // 'SangBleu-Bold':    require('../assets/fonts/SangBleu-Bold.otf'),
  // 'SangBleu-Black':   require('../assets/fonts/SangBleu-Black.otf'),
} as const;

/* ─── Platform-aware serif fallback used until SangBleu files exist ──────── */
const SERIF_FALLBACK = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' })!;

function sangbleu(weight: 'Regular' | 'Medium' | 'Bold' | 'Black'): string {
  return SANGBLEU_READY ? `SangBleu-${weight}` : SERIF_FALLBACK;
}

/* ─── Semantic font-family tokens ─────────────────────────────────────────── */
export const F = {
  /* Headlines — SangBleu (serif) */
  headline:  sangbleu('Black'),   // "Hey thomas mejia!"
  headlineMd: sangbleu('Bold'),   // Section titles: "Buddy", "Daily Challenges"
  headlineSm: sangbleu('Medium'), // Avatar name, card titles

  /* UI / Body — Montserrat (sans-serif) */
  black:     'Montserrat-Black'     as string,
  extraBold: 'Montserrat-ExtraBold' as string,
  bold:      'Montserrat-Bold'      as string,
  semiBold:  'Montserrat-SemiBold'  as string,
  medium:    'Montserrat-Medium'    as string,
  regular:   'Montserrat-Regular'   as string,
  italic:    'Montserrat-Italic'    as string,
} as const;

export type FontToken = keyof typeof F;
