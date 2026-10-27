import {
  PALETTE,
  clamp,
  lerp,
  type IndustrialState,
  type SceneContext,
} from "./types";
import { buildGrid, drawLanes, drawWords } from "./stage";
import { drawFoundation } from "./foundation";
import { drawReflector } from "./reflector";
import { drawExtremities } from "./extremities";
import { drawHelmetLayer } from "./headgear";

/* -------------------------------------------------------------------------- */
/*  The single canvas render loop.                                            */
/*                                                                            */
/*  GSAP's ticker calls `render` on every animation frame. The loop reads the  */
/*  state object once, clears the canvas, and paints the stage. Only the       */
/*  editorial page underneath is DOM.                                         */
/* -------------------------------------------------------------------------- */

export type IndustrialRenderer = {
  render: () => void;
  resize: () => void;
  destroy: () => void;
};

const TAU = Math.PI * 2;

const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

/**
 * The four specimens share one carousel track. `state.focus` is the playhead:
 * whole numbers hold one specimen, fractions crossfade the poses in place as
 * the incoming one plots. This is what stops the sequence reading as four cuts.
 */
const SPECIMEN_COUNT = 4;

const sketchAt = (state: IndustrialState, index: number) => {
  switch (index) {
    case 0:
      return state.bootSketch;
    case 1:
      return state.reflector;
    case 2:
      return state.gloves;
    default:
      return state.helmet;
  }
};

/**
 * Where the orange plotter head sits while each specimen draws. The head runs
 * a wide elliptical pass around the active object, then arcs across to the next
 * object's starting point during a morph.
 */
const DOT_RINGS = [
  { rx: 0.23, ry: 0.12 },
  { rx: 0.17, ry: 0.22 },
  { rx: 0.12, ry: 0.19 },
  { rx: 0.2, ry: 0.09 },
] as const;

const plotterPoint = (scene: SceneContext, index: number, progress: number) => {
  const ring = DOT_RINGS[clamp(Math.round(index), 0, DOT_RINGS.length - 1)];
  const rx = Math.min(scene.w * ring.rx, scene.h * 0.34);
  const ry = scene.h * ring.ry;
  const angle = -Math.PI / 2 + clamp(progress) * Math.PI * 1.55;

  return {
    x: scene.w / 2 + Math.cos(angle) * rx,
    y: scene.h / 2 + Math.sin(angle) * ry,
  };
};

const dotPoint = (scene: SceneContext, trail = 0) => {
  const { state } = scene;
  const focus = clamp(state.focus, 0, SPECIMEN_COUNT - 1);
  const base = Math.floor(focus);
  const next = Math.min(base + 1, SPECIMEN_COUNT - 1);
  const frac = focus - base;

  const from = plotterPoint(scene, base, sketchAt(state, base) - trail);
  const to = plotterPoint(scene, next, sketchAt(state, next) - trail);
  const t = smooth(frac);

  let x = lerp(from.x, to.x, t);
  let y = lerp(from.y, to.y, t);

  // The hand-off lifts over the stage like a thrown arc instead of sliding.
  if (frac > 0) y -= Math.sin(Math.PI * t) * scene.h * 0.055;

  // Blend out of the opening position above the lane floor.
  const bob =
    Math.abs(Math.sin(scene.clock * 9.5)) *
    scene.unit *
    3.2 *
    Math.min(1, state.speed);
  const introY = lerp(scene.h * 0.5, scene.h * 0.8 - bob, smooth(state.lanes));
  const blend = smooth(state.flat);

  x = lerp(scene.w / 2, x, blend);
  y = lerp(introY, y, blend);

  return { x, y };
};

const morphAt = (scene: SceneContext) => {
  const { state } = scene;
  const focus = clamp(state.focus, 0, SPECIMEN_COUNT - 1);
  const base = Math.floor(focus);
  const next = Math.min(base + 1, SPECIMEN_COUNT - 1);
  const frac = focus - base;
  const active = frac > 0.001 && frac < 0.999;
  const eased = smooth(frac);

  return { base, next, frac, active, eased };
};

const withPose = (scene: SceneContext, index: number, draw: () => void) => {
  const { ctx, state, w, h, unit } = scene;
  if (state.stageIn <= 0.002) return;

  const focus = clamp(state.focus, 0, SPECIMEN_COUNT - 1);
  const base = Math.floor(focus);
  const next = Math.min(base + 1, SPECIMEN_COUNT - 1);
  const frac = focus - base;
  const morphing = frac > 0.001 && frac < 0.999;

  if (morphing) {
    if (index !== base && index !== next) return;
  } else if (index !== Math.round(focus)) {
    return;
  }

  const morph = morphAt(scene);
  const incoming = morphing && index === next;
  const outgoing = morphing && index === base;
  const settle = morph.eased;

  // The two poses briefly share the stage: the old one recedes as the new
  // one resolves in place. No page-wide wipe, no burst.
  const fade = incoming ? settle : 1 - settle;
  if (fade <= 0.002) return;

  const scale = incoming
    ? lerp(1.035, 1, settle)
    : 1 + settle * 0.012;
  const stretch = incoming
    ? lerp(0.975, 1, settle)
    : 1 + settle * 0.006;
  const lift = incoming
    ? (1 - settle) * unit * 7
    : -settle * unit * 3;

  ctx.save();
  ctx.globalAlpha *= state.stageIn * fade;
  ctx.translate(w / 2, h / 2 + lift);
  ctx.rotate(incoming ? (1 - settle) * 0.012 : -settle * 0.007);
  ctx.scale(scale, scale * stretch);
  ctx.translate(-w / 2, -h / 2);
  draw();
  ctx.restore();
};

