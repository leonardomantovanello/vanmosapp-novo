// Tema único do app: cores, espaçamentos, bordas e tipografia.
// Centralizar esses valores evita duplicação entre telas e facilita
// ajustes futuros de identidade visual.
import { gradients, palette } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { fontSize, fontWeight } from '@/constants/typography';

export const theme = {
  colors: palette,
  gradients,
  spacing,
  radius,
  fontSize,
  fontWeight,
} as const;

export type Theme = typeof theme;

export default theme;
