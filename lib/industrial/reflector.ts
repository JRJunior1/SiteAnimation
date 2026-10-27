import { line, text } from "./draw";
import { SketchPath, strokeSketch, windowRamp } from "./sketch";
import { PALETTE, clamp, type SceneContext } from "./types";

/* -------------------------------------------------------------------------- */
/*  Specimen 02 — a high-visibility reflective work shirt, plotted flat.       */
/* -------------------------------------------------------------------------- */

const CYAN = PALETTE.cyan;
const ORANGE = PALETTE.orange;
const VOLT = PALETTE.volt;

type Side = -1 | 1;

const path = (build: (p: SketchPath) => void) => {
  const p = new SketchPath();
  build(p);
  return p;
};

const TORSO = path((p) => {
  p.moveTo(-44, -286);
  p.lineTo(-108, -264);
  p.bezierCurveTo(-104, -232, -101, -206, -100, -184);
  p.bezierCurveTo(-98, -80, -100, 80, -98, 214);
  p.bezierCurveTo(-98, 238, -92, 252, -82, 258);
  p.quadraticCurveTo(0, 274, 82, 258);
  p.bezierCurveTo(92, 252, 98, 238, 98, 214);
  p.bezierCurveTo(100, 80, 98, -80, 100, -184);
  p.bezierCurveTo(101, -206, 104, -232, 108, -264);
  p.lineTo(44, -286);
  p.bezierCurveTo(24, -266, 12, -256, 0, -252);
  p.bezierCurveTo(-12, -256, -24, -266, -44, -286);
  p.closePath();
});

const sleeve = (s: Side) =>
  path((p) => {
    p.moveTo(s * 96, -272);
    p.bezierCurveTo(s * 120, -272, s * 136, -260, s * 144, -236);
    p.bezierCurveTo(s * 154, -190, s * 164, -132, s * 170, -60);
    p.bezierCurveTo(s * 173, -20, s * 174, 40, s * 174, 104);
    p.bezierCurveTo(s * 174, 122, s * 170, 134, s * 160, 138);
    p.lineTo(s * 132, 138);
    p.bezierCurveTo(s * 134, 104, s * 132, 60, s * 127, 6);
    p.bezierCurveTo(s * 121, -66, s * 116, -126, s * 108, -168);
    p.bezierCurveTo(s * 104, -184, s * 101, -198, s * 100, -214);
    p.bezierCurveTo(s * 98, -232, s * 97, -252, s * 96, -272);
    p.closePath();
  });

const neckBand = path((p) => {
  p.moveTo(-48, -292);
  p.bezierCurveTo(-30, -274, -12, -260, 0, -256);
  p.bezierCurveTo(12, -260, 30, -274, 48, -292);
});

const collarLeaf = (s: Side) =>
  path((p) => {
    p.moveTo(s * 48, -294);
    p.lineTo(s * 28, -248);
    p.lineTo(s * 6, -266);
    p.lineTo(s * 16, -292);
    p.closePath();
  });

const shoulderSeam = (s: Side) =>
  path((p) => {
    p.moveTo(s * 46, -290);
    p.bezierCurveTo(s * 64, -282, s * 86, -274, s * 108, -264);
  });

const armholeSeam = (s: Side) =>
  path((p) => {
    p.moveTo(s * 106, -260);
    p.bezierCurveTo(s * 101, -232, s * 100, -206, s * 100, -184);
  });

const sleeveSeam = (s: Side) =>
  path((p) => {
    p.moveTo(s * 148, -224);
    p.bezierCurveTo(s * 140, -152, s * 136, -54, s * 136, 24);
    p.bezierCurveTo(s * 136, 64, s * 136, 98, s * 134, 122);
  });

const cuffSeam = (s: Side) =>
  path((p) => {
    p.moveTo(s * 172, 118);
    p.bezierCurveTo(s * 158, 121, s * 143, 121, s * 132, 118);
  });

const placket = (s: Side) =>
  path((p) => {
    p.moveTo(s * 14, -252);
    p.bezierCurveTo(s * 13, -120, s * 13, 50, s * 14, 252);
  });

