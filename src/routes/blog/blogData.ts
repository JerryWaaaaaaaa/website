/**
 * Mock blog content for the prototype. Replace with a real CMS/data source later.
 * `body` is trusted HTML (mock only) rendered via dangerouslySetInnerHTML.
 */
export type BlogCategory = 'Company' | 'Product' | 'Engineering';

export type BlogPost = {
  slug: string;
  title: string;
  category: BlogCategory;
  /** ISO 'YYYY-MM-DD' */
  date: string;
  readTime: string;
  excerpt: string;
  /** Short punchy line rendered on the generated cover; falls back to `title`. */
  coverText?: string;
  body: string;
};

export const POSTS: BlogPost[] = [
  {
    slug: 'zoom-ai-create-500m-documents',
    title: 'Zoom AI Create crosses 500 million documents created',
    coverText: '500,000,000 documents created',
    category: 'Company',
    date: '2026-07-28',
    readTime: '4 min read',
    excerpt:
      'A little over a year after launch, teams have created half a billion documents, decks and sheets with AI Create. Here is what we have learned.',
    body:
      '<p>When we launched AI Create, we set out to make the blank page disappear. Today, teams across more than 40,000 organizations have created over <strong>500 million</strong> documents, presentations and spreadsheets — and the pace is still accelerating.</p>' +
      '<h2>What half a billion documents taught us</h2>' +
      '<p>The most-used surface is not the one we expected. Meetings-to-docs now accounts for nearly a third of everything created, as teams turn conversations into structured artifacts without lifting a finger.</p>' +
      '<blockquote>The best interface for AI is the work you were already doing.</blockquote>' +
      '<p>We are doubling down on that thesis: less prompting, more anticipating. Expect the next wave of AI Create to feel less like a tool you visit and more like a colleague who shows up with a first draft.</p>',
  },
  {
    slug: 'introducing-ai-slides',
    title: 'Introducing AI Slides: from meeting to deck in seconds',
    coverText: 'Meeting to deck, instantly',
    category: 'Product',
    date: '2026-07-15',
    readTime: '5 min read',
    excerpt:
      'Turn any meeting, doc or prompt into a polished, on-brand presentation — complete with speaker notes and a voice-ready narration track.',
    body:
      '<p>AI Slides is the fastest way we have ever shipped from idea to presentation. Point it at a meeting recording, a doc, or a one-line prompt, and it returns a structured deck with a narrative arc — not just bullet soup.</p>' +
      '<h2>Designed, not just generated</h2>' +
      '<p>Every deck respects your brand kit: fonts, colors, logo placement and layout rules are applied automatically. Themes adapt to your content, so a financial review looks nothing like a product launch.</p>' +
      '<p>And because it is built on the same collaboration engine as the rest of AI Create, your whole team can edit live, leave comments, and hand off sections without a single "final_v3" in sight.</p>',
  },
  {
    slug: 'ai-create-expands-apac',
    title: 'Zoom AI Create expands across Asia-Pacific',
    coverText: 'Now available across APAC',
    category: 'Company',
    date: '2026-07-02',
    readTime: '3 min read',
    excerpt:
      'New data residency options and localized models bring AI Create to teams in Japan, Australia, India and Singapore.',
    body:
      '<p>Starting today, AI Create is generally available across Asia-Pacific, with in-region data residency and models tuned for local languages and business norms.</p>' +
      '<p>Teams in Tokyo, Sydney, Bangalore and Singapore can now keep their content in-region while getting the same speed and quality customers expect everywhere else.</p>' +
      '<h2>Built for the way the region works</h2>' +
      '<p>Localization goes beyond translation. Templates, tone and formatting defaults now reflect regional conventions, so the first draft feels native — not machine-translated.</p>',
  },
  {
    slug: 'how-we-built-realtime-collab',
    title: 'How we built real-time collaboration at scale',
    coverText: 'Real-time, at scale',
    category: 'Engineering',
    date: '2026-06-20',
    readTime: '9 min read',
    excerpt:
      'A look under the hood at the CRDT-based engine that keeps thousands of concurrent editors — and AI agents — perfectly in sync.',
    body:
      '<p>Collaboration is easy with two people. It gets interesting when you add a few thousand editors and a swarm of AI agents all mutating the same document at once.</p>' +
      '<h2>Why we chose CRDTs</h2>' +
      '<p>Conflict-free replicated data types let every client apply edits locally and converge without a central lock. That matters even more when an AI agent is streaming hundreds of edits per second alongside a human who is still typing.</p>' +
      '<blockquote>Latency is a feature. Every millisecond you shave off is trust you earn back.</blockquote>' +
      '<p>We will go deep on our presence protocol, cursor prediction, and how we keep memory flat as documents grow into the millions of operations.</p>',
  },
  {
    slug: 'ai-sheets-launch',
    title: 'AI Sheets turns your meetings into living spreadsheets',
    coverText: 'Meetings become data',
    category: 'Product',
    date: '2026-06-05',
    readTime: '4 min read',
    excerpt:
      'Action items, owners and dates are extracted automatically and kept up to date as the conversation continues across meetings.',
    body:
      '<p>Spreadsheets are where decisions go to be tracked. AI Sheets makes sure they get there automatically.</p>' +
      '<p>After every meeting, Sheets extracts commitments — who owns what, and by when — and files them into a structured tracker that updates itself as follow-up meetings happen.</p>' +
      '<h2>From notes to a system of record</h2>' +
      '<p>Because the data is structured, you can pivot, filter and chart it like any other spreadsheet — or let AI Create build the view for you.</p>',
  },
  {
    slug: 'knowledge-base-ga',
    title: 'Knowledge Base is now generally available',
    coverText: 'One source of truth',
    category: 'Product',
    date: '2026-05-22',
    readTime: '3 min read',
    excerpt:
      'Connect your docs, meetings and wikis into a single searchable layer that every AI Create surface can draw on.',
    body:
      '<p>Knowledge Base connects everything your team creates into one searchable, permission-aware layer. Ask a question and get an answer grounded in your own content, with citations.</p>' +
      '<p>Every surface in AI Create — Docs, Slides, Sheets — can now draw on that shared context, so drafts start from what your team already knows.</p>',
  },
  {
    slug: 'series-c-funding',
    title: 'Zoom AI Create raises Series C to accelerate the agentic workspace',
    coverText: 'Series C',
    category: 'Company',
    date: '2026-05-08',
    readTime: '4 min read',
    excerpt:
      'The new funding will fund research into long-horizon agents and expand our team across product, research and go-to-market.',
    body:
      '<p>We are thrilled to announce our Series C, led by returning and new investors who share our belief that the workspace is becoming agentic.</p>' +
      '<h2>Where the investment goes</h2>' +
      '<p>Three places: long-horizon agents that can carry a project across days, deeper enterprise controls, and a much larger research team to push model quality where it matters most — your everyday work.</p>',
  },
  {
    slug: 'designing-for-trust',
    title: 'Designing for trust: our approach to responsible AI',
    coverText: 'Designing for trust',
    category: 'Company',
    date: '2026-04-24',
    readTime: '6 min read',
    excerpt:
      'How we think about provenance, permissions and human control as AI takes on more of the first draft.',
    body:
      '<p>As AI writes more of the first draft, trust becomes the product. Here is how we design for it.</p>' +
      '<h2>Provenance by default</h2>' +
      '<p>Every AI-generated passage can show its sources. Every automated action is reversible. And nothing leaves your permission boundary without an explicit, auditable step.</p>' +
      '<blockquote>Automation should expand human agency, never quietly replace it.</blockquote>' +
      '<p>These are not features bolted on at the end — they are constraints we design against from the first sketch.</p>',
  },
  {
    slug: 'engineering-latency',
    title: 'Shaving 200ms off every generation',
    coverText: '−200ms',
    category: 'Engineering',
    date: '2026-04-10',
    readTime: '7 min read',
    excerpt:
      'Speculative decoding, smarter caching and a rewritten streaming layer add up to a noticeably snappier AI Create.',
    body:
      '<p>Speed is the difference between a tool people tolerate and one they reach for. This quarter we cut 200 milliseconds off the median generation — here is how.</p>' +
      '<h2>Three wins that compounded</h2>' +
      '<p>Speculative decoding gave us the first 90ms. A rewritten streaming layer that starts rendering before the model finishes gave us another 70ms of perceived speed. Smarter prompt caching closed the gap.</p>' +
      '<p>None of these were glamorous. Together, they make AI Create feel instant.</p>',
  },
  {
    slug: 'ai-docs-templates',
    title: '100+ new templates for AI Docs',
    coverText: '100+ new templates',
    category: 'Product',
    date: '2026-03-27',
    readTime: '2 min read',
    excerpt:
      'From PRDs to board updates to onboarding plans — start from a structured, on-brand template instead of a blank page.',
    body:
      '<p>We are adding more than 100 new templates to AI Docs, spanning product, marketing, operations and people teams.</p>' +
      '<p>Each template is more than a layout: it carries the prompts, structure and tone that make a great version of that document — so your first draft is already 80% there.</p>',
  },
  {
    slug: 'hello-world',
    title: 'Hello, world: welcome to the Zoom AI Create blog',
    coverText: 'Hello, world',
    category: 'Company',
    date: '2026-03-13',
    readTime: '2 min read',
    excerpt:
      'A new home for product news, engineering deep-dives and stories from the teams building the agentic workspace.',
    body:
      '<p>Welcome to the AI Create blog. This is where we will share what we are building, why we are building it, and the occasional look under the hood.</p>' +
      '<p>Expect product announcements, engineering deep-dives, and stories from customers turning conversations into finished work. Thanks for reading — there is a lot more to come.</p>',
  },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** tz-proof formatting of an ISO 'YYYY-MM-DD' string → 'July 28, 2026'. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

/** Newest-first. */
export function sortedPosts(): BlogPost[] {
  return [...POSTS].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
