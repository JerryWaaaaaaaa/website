import { html as rulesHtml } from '../../../design-system/DESIGN_RULES.md';
import { Markdown } from '../../lib/Markdown';

export function StyleGuideIndex() {
  return (
    <article className="sg-page">
      <h1>Design Rules</h1>
      <p className="sg-description">
        Design rules and component specifications for the Zoom Docs microsite.
      </p>
      <Markdown html={rulesHtml} />
    </article>
  );
}
