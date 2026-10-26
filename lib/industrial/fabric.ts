import { PALETTE, clamp, type Pt, type SceneContext } from "./types";
import { line, partialLine } from "./draw";

/* -------------------------------------------------------------------------- */
/*  Specimen 02 — a ripstop shell drawn as a flat technical sketch.            */
/* -------------------------------------------------------------------------- */

const SUIT_OUTLINE: Pt[] = [
  [-18, -352],
  [-42, -338],
  [-62, -314],
  [-56, -276],
  [-48, -220],
  [-44, -166],
  [-50, -132],
  [-56, -106],
  [-50, -84],
  [-44, -52],
  [-40, -14],
  [-36, -2],
  [-14, -2],
  [-10, -42],
  [-7, -96],
  [0, -104],
  [7, -96],
  [10, -42],
  [14, -2],
  [36, -2],
  [40, -14],
  [44, -52],
  [50, -84],
  [56, -106],
  [50, -132],
  [44, -166],
  [48, -220],
  [56, -276],
  [62, -314],
  [42, -338],
  [18, -352],
  [0, -330],
];

const LEFT_ARM: Pt[] = [
  [-62, -314],
  [-80, -280],
  [-88, -236],
  [-90, -192],
  [-84, -148],
  [-78, -124],
  [-64, -126],
  [-68, -168],
  [-68, -208],
  [-60, -252],
  [-50, -292],
];

const RIGHT_ARM: Pt[] = LEFT_ARM.map(([x, y]) => [-x, y] as Pt);

const SEAMS: readonly Pt[][] = [
  [
    [-52, -124],
    [-48, -92],
    [-44, -56],
    [-40, -18],
    [-38, -4],
  ],
  [
    [-8, -102],
    [-8, -56],
    [-10, -20],
    [-11, -5],
  ],
  [
    [-48, -56],
    [-34, -50],
    [-20, -53],
    [-12, -50],
  ],
  [
    [-40, -16],
    [-13, -17],
  ],
  [
    [52, -124],
    [48, -92],
    [44, -56],
    [40, -18],
    [38, -4],
  ],
  [
    [8, -102],
    [8, -56],
    [10, -20],
    [11, -5],
  ],
  [
    [48, -56],
    [34, -50],
    [20, -53],
    [12, -50],
  ],
  [
    [40, -16],
    [13, -17],
  ],
];

const POCKETS: readonly Pt[][] = [
  [
    [-38, -268],
    [-16, -268],
    [-16, -236],
    [-38, -236],
    [-38, -268],
  ],
  [
    [16, -268],
    [38, -268],
    [38, -236],
    [16, -236],
    [16, -268],
  ],
];

const WAIST: Pt[] = [
  [-45, -160],
  [45, -160],
];

const SUIT_W = 180;
const SUIT_H = 350;
const SUIT_MID_Y = -177;

const suitFit = (w: number, h: number) =>
  Math.min((w - 56) / SUIT_W, (h - 120) / SUIT_H, 1.9);

const drawSuit = (scene: SceneContext, u: number) => {
  const { ctx, state } = scene;
  const p = state.suit;
  if (p <= 0.01) return;

  const w = 1.5 * u;

  // Outline first, then the flat-sketch construction lines.
  partialLine(ctx, SUIT_OUTLINE, clamp(p / 0.72), {
    color: PALETTE.cyan,
    width: w,
    alpha: 0.95,
    close: true,
  });
  partialLine(ctx, LEFT_ARM, clamp((p - 0.22) / 0.55), {
    color: PALETTE.cyan,
    width: w * 0.82,
    alpha: 0.82,
    close: true,
  });
  partialLine(ctx, RIGHT_ARM, clamp((p - 0.3) / 0.55), {
    color: PALETTE.cyan,
    width: w * 0.82,
    alpha: 0.82,
    close: true,
  });

  // Collar band.
  partialLine(
    ctx,
    [
      [-18, -352],
      [0, -330],
      [18, -352],
    ],
    clamp((p - 0.38) / 0.45),
    { color: PALETTE.cyan, width: w * 0.85, alpha: 0.88 },
  );
  partialLine(
    ctx,
    [
      [-22, -346],
      [0, -322],
      [22, -346],
    ],
    clamp((p - 0.42) / 0.45),
    { color: PALETTE.cyan, width: w * 0.45, alpha: 0.52 },
  );

  // Seams.
  SEAMS.forEach((seam, index) => {
    partialLine(ctx, seam, clamp((p - 0.6 - index * 0.018) / 0.3), {
      color: PALETTE.cyan,
      width: w * 0.42,
      alpha: 0.38,
      dash: [2.5 * u, 2.5 * u],
    });
  });

  // Centre zipper.
  const zipProgress = clamp((p - 0.55) / 0.4);
  partialLine(
    ctx,
    [
      [0, -330],
      [0, -162],
    ],
    zipProgress,
    { color: PALETTE.orange, width: w * 0.5, alpha: 0.78 },
  );

  if (zipProgress > 0.2) {
    for (let i = 0; i < 15; i++) {
      const y = -326 + i * 10.4;
      if (y > -330 + 168 * zipProgress) break;
      line(
        ctx,
        [
          [-2.2, y],
          [2.2, y],
        ],
        {
          color: PALETTE.orange,
          width: w * 0.34,
          alpha: 0.5 * zipProgress,
        },
      );
    }
  }

  // Chest pockets.
  POCKETS.forEach((pocket, index) => {
    partialLine(ctx, pocket, clamp((p - 0.68 - index * 0.05) / 0.25), {
      color: PALETTE.cyan,
      width: w * 0.48,
      alpha: 0.56,
    });
    partialLine(
      ctx,
      [
        [pocket[0][0], pocket[0][1] - 5],
        [pocket[1][0], pocket[1][1] - 5],
      ],
      clamp((p - 0.84) / 0.16),
      { color: PALETTE.cyan, width: w * 0.38, alpha: 0.42 },
    );
  });

  partialLine(ctx, WAIST, clamp((p - 0.78) / 0.22), {
    color: PALETTE.cyan,
    width: w * 0.48,
    alpha: 0.5,
  });

  // Cuffs.
  [-1, 1].forEach((side) => {
    line(
      ctx,
      [
        [side * 78, -132],
        [side * 65, -134],
      ],
      {
        color: PALETTE.cyan,
        width: w * 0.55,
        alpha: 0.56 * p,
      },
    );
    line(
      ctx,
      [
        [side * 39, -10],
        [side * 13, -11],
      ],
      {
        color: PALETTE.cyan,
        width: w * 0.55,
        alpha: 0.56 * p,
      },
    );
  });
};

export const drawFabric = (scene: SceneContext) => {
  const { ctx, state, w, h } = scene;
  const alpha = clamp(state.suitAlpha);
  if (alpha <= 0.001) return;

  const fit = suitFit(w, h);
  const rise = (1 - alpha) * 22;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(w / 2, h * 0.5 - SUIT_MID_Y * fit + rise);
  ctx.scale(fit, fit);
  drawSuit(scene, 1 / fit);
  ctx.restore();
};
