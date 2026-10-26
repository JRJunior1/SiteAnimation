import { MONO, PALETTE, clamp, type Pt } from "./types";

/* -------------------------------------------------------------------------- */
/*  Low-level canvas helpers. Nothing in here knows about the six phases.      */
/* -------------------------------------------------------------------------- */

export type StrokeOptions = {
  color?: string;
  width?: number;
  alpha?: number;
  close?: boolean;
  dash?: readonly [number, number];
  cap?: CanvasLineCap;
  join?: CanvasLineJoin;
  /** Shadow blur in canvas units. Used sparingly for laser / bead bloom. */
  glow?: number;
};

const applyStroke = (ctx: CanvasRenderingContext2D, options: StrokeOptions) => {
  ctx.strokeStyle = options.color ?? PALETTE.cyan;
  ctx.lineWidth = options.width ?? 1;
  ctx.lineCap = options.cap ?? "round";
  ctx.lineJoin = options.join ?? "round";
  // Multiply into the inherited layer alpha so a disappearing group can fade
  // cleanly without every internal stroke knowing about the transition.
  ctx.globalAlpha = clamp((options.alpha ?? 1) * ctx.globalAlpha);
  ctx.setLineDash(options.dash ? [...options.dash] : []);
  ctx.shadowBlur = options.glow ?? 0;
  ctx.shadowColor = options.glow ? (options.color ?? PALETTE.cyan) : "transparent";
};

const resetStroke = (ctx: CanvasRenderingContext2D) => {
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
};

/** Trace a polyline without painting it. */
export const trace = (ctx: CanvasRenderingContext2D, points: readonly Pt[], close = false) => {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  if (close) ctx.closePath();
};

/** Full polyline stroke. */
export const line = (
  ctx: CanvasRenderingContext2D,
  points: readonly Pt[],
  options: StrokeOptions = {},
) => {
  if (points.length < 2) return;
  ctx.save();
  applyStroke(ctx, options);
  trace(ctx, points, options.close);
  ctx.stroke();
  resetStroke(ctx);
  ctx.restore();
};

/** Total length of a polyline. */
export const polylineLength = (points: readonly Pt[]) => {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  }
  return total;
};

/**
 * Draws only the first `progress` fraction of a polyline. This is what gives
 * every garment seam its CAD-sketch "being plotted" feel.
 */
export const partialLine = (
  ctx: CanvasRenderingContext2D,
  points: readonly Pt[],
  progress: number,
  options: StrokeOptions = {},
) => {
  const p = clamp(progress);
  if (p <= 0 || points.length < 2) return;

  const total = polylineLength(points);
  if (total <= 0) return;
  let remaining = total * p;

  ctx.save();
  applyStroke(ctx, options);
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);

  for (let i = 1; i < points.length; i++) {
    const ax = points[i - 1][0];
    const ay = points[i - 1][1];
    const bx = points[i][0];
    const by = points[i][1];
    const segment = Math.hypot(bx - ax, by - ay);

    if (remaining >= segment) {
      ctx.lineTo(bx, by);
      remaining -= segment;
      continue;
    }

    if (remaining > 0) {
      const t = remaining / segment;
      ctx.lineTo(ax + (bx - ax) * t, ay + (by - ay) * t);
    }
    break;
  }

  ctx.stroke();
  resetStroke(ctx);
  ctx.restore();
};

/** Point at a fraction along a polyline — useful for moving laser heads. */
export const pointOnLine = (points: readonly Pt[], progress: number) => {
  const p = clamp(progress);
  const total = polylineLength(points);
  let remaining = total * p;

  for (let i = 1; i < points.length; i++) {
    const ax = points[i - 1][0];
    const ay = points[i - 1][1];
    const bx = points[i][0];
    const by = points[i][1];
    const segment = Math.hypot(bx - ax, by - ay);

    if (remaining <= segment) {
      const t = segment === 0 ? 0 : remaining / segment;
      return { x: ax + (bx - ax) * t, y: ay + (by - ay) * t };
    }
    remaining -= segment;
  }

  return { x: points[points.length - 1][0], y: points[points.length - 1][1] };
};

export const circle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  options: StrokeOptions = {},
) => {
  ctx.save();
  applyStroke(ctx, options);
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0.1, r), 0, Math.PI * 2);
  ctx.stroke();
  resetStroke(ctx);
  ctx.restore();
};

export const disc = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string = PALETTE.volt,
  alpha = 1,
) => {
  ctx.save();
  ctx.globalAlpha = clamp(alpha * ctx.globalAlpha);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0.1, r), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

export const ellipse = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  options: StrokeOptions = {},
) => {
  ctx.save();
  applyStroke(ctx, options);
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2);
  ctx.stroke();
  resetStroke(ctx);
  ctx.restore();
};

