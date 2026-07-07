# FrontForge

**Build. Think. Ship. Get Hired.**

A production-grade, content-driven platform for learning React and JavaScript through building. Every lesson, quiz, challenge and resource is rendered dynamically from JSON — the application itself is a demonstration of senior-level frontend engineering.

## Tech Stack

React 19 · TypeScript (strict) · Vite · React Router 7 · Redux Toolkit · Tailwind CSS v4 · React Hook Form · Zod · Framer Motion · React Markdown · Shiki · Lucide Icons · Fuse.js · Recharts · React Error Boundary

No component libraries (MUI/Chakra/Bootstrap) — every UI element is custom-built as part of the in-house design system.

## Getting Started

```bash
npm install
npm run dev
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint the codebase with ESLint |
| `npm run format` | Format source files with Prettier |
| `npm run typecheck` | Run the TypeScript compiler in project-reference mode |

## Architecture

FrontForge is built content-first: **the React application never hardcodes a lesson, day, or piece of content.** Everything under `src/content/dayNN/*.json` is discovered and validated automatically — adding `day50` requires zero code changes.

```
Pages (thin, route-level)
  → Features (business capabilities, one folder each)
    → Content Engine (Zod schemas + block/question registries)
      → Repositories (data access abstraction)
        → Services (StorageAdapter: localStorage today, swappable later)
```

Key architectural decisions:

- **Repository pattern** — pages/features never `import` JSON directly; they call a repository (`content.repository.ts`) that validates and caches it.
- **Registry-driven rendering** — the Lesson Viewer and Quiz Engine render block/question types via a lookup registry, so adding a new type is additive (Open/Closed Principle), never a change to the renderer itself.
- **Storage Adapter** — all persistence goes through a `StorageAdapter` interface (`services/storage`). Swapping `localStorage` for IndexedDB or a real backend later touches one file.
- **Design tokens as CSS variables** — colors, radii, spacing and shadows live in `src/theme/tokens.css` and are mapped into Tailwind via `@theme inline`. Light/dark themes are two variable sets swapped via `data-theme` — no component ever hardcodes a color.
- **Feature-based structure** — see `src/features/*`, each with its own `components/`, `hooks/`, and `store/` (Redux slice) as needed.

See `src/**` for the full folder layout; every top-level directory under `src/` has a single, documented responsibility.

## Project Status

This project is being delivered milestone by milestone. Current status:

- [x] **Milestone 1** — Scaffolding, tooling, design tokens, theming, routing shell, base layout
- [x] **Milestone 2** — Full design system (forms, tabs, accordion, tooltip, dropdown, modal, context menu, command palette, ...)
- [ ] Milestone 3 — Content Engine core (schemas, repository, sample content, dev tools)
- [ ] Milestone 4 — Lesson Viewer rendering engine
- [ ] Milestone 5 — Quiz Engine
- [ ] Milestone 6 — Progress, XP, streaks, achievements
- [ ] Milestone 7 — Notes
- [ ] Milestone 8 — Bookmarks, Resources, Roadmap, Projects, Challenges
- [ ] Milestone 9 — Global search
- [ ] Milestone 10 — Accessibility & performance polish
