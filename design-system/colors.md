# Color Tokens — Implementation Reference

> **Token definitions (primitive + semantic):** see [`/DESIGN.md` — Color Palette](../DESIGN.md#color-palette)
>
> **Token Quick-Copy `:root` block:** see [`/DESIGN.md` — Token Quick-Copy](../DESIGN.md#token-quick-copy)

The color system is split into two tiers that match the Figma variable collections. Always reference semantic tokens in component styles — never raw hex values or primitive variables directly.

---

## Legacy Tokens

The following values appear in component code but are not yet in the Figma variable collections. Do not add new usages; migrate to the semantic tokens in `/DESIGN.md` when refactoring.

```css
--color-grey-dark: #222124;              /* Near-black text, footer */
--color-icon:      #41464b;              /* Icon default fill */
--border-subtle:   rgba(117, 115, 114, 0.15);  /* Nav pill, frosted borders */
--border-white:    rgba(255, 255, 255, 0.40);  /* Frosted-glass inner borders */
```

---

## Frosted Glass Surface

A named surface treatment for floating UI elements that sit over page content — the scrolled nav pill, dropdown panels, and any future overlays.

```css
:root {
  --glass-bg:     rgba(252, 253, 255, 0.80);  /* #FCFDFF at 80% opacity */
  --glass-blur:   16px;
  --glass-border: 1px solid var(--border-subtle);
}
```

Apply as a group — never use these properties individually or mix with a solid background:

```css
.surface-glass {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: var(--glass-border);
}
```

### Rules

- Use this surface for any floating UI that overlays page content (nav pill, dropdowns, modals, tooltips).
- Never substitute a solid background — the blur effect requires partial transparency to read correctly.
- Always pair with `-webkit-backdrop-filter` for Safari support.

## Quick Reference

| Token | Resolves to | Usage |
|---|---|---|
| `--bg-neutral` | `#FFFFFF` | Page background |
| `--bg-accent-light` | `#F3F8FF` | Chips, secondary buttons, light bg sections |
| `--bg-accent-medium` | `#E3EDFC` | Medium-tint surfaces |
| `--bg-accent-dark` | `#D2DEF2` | Darker tint surfaces |
| `--bg-highlight-blue` | `#0C5CFF` | Brand blue CTA sections, dark cards |
| `--bg-highlight-pink` | `#E0D5FF` | Pink accent sections |
| `--bg-contrast` | `#000000` | Primary button fill |
| `--text-primary` | `#000000` | All headings, default body text |
| `--text-secondary` | `#4C4C4C` | Section descriptions, muted copy |
| `--text-highlight` | `#0C5CFF` | Chip labels, accent text |
| `--text-contrast` | `#FFFFFF` | Text on dark surfaces |
| `--text-contrast-secondary` | `#999999` | Muted text on dark surfaces |
| `--stroke` | `#E3EDFC` | Borders, dividers |
| `--gradient-accent` | `#F8F2FF → #98B6F5` | Radial gradient — feature section backgrounds |
