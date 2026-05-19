/**
 * Curated palette of design tokens available to the gradient generator.
 * Mirrors the :root primitives in src/index.css plus the four warm stops
 * baked into --gradient-accent (which are the only "illustration-friendly"
 * pinks/blues in the system today).
 */

export type TokenId =
  | 'white'
  | 'shade-light'
  | 'shade-medium'
  | 'shade-dark'
  | 'blue'
  | 'pink'
  | 'black'
  | 'gray'
  | 'gray-light'
  | 'gradient-stop-1'
  | 'gradient-stop-2'
  | 'gradient-stop-3'
  | 'gradient-stop-4';

export type TokenGroup = 'Gradient' | 'Shades' | 'Brand' | 'Neutral';

export type DesignToken = {
  id: TokenId;
  label: string;
  hex: string;
  group: TokenGroup;
};

export const DESIGN_TOKENS: DesignToken[] = [
  { id: 'gradient-stop-1', label: 'Gradient 1', hex: '#F8F2FF', group: 'Gradient' },
  { id: 'gradient-stop-2', label: 'Gradient 2', hex: '#E9F5FF', group: 'Gradient' },
  { id: 'gradient-stop-3', label: 'Gradient 3', hex: '#BFD1FB', group: 'Gradient' },
  { id: 'gradient-stop-4', label: 'Gradient 4', hex: '#98B6F5', group: 'Gradient' },

  { id: 'shade-light', label: 'Shade Light', hex: '#F3F8FF', group: 'Shades' },
  { id: 'shade-medium', label: 'Shade Medium', hex: '#E3EDFC', group: 'Shades' },
  { id: 'shade-dark', label: 'Shade Dark', hex: '#D2DEF2', group: 'Shades' },

  { id: 'blue', label: 'Blue', hex: '#0C5CFF', group: 'Brand' },
  { id: 'pink', label: 'Pink', hex: '#E0D5FF', group: 'Brand' },

  { id: 'white', label: 'White', hex: '#FFFFFF', group: 'Neutral' },
  { id: 'gray-light', label: 'Gray Light', hex: '#999999', group: 'Neutral' },
  { id: 'gray', label: 'Gray', hex: '#4C4C4C', group: 'Neutral' },
  { id: 'black', label: 'Black', hex: '#000000', group: 'Neutral' },
];

const TOKEN_INDEX: Record<TokenId, DesignToken> = DESIGN_TOKENS.reduce(
  (acc, t) => {
    acc[t.id] = t;
    return acc;
  },
  {} as Record<TokenId, DesignToken>,
);

export function getToken(id: TokenId): DesignToken {
  return TOKEN_INDEX[id];
}

export function resolveToken(id: TokenId): string {
  return TOKEN_INDEX[id]?.hex ?? '#000000';
}

export function isTokenId(value: unknown): value is TokenId {
  return typeof value === 'string' && value in TOKEN_INDEX;
}

export const TOKEN_GROUPS: TokenGroup[] = ['Gradient', 'Shades', 'Brand', 'Neutral'];
