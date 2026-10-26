import { PALETTE, SANS, clamp, type SceneContext } from "./types";

/* -------------------------------------------------------------------------- */
/*  The quiet stage: a faint plotting grid and one oversized statement.        */
/* -------------------------------------------------------------------------- */

/**
 * The grid is static screen furniture, so it is baked into an offscreen canvas
 * once per resize and blitted every frame. No axes, reticles or vignette —
 * just enough texture to keep the dark stage from reading as a flat rectangle.
 */
export const buildGrid = (w: number, h: number, dpr: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const minor = 48;
  const major = minor * 5;

  ctx.strokeStyle = PALETTE.grid;
  ctx.lineWidth = 0.5;

  ctx.globalAlpha = 0.34;
  ctx.beginPath();
  for (let x = 0; x <= w; x += minor) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = 0; y <= h; y += minor) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();

  ctx.globalAlpha = 0.58;
  ctx.beginPath();
  for (let x = 0; x <= w; x += major) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = 0; y <= h; y += major) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();

  return canvas;
};

const PHRASE_WIDE = ["PRECISION MEETS", "COMFORT,"];
const PHRASE_NARROW = ["PRECISION", "MEETS", "COMFORT,"];

/**
 * The statement is drawn as one block. On wide screens it breaks over two
 * oversized lines; on narrow screens it stacks into three so the type stays
 * large without clipping. The block sweeps horizontally like the SEEDAfrique
 * chapter words: in from the right, a long hold, then off the left edge.
 */
const drawPhrase = (scene: SceneContext, alpha: number) => {
  const { ctx, w, h } = scene;
  if (alpha <= 0 || alpha >= 1) return;

  const lines = w < 860 || w / h < 1.05 ? PHRASE_NARROW : PHRASE_WIDE;
  const entering = clamp(alpha / 0.3);
  const leaving = clamp((alpha - 0.75) / 0.25);
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
  const easeIn = (t: number) => t * t * t;

  const x =
    w / 2 +
    (1 - easeOut(entering)) * w * 0.9 -
    easeIn(leaving) * w * 0.9 +
    (0.5 - alpha) * w * 0.14;

  // Start from a generous size, then fit the whole block to the stage.
  let size = Math.min(0.24 * w, 0.26 * h);
  ctx.save();
  ctx.font = `900 ${size}px ${SANS}`;

  const widest = lines.reduce(
    (max, line) => Math.max(max, ctx.measureText(line).width),
    1,
  );
  const lineHeight = 0.88;
  const fitWidth = (0.9 * w) / widest;
  const fitHeight = (0.5 * h) / (size * lineHeight * lines.length);
  size *= Math.min(1, fitWidth, fitHeight);

  ctx.restore();

  ctx.save();
  ctx.translate(x, h * 0.5);
  ctx.transform(
    1,
    0,
    -0.38 * (1 - 0.85 * easeOut(entering) + easeIn(leaving)),
    1,
    0,
    0,
  );
  ctx.font = `900 ${size}px ${SANS}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.globalAlpha = 1 - leaving;

  const rowHeight = size * lineHeight;
  const firstY = -((lines.length - 1) * rowHeight) / 2;

  lines.forEach((line, index) => {
    const y = firstY + index * rowHeight;
    ctx.fillStyle = "rgba(255,255,255,0.025)";
    ctx.fillText(line, 0, y);

    ctx.lineWidth = Math.max(1, 0.18 * (Math.min(w, h) / 100));
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.strokeText(line, 0, y);
  });

  ctx.restore();
};

/** One statement holds behind the whole specimen sequence. */
export const drawWords = (scene: SceneContext) => {
  drawPhrase(scene, scene.state.wordPhrase);
};
