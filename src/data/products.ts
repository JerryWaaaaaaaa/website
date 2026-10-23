/**
 * Canonical product identity for the Zoom AI Create suite — the single source of
 * truth for a product's key, display name, icon and brand color. Shared by the
 * marketing product-suite section (see ProductSuiteV5D) and the blog's
 * product filter (see BlogIndex) so the icon + name stay in sync in one place.
 *
 * Order matches the product-suite tab bar.
 */
export type ProductKey = 'paper' | 'slides' | 'sheets' | 'canvas' | 'datatable';

export type Product = {
  key: ProductKey;
  /** Display name, e.g. 'Data table'. */
  label: string;
  /** Full-color product icon in /public. The mono silhouette is the same path with `-fill`→`-mono`. */
  icon: string;
  /** Brand accent color. */
  color: string;
};

export const PRODUCTS: Product[] = [
  { key: 'paper', label: 'Paper', icon: '/Icon/product-icons/paper-fill.svg', color: '#0d6bde' },
  { key: 'slides', label: 'Slides', icon: '/Icon/product-icons/slides-fill.svg', color: '#fb327e' },
  { key: 'sheets', label: 'Sheets', icon: '/Icon/product-icons/sheets-fill.svg', color: '#019f5c' },
  { key: 'canvas', label: 'Canvas', icon: '/Icon/product-icons/canvas-fill.svg', color: '#3579fd' },
  {
    key: 'datatable',
    label: 'Data table',
    icon: '/Icon/product-icons/datatable-fill.svg',
    color: '#019f5c',
  },
];

const BY_KEY: Record<ProductKey, Product> = Object.fromEntries(
  PRODUCTS.map((p) => [p.key, p]),
) as Record<ProductKey, Product>;

/** Look up a product by key. Returns undefined for unknown / missing keys. */
export function productFor(key: string | undefined | null): Product | undefined {
  return key ? BY_KEY[key as ProductKey] : undefined;
}

/**
 * Hero product rotation (V5 + V6 heroes): the rotating product word, its
 * colour, the product UI shown in the browser frame, and the frame's URL. All
 * four advance together off one clock.
 */
export const HERO_PRODUCTS = [
  { name: 'Sheets', color: '#019F5C', image: '/hero-browser/sheets-ui.png', url: 'sheets.zoom.com' },
  { name: 'Canvas', color: '#3579FD', image: '/hero-browser/canvas-ui.png', url: 'canvas.zoom.com' },
  { name: 'Slides', color: '#FB327E', image: '/hero-browser/slides-UI.png', url: 'slides.zoom.com' },
  { name: 'Paper', color: '#3579FD', image: '/hero-browser/paper-ui.png', url: 'paper.zoom.com' },
];
