# Color Tokens

The color system is split into two tiers that match the Figma variable collections. Always reference semantic tokens in component styles — never raw hex values or primitive variables directly.

## Tier 1 — Primitive Tokens

Raw values. These are the single source of truth for every color in the system. Reference them only inside the semantic tier below.

```css
:root {
  --color-white:        #FFFFFF;
  --color-shade-light:  #F3F8FF;
  --color-shade-medium: #E3EDFC;
  --color-shade-dark:   #D2DEF2;
  --color-blue:         #0C5CFF;
  --color-pink:         #E0D5FF;
  --color-black:        #000000;
  --color-gray:         #4C4C4C;
  --color-gray-light:   #999999;
}
```

## Tier 2 — Semantic Tokens

Named roles that alias into the primitive tier. All component rules must use these names.

```css
:root {
  /* Backgrounds */
  --bg-neutral:        var(--color-white);         /* Default page background */
  --bg-accent-light:   var(--color-shade-light);   /* Chips, secondary buttons, light section bg */
  --bg-accent-medium:  var(--color-shade-medium);  /* Medium-tint surfaces, hover states */
  --bg-accent-dark:    var(--color-shade-dark);    /* Darker tint surfaces, pressed states */
  --bg-highlight-blue: var(--color-blue);          /* Blue CTA sections, dark card halves */
  --bg-highlight-pink: var(--color-pink);          /* Pink accent sections */
  --bg-contrast:       var(--color-black);         /* Primary button fill, high-contrast surfaces */

  /* Text */
  --text-primary:             var(--color-black);       /* Default body and heading text */
  --text-secondary:           var(--color-gray);        /* Subheadings, descriptions, muted text */
  --text-highlight:           var(--color-blue);        /* Chip labels, accent text, inline links */
  --text-contrast:            var(--color-white);       /* Text on dark or filled surfaces */
  --text-contrast-secondary:  var(--color-gray-light);  /* Muted text on dark or filled surfaces */

  /* Gradients */
  --gradient-accent: radial-gradient(
    ellipse at center,
    #F8F2FF  7%,
    #E9F5FF 69%,
    #BFD1FB 93%,
    #98B6F5 100%
  );                                                    /* Light purple-blue radial — feature section backgrounds */

  /* Stroke */
  --stroke:            var(--color-shade-medium);  /* Borders, dividers, card outlines */
}
```

> **Legacy tokens** — the following values appear in component code but are not yet in the Figma variable collections. Do not add new usages; migrate to the semantic tokens above when refactoring.
>
> ```css
> --color-grey-dark: #222124;              /* Near-black text, footer */
> --color-icon:      #41464b;              /* Icon default fill */
> --border-subtle:   rgba(117, 115, 114, 0.15);  /* Nav pill, frosted borders */
> --border-white:    rgba(255, 255, 255, 0.40);  /* Frosted-glass inner borders */
> ```

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

---

## Appendix: Token Quick-Copy

Paste this block into your global `:root` stylesheet as the single source of truth:

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

  /* --- Legacy (do not add new usages) --- */
  --color-grey-dark:   #222124;
  --color-icon:        #41464b;
  --border-subtle:     rgba(117, 115, 114, 0.15);
  --border-white:      rgba(255, 255, 255, 0.40);

  /* --- Frosted Glass Surface --- */
  --glass-bg:     rgba(252, 253, 255, 0.80);
  --glass-blur:   16px;
  --glass-border: 1px solid var(--border-subtle);
}
```
