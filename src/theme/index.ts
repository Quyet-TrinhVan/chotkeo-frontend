export * from './tokens';
import { colors, spacing, radius, typography, shadows } from './tokens';

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadows,
};

export type Theme = typeof theme;
