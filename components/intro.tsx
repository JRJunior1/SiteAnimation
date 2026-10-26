"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { INTRO_KEY, INTRO_REPLAY_EVENT, SITE_ROUTES } from "@/lib/site";

const ORANGE = "#ff6f00";
const BLUE = "#3aa0ff";

const AFRICA_OUTLINE: [number, number][] = [
  [35.8, -5.8],
  [36.8, 3],
  [37, 10],
  [32.9, 13.2],
  [30.5, 19],
  [32.1, 20.1],
  [31.2, 29.9],
  [31.3, 32.3],
  [27.5, 33.9],
  [22, 36.8],
  [15.5, 39.5],
  [11.6, 43.1],
  [11.8, 51.3],
  [2, 45.3],
  [-4, 39.7],
  [-6.8, 39.3],
  [-10.5, 40.4],
  [-15, 40.7],
  [-19.8, 34.9],
  [-25.9, 32.6],
  [-29.9, 31],
  [-34, 25.6],
  [-34.8, 20],
  [-34, 18.4],
  [-28.6, 16.4],
  [-22.9, 14.5],
  [-16.5, 11.8],
  [-8.8, 13.2],
  [-5, 12],
  [0.4, 9.4],
  [4, 9.7],
  [4.3, 6],
  [6.4, 3.4],
  [5.6, -0.2],
  [5.3, -4],
  [4.4, -7.7],
  [8.5, -13.2],
  [11, -15.5],
  [14.7, -17.4],
  [20.9, -17],
  [26, -14.5],
  [30.4, -9.6],
  [33.6, -7.6],
];

const CITIES = [
  { code: "ACC", lat: 5.6, lon: -0.2 },
  { code: "KGL", lat: -1.95, lon: 30.06 },
  { code: "NBO", lat: -1.29, lon: 36.82 },
];

const insideAfrica = (lat: number, lon: number) => {
  let inside = false;
  for (let i = 0, j = AFRICA_OUTLINE.length - 1; i < AFRICA_OUTLINE.length; j = i++) {
    const [latI, lonI] = AFRICA_OUTLINE[i];
    const [latJ, lonJ] = AFRICA_OUTLINE[j];
    if (
      lonI > lon !== lonJ > lon &&
      lat < ((latJ - latI) * (lon - lonI)) / (lonJ - lonI) + latI
    ) {
      inside = !inside;
    }
  }
  return inside;
};

const AFRICA_POINTS: [number, number][] = [];
for (let lat = -35; lat <= 37; lat += 1.6) {
  for (let lon = -17.5; lon <= 51.5; lon += 1.6) {
    if (insideAfrica(lat, lon)) AFRICA_POINTS.push([lat, lon]);
  }
}

const rad = (degrees: number) => (degrees * Math.PI) / 180;
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const clamp = (value: number) => Math.min(1, Math.max(0, value));

type IntroState = {
  dot: number;
  pulse: number;
  ring: number;
  lanes: number;
  speed: number;
  flat: number;
  throwT: number;
  grid: number;
  angle: number;
  vector: number;
  apex: number;
  eq: number;
  squash: number;
  burst: number;
  shake: number;
  sceneB: number;
  toCenter: number;
  orbit: number;
  globe: number;
  africa: number;
  toAccra: number;
  arc1: number;
  arc2: number;
  labels: number;
  zoom: number;
  wordRun: number;
  wordThink: number;
  wordExplore: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
  c: string;
};

