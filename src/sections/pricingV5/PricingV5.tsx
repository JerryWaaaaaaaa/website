import { useState } from 'react';
import { Button } from '../../components/Button';
import './PricingV5.css';

type Billing = 'monthly' | 'annual';

type Plan = {
  key: string;
  name: string;
  /** Monthly price label, e.g. '$15.99'. Free plans use 'Free'. */
  priceMonthly: string;
  /** Effective per-month price when billed annually, e.g. '$12.49'. */
  priceAnnual: string;
  /** Suffix shown after a numeric price, e.g. '/user/month'. */
  priceSuffix?: string;
  blurb: string;
  /** AI credits line, shown above the feature list when present. */
  aiCredits?: string;
  ctaLabel: string;
  ctaVariant: 'primary' | 'secondary';
  highlighted?: boolean;
  /** Intro line above the feature list, e.g. 'Everything in Basic, plus:'. */
  featuresIntro?: string;
  features: Array<string | { label: string; icon: string }>;
};

// Placeholder prices — swap for real figures when available.
const PLANS: Plan[] = [
  {
    key: 'basic',
    name: 'AI Productivity Suite Basic',
    priceMonthly: 'Free',
    priceAnnual: 'Free',
    blurb: 'Limited AI Productivity Suite features included with Workplace Basic.',
    aiCredits: 'No AI credits',
    ctaLabel: 'Sign up',
    ctaVariant: 'secondary',
    featuresIntro: 'Includes:',
    features: [
      'Unlimited manual creation for Slides, Sheets, and Paper',
      '3 AI document creations monthly for Canvas',
      '7-day version history',
      '10 MB attachment limit',
      'Limited template library',
      'No AI capabilities for Slides, Sheets, Paper',
    ],
  },
  {
    key: 'standard',
    name: 'AI Productivity Suite',
    priceMonthly: '$10',
    priceAnnual: '$8.33',
    priceSuffix: '/user/month',
    blurb: 'All AI Productivity Suite features added to Workplace Basic.',
    aiCredits: '1,000 AI credits monthly',
    ctaLabel: 'Buy now',
    ctaVariant: 'secondary',
    featuresIntro: 'Everything in Basic, plus:',
    features: [
      { label: 'Instant deck creation', icon: '/Icon/product-slides.svg' },
      { label: 'AI voice presentation mode', icon: '/Icon/product-slides.svg' },
      { label: 'Instant insights via AI analysis', icon: '/Icon/product-sheet.svg' },
      { label: 'Unlimited AI document creation', icon: '/Icon/product-docs.svg' },
      { label: '20,000+ rows per data table', icon: '/Icon/product-datatable.svg' },
      '1 GB attachment limit',
      'Advanced template library',
    ],
  },
  {
    key: 'zoommate',
    name: 'ZoomMate',
    priceMonthly: '$20',
    priceAnnual: '$16.67',
    priceSuffix: '/user/month',
    blurb: 'Your AI teammate.',
    aiCredits: '2,200 AI credits monthly',
    ctaLabel: 'Buy now',
    ctaVariant: 'primary',
    highlighted: true,
    featuresIntro: 'Everything in the AI Productivity Suite, plus:',
    features: [
      'Agentic capabilities',
      'Automatic post-meeting deliverables',
      'Unlimited AI note-taking',
      'Agentic search',
      'Workflow capabilities',
      'Voice translation',
    ],
  },
];

function CheckIcon() {
  return (
    <svg className="pr5-check" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.5 8.5 6.5 11.5 12.5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PricingV5() {
  const [billing, setBilling] = useState<Billing>('annual');

  return (
    <section className="pr5-section">
      <div className="pr5-inner">
        <div className="pr5-head">
          <h2 className="pr5-title">
            Explore Zoom AI Productivity Suite plans and pricing
          </h2>

          <div className="pr5-head-actions">
            <div className="pr5-toggle" role="tablist" aria-label="Billing period">
              <button
                type="button"
                role="tab"
                aria-selected={billing === 'monthly'}
                className={`pr5-toggle-btn${billing === 'monthly' ? ' is-active' : ''}`}
                onClick={() => setBilling('monthly')}
              >
                Monthly
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={billing === 'annual'}
                className={`pr5-toggle-btn${billing === 'annual' ? ' is-active' : ''}`}
                onClick={() => setBilling('annual')}
              >
                Annually
              </button>
            </div>

            <a
              className="pr5-explore"
              href="https://zoom.us/pricing/ai-productivity-suite"
              target="_blank"
              rel="noreferrer"
            >
              Explore plans
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>

        <div className="pr5-grid">
          {PLANS.map((plan) => {
            const price =
              billing === 'annual' ? plan.priceAnnual : plan.priceMonthly;
            const isFree = !plan.priceSuffix;

            return (
              <article
                key={plan.key}
                className={`pr5-card${plan.highlighted ? ' is-featured' : ''}`}
              >
                {plan.highlighted && (
                  <span className="pr5-badge">Most popular</span>
                )}

                <h3 className="pr5-card-name">{plan.name}</h3>
                <p className="pr5-card-blurb">{plan.blurb}</p>

                <div className="pr5-price">
                  <span className="pr5-price-amount">{price}</span>
                  {!isFree && (
                    <span className="pr5-price-suffix">{plan.priceSuffix}</span>
                  )}
                </div>

                {plan.aiCredits && (
                  <p className="pr5-credits">{plan.aiCredits}</p>
                )}

                <Button variant={plan.ctaVariant} className="pr5-cta">
                  {plan.ctaLabel}
                </Button>

                {plan.featuresIntro && (
                  <p className="pr5-features-intro">{plan.featuresIntro}</p>
                )}

                <ul className="pr5-features">
                  {plan.features.map((feature) => {
                    const label =
                      typeof feature === 'string' ? feature : feature.label;
                    const icon =
                      typeof feature === 'string' ? undefined : feature.icon;
                    return (
                      <li key={label} className="pr5-feature">
                        {icon ? (
                          <img
                            src={icon}
                            alt=""
                            className="pr5-feature-icon"
                            width={16}
                            height={16}
                          />
                        ) : (
                          <CheckIcon />
                        )}
                        <span>{label}</span>
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
