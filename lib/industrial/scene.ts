import {
  PALETTE,
  clamp,
  lerp,
  type IndustrialState,
  type SceneContext,
} from "./types";
import { buildGrid, drawLanes, drawWords } from "./stage";
import { bootLead, drawFoundation } from "./foundation";
import { drawReflector, reflectorLead } from "./reflector";
import { drawExtremities, gloveLead } from "./extremities";
import { drawHelmetLayer, helmetLead } from "./headgear";

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
  /** Screen position of the plotter dot, including the current camera zoom. */
  getDotPosition: () => { x: number; y: number };
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

const leadAt = (scene: SceneContext, index: number) => {
  switch (clamp(Math.round(index), 0, SPECIMEN_COUNT - 1)) {
    case 0:
      return bootLead(scene);
    case 1:
      return reflectorLead(scene);
    case 2:
      return gloveLead(scene);
    default:
      return helmetLead(scene);
  }
};

const handoffPoint = (
  scene: SceneContext,
  from: { x: number; y: number },
  to: { x: number; y: number },
  t: number,
) => {
  const dx = to.x - from.x;
  const c1x = from.x + dx * 0.26;
  const c1y = from.y - scene.h * 0.16;
  const c2x = from.x + dx * 0.74;
  const c2y = to.y - scene.h * 0.1;
  const u = 1 - t;
  const uu = u * u;
  const tt = t * t;

  return {
    x: uu * u * from.x + 3 * uu * t * c1x + 3 * u * tt * c2x + tt * t * to.x,
    y: uu * u * from.y + 3 * uu * t * c1y + 3 * u * tt * c2y + tt * t * to.y,
  };
};

const dotPoint = (scene: SceneContext, trail = 0) => {
  const { state } = scene;
  const focus = clamp(state.focus, 0, SPECIMEN_COUNT - 1);
  const base = Math.floor(focus);
  const next = Math.min(base + 1, SPECIMEN_COUNT - 1);
  const frac = focus - base;
  const baseSketch = sketchAt(state, base);
  const nextSketch = sketchAt(state, next);

  let x: number;
  let y: number;

  if (frac > 0.001) {
    const from = plotterPoint(scene, base, baseSketch - trail);
    const anchor = leadAt(scene, next);
    const flight = smooth(frac / 0.18);
    const handoff = handoffPoint(scene, from, anchor, flight);
    const orbit = plotterPoint(scene, next, nextSketch - trail);
    const launch = smooth(clamp((nextSketch - trail) / 0.5));

    x = lerp(handoff.x, orbit.x, launch);
    y = lerp(handoff.y, orbit.y, launch);
  } else {
    const anchor = leadAt(scene, base);
    const orbit = plotterPoint(scene, base, baseSketch - trail);
    const launch = smooth(clamp((baseSketch - trail) / 0.5));

    x = lerp(anchor.x, orbit.x, launch);
    y = lerp(anchor.y, orbit.y, launch);
  }

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

  const focus = clamp(state.focus, 0, SPECIMEN_COUNT - 1);
  const base = Math.floor(focus);
  const next = Math.min(base + 1, SPECIMEN_COUNT - 1);
  const frac = focus - base;
  const morphing = frac > 0.001 && frac < 0.999;
  const leadIndex = morphing ? next : Math.round(focus);
  const lead = leadAt(scene, leadIndex);
  const leadSketch = sketchAt(state, leadIndex);
  const wake = smooth(state.flat) * state.stageIn;
  const halo = wake * (1 - smooth(clamp(leadSketch / 0.45)));
  const tether = morphing ? wake * (1 - smooth(frac / 0.22)) : 0;

  if (halo > 0.01) {
    const pulse = unit * (1.5 + 0.45 * Math.sin(scene.clock * 4.6));

    ctx.save();
    ctx.translate(lead.x, lead.y);
    ctx.rotate(lead.angle);
    ctx.globalAlpha = halo * 0.72;
    ctx.strokeStyle = PALETTE.orange;
    ctx.lineWidth = Math.max(1, unit * 0.11);
    ctx.beginPath();
    ctx.arc(0, 0, pulse, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-unit * 4.6, 0);
    ctx.lineTo(-pulse * 1.8, 0);
    ctx.moveTo(pulse * 1.8, 0);
    ctx.lineTo(unit * 4.6, 0);
    ctx.moveTo(0, -unit * 4.6);
    ctx.lineTo(0, -pulse * 1.8);
    ctx.moveTo(0, pulse * 1.8);
    ctx.lineTo(0, unit * 4.6);
    ctx.stroke();
    ctx.setLineDash([unit * 0.55, unit * 0.9]);
    ctx.globalAlpha = halo * 0.42;
    ctx.beginPath();
    ctx.moveTo(pulse * 1.7, 0);
    ctx.lineTo(unit * 8, 0);
    ctx.stroke();
    ctx.restore();
  }

  if (leadSketch > 0 && leadSketch < 0.32) {
    const contact = 1 - smooth(leadSketch / 0.32);

    ctx.save();
    ctx.globalAlpha = contact * 0.45;
    ctx.strokeStyle = PALETTE.cyan;
    ctx.lineWidth = Math.max(1, unit * 0.09);
    ctx.beginPath();
    ctx.arc(lead.x, lead.y, unit * (2 + leadSketch * 42), 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  if (tether > 0.01) {
    const midX = (position.x + lead.x) / 2;
    const midY = (position.y + lead.y) / 2 - h * 0.035;

    ctx.save();
    ctx.globalAlpha = tether * 0.5;
    ctx.strokeStyle = PALETTE.orange;
    ctx.lineWidth = Math.max(1, unit * 0.1);
    ctx.setLineDash([unit * 0.9, unit * 0.75]);
    ctx.beginPath();
    ctx.moveTo(position.x, position.y);
    ctx.quadraticCurveTo(midX, midY, lead.x, lead.y);
    ctx.stroke();
    ctx.restore();
  }

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
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    return {
      render: () => {},
      resize: () => {},
      destroy: () => {},
      getDotPosition: () => ({ x: 0, y: 0 }),
    };
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
    getDotPosition: () => {
      const unit = Math.min(width, height) / 100;
      const scene: SceneContext = {
        ctx,
        state,
        w: width,
        h: height,
        unit,
        now: performance.now() / 1000,
        clock,
      };
      const point = dotPoint(scene);
      // Match the camera transform used in `render`, minus the random shake
      // (which has fully settled by the time the outro wipe begins).
      const zoom = Math.max(0.2, state.zoom);
      return {
        x: width / 2 + (point.x - width / 2) * zoom,
        y: height / 2 + (point.y - height / 2) * zoom,
      };
    },
    destroy: () => {
      alive = false;
      window.removeEventListener("resize", onResize);
      grid = null;
    },
  };
};
