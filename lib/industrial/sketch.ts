/* -------------------------------------------------------------------------- */
/*  FORGE+FIELD — shared plotting helpers for the specimen blueprints         */
/*                                                                            */
/*  Canvas has no path-length API, so each path estimates its own length and  */
/*  uses a dash reveal to sketch itself on. Detail strokes fade in with their */
/*  real micro-dash pattern intact.                                           */
/* -------------------------------------------------------------------------- */

export type SketchCmd =
  | ["M", number, number]
  | ["L", number, number]
  | ["C", number, number, number, number, number, number]
  | ["Q", number, number, number, number]
  | ["Z"];

export type SketchStyle = {
  color: string;
  width?: number;
  alpha?: number;
  glow?: number;
  /** Micro-dash pattern. Dashed strokes fade in whole instead of revealing. */
  dash?: readonly [number, number];
  cap?: CanvasLineCap;
  join?: CanvasLineJoin;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export class SketchPath {
  private cmds: SketchCmd[] = [];
  private x = 0;
  private y = 0;
  private startX = 0;
  private startY = 0;
  length = 0;

  moveTo(x: number, y: number) {
    this.cmds.push(["M", x, y]);
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    return this;
  }

  lineTo(x: number, y: number) {
    this.length += Math.hypot(x - this.x, y - this.y);
    this.cmds.push(["L", x, y]);
    this.x = x;
    this.y = y;
    return this;
  }

  bezierCurveTo(
    c1x: number,
    c1y: number,
    c2x: number,
    c2y: number,
    x: number,
    y: number,
  ) {
    // Sample the cubic to approximate arc length for the dash reveal.
    const steps = 28;
    let px = this.x;
    let py = this.y;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const mt = 1 - t;
      const nx =
        mt * mt * mt * this.x +
        3 * mt * mt * t * c1x +
        3 * mt * t * t * c2x +
        t * t * t * x;
      const ny =
        mt * mt * mt * this.y +
        3 * mt * mt * t * c1y +
        3 * mt * t * t * c2y +
        t * t * t * y;
      this.length += Math.hypot(nx - px, ny - py);
      px = nx;
      py = ny;
    }

    this.cmds.push(["C", c1x, c1y, c2x, c2y, x, y]);
    this.x = x;
    this.y = y;
    return this;
  }

  quadraticCurveTo(cx: number, cy: number, x: number, y: number) {
    const steps = 18;
    let px = this.x;
    let py = this.y;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const mt = 1 - t;
      const nx = mt * mt * this.x + 2 * mt * t * cx + t * t * x;
      const ny = mt * mt * this.y + 2 * mt * t * cy + t * t * y;
      this.length += Math.hypot(nx - px, ny - py);
      px = nx;
      py = ny;
    }

    this.cmds.push(["Q", cx, cy, x, y]);
    this.x = x;
    this.y = y;
    return this;
  }

  closePath() {
    if (this.x !== this.startX || this.y !== this.startY) {
      this.length += Math.hypot(this.startX - this.x, this.startY - this.y);
    }
    this.cmds.push(["Z"]);
    this.x = this.startX;
    this.y = this.startY;
    return this;
  }

  trace(ctx: CanvasRenderingContext2D) {
    for (const cmd of this.cmds) {
      if (cmd[0] === "M") ctx.moveTo(cmd[1], cmd[2]);
      else if (cmd[0] === "L") ctx.lineTo(cmd[1], cmd[2]);
      else if (cmd[0] === "C") {
        ctx.bezierCurveTo(cmd[1], cmd[2], cmd[3], cmd[4], cmd[5], cmd[6]);
      } else if (cmd[0] === "Q") {
        ctx.quadraticCurveTo(cmd[1], cmd[2], cmd[3], cmd[4]);
      } else {
        ctx.closePath();
      }
    }
  }
}

/** Stroke a sketch path, revealing it along its measured arc length. */
export const strokeSketch = (
  ctx: CanvasRenderingContext2D,
  path: SketchPath,
  amount: number,
  style: SketchStyle,
) => {
  const t = clamp01(amount);
  if (t <= 0.001 || path.length <= 0.01) return;

  ctx.save();
  ctx.lineCap = style.cap ?? "round";
  ctx.lineJoin = style.join ?? "round";
  ctx.lineWidth = style.width ?? 1.5;
  ctx.strokeStyle = style.color;
  ctx.shadowColor = style.color;
  ctx.shadowBlur = style.glow ?? 4;
  ctx.globalAlpha = clamp01(ctx.globalAlpha * (style.alpha ?? 1));

  ctx.beginPath();
  path.trace(ctx);

  if (style.dash) {
    // Detail strokes keep their true stitch pattern and simply fade in.
    ctx.setLineDash([...style.dash]);
    ctx.globalAlpha *= t;
  } else if (t < 0.999) {
    ctx.setLineDash([Math.max(0.1, path.length * t), path.length * 2 + 64]);
  }

  ctx.stroke();
  ctx.restore();
};

/** A circular port / eyelet that draws itself clockwise. */
export const strokePort = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  amount: number,
  style: SketchStyle,
) => {
  const t = clamp01(amount);
  if (t <= 0.001) return;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = style.width ?? 1;
  ctx.strokeStyle = style.color;
  ctx.shadowColor = style.color;
  ctx.shadowBlur = style.glow ?? 3;
  ctx.globalAlpha = clamp01(ctx.globalAlpha * (style.alpha ?? 1));
  ctx.beginPath();
  ctx.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * t);
  ctx.stroke();
  ctx.restore();
};

/** Point on a cubic bezier. Used to lay out laces and eyelets. */
export const cubicPoint = (
  t: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
) => {
  const mt = 1 - t;
  return {
    x: mt * mt * mt * x0 + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * x3,
    y: mt * mt * mt * y0 + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y3,
  };
};

/** Smooth window used to stagger every part of a blueprint. */
export const windowRamp = (progress: number, start: number, end: number) => {
  const t = clamp01((progress - start) / Math.max(0.0001, end - start));
  return t * t * (3 - 2 * t);
};
