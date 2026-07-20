import { designHtml } from '../../lib/designDoc';
import { Markdown } from '../../lib/Markdown';

export function StyleGuideIndex() {
  return (
    <article className="sg-page">
      <Markdown html={designHtml} />
    </article>
  );
}
