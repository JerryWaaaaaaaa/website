import type { TokenId } from './tokens';

export type PaletteKey = 'c1' | 'c2' | 'c3' | 'c4';

export type Palette = Record<PaletteKey, TokenId>;

export type LayerShape = 'ellipse' | 'circle';

export type Layer = {
  shape: LayerShape;
  xPct: number;
  yPct: number;
  sizePct: number;
  paletteKey: PaletteKey;
  alpha: number;
};

export type GradientPreset = {
  id: string;
  name: string;
  basePaletteKey: PaletteKey;
  layers: Layer[];
};

export const PALETTE_KEYS: PaletteKey[] = ['c1', 'c2', 'c3', 'c4'];

export const DEFAULT_PALETTE: Palette = {
  c1: 'gradient-stop-1',
  c2: 'gradient-stop-2',
  c3: 'gradient-stop-3',
  c4: 'gradient-stop-4',
};

const l = (
  shape: LayerShape,
  xPct: number,
  yPct: number,
  paletteKey: PaletteKey,
  alphaHex: string,
  sizePct: number,
): Layer => ({
  shape,
  xPct,
  yPct,
  paletteKey,
  alpha: parseInt(alphaHex, 16),
  sizePct,
});

export const DEFAULT_PRESETS: GradientPreset[] = [
  {
    id: 'aurora',
    name: 'Aurora',
    basePaletteKey: 'c1',
    layers: [
      l('ellipse', 20, 50, 'c4', 'cc', 60),
      l('ellipse', 80, 20, 'c3', 'bb', 55),
      l('ellipse', 60, 80, 'c2', 'dd', 50),
      l('ellipse', 10, 10, 'c1', 'ff', 45),
    ],
  },
  {
    id: 'nebula',
    name: 'Nebula',
    basePaletteKey: 'c3',
    layers: [
      l('ellipse', 70, 30, 'c4', 'ee', 50),
      l('ellipse', 30, 70, 'c3', 'cc', 55),
      l('ellipse', 50, 10, 'c2', 'aa', 40),
      l('ellipse', 90, 90, 'c1', 'ff', 45),
    ],
  },
  {
    id: 'mist',
    name: 'Mist',
    basePaletteKey: 'c2',
    layers: [
      l('ellipse', 40, 40, 'c1', 'ff', 60),
      l('ellipse', 75, 65, 'c4', '99', 55),
      l('ellipse', 15, 80, 'c3', 'bb', 50),
      l('ellipse', 85, 15, 'c2', 'cc', 45),
    ],
  },
  {
    id: 'dreamy',
    name: 'Dreamy',
    basePaletteKey: 'c2',
    layers: [
      l('ellipse', 50, 0, 'c4', 'dd', 55),
      l('ellipse', 0, 100, 'c3', 'cc', 50),
      l('ellipse', 100, 100, 'c2', 'bb', 60),
      l('ellipse', 50, 50, 'c1', 'aa', 45),
    ],
  },
  {
    id: 'cosmos',
    name: 'Cosmos',
    basePaletteKey: 'c1',
    layers: [
      l('ellipse', 25, 25, 'c3', 'ff', 45),
      l('ellipse', 75, 25, 'c4', 'dd', 50),
      l('ellipse', 25, 75, 'c2', 'cc', 50),
      l('ellipse', 75, 75, 'c1', 'ff', 45),
      l('ellipse', 50, 50, 'c3', '88', 60),
    ],
  },
  {
    id: 'vapor',
    name: 'Vapor',
    basePaletteKey: 'c2',
    layers: [
      l('ellipse', 0, 50, 'c4', 'bb', 55),
      l('ellipse', 100, 50, 'c2', 'cc', 55),
      l('ellipse', 50, 0, 'c3', 'aa', 50),
      l('ellipse', 50, 100, 'c1', 'dd', 50),
    ],
  },
  {
    id: 'iris',
    name: 'Iris',
    basePaletteKey: 'c1',
    layers: [
      l('circle', 30, 60, 'c4', 'cc', 40),
      l('circle', 70, 40, 'c3', 'bb', 45),
      l('circle', 50, 80, 'c2', 'dd', 35),
      l('circle', 20, 20, 'c1', 'ff', 40),
      l('circle', 80, 80, 'c4', '99', 40),
    ],
  },
  {
    id: 'prism',
    name: 'Prism',
    basePaletteKey: 'c3',
    layers: [
      l('ellipse', 60, 10, 'c4', 'ee', 45),
      l('ellipse', 10, 60, 'c3', 'dd', 50),
      l('ellipse', 90, 60, 'c2', 'cc', 45),
      l('ellipse', 60, 90, 'c1', 'ff', 50),
    ],
  },
  {
    id: 'bloom',
    name: 'Bloom',
    basePaletteKey: 'c2',
    layers: [
      l('ellipse', 50, 50, 'c1', 'ff', 40),
      l('ellipse', 20, 30, 'c4', 'cc', 45),
      l('ellipse', 80, 30, 'c3', 'bb', 45),
      l('ellipse', 20, 70, 'c2', 'cc', 45),
      l('ellipse', 80, 70, 'c4', 'dd', 45),
    ],
  },
  {
    id: 'dusk',
    name: 'Dusk',
    basePaletteKey: 'c3',
    layers: [
      l('ellipse', 0, 0, 'c4', 'ff', 60),
      l('ellipse', 100, 0, 'c3', 'ee', 55),
      l('ellipse', 50, 100, 'c2', 'dd', 60),
      l('ellipse', 50, 50, 'c1', 'aa', 50),
    ],
  },
  {
    id: 'crystal',
    name: 'Crystal',
    basePaletteKey: 'c1',
    layers: [
      l('ellipse', 33, 33, 'c3', 'dd', 40),
      l('ellipse', 66, 33, 'c4', 'bb', 40),
      l('ellipse', 50, 66, 'c2', 'cc', 45),
      l('ellipse', 10, 90, 'c1', 'ff', 40),
      l('ellipse', 90, 10, 'c4', '99', 40),
    ],
  },
  {
    id: 'aether',
    name: 'Aether',
    basePaletteKey: 'c1',
    layers: [
      l('ellipse', 50, 20, 'c3', 'ff', 50),
      l('ellipse', 80, 70, 'c4', 'cc', 50),
      l('ellipse', 20, 70, 'c2', 'dd', 50),
    ],
  },
];
