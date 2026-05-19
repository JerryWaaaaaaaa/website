import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

type Feature = {
  title: string[];
  body: string;
  image: string;
};

const FEATURES: Feature[] = [
  {
    title: ['Auto-generated', 'meeting summary'],
    body:
      'After every meeting, AI drafts a summary — proposal, status update, or follow-up — based on what was discussed.',
    image: '/feature-images/PM.webp',
  },
  {
    title: ['AI-powered editing'],
    body:
      'Refine wording, tighten tone, or rewrite full sections — your team’s voice, sharpened in seconds.',
    image: '/feature-images/Coach.webp',
  },
  {
    title: ['Meeting Q&A'],
    body:
      'Ask anything about what was said, who said it, or what’s next — and get a sourced answer instantly.',
    image: '/feature-images/HR.webp',
  },
];

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{
        transform: direction === 'left' ? 'rotate(180deg)' : undefined,
      }}
    >
      <path
        d="M6 3.5L10.5 8L6 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MeetingDoc() {
  const [active, setActive] = useState(0);
  const goPrev = () =>
    setActive((a) => (a - 1 + FEATURES.length) % FEATURES.length);
  const goNext = () => setActive((a) => (a + 1) % FEATURES.length);

  const current = FEATURES[active];

  const ArrowButtons = () => (
    <>
      <button
        type="button"
        className="meeting-doc-arrow"
        onClick={goPrev}
        aria-label="Previous feature"
      >
        <ChevronIcon direction="left" />
      </button>
      <button
        type="button"
        className="meeting-doc-arrow"
        onClick={goNext}
        aria-label="Next feature"
      >
        <ChevronIcon direction="right" />
      </button>
    </>
  );

  return (
    <section className="meeting-doc">
      <div className="meeting-doc-content">
        {/* Header */}
        <div className="meeting-doc-header">
          <h2 className="meeting-doc-title">
            Meeting ended,
            <br />
            document is ready.
          </h2>
          <p className="meeting-doc-desc">
            Zoom Docs uses AI to turn your meetings into structured, client-ready
            documents — instantly.
          </p>
        </div>

        {/* Card */}
        <div className="meeting-doc-card">
          <div className="meeting-doc-left">
            <div className="meeting-doc-inner">
              <div className="meeting-doc-scroll">
                <div
                  className="meeting-doc-features"
                  role="tablist"
                  aria-label="Meeting doc features"
                >
                  {FEATURES.map((feature, i) => {
                    const isActive = i === active;
                    return (
                      <button
                        key={feature.title.join(' ')}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-controls={`meeting-doc-panel-${i}`}
                        id={`meeting-doc-tab-${i}`}
                        onClick={() => setActive(i)}
                        className={`meeting-doc-feature${isActive ? ' is-active' : ''}`}
                      >
                        <span className="meeting-doc-feature-title">
                          {feature.title.map((line, li) => (
                            <span
                              key={li}
                              className="meeting-doc-feature-title-line"
                            >
                              {line}
                            </span>
                          ))}
                        </span>
                        <AnimatePresence initial={false}>
                          {isActive && (
                            <motion.span
                              key="desc"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{
                                duration: 0.28,
                                ease: [0.4, 0, 0.2, 1],
                              }}
                              className="meeting-doc-feature-body-wrap"
                            >
                              <span className="meeting-doc-feature-body">
                                {feature.body}
                              </span>
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="meeting-doc-actions meeting-doc-actions--col">
                <ArrowButtons />
              </div>
            </div>
          </div>

          <div
            className="meeting-doc-image-wrap"
            role="tabpanel"
            id={`meeting-doc-panel-${active}`}
            aria-labelledby={`meeting-doc-tab-${active}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={current.image}
                src={current.image}
                alt=""
                className="meeting-doc-image"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              />
            </AnimatePresence>

            <div className="meeting-doc-actions meeting-doc-actions--overlay">
              <ArrowButtons />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
