import { Chip } from '../components/Chip';
import { MediaPlaceholder } from '../components/MediaPlaceholder';

export function OneMeetingOneDoc() {
  return (
    <section
      className="section-full"
      style={{ background: 'var(--bg-accent-light)' }}
    >
      <div style={{ maxWidth: 1024, margin: '0 auto' }}>
        <div className="section-eyebrow">
          <Chip>meeting wiki</Chip>
        </div>
        <h2>
          One Meeting, One Doc
          <br />
          From Chaos to Clarity
        </h2>
        <p className="lede">
          Agendas, real-time notes, AI insights, follow-ups, and final deliverables. No more
          scattered files — just one doc that grows with your meeting.
        </p>
        <MediaPlaceholder variant="hero" tint="medium" label="Meeting wiki visual" />
      </div>
    </section>
  );
}
