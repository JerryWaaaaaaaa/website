# DESIGN.md — Zoom Docs Microsite

> Source: [Figma Microsite V2](https://www.figma.com/design/3NLw5saqyjo4SpMkPRiLXF/Microsite-V2?node-id=1933-43371) · Last updated: April 2026
>
> Implementation patterns (full CSS / HTML / JS): [`design-system/`](design-system/DESIGN_RULES.md)

---

## Brand & Voice

- Product-marketing microsite for Zoom's AI productivity suite.
- Tone: confident, concise, benefit-led. No jargon. 4–6 word CTAs.

---

## Color Palette

### Primitive Tokens

| Token | Value |
|---|---|
| `--color-white` | `#FFFFFF` |
| `--color-shade-light` | `#F3F8FF` |
| `--color-shade-medium` | `#E3EDFC` |
| `--color-shade-dark` | `#D2DEF2` |
| `--color-blue` | `#0C5CFF` |
| `--color-pink` | `#E0D5FF` |
| `--color-black` | `#000000` |
| `--color-gray` | `#4C4C4C` |
| `--color-gray-light` | `#999999` |

### Semantic Tokens — Backgrounds

| Token | Alias | Usage |
|---|---|---|
| `--bg-neutral` | `--color-white` | Page background |
| `--bg-accent-light` | `--color-shade-light` | Chips, secondary buttons, light sections |
| `--bg-accent-medium` | `--color-shade-medium` | Medium-tint surfaces, hover states |
| `--bg-accent-dark` | `--color-shade-dark` | Darker tint surfaces, pressed states |
| `--bg-highlight-blue` | `--color-blue` | Blue CTA sections, dark card halves |
| `--bg-highlight-pink` | `--color-pink` | Pink accent sections |
| `--bg-contrast` | `--color-black` | Primary button fill, high-contrast surfaces |

### Semantic Tokens — Text

| Token | Alias | Usage |
|---|---|---|
| `--text-primary` | `--color-black` | Headings, default body text |
| `--text-secondary` | `--color-gray` | Descriptions, muted copy |
| `--text-highlight` | `--color-blue` | Chip labels, accent text, inline links |
| `--text-contrast` | `--color-white` | Text on dark surfaces |
| `--text-contrast-secondary` | `--color-gray-light` | Muted text on dark surfaces |

### Semantic Tokens — Other

| Token | Value / Alias | Usage |
|---|---|---|
| `--stroke` | `--color-shade-medium` | Borders, dividers, card outlines |
| `--gradient-accent` | `radial-gradient(ellipse at center, #F8F2FF 7%, #E9F5FF 69%, #BFD1FB 93%, #98B6F5 100%)` | Feature section backgrounds |

---

## Typography

**Font family:** General Sans (weights 400, 500) · Fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`

### Type Scale

| Role | Desktop ≥1200 | Tablet 640–1199 | Mobile <640 | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|---|
| Heading 1 | 60px | 48px | 36px | 500 | 1.0 | -0.01em |
| Heading 2 | 44px | 36px | 28px | 500 | 1.0 | -0.02em |
| Heading 3 | 32px | 26px | 22px | 500 | 1.1 | -0.01em |
| Heading 4 | 22px | 20px | 18px | 500 | 1.0 | -0.01em |
| Heading 5 | 20px | 18px | 16px | 500 | 1.5 | 0 |
| Body | 18px | 16px | 16px | 400 | 1.4 | 0 |
| Button Label | 16px | 16px | 14px | 500 | 1.2 | -0.01em |
| Caption | 14px | 14px | 14px | 400 | 16px | 0 |
| Overline | 12px | 12px | 12px | 500 | 1.0 | +0.01em |

### Typography Rules

- Only weights 400 (Regular) and 500 (Medium).
- H1 and H2 always use tight negative letter-spacing.
- Body line-height is always 1.4 — never tighten below this.
- Overline is always `text-transform: uppercase`.
- Caption line-height is a fixed 16px value, not a multiplier.
- No new type ramp steps without design approval.

---

## Spacing & Layout

- **Base unit:** 4px
- **Common values:** 4, 8, 12, 16, 20, 24, 32, 48px
- **Container max-width:** 1024px (centered)
- **Breakpoints:** 1199px (tablet), 639px (mobile)

---

## Surfaces

### Frosted Glass

Used for floating UI over page content (scrolled nav pill, dropdown panels, modals).

| Token | Value |
|---|---|
| `--glass-bg` | `rgba(252, 253, 255, 0.80)` |
| `--glass-blur` | `16px` |
| `--glass-border` | `1px solid var(--border-subtle)` |

Rules: always apply as a group (bg + blur + border). Never substitute a solid background. Always include `-webkit-backdrop-filter` for Safari.

---

## Components

### Button

> Full CSS / HTML: [`design-system/components/button.md`](design-system/components/button.md)

Pill-shaped action trigger. Two variants:

| Variant | Background | Text Color | Hover |
|---|---|---|---|
| Primary | `--bg-contrast` | `--text-contrast` | `opacity: 0.85` |
| Secondary | `--bg-accent-light` | `--text-secondary` | `bg → --bg-accent-medium` |

| Property | Value |
|---|---|
| Font | Button Label role |
| Height | 46px |
| Padding | 0 20px |
| Border radius | 999px |
| Border | none |

Rules:
- One primary button per visible viewport section.
- Button text: 4–6 words max, action-oriented.
- Never change primary background away from black.
- Always pair secondary with a primary. Never show secondary alone.
- Gap between adjacent buttons: 12px.

### Chip / Label Tag

> Full CSS / HTML: [`design-system/components/chip.md`](design-system/components/chip.md)

Single-line uppercase pill label.

| Property | Value |
|---|---|
| Background | `--bg-accent-light` |
| Text color | `--text-highlight` |
| Font | Overline role |
| Padding | 6px 12px |
| Border radius | 999px |
| Height | 24px |

Rules:
- Place directly above section heading, 20px gap below.
- 1–3 word category label only. Never a sentence.
- No icon or close button.

### Navigation Bar

> Full CSS / HTML / JS: [`design-system/components/nav-bar.md`](design-system/components/nav-bar.md)

Fixed top nav with two scroll states.

| State | Background | Blur | Border Radius | Max Width |
|---|---|---|---|---|
| Default (top) | `rgba(255,255,255,0.01)` | none | 0 | 100vw |
| Scrolled (pill) | `--glass-bg` | `--glass-blur` | 32px | 1024px |

Transition: `250ms ease` on `background, backdrop-filter, border-color, border-radius, max-width, padding`.

Layout: `[Logo 95×36] — [Nav links centered, gap 20px] — [Secondary + Primary btn, gap 12px]`

Dropdown panels use the Frosted Glass surface with `border-radius: 16px`.

Rules:
- Always horizontally centered.
- Pill state uses Frosted Glass tokens exclusively — never hardcode.
- Max 3 top-level nav link groups.
- Dropdowns open on click only, never hover.
- Always show both Sign in (secondary) and Get started now (primary).

---

## Token Quick-Copy

Paste into your global `:root` stylesheet:

```css
:root {
  /* --- Primitive tokens --- */
  --color-white:        #FFFFFF;
  --color-shade-light:  #F3F8FF;
  --color-shade-medium: #E3EDFC;
  --color-shade-dark:   #D2DEF2;
  --color-blue:         #0C5CFF;
  --color-pink:         #E0D5FF;
  --color-black:        #000000;
  --color-gray:         #4C4C4C;
  --color-gray-light:   #999999;

  /* --- Semantic tokens: Backgrounds --- */
  --bg-neutral:        var(--color-white);
  --bg-accent-light:   var(--color-shade-light);
  --bg-accent-medium:  var(--color-shade-medium);
  --bg-accent-dark:    var(--color-shade-dark);
  --bg-highlight-blue: var(--color-blue);
  --bg-highlight-pink: var(--color-pink);
  --bg-contrast:       var(--color-black);

  /* --- Semantic tokens: Text --- */
  --text-primary:             var(--color-black);
  --text-secondary:           var(--color-gray);
  --text-highlight:           var(--color-blue);
  --text-contrast:            var(--color-white);
  --text-contrast-secondary:  var(--color-gray-light);

  /* --- Semantic tokens: Gradients --- */
  --gradient-accent: radial-gradient(
    ellipse at center,
    #F8F2FF  7%,
    #E9F5FF 69%,
    #BFD1FB 93%,
    #98B6F5 100%
  );

  /* --- Semantic tokens: Stroke --- */
  --stroke:            var(--color-shade-medium);

  /* --- Frosted Glass Surface --- */
  --glass-bg:     rgba(252, 253, 255, 0.80);
  --glass-blur:   16px;
  --glass-border: 1px solid var(--border-subtle);
}
```
