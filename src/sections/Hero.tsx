import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/Button';
import RotatingText from '../components/RotatingText';

const PRODUCTS = [
  { name: 'Slides', color: '#fb327e', icon: '/Icon/product-slides.svg' },
  { name: 'Sheets', color: '#23a52d', icon: '/Icon/product-sheet.svg' },
  { name: 'Docs', color: '#0d6bde', icon: '/Icon/product-docs.svg' },
  { name: 'Data table', color: '#23a52d', icon: '/Icon/product-datatable.svg' },
];

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <section
      style={{
        background: 'var(--gradient-accent)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '180px 24px 120px',
      }}
    >
      {/* Tagline block */}
      <div
        style={{
          maxWidth: 720,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          paddingLeft: 32,
          paddingRight: 32,
        }}
      >
        {/* Heading */}
        <h1
          className="h1"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0px 8px',
            margin: 0,
          }}
        >
          {'You just talk, AI turns your meeting into '.split(' ').map((word, i) => (
            <span key={i} style={{ whiteSpace: 'nowrap' }}>
              {word}
            </span>
          ))}

          {/* Rotating product carousel */}
          <motion.span
            layout
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              height: 60,
              overflow: 'hidden',
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img
                key={currentIndex}
                src={PRODUCTS[currentIndex].icon}
                alt=""
                width={36}
                height={36}
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '-120%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                style={{ flexShrink: 0 }}
              />
            </AnimatePresence>

            <RotatingText
              texts={PRODUCTS.map((p) => p.name)}
              colors={PRODUCTS.map((p) => p.color)}
              staggerDuration={0.025}
              staggerFrom="last"
              rotationInterval={2200}
              animatePresenceMode="popLayout"
              animatePresenceInitial={false}
              onNext={(index) => setCurrentIndex(index)}
              mainClassName="overflow-hidden"
              splitLevelClassName="overflow-hidden pb-0.5"
            />
          </motion.span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.4,
            color: 'var(--text-secondary)',
            margin: 0,
            textAlign: 'center',
            maxWidth: 480,
          }}
        >
          AI meeting flow handles all the meeting grunt work, so you can focus on
          what really matters
        </p>

        {/* CTA */}
        <Button variant="primary">Get started for free</Button>
      </div>

      {/* Hero video */}
      <div
        style={{
          width: '100%',
          maxWidth: 1400,
          marginTop: 48,
          mixBlendMode: 'darken',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        }}
      >
        <video
          src="/video/home-hero.webm"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>
    </section>
  );
}
