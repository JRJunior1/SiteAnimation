# SEEDAfrique — Stories preview

A Next.js 15 (App Router) + Tailwind recreation of the SEEDAfrique site pieces: the
GSAP canvas intro, the stories grid, and the surrounding page chrome.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build
npm run start
```

> Stop `npm run dev` before running `npm run build`. Both write to `.next`, and
> building while dev is running can leave the dev server serving HTML that points
> at CSS/JS chunks which no longer exist (the page then appears unstyled).

## What's here

| Area | File |
| --- | --- |
| Load intro (GSAP + canvas) | `components/intro.tsx` |
| Site layout, intro stage, footer | `app/layout.tsx` |
| Stories section + filters | `components/blog-stories.tsx` |
| Story cards / meta / author | `components/story-card.tsx`, `components/post-meta.tsx`, `components/author-badge.tsx` |
| Hero with count-up + scribble | `components/hero.tsx`, `components/ui/count-up.tsx`, `components/ui/scribble.tsx` |
| Back to top / replay intro | `components/back-to-top.tsx`, `components/replay-intro.tsx` |
| Post data | `lib/posts.ts` |
| Theme + intro CSS vars | `app/globals.css`, `tailwind.config.ts` |

## The intro

`components/intro.tsx` runs a fixed overlay on first paint:

1. Orange dot drops, then the RUN / THINK / EXPLORE words slide past.
2. Lanes flatten into a projectile scene — parabola, angle, velocity vector, apex.
3. The dot lands, throws particles, and the scene collapses into a wireframe globe.
4. Africa is plotted dot-by-dot; arcs animate to Accra, Kigali, and Nairobi.
5. The globe zooms in on Accra and a `clip-path` circle wipes the page in.

It also:

- Waits for fonts, above-the-fold images, and `window.load` before exiting (9s failsafe).
- Prefetches the routes in `lib/site.ts` while it plays.
- Can be skipped with the **Skip** button or `Esc`.
- Honors `prefers-reduced-motion` with a plain fade.
- Writes `sa-intro-seen` to `sessionStorage`, and replays from the footer via
  `INTRO_REPLAY_EVENT`.

To change which routes get prefetched, edit `SITE_ROUTES` in `lib/site.ts`.

## Industrial workwear experience — `/industrial`

`/industrial` is a standalone FORGE+FIELD storefront with its own single-canvas
intro. It does not touch the SEEDAfrique intro or page: `components/site-chrome.tsx`
skips the SEEDAfrique chrome on this route. The storefront is always mounted
underneath the canvas; the intro dissolves to it at the end.

The intro draws everything into one high-DPI canvas from a single GSAP-driven state
object (no DOM for moving intro elements). Four specimens share one carousel, and
each hands off to the next with an in-place crossfade:

1. **Statement** — “Precision meets comfort,” sweeps in and clears before the first
   specimen starts.
2. **Footing** — a safety boot sketches itself at center stage.
3. **Reflector** — a high-visibility work shirt with reflective body and sleeve
   bands plots over the grid.
4. **Extremities** — a single work glove plots itself, then clears.
5. **Head** — a hard-hat blueprint closes the sequence.

The intro runs the same ~6.35s pre-exit beat as the SEEDAfrique intro, then the
same circular reveal hands off to the storefront.

Key files:

| Area | File |
| --- | --- |
| Route / metadata / scoped CSS | `app/industrial/page.tsx`, `app/industrial/layout.tsx`, `app/industrial/industrial.css` |
| React intro + GSAP timeline | `components/industrial/industrial-intro.tsx` |
| Live storefront + replay | `components/industrial/storefront.tsx`, `components/industrial/industrial-experience.tsx` |
| Canvas render loop | `lib/industrial/scene.ts` |
| Specimen modules | `lib/industrial/foundation.ts`, `reflector.ts`, `gloves-blueprint.ts`, `helmet-blueprint.ts`, `extremities.ts`, `headgear.ts` |
| Stage grid + statement | `lib/industrial/stage.ts` |
| HUD / palette / shared types | `lib/industrial/hud.ts`, `lib/industrial/types.ts` |

The intro can be skipped with the **Skip** button or `Esc`; the footer's
**REPLAY INTRO** button remounts it. `prefers-reduced-motion` users go straight to
the storefront. Resizing rebuilds the canvas and cached grid without resetting
timeline progress.

## Preview pages

`/about`, `/gallery`, `/upcomingevents`, `/contacts`, `/educationaltravels`, `/joinus`,
`/blog`, and `/blog/[slug]` are lightweight stand-ins so every link resolves. They are
built with `components/page-shell.tsx`; replace them with real content as needed.

## Notes

- Colors live in `tailwind.config.ts` under the `sa-*` palette.
- `SmartImage` wraps `next/image` and renders a warm gradient placeholder until the
  remote Unsplash image loads.
- The intro reads `--font-figtree`, `--font-hand-fallback`, and `--color-sa-cream`
  from CSS variables defined in `app/globals.css`.
