/**
 * TOMI Design Token System — TypeScript constants
 *
 * These values mirror src/TOMI/styles/theme.css (Sunny / default theme).
 * Use these in StyleSheet.create() and inline style props where NativeWind
 * className-based tokens are not applicable.
 *
 * For multi-theme support at runtime, swap this object via React Context.
 */

export const TOMI_THEME = {
  /* ── Brand ────────────────────────────────────────────────────────── */
  primary:         '#FF7A3D',
  primaryLight:    '#FF9A6B',
  primaryPressed:  '#E8622A',
  secondary:       '#4E9BE8',
  secondaryLight:  '#73B3F0',

  /* ── Text ─────────────────────────────────────────────────────────── */
  textPrimary:     '#1C1E27',
  textSecondary:   '#3D3F4C',
  textMuted:       '#8891A5',
  textLight:       '#B0B9CC',

  /* ── Semantic ─────────────────────────────────────────────────────── */
  warning:         '#F4A623',
  danger:          '#F0545C',
  success:         '#2DCB8A',
  successLight:    '#45DDA0',

  /* ── Surface ──────────────────────────────────────────────────────── */
  background:      '#F7F5F0',
  cardBg:          '#FFFFFF',
  cardBgAlt:       '#FAFAF8',

  /* ── Glass helpers ────────────────────────────────────────────────── */
  glassBg:         'rgba(255,255,255,0.72)',
  glassBgStrong:   'rgba(255,255,255,0.85)',
  glassBgSubtle:   'rgba(255,255,255,0.50)',
  glassBorder:     'rgba(255,255,255,0.65)',
  glassBorderWeak: 'rgba(255,255,255,0.40)',

  /* ── Overlay tints (for icon containers) ─────────────────────────── */
  warningTint:     'rgba(244,166,35,0.14)',
  dangerTint:      'rgba(240,84,92,0.12)',
  primaryTint:     'rgba(255,122,61,0.12)',
  primaryTintMed:  'rgba(255,122,61,0.22)',
  secondaryTint:   'rgba(78,155,232,0.12)',
  secondaryTintMed:'rgba(78,155,232,0.22)',
  successTint:     'rgba(45,203,138,0.12)',

  /* ── Divider / border ─────────────────────────────────────────────── */
  borderLight:     'rgba(0,0,0,0.055)',
  borderSubtle:    'rgba(0,0,0,0.035)',
} as const;

export type TomiTheme = typeof TOMI_THEME;
