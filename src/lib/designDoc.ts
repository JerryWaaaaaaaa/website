import { html as designHtml } from '../../DESIGN.md';

/**
 * The full rendered HTML of the single source-of-truth design document
 * (`/DESIGN.md`). The style-guide renders slices of this via `sectionHtml`,
 * so there is exactly one place design content lives.
 */
export { designHtml };

const headingLevel = (chunk: string): number | null => {
  const m = chunk.match(/^<h([1-6])\b/i);
  return m ? Number(m[1]) : null;
};

const headingText = (chunk: string): string => {
  const m = chunk.match(/^<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i);
  return m ? m[1].replace(/<[^>]+>/g, '').trim().toLowerCase() : '';
};

/**
 * Return the HTML for a section identified by its heading text (case
 * insensitive, any level), including everything up to the next heading of the
 * same or higher level. Returns an empty string if the heading is not found.
 */
export function sectionHtml(heading: string): string {
  const target = heading.trim().toLowerCase();
  const chunks = designHtml.split(/(?=<h[1-6]\b)/i);

  let start = -1;
  let startLevel = 0;
  for (let i = 0; i < chunks.length; i++) {
    if (headingText(chunks[i]) === target) {
      start = i;
      startLevel = headingLevel(chunks[i]) ?? 0;
      break;
    }
  }
  if (start === -1) return '';

  const out = [chunks[start]];
  for (let i = start + 1; i < chunks.length; i++) {
    const level = headingLevel(chunks[i]);
    if (level !== null && level <= startLevel) break;
    out.push(chunks[i]);
  }
  return out.join('');
}