export default function Intro() {
  const router = useRouter();
  const [replayKey, setReplayKey] = useState(0);
  const [hidden, setHidden] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<() => void>(() => {});

  useEffect(() => {
    const onReplay = () => {
      window.scrollTo(0, 0);
      setHidden(false);
      setReplayKey((key) => key + 1);
    };

    window.addEventListener(INTRO_REPLAY_EVENT, onReplay);
    return () => window.removeEventListener(INTRO_REPLAY_EVENT, onReplay);
  }, []);

  useEffect(() => {
    const rootEl = document.documentElement;
    if (replayKey === 0 && rootEl.dataset.intro === "skip") return;

    const overlay = overlayRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!overlay || !canvas || !ctx) return;

    rootEl.dataset.intro = "play";

    const stage = document.getElementById("intro-stage");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let progress = replayKey !== 0 ? 100 : 0;
    let ready = replayKey !== 0;

    const bump = (amount: number) => {
      progress = Math.min(100, progress + amount);
      if (progress >= 100) ready = true;
    };

    if (replayKey === 0) {
      document.fonts.ready.then(() => bump(25));

      Promise.all(
        [...(stage?.querySelectorAll("img") ?? [])]
          .filter((img) => {
            const box = img.getBoundingClientRect();
            return (
              box.top < window.innerHeight &&
              box.bottom > 0 &&
              box.width > 0
            );
          })
          .map((img) =>
            img.complete
              ? img.decode().catch(() => {})
              : new Promise<void>((resolve) => {
                  img.addEventListener(
                    "load",
                    () => img.decode().catch(() => {}).then(() => resolve()),
                    { once: true },
                  );
                  img.addEventListener("error", () => resolve(), { once: true });
                }),
          ),
      ).then(() => bump(50));

      SITE_ROUTES.forEach((route) => router.prefetch(route));

      (document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) =>
            window.addEventListener("load", () => resolve(), { once: true }),
          )
      ).then(() => bump(25));
    }

    const failsafe = window.setTimeout(() => {
      progress = 100;
      ready = true;
    }, 9000);

    let dpr = 1;
    let W = 0;
    let H = 0;
    let unit = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      unit = Math.min(W, H) / 100;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
    };

    resize();
    window.addEventListener("resize", resize);

    const rootStyles = getComputedStyle(rootEl);
    const fontSans = `${
      rootStyles.getPropertyValue("--font-figtree").trim() || "sans-serif"
    }, sans-serif`;
    const fontHand = `"Bosk", ${
      rootStyles.getPropertyValue("--font-hand-fallback").trim() || "cursive"
    }, cursive`;

    const state: IntroState = {
      dot: 0,
      pulse: 0,
      ring: 0,
      lanes: 0,
      speed: 0,
      flat: 0,
      throwT: 0,
      grid: 0,
      angle: 0,
      vector: 0,
      apex: 0,
      eq: 0,
      squash: 0,
      burst: 0,
      shake: 0,
      sceneB: 1,
      toCenter: 0,
      orbit: 0,
      globe: 0,
      africa: 0,
      toAccra: 0,
      arc1: 0,
      arc2: 0,
      labels: 0,
      zoom: 1,
      wordRun: 0,
      wordThink: 0,
      wordExplore: 0,
    };

    let orbitPhase = 0;
    let clock = 0;
    let globeRot = 60;
    const particles: Particle[] = [];

    const easeOut = gsap.parseEase("expo.out");
    const easeIn = gsap.parseEase("expo.in");
    const TILT = rad(16);

    const baselineY = () => 0.74 * H;
    const startPoint = () => ({ x: 0.16 * W, y: baselineY() });
    const endPoint = () => ({ x: 0.8 * W, y: baselineY() });

    const projectile = (t: number) => {
      const start = startPoint();
      const end = endPoint();
      return {
        x: lerp(start.x, end.x, t),
        y: start.y - 0.42 * H * 4 * t * (1 - t),
      };
    };

    const center = () => ({ x: W / 2, y: 0.5 * H });
    const globeRadius = () => Math.min(0.4 * W, 0.38 * H);

    const spherePoint = (lat: number, lon: number) => {
      const c = center();
      const r = globeRadius();
      const theta = rad(lat);
      const phi = rad(lon - globeRot);
      return {
        x: c.x + r * Math.cos(theta) * Math.sin(phi),
        y:
          c.y -
          r *
            (Math.cos(TILT) * Math.sin(theta) -
              Math.sin(TILT) * Math.cos(theta) * Math.cos(phi)),
        z:
          Math.sin(TILT) * Math.sin(theta) +
          Math.cos(TILT) * Math.cos(theta) * Math.cos(phi),
      };
    };

    const drawWord = (
      text: string,
      alpha: number,
      y: number,
      slant: number,
      outline: boolean,
    ) => {
      if (alpha <= 0 || alpha >= 1) return;

      const size = Math.min(0.24 * W, 0.3 * H);
      const entering = clamp(alpha / 0.3);
      const leaving = clamp((alpha - 0.75) / 0.25);
      const x =
        W / 2 +
        (1 - easeOut(entering)) * W * 0.9 -
        easeIn(leaving) * W * 0.9 +
        (0.5 - alpha) * W * 0.14;

      ctx.save();
      ctx.translate(x, y);
      ctx.transform(
        1,
        0,
        -slant * (1 - 0.85 * easeOut(entering) + easeIn(leaving)),
        1,
        0,
        0,
      );
      ctx.font = `900 ${size}px ${fontSans}`;

      const fit = Math.min(1, (0.9 * W) / ctx.measureText(text).width);
      if (fit < 1) ctx.font = `900 ${size * fit}px ${fontSans}`;

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.globalAlpha = 1 - leaving;

      if (outline) {
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        ctx.fillText(text, 0, 0);
      }

      ctx.lineWidth = Math.max(1, 0.18 * unit);
      ctx.strokeStyle = "rgba(255,255,255,0.24)";
      ctx.strokeText(text, 0, 0);
      ctx.restore();
    };

    const drawArrow = (
      x: number,
      y: number,
      angle: number,
      length: number,
      color: string,
      alpha: number,
    ) => {
      if (alpha <= 0) return;

      const tipX = x + Math.cos(angle) * length * alpha;
      const tipY = y + Math.sin(angle) * length * alpha;
      const head = 1.2 * unit;

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 0.22 * unit;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(
        tipX - Math.cos(angle - 0.45) * head,
        tipY - Math.sin(angle - 0.45) * head,
      );
      ctx.lineTo(
        tipX - Math.cos(angle + 0.45) * head,
        tipY - Math.sin(angle + 0.45) * head,
      );
      ctx.closePath();
      ctx.fill();
    };

    const drawLabel = (
      text: string,
      x: number,
      y: number,
      alpha: number,
      size = 1.9,
      color = "rgba(255,255,255,0.75)",
      align: CanvasTextAlign = "left",
      hand = true,
    ) => {
      if (alpha <= 0) return;

      const previous = ctx.globalAlpha;
      ctx.globalAlpha = previous * alpha;
      ctx.font = hand
        ? `400 ${1.45 * size * unit}px ${fontHand}`
        : `700 ${size * unit}px ${fontSans}`;
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.textBaseline = "middle";
      ctx.fillText(text, x, y);
      ctx.globalAlpha = previous;
    };

    const spawnBurst = (x: number, y: number) => {
      for (let i = 0; i < 34; i++) {
        const angle = Math.PI + Math.random() * Math.PI;
        const speed = (0.6 + 1.6 * Math.random()) * unit * 0.9;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed * 1.4,
          life: 0,
          max: 0.5 + 0.6 * Math.random(),
          r: (0.25 + 0.5 * Math.random()) * unit,
          c: [ORANGE, ORANGE, BLUE, "#ffffff"][i % 4] as string,
        });
      }
    };

    const drawLanes = () => {
      if (state.lanes <= 0 || state.sceneB <= 0) return;

      const top = { x: W / 2, y: 0.36 * H };
      const baseline = baselineY();
      const spacing = 0.19 * Math.max(W, 1.2 * H);

      ctx.lineCap = "round";

      for (let i = 0; i < 9; i++) {
        const laneX = W / 2 + (i - 4) * spacing;
        const start = {
          x: lerp(top.x, 0, state.flat),
          y: lerp(top.y, baseline, state.flat),
        };
        const end = {
          x: lerp(laneX, W, state.flat),
          y: lerp(1.05 * H, baseline, state.flat),
        };
        const grow = clamp(state.lanes);
        const tip = {
          x: lerp(start.x, end.x, grow),
          y: lerp(start.y, end.y, grow),
        };
        const edge = i === 0 || i === 8;

        ctx.globalAlpha = state.sceneB * (edge ? 0.55 : 0.3);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 0.16 * unit;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(tip.x, tip.y);
        ctx.stroke();

        if (state.flat < 1 && i < 8) {
          const innerLaneX = W / 2 + (i + 0.5 - 4) * spacing;

          for (let k = 0; k < 10; k++) {
            const phase = (orbitPhase + k / 10) % 1;
            const head = Math.pow(phase, 2.3);
            const tail = Math.min(
              1,
              head + 0.09 * (0.2 + phase) * (0.5 + 0.5 * state.speed),
            );
            if (tail > grow) continue;

            ctx.globalAlpha = state.sceneB * (1 - state.flat) * phase * 0.9;
            ctx.strokeStyle =
              i % 3 === 1 ? ORANGE : "rgba(255,255,255,0.8)";
            ctx.lineWidth = unit * (0.1 + 0.6 * phase);
            ctx.beginPath();
            ctx.moveTo(
              lerp(top.x, innerLaneX, head),
              lerp(top.y, 1.05 * H, head),
            );
            ctx.lineTo(
              lerp(top.x, innerLaneX, tail),
              lerp(top.y, 1.05 * H, tail),
            );
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
    };

    const drawSceneB = () => {
      if (state.sceneB <= 0 || state.flat <= 0) return;

      const start = startPoint();
      const end = endPoint();

      ctx.save();
      ctx.globalAlpha = state.sceneB;

      if (state.grid > 0) {
        ctx.strokeStyle = `rgba(255,255,255,${0.07 * state.grid})`;
        ctx.lineWidth = 1;
        const cell = 6 * unit;
        ctx.beginPath();

        for (let x = start.x % cell; x < W; x += cell) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, baselineY());
        }
        for (let y = baselineY(); y > 0; y -= cell) {
          ctx.moveTo(0, y);
          ctx.lineTo(W, y);
        }
        ctx.stroke();
      }

      if (state.throwT > 0) {
        ctx.setLineDash([0.9 * unit, 1.1 * unit]);
        ctx.strokeStyle = ORANGE;
        ctx.lineWidth = 0.35 * unit;
        ctx.lineCap = "round";
        ctx.beginPath();

        for (let i = 0; i <= 80; i++) {
          const point = projectile((i / 80) * state.throwT);
          if (i === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        }

        ctx.stroke();
        ctx.setLineDash([]);
      }

      const throwAngle = Math.atan2(-(0.42 * H * 4), end.x - start.x);

      if (state.angle > 0) {
        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.lineWidth = 0.16 * unit;
        ctx.beginPath();
        ctx.arc(
          start.x,
          start.y,
          7 * unit,
          0,
          throwAngle * state.angle,
          true,
        );
        ctx.stroke();
        drawLabel(
          "θ",
          start.x + 9 * unit * Math.cos(throwAngle / 2),
          start.y + 9 * unit * Math.sin(throwAngle / 2),
          state.angle,
          2.2,
        );
      }

      drawArrow(start.x, start.y, throwAngle, 14 * unit, BLUE, state.vector);
      drawLabel(
        "v₀",
        start.x + Math.cos(throwAngle) * unit * 15 + unit,
        start.y + Math.sin(throwAngle) * unit * 15,
        state.vector,
        2,
        BLUE,
      );

      if (state.apex > 0) {
        const apex = projectile(0.5);

        ctx.setLineDash([0.4 * unit, 0.6 * unit]);
        ctx.strokeStyle = "rgba(255,255,255,0.45)";
        ctx.lineWidth = 0.14 * unit;
        ctx.beginPath();
        ctx.moveTo(apex.x, apex.y);
        ctx.lineTo(apex.x, lerp(apex.y, baselineY(), state.apex));
        ctx.stroke();
        ctx.setLineDash([]);

        drawLabel(
          "h",
          apex.x + 1.4 * unit,
          (apex.y + baselineY()) / 2,
          state.apex,
          2.2,
        );
        drawArrow(apex.x, apex.y - 2.8 * unit, 0, 9 * unit, BLUE, state.apex);
        drawLabel(
          "vₓ",
          apex.x + 10.5 * unit,
          apex.y - 2.8 * unit,
          state.apex,
          2,
          BLUE,
        );
      }

      if (state.eq > 0) {
        const equation = "y = x·tanθ − gx² / 2v₀²cos²θ";
        drawLabel(
          equation.slice(0, Math.round(equation.length * state.eq)),
          start.x,
          0.12 * H + 3.6 * unit,
          1,
          2.4,
          "rgba(255,255,255,0.9)",
        );
      }

      ctx.restore();
    };

    const drawGlobe = (now: number) => {
      const c = center();
      const r = globeRadius();
      const g = state.globe;

      ctx.lineWidth = Math.max(1, 0.14 * unit);

      if (state.orbit > 0) {
        [-32, 0, 32].forEach((tilt, i) => {
          const rotation = lerp(rad(60 * i) + orbitPhase, 0, g);
          const rx = lerp(26 * unit, r * Math.cos(rad(tilt)), g);
          const ry = lerp(
            8.5 * unit,
            r * Math.cos(rad(tilt)) * Math.sin(TILT),
            g,
          );
          const cy = lerp(
            c.y,
            c.y - r * Math.sin(rad(tilt)) * Math.cos(TILT),
            g,
          );

          ctx.strokeStyle =
            i === 1 ? "rgba(58,160,255,0.9)" : "rgba(255,255,255,0.55)";
          ctx.beginPath();
          ctx.ellipse(c.x, cy, rx, ry, rotation, 0, 2 * Math.PI * state.orbit);
          ctx.stroke();

          if (g < 1) {
            const phase = now / (380 + 90 * i) + 2 * i;
            const px = Math.cos(phase) * rx;
            const py = Math.sin(phase) * ry;

            ctx.globalAlpha = state.orbit * (1 - g);
            ctx.fillStyle = i === 1 ? ORANGE : "#ffffff";
            ctx.beginPath();
            ctx.arc(
              c.x + px * Math.cos(rotation) - py * Math.sin(rotation),
              cy + px * Math.sin(rotation) + py * Math.cos(rotation),
              0.7 * unit,
              0,
              2 * Math.PI,
            );
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        });
      }

      if (g <= 0) return;

      ctx.globalAlpha = g;
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath();
      ctx.arc(c.x, c.y, r, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255,255,255,0.14)";

      for (let lon = -180; lon < 180; lon += 20) {
        let started = false;
        ctx.beginPath();

        for (let lat = -90; lat <= 90; lat += 6) {
          const point = spherePoint(lat, lon);
          if (point.z < 0) {
            started = false;
            continue;
          }
          if (started) ctx.lineTo(point.x, point.y);
          else ctx.moveTo(point.x, point.y);
          started = true;
        }

        ctx.stroke();
      }

      if (state.africa > 0) {
        ctx.fillStyle = "#ffffff";
        const dot = Math.max(0.8, 0.0075 * r);

        AFRICA_POINTS.forEach(([lat, lon], i) => {
          const point = spherePoint(lat, lon);
          if (point.z <= 0.05) return;

          const alpha = clamp(
            1.6 * state.africa - (i / AFRICA_POINTS.length) * 0.6,
          );
          if (alpha <= 0) return;

          ctx.globalAlpha = alpha * g * (0.3 + 0.55 * point.z);
          ctx.beginPath();
          ctx.arc(point.x, point.y, dot, 0, 2 * Math.PI);
          ctx.fill();
        });
      }

      const accra = spherePoint(CITIES[0].lat, CITIES[0].lon);

      const drawArc = (
        city: (typeof CITIES)[number],
        amount: number,
        heightFactor: number,
      ) => {
        if (amount <= 0) return;

        const target = spherePoint(city.lat, city.lon);
        const midX = (accra.x + target.x) / 2;
        const midY = (accra.y + target.y) / 2 - r * heightFactor;

        ctx.globalAlpha = 1;
        ctx.setLineDash([0.7 * unit, 0.8 * unit]);
        ctx.strokeStyle = ORANGE;
        ctx.lineWidth = 0.3 * unit;
        ctx.beginPath();

        let headX = accra.x;
        let headY = accra.y;

        for (let i = 0; i <= 40; i++) {
          const t = (i / 40) * amount;
          headX =
            (1 - t) * (1 - t) * accra.x +
            2 * (1 - t) * t * midX +
            t * t * target.x;
          headY =
            (1 - t) * (1 - t) * accra.y +
            2 * (1 - t) * t * midY +
            t * t * target.y;

          if (i === 0) ctx.moveTo(headX, headY);
          else ctx.lineTo(headX, headY);
        }

        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(headX, headY, 0.55 * unit, 0, 2 * Math.PI);
        ctx.fill();

        if (amount >= 1) {
          ctx.strokeStyle = BLUE;
          ctx.lineWidth = 0.25 * unit;
          ctx.beginPath();
          ctx.arc(
            target.x,
            target.y,
            unit * (1.1 + 0.25 * Math.sin(now / 200)),
            0,
            2 * Math.PI,
          );
          ctx.stroke();
        }
      };

      drawArc(CITIES[1], state.arc1, 0.38);
      drawArc(CITIES[2], state.arc2, 0.24);

      ctx.globalAlpha = 1;

      CITIES.forEach((city, i) => {
        const point = spherePoint(city.lat, city.lon);
        const alpha =
          i === 0
            ? state.labels
            : clamp(
                (i === 1 ? state.arc1 : state.arc2) * 3 - 2,
              );

        drawLabel(
          city.code,
          point.x + (i === 2 ? 2.2 * unit : -2.2 * unit),
          point.y + (i === 1 ? -2.6 * unit : 3 * unit),
          alpha,
          1.8,
          "rgba(255,255,255,0.9)",
          i === 2 ? "left" : "right",
          false,
        );
      });
    };

    const drawParticles = (dt: number) => {
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];

        particle.life += dt;
        if (particle.life > particle.max) {
          particles.splice(i, 1);
          continue;
        }

        particle.vy += 0.09 * unit;
        particle.x += particle.vx;
        particle.y += particle.vy;

        ctx.globalAlpha = 1 - particle.life / particle.max;
        ctx.fillStyle = particle.c;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.r, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    };

    const dotPosition = (now: number) => {
      let position = { x: W / 2, y: 0.5 * H };

      if (state.lanes > 0) {
        const grow = clamp(state.lanes);
        const bob =
          Math.abs(Math.sin(now / 105)) * unit * 4 * Math.min(1, state.speed);
        position = {
          x: W / 2,
          y: lerp(position.y, 0.8 * H - bob, grow),
        };
      }

      if (state.flat > 0) {
        const start = startPoint();
        position = {
          x: lerp(position.x, start.x, state.flat),
          y: lerp(position.y, start.y - state.dot * unit, state.flat),
        };
      }

      if (state.throwT > 0) {
        const point = projectile(state.throwT);
        position = { x: point.x, y: point.y - state.dot * unit };
      }

      if (state.toCenter > 0) {
        const c = center();
        position = {
          x: lerp(position.x, c.x, state.toCenter),
          y: lerp(position.y, c.y, state.toCenter),
        };
      }

      if (state.toAccra > 0) {
        const accra = spherePoint(CITIES[0].lat, CITIES[0].lon);
        position = {
          x: lerp(position.x, accra.x, state.toAccra),
          y: lerp(position.y, accra.y, state.toAccra),
        };
      }

      return position;
    };

    const drawDot = (now: number) => {
      if (state.dot <= 0) return;

      const position = dotPosition(now);
      const radius = state.dot * unit * (1 + 0.25 * state.pulse);

      if (state.ring > 0 && state.ring < 1) {
        ctx.globalAlpha = 1 - state.ring;
        ctx.strokeStyle = ORANGE;
        ctx.lineWidth = 0.25 * unit;
        ctx.beginPath();
        ctx.arc(
          position.x,
          position.y,
          radius + state.ring * unit * 22,
          0,
          2 * Math.PI,
        );
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      if (state.throwT > 0 && state.throwT < 1) {
        ctx.fillStyle = ORANGE;

        for (let trail = 1; trail <= 6; trail++) {
          const point = projectile(Math.max(0, state.throwT - 0.018 * trail));
          ctx.globalAlpha = 0.5 - 0.075 * trail;
          ctx.beginPath();
          ctx.arc(
            point.x,
            point.y - state.dot * unit,
            radius * (1 - 0.1 * trail),
            0,
            2 * Math.PI,
          );
          ctx.fill();
        }

        ctx.globalAlpha = 1;
      }

      if (state.burst > 0 && state.burst < 1) {
        ctx.globalAlpha = 1 - state.burst;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 0.3 * unit * (1 - state.burst);
        ctx.beginPath();
        ctx.ellipse(
          endPoint().x,
          baselineY(),
          state.burst * unit * 20,
          state.burst * unit * 4,
          0,
          0,
          2 * Math.PI,
        );
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      if (state.lanes > 0 && state.flat < 1) {
        const fade = clamp((0.8 * H - position.y) / (4 * unit));
        ctx.globalAlpha = (1 - state.flat) * (0.45 - 0.25 * fade);
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.ellipse(
          position.x,
          0.8 * H + 1.1 * radius,
          radius * (1.3 - 0.4 * fade),
          0.35 * radius,
          0,
          0,
          2 * Math.PI,
        );
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.fillStyle = ORANGE;
      ctx.beginPath();
      ctx.ellipse(
        position.x,
        position.y + state.squash * radius * 0.45,
        radius * (1 + 0.55 * state.squash),
        radius * (1 - 0.45 * state.squash),
        0,
        0,
        2 * Math.PI,
      );
      ctx.fill();
    };

    let lastTime = performance.now();

    const render = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      orbitPhase = (orbitPhase + dt * state.speed * 1.4) % 1;
      clock += 40 * dt;

      if (state.globe > 0) {
        globeRot = lerp(globeRot, 14 + 4 * Math.sin(now / 2400), 0.035);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#0c1b2a";
      ctx.fillRect(0, 0, W, H);

      const shakeX = (Math.random() - 0.5) * state.shake * unit * 1.6;
      const shakeY = (Math.random() - 0.5) * state.shake * unit * 1.6;
      const accra = spherePoint(CITIES[0].lat, CITIES[0].lon);

      ctx.translate(accra.x + shakeX, accra.y + shakeY);
      ctx.scale(state.zoom, state.zoom);
      ctx.translate(-accra.x, -accra.y);

      drawWord("RUN", state.wordRun, 0.36 * H, 0.5, true);
      drawWord("THINK", state.wordThink, 0.44 * H, 0.35, false);
      drawWord("EXPLORE", state.wordExplore, 0.5 * H, 0.35, false);
      drawLanes();
      drawSceneB();
      drawGlobe(now);
      drawParticles(dt);
      drawDot(now);

      if (progressRef.current) {
        const pct = Math.round(progress);
        progressRef.current.style.transform = `scaleX(${pct / 100})`;
      }
    };

    const hide = () => {
      delete rootEl.dataset.intro;
      setHidden(true);
    };

    let skipped = false;

    const exit = gsap.timeline({ paused: true });

    exit
      .to(chromeRef.current, { opacity: 0, duration: 0.25 }, 0)
      .call(
        () => {
          if (!stage) return;
          const accra = spherePoint(CITIES[0].lat, CITIES[0].lon);

          Object.assign(stage.style, {
            position: "relative",
            zIndex: "300",
            background: "var(--color-sa-cream)",
            transformOrigin: `${accra.x}px ${accra.y}px`,
            transform: "scale(1.18)",
            clipPath: `circle(0px at ${accra.x}px ${accra.y}px)`,
            willChange: "clip-path, transform",
          });
        },
        [],
        0,
      )
      .to(state, { zoom: 0.86, duration: 0.24, ease: "power2.out" }, 0)
      .to(state, { zoom: 9, duration: 0.95, ease: "expo.in" }, 0.24)
      .call(
        () => {
          if (!stage) return Promise.resolve();

          const accra = spherePoint(CITIES[0].lat, CITIES[0].lon);
          const maxRadius =
            Math.hypot(
              Math.max(accra.x, W - accra.x),
              Math.max(accra.y, H - accra.y),
            ) + 2;
          const origin = `at ${accra.x}px ${accra.y}px`;

          const reveal = stage.animate(
            [
              { clipPath: `circle(0px ${origin})`, transform: "scale(1.18)" },
              {
                clipPath: `circle(${maxRadius}px ${origin})`,
                transform: "scale(1)",
              },
            ],
            {
              duration: 950,
              easing: "cubic-bezier(0.7, 0, 0.2, 1)",
              fill: "forwards",
            },
          );

          return reveal.finished.then(() => {
            overlay.style.display = "none";
            gsap.ticker.remove(render);
            reveal.cancel();
            stage.removeAttribute("style");
            hide();
          });
        },
        [],
        0.42,
      );

    const finish = () => {
      if (skipped) return;
      skipped = true;

      try {
        sessionStorage.setItem(INTRO_KEY, "1");
      } catch {
        // Storage can be unavailable in private mode.
      }

      intro.pause();

      if (reduced) {
        gsap.to(overlay, { opacity: 0, duration: 0.35, onComplete: hide });
      } else {
        exit.play();
      }
    };

    skipRef.current = finish;

    const startWhenReady = () => {
      const check = () => {
        if (ready) finish();
        else window.setTimeout(check, 50);
      };
      check();
    };

    const intro = gsap.timeline({ paused: true });

    if (reduced) {
      state.dot = 1.8;
      startWhenReady();
    } else {
      intro
        .to(state, { dot: 1.8, duration: 0.55, ease: "back.out(3)" }, 0.15)
        .to(
          state,
          { pulse: 1, duration: 0.12, yoyo: true, repeat: 3, ease: "sine.inOut" },
          0.55,
        )
        .fromTo(
          state,
          { ring: 0 },
          { ring: 1, duration: 0.8, ease: "expo.out" },
          0.6,
        )
        .to(state, { lanes: 1, duration: 0.5, ease: "expo.out" }, 0.95)
        .to(state, { speed: 1.6, duration: 0.6, ease: "power2.in" }, 0.95)
        .to(state, { wordRun: 1, duration: 1.15, ease: "none" }, 1)
        .to(state, { speed: 0, duration: 0.4, ease: "power2.out" }, 2)
        .to(state, { flat: 1, duration: 0.45, ease: "expo.inOut" }, 2)
        .to(state, { grid: 1, duration: 0.6 }, 2.3)
        .to(state, { angle: 1, duration: 0.35, ease: "power2.out" }, 2.4)
        .to(state, { vector: 1, duration: 0.35, ease: "back.out(2)" }, 2.45)
        .to(state, { squash: 0.5, duration: 0.12, yoyo: true, repeat: 1 }, 2.48)
        .to(state, { throwT: 1, duration: 1.15, ease: "none" }, 2.6)
        .to(state, { eq: 1, duration: 0.8, ease: "none" }, 2.65)
        .to(state, { wordThink: 1, duration: 1.4, ease: "none" }, 2.55)
        .to(state, { apex: 1, duration: 0.4, ease: "power2.out" }, 3.15)
        .call(() => spawnBurst(endPoint().x, baselineY()), [], 3.75)
        .to(state, { squash: 0.85, duration: 0.07, yoyo: true, repeat: 1 }, 3.75)
        .fromTo(
          state,
          { burst: 0 },
          { burst: 1, duration: 0.6, ease: "expo.out" },
          3.75,
        )
        .fromTo(
          state,
          { shake: 1 },
          { shake: 0, duration: 0.45, ease: "power2.out" },
          3.75,
        )
        .to(state, { sceneB: 0, duration: 0.45, ease: "power2.in" }, 4.05)
        .to(state, { toCenter: 1, duration: 0.6, ease: "expo.inOut" }, 4)
        .to(state, { orbit: 1, duration: 0.6, ease: "power3.out" }, 4.3)
        .to(state, { globe: 1, duration: 0.8, ease: "expo.inOut" }, 4.85)
        .to(state, { dot: 0.9, duration: 0.6, ease: "power2.inOut" }, 4.95)
        .to(state, { toAccra: 1, duration: 0.7, ease: "expo.inOut" }, 5)
        .to(state, { africa: 1, duration: 0.9, ease: "power1.out" }, 5.05)
        .to(state, { labels: 1, duration: 0.3 }, 5.6)
        .to(state, { arc1: 1, duration: 0.7, ease: "power2.inOut" }, 5.65)
        .to(state, { arc2: 1, duration: 0.7, ease: "power2.inOut" }, 5.9)
        .to(state, { wordExplore: 1, duration: 1.5, ease: "none" }, 5)
        .call(startWhenReady, [], 6.35)
        .play();
    }

    gsap.ticker.add(render);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      gsap.ticker.remove(render);
      intro.kill();
      exit.kill();
      clearTimeout(failsafe);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      stage?.getAnimations().forEach((animation) => animation.cancel());
      stage?.removeAttribute("style");
      delete rootEl.dataset.intro;
    };
  }, [replayKey, router]);

  if (hidden) return null;

  return (
    <div
      ref={overlayRef}
      id="sa-intro"
      aria-label="Loading SEEDAfrique"
      className="fixed inset-0 z-[200] bg-sa-night text-white"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      />

      <div
        ref={chromeRef}
        className="absolute bottom-5 right-5 md:bottom-7 md:right-8"
      >
        <button
          type="button"
          onClick={() => skipRef.current()}
          className="rounded-full px-3 py-1.5 text-[12px] font-medium text-white/45 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/60"
        >
          Skip
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10">
        <div
          ref={progressRef}
          className="h-full origin-left scale-x-0 bg-sa-orange"
        />
      </div>
    </div>
  );
}
