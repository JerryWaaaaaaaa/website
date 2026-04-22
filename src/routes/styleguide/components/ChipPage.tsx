import { html as chipHtml } from '../../../../design-system/components/chip.md';
import { Markdown } from '../../../lib/Markdown';
import { ComponentPreview } from '../../../lib/ComponentPreview';
import { Chip } from '../../../components/Chip';

export function ChipPage() {
  return (
    <article className="sg-page">
      <h1>Chip / Label Tag</h1>
      <p className="sg-description">A small pill label used above section headings.</p>

      <ComponentPreview label="Default" background="light">
        <Chip>auto writing</Chip>
      </ComponentPreview>

      <ComponentPreview label="Common labels" background="light">
        <Chip>auto writing</Chip>
        <Chip>meeting wiki</Chip>
        <Chip>use cases</Chip>
        <Chip>now available</Chip>
      </ComponentPreview>

      <ComponentPreview label="In context — chip above heading" background="light" align="start">
        <div style={{ textAlign: 'left' }}>
          <Chip>auto writing</Chip>
          <h3 style={{ margin: '20px 0 0', fontSize: 32, fontWeight: 500, letterSpacing: '-0.01em' }}>
            From Conversation to Real-Work
          </h3>
        </div>
      </ComponentPreview>

      <Markdown html={chipHtml} />
    </article>
  );
}
