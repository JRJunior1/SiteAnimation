/* -------------------------------------------------------------------------- */
/*  Self-sketching industrial work-glove blueprint                            */
/*                                                                            */
/*  One palm-forward glove, shown as a clean specimen. Strokes only.          */
/*  Local origin sits above the cuff; the caller translates / scales.         */
/*  Sketch order: wrist straps → palm silhouette → fingers → palm matrix.     */
/* -------------------------------------------------------------------------- */

import { SketchPath, strokeSketch, windowRamp } from "./sketch";

const CYAN = "#38BDF8";
const ORANGE = "#FF5722";

/** Local bounds for the glove, exported for stage sizing. */
export const GLOVES_BOUNDS = {
  minX: -132,
  maxX: 112,
  minY: -205,
  maxY: 212,
} as const;

const path = (build: (p: SketchPath) => void) => {
  const p = new SketchPath();
  build(p);
  return p;
};

/* -------------------------------------------------------------------------- */
/*  The canonical left glove. Fingers point up, thumb on the outer left.      */
/* -------------------------------------------------------------------------- */

type GloveGeometry = {
  cuff: SketchPath;
  cuffInner: SketchPath;
  cuffV: SketchPath;
  wristBand: SketchPath;
  wristStitchTop: SketchPath;
  wristStitchBottom: SketchPath;
  adjuster: SketchPath;
  adjusterBar: SketchPath;
  strapTail: SketchPath;
  strapTab: SketchPath;
  palm: SketchPath;
  knuckleArc: SketchPath;
  thumb: SketchPath;
  fingers: { outline: SketchPath; inset: SketchPath }[];
  palmPanel: SketchPath;
  gripLines: SketchPath[];
  cuffSeams: SketchPath[];
  cuffHem: SketchPath;
  thumbInset: SketchPath;
  knuckleTicks: SketchPath;
};

/** Finger plan: centre x, half width, base y, tip y. */
const FINGER_PLAN = [
  { cx: -55, hw: 18, base: -64, tip: -167 },
  { cx: -13, hw: 19, base: -70, tip: -196 },
  { cx: 29, hw: 18, base: -68, tip: -183 },
  { cx: 65, hw: 14.5, base: -60, tip: -154 },
] as const;

const buildFinger = (cx: number, hw: number, base: number, tip: number) =>
  path((s) => {
    s.moveTo(cx - hw, base);
    s.bezierCurveTo(cx - hw - 1.2, base - 42, cx - hw - 2, tip + 28, cx - hw + 4, tip + 9);
    s.bezierCurveTo(cx - hw + 9, tip - 2, cx + hw - 9, tip - 2, cx + hw - 4, tip + 9);
    s.bezierCurveTo(cx + hw + 2, tip + 28, cx + hw + 1.2, base - 42, cx + hw, base);
  });

const buildFingerInset = (cx: number, hw: number, base: number, tip: number) =>
  path((s) => {
    // A parallel welt that follows the inside of the finger 4–5 px in.
    s.moveTo(cx - hw + 5, base);
    s.bezierCurveTo(cx - hw + 4, base - 42, cx - hw + 3, tip + 29, cx - hw + 7, tip + 13);
    s.bezierCurveTo(cx - hw + 11, tip + 4.5, cx + hw - 11, tip + 4.5, cx + hw - 7, tip + 13);
    s.bezierCurveTo(cx + hw - 3, tip + 29, cx + hw - 4, base - 42, cx + hw - 5, base);
  });

