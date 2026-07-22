---
name: Zoom AI Create — Microsite Design System
version: 2.0.0
description: >-
  The single source of truth for the Zoom AI Create product-marketing
  microsite. Every color, type, spacing, elevation, motion, and component
  value used across the site is defined here. The CSS custom properties in
  `src/index.css` mirror this document one-to-one — this file is authoritative.
source: 'Figma — Microsite V2 (node 1933-43371)'
themes:
  - Light
colorFormat: 'sRGB hex'
tokens:
  colors:
    primitive:
      white: '#FFFFFF'
      shade-light: '#F3F8FF'
      shade-medium: '#E3EDFC'
      shade-dark: '#D2DEF2'
      blue: '#0C5CFF'
      blue-inactive: '#A3B9DD'
      icon-brand: '#0D6BDE'
      pink: '#E0D5FF'
      black: '#000000'
      gray: '#4C4C4C'
      gray-light: '#999999'
    background:
      bg-neutral: 'var(--color-white)'
      bg-accent-light: 'var(--color-shade-light)'
      bg-accent-medium: 'var(--color-shade-medium)'
      bg-accent-dark: 'var(--color-shade-dark)'
      bg-highlight-blue: 'var(--color-blue)'
      bg-highlight-pink: 'var(--color-pink)'
      bg-contrast: 'var(--color-black)'
    text:
      text-primary: 'var(--color-black)'
      text-secondary: 'var(--color-gray)'
      text-highlight: 'var(--color-blue)'
      text-contrast: 'var(--color-white)'
      text-contrast-secondary: 'var(--color-gray-light)'
      text-inactive: 'var(--color-blue-inactive)'
    line:
      stroke: 'var(--color-shade-medium)'
      border-subtle: 'rgba(117, 115, 114, 0.15)'
      border-white: 'rgba(255, 255, 255, 0.40)'
    gradient:
      gradient-accent: 'radial-gradient(ellipse at center, #F8F2FF 7%, #E9F5FF 69%, #BFD1FB 93%, #98B6F5 100%)'
    surface:
      glass-bg: 'rgba(252, 253, 255, 0.80)'
      glass-blur: '16px'
      glass-border: '1px solid var(--border-subtle)'
      glass-fill: 'rgba(12, 92, 255, 0.05)'
      glass-fill-hover: 'rgba(12, 92, 255, 0.12)'
  typography:
    family:
      sans: '"General Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    weight:
      regular: 400
      medium: 500
    scale:
      heading-1: { size-desktop: '60px', size-tablet: '48px', size-mobile: '36px', weight: 500, line-height: 1.0, tracking: '-0.01em' }
      heading-2: { size-desktop: '44px', size-tablet: '36px', size-mobile: '28px', weight: 500, line-height: 1.0, tracking: '-0.02em' }
      heading-3: { size-desktop: '32px', size-tablet: '26px', size-mobile: '22px', weight: 500, line-height: 1.1, tracking: '-0.01em' }
      heading-4: { size-desktop: '22px', size-tablet: '20px', size-mobile: '18px', weight: 500, line-height: 1.0, tracking: '-0.01em' }
      heading-5: { size-desktop: '20px', size-tablet: '18px', size-mobile: '16px', weight: 500, line-height: 1.5, tracking: '0' }
      body: { size-desktop: '18px', size-tablet: '16px', size-mobile: '16px', weight: 400, line-height: 1.4, tracking: '0' }
      button-label: { size-desktop: '16px', size-tablet: '16px', size-mobile: '14px', weight: 500, line-height: 1.2, tracking: '-0.01em' }
      caption: { size-desktop: '14px', size-tablet: '14px', size-mobile: '14px', weight: 400, line-height: '16px', tracking: '0' }
      overline: { size-desktop: '12px', size-tablet: '12px', size-mobile: '12px', weight: 500, line-height: 1.0, tracking: '0.01em', transform: 'uppercase' }
  spacing:
    base: '4px'
    scale: ['4px', '8px', '12px', '16px', '20px', '24px', '32px', '48px']
    section-block: '96px / 80px / 56px (desktop / tablet / mobile)'
    gutter: '40px / 32px / 20px (desktop / tablet / mobile)'
    page-max-width: '1200px'
  breakpoints:
    tablet: '1199px'
    mobile: '639px'
  rounded:
    sm: '8px'
    md: '12px'
    lg: '16px'
    xl: '20px'
    2xl: '24px'
    3xl: '32px'
    pill: '999px'
  elevation:
    shadow-color: '20, 28, 40'
    elevation-1: '0 1px 2px rgba(20, 28, 40, 0.06), 0 1px 3px rgba(20, 28, 40, 0.04)'
    elevation-2: '0 2px 4px rgba(20, 28, 40, 0.06), 0 6px 14px rgba(20, 28, 40, 0.08)'
    elevation-3: '0 4px 8px rgba(20, 28, 40, 0.07), 0 12px 28px rgba(20, 28, 40, 0.10)'
    elevation-4: '0 2px 4px rgba(20, 28, 40, 0.06), 0 8px 16px rgba(20, 28, 40, 0.08), 0 24px 48px rgba(20, 28, 40, 0.12)'
  motion:
    ease-out: 'cubic-bezier(0.23, 1, 0.32, 1)'
    ease-emphasized: 'cubic-bezier(0.16, 1, 0.3, 1)'
    ease-drawer: 'cubic-bezier(0.32, 0.72, 0, 1)'
    duration-feedback: '150ms'
    duration-fast: '200ms'
    duration-base: '250ms'
    duration-slow: '350ms'
  components:
    button:
      height: '46px'
      padding: '0 20px'
      radius: 'var(--radius-pill)'
      font: 'button-label'
      gap: '12px'
    chip:
      height: '24px'
      padding: '6px 12px'
      radius: 'var(--radius-pill)'
      font: 'overline'
    nav-bar:
      radius-pill: '32px'
      dropdown-radius: '16px'
      max-width: '1024px'
      transition: '250ms ease'
