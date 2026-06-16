import { useState, type CSSProperties } from 'react';
import './ProductSuite.css';

type Competitor = { name: string; logo: string };

type Tab = {
  key: string;
  label: string;
  icon: string;
  monoIcon: string;
  glyph?: boolean;
  screen: string;
  color: string;
  tint: string;
  competitors: Competitor[];
};

// Mail & Calendar and Hub have no dedicated screenshot yet — reuse a hero
// screen as a stand-in placeholder.
const PLACEHOLDER_SCREEN = '/hero-browser/canvas-ui.png';

const TABS: Tab[] = [
  {
    key: 'mail',
    label: 'Mail & Calendar',
    icon: '/Icon/badge_product_mail+calendar.svg',
    monoIcon: '/Icon/badge_product_mail+calendar.svg',
    glyph: true,
    screen: PLACEHOLDER_SCREEN,
    color: '#0e72ed',
    tint: 'rgba(14, 114, 237, 0.12)',
    competitors: [],
  },
  {
    key: 'slides',
    label: 'Slides',
    icon: '/Icon/product-slides.svg',
    monoIcon: '/Icon/mono/slides.svg',
    screen: '/hero-browser/slides-UI.png',
    color: '#fb327e',
    tint: 'rgba(254, 193, 216, 0.2)',
    competitors: [
      { name: 'Google Slides', logo: '/competitor-logos/google-slides.svg' },
      { name: 'Microsoft PowerPoint', logo: '/competitor-logos/powerpoint.svg' },
    ],
  },
  {
    key: 'sheets',
    label: 'Sheets',
    icon: '/Icon/product-sheet.svg',
    monoIcon: '/Icon/mono/sheets.svg',
    screen: '/hero-browser/sheets-ui.png',
    color: '#019f5c',
    tint: 'rgba(1, 159, 92, 0.12)',
    competitors: [
      { name: 'Google Sheets', logo: '/competitor-logos/google-sheets.svg' },
      { name: 'Microsoft Excel', logo: '/competitor-logos/excel.svg' },
    ],
  },
  {
    key: 'datatable',
    label: 'Data table',
    icon: '/Icon/product-datatable.svg',
    monoIcon: '/Icon/mono/datatable.svg',
    screen: '/hero-browser/datatable-ui.png',
    color: '#019f5c',
    tint: 'rgba(1, 159, 92, 0.12)',
    competitors: [],
  },
  {
    key: 'canvas',
    label: 'Canvas',
    icon: '/Icon/product-docs.svg',
    monoIcon: '/Icon/mono/canvas.svg',
    screen: '/hero-browser/canvas-ui.png',
    color: '#3579fd',
    tint: 'rgba(53, 121, 253, 0.12)',
    competitors: [
      { name: 'Google Docs', logo: '/competitor-logos/google-docs.svg' },
      { name: 'Notion', logo: '/competitor-logos/notion.png' },
    ],
  },
  {
    key: 'hub',
    label: 'Hub',
    icon: '/Icon/Hub.svg',
    monoIcon: '/Icon/mono/hub.svg',
    screen: PLACEHOLDER_SCREEN,
    color: '#2a2b2d',
    tint: 'rgba(42, 43, 45, 0.1)',
    competitors: [],
  },
];

export function ProductSuite() {
  const [active, setActive] = useState('slides');

  return (
    <section className="psuite">
      <h2 className="psuite-heading">
        The only productivity tool for every task you need
      </h2>

      <div className="psuite-body">
        <div className="psuite-tabs" role="tablist" aria-label="Zoom productivity suite">
          {TABS.map((tab) => {
            const isActive = tab.key === active;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(tab.key)}
                className="psuite-tab"
                style={
                  { '--tab-color': tab.color, '--tab-tint': tab.tint } as CSSProperties
                }
              >
                {tab.competitors.length > 0 && (
                  <span className="psuite-replacing">
                    <span className="psuite-replacing-label">replacing</span>
                    <span className="psuite-replacing-logos">
                      {tab.competitors.map((c, i) => (
                        <span
                          key={c.name}
                          className="psuite-logo-wrap"
                          style={
                            {
                              '--logo-rotate':
                                i % 2 === 0 ? '17.96deg' : '-15.14deg',
                            } as CSSProperties
                          }
                        >
                          <img src={c.logo} alt={c.name} className="psuite-logo" />
                        </span>
                      ))}
                    </span>
                  </span>
                )}

                {isActive && !tab.glyph ? (
                  <img
                    src={tab.icon}
                    alt=""
                    className="psuite-tab-icon"
                    width={32}
                    height={32}
                  />
                ) : (
                  <span
                    className="psuite-tab-icon psuite-tab-icon--mono"
                    style={{ '--icon': `url(${tab.monoIcon})` } as CSSProperties}
                    aria-hidden="true"
                  />
                )}
                <span className="psuite-tab-label">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="psuite-screen">
          {TABS.map((tab) => (
            <img
              key={tab.key}
              src={tab.screen}
              alt={`${tab.label} preview`}
              className="psuite-screen-img"
              style={{ opacity: tab.key === active ? 1 : 0 }}
              aria-hidden={tab.key !== active}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
