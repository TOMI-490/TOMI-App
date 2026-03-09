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
  primary:         '#ff8c42',
  primaryPressed:  '#ff7324',
  secondary:       '#4a90e2',

  /* ── Text ─────────────────────────────────────────────────────────── */
  textPrimary:     '#1a202c',
  textMuted:       '#718096',

  /* ── Semantic ─────────────────────────────────────────────────────── */
  warning:         '#f59e0b',
  danger:          '#ef4444',
  success:         '#10b981',

  /* ── Surface ──────────────────────────────────────────────────────── */
  background:      '#fefefe',

  /* ── Glass helpers ────────────────────────────────────────────────── */
  glassBg:         'rgba(255,255,255,0.70)',
  glassBgStrong:   'rgba(255,255,255,0.80)',
  glassBgSubtle:   'rgba(255,255,255,0.50)',
  glassBorder:     'rgba(255,255,255,0.60)',
  glassBorderWeak: 'rgba(255,255,255,0.40)',

  /* ── Overlay tints (for icon containers) ─────────────────────────── */
  warningTint:  'rgba(245,158,11,0.20)',
  dangerTint:   'rgba(239,68,68,0.20)',
  primaryTint:  'rgba(255,140,66,0.20)',
  secondaryTint:'rgba(74,144,226,0.20)',
  successTint:  'rgba(16,185,129,0.20)',
} as const;

export type TomiTheme = typeof TOMI_THEME;