const drawPlotter = (scene: SceneContext) => {
  const { ctx, state, h, unit } = scene;
  if (state.dot <= 0.001) return;

  const position = dotPoint(scene);
  const radius = state.dot * unit * (0.82 + 0.24 * state.pulse);

  // Contact shadow while the dot still belongs to the lane floor.
  if (state.lanes > 0 && state.flat < 0.999) {
    const fade = clamp((0.8 * h - position.y) / (4 * unit));
    ctx.save();
    ctx.globalAlpha = (1 - state.flat) * (0.4 - 0.22 * fade);
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.ellipse(
      position.x,
      0.8 * h + 1.1 * radius,
      radius * (1.3 - 0.4 * fade),
      0.35 * radius,
      0,
      0,
      TAU,
    );
    ctx.fill();
    ctx.restore();
  }

  // The opening sonar ring.
  if (state.ring > 0.001 && state.ring < 0.999) {
    ctx.save();
    ctx.globalAlpha = 1 - state.ring;
    ctx.strokeStyle = PALETTE.orange;
    ctx.lineWidth = Math.max(1, 0.22 * unit);
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius + state.ring * unit * 22, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  // A short comet trail keeps the head connected across morphs.
  ctx.save();
  ctx.fillStyle = PALETTE.orange;
  for (let k = 5; k >= 1; k--) {
    const tail = dotPoint(scene, k * 0.012);
    const fade = 1 - k / 6;
    ctx.globalAlpha = fade * fade * 0.36;
    ctx.beginPath();
    ctx.arc(tail.x, tail.y, radius * (0.35 + 0.55 * fade), 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = PALETTE.orange;
  ctx.shadowColor = PALETTE.orange;
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(position.x, position.y, radius, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,244,236,0.7)";
  ctx.beginPath();
  ctx.arc(position.x, position.y, radius * 0.34, 0, TAU);
  ctx.fill();
  ctx.restore();
};

export const createIndustrialRenderer = (
  canvas: HTMLCanvasElement,
  state: IndustrialState,
): IndustrialRenderer => {
  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
  if (!ctx) {
    return { render: () => {}, resize: () => {}, destroy: () => {} };
  }

  let width = 1;
  let height = 1;
  let dpr = 1;
  let grid: HTMLCanvasElement | null = null;
  let last = performance.now();
  let clock = 0;
  let alive = true;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    grid = buildGrid(width, height, dpr);
    // Do not touch the state or the timeline — progress survives resizes.
  };

  const render = () => {
    if (!alive) return;

    const nowMs = performance.now();
    const dt = Math.min(0.05, (nowMs - last) / 1000);
    last = nowMs;
    clock += dt;

    const unit = Math.min(width, height) / 100;
    const scene: SceneContext = {
      ctx,
      state,
      w: width,
      h: height,
      unit,
      now: nowMs / 1000,
      clock,
    };

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
    ctx.setLineDash([]);
    ctx.clearRect(0, 0, width, height);

    // Matte stage.
    ctx.fillStyle = PALETTE.bg;
    ctx.fillRect(0, 0, width, height);

    // Camera: a small impact shake, then the final dive into the last frame.
    const shakeX = (Math.random() - 0.5) * state.shake * unit * 1.4;
    const shakeY = (Math.random() - 0.5) * state.shake * unit * 1.4;
    const zoom = Math.max(0.2, state.zoom);

    ctx.translate(width / 2 + shakeX, height / 2 + shakeY);
    ctx.scale(zoom, zoom);
    ctx.translate(-width / 2, -height / 2);

    if (grid && state.grid > 0.001) {
      ctx.globalAlpha = state.grid;
      ctx.drawImage(grid, 0, 0, width, height);
      ctx.globalAlpha = 1;
    }

    // Words sit behind the gear, like the SEEDAfrique stage.
    drawWords(scene);
    drawLanes(scene);

    // One specimen is always plotting into the next. The timeline owns the
    // sketch progress; the crossfade owns the hand-off.
    withPose(scene, 0, () => drawFoundation(scene));
    withPose(scene, 1, () => drawReflector(scene));
    withPose(scene, 2, () => drawExtremities(scene));
    withPose(scene, 3, () => drawHelmetLayer(scene));

    drawPlotter(scene);
  };

  const onResize = () => resize();

  resize();
  window.addEventListener("resize", onResize, { passive: true });

  return {
    render,
    resize,
    destroy: () => {
      alive = false;
      window.removeEventListener("resize", onResize);
      grid = null;
    },
  };
};
