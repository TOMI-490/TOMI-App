/**
 * TOMI Typography System
 *
 * Typefaces
 * ─────────
 * SangBleu   → commercial serif. Place .otf files in assets/fonts/ and set
 *              SANGBLEU_READY = true to activate them. Until then, Playfair
 *              Display (Google Fonts) is used as the headline serif — it shares
 *              SangBleu's high-contrast, elegant character.
 *
 * Montserrat → open-source, always available via @expo-google-fonts/montserrat.
 *
 * Usage
 * ─────
 * import { F } from '../constants/fonts';
 * style={{ fontFamily: F.headline, fontSize: 36 }}
 *
 * Activating SangBleu
 * ───────────────────
 * 1. Place font files in src/TOMI/assets/fonts/
 *    – SangBleu-Regular.otf, SangBleu-Medium.otf, SangBleu-Bold.otf, SangBleu-Black.otf
 * 2. Uncomment the four 'SangBleu-*' entries in FONT_MAP below
 * 3. Set SANGBLEU_READY = true
 * 4. Rebuild the app (fonts are bundled at build time)
 */

import {
  Montserrat_400Regular,
  Montserrat_400Regular_Italic,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  Montserrat_900Black,
} from '@expo-google-fonts/montserrat';

import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_900Black,
} from '@expo-google-fonts/playfair-display';

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

  /* Playfair Display — serif headline stand-in for SangBleu */
  'PlayfairDisplay-Regular': PlayfairDisplay_400Regular,
  'PlayfairDisplay-Medium':  PlayfairDisplay_500Medium,
  'PlayfairDisplay-Bold':    PlayfairDisplay_700Bold,
  'PlayfairDisplay-Black':   PlayfairDisplay_900Black,

  /* SangBleu — uncomment after adding files to assets/fonts/ */
  // 'SangBleu-Regular': require('../assets/fonts/SangBleu-Regular.otf'),
  // 'SangBleu-Medium':  require('../assets/fonts/SangBleu-Medium.otf'),
  // 'SangBleu-Bold':    require('../assets/fonts/SangBleu-Bold.otf'),
  // 'SangBleu-Black':   require('../assets/fonts/SangBleu-Black.otf'),
} as const;

/* ─── Headline serif resolver ────────────────────────────────────────────── */
function sangbleu(weight: 'Regular' | 'Medium' | 'Bold' | 'Black'): string {
  return SANGBLEU_READY ? `SangBleu-${weight}` : `PlayfairDisplay-${weight}`;
}

/* ─── Semantic font-family tokens ─────────────────────────────────────────── */
export const F = {
  /* Headlines — SangBleu (or Playfair Display fallback) */
  headline:   sangbleu('Black'),    // "Hey thomas mejia!"
  headlineMd: sangbleu('Bold'),     // Section titles: "Buddy", "Daily Challenges"
  headlineSm: sangbleu('Medium'),   // Avatar name, card titles

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
