export type Media =
  | { kind: 'image'; src: string }
  | { kind: 'sequence'; frames: string[]; intervalMs?: number }
  // Reserved for a future within-frame animation built from decomposed layers.
  | { kind: 'layers'; animation: string };

export interface KeyPoint {
  title: string;
  body: string;
  /** Tint used as the framed backing panel behind the screenshot. */
  tint: string;
  /** Product media (5:4, lives in /public/core-features). */
  media: Media;
}

export const KEY_POINTS: KeyPoint[] = [
  {
    title: 'Every meeting becomes a deliverable.',
    body: 'Turn every conversation into something you can use — docs, slides, sheets, and more.',
    tint: 'var(--bg-accent-medium)',
    media: { kind: 'image', src: '/core-features/meeting-deliverable.png' },
  },
  {
    title: 'Fully editable AI outputs',
    body: "Every AI output is fully editable — refine, rewrite, or reshape until it's exactly what you need.",
    tint: 'var(--bg-highlight-blue)',
    media: {
      kind: 'sequence',
      frames: [
        '/core-features/fully-editable-01.png',
        '/core-features/fully-editable-02.png',
        '/core-features/fully-editable-03.png',
        '/core-features/fully-editable-04.png',
      ],
    },
  },
  {
    title: 'Inline AI, right where you need it.',
    body: 'Select any text to trigger AI suggestions right where you are — no switching, no extra steps.',
    tint: 'var(--bg-highlight-pink)',
    media: {
      kind: 'sequence',
      frames: [
        '/core-features/inline-ai-01.png',
        '/core-features/inline-ai-02.png',
        '/core-features/inline-ai-03.png',
        '/core-features/inline-ai-04.png',
      ],
    },
  },
  {
    title: 'Share live, right in your meeting.',
    body: 'Share and co-edit documents live, right inside your meeting.',
    tint: 'var(--gradient-accent)',
    media: { kind: 'image', src: '/core-features/share-live.png' },
  },
  {
    title: 'Built for teams.',
    body: 'Collaborate securely across teams with flexible, granular permission controls — so the right people always have the right access.',
    tint: 'var(--bg-accent-dark)',
    media: { kind: 'image', src: '/core-features/built-for-teams.png' },
  },
  {
    title: 'Your prompt, saved as a template',
    body: 'Build custom AI templates with your own prompts — save once, reuse every time.',
    tint: 'var(--color-blue)',
    media: { kind: 'image', src: '/core-features/template.png' },
  },
];
