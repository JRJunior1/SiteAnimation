import { PALETTE, type IndustrialState, type SceneContext } from "./types";
import { buildGrid, drawWords } from "./stage";
import { drawFoundation } from "./foundation";
import { drawFabric } from "./fabric";
import { drawRigging } from "./rigging";
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

    const scene: SceneContext = {
      ctx,
      state,
      w: width,
      h: height,
      unit: Math.min(width, height) / 100,
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

    if (grid && state.grid > 0.001) {
      ctx.globalAlpha = state.grid;
      ctx.drawImage(grid, 0, 0, width, height);
      ctx.globalAlpha = 1;
    }

    // Words sit behind the gear, like the SEEDAfrique stage.
    drawWords(scene);

    // One specimen at a time. The timeline owns the fade windows, so these
    // never compete for the same patch of the stage.
    drawFoundation(scene);
    drawFabric(scene);
    drawRigging(scene);
    drawExtremities(scene);
    drawHelmetLayer(scene);
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