const pocket = (s: Side) =>
  path((p) => {
    p.moveTo(s * 64, -204);
    p.lineTo(s * 96, -204);
    p.bezierCurveTo(s * 99, -204, s * 100, -201, s * 100, -198);
    p.lineTo(s * 100, -158);
    p.lineTo(s * 64, -158);
    p.closePath();
  });

const pocketFlap = (s: Side) =>
  path((p) => {
    p.moveTo(s * 62, -204);
    p.lineTo(s * 100, -204);
    p.lineTo(s * 98, -190);
    p.lineTo(s * 64, -190);
    p.closePath();
  });

const verticalBand = (s: Side) =>
  path((p) => {
    p.moveTo(s * 56, -256);
    p.lineTo(s * 28, -256);
    p.bezierCurveTo(s * 31, -80, s * 34, 80, s * 37, 242);
    p.lineTo(s * 65, 242);
    p.bezierCurveTo(s * 62, 80, s * 59, -80, s * 56, -256);
    p.closePath();
  });

const verticalBandLight = (s: Side) =>
  path((p) => {
    p.moveTo(s * 44, -250);
    p.bezierCurveTo(s * 47, -80, s * 50, 80, s * 53, 236);
  });

const horizontalBodyBand = (s: Side, y: number) =>
  path((p) => {
    p.moveTo(s * 100, y);
    p.bezierCurveTo(s * 73, y + 4, s * 45, y + 6, s * 16, y + 4);
    p.lineTo(s * 16, y + 34);
    p.bezierCurveTo(s * 45, y + 36, s * 73, y + 34, s * 100, y + 30);
    p.closePath();
  });

const horizontalBodyLight = (s: Side, y: number) =>
  path((p) => {
    p.moveTo(s * 100, y + 17);
    p.bezierCurveTo(s * 73, y + 21, s * 45, y + 23, s * 16, y + 21);
  });

const horizontalSleeveBand = (s: Side, y: number) =>
  path((p) => {
    p.moveTo(s * 152, y + 2);
    p.bezierCurveTo(s * 142, y + 6, s * 127, y + 6, s * 116, y + 2);
    p.lineTo(s * 114, y + 32);
    p.bezierCurveTo(s * 126, y + 36, s * 144, y + 35, s * 156, y + 30);
    p.closePath();
  });

const horizontalSleeveLight = (s: Side, y: number) =>
  path((p) => {
    p.moveTo(s * 154, y + 17);
    p.bezierCurveTo(s * 142, y + 21, s * 126, y + 21, s * 115, y + 17);
  });

const yoke = path((p) => {
  p.moveTo(-102, -238);
  p.bezierCurveTo(-62, -230, 62, -230, 102, -238);
});

const hemSeam = path((p) => {
  p.moveTo(-94, 248);
  p.quadraticCurveTo(0, 264, 94, 248);
});

const sideSeam = (s: Side) =>
  path((p) => {
    p.moveTo(s * 96, 212);
    p.bezierCurveTo(s * 94, 120, s * 95, 20, s * 96, -76);
  });

const fillSketch = (
  ctx: CanvasRenderingContext2D,
  shape: SketchPath,
  amount: number,
  color: string,
) => {
  const t = clamp(amount);
  if (t <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= t;
  ctx.fillStyle = color;
  ctx.beginPath();
  shape.trace(ctx);
  ctx.fill();
  ctx.restore();
};

const SIDES: readonly Side[] = [-1, 1];

const drawHatches = (
  ctx: CanvasRenderingContext2D,
  amount: number,
) => {
  if (amount <= 0.001) return;

  ctx.save();
  ctx.globalAlpha *= amount;
  ctx.strokeStyle = VOLT;
  ctx.lineWidth = 0.55;
  ctx.setLineDash([]);

  for (const s of SIDES) {
    for (let i = 0; i < 7; i++) {
      const y = -220 + i * 66;
      const left = s * (37 + i * 0.3);
      const right = s * (56 + i * 0.25);
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y + 16);
      ctx.stroke();
    }

    const y = -108;
    for (let i = 0; i < 3; i++) {
      const x = s * (34 + i * 24);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 12, y + 30);
      ctx.stroke();
    }
  }
  ctx.restore();
};

