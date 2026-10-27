import { PALETTE, SANS, clamp, lerp, type SceneContext } from "./types";

/* -------------------------------------------------------------------------- */
/*  The quiet stage: a faint plotting grid, lane bloom and kinetic words.      */
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

/* -------------------------------------------------------------------------- */
/*  Lane bloom                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Nine lanes bloom out of the vanishing point, stream at speed, then flatten
 * onto the floor of the stage. This is the same opening move as the SEEDAfrique
 * intro — it is what turns a dark rectangle into a space with a floor.
 */
export const drawLanes = (scene: SceneContext) => {
  const { ctx, state, w, h, unit } = scene;
  const grow = clamp(state.lanes);
  if (grow <= 0.001) return;

  const top = { x: w / 2, y: 0.36 * h };
  const baseline = 0.78 * h;
  const spacing = 0.19 * Math.max(w, 1.2 * h);
  const flat = clamp(state.flat);

  // Let the lanes keep drawing after the flatten, but pull them right back so
  // the nine overlapping strokes settle into one quiet horizon line.
  const lineAlpha = (1 - 0.86 * flat) * grow;
  const phase = (scene.clock * (0.25 + state.speed * 1.35)) % 1;

  ctx.save();
  ctx.lineCap = "round";

  for (let i = 0; i < 9; i++) {
    const laneX = w / 2 + (i - 4) * spacing;
    const start = {
      x: lerp(top.x, 0, flat),
      y: lerp(top.y, baseline, flat),
    };
    const end = {
      x: lerp(laneX, w, flat),
      y: lerp(1.05 * h, baseline, flat),
    };
    const tip = {
      x: lerp(start.x, end.x, grow),
      y: lerp(start.y, end.y, grow),
    };
    const edge = i === 0 || i === 8;

    ctx.globalAlpha = lineAlpha * (edge ? 0.5 : 0.24);
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 0.16 * unit;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.stroke();

    // Comet streaks inside the lanes while they are still spread.
    if (flat < 0.999 && i < 8) {
      const innerLaneX = w / 2 + (i + 0.5 - 4) * spacing;

      for (let k = 0; k < 8; k++) {
        const head = Math.pow((phase + k / 8) % 1, 2.2);
        const tail = Math.min(
          1,
          head + 0.08 * (0.2 + head) * (0.4 + 0.6 * state.speed),
        );
        if (tail > grow) continue;

        ctx.globalAlpha =
          lineAlpha * (1 - flat) * (1 - head) * (edge ? 0.5 : 0.7);
        ctx.strokeStyle = i % 3 === 1 ? PALETTE.orange : "rgba(226,232,240,0.85)";
        ctx.lineWidth = unit * (0.08 + 0.5 * head);
        ctx.beginPath();
        ctx.moveTo(
          lerp(top.x, innerLaneX, head),
          lerp(top.y, 1.05 * h, head),
        );
        ctx.lineTo(
          lerp(top.x, innerLaneX, tail),
          lerp(top.y, 1.05 * h, tail),
        );
        ctx.stroke();
      }
    }
  }

  ctx.restore();
};

/* -------------------------------------------------------------------------- */
/*  Stage statement                                                            */
/* -------------------------------------------------------------------------- */

const PHRASE_WIDE = ["PRECISION MEETS", "COMFORT,"];
const PHRASE_NARROW = ["PRECISION", "MEETS", "COMFORT,"];

/**
 * The statement is drawn as one block. On wide screens it breaks over two
 * oversized lines; on narrow screens it stacks into three so the type stays
 * large without clipping. The block sweeps horizontally like the SEEDAfrique
 * chapter words: in from the right, a brief hold, then off the left edge.
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

/** The opening statement clears before the specimen sequence starts. */
export const drawWords = (scene: SceneContext) => {
  drawPhrase(scene, scene.state.wordPhrase);
};