---

# Zoom AI Create — Microsite Design System

## Overview

This is the design system for the Zoom AI Create product-marketing microsite —
a Vite + React + TypeScript prototype for Zoom's AI productivity suite. It is
the **single source of truth**: color, type, spacing, elevation, motion, and
component values are defined here once, and the CSS custom properties in
[`src/index.css`](src/index.css) mirror these tokens exactly.

The system has a **single Light theme**. Colors are expressed as sRGB hex at
the primitive tier and referenced through semantic tokens everywhere else.
Always style components against semantic tokens (`--bg-accent-light`,
`--text-secondary`) — never raw hex or primitive variables — so a single token
change propagates across the whole site.

The aesthetic is confident, clean, and benefit-led: a white canvas, soft blue
tints for surfaces, one saturated brand blue for emphasis, and generous
whitespace. Motion is quiet and physical; elevation is a single coherent stack
rather than per-component shadows.

## Colors

Colors are organized in two tiers that match the Figma variable collections:

- **Primitive** — the raw palette (`--color-*`). Never referenced directly in
  component styles.
- **Semantic** — intent-based aliases (`--bg-*`, `--text-*`, `--stroke`) that
  point at primitives. These are what components consume.

**Backgrounds** run from the plain page canvas (`--bg-neutral`, white) up
through three blue tints — `--bg-accent-light` for chips, secondary buttons,
and light sections; `--bg-accent-medium` for hover/medium surfaces;
`--bg-accent-dark` for pressed/darker surfaces. `--bg-highlight-blue` is the
saturated brand blue for CTA bands and dark card halves; `--bg-highlight-pink`
is a soft accent; `--bg-contrast` (black) fills primary buttons and
high-contrast surfaces. For translucent fills that sit on the frosted glass, see the
**Glass material fill** under Frosted glass surface below.

