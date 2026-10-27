import { clamp, type SceneContext } from "./types";
import { GLOVES_BOUNDS, drawGloves } from "./gloves-blueprint";

/* -------------------------------------------------------------------------- */
/*  Specimen 04 — one work glove plots itself, holds, then clears.             */
/* -------------------------------------------------------------------------- */

const GLOVE_W = GLOVES_BOUNDS.maxX - GLOVES_BOUNDS.minX;
const GLOVE_H = GLOVES_BOUNDS.maxY - GLOVES_BOUNDS.minY;
const GLOVE_MID_X = (GLOVES_BOUNDS.minX + GLOVES_BOUNDS.maxX) / 2;
const GLOVE_MID_Y = (GLOVES_BOUNDS.minY + GLOVES_BOUNDS.maxY) / 2;

const gloveFit = (w: number, h: number) =>
  Math.min((w - 64) / GLOVE_W, (h - 190) / GLOVE_H, 1.55);

export const drawExtremities = (scene: SceneContext) => {
  const { ctx, state, w, h } = scene;
  if (state.gloves <= 0.001) return;

  const fit = gloveFit(w, h);

  ctx.save();
  ctx.translate(w / 2 - GLOVE_MID_X * fit, h * 0.5 - GLOVE_MID_Y * fit);
  ctx.scale(fit, fit);
  drawGloves(ctx, clamp(state.gloves));
  ctx.restore();
};
