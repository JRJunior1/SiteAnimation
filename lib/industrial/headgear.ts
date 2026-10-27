import type { SceneContext } from "./types";
import { drawHelmet } from "./helmet-blueprint";

/* -------------------------------------------------------------------------- */
/*  Specimen 05 — the helmet is plotted at the centre of the stage, in line    */
/*  with the other specimens, then holds as the last image before the reveal.  */
/* -------------------------------------------------------------------------- */

const HELMET_W = 340;
const HELMET_H = 210;
const HELMET_MID_X = 21;
const HELMET_MID_Y = -20;

const helmetFit = (w: number, h: number) =>
  Math.min((w - 40) / HELMET_W, (h - 170) / HELMET_H, 2);

export const drawHelmetLayer = (scene: SceneContext) => {
  const { ctx, state, w, h } = scene;
  if (state.helmet <= 0.001) return;

  const fit = helmetFit(w, h);

  ctx.save();
  ctx.translate(w / 2, h * 0.5);
  ctx.scale(fit, fit);
  ctx.translate(-HELMET_MID_X, -HELMET_MID_Y);
  drawHelmet(ctx, state.helmet);
  ctx.restore();
};
