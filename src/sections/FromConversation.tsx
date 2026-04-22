import { Chip } from '../components/Chip';
import { MediaPlaceholder } from '../components/MediaPlaceholder';

export function FromConversation() {
  return (
    <section className="section">
      <div className="section-eyebrow">
        <Chip>auto writing</Chip>
      </div>
      <h2>
        From Conversation
        <br />
        to Real-Work
      </h2>
      <p className="lede">
        An AI tool that connects where real work happens and fits seamlessly into how you and your
        team already work.
      </p>
      <MediaPlaceholder variant="wide" tint="gradient" label="Auto writing visual" />
    </section>
  );
}
