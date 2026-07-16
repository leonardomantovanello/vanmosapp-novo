// Paleta dark com gradiente roxo/rosa usada em todo o app.
export const palette = {
  background: '#0d0d0d',
  backgroundDarkest: '#080808',
  backgroundAlt: '#111111',
  surface: '#121212',
  surfaceElevated: '#171717',
  surfaceCard: '#1a1a1a',
  surfaceInput: '#2a2a2a',
  surfaceMuted: '#333333',

  border: '#2a2a2a',
  borderMuted: '#333333',
  borderInput: '#444444',
  divider: '#222222',

  textPrimary: '#ffffff',
  textSecondary: '#aaaaaa',
  textMuted: '#888888',
  textDim: '#666666',
  textFaint: '#555555',

  purple: '#aa00ff',
  purpleDeep: '#6600cc',
  purpleLight: '#cc44cc',
  purpleAlt: '#aa44ff',
  magenta: '#cc00ff',
  pink: '#ff00cc',
  pinkDeep: '#ff00aa',
  pinkLight: '#ff44cc',

  danger: '#ff4444',
  dangerStrong: '#cc3300',
  warning: '#ff8800',
  success: '#2ecc71',

  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0,0,0,0.6)',
  overlayStrong: 'rgba(0,0,0,0.75)',
} as const;

export const gradients = {
  purpleMagenta: [palette.purple, palette.magenta] as const,
  purplePink: [palette.purple, palette.pink] as const,
  pinkMagenta: [palette.pinkDeep, palette.pinkLight] as const,
  header: [palette.pink, palette.magenta] as const,
  action: [palette.magenta, palette.pinkDeep] as const,
} as const;
