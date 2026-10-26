/* -------------------------------------------------------------------------- */
/*  FORGE+FIELD — self-sketching industrial safety boot blueprint              */
/*                                                                            */
/*  A three-quarter profile work boot drawn with strokes only. Local origin is */
/*  the ground point under the boot's centre; the toe points left. Callers     */
/*  translate / scale the context before invoking drawBoot.                   */
/* -------------------------------------------------------------------------- */

import {
  SketchPath,
  cubicPoint,
  strokePort,
  strokeSketch,
  windowRamp,
} from "./sketch";

const CYAN = "#38BDF8";
const ORANGE = "#FF5722";

/** Local bounds, exported so the stage can size and centre the specimen. */
export const BOOT_BOUNDS = {
  minX: -228,
  maxX: 224,
  minY: -298,
  maxY: 20,
} as const;

const path = (build: (p: SketchPath) => void) => {
  const p = new SketchPath();
  build(p);
  return p;
};

/**
 * Draws a detailed technical wireframe safety boot.
 *
 * @param ctx      2D context already positioned at the boot's origin
 * @param progress 0 = empty, 1 = fully plotted
 */
export function drawBoot(ctx: CanvasRenderingContext2D, progress: number): void {
  const p = Math.max(0, Math.min(1, progress));
  const win = (start: number, end: number) => windowRamp(p, start, end);

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);

  const solid = (
    value: SketchPath,
    amount: number,
    color: string,
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

  const detail = (
    value: SketchPath,
    amount: number,
    color = ORANGE,
    width = 1,
    alpha = 0.72,
  ) =>
    strokeSketch(ctx, value, amount, {
      color,
      width,
      alpha,
      glow: 2,
      dash: [2, 2],
    });

  /* ------------------------------- the sole ------------------------------ */

  // Continuous midsole platform line.
  const midsole = path((s) => {
    s.moveTo(-216, -46);
    s.bezierCurveTo(-158, -38, -66, -34, 24, -36);
    s.bezierCurveTo(106, -38, 172, -44, 216, -56);
  });

  // Slightly deeper welt line gives the sole visible material thickness.
  const welt = path((s) => {
    s.moveTo(-214, -34);
    s.bezierCurveTo(-150, -27, -52, -23, 34, -25);
    s.bezierCurveTo(112, -27, 174, -34, 214, -46);
  });

  // Blocky square-wave lugs. Forefoot lugs sit at -12; heel lugs are deeper.
  const tread = path((s) => {
    let x = -210;
    let i = 0;
    s.moveTo(x, -26);
    while (x < 208) {
      const lug = Math.min(13 + (i % 3) * 2, 208 - x);
      const gap = 6;
      const top = x > 126 ? -9 : -13;
      s.lineTo(x, top);
      s.lineTo(x, 0);
      s.lineTo(x + lug, 0);
      s.lineTo(x + lug, top);
      const next = Math.min(208, x + lug + gap);
      s.lineTo(next, top);
      x = next;
      i++;
    }
  });

  // Alternating orange wear indicators on the most loaded lugs.
  const lugAccents: SketchPath[] = [];
  {
    let x = -210;
    let i = 0;
    while (x < 200) {
      const lug = Math.min(13 + (i % 3) * 2, 200 - x);
      if (i % 4 === 0) {
        lugAccents.push(
          path((s) => {
            s.moveTo(x + lug - 2, -10);
            s.lineTo(x + lug - 2, 0);
          }),
        );
      }
      x += lug + 6;
      i++;
    }
  }

  // Puncture-resistant plate running inside the platform.
  const puncturePlate = path((s) => {
    s.moveTo(-194, -20);
    s.bezierCurveTo(-120, -16, 40, -16, 198, -30);
  });

  // Heel kick / oil-resistant heel block.
  const heelBlock = path((s) => {
    s.moveTo(132, -4);
    s.lineTo(132, -18);
    s.lineTo(206, -26);
    s.lineTo(210, -8);
  });

  solid(midsole, win(0.0, 0.12), CYAN, 1.7, 0.95);
  solid(welt, win(0.03, 0.14), CYAN, 1, 0.45);
  solid(tread, win(0.02, 0.2), CYAN, 1.5, 0.92);
  lugAccents.forEach((accent, index) => {
    solid(accent, win(0.12 + index * 0.012, 0.18 + index * 0.012), ORANGE, 1.2, 0.85);
  });
  detail(puncturePlate, win(0.12, 0.22), ORANGE, 0.9, 0.55);
  solid(heelBlock, win(0.16, 0.23), CYAN, 1.1, 0.6);

  /* ------------------------------- the upper ----------------------------- */

  // Chassis: toe box, vamp, instep, ankle front, collar back and heel counter.
  const chassis = path((s) => {
    s.moveTo(84, -246);
    s.bezierCurveTo(68, -226, 48, -198, 28, -176);
    s.bezierCurveTo(14, -160, 2, -152, -12, -147);
    s.bezierCurveTo(-46, -138, -84, -128, -124, -115);
    s.bezierCurveTo(-164, -101, -192, -86, -201, -62);
    s.bezierCurveTo(-206, -51, -211, -47, -212, -42);
    s.lineTo(212, -50);
    s.bezierCurveTo(214, -82, 216, -122, 212, -160);
    s.bezierCurveTo(209, -188, 198, -211, 181, -227);
    s.bezierCurveTo(170, -238, 155, -245, 140, -248);
    s.bezierCurveTo(122, -251, 100, -250, 84, -246);
    s.closePath();
  });
  solid(chassis, win(0.18, 0.42), CYAN, 1.5, 0.96);

  // Heel counter with a parallel double-stitch seam.
  const heelCounter = path((s) => {
    s.moveTo(208, -56);
    s.bezierCurveTo(212, -94, 211, -142, 200, -184);
    s.bezierCurveTo(194, -208, 180, -226, 160, -238);
  });
  const heelStitch = path((s) => {
    s.moveTo(197, -62);
    s.bezierCurveTo(201, -98, 200, -140, 190, -180);
    s.bezierCurveTo(185, -200, 174, -216, 158, -227);
  });
  solid(heelCounter, win(0.1, 0.2), CYAN, 1.5, 0.85);
  detail(heelStitch, win(0.16, 0.25), ORANGE, 1, 0.6);

  // Quarter-panel pressure seam and its inner twin.
  const quarter = path((s) => {
    s.moveTo(112, -232);
    s.bezierCurveTo(128, -202, 138, -170, 142, -138);
    s.bezierCurveTo(146, -108, 154, -84, 168, -66);
  });
  const quarterTwin = path((s) => {
    s.moveTo(121, -229);
    s.bezierCurveTo(136, -200, 146, -169, 150, -138);
    s.bezierCurveTo(154, -110, 161, -88, 173, -72);
  });
  solid(quarter, win(0.24, 0.34), CYAN, 1.2, 0.55);
  detail(quarterTwin, win(0.28, 0.38), ORANGE, 0.9, 0.5);

  // Sharp steel-toe boundary and its inner stitch offset.
  const toeCap = path((s) => {
    s.moveTo(-207, -48);
    s.bezierCurveTo(-208, -78, -193, -106, -161, -122);
    s.bezierCurveTo(-145, -130, -129, -133, -114, -132);
  });
  const toeStitch = path((s) => {
    s.moveTo(-197, -52);
    s.bezierCurveTo(-198, -77, -185, -100, -157, -114);
    s.bezierCurveTo(-143, -121, -130, -124, -118, -123);
  });
  const toeRivet = path((s) => {
    s.moveTo(-119, -136);
    s.lineTo(-112, -129);
    s.moveTo(-112, -136);
    s.lineTo(-119, -129);
  });
  solid(toeCap, win(0.34, 0.5), ORANGE, 1.6, 0.9);
  detail(toeStitch, win(0.42, 0.54), ORANGE, 1, 0.65);
  solid(toeRivet, win(0.52, 0.56), ORANGE, 1.1, 0.8, 2);

  // Toe-box panel split.
  const toePanel = path((s) => {
    s.moveTo(-186, -84);
    s.bezierCurveTo(-166, -96, -142, -105, -116, -108);
  });
  detail(toePanel, win(0.46, 0.54), CYAN, 0.9, 0.35);

  /* ------------------------------ eyestay -------------------------------- */

  const tongue = path((s) => {
    s.moveTo(-8, -148);
    s.bezierCurveTo(20, -186, 50, -220, 82, -244);
    s.bezierCurveTo(94, -251, 108, -249, 114, -240);
    s.bezierCurveTo(96, -214, 72, -178, 54, -146);
    s.bezierCurveTo(38, -124, 12, -126, -8, -148);
    s.closePath();
  });
  const tongueStitch = path((s) => {
    s.moveTo(2, -146);
    s.bezierCurveTo(28, -180, 55, -212, 84, -238);
    s.moveTo(20, -138);
    s.bezierCurveTo(44, -170, 68, -198, 96, -224);
    s.moveTo(38, -130);
    s.bezierCurveTo(58, -156, 78, -180, 104, -204);
  });
  solid(tongue, win(0.46, 0.6), CYAN, 1.4, 0.85);
  detail(tongueStitch, win(0.58, 0.68), ORANGE, 0.9, 0.45);

  const eyestayFront = path((s) => {
    s.moveTo(-18, -144);
    s.bezierCurveTo(10, -182, 40, -216, 72, -240);
    s.moveTo(-4, -151);
    s.bezierCurveTo(24, -189, 54, -223, 86, -246);
  });
  const eyestayRear = path((s) => {
    s.moveTo(10, -140);
    s.bezierCurveTo(38, -178, 68, -212, 104, -236);
    s.moveTo(24, -133);
    s.bezierCurveTo(52, -171, 82, -205, 118, -229);
  });
  solid(eyestayFront, win(0.52, 0.64), CYAN, 1.3, 0.8);
  solid(eyestayRear, win(0.54, 0.66), CYAN, 1.3, 0.8);

  // Two rows of eyelets laid out along the lacing curves.
  const laceA = { x0: -8, y0: -150, x1: 22, y1: -188, x2: 52, y2: -221, x3: 84, y3: -244 };
  const laceB = { x0: 16, y0: -142, x1: 46, y1: -182, x2: 78, y2: -214, x3: 112, y3: -234 };
  const leftEyes: { x: number; y: number }[] = [];
  const rightEyes: { x: number; y: number }[] = [];

  for (let i = 0; i < 5; i++) {
    const t = 0.08 + (i / 4) * 0.84;
    const a = cubicPoint(t, laceA.x0, laceA.y0, laceA.x1, laceA.y1, laceA.x2, laceA.y2, laceA.x3, laceA.y3);
    const b = cubicPoint(t, laceB.x0, laceB.y0, laceB.x1, laceB.y1, laceB.x2, laceB.y2, laceB.x3, laceB.y3);
    leftEyes.push(a);
    rightEyes.push(b);

    const start = 0.62 + i * 0.026;
    strokePort(ctx, a.x, a.y, 3.5, win(start, start + 0.07), {
      color: ORANGE,
      width: 1.2,
      alpha: 0.85,
      glow: 3,
    });
    strokePort(ctx, b.x, b.y, 3.5, win(start + 0.02, start + 0.09), {
      color: ORANGE,
      width: 1.2,
      alpha: 0.85,
      glow: 3,
    });
  }

  // Cross-laces: a tight zig-zag down the instep.
  for (let i = 0; i < 4; i++) {
    const a = leftEyes[i];
    const b = rightEyes[i];
    const c = leftEyes[i + 1];
    const d = rightEyes[i + 1];
    const start = 0.68 + i * 0.035;

    solid(
      path((s) => {
        s.moveTo(a.x, a.y);
        s.lineTo(d.x, d.y);
      }),
      win(start, start + 0.06),
      ORANGE,
      1.3,
      0.88,
      3,
    );
    solid(
      path((s) => {
        s.moveTo(b.x, b.y);
        s.lineTo(c.x, c.y);
      }),
      win(start + 0.015, start + 0.075),
      ORANGE,
      1.1,
      0.7,
      3,
    );
  }

  // Loose lace end and a top speed hook.
  const laceTail = path((s) => {
    s.moveTo(rightEyes[4].x, rightEyes[4].y);
    s.bezierCurveTo(130, -244, 144, -252, 158, -248);
    s.bezierCurveTo(164, -246, 166, -240, 162, -236);
  });
  const speedHook = path((s) => {
    s.moveTo(156, -246);
    s.lineTo(170, -252);
    s.lineTo(174, -240);
    s.lineTo(160, -236);
    s.closePath();
  });
  solid(laceTail, win(0.82, 0.9), ORANGE, 1.4, 0.9, 4);
  solid(speedHook, win(0.86, 0.92), ORANGE, 1.2, 0.8, 3);

  /* ------------------------------- collar -------------------------------- */

  const collarOuter = path((s) => {
    s.moveTo(74, -236);
    s.bezierCurveTo(84, -256, 111, -268, 142, -265);
    s.bezierCurveTo(172, -262, 193, -247, 198, -228);
    s.bezierCurveTo(201, -214, 190, -203, 170, -198);
    s.bezierCurveTo(146, -192, 116, -197, 98, -209);
    s.bezierCurveTo(86, -217, 77, -226, 74, -236);
    s.closePath();
  });
  const collarInner = path((s) => {
    s.moveTo(88, -234);
    s.bezierCurveTo(98, -249, 120, -257, 145, -254);
    s.bezierCurveTo(168, -251, 184, -240, 188, -226);
    s.bezierCurveTo(190, -216, 180, -208, 164, -204);
    s.bezierCurveTo(144, -199, 120, -204, 104, -214);
    s.bezierCurveTo(94, -220, 88, -227, 88, -234);
    s.closePath();
  });
  solid(collarOuter, win(0.82, 0.96), CYAN, 1.5, 0.96);
  solid(collarInner, win(0.86, 1.0), CYAN, 1.2, 0.6);

  // Padded rim segments: short radial stitches between the two collar loops.
  const collarTicks = path((s) => {
    const cx = 138;
    const cy = -232;
    const rot = -0.1;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const ox = cx + 59 * Math.cos(a) * Math.cos(rot) - 20 * Math.sin(a) * Math.sin(rot);
      const oy = cy + 59 * Math.cos(a) * Math.sin(rot) + 20 * Math.sin(a) * Math.cos(rot);
      const ix = cx + 51 * Math.cos(a) * Math.cos(rot) - 14 * Math.sin(a) * Math.sin(rot);
      const iy = cy + 51 * Math.cos(a) * Math.sin(rot) + 14 * Math.sin(a) * Math.cos(rot);
      s.moveTo(ox, oy);
      s.lineTo(ix, iy);
    }
  });
  detail(collarTicks, win(0.9, 0.99), ORANGE, 0.9, 0.6);

  // Rear pull loop, a small orange detail above the heel.
  const pullLoop = path((s) => {
    s.moveTo(186, -252);
    s.bezierCurveTo(198, -262, 212, -258, 210, -246);
    s.bezierCurveTo(209, -238, 200, -234, 194, -238);
  });
  solid(pullLoop, win(0.92, 0.99), ORANGE, 1.4, 0.9, 3);

  // Ankle opening ellipse hint, kept as a broken technical guide.
  const ankleGuide = path((s) => {
    s.moveTo(104, -218);
    s.bezierCurveTo(112, -228, 132, -233, 150, -231);
    s.bezierCurveTo(168, -229, 180, -221, 182, -212);
  });
  detail(ankleGuide, win(0.84, 0.92), CYAN, 0.8, 0.3);

  /* --------------------------- chassis details --------------------------- */

  // Reflective heel flash and a small orange sole side-mark.
  const heelFlash = path((s) => {
    s.moveTo(180, -94);
    s.bezierCurveTo(193, -96, 205, -100, 212, -106);
  });
  const sideMark = path((s) => {
    s.moveTo(56, -40);
    s.lineTo(88, -40);
    s.moveTo(56, -34);
    s.lineTo(80, -34);
  });
  solid(heelFlash, win(0.56, 0.64), ORANGE, 1.4, 0.65, 2);
  solid(sideMark, win(0.3, 0.36), ORANGE, 1.1, 0.55, 2);

  // Double-stitched tongue centre line.
  const tongueCenter = path((s) => {
    s.moveTo(22, -136);
    s.bezierCurveTo(44, -166, 68, -196, 96, -222);
  });
  detail(tongueCenter, win(0.62, 0.72), CYAN, 0.8, 0.3);

  ctx.restore();
}
