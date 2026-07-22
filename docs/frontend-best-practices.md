# Frontend Best Practices — A Plain-Language Guide

*A beginner-friendly summary of the engineering skills installed in this repo
(`.claude/skills/frontend-ui-engineering`, `context-engineering`,
`spec-driven-development`), plus the wider set from
[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills).*

This guide assumes **no software engineering background**. It explains *what*
the practices are, *why* they matter, and *what to actually do* — in everyday
language. Jargon is defined in the glossary at the bottom.

---

## The one-sentence version

> Decide what you're building **before** you build it, write down the rules
> **once** so they're not in your head, keep every file and change **small**,
> and prove it works with **tests** — so the code stays easy to change later.

Almost every "best practice" is a variation of *make future changes cheap and
safe*. That's the whole game.

---

## 1. Write down the rules (the highest-leverage thing you can do)

**The idea:** Create one file that describes your project's rules, so a
teammate — human or AI — never has to guess. For AI coding tools this file has a
standard name: `CLAUDE.md` (Claude Code), `AGENTS.md` (Codex), `.cursorrules`
(Cursor). It's just plain text.

**Why it matters:** *"If it's not written, it doesn't exist."* An AI (or a new
hire) can't read your mind. Ten minutes writing this file saves hours of the
tool producing code in the wrong style.

**What to put in it:**
- **Tech stack** — the tools and versions (e.g. "React 19, TypeScript, Vite, Tailwind 4").
- **Commands** — how to run things (`npm run dev`, `npm run build`).
- **Conventions** — your style rules ("functional components, named exports, keep tests next to the file").
- **Boundaries** — a short "never do this" list ("never commit secrets, ask before changing the database").
- **One example** — paste one well-written component. Examples beat paragraphs.

> This repo already has a skills system; a `CLAUDE.md` would be a natural next
> step. You can generate one automatically with the `/init` command.

---

## 2. Spec before you code (a tiny plan first)

**The idea:** Before building anything non-trivial, write a short **spec** — a
few paragraphs describing *what* you're building and *how you'll know it's
done*. Then plan, then break into small tasks, then build. Don't jump straight
to code.

**Why it matters:** The spec surfaces misunderstandings **before** code is
written, when they're free to fix. Fixing them after is expensive. *"Waterfall
in 15 minutes beats debugging in 15 hours."*

**What a spec covers (6 things):**
1. **Objective** — what and why; who's the user; what does success look like.
2. **Commands** — how to build/test/run.
3. **Project structure** — where files live.
4. **Code style** — one real snippet showing your style.
5. **Testing** — how you'll verify it works.
6. **Boundaries** — Always do / Ask first / Never do.

**Beginner tip — turn vague asks into testable goals.** "Make the dashboard
faster" becomes "dashboard loads in under 2.5 seconds on a phone." Now you know
when you're done.

**When to skip it:** typo fixes and one-line changes. A two-line spec is fine
for small things.

---

## 3. How to organize your files

**The rule: keep related things together ("colocation").** Everything about one
component lives in one folder:

```
src/components/
  TaskList/
    TaskList.tsx          # the component
    TaskList.test.tsx     # its tests (right next to it)
    use-task-list.ts      # its logic hook (if complex)
    types.ts              # its types (if needed)
```

**Why it matters:** When you change a feature, everything you need is in one
place — you're not hunting across the project. When you delete a feature, you
delete one folder.

A typical whole-project layout:

```
src/           → application code
src/components → UI building blocks
src/lib        → shared helper functions
tests/         → broader tests
docs/          → documentation (like this file)
```

---

## 4. What to install (the typical frontend toolkit)

You don't need all of these, but this is the common vocabulary. Add tools when
you feel the pain they solve — not "just in case."

| Job | Common choice | Plain-language purpose |
|---|---|---|
| Framework | **React** | Build UI out of reusable pieces ("components") |
| Language | **TypeScript** | JavaScript that catches typos/mistakes before you run it |
| Build tool | **Vite** | Runs your app locally and packages it for the web (fast) |
| Styling | **Tailwind CSS** | Style using small utility classes instead of separate CSS files |
| Server data | **React Query** or **SWR** | Fetch and cache data from a server, handling loading/errors for you |
| Simple shared state | **Zustand** | Share data across the app without much boilerplate |
| Testing | **Vitest / Jest** + **Playwright** | Prove your code works (unit + full-browser) |
| Accessibility check | **axe-core** | Automatically flags accessibility problems |

