# CLOTHES THAT WORK — Industrial Intro Animation

This repo is set up to run as the main landing experience: a GSAP-driven canvas intro that reveals a storefront via a circular wipe. The original SEEDAfrique site has been moved to `seedafrique_backup/` and is gitignored.

## Stack
- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS 3
- GSAP 3 + @gsap/react
- Canvas 2D rendering

## Quick start (local)

### Prerequisites
- Node.js 18.18+ (or 20+ recommended)
- npm/yarn/pnpm

### Install & run
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### Build & start
```bash
npm run build
npm run start
```

## What runs here
- `/` renders `IndustrialExperience` (`components/industrial/industrial-experience.tsx`)
  - `IndustrialIntro` orchestrates the GSAP timeline + canvas renderer
  - `Storefront` is the revealed page underneath
- Canvas logic lives in `lib/industrial/` (scene, renderer, sketch, blueprints, etc.)
- All animation state lives on a single `IndustrialState` object mutated by GSAP

## Importing this intro into another Next.js project

To reuse the intro animation in a different project:

1. **Copy required files**
   Copy these directories/files:
   - `components/industrial/` (all)
   - `lib/industrial/` (all)
   - `app/globals.css` styles related to industrial/intro (see `.if-*` classes) or copy the relevant CSS
   - Assets/fonts if used (fonts loaded in layout)

2. **Install dependencies**
   ```bash
   npm i gsap @gsap/react
   ```

3. **Add styles**
   Ensure Tailwind is configured or copy the CSS classes used by `IndustrialIntro`/`Storefront`. The styles for `.if-intro`, `.if-store`, etc. are in `app/globals.css`.

4. **Use the component**
   ```tsx
   "use client";
   import IndustrialExperience from "./components/industrial/industrial-experience";

   export default function Page() {
     return <IndustrialExperience />;
   }
   ```

   Or use just the intro:
   ```tsx
   "use client";
   import { useState } from "react";
   import IndustrialIntro from "./components/industrial/industrial-intro";
   import YourStorefront from "./components/your-storefront";

   export default function IntroWrapper() {
     const [live, setLive] = useState(false);
     return (
       <>
         <YourStorefront live={live} />
         <IndustrialIntro onReveal={() => setLive(true)} onComplete={() => {}} />
       </>
     );
   }
   ```

5. **Fonts**
   The intro uses `Inter` (900) and `Space Mono`. Load them via Google Fonts or local fonts (see `app/layout.tsx`).

## Pulling on a different PC
```bash
git clone <repo-url>
cd <repo-folder>
npm install
npm run dev
```

## Notes
- The intro respects `prefers-reduced-motion` (skips animation).
- Press `Escape` or click `Skip` to exit early.
- The original SEEDAfrique files are in `seedafrique_backup/` (gitignored). Move them back if you want to restore that site.
