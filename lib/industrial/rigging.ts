import { PALETTE, clamp, type Pt, type SceneContext } from "./types";
import { circle, line, partialLine } from "./draw";

/* -------------------------------------------------------------------------- */
/*  Specimen 03 — the full-body load rig, drawn front-on as a standalone       */
/*  object: shoulder webbing, chest strap, side webbing, waist belt, belay     */
/*  loop and leg loops. No body outline required.                              */
/* -------------------------------------------------------------------------- */

const SHOULDER_L: Pt[] = [
  [-58, -334],
  [-57, -300],
  [-55, -272],
  [-54, -248],
];

const SHOULDER_R: Pt[] = SHOULDER_L.map(([x, y]) => [-x, y] as Pt);

const CHEST_STRAP: Pt[] = [
  [-54, -248],
  [54, -248],
];

const SIDE_L: Pt[] = [
  [-54, -248],
  [-64, -220],
  [-80, -184],
  [-98, -160],
];

const SIDE_R: Pt[] = SIDE_L.map(([x, y]) => [-x, y] as Pt);

const CENTRE_STRAP: Pt[] = [
  [0, -248],
  [0, -160],
];

const BELT: Pt[] = [
  [-104, -160],
  [104, -160],
  [104, -128],
  [-104, -128],
  [-104, -160],
];

const BELT_SEAM: Pt[] = [
  [-104, -145],
  [104, -145],
];

const LEG_LOOP_L: Pt[] = [
  [-92, -128],
  [-78, -120],
  [-74, -98],
  [-78, -58],
  [-88, -34],
  [-99, -44],
  [-102, -74],
  [-100, -104],
  [-92, -128],
];

const LEG_LOOP_R: Pt[] = LEG_LOOP_L.map(([x, y]) => [-x, y] as Pt);

const D_RINGS: Pt[] = [
  [-58, -336],
  [58, -336],
];

const RIG_W = 208;
const RIG_H = 314;
const RIG_MID_Y = -186;

const rigFit = (w: number, h: number) =>
  Math.min((w - 56) / RIG_W, (h - 140) / RIG_H, 2);

const drawHardware = (scene: SceneContext, u: number, amount: number) => {
  const { ctx } = scene;

  // D-rings at the shoulders.
  D_RINGS.forEach(([x, y], index) => {
    circle(ctx, x, y, 6.5, {
      color: PALETTE.orange,
      width: 1.6 * u,
      alpha: amount,
    });
    circle(ctx, x, y, 2, {
      color: PALETTE.volt,
      width: 0.7 * u,
      alpha: amount * (0.8 + index * 0.1),
    });
  });

  // Chest buckle.
  line(
    ctx,
    [
      [-10, -256],
      [10, -256],
      [10, -240],
      [-10, -240],
      [-10, -256],
    ],
    { color: PALETTE.cyan, width: 0.9 * u, alpha: amount * 0.9 },
  );
  line(
    ctx,
    [
      [-4, -248],
      [4, -248],
    ],
    { color: PALETTE.volt, width: 1.2 * u, alpha: amount },
  );

  // Waist buckle.
  line(
    ctx,
    [
      [-14, -150],
      [14, -150],
      [14, -138],
      [-14, -138],
      [-14, -150],
    ],
    { color: PALETTE.cyan, width: 0.9 * u, alpha: amount * 0.9 },
  );
  line(
    ctx,
    [
      [-6, -144],
      [6, -144],
    ],
    { color: PALETTE.volt, width: 1.2 * u, alpha: amount },
  );

  // Gear loops along the belt.
  [-72, -36, 36, 72].forEach((x) => {
    line(
      ctx,
      [
        [x - 3, -128],
        [x - 3, -120],
        [x + 3, -120],
        [x + 3, -128],
      ],
      { color: PALETTE.volt, width: 0.9 * u, alpha: amount * 0.7 },
    );
  });

  // Centre belay loop and carabiner.
  line(
    ctx,
    [
      [-5, -128],
      [-7, -112],
      [0, -98],
      [7, -112],
      [5, -128],
    ],
    { color: PALETTE.orange, width: 1.4 * u, alpha: amount * 0.9 },
  );
  circle(ctx, 0, -112, 4.5, {
    color: PALETTE.cyan,
    width: 1 * u,
    alpha: amount,
  });
};

const drawRig = (scene: SceneContext, u: number) => {
  const { ctx, state } = scene;
  const amount = clamp(state.rig);
  if (amount <= 0.01) return;

  const strap = {
    color: PALETTE.orange,
    width: 2 * u,
    alpha: 0.88 * amount,
  };

  partialLine(ctx, SHOULDER_L, clamp(amount * 1.35), strap);
  partialLine(ctx, SHOULDER_R, clamp(amount * 1.4 - 0.08), strap);
  partialLine(ctx, CHEST_STRAP, clamp(amount * 1.9 - 0.52), {
    color: PALETTE.cyan,
    width: 1.5 * u,
    alpha: 0.78 * amount,
  });
  partialLine(ctx, SIDE_L, clamp(amount * 1.55 - 0.3), {
    color: PALETTE.orange,
    width: 1.8 * u,
    alpha: 0.74 * amount,
  });
  partialLine(ctx, SIDE_R, clamp(amount * 1.55 - 0.36), {
    color: PALETTE.orange,
    width: 1.8 * u,
    alpha: 0.74 * amount,
  });
  partialLine(ctx, CENTRE_STRAP, clamp(amount * 1.6 - 0.42), {
    color: PALETTE.orange,
    width: 1.3 * u,
    alpha: 0.7 * amount,
  });

  // Belt and its stitched centre line.
  partialLine(ctx, BELT, clamp(amount * 1.7 - 0.62), {
    color: PALETTE.orange,
    width: 1.6 * u,
    alpha: 0.9 * amount,
    close: true,
  });
  partialLine(ctx, BELT_SEAM, clamp(amount * 1.8 - 0.7), {
    color: PALETTE.orange,
    width: 0.5 * u,
    alpha: 0.46 * amount,
    dash: [3 * u, 3 * u],
  });

  // Leg loops.
  partialLine(ctx, LEG_LOOP_L, clamp(amount * 1.65 - 0.58), {
    color: PALETTE.orange,
    width: 1.8 * u,
    alpha: 0.8 * amount,
    close: true,
  });
  partialLine(ctx, LEG_LOOP_R, clamp(amount * 1.65 - 0.64), {
    color: PALETTE.orange,
    width: 1.8 * u,
    alpha: 0.8 * amount,
    close: true,
  });

  // Stitch detail on the chest webbing.
  if (amount > 0.5) {
    const stitchAlpha = clamp((amount - 0.5) / 0.5);
    line(
      ctx,
      CHEST_STRAP.map(([x, y]) => [x, y - 2.5] as Pt),
      {
        color: PALETTE.orange,
        width: 0.45 * u,
        alpha: 0.42 * stitchAlpha,
        dash: [2.5 * u, 2.5 * u],
      },
    );
  }

  if (amount > 0.48) {
    drawHardware(scene, u, clamp((amount - 0.44) / 0.36));
  }
};

export const drawRigging = (scene: SceneContext) => {
  const { ctx, state, w, h } = scene;
  const alpha = clamp(state.rigAlpha);
  if (alpha <= 0.001) return;

  const fit = rigFit(w, h);
  const rise = (1 - alpha) * 24;
  const u = 1 / fit;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(w / 2, h * 0.5 - RIG_MID_Y * fit + rise);
  ctx.scale(fit, fit);
  drawRig(scene, u);
  ctx.restore();
};