**Text** defaults to `--text-primary` (black) for headings and body, with
`--text-secondary` (gray) for descriptions and muted copy. `--text-highlight`
(brand blue) is for chip labels, accents, and inline links. On dark surfaces
use `--text-contrast` (white) and `--text-contrast-secondary` (light gray).
`--text-inactive` marks disabled/inactive controls.

**Icons** use `--color-icon-brand` (`#0D6BDE`) as the fill for brand
product-icon SVG assets (Hub, Mail, Calendar, Meeting). It is a slightly deeper
blue than `--color-blue`, which stays reserved for UI accents, links, and CTA
bands. The value is baked into the icon SVG files under `public/Icon/`.

**Lines** use `--stroke` for borders, dividers, and card outlines.
`--border-subtle` and `--border-white` are reserved for the frosted-glass
surface treatment.

### Primitive palette

| Token | Value |
|---|---|
| `--color-white` | `#FFFFFF` |
| `--color-shade-light` | `#F3F8FF` |
| `--color-shade-medium` | `#E3EDFC` |
| `--color-shade-dark` | `#D2DEF2` |
| `--color-blue` | `#0C5CFF` |
| `--color-blue-inactive` | `#A3B9DD` |
| `--color-icon-brand` | `#0D6BDE` |
| `--color-pink` | `#E0D5FF` |
| `--color-black` | `#000000` |
| `--color-gray` | `#4C4C4C` |
| `--color-gray-light` | `#999999` |

### Semantic tokens

| Token | Resolves to | Usage |
|---|---|---|
| `--bg-neutral` | `#FFFFFF` | Page background |
| `--bg-accent-light` | `#F3F8FF` | Chips, secondary buttons, light sections |
| `--bg-accent-medium` | `#E3EDFC` | Medium-tint surfaces, hover states |
| `--bg-accent-dark` | `#D2DEF2` | Darker-tint surfaces, pressed states |
| `--bg-highlight-blue` | `#0C5CFF` | Brand-blue CTA bands, dark card halves |
| `--bg-highlight-pink` | `#E0D5FF` | Pink accent sections |
| `--bg-contrast` | `#000000` | Primary button fill, high-contrast surfaces |
| `--text-primary` | `#000000` | Headings, default body text |
| `--text-secondary` | `#4C4C4C` | Descriptions, muted copy |
| `--text-highlight` | `#0C5CFF` | Chip labels, accent text, inline links |
| `--text-contrast` | `#FFFFFF` | Text on dark surfaces |
| `--text-contrast-secondary` | `#999999` | Muted text on dark surfaces |
| `--text-inactive` | `#A3B9DD` | Disabled / inactive controls |
| `--stroke` | `#E3EDFC` | Borders, dividers, card outlines |
| `--gradient-accent` | `#F8F2FF → #98B6F5` | Radial gradient — feature/hero backgrounds |

The gradient token in full:

```css
--gradient-accent: radial-gradient(
  ellipse at center,
  #F8F2FF  7%,
  #E9F5FF 69%,
  #BFD1FB 93%,
  #98B6F5 100%
);
```

## Typography