const GLOVE: GloveGeometry = (() => {
  // Gauntlet cuff. The outer bottom corner carries the angular slip-on slit.
  const cuff = path((s) => {
    s.moveTo(-82, 62);
    s.bezierCurveTo(-92, 92, -106, 132, -112, 168);
    s.lineTo(-118, 190);
    s.quadraticCurveTo(-120, 204, -106, 205);
    s.lineTo(94, 199);
    s.quadraticCurveTo(107, 198, 106, 185);
    s.bezierCurveTo(100, 150, 90, 100, 82, 62);
  });

  const cuffInner = path((s) => {
    s.moveTo(-76, 68);
    s.bezierCurveTo(-86, 96, -99, 133, -104, 166);
    s.lineTo(-108, 185);
    s.quadraticCurveTo(-109, 194, -100, 194.5);
    s.lineTo(88, 189);
    s.quadraticCurveTo(97, 188.5, 96, 180);
    s.bezierCurveTo(91, 148, 82, 103, 76, 68);
  });

  // Sharp V notch cut into the outer corner of the gauntlet.
  const cuffV = path((s) => {
    s.moveTo(-111, 168);
    s.lineTo(-84, 176);
    s.lineTo(-113, 188);
  });

  // Compression band across the wrist, with a rounded right edge.
  const wristBand = path((s) => {
    s.moveTo(-84, 16);
    s.lineTo(74, 16);
    s.quadraticCurveTo(84, 16, 85, 26);
    s.lineTo(85, 52);
    s.quadraticCurveTo(85, 61, 75, 61);
    s.lineTo(-84, 61);
    s.quadraticCurveTo(-89, 61, -89, 53);
    s.lineTo(-89, 24);
    s.quadraticCurveTo(-89, 16, -84, 16);
  });

  const wristStitchTop = path((s) => {
    s.moveTo(-80, 23);
    s.lineTo(73, 23);
    s.quadraticCurveTo(78, 23, 78, 28);
  });

  const wristStitchBottom = path((s) => {
    s.moveTo(-80, 54);
    s.lineTo(70, 54);
    s.quadraticCurveTo(77, 54, 78, 48);
  });

  // Nested hook-and-loop adjuster loop and its buckle bar.
  const adjuster = path((s) => {
    s.moveTo(34, 29);
    s.lineTo(63, 29);
    s.quadraticCurveTo(70, 29, 70, 37);
    s.lineTo(70, 43);
    s.quadraticCurveTo(70, 50, 63, 50);
    s.lineTo(34, 50);
    s.quadraticCurveTo(29, 50, 29, 44);
    s.lineTo(29, 35);
    s.quadraticCurveTo(29, 29, 34, 29);
  });

  const adjusterBar = path((s) => {
    s.moveTo(38, 33);
    s.lineTo(38, 46);
    s.moveTo(47, 33);
    s.lineTo(47, 46);
  });

  const strapTail = path((s) => {
    s.moveTo(70, 39);
    s.bezierCurveTo(80, 38, 88, 33, 93, 27);
  });

  const strapTab = path((s) => {
    s.moveTo(90, 24);
    s.lineTo(99, 20);
    s.lineTo(103, 31);
    s.lineTo(94, 35);
    s.closePath();
  });

  // The palm / back-of-hand silhouette. Open at the wrist.
  const palm = path((s) => {
    s.moveTo(-74, 20);
    s.bezierCurveTo(-80, -8, -84, -40, -78, -66);
    s.bezierCurveTo(-72, -82, -52, -86, -38, -79);
    s.bezierCurveTo(-26, -74, -14, -76, -2, -84);
    s.bezierCurveTo(12, -92, 34, -88, 48, -77);
    s.bezierCurveTo(62, -67, 74, -52, 76, -34);
    s.bezierCurveTo(80, -6, 78, 12, 72, 22);
  });

  // Heavy knuckle ridge running under the finger bases.
  const knuckleArc = path((s) => {
    s.moveTo(-76, -60);
    s.bezierCurveTo(-48, -72, -18, -78, 8, -80);
    s.bezierCurveTo(32, -82, 54, -72, 72, -58);
    s.moveTo(-72, -52);
    s.bezierCurveTo(-46, -63, -18, -69, 8, -71);
    s.bezierCurveTo(31, -73, 51, -64, 67, -51);
  });

  // Thumb: a thick curved cylinder off the outer palm.
  const thumb = path((s) => {
    s.moveTo(-70, 16);
    s.bezierCurveTo(-94, 4, -114, -20, -121, -44);
    s.bezierCurveTo(-127, -65, -109, -78, -97, -64);
    s.bezierCurveTo(-90, -56, -91, -35, -79, -19);
    s.bezierCurveTo(-75, -12, -71, 1, -70, 16);
  });

  const thumbInset = path((s) => {
    s.moveTo(-74, 10);
    s.bezierCurveTo(-94, -2, -108, -23, -113, -45);
    s.bezierCurveTo(-116, -57, -108, -64, -101, -58);
    s.bezierCurveTo(-96, -52, -96, -34, -85, -18);
  });

  const fingers = FINGER_PLAN.map((f) => ({
    outline: buildFinger(f.cx, f.hw, f.base, f.tip),
    inset: buildFingerInset(f.cx, f.hw, f.base, f.tip),
  }));

  // Dashed palm reinforcement sweeping from the knuckles to the thumb base.
  const palmPanel = path((s) => {
    s.moveTo(-63, -55);
    s.lineTo(48, -55);
    s.bezierCurveTo(58, -34, 59, -8, 47, 9);
    s.bezierCurveTo(26, 25, -8, 28, -31, 19);
    s.lineTo(-62, 2);
    s.lineTo(-70, -22);
    s.closePath();
  });

  // Grip rails inside the reinforcement matrix.
  const gripLines = [-36, -22, -8, 6].map((y, index) =>
    path((s) => {
      s.moveTo(-48 + index * 1.4, y);
      s.bezierCurveTo(-22, y - 4, 12, y - 4, 40 - index * 1.2, y + 2);
    }),
  );

  const cuffSeams = [-1, 1].map((side) =>
    path((s) => {
      const x = side < 0 ? -73 : 72;
      s.moveTo(x, 74);
      s.bezierCurveTo(x + side * -22, 108, x + side * -31, 150, x + side * -33, 183);
    }),
  );

  const cuffHem = path((s) => {
    s.moveTo(-101, 188);
    s.bezierCurveTo(-40, 194, 42, 192, 93, 186);
  });

  // Small orange stitch ticks bridging the knuckle ridge.
  const knuckleTicks = path((s) => {
    for (let i = 0; i < 7; i++) {
      const x = -66 + i * 22;
      const y = -63 - Math.sin((i / 6) * Math.PI) * 13;
      s.moveTo(x, y);
      s.lineTo(x + 3, y - 5);
    }
  });

  return {
    cuff,
    cuffInner,
    cuffV,
    wristBand,
    wristStitchTop,
    wristStitchBottom,
    adjuster,
    adjusterBar,
    strapTail,
    strapTab,
    palm,
    knuckleArc,
    thumb,
    fingers,
    palmPanel,
    gripLines,
    cuffSeams,
    cuffHem,
    thumbInset,
    knuckleTicks,
  };
})();

