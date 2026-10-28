import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDialKit } from 'dialkit';
import { useDialUrlSync } from './dialUrlSync';
import s from './Nav.module.css';

type Panel = 'products' | 'explore' | null;

// Each card carries its own brand color as an "R, G, B" triplet, exposed as the
// --card-rgb CSS var on the card. The navbar style variants below apply their own
// alpha to it per state (subtle at rest, stronger on hover) so the hover change
// reads clearly even for the blue-family cards. Mirrors the --shadow-color pattern.
const PRODUCT_CARDS = [
  {
    key: 'slides',
    name: 'Slides',
    desc: 'Ideas to presentations',
    icon: '/Icon/product-icons/slides-fill.svg',
    tint: '240, 68, 56',
  },
  {
    key: 'sheets',
    name: 'Sheets',
    desc: 'Spreadsheets, automated',
    icon: '/Icon/product-icons/sheets-fill.svg',
    tint: '35, 165, 45',
  },
  {
    key: 'paper',
    name: 'Paper',
    desc: 'Professional writing, refined',
    icon: '/Icon/product-icons/paper-fill.svg',
    tint: '32, 87, 177',
  },
  {
    key: 'canvas',
    name: 'Canvas',
    desc: 'Think. Write. Refine.',
    icon: '/Icon/product-icons/canvas-fill.svg',
    tint: '14, 114, 237',
  },
  {
    key: 'datatable',
    name: 'Data tables',
    desc: 'From data to insight',
    icon: '/Icon/product-icons/datatable-fill.svg',
    tint: '36, 127, 64',
  },
  {
    key: 'hub',
    name: 'Hub',
    desc: 'The drive for your Zoom assets',
    icon: '/Icon/Hub.svg',
    tint: '13, 107, 222',
  },
];

// V6 Products menu (Figma 698:17483): white glyphs on a dark-glass list, in the
// design's order and copy. V1–V5 keep PRODUCT_CARDS above.
const V6_PRODUCT_CARDS = [
  { key: 'canvas', name: 'Canvas', desc: 'Think. Write. Refine.', icon: '/v6/nav/products/canvas.svg' },
  { key: 'slides', name: 'Slides', desc: 'Ideas to presentations', icon: '/v6/nav/products/slides.svg' },
  { key: 'sheets', name: 'Sheets', desc: 'Spreadsheets, automated', icon: '/v6/nav/products/sheets.svg' },
  { key: 'datatable', name: 'AI Data table', desc: 'From data to insight', icon: '/v6/nav/products/datatable.svg' },
  { key: 'paper', name: 'Paper', desc: 'Professional writing, refined', icon: '/v6/nav/products/paper.svg' },
  { key: 'hub', name: 'Hub', desc: 'Home of your Zoom assets', icon: '/v6/nav/products/hub.svg' },
];

// Navbar product-card background styles, switchable live from the dial "Navbar"
// panel. Drives the `data-nav-variant` attribute on <header>; see Nav.module.css.
//  - accent:  each card shows its brand tint (the original look)
//  - neutral: neutral-gray card + white chip; brand tint on hover
//  - ghost:   transparent card; brand tint only on hover
const NAV_VARIANTS = [
  { id: 'accent', label: 'Accent' },
  { id: 'neutral', label: 'Neutral' },
  { id: 'ghost', label: 'Ghost' },
];
const DEFAULT_NAV_VARIANT = 'neutral';

// Explore dropdown links. `to` routes with the SPA router (Blog → the blog index
// we already ship); `href` is a placeholder for destinations not yet wired, matching
// the rest of the nav's `#` links.
type MenuItem = { label: string; to?: string; href?: string };

const EXPLORE_ITEMS: MenuItem[] = [
  { label: 'Use cases', href: '#' },
  { label: 'Blog', to: '/blog' },
  { label: 'Help center', href: '#' },
];

// V6 only (Figma 696:16874) — Products is the one dropdown; Blog and Templates
// are plain links. There's no Templates page yet, so it jumps to the V6
// Templates section on the home page.
// Templates is a native anchor so the browser scrolls to the hash.
const V6_LINKS: MenuItem[] = [
  { label: 'Blog', to: '/blog' },
  { label: 'Templates', href: '/#templates' },
];

