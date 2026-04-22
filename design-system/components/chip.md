# Chip / Label Tag

> **Tokens & rules summary:** see [`/DESIGN.md` — Chip](../../DESIGN.md#chip--label-tag)

**Anatomy:** single line of uppercase text inside a pill container.

## Specs

| Property | Value |
|---|---|
| Background | `var(--bg-accent-light)` — `#F3F8FF` |
| Text color | `var(--text-highlight)` — `#0C5CFF` |
| Font | Overline role — see [DESIGN.md type scale](../../DESIGN.md#type-scale) |
| Padding | `6px 12px` |
| Border radius | `999px` |
| Height | `24px` |

## HTML Pattern

```html
<span class="chip">auto writing</span>
```

## CSS

```css
.chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: var(--bg-accent-light);
  color: var(--text-highlight);
  /* Overline role — DESIGN.md#type-scale */
  font-family: "General Sans", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  border-radius: 999px;
  white-space: nowrap;
}
```

## Rules

- Always place the chip directly above the section heading with a `20px` gap below it.
- Text is always a short 1–3 word category label (e.g. "Auto Writing", "Use Cases"). Never a sentence.
- Never add an icon or close button to this chip variant.