/** A rounded rectangle path, used for panels, pouches and filters. */
export const roundedPath = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) => {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

export type TextOptions = {
  size?: number;
  color?: string;
  alpha?: number;
  weight?: 400 | 700;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  /** Character tracking in canvas units. */
  tracking?: number;
};

/** Monospaced technical label. */
export const text = (
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  options: TextOptions = {},
) => {
  const alpha = options.alpha ?? 1;
  if (alpha <= 0 || !value) return;

  ctx.save();
  ctx.globalAlpha = clamp(alpha * ctx.globalAlpha);
  ctx.fillStyle = options.color ?? PALETTE.ink;
  ctx.font = `${options.weight ?? 400} ${options.size ?? 10}px ${MONO}`;
  ctx.textAlign = options.align ?? "left";
  ctx.textBaseline = options.baseline ?? "middle";

  const tracking = options.tracking ?? 0;
  if (tracking === 0) {
    ctx.fillText(value, x, y);
  } else {
    // Manual tracking keeps the look identical across browsers.
    const width =
      [...value].reduce((sum, char) => sum + ctx.measureText(char).width, 0) +
      tracking * Math.max(0, value.length - 1);
    let cursor = ctx.textAlign === "center" ? x - width / 2 : ctx.textAlign === "right" ? x - width : x;

    for (const char of value) {
      ctx.fillText(char, cursor, y);
      cursor += ctx.measureText(char).width + tracking;
    }
  }

  ctx.restore();
};

/** Typewriter progress for terminal read-outs. */
export const typed = (value: string, progress: number) =>
  value.slice(0, Math.round(value.length * clamp(progress)));

/** Filled panel with a clipped top-right corner. */
export const panel = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  alpha = 1,
) => {
  if (alpha <= 0) return;
  const cut = Math.min(10, w * 0.08, h * 0.25);

  ctx.save();
  ctx.globalAlpha = clamp(alpha * ctx.globalAlpha);
  ctx.fillStyle = PALETTE.panel;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w - cut, y);
  ctx.lineTo(x + w, y + cut);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(56, 189, 248, 0.28)";
  ctx.lineWidth = 0.75;
  ctx.stroke();
  ctx.restore();
};

/** Small technical tick marks on a horizontal axis. */
export const ticks = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  length: number,
  count: number,
  options: StrokeOptions = {},
) => {
  if (count < 2 || length <= 0) return;
  ctx.save();
  applyStroke(ctx, options);
  ctx.beginPath();
  for (let i = 0; i < count; i++) {
    const tx = x + (length * i) / (count - 1);
    const tall = i % 5 === 0;
    ctx.moveTo(tx, y);
    ctx.lineTo(tx, y - (tall ? 4 : 2));
  }
  ctx.stroke();
  resetStroke(ctx);
  ctx.restore();
};

/** Corner brackets used for targeting reticles. */
export const brackets = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  options: StrokeOptions = {},
) => {
  const arm = size * 0.32;
  ctx.save();
  applyStroke(ctx, options);
  ctx.beginPath();
  ctx.moveTo(x - size, y - size + arm);
  ctx.lineTo(x - size, y - size);
  ctx.lineTo(x - size + arm, y - size);
  ctx.moveTo(x + size - arm, y - size);
  ctx.lineTo(x + size, y - size);
  ctx.lineTo(x + size, y - size + arm);
  ctx.moveTo(x + size, y + size - arm);
  ctx.lineTo(x + size, y + size);
  ctx.lineTo(x + size - arm, y + size);
  ctx.moveTo(x - size + arm, y + size);
  ctx.lineTo(x - size, y + size);
  ctx.lineTo(x - size, y + size - arm);
  ctx.stroke();
  resetStroke(ctx);
  ctx.restore();
};

/** Simple dimension arrow. */
export const arrow = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  options: StrokeOptions & { head?: number } = {},
) => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = options.head ?? 3;

  ctx.save();
  applyStroke(ctx, options);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - Math.cos(angle - 0.5) * head, y2 - Math.sin(angle - 0.5) * head);
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - Math.cos(angle + 0.5) * head, y2 - Math.sin(angle + 0.5) * head);
  ctx.stroke();
  resetStroke(ctx);
  ctx.restore();
};

/** Soft bloom line, with a wider low-alpha pass underneath. */
export const bloomLine = (
  ctx: CanvasRenderingContext2D,
  points: readonly Pt[],
  color: string,
  width: number,
  alpha: number,
) => {
  line(ctx, points, { color, width: width * 5, alpha: alpha * 0.08 });
  line(ctx, points, { color, width: width * 2.2, alpha: alpha * 0.18 });
  line(ctx, points, { color, width, alpha });
};
