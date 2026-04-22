# Button

> **Tokens & rules summary:** see [`/DESIGN.md` — Button](../../DESIGN.md#button)

A pill-shaped action trigger used for CTAs and navigation actions. Available in two variants.

## Variants

| Variant | Purpose | Example labels |
|---|---|---|
| **Primary** | Main CTA — the single most important action in a section | "Get started for free", "Try now" |
| **Secondary** | Supporting action paired with a primary button | "Sign in", "Learn more" |

## Shared Specs

These properties are the same across all variants.

| Property | Value |
|---|---|
| Font | Button Label role — see [DESIGN.md type scale](../../DESIGN.md#type-scale) |
| Height | `46px` |
| Padding | `0 20px` |
| Border radius | `999px` |
| Border | `none` |

## Per-Variant Specs

| Property | Primary | Secondary |
|---|---|---|
| Background | `var(--bg-contrast)` — `#000000` | `var(--bg-accent-light)` — `#F3F8FF` |
| Text color | `var(--text-contrast)` — `#FFFFFF` | `var(--text-secondary)` — `#4C4C4C` |
| Hover | `opacity: 0.85` | `background: var(--bg-accent-medium)` |

## HTML Pattern

```html
<button class="btn btn-primary">Get started for free</button>
<button class="btn btn-secondary">Sign in</button>
```

## CSS

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 46px;
  padding: 0 20px;
  /* Button Label role — DESIGN.md#type-scale */
  font-family: "General Sans", sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.01em;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.btn-primary {
  background: var(--bg-contrast);
  color: var(--text-contrast);
}

.btn-primary:hover {
  opacity: 0.85;
}

.btn-secondary {
  background: var(--bg-accent-light);
  color: var(--text-secondary);
}

.btn-secondary:hover {
  background: var(--bg-accent-medium);
}
```

## Rules

- There is only one primary button per visible viewport section. Do not stack two primary buttons next to each other.
- Button text should be short and action-oriented (4–6 words max).
- Never change the primary background to a color other than black or a direct brand equivalent.
- Always pair a secondary button with a primary button. Never use a secondary button alone as the only CTA.
- The gap between a secondary and primary button is always `12px`.
