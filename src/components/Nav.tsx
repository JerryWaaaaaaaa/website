import { useEffect, useRef, useState, type CSSProperties } from 'react';
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
const EXPLORE_ITEMS: { label: string; to?: string; href?: string }[] = [
  { label: 'Use cases', href: '#' },
  { label: 'Blog', to: '/blog' },
  { label: 'Help center', href: '#' },
];

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

export function Nav() {
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  const wrapClass = [s.navWrap, scrolled ? s.isScrolled : ''].filter(Boolean).join(' ');
  const barClass = [
    s.navBar,
    // Only Products expands the bar itself; Explore is a floating dropdown that
    // doesn't reshape the bar. On mobile the drawer owns the accordion.
    !isMobile && openPanel === 'products' ? s.productsOpen : '',
  ]
    .filter(Boolean)
    .join(' ');

  const triggerClass = (panel: Exclude<Panel, null>) =>
    [s.navTrigger, openPanel === panel ? s.isOpen : ''].filter(Boolean).join(' ');

  return (
    <header className={wrapClass} ref={navRef} data-nav-variant={navVariant}>
      <nav className={barClass} role="navigation" aria-label="Main navigation">
        <div className={s.navRow}>
          <Link to="/" className={s.navLogo} aria-label="Zoom AI Create — home">
            <img src="/zm-prod-suite-stacked-color01.svg" alt="Zoom AI Create" height={36} />
          </Link>

          <ul className={s.navLinks} role="list">
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
            <li className={triggerClass('explore')}>
              <button
                className={s.navLink}
                aria-expanded={openPanel === 'explore'}
                aria-haspopup="true"
                aria-controls="menu-explore"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle('explore');
                }}
              >
                Explore
                <Chevron />
              </button>
              <div
                className={s.exploreMenu}
                id="menu-explore"
                role="menu"
                aria-label="Explore menu"
                onClick={(e) => e.stopPropagation()}
              >
                {EXPLORE_ITEMS.map((item) =>
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
                    <a
                      key={item.label}
                      href={item.href}
                      className={s.exploreMenuItem}
                      role="menuitem"
                    >
                      {item.label}
                    </a>
                  )
                )}
              </div>
            </li>
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
          </ul>

          <div className={s.navCta}>
            <button className="btn btn-secondary">Sign in</button>
            <button className="btn btn-primary">Get started today</button>
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
              aria-label="Zoom AI Create — home"
              onClick={() => setDrawerOpen(false)}
            >
              <img src="/zm-prod-suite-stacked-color01.svg" alt="Zoom AI Create" height={32} />
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

            {/* Explore */}
            <div
              className={[s.mDrawerSection, openPanel === 'explore' ? s.isExpanded : '']
                .filter(Boolean)
                .join(' ')}
            >
              <button
                className={s.mDrawerTrigger}
                aria-expanded={openPanel === 'explore'}
                onClick={() => toggle('explore')}
              >
                Explore
                <Chevron />
              </button>
              <div className={s.mDrawerBody}>
                <div className={s.mDrawerBodyInner}>
                  <div className={s.mDrawerLinks}>
                    {EXPLORE_ITEMS.map((item) =>
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
          </div>

          <div className={s.mobilePanelCta}>
            <button className="btn btn-secondary">Sign in</button>
            <button className="btn btn-primary">Get started today</button>
          </div>
        </div>
      </div>
    </header>
  );
}