/** `default` is the V1–V5 bar; `v6` is the Microsite Stylized restyle. */
export type NavVariant = 'default' | 'v6';

function Chevron() {
  return (
    <svg className={s.navChevron} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3 5L7 9L11 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Nav({ variant = 'default' }: { variant?: NavVariant } = {}) {
  const isV6 = variant === 'v6';
  const [scrolled, setScrolled] = useState(false);
  const [openPanel, setOpenPanel] = useState<Panel>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Navbar style variant, registered as its own dialkit "Navbar" panel (Nav is
  // global chrome outside <V5VariantProvider>, so it can't use the section-variant
  // context — but it is inside the router, so useSearchParams + a self-registered
  // panel work). Seeded from ?nav on mount to avoid a flash, then mirrored back.
  const [params] = useSearchParams();
  const initialParams = useRef(params).current;
  const fromUrl = initialParams.get('nav');
  const seededVariant = NAV_VARIANTS.some((v) => v.id === fromUrl)
    ? (fromUrl as string)
    : DEFAULT_NAV_VARIANT;
  const { variant: navVariant } = useDialKit('Navbar', {
    variant: {
      type: 'select',
      options: NAV_VARIANTS.map((v) => ({ value: v.id, label: v.label })),
      default: seededVariant,
    },
  }) as { variant: string };
  useDialUrlSync({
    keys: ['nav'],
    target: navVariant !== DEFAULT_NAV_VARIANT ? { nav: navVariant } : {},
    immediate: true,
  });

  // v6 always shows the scrolled (glass bar) state, so it needs no listener.
  useEffect(() => {
    if (isV6) return;
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isV6]);

  // Track the mobile breakpoint (matches the CSS hamburger switch at 900px).
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Growing past mobile: close the drawer and reset the accordion.
  useEffect(() => {
    if (!isMobile) {
      setDrawerOpen(false);
      setOpenPanel(null);
    }
  }, [isMobile]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!navRef.current) return;
      if (!navRef.current.contains(e.target as Node)) setOpenPanel(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenPanel(null);
        setDrawerOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Lock body scroll while the drawer is open; restore on close/unmount.
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  // Focus the close button on open, trap Tab within the dialog, and return
  // focus to the hamburger on close.
  useEffect(() => {
    if (!drawerOpen) return;
    const drawer = drawerRef.current;
    if (!drawer) return;
    closeBtnRef.current?.focus();
    const onTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusables = drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    drawer.addEventListener('keydown', onTrap);
    return () => {
      drawer.removeEventListener('keydown', onTrap);
      hamburgerRef.current?.focus();
    };
  }, [drawerOpen]);

  const toggle = (panel: Exclude<Panel, null>) =>
    setOpenPanel((p) => (p === panel ? null : panel));

  const wrapClass = [s.navWrap, isV6 || scrolled ? s.isScrolled : ''].filter(Boolean).join(' ');
  const barClass = [
    s.navBar,
    // Only Products expands the bar itself; Explore is a floating dropdown that
    // doesn't reshape the bar. On mobile the drawer owns the accordion. V6 renders
    // Products as a floating dropdown too, so the bar never expands there.
    !isV6 && !isMobile && openPanel === 'products' ? s.productsOpen : '',
  ]
    .filter(Boolean)
    .join(' ');

  const triggerClass = (panel: Exclude<Panel, null>) =>
    [s.navTrigger, openPanel === panel ? s.isOpen : ''].filter(Boolean).join(' ');

  const ctaLabel = isV6 ? 'Get started now' : 'Get started today';

  // A trigger with a floating dropdown card anchored beneath it.
  const renderFloating = (
    panel: Exclude<Panel, null>,
    label: string,
    menuClass: string,
    children: ReactNode
  ) => (
    <li className={triggerClass(panel)}>
      <button
        className={s.navLink}
        aria-expanded={openPanel === panel}
        aria-haspopup="true"
        aria-controls={`menu-${panel}`}
        onClick={(e) => {
          e.stopPropagation();
          toggle(panel);
        }}
      >
        {label}
        <Chevron />
      </button>
      <div
        className={menuClass}
        id={`menu-${panel}`}
        role="menu"
        aria-label={`${label} menu`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </li>
  );

  const renderDropdown = (panel: 'explore', label: string, items: MenuItem[]) =>
    renderFloating(
      panel,
      label,
      s.exploreMenu,
      items.map((item) =>
        item.to ? (
          <Link
            key={item.label}
            to={item.to}
            className={s.exploreMenuItem}
            role="menuitem"
            onClick={() => setOpenPanel(null)}
          >
            {item.label}
          </Link>
        ) : (
          <a key={item.label} href={item.href} className={s.exploreMenuItem} role="menuitem">
            {item.label}
          </a>
        )
      )
    );

  // V6 Products: the same floating dropdown, listing product cards.
  const renderV6Products = () =>
    renderFloating(
      'products',
      'Products',
      [s.exploreMenu, s.productsMenu].join(' '),
      V6_PRODUCT_CARDS.map((p) => (
        <a key={p.key} className={s.productCard} href="#" role="menuitem">
          <div className={s.productIcon}>
            <img src={p.icon} width={32} height={32} alt="" />
          </div>
          <div className={s.productText}>
            <span className={s.productName}>{p.name}</span>
            <span className={s.productDesc}>{p.desc}</span>
          </div>
        </a>
      ))
    );

  const renderDrawerMenu = (panel: 'explore', label: string, items: MenuItem[]) => (
    <div
      className={[s.mDrawerSection, openPanel === panel ? s.isExpanded : '']
        .filter(Boolean)
        .join(' ')}
    >
      <button
        className={s.mDrawerTrigger}
        aria-expanded={openPanel === panel}
        onClick={() => toggle(panel)}
      >
        {label}
        <Chevron />
      </button>
      <div className={s.mDrawerBody}>
        <div className={s.mDrawerBodyInner}>
          <div className={s.mDrawerLinks}>
            {items.map((item) =>
              item.to ? (
                <Link
                  key={item.label}
                  to={item.to}
                  className={s.mDrawerLink}
                  onClick={() => setDrawerOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <a key={item.label} className={s.mDrawerLink} href={item.href}>
                  {item.label}
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <header
      className={wrapClass}
      ref={navRef}
      data-nav-variant={navVariant}
      data-version={isV6 ? 'v6' : undefined}
    >
      <nav className={barClass} role="navigation" aria-label="Main navigation">
        <div className={s.navRow}>
          <Link to="/" className={s.navLogo} aria-label="Zoom AI Productivity Suite — home">
            {isV6 ? (
              // V6: white horizontal lockup (Figma 662:29184).
              <img src="/v6/nav/aips-logo-white.svg" alt="Zoom AI Productivity Suite" width={180} height={32} />
            ) : (
              <img src="/zm-prod-suite-stacked-color01.svg" alt="Zoom AI Productivity Suite" height={36} />
            )}
          </Link>

          <ul className={s.navLinks} role="list">
            {isV6 ? (
              renderV6Products()
            ) : (
              <li className={triggerClass('products')}>
                <button
                  className={s.navLink}
                  aria-expanded={openPanel === 'products'}
                  aria-haspopup="true"
                  aria-controls="menu-products"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle('products');
                  }}
                >
                  Products
                  <Chevron />
                </button>
              </li>
            )}
            {isV6 &&
              V6_LINKS.map((l) => (
                <li key={l.label} className={s.navTrigger}>
                  {l.to ? (
                    <Link className={s.navLink} to={l.to}>
                      {l.label}
                    </Link>
                  ) : (
                    <a className={s.navLink} href={l.href}>
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            {!isV6 && renderDropdown('explore', 'Explore', EXPLORE_ITEMS)}
            {!isV6 && (
              <>
                <li className={s.navTrigger}>
                  <a className={s.navLink} href="#">
                    Templates
                  </a>
                </li>
                <li className={s.navTrigger}>
                  <Link className={s.navLink} to="/blog">
                    Blog
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className={s.navCta}>
            <button className="btn btn-secondary">Sign in</button>
            <button className="btn btn-primary">{ctaLabel}</button>
          </div>

          <button
            ref={hamburgerRef}
            className={[s.navHamburger, drawerOpen ? s.isOpen : ''].filter(Boolean).join(' ')}
            aria-label="Menu"
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            onClick={(e) => {
              e.stopPropagation();
              setDrawerOpen((o) => !o);
            }}
          >
            <span className={s.navHamburgerBox} aria-hidden="true">
              <span className={s.navHamburgerLine} />
              <span className={s.navHamburgerLine} />
              <span className={s.navHamburgerLine} />
            </span>
          </button>
        </div>

        {!isV6 && (
          <div
            className={s.productsPanel}
            id="menu-products"
            role="region"
            aria-label="Products menu"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={s.productsPanelInner}>
              <div className={s.productGrid}>
                {PRODUCT_CARDS.map((p) => (
                  <a
                    key={p.key}
                    className={s.productCard}
                    href="#"
                    style={{ '--card-rgb': p.tint } as CSSProperties}
                  >
                    <div className={s.productIcon}>
                      <img src={p.icon} width={32} height={32} alt="" />
                    </div>
                    <div className={s.productText}>
                      <span className={s.productName}>{p.name}</span>
                      <span className={s.productDesc}>{p.desc}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

      </nav>

      {/* Mobile drawer — sibling of <nav> so the scrolled-pill overflow/clip
          never touches it. Owns its own accordion (reusing openPanel). */}
      <div
        className={[s.mobileDrawer, drawerOpen ? s.isOpen : ''].filter(Boolean).join(' ')}
      >
        <div className={s.mobileScrim} onClick={() => setDrawerOpen(false)} />
        <div
          className={s.mobilePanel}
          id="mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          ref={drawerRef}
        >
          <div className={s.mobilePanelHead}>
            <Link
              to="/"
              className={s.navLogo}
              aria-label="Zoom AI Productivity Suite — home"
              onClick={() => setDrawerOpen(false)}
            >
              <img src="/zm-prod-suite-stacked-color01.svg" alt="Zoom AI Productivity Suite" height={32} />
            </Link>
            <button
              ref={closeBtnRef}
              className={s.mobileClose}
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                <path
                  d="M6 6L18 18M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className={s.mobilePanelBody}>
            {/* Products */}
            <div
              className={[s.mDrawerSection, openPanel === 'products' ? s.isExpanded : '']
                .filter(Boolean)
                .join(' ')}
            >
              <button
                className={s.mDrawerTrigger}
                aria-expanded={openPanel === 'products'}
                onClick={() => toggle('products')}
              >
                Products
                <Chevron />
              </button>
              <div className={s.mDrawerBody}>
                <div className={s.mDrawerBodyInner}>
                  <div className={s.mDrawerProducts}>
                    {PRODUCT_CARDS.map((p) => (
                      <a
                        key={p.key}
                        className={s.productCard}
                        href="#"
                        style={{ '--card-rgb': p.tint } as CSSProperties}
                      >
                        <div className={s.productIcon}>
                          <img src={p.icon} width={32} height={32} alt="" />
                        </div>
                        <div className={s.productText}>
                          <span className={s.productName}>{p.name}</span>
                          <span className={s.productDesc}>{p.desc}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {isV6 &&
              V6_LINKS.map((l) => (
                <div key={l.label} className={s.mDrawerSection}>
                  {l.to ? (
                    <Link
                      className={s.mDrawerTrigger}
                      to={l.to}
                      onClick={() => setDrawerOpen(false)}
                    >
                      {l.label}
                    </Link>
                  ) : (
                    <a
                      className={s.mDrawerTrigger}
                      href={l.href}
                      onClick={() => setDrawerOpen(false)}
                    >
                      {l.label}
                    </a>
                  )}
                </div>
              ))}
            {!isV6 && renderDrawerMenu('explore', 'Explore', EXPLORE_ITEMS)}

            {!isV6 && (
              <>
                {/* Templates — direct link */}
                <div className={s.mDrawerSection}>
                  <a className={s.mDrawerTrigger} href="#" onClick={() => setDrawerOpen(false)}>
                    Templates
                  </a>
                </div>

                {/* Blog — direct link to the blog index */}
                <div className={s.mDrawerSection}>
                  <Link
                    className={s.mDrawerTrigger}
                    to="/blog"
                    onClick={() => setDrawerOpen(false)}
                  >
                    Blog
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className={s.mobilePanelCta}>
            <button className="btn btn-secondary">Sign in</button>
            <button className="btn btn-primary">{ctaLabel}</button>
          </div>
        </div>
      </div>
    </header>
  );
}
