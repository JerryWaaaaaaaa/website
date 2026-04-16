# Typography

**Primary font family:** [General Sans](https://www.fontshare.com/fonts/general-sans) (weights: 400, 500)  
**Fallback stack:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`

> General Sans must be loaded before any other type styles are applied. Use a `@font-face` or CDN import at the top of your global stylesheet.

## Type Scale & Responsive Sizes

Sizes vary across three breakpoints. Letter-spacing and line-height are constant at all sizes — because letter-spacing is expressed in `em` it scales automatically with font size.

| Role | Desktop ≥1200px | Tablet 640–1199px | Mobile <640px | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|---|
| Heading 1 | `60px` | `48px` | `36px` | `500` | `1.0` | `-0.01em` |
| Heading 2 | `44px` | `36px` | `28px` | `500` | `1.0` | `-0.02em` |
| Heading 3 | `32px` | `26px` | `22px` | `500` | `1.1` | `-0.01em` |
| Heading 4 | `22px` | `20px` | `18px` | `500` | `1.0` | `-0.01em` |
| Heading 5 | `20px` | `18px` | `16px` | `500` | `1.5` | `0` |
| Body | `18px` | `16px` | `16px` | `400` | `1.4` | `0` |
| Button Label | `16px` | `16px` | `14px` | `500` | `1.2` | `-0.01em` |
| Caption | `14px` | `14px` | `14px` | `400` | `16px` | `0` |
| Overline | `12px` | `12px` | `12px` | `500` | `1.0` | `+0.01em` |

> Caption line-height is a fixed `16px` (not a multiplier) as defined in Figma.

## Use Cases

| Role | When to use |
|---|---|
| **Heading 1** | The page hero title. **One per page.** Maximum visual impact — do not use anywhere else. |
| **Heading 2** | The primary heading that opens each major content section (e.g. "From conversations to real work"). One per section. |
| **Heading 3** | A supporting heading within a section — stat numbers in banners, card titles, tab panel headings. Use when a second heading level is needed inside a section. |
| **Heading 4** | Component-level headings inside cards, feature list group titles, or tightly scoped content blocks. |
| **Heading 5** | Small-scale emphasis labels, sidebar headings, grouped list headers. Use when a label needs visual weight but not full heading prominence. |
| **Body** | All descriptive paragraph text: section descriptions, feature explanations, tab content copy. |
| **Button Label** | All button text and navigation link labels. |
| **Caption** | Image captions, footnotes, fine print, timestamps, metadata labels. |
| **Overline** | Eyebrow labels placed above headings (e.g. "AUTO WRITING"). Always `text-transform: uppercase`. |

## CSS Implementation

```css
/* ── Heading 1 ── */
h1 {
  font-family: "General Sans", sans-serif;
  font-size: 60px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.01em;
}

/* ── Heading 2 ── */
h2 {
  font-family: "General Sans", sans-serif;
  font-size: 44px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.02em;
}

/* ── Heading 3 ── */
h3 {
  font-family: "General Sans", sans-serif;
  font-size: 32px;
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

/* ── Heading 4 ── */
h4 {
  font-family: "General Sans", sans-serif;
  font-size: 22px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.01em;
}

/* ── Heading 5 ── */
h5 {
  font-family: "General Sans", sans-serif;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0;
}

/* ── Body ── */
p {
  font-family: "General Sans", sans-serif;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: 0;
}

/* ── Button Label ── */
.type-button {
  font-family: "General Sans", sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

/* ── Caption ── */
.type-caption {
  font-family: "General Sans", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 16px;
  letter-spacing: 0;
}

/* ── Overline ── */
.type-overline {
  font-family: "General Sans", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.01em;
  text-transform: uppercase;
}

/* ── Responsive breakpoints ── */
@media (max-width: 1199px) {
  h1 { font-size: 48px; }
  h2 { font-size: 36px; }
  h3 { font-size: 26px; }
  h4 { font-size: 20px; }
  h5 { font-size: 18px; }
  p  { font-size: 16px; }
}

@media (max-width: 639px) {
  h1 { font-size: 36px; }
  h2 { font-size: 28px; }
  h3 { font-size: 22px; }
  h4 { font-size: 18px; }
  h5 { font-size: 16px; }
  p  { font-size: 16px; }
  .type-button { font-size: 14px; }
}
```

## Rules

- **Never** use font weights other than `400` (Regular) or `500` (Medium).
- Heading 1 and Heading 2 always have tight negative `letter-spacing`. Do not relax this.
- Body text always uses `line-height: 1.4`. Never tighten body copy below this.
- Overline is always `text-transform: uppercase`. Never use sentence or title case for overline.
- Caption `line-height` is a fixed `16px` value, not a multiplier — keep it as such.
- Do not introduce a new type ramp step outside these 9 roles without design approval. If an intermediate size is needed, default to the next smaller step.
