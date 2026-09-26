/**
 * Chốt Kèo Design Tokens & Theme
 * Based on Section 2: BRAND / DESIGN SYSTEM
 */

import { Platform } from 'react-native';

export const colors = {
  // Brand colors
  primary: '#FF5A36',
  primaryPressed: '#E84A28',
  primaryLight: '#FFF0ED',
  secondary: '#6C5CE7',
  secondaryLight: '#F0EEFD',
  accent: '#FFD166',
  accentLight: '#FFF9E6',

  // Surfaces & Backgrounds
  background: '#FFF9F4',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceMuted: '#F7F2ED',

  // Text
  textPrimary: '#171717',
  textSecondary: '#71717A',
  textMuted: '#A1A1AA',
  textInverse: '#FFFFFF',
  textBrand: '#FF5A36',

  // Borders & Dividers
  border: '#ECE7E2',
  borderLight: '#F3EFEA',
  borderFocus: '#FF5A36',

  // Semantic Status
  open: '#22C55E',
  openLight: '#EBFBF0',
  closingSoon: '#F59E0B',
  closingSoonLight: '#FEF6E7',
  closed: '#EF4444',
  closedLight: '#FEECEC',
  unknown: '#9CA3AF',
  unknownLight: '#F3F4F6',

  // System states
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.45)',
  overlayLight: 'rgba(0, 0, 0, 0.1)',
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 9999,
  container: 28,
};

export const typography = {
  fontFamily: Platform.select({
    web: 'Be Vietnam Pro, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    ios: 'System',
    android: 'sans-serif',
    default: undefined,
  }),
  display: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  pageTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    color: colors.textPrimary,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
    color: colors.textPrimary,
  },
  bodyBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
  captionMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
};

export const shadows = {
  none: {},
  subtle: {
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  floating: {
    shadowColor: '#FF5A36',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
};