> This repo uses React 19 + TypeScript + Vite + Tailwind 4 — a modern, standard
> setup.

**Rule of thumb:** every dependency is a liability someone must maintain and
that adds to download size. Before adding one, ask "do I really need this, or
can a few lines of my own code do it?"

---

## 5. Writing good components

A **component** is a reusable piece of UI (a button, a card, a list). Four
habits make them good:

1. **Keep them small.** Over ~200 lines? Split it. Small pieces are easier to
   understand, test, and reuse.

2. **Prefer composition over configuration.** Build UI by *nesting* small
   pieces rather than passing dozens of options:
   ```tsx
   // Good — readable, flexible
   <Card><CardHeader><CardTitle>Tasks</CardTitle></CardHeader></Card>

   // Avoid — a wall of settings
   <Card title="Tasks" headerVariant="large" bodyPadding="md" ... />
   ```

3. **Separate "getting data" from "showing data."** One component fetches the
   data and handles loading/error/empty states; another just displays it. This
   keeps each piece simple and testable.

4. **Pick the simplest way to store state.** "State" = data that changes over
   time. Reach for the simplest option that works, in this order:
   ```
   useState            → data used by one component
   lifted state        → data shared by 2–3 nearby components
   Context             → app-wide, rarely-changing (theme, login)
   URL                 → filters/pages you want to be shareable via link
   server state (React Query) → data that lives on a server
   global store (Zustand)     → complex data shared across the whole app
   ```
   Don't reach for the heavy tools first.

---

## 6. Accessibility (make it usable by everyone)

**The idea:** Your UI should work for people using a keyboard only, a screen
reader, or with low vision. This is called **accessibility** (often "a11y"), and
in many places it's a legal requirement — not a nice-to-have.

**The easy wins:**
- Use real elements: `<button>` for buttons, `<label>` for form fields. They're
  keyboard- and screen-reader-friendly *for free*. A clickable `<div>` is not.
- Give icon-only buttons a label: `<button aria-label="Close">✕</button>`.
- Make sure text has enough contrast against its background (aim for 4.5:1).
- Never use color *alone* to signal meaning (add an icon or text too — think of
  colorblind users).
- Always handle the empty state, the loading state, and the error state. Don't
  show a blank screen.

**How to check:** press Tab and try to use the whole page with just the
keyboard. Run `axe-core` (or browser dev tools) to catch the rest.

---

## 7. Avoid the "generic AI look"

AI tools tend to produce a recognizable, samey aesthetic. Steer away from it so
your product looks intentional:

| The tell-tale "AI look" | Do this instead |
|---|---|
| Purple/indigo everywhere | Use your project's actual colors |
| Gradients and heavy shadows all over | Flat, subtle, matching your design system |
| Everything super-rounded | One consistent corner radius |
| "Lorem ipsum" filler text | Realistic content (reveals real layout problems) |
| Giant equal padding everywhere | A consistent spacing scale |

**Use a "design system":** a fixed set of spacing values, colors (referred to by
name like `text-primary`, not raw hex codes), and text sizes. Don't invent
one-off values like `padding: 13px` — pick from the scale.

---

## 8. Testing (proving it works)

**The idea:** A **test** is code that automatically checks your other code does
what you expect. Once written, it runs forever and warns you the moment
something breaks.

**The test pyramid — where to spend effort:**
```
        E2E (~5%)          slow, whole-app-in-a-browser checks
     Integration (~15%)    pieces working together
   Unit tests (~80%)       tiny, fast checks of single functions
```
Most of your tests should be small and fast. A few should cover big user flows.

**The most useful beginner habit — "prove the bug."** When you hit a bug, first
write a test that fails *because of* the bug, then fix the code until the test
passes. Now that bug can never silently return.

**Good tests are readable.** In tests, clarity beats cleverness — it's fine to
repeat yourself so each test is obvious on its own.

---

## 9. Git, commits, and keeping changes small

