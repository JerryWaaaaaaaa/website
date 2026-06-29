import './MeetingDeliverableLoop.css';

const BASE = '/core-features/meeting-deliverable';

// The cards that scroll past in the right lane, in the source design's column
// order. Uniform 404×295 exports of the six "gallery cards" deliverables.
const CARDS = [
  { src: `${BASE}/gallery-cards.png`, alt: 'User journey map' },
  { src: `${BASE}/gallery-cards-1.png`, alt: 'Meeting agenda' },
  { src: `${BASE}/gallery-cards-2.png`, alt: 'Meeting summary' },
  { src: `${BASE}/gallery-cards-3.png`, alt: 'Follow-up trackers' },
  { src: `${BASE}/gallery-cards-4.png`, alt: 'My notes' },
  { src: `${BASE}/gallery-cards-5.png`, alt: 'Design presentation' },
];

/**
 * Animated replacement for the static "meeting-deliverable" illustration.
 * The floating video window stays fixed on the left while the deliverable cards
 * loop vertically on the right — a seamless, continuously drifting marquee that
 * fades at the top and bottom edges. Fills its (positioned, 5:4) media wrapper.
 */
export function MeetingDeliverableLoop() {
  return (
    <div className="md-loop" aria-hidden="true">
      <img className="md-loop-video" src={`${BASE}/video-window.png`} alt="" draggable={false} />

      <div className="md-loop-lane">
        {/* The card set is rendered twice back-to-back; translating the track up
            by exactly half its height swaps the duplicate in seamlessly. Each
            card carries its own trailing gap (margin-bottom) so the wrap point
            keeps the same rhythm as the rest of the column. */}
        <div className="md-loop-track">
          {[...CARDS, ...CARDS].map((card, i) => (
            <img
              key={i}
              className="md-loop-card"
              src={card.src}
              alt=""
              loading="lazy"
              draggable={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
