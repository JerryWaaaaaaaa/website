import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import s from './Nav.module.css';

type Panel = 'products' | 'features' | 'explore' | null;

const PRODUCT_CARDS = [
  {
    key: 'docs',
    name: 'AI Docs',
    desc: 'Automatically transforms your meetings into polished documents',
    icon: '/Icon/product-docs.svg',
    cls: s.productCardDocs,
  },
  {
    key: 'slides',
    name: 'AI Slides',
    desc: 'Meeting to deck, voice-ready presentation',
    icon: '/Icon/product-slides.svg',
    cls: s.productCardSlides,
  },
  {
    key: 'sheets',
    name: 'AI Sheets',
    desc: 'Meetings to data, automates workflows',
    icon: '/Icon/product-sheet.svg',
    cls: s.productCardSheets,
  },
  {
    key: 'datatable',
    name: 'AI Data table',
    desc: 'Organize, analyze, and act on your data with flexible views',
    icon: '/Icon/product-datatable.svg',
    cls: s.productCardDatatable,
  },
  {
    key: 'classicdocs',
    name: 'AI Classic Docs',
    desc: 'Precise formatting, Word compatibility, and real-time editing.',
    icon: '/Icon/product-classic-doc.svg',
    cls: s.productCardClassicdocs,
  },
  {
    key: 'hub',
    name: 'Hub',
    desc: 'Manage all your meetings and documents all in one place',
    icon: '/Icon/Hub.svg',
    cls: s.productCardHub,
  },
];

const FEATURE_PILLS = ['AI Auto Writing', 'AI Templates', 'Knowledge Base', 'Sites'];
const EXPLORE_PILLS = ['Use Cases', 'Templates', 'Help center'];

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
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!navRef.current) return;
      if (!navRef.current.contains(e.target as Node)) setOpenPanel(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenPanel(null);
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const toggle = (panel: Exclude<Panel, null>) =>
    setOpenPanel((p) => (p === panel ? null : panel));

  const wrapClass = [s.navWrap, scrolled ? s.isScrolled : ''].filter(Boolean).join(' ');
  const barClass = [
    s.navBar,
    openPanel === 'products' ? s.productsOpen : '',
    openPanel === 'features' ? s.featuresOpen : '',
    openPanel === 'explore' ? s.exploreOpen : '',
  ]
    .filter(Boolean)
    .join(' ');

  const triggerClass = (panel: Exclude<Panel, null>) =>
    [s.navTrigger, openPanel === panel ? s.isOpen : ''].filter(Boolean).join(' ');

  return (
    <header className={wrapClass} ref={navRef}>
      <nav className={barClass} role="navigation" aria-label="Main navigation">
        <div className={s.navRow}>
          <Link to="/" className={s.navLogo} aria-label="Zoom AI Create — home">
            <span className={s.navLogoZoom}>zoom</span>
            <span className={s.navLogoProduct}>AI Create</span>
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
            <li className={triggerClass('features')}>
              <button
                className={s.navLink}
                aria-expanded={openPanel === 'features'}
                aria-haspopup="true"
                aria-controls="menu-features"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle('features');
                }}
              >
                Features
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
            </li>
          </ul>

          <div className={s.navCta}>
            <button className="btn btn-secondary">Sign in</button>
            <button className="btn btn-primary">Get started now</button>
          </div>
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
                <a key={p.key} className={`${s.productCard} ${p.cls}`} href="#">
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

        <div
          className={s.featuresPanel}
          id="menu-features"
          role="region"
          aria-label="Features menu"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={s.featuresPanelInner}>
            <div className={s.pillContainer}>
              {FEATURE_PILLS.map((label) => (
                <a key={label} className={s.pillItem} href="#">
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div
          className={s.explorePanel}
          id="menu-explore"
          role="region"
          aria-label="Explore menu"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={s.explorePanelInner}>
            <div className={s.pillContainer}>
              {EXPLORE_PILLS.map((label) => (
                <a key={label} className={s.pillItem} href="#">
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