**Git** is the tool that saves the history of your project so you can undo,
review, and collaborate. A **commit** is one saved snapshot with a message.

**Commit habits:**
- **Commit often, in small pieces.** Each commit should do *one thing*.
- **Don't mix concerns.** A cleanup (refactor) and a new feature are two
  separate commits — never combined.
- **Write messages that explain *why*, not just *what*:**
  ```
  feat: add email validation to signup

  Stops invalid emails reaching the database, using the same
  validation approach as the login form.
  ```
  Common prefixes: `feat` (feature), `fix` (bug fix), `refactor` (tidy-up, no
  behavior change), `test`, `docs`, `chore` (tooling/config).

**Size your changes:**
```
~100 lines   → great, easy to review
~300 lines   → OK if it's one logical change
~1000 lines  → too big, split it up
```
Small changes are easier to review, safer to ship, and easier to undo.

---

## 10. Reviewing code (the quality gate)

Before code gets merged, someone (or an AI) reviews it across five angles:

1. **Correctness** — does it actually do the right thing, including edge cases?
2. **Readability** — will someone understand this in six months?
3. **Architecture** — does it fit the rest of the system, or bolt on awkwardly?
4. **Security** — can it be abused? (see below)
5. **Performance** — is it fast enough? (measure, don't guess)

**Beginner takeaway:** the smaller and more focused a change is, the better the
review — which is another reason to keep changes ~100 lines.

---

## 11. Performance & security — the quick version

**Performance — measure first, then fix.** Never guess what's slow; use the
browser's dev tools to find the actual bottleneck, then fix it. The headline
targets ("Core Web Vitals") are roughly: page shows content in **under 2.5s**,
responds to clicks quickly, and doesn't visually jump around while loading.
Common wins: compress images, don't fetch more data than you show, and cache
repeated requests.

**Security — never trust input from outside.** Treat anything a user or another
system sends you as potentially hostile: validate it at the "front door," never
paste it straight into a database query or the page, and **never** put passwords
or API keys in your code (use environment variables/secrets). The industry
checklist for common web vulnerabilities is called the **OWASP Top 10**.

---

## Your starter checklist

Copy this into a new project:

- [ ] Create a rules file (`CLAUDE.md` / `AGENTS.md`) with stack, commands, conventions, boundaries.
- [ ] Write a short spec before building anything non-trivial.
- [ ] Colocate each component's files in its own folder.
- [ ] Only install a dependency when you actually need it.
- [ ] Keep components under ~200 lines; keep changes under ~100 lines.
- [ ] Use real HTML elements; make it keyboard-usable; handle loading/empty/error.
- [ ] Use your design system's spacing/colors — no one-off values.
- [ ] Write a failing test for every bug before fixing it.
- [ ] Commit small, one concern at a time, with a "why" message.
- [ ] Never commit secrets; validate all outside input.

---

## Glossary (jargon, decoded)

- **Component** — a reusable piece of UI (button, card, form).
- **State** — data that changes while the app runs (what's typed in a box, whether a menu is open).
- **Props** — the inputs you pass into a component.
- **Colocation** — keeping related files (code, test, types) together in one folder.
- **Dependency / package** — outside code you install and rely on.
- **Spec** — a short written description of what you're building and how you'll know it's done.
- **Rules file** — a project file (`CLAUDE.md`, `AGENTS.md`) telling an AI/teammate your conventions.
- **Refactor** — improving code's shape without changing what it does.
- **Test** — code that automatically checks your code behaves correctly.
- **Unit / integration / E2E test** — tiny single-function / several-pieces-together / whole-app-in-a-browser tests.
- **Commit** — one saved snapshot in git, with a message.
- **Accessibility (a11y)** — making the UI usable for everyone, including keyboard and screen-reader users.
- **Design system** — a fixed set of colors, spacing, and text styles used consistently.
- **Core Web Vitals** — Google's standard measurements of a page's loading speed and responsiveness.
- **OWASP Top 10** — the standard list of the most common web security vulnerabilities.

---

*Want to go deeper on any section? The full skills live in `.claude/skills/`
and the complete set is at
[github.com/addyosmani/agent-skills](https://github.com/addyosmani/agent-skills).*
