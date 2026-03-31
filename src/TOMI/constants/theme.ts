/**
 * TOMI Design Tokens — light + dark palettes
 * Use `useTheme()` from ThemeContext for runtime colors in components.
 */

export const LIGHT_THEME = {
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

  /* ── Overlay tints ────────────────────────────────────────────────── */
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

export type TomiThemeColors = { [K in keyof typeof LIGHT_THEME]: string };

/** Night / dark mode — muted surfaces & accents (easier on the eyes) */
export const DARK_THEME: TomiThemeColors = {
  primary:         '#B87D62',
  primaryLight:    '#C9947A',
  primaryPressed:  '#9E684F',
  secondary:       '#6E88A0',
  secondaryLight:  '#8A9FB4',

  textPrimary:     '#D1D5DD',
  textSecondary:   '#939AA8',
  textMuted:       '#6B7280',
  textLight:       '#565C68',

  warning:         '#B8955A',
  danger:          '#B07075',
  success:         '#4BA885',
  successLight:    '#5FBA97',

  background:      '#16171B',
  cardBg:          '#1E1F24',
  cardBgAlt:       '#25262C',

  glassBg:         'rgba(30,31,36,0.72)',
  glassBgStrong:   'rgba(30,31,36,0.86)',
  glassBgSubtle:   'rgba(30,31,36,0.48)',
  glassBorder:     'rgba(255,255,255,0.07)',
  glassBorderWeak: 'rgba(255,255,255,0.035)',

  warningTint:     'rgba(184,149,90,0.10)',
  dangerTint:      'rgba(176,112,117,0.10)',
  primaryTint:     'rgba(184,125,98,0.10)',
  primaryTintMed:  'rgba(184,125,98,0.16)',
  secondaryTint:   'rgba(110,136,160,0.10)',
  secondaryTintMed:'rgba(110,136,160,0.16)',
  successTint:     'rgba(75,168,133,0.10)',

  borderLight:     'rgba(255,255,255,0.06)',
  borderSubtle:    'rgba(255,255,255,0.035)',
};

/** @deprecated Use `useTheme().colors` — kept for gradual migration */
export const TOMI_THEME = LIGHT_THEME as TomiThemeColors;

export type TomiTheme = TomiThemeColors;

export function themeColorsFor(resolved: 'light' | 'dark'): TomiThemeColors {
  return resolved === 'dark' ? DARK_THEME : LIGHT_THEME;
}
