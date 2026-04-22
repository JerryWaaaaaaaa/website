import { html as navHtml } from '../../../../design-system/components/nav-bar.md';
import { Markdown } from '../../../lib/Markdown';
import { ComponentPreview } from '../../../lib/ComponentPreview';

export function NavBarPage() {
  return (
    <article className="sg-page">
      <h1>Navigation Bar</h1>
      <p className="sg-description">
        Fixed navigation with scroll-driven frosted-glass pill state.
      </p>

      <ComponentPreview label="Live nav (visible at the top of the marketing page)" background="gradient">
        <p
          style={{
            margin: 0,
            fontSize: 14,
            lineHeight: 1.5,
            color: 'var(--text-secondary)',
            textAlign: 'center',
            maxWidth: 480,
          }}
        >
          The navigation bar is fixed at the top of the page and renders inside the global layout —
          visit the{' '}
          <a href="/" style={{ color: 'var(--text-highlight)', textDecoration: 'underline' }}>
            marketing page
          </a>{' '}
          to see it in action with the scroll-pill transition.
        </p>
      </ComponentPreview>

      <Markdown html={navHtml} />
    </article>
  );
}
