import type { SceneContext } from "./types";
import { BOOT_BOUNDS, drawBoot } from "./boot-blueprint";

/* -------------------------------------------------------------------------- */
/*  Specimen 01 — a site boot plots itself at the centre of the stage.         */
/* -------------------------------------------------------------------------- */

const BOOT_W = BOOT_BOUNDS.maxX - BOOT_BOUNDS.minX;
const BOOT_H = BOOT_BOUNDS.maxY - BOOT_BOUNDS.minY;
const BOOT_MID_X = (BOOT_BOUNDS.minX + BOOT_BOUNDS.maxX) / 2;
const BOOT_MID_Y = (BOOT_BOUNDS.minY + BOOT_BOUNDS.maxY) / 2;

const bootFit = (w: number, h: number) =>
  Math.min((w - 56) / BOOT_W, (h - 150) / BOOT_H, 1.6);

export const drawFoundation = (scene: SceneContext) => {
  const { ctx, state, w, h } = scene;
  if (state.bootSketch <= 0.001) return;

  const fit = bootFit(w, h);

  ctx.save();
  ctx.translate(w / 2 - BOOT_MID_X * fit, h * 0.5 - BOOT_MID_Y * fit);
  ctx.scale(fit, fit);
  drawBoot(ctx, state.bootSketch);
  ctx.restore();
};
