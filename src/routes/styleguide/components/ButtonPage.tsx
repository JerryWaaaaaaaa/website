import { html as buttonHtml } from '../../../../design-system/components/button.md';
import { Markdown } from '../../../lib/Markdown';
import { ComponentPreview } from '../../../lib/ComponentPreview';
import { Button } from '../../../components/Button';

export function ButtonPage() {
  return (
    <article className="sg-page">
      <h1>Button</h1>
      <p className="sg-description">
        Pill-shaped action triggers in primary and secondary variants.
      </p>

      <ComponentPreview label="Primary + Secondary pair" background="light">
        <Button variant="primary">Get started for free</Button>
        <Button variant="secondary">Sign in</Button>
      </ComponentPreview>

      <ComponentPreview label="Primary alone" background="light">
        <Button variant="primary">Try now</Button>
      </ComponentPreview>

      <ComponentPreview label="On dark surface" background="dark">
        <Button
          variant="primary"
          style={{ background: 'var(--bg-neutral)', color: 'var(--text-primary)' }}
        >
          Get started for free
        </Button>
        <Button
          variant="secondary"
          style={{
            background: 'rgba(255,255,255,0.12)',
            color: 'var(--text-contrast)',
          }}
        >
          Talk to sales
        </Button>
      </ComponentPreview>

      <Markdown html={buttonHtml} />
    </article>
  );
}
