/* -------------------------------------------------------------------------- */
/*  Industrial intro — shared types, palette and layout helpers               */
/* -------------------------------------------------------------------------- */

/**
 * Every animated value in the intro lives on this single object. The canvas
 * render loop only reads it; GSAP only writes to it.
 */
export type IndustrialState = {
  /** Backdrop grid fade-in. */
  grid: number;
  /** Master timeline progress, 0 → 1. Drives the DOM progress bar. */
  progress: number;
  /** Gates the specimen stage after the opening dot + lanes. */
  stageIn: number;

  /**
   * Carousel position across the four specimens (0 = boot, 3 = helmet).
   * Fractional values crossfade two specimens in place as the next one plots.
   */
  focus: number;

  /* Opening dot + lane scene. */
  dot: number;
  pulse: number;
  ring: number;
  lanes: number;
  speed: number;
  flat: number;

  /* Transition energy. */
  shake: number;

  /** Camera zoom used for the final dive into the last specimen. */
  zoom: number;

  /** One oversized statement — 0 → 1 sweeps across the stage. */
  wordPhrase: number;

  /* Specimen plot progress. */
  bootSketch: number;
  reflector: number;
  gloves: number;
  helmet: number;
};

export const initialIndustrialState = (): IndustrialState => ({
  grid: 0,
  progress: 0,
  stageIn: 0,
  focus: 0,

  dot: 0,
  pulse: 0,
  ring: 0,
  lanes: 0,
  speed: 0,
  flat: 0,

  shake: 0,
  zoom: 1,

  wordPhrase: 0,

  bootSketch: 0,
  reflector: 0,
  gloves: 0,
  helmet: 0,
});

/** The working palette. Kept in one place so canvas + CSS stay in sync. */
export const PALETTE = {
  bg: "#0F172A",
  grid: "#1E293B",
  cyan: "#38BDF8",
  orange: "#FF5722",
  volt: "#CCFF00",
  ink: "#E2E8F0",
  dim: "#94A3B8",
  panel: "rgba(8, 15, 30, 0.82)",
} as const;

/** Space Mono is loaded by app/layout.tsx. */
export const MONO =
  '"Space Mono", "JetBrains Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, monospace';

/** Inter 900 draws the oversized chapter words. */
export const SANS = 'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif';

export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export const lerp = (from: number, to: number, t: number) =>
  from + (to - from) * t;

/** Smooth 0–1 ramp. */
export const ramp = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

/** A deterministic pseudo-random in [0,1). */
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
};

export type Pt = readonly [number, number];

export type SceneContext = {
  ctx: CanvasRenderingContext2D;
  state: IndustrialState;
  w: number;
  h: number;
  /** 1 = one percent of the viewport's shortest side. */
  unit: number;
  /** Seconds since the canvas mounted. */
  now: number;
  clock: number;
};