/* -------------------------------------------------------------------------- */
/*  One glove, plotted in the canonical orientation.                          */
/* -------------------------------------------------------------------------- */

const drawGlove = (ctx: CanvasRenderingContext2D, progress: number) => {
  const p = Math.max(0, Math.min(1, progress));
  const win = (start: number, end: number) => windowRamp(p, start, end);

  const solid = (
    value: SketchPath,
    amount: number,
    color = CYAN,
    width = 1.5,
    alpha = 1,
    glow = 4,
  ) =>
    strokeSketch(ctx, value, amount, {
      color,
      width,
      alpha,
      glow,
    });

  const stitch = (
    value: SketchPath,
    amount: number,
    color = ORANGE,
    width = 1,
    alpha = 0.68,
    dash: readonly [number, number] = [2, 3],
  ) =>
    strokeSketch(ctx, value, amount, {
      color,
      width,
      alpha,
      glow: 2,
      dash,
    });

  /* ---------------------------- wrist straps ---------------------------- */

  solid(GLOVE.cuff, win(0.0, 0.16), CYAN, 1.6, 0.95);
  solid(GLOVE.cuffInner, win(0.035, 0.18), CYAN, 1, 0.38);
  solid(GLOVE.wristBand, win(0.06, 0.19), CYAN, 1.7, 0.97);
  solid(GLOVE.adjuster, win(0.11, 0.22), ORANGE, 1.2, 0.85, 3);
  solid(GLOVE.adjusterBar, win(0.14, 0.23), ORANGE, 1, 0.65, 2);
  solid(GLOVE.strapTail, win(0.16, 0.24), ORANGE, 1.4, 0.85, 3);
  solid(GLOVE.strapTab, win(0.18, 0.25), ORANGE, 1.1, 0.7, 2);
  stitch(GLOVE.wristStitchTop, win(0.13, 0.23), ORANGE, 0.9, 0.6, [3, 3]);
  stitch(GLOVE.wristStitchBottom, win(0.15, 0.25), ORANGE, 0.9, 0.6, [3, 3]);

  /* --------------------------- palm silhouette -------------------------- */

  solid(GLOVE.palm, win(0.15, 0.32), CYAN, 1.5, 0.95);
  solid(GLOVE.knuckleArc, win(0.26, 0.36), CYAN, 1, 0.5);
  solid(GLOVE.thumb, win(0.2, 0.35), CYAN, 1.5, 0.94);

  /* ------------------------------- fingers ------------------------------ */

  GLOVE.fingers.forEach((finger, index) => {
    const start = 0.27 + index * 0.055;
    solid(finger.outline, win(start, start + 0.2), CYAN, 1.5, 0.97);
  });

  /* ------------------------- cuff construction -------------------------- */

  solid(GLOVE.cuffV, win(0.58, 0.67), CYAN, 1.3, 0.9);
  GLOVE.cuffSeams.forEach((seam, index) => {
    solid(seam, win(0.55 + index * 0.03, 0.7 + index * 0.03), CYAN, 1, 0.45);
  });
  stitch(GLOVE.cuffHem, win(0.62, 0.72), ORANGE, 0.9, 0.55, [2, 2]);

  /* ---------------------- palm reinforcement matrix --------------------- */

  stitch(GLOVE.palmPanel, win(0.68, 0.8), ORANGE, 1.1, 0.8, [4, 4]);
  GLOVE.gripLines.forEach((grip, index) => {
    stitch(grip, win(0.72 + index * 0.022, 0.83 + index * 0.02), ORANGE, 0.85, 0.5, [2, 3]);
  });

  /* ---------------------- final micro-stitch pass ----------------------- */

  GLOVE.fingers.forEach((finger, index) => {
    const start = 0.76 + index * 0.038;
    stitch(finger.inset, win(start, start + 0.14), ORANGE, 0.9, 0.62, [2, 3]);
  });
  stitch(GLOVE.thumbInset, win(0.8, 0.92), ORANGE, 0.9, 0.6, [2, 3]);
  stitch(GLOVE.knuckleTicks, win(0.84, 0.96), ORANGE, 0.9, 0.62, [2, 2]);
};

/* -------------------------------------------------------------------------- */
/*  One glove, plotted as the specimen.                                       */
/* -------------------------------------------------------------------------- */

/**
 * Draw a single work glove.
 *
 * @param ctx      2D context already positioned at the glove's local origin
 * @param progress 0 = empty, 1 = fully plotted
 */
export function drawGloves(ctx: CanvasRenderingContext2D, progress: number): void {
  const p = Math.max(0, Math.min(1, progress));
  if (p <= 0.001) return;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  drawGlove(ctx, p);
  ctx.restore();
}