**Font family:** [General Sans](https://www.fontshare.com/fonts/general-sans),
weights **400 (Regular)** and **500 (Medium)** only. Fallback stack:
`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`.
Load General Sans before any type styles are applied.

The ramp has nine roles. Each has discrete desktop / tablet / mobile sizes; the
implementation in `src/index.css` interpolates the headings and body fluidly
with `clamp()` between the 360px and 1200px viewports rather than stepping at
breakpoints — the discrete sizes below are the canonical anchors.

| Role | Desktop ≥1200 | Tablet 640–1199 | Mobile <640 | Weight | Line height | Tracking |
|---|---|---|---|---|---|---|
| Heading 1 | 60px | 48px | 36px | 500 | 1.0 | -0.01em |
| Heading 2 | 44px | 36px | 28px | 500 | 1.0 | -0.02em |
| Heading 3 | 32px | 26px | 22px | 500 | 1.1 | -0.01em |
| Heading 4 | 22px | 20px | 18px | 500 | 1.0 | -0.01em |
| Heading 5 | 20px | 18px | 16px | 500 | 1.5 | 0 |
| Body | 18px | 16px | 16px | 400 | 1.4 | 0 |
| Button Label | 16px | 16px | 14px | 500 | 1.2 | -0.01em |
| Caption | 14px | 14px | 14px | 400 | 16px | 0 |
| Overline | 12px | 12px | 12px | 500 | 1.0 | +0.01em, uppercase |

**Headings** carry tight negative tracking (H1/H2 especially) and short line
heights for a dense, confident masthead feel. **Body** is always `line-height:
1.4` — never tighter. **Button Label** doubles as the nav-link style.
**Caption** uses a fixed `16px` line height (not a multiplier). **Overline** is
the eyebrow label above headings and is always `text-transform: uppercase`.

Role guidance:

| Role | When to use |
|---|---|
| Heading 1 | The page hero title. One per page. |
| Heading 2 | Opening heading of each major section. One per section. |
| Heading 3 | Supporting heading inside a section — stat numbers, card titles, tab headings. |
| Heading 4 | Component-level headings inside cards or tightly scoped blocks. |
| Heading 5 | Small emphasis labels, sidebar headings, grouped list headers. |
| Body | All descriptive paragraph text. |
| Button Label | Button text and navigation link labels. |
| Caption | Image captions, footnotes, timestamps, metadata. |
| Overline | Eyebrow labels above headings (e.g. "AUTO WRITING"). |

## Layout

- **Base unit:** `4px`. All spacing is a multiple of it.
- **Spacing scale:** `4, 8, 12, 16, 20, 24, 32, 48px`.
- **Section rhythm:** vertical block padding is `--section-block`
  (`96 / 80 / 56px`) and horizontal gutter is `--gutter` (`40 / 32 / 20px`),
  stepped at the two breakpoints (desktop / tablet / mobile). Integer values
  only — no fluid sub-pixel padding.
- **Container:** centered, `max-width: var(--page-max-width)` = `1200px`.
- **Breakpoints:** `1199px` (tablet) and `639px` (mobile). Layout collapses at
  these two thresholds only.

```css
.section {
  width: 100%;
  max-width: var(--page-max-width);
  margin: 0 auto;
  padding: var(--section-block) var(--gutter);
}
```

## Elevation & Depth

Shadows come from **one cool near-black light source** (`--shadow-color: 20, 28,
40`), layered into a four-step scale. Reference these tokens instead of writing
bespoke `box-shadow` values so co-visible surfaces read as a single coherent
stack.

| Token | Role | Value |
|---|---|---|
| `--elevation-1` | Resting chrome — buttons, tool/composer cards | `0 1px 2px rgba(20,28,40,0.06), 0 1px 3px rgba(20,28,40,0.04)` |
| `--elevation-2` | Raised — active items inside a panel | `0 2px 4px rgba(20,28,40,0.06), 0 6px 14px rgba(20,28,40,0.08)` |
| `--elevation-3` | Floating widgets — context cards, AI bars, tooltips | `0 4px 8px rgba(20,28,40,0.07), 0 12px 28px rgba(20,28,40,0.10)` |
| `--elevation-4` | Overlay panels — comments, history, suggestions | `0 2px 4px rgba(20,28,40,0.06), 0 8px 16px rgba(20,28,40,0.08), 0 24px 48px rgba(20,28,40,0.12)` |

### Frosted glass surface

A named treatment for floating UI that overlays page content — the scrolled nav
pill, dropdown panels, modals, tooltips. Apply the three properties **as a
group**; never substitute a solid background (the blur needs partial
transparency to read).

```css
.surface-glass {
  background: var(--glass-bg);           /* rgba(252, 253, 255, 0.80) */
  backdrop-filter: blur(var(--glass-blur));         /* 16px */
  -webkit-backdrop-filter: blur(var(--glass-blur)); /* always include for Safari */
  border: var(--glass-border);           /* 1px solid var(--border-subtle) */
}
```

**Glass material fill.** Interactive surfaces that sit *on* the glass — the nav
product cards, the nav links (hover + selected), and the secondary (Sign-in) CTA —
share one material, `--glass-fill` (`rgba(12, 92, 255, 0.05)`): a low-alpha brand-blue
fill so they read as a single family and let the frosted backdrop show through instead
of stacking opaque blocks. `--glass-fill-hover` (`rgba(12, 92, 255, 0.12)`) is the
hover / press step. Over white `--glass-fill` composites to ≈ `--bg-accent-light`, but
always reference the token (not the solid) wherever the surface can overlap glass.

## Motion

Motion is quiet, physical, and fast. The built-in CSS easings are too weak, so
the system defines three custom curves:

| Token | Curve | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Responsive UI feedback (press, hover, short travel) |
| `--ease-emphasized` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances that travel a longer distance |
| `--ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | iOS-style drawer / mobile nav layout motion |

Duration guidance: `150ms` for tap/press feedback, `200ms` for small
appearance transitions (dropdown fade), `250ms` for the nav pill state change,
`350ms` for larger reveals. Always honor `prefers-reduced-motion: reduce` —
disable transforms and non-essential animation.

```css
.btn {
  transition: opacity 150ms ease, background 150ms ease,
    transform 160ms var(--ease-out);
}
.btn:active { transform: scale(0.97); }

@media (prefers-reduced-motion: reduce) {
  .btn, .btn:active { transform: none; }
}
```

## Shapes

Radius climbs with surface size. Pills are fully rounded; cards step up with
their footprint.

| Token | Value | Use |
|---|---|---|
| `--rounded-sm` | `8px` | Product cards, small tiles |
| `--rounded-md` | `12px` | Media wells, inline images |
| `--rounded-lg` | `16px` | Dropdown panels, artifact images |
| `--rounded-xl` | `20px` | Inner content frames |
| `--rounded-2xl` | `24px` | Hero prompt / browser cards |
| `--rounded-3xl` | `32px` | Large feature cards, scrolled nav pill |
| `--radius-pill` | `999px` | Buttons, chips, URL pills |

## Components

Components are built exclusively from the tokens above. The three canonical
primitives are Button, Chip, and Navigation Bar.

This section is the source of truth for each component's **design intent** —
its variants, specs, and usage rules. It is deliberately not the source of
truth for *implementation*: the actual CSS/JSX lives in the code and must not
be duplicated here (that would drift). See:

- **Button** — [`src/components/Button.tsx`](src/components/Button.tsx) + `.btn` rules in [`src/index.css`](src/index.css)
- **Chip** — [`src/components/Chip.tsx`](src/components/Chip.tsx) + `.chip` rules in `src/index.css`
- **Navigation Bar** — [`src/components/Nav.tsx`](src/components/Nav.tsx) + [`Nav.module.css`](src/components/Nav.module.css)
- Live, rendered previews of all three at the `/style-guide` route.

### Button

A pill-shaped action trigger for CTAs and navigation actions. Two variants.

| Property | Value |
|---|---|
| Height | `46px` |
| Padding | `0 20px` |
| Radius | `999px` (`--radius-pill`) |
| Font | Button Label role |
| Border | none |
| Gap between adjacent buttons | `12px` |

| Property | Primary | Secondary |
|---|---|---|
| Background | `--bg-contrast` (`#000000`) | `--bg-accent-light` (`#F3F8FF`) |
| Text color | `--text-contrast` (`#FFFFFF`) | `--text-secondary` (`#4C4C4C`) |
| Hover | `opacity: 0.85` | `background: --bg-accent-medium` |
| Active | `transform: scale(0.97)` | `transform: scale(0.97)` |

Hover states are gated behind `@media (hover: hover) and (pointer: fine)` so
touch taps don't leave a stuck hover, and press feedback (`scale(0.97)`) is
disabled under `prefers-reduced-motion`.

**Rules**

- One primary button per visible viewport section. Never stack two primaries.
- Button text is short and action-oriented (4–6 words max).
- Never change the primary background away from black (or a direct brand equivalent).
- Always pair a secondary with a primary — never a lone secondary.

### Chip / Label Tag

A single-line uppercase pill label placed above a section heading.

| Property | Value |
|---|---|
| Background | `--bg-accent-light` (`#F3F8FF`) |
| Text color | `--text-highlight` (`#0C5CFF`) |
| Font | Overline role (uppercase) |
| Padding | `6px 12px` |
| Height | `24px` |
| Radius | `999px` |

**Rules**

- Place directly above the section heading with a `20px` gap below.
- 1–3 word category label only — never a sentence.
- No icon or close button on this variant.

### Navigation Bar

A fixed top navigation with two scroll-driven states: a full-width **default**
state at the top of the page, and a centered frosted-glass **pill** once
`scrollY > 50px`.

| State | Background | Blur | Radius | Max width | Padding |
|---|---|---|---|---|---|
| Default (top) | `rgba(255,255,255,0.01)` | none | `0` | `100vw` | `16px 24px` |
| Scrolled (pill) | `--glass-bg` | `blur(--glass-blur)` | `32px` | `1024px` | `12px 18px 12px 24px` |

Transition between states at `250ms ease` on `background`, `backdrop-filter`,
`border-color`, `border-radius`, `max-width`, and `padding`.

**Layout:** `[Logo 95×36] — [Nav links, centered, gap 20px] — [Secondary + Primary, gap 12px]`

**Dropdown panels** open on click (never hover), use the frosted-glass surface
with `border-radius: 16px` and `max-width: 1024px`, and fade in over `200ms`.
Product cards inside use `--rounded-sm` (8px) with an `--bg-accent-light` image
well and hover fill.

**Rules**

- Always horizontally centered.
- The pill state uses the frosted-glass tokens exclusively — never hardcode them.
- Never a solid background in either state.
- Max 3 top-level nav link groups.
- Dropdowns open on click only.
- Always show both Sign in (secondary) and Get started now (primary).

## Voice & Content

- Product-marketing microsite for Zoom's AI productivity suite. Tone:
  confident, concise, benefit-led. No jargon.
- CTAs are 4–6 words, action-first ("Get started for free", "Try now").
- Chip / eyebrow labels are 1–3 words, category-style.
- Headings lead with the benefit, not the feature name.
- Sentence case for body and buttons; UPPERCASE only for the Overline role.
- Descriptions are short — one idea per paragraph, generous whitespace between.

## Do's & Don'ts

- **Do** style against semantic tokens (`--bg-accent-light`, `--text-secondary`).
  **Don't** hardcode hex values or reference primitive `--color-*` variables in
  component styles.
- **Do** use the `--elevation-*` scale for shadows. **Don't** write bespoke
  per-component `box-shadow` values.
- **Do** apply the frosted-glass surface as a group (bg + blur + border).
  **Don't** substitute a solid background or drop `-webkit-backdrop-filter`.
- **Do** keep to weights 400 and 500. **Don't** introduce other font weights.
- **Do** keep body copy at `line-height: 1.4`. **Don't** tighten it.
- **Do** pair a secondary button with a primary. **Don't** ship a lone secondary
  or stack two primaries in one section.
- **Do** honor `prefers-reduced-motion: reduce`. **Don't** ship motion that
  can't be disabled.
- **Do** add new values as tokens here first, then mirror them in
  `src/index.css`. **Don't** introduce a new type ramp step, color, or radius
  without adding it to this document.