export const drawReflectorShirt = (
  ctx: CanvasRenderingContext2D,
  progress: number,
) => {
  const p = clamp(progress);
  if (p <= 0.001) return;

  const reveal = (start: number, end: number) => windowRamp(p, start, end);
  const fills = reveal(0.22, 0.52);

  fillSketch(ctx, TORSO, fills * 0.55, "rgba(204,255,0,0.05)");
  SIDES.forEach((s) => {
    fillSketch(ctx, sleeve(s), fills * 0.6, "rgba(204,255,0,0.045)");
    fillSketch(ctx, verticalBand(s), reveal(0.58, 0.8) * 0.8, "rgba(255,87,34,0.07)");
    fillSketch(
      ctx,
      horizontalBodyBand(s, -128),
      reveal(0.62, 0.84) * 0.8,
      "rgba(255,87,34,0.07)",
    );
    fillSketch(
      ctx,
      horizontalBodyBand(s, 72),
      reveal(0.66, 0.88) * 0.8,
      "rgba(255,87,34,0.07)",
    );
    fillSketch(
      ctx,
      horizontalSleeveBand(s, -128),
      reveal(0.68, 0.9) * 0.8,
      "rgba(255,87,34,0.07)",
    );
    fillSketch(
      ctx,
      horizontalSleeveBand(s, 72),
      reveal(0.7, 0.92) * 0.8,
      "rgba(255,87,34,0.07)",
    );
  });

  strokeSketch(ctx, TORSO, reveal(0.02, 0.48), {
    color: CYAN,
    width: 1.9,
    alpha: 0.98,
    glow: 5,
  });

  SIDES.forEach((s) => {
    strokeSketch(ctx, sleeve(s), reveal(0.08, 0.56), {
      color: CYAN,
      width: 1.75,
      alpha: 0.95,
      glow: 5,
    });
  });

  strokeSketch(ctx, neckBand, reveal(0.24, 0.44), {
    color: CYAN,
    width: 1.5,
    alpha: 0.86,
  });

  SIDES.forEach((s) => {
    strokeSketch(ctx, collarLeaf(s), reveal(0.27, 0.48), {
      color: CYAN,
      width: 1.2,
      alpha: 0.74,
    });
    strokeSketch(ctx, shoulderSeam(s), reveal(0.34, 0.52), {
      color: CYAN,
      width: 0.8,
      alpha: 0.36,
      dash: [2.5, 4],
    });
    strokeSketch(ctx, armholeSeam(s), reveal(0.36, 0.55), {
      color: CYAN,
      width: 0.9,
      alpha: 0.44,
      dash: [2.5, 4],
    });
    strokeSketch(ctx, sleeveSeam(s), reveal(0.48, 0.68), {
      color: CYAN,
      width: 0.7,
      alpha: 0.28,
      dash: [2.5, 5],
    });
    strokeSketch(ctx, cuffSeam(s), reveal(0.58, 0.74), {
      color: CYAN,
      width: 0.9,
      alpha: 0.52,
    });
    strokeSketch(ctx, placket(s), reveal(0.42, 0.64), {
      color: CYAN,
      width: 0.9,
      alpha: 0.62,
    });
  });

  strokeSketch(ctx, yoke, reveal(0.52, 0.68), {
    color: CYAN,
    width: 0.65,
    alpha: 0.24,
    dash: [2, 5],
  });

  SIDES.forEach((s) => {
    strokeSketch(ctx, pocket(s), reveal(0.6, 0.76), {
      color: CYAN,
      width: 0.85,
      alpha: 0.48,
    });
    strokeSketch(ctx, pocketFlap(s), reveal(0.64, 0.8), {
      color: CYAN,
      width: 0.85,
      alpha: 0.58,
    });

    strokeSketch(ctx, verticalBand(s), reveal(0.54, 0.76), {
      color: ORANGE,
      width: 1.4,
      alpha: 0.92,
      glow: 6,
    });
    strokeSketch(ctx, verticalBandLight(s), reveal(0.68, 0.9), {
      color: VOLT,
      width: 0.7,
      alpha: 0.9,
    });

    strokeSketch(ctx, horizontalBodyBand(s, -128), reveal(0.6, 0.8), {
      color: ORANGE,
      width: 1.3,
      alpha: 0.9,
      glow: 5,
    });
    strokeSketch(ctx, horizontalBodyLight(s, -128), reveal(0.74, 0.94), {
      color: VOLT,
      width: 0.65,
      alpha: 0.82,
    });

    strokeSketch(ctx, horizontalBodyBand(s, 72), reveal(0.65, 0.85), {
      color: ORANGE,
      width: 1.3,
      alpha: 0.9,
      glow: 5,
    });
    strokeSketch(ctx, horizontalBodyLight(s, 72), reveal(0.78, 0.96), {
      color: VOLT,
      width: 0.65,
      alpha: 0.82,
    });

    strokeSketch(ctx, horizontalSleeveBand(s, -128), reveal(0.7, 0.88), {
      color: ORANGE,
      width: 1.15,
      alpha: 0.84,
      glow: 4,
    });
    strokeSketch(ctx, horizontalSleeveLight(s, -128), reveal(0.8, 0.97), {
      color: VOLT,
      width: 0.55,
      alpha: 0.76,
    });

    strokeSketch(ctx, horizontalSleeveBand(s, 72), reveal(0.74, 0.92), {
      color: ORANGE,
      width: 1.15,
      alpha: 0.84,
      glow: 4,
    });
    strokeSketch(ctx, horizontalSleeveLight(s, 72), reveal(0.83, 0.99), {
      color: VOLT,
      width: 0.55,
      alpha: 0.76,
    });

    strokeSketch(ctx, sideSeam(s), reveal(0.72, 0.9), {
      color: CYAN,
      width: 0.65,
      alpha: 0.26,
      dash: [2, 5],
    });
  });

  strokeSketch(ctx, hemSeam, reveal(0.76, 0.94), {
    color: CYAN,
    width: 0.7,
    alpha: 0.34,
    dash: [2.5, 4],
  });

  const hardware = reveal(0.82, 1);
  if (hardware > 0.001) {
    ctx.save();
    ctx.globalAlpha *= hardware;
    ctx.lineWidth = 0.9;
    ctx.strokeStyle = ORANGE;
    ctx.fillStyle = VOLT;
    ctx.shadowColor = VOLT;
    ctx.shadowBlur = 4;

    for (let i = 0; i < 8; i++) {
      const y = -214 + i * 58;
      ctx.beginPath();
      ctx.arc(0, y, 2.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-2.5, y);
      ctx.lineTo(2.5, y);
      ctx.stroke();
    }

    SIDES.forEach((s) => {
      ctx.beginPath();
      ctx.arc(s * 70, -183, 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(s * 146, 127, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  drawHatches(ctx, reveal(0.72, 0.98));

  const label = reveal(0.86, 1);
  if (label > 0.001) {
    text(ctx, "HV-02 / REFLEX", 104, 250, {
      size: 6.5,
      color: PALETTE.dim,
      alpha: label * 0.72,
      tracking: 1.1,
    });
    text(ctx, "50MM TAPE", 104, 259, {
      size: 5.5,
      color: PALETTE.dim,
      alpha: label * 0.4,
      tracking: 0.8,
    });

    line(ctx, [[103, 238], [103, 245]], {
      color: CHART_LINE,
      width: 0.6,
      alpha: label * 0.4,
    });
    line(ctx, [[100, 242], [106, 242]], {
      color: CHART_LINE,
      width: 0.6,
      alpha: label * 0.4,
    });
  }
};

const CHART_LINE = "#64748B";

const SHIRT_W = 356;
const SHIRT_H = 582;
const SHIRT_MID_Y = -10;

const shirtFit = (w: number, h: number) =>
  Math.min((w - 72) / SHIRT_W, (h - 128) / SHIRT_H, 1.4);

export const drawReflector = (scene: SceneContext) => {
  const { ctx, state, w, h } = scene;
  if (state.reflector <= 0.001) return;

  const fit = shirtFit(w, h);

  ctx.save();
  ctx.translate(w / 2, h * 0.5 - SHIRT_MID_Y * fit);
  ctx.scale(fit, fit);
  drawReflectorShirt(ctx, state.reflector);
  ctx.restore();
};
