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
  /** Optional; falls back to a deterministic mock author (see authorFor). */
  author?: string;
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
      '<p>When we launched AI Create, we set out to make the blank page disappear. Today, teams across more than 40,000 organizations have created over <strong>500 million</strong> documents, presentations and spreadsheets — and the pace is <em>still accelerating</em>.</p>' +
      '<h2>What half a billion documents taught us</h2>' +
      '<p>The most-used surface is not the one we expected. <mark>Meetings-to-docs now accounts for nearly a third</mark> of everything created, as teams turn conversations into structured artifacts without lifting a finger. Broken down, the top surfaces are:</p>' +
      '<ul>' +
      '<li><strong>Docs</strong> — 41% of everything created, led by meeting recaps and PRDs.</li>' +
      '<li><strong>Slides</strong> — 28%, most of it generated straight from a doc or a call.</li>' +
      '<li><strong>Sheets</strong> — 19%, usually action-item trackers that keep updating themselves.</li>' +
      '</ul>' +
      '<figure>' +
      '<img src="/hero-images/slides.png" alt="An AI-generated slide deck open in AI Create." loading="lazy" />' +
      '<figcaption>A deck generated from a single meeting — one of the half-billion artifacts created so far.</figcaption>' +
      '</figure>' +
      '<blockquote><p>The best interface for AI is the work you were already doing.</p></blockquote>' +
      '<h3>Where we go from here</h3>' +
      '<p>We are doubling down on that thesis — <em>less prompting, more anticipating</em> — along three lines:</p>' +
      '<ol>' +
      '<li>First drafts that arrive <strong>before</strong> you ask, grounded in your own context.</li>' +
      '<li>Handoffs between Docs, Slides and Sheets that keep a single source of truth.</li>' +
      '<li>Agents that carry a project across days, not just a single prompt.</li>' +
      '</ol>' +
      '<aside class="post-note"><p><strong>By the numbers</strong> — 500M+ artifacts, 40k+ organizations, and roughly <code>1,200</code> new documents created every minute.</p></aside>' +
      '<p>Expect the next wave of AI Create to feel less like a tool you visit and more like a colleague who shows up with a first draft. More soon on the <a href="/blog">blog</a>.</p>',
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
      '<p>Collaboration is easy with two people. It gets <em>interesting</em> when you add a few thousand editors and a swarm of <strong>AI agents</strong> all mutating the same document at once. This post is a tour of the engine that keeps them in sync — and, conveniently, a <mark>living reference</mark> for how long-form writing renders on this blog.</p>' +
      '<h2>Why we chose CRDTs</h2>' +
      '<p>Conflict-free replicated data types let every client apply edits locally and converge without a central lock. That matters even more when an AI agent is streaming hundreds of edits per second alongside a human who is <em>still typing</em>. Three properties sold us:</p>' +
      '<ul>' +
      '<li><strong>Local-first writes.</strong> Every keystroke commits instantly, then syncs — you never wait on a round-trip to see your own text.</li>' +
      '<li><strong>Commutativity.</strong> Operations can arrive in any order and still converge to an identical document.</li>' +
      '<li><strong>Offline tolerance.</strong> A dropped connection is just a longer merge window, never a lost draft — even for edits that were:' +
      '<ul><li>made on a plane,</li><li>queued for minutes, and</li><li>replayed against a doc that moved on without you.</li></ul>' +
      '</li>' +
      '</ul>' +
      '<blockquote><p>Latency is a feature. Every millisecond you shave off is trust you earn back.</p><cite>— our north-star principle for the sync team</cite></blockquote>' +
      '<h2>The shape of the system</h2>' +
      '<p>At a high level, three services carry an edit from a keypress to every other participant. The surface below is the same shared canvas our customers collaborate on:</p>' +
      '<figure>' +
      '<img src="/product-suite-assets/canvas-ui.png" alt="The AI Create canvas with multiple live cursors editing one shared document." loading="lazy" />' +
      '<figcaption>Humans and agents editing a single canvas — each cursor is a replica converging in real time.</figcaption>' +
      '</figure>' +
      '<h3>The write path</h3>' +
      '<p>When you type, the client appends an operation to its local log and optimistically renders it. Only then does it leave the device. In order:</p>' +
      '<ol>' +
      '<li>The editor produces a <code>PositionedOp</code> tagged with a Lamport timestamp.</li>' +
      '<li>The op is applied locally and broadcast to the room&rsquo;s <code>SyncGateway</code>.</li>' +
      '<li>Peers merge it into their own replica — <em>no server ever owns the truth</em>.</li>' +
      '</ol>' +
      '<h3>Presence, without the chatter</h3>' +
      '<p>Cursor positions change far more often than content, so we ship them over a separate, lossy channel. A tiny last-write-wins reducer keeps the payload flat:</p>' +
      '<pre><code>' +
      '<span class="tok-key">const</span> CHANNEL = <span class="tok-str">"presence:v2"</span>;   <span class="tok-com">// best-effort channel</span>\n' +
      '\n' +
      '<span class="tok-key">type</span> Cursor = { line: number; ch: number };\n' +
      '\n' +
      '<span class="tok-key">function</span> <span class="tok-fn">onPresence</span>(state, msg) {\n' +
      '  <span class="tok-com">// last write wins per peer — cheap, and lossy on purpose</span>\n' +
      '  <span class="tok-key">return</span> { ...state, [msg.peerId]: msg.cursor };\n' +
      '}' +
      '</code></pre>' +
      '<aside class="post-note"><p><strong>Note</strong> — presence packets are deliberately best-effort. Drop one and a cursor lags a single frame; it can never block or reorder a content edit.</p></aside>' +
      '<h4>Keeping memory flat</h4>' +
      '<p>Long-lived docs accumulate history, so a background compactor folds settled operations into a snapshot and evicts the tombstones. Memory tracks the <em>visible</em> document, not its entire past.</p>' +
      '<h2>Did it actually get faster?</h2>' +
      '<p>We measured median end-to-end edit latency — keypress on one client to paint on another — before and after the rewrite, across three regions:</p>' +
      '<table>' +
      '<caption>Median edit latency, 50-editor rooms (lower is better).</caption>' +
      '<thead><tr><th>Region</th><th>Before</th><th>After</th><th>Change</th></tr></thead>' +
      '<tbody>' +
      '<tr><td>US-East</td><td>142 ms</td><td>38 ms</td><td>−73%</td></tr>' +
      '<tr><td>EU-West</td><td>168 ms</td><td>44 ms</td><td>−74%</td></tr>' +
      '<tr><td>AP-South</td><td>210 ms</td><td>61 ms</td><td>−71%</td></tr>' +
      '</tbody>' +
      '</table>' +
      '<p>The headline: <mark>a 3–4× drop</mark> in perceived edit latency, with the biggest wins exactly where round-trips were longest.</p>' +
      '<hr />' +
      '<h2>What&rsquo;s next</h2>' +
      '<p>We are going deeper on cursor prediction and flat-memory garbage collection. If you want the gory numbers, read the companion post on <a href="/blog/engineering-latency">shaving 200ms off every generation</a> — or just open a doc and start typing. Either way, <strong>welcome to the fast path</strong>.</p>',
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
      '<blockquote><p>Automation should expand human agency, never quietly replace it.</p></blockquote>' +
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

export type Author = { name: string; role: string };

const AUTHORS: Author[] = [
  { name: 'Elena Ross', role: 'Chief Product Officer' },
  { name: 'Marcus Lee', role: 'Product Lead' },
  { name: 'Priya Nair', role: 'Head of International' },
  { name: 'Sam Ito', role: 'Staff Engineer' },
  { name: 'Dana Kim', role: 'Product Marketing' },
  { name: 'Aisha Khan', role: 'Head of Trust & Safety' },
];

/** Deterministic mock author for a post (prototype; swap for a real `author` field later). */
export function authorFor(post: BlogPost): Author {
  if (post.author) return { name: post.author, role: 'Contributor' };
  let h = 5381;
  for (let i = 0; i < post.slug.length; i++) h = (h * 33 + post.slug.charCodeAt(i)) & 0x7fffffff;
  return AUTHORS[h % AUTHORS.length];
}

/** Two-letter initials for an author name (for the card avatar). */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Short 'D Month' date (e.g. '28 July') for card eyebrows. */
export function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]}`;
}
