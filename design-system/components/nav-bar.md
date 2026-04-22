# Navigation Bar

> **Tokens & rules summary:** see [`/DESIGN.md` — Navigation Bar](../../DESIGN.md#navigation-bar)

A fixed navigation bar at the top of every page. It exists in two states that transition based on scroll position: a full-width **default** state when the page is at the top, and a centered frosted-glass **pill** state once the user scrolls down.

---

## States

### Default (at top of page)

The nav sits at full viewport width with a near-transparent background. No pill shape, no border.

| Property | Value |
|---|---|
| Width | `100vw` (full viewport) |
| Background | `rgba(255, 255, 255, 0.01)` |
| Backdrop blur | none |
| Border | none |
| Border radius | none |
| Padding | `16px 24px` |

### Scrolled (pill)

Once `scrollY > 50px`, the nav collapses into a centered frosted-glass pill. Uses the [Frosted Glass Surface](../colors.md#frosted-glass-surface) tokens.

| Property | Value |
|---|---|
| Background | `var(--glass-bg)` — `rgba(252, 253, 255, 0.80)` |
| Backdrop blur | `blur(var(--glass-blur))` — `blur(16px)` |
| Border | `var(--glass-border)` — `1px solid var(--border-subtle)` |
| Border radius | `32px` |
| Max width | `1024px` |
| Width | `1024px` (centered) |
| Padding | `12px 18px 12px 24px` |
| Height | `78px` (outer container including `16px` top offset) |
| Position | `fixed`, `top: 16px`, horizontally centered |

### Transition

Animate between states on scroll. Transition the following properties at `250ms ease`:
`background`, `backdrop-filter`, `border-color`, `border-radius`, `max-width`, `padding`.

---

## Layout

**`[Logo] — [Nav links (centered)] — [Sign in + Get started now]`**

| Slot | Notes |
|---|---|
| Logo | `zoom / AI Create` wordmark, `95×36px` |
| Nav links | Flex row, centered, `gap: 20px` |
| CTA buttons | Secondary + Primary, `gap: 12px`, right-aligned |

### Nav link specs

| Property | Value |
|---|---|
| Font | Button Label role — see [DESIGN.md type scale](../../DESIGN.md#type-scale) |
| Color | `var(--text-primary)` |
| Chevron icon | `14×14px` inline after label |
| Cursor | `pointer` |

---

## CTA Buttons

Uses the standard [Button](./button.md) component.

| Button | Variant | Label |
|---|---|---|
| Left | Secondary | Sign in |
| Right | Primary | Get started now |

Gap between buttons: `12px`.

---

## Dropdown Panels

Each nav link opens a dropdown panel on click. The panel appears directly below the nav bar, flush with the nav's inner content edge.

### Panel shell (all dropdowns)

| Property | Value |
|---|---|
| Background | `var(--glass-bg)` |
| Backdrop blur | `blur(var(--glass-blur))` |
| Border | `var(--glass-border)` |
| Border radius | `16px` |
| Padding | `12px` |
| Max width | `1024px` (matches scrolled nav) |

### Products

A grid of 6 product cards, displayed as a single row on desktop.

**Cards:** AI Docs · AI Slides · AI Sheets · AI Data table · AI Classic Docs · Hub

Each card:

| Property | Value |
|---|---|
| Width | `~160px` (equal flex columns) |
| Height | `125px` |
| Image well | `64px` tall, light tinted background, icon centered |
| Label | `16px / 500`, centered below image well, `var(--text-primary)` |
| Border radius | `8px` |
| Hover | `background: var(--bg-accent-light)` |

### Features

A horizontal row of 4 text links.

**Items:** AI Auto Writing · AI Templates · Knowledge Base · Sites

Each item:

| Property | Value |
|---|---|
| Font | Button Label (`16px / 500`) |
| Color | `var(--text-primary)` |
| Padding | `16px 20px` |
| Hover | `color: var(--text-highlight)` |

### Explore

A horizontal row of 3 text links.

**Items:** Use Cases · Templates · Help center

Same specs as Features.

---

## HTML Pattern

```html
<!-- Outer wrapper handles the scroll-state class -->
<header class="nav-wrap">
  <nav class="nav-bar">
    <a class="nav-logo" href="/">
      <img src="..." alt="zoom AI Create" width="95" height="36" />
    </a>

    <ul class="nav-links">
      <li class="nav-trigger" data-menu="products">
        <button class="nav-link">Products <span class="nav-chevron"></span></button>
        <div class="nav-dropdown" id="menu-products">
          <!-- 6 product cards -->
        </div>
      </li>
      <li class="nav-trigger" data-menu="features">
        <button class="nav-link">Features <span class="nav-chevron"></span></button>
        <div class="nav-dropdown" id="menu-features">
          <!-- 4 feature links -->
        </div>
      </li>
      <li class="nav-trigger" data-menu="explore">
        <button class="nav-link">Explore <span class="nav-chevron"></span></button>
        <div class="nav-dropdown" id="menu-explore">
          <!-- 3 explore links -->
        </div>
      </li>
    </ul>

    <div class="nav-cta">
      <button class="btn btn-secondary">Sign in</button>
      <button class="btn btn-primary">Get started now</button>
    </div>
  </nav>
</header>
```

## CSS

```css
/* ── Wrapper ── */
.nav-wrap {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: center;
  padding-top: 16px;
  pointer-events: none;
}

/* ── Nav bar ── */
.nav-bar {
  pointer-events: auto;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 100vw;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.01);
  border-radius: 0;
  transition:
    background 250ms ease,
    backdrop-filter 250ms ease,
    border-color 250ms ease,
    border-radius 250ms ease,
    max-width 250ms ease,
    padding 250ms ease;
}

/* ── Scrolled pill state ── */
.nav-wrap.is-scrolled .nav-bar {
  max-width: 1024px;
  padding: 12px 18px 12px 24px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: var(--glass-border);
  border-radius: 32px;
}

/* ── Links ── */
.nav-links {
  display: flex;
  flex: 1;
  justify-content: center;
  gap: 20px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  /* Button Label role — DESIGN.md#type-scale */
  font-family: "General Sans", sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--text-primary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 0;
  white-space: nowrap;
}

.nav-chevron {
  display: inline-block;
  width: 14px;
  height: 14px;
}

/* ── CTA ── */
.nav-cta {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ── Dropdown panels ── */
.nav-dropdown {
  display: none;
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  max-width: 1024px;
  width: 1024px;
  padding: 12px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: var(--glass-border);
  border-radius: 16px;
  opacity: 0;
  translate: 0 -6px;
  transition: opacity 200ms ease, translate 200ms ease;
}

.nav-trigger.is-open .nav-dropdown {
  display: block;
  opacity: 1;
  translate: 0 0;
}

/* Products grid */
.nav-product-grid {
  display: flex;
  gap: 8px;
}

.nav-product-card {
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.nav-product-card:hover {
  background: var(--bg-accent-light);
}

.nav-product-icon {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-accent-light);
}

.nav-product-label {
  padding: 8px;
  /* Button Label role — DESIGN.md#type-scale */
  font-family: "General Sans", sans-serif;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--text-primary);
  text-align: center;
}

/* Features / Explore list */
.nav-link-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link-list a {
  display: block;
  padding: 16px 20px;
  /* Button Label role — DESIGN.md#type-scale */
  font-family: "General Sans", sans-serif;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--text-primary);
  text-decoration: none;
  white-space: nowrap;
}

.nav-link-list a:hover {
  color: var(--text-highlight);
}
```

## JavaScript

```js
// Scroll state
const navWrap = document.querySelector('.nav-wrap');
window.addEventListener('scroll', () => {
  navWrap.classList.toggle('is-scrolled', window.scrollY > 50);
}, { passive: true });

// Dropdowns — open on click, close on outside click or Escape
const triggers = document.querySelectorAll('.nav-trigger');
triggers.forEach(trigger => {
  trigger.querySelector('.nav-link').addEventListener('click', (e) => {
    const isOpen = trigger.classList.contains('is-open');
    triggers.forEach(t => t.classList.remove('is-open'));
    if (!isOpen) trigger.classList.add('is-open');
    e.stopPropagation();
  });
});

document.addEventListener('click', () => {
  triggers.forEach(t => t.classList.remove('is-open'));
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') triggers.forEach(t => t.classList.remove('is-open'));
});
```

---

## Rules

- The nav is always horizontally centered within the page.
- The pill state uses the Frosted Glass Surface tokens (`--glass-bg`, `--glass-blur`, `--glass-border`) exclusively — never hardcode these values.
- Do not switch to a solid background in either state.
- Do not add more than 3 top-level nav link groups.
- Dropdown panels open on click only — never on hover.
- Always pair the secondary ("Sign in") and primary ("Get started now") buttons. Never show one without the other.
