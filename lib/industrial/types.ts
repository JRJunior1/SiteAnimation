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

  /** One oversized statement — 0 → 1 sweeps across the stage. */
  wordPhrase: number;

  /* Specimen 01 — boot */
  bootAlpha: number;
  bootSketch: number;

  /* Specimen 02 — shell */
  suitAlpha: number;
  suit: number;

  /* Specimen 03 — load rig */
  rigAlpha: number;
  rig: number;

  /* Specimen 04 — gloves */
  glovesAlpha: number;
  gloves: number;

  /* Specimen 05 — helmet */
  helmetAlpha: number;
  helmet: number;
};

export const initialIndustrialState = (): IndustrialState => ({
  grid: 0,
  progress: 0,

  wordPhrase: 0,

  bootAlpha: 0,
  bootSketch: 0,

  suitAlpha: 0,
  suit: 0,

  rigAlpha: 0,
  rig: 0,

  glovesAlpha: 0,
  gloves: 0,

  helmetAlpha: 0,
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
