"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { createIndustrialRenderer, type IndustrialRenderer } from "@/lib/industrial/scene";
import { initialIndustrialState, type IndustrialState } from "@/lib/industrial/types";

gsap.registerPlugin(useGSAP);

type IndustrialIntroProps = {
  onReveal: () => void;
  onComplete: () => void;
};

/* -------------------------------------------------------------------------- */
/*  The React wrapper. GSAP owns the master timeline; the canvas only reads    */
/*  the state object that the timeline mutates.                               */
/* -------------------------------------------------------------------------- */

export default function IndustrialIntro({ onReveal, onComplete }: IndustrialIntroProps) {
  const [hidden, setHidden] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<IndustrialState>(initialIndustrialState());
  const rendererRef = useRef<IndustrialRenderer | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const skipRef = useRef<() => void>(() => {});
  const callbacksRef = useRef({ onReveal, onComplete });

  useEffect(() => {
    callbacksRef.current = { onReveal, onComplete };
  }, [onReveal, onComplete]);

  useGSAP(
    () => {
      const root = rootRef.current;
      const canvas = canvasRef.current;
      if (!root || !canvas) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Reduced-motion users get the finished storefront immediately.
      if (reduced) {
        setHidden(true);
        callbacksRef.current.onReveal();
        callbacksRef.current.onComplete();
        return;
      }

      const state = initialIndustrialState();
      stateRef.current = state;

      const renderer = createIndustrialRenderer(canvas, state);
      rendererRef.current = renderer;
      gsap.ticker.add(renderer.render);
      renderer.render();

      const progressBar = progressRef.current;
      const paintProgress = () => {
        if (!progressBar) return;
        progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, state.progress))})`;
      };
      gsap.ticker.add(paintProgress);

      document.documentElement.classList.add("if-intro-active");

      let done = false;
      let started = false;
      let wiping = false;

      const reveal = () => {
        callbacksRef.current.onReveal();
      };

      const cleanup = () => {
        gsap.ticker.remove(renderer.render);
        gsap.ticker.remove(paintProgress);
        renderer.destroy();
        document.documentElement.classList.remove("if-intro-active");
      };

      const complete = () => {
        if (done) return;
        done = true;
        cleanup();
        callbacksRef.current.onComplete();
        setHidden(true);
      };

      /**
       * The finale mirrors the SEEDAfrique exit: the last frame dives forward,
       * then a circular clip wipe opens the storefront underneath.
       */
      const startWipe = () => {
        if (done || wiping) return;
        wiping = true;
        reveal();

        if (typeof root.animate !== "function") {
          gsap.to(root, {
            autoAlpha: 0,
            duration: 0.45,
            ease: "power2.out",
            onComplete: complete,
          });
          return;
        }

        const cx = root.clientWidth / 2;
        const cy = root.clientHeight / 2;
        const maxRadius =
          Math.hypot(
            Math.max(cx, root.clientWidth - cx),
            Math.max(cy, root.clientHeight - cy),
          ) + 2;

        root.style.willChange = "clip-path";
        root.style.clipPath = `circle(0px at ${cx}px ${cy}px)`;

        const animation = root.animate(
          [
            { clipPath: `circle(0px at ${cx}px ${cy}px)` },
            { clipPath: `circle(${maxRadius}px at ${cx}px ${cy}px)` },
          ],
          {
            duration: 800,
            easing: "cubic-bezier(0.65, 0, 0.2, 1)",
            fill: "forwards",
          },
        );

        animation.finished
          .then(() => {
            animation.cancel();
            complete();
          })
          .catch(() => complete());
      };

      // Skip is quick, but it still dissolves the canvas over the storefront.
      const skip = () => {
        if (done) return;
        if (wiping) {
          complete();
          return;
        }

        reveal();
        timelineRef.current?.pause();
        gsap.to(root, {
          autoAlpha: 0,
          duration: 0.35,
          ease: "power2.out",
          onComplete: complete,
        });
      };

      skipRef.current = skip;

      const tl = gsap.timeline({
        paused: true,
      });
      timelineRef.current = tl;

      /* ---------------------------- master clock ---------------------------- */
      tl.to(state, { progress: 1, duration: 6.95, ease: "none" }, 0)
        .to(state, { grid: 1, duration: 0.85, ease: "power2.out" }, 1.15)

        /* -------------------------- opening dot ----------------------------- */
        .to(state, { dot: 1.55, duration: 0.5, ease: "back.out(3)" }, 0.1)
        .to(
          state,
          { pulse: 1, duration: 0.11, yoyo: true, repeat: 3, ease: "sine.inOut" },
          0.5,
        )
        .fromTo(
          state,
          { ring: 0 },
          { ring: 1, duration: 0.72, ease: "expo.out" },
          0.54,
        )
        .to(state, { lanes: 1, duration: 0.5, ease: "expo.out" }, 0.78)
        .to(state, { speed: 1.6, duration: 0.5, ease: "power2.in" }, 0.78)
        .to(state, { speed: 0, duration: 0.34, ease: "power2.out" }, 1.45)
        .to(state, { flat: 1, duration: 0.5, ease: "expo.inOut" }, 1.28)

        /* --------------------------- statement ------------------------------ */
        .to(state, { wordPhrase: 0.32, duration: 0.3, ease: "power2.out" }, 0.85)
        .to(state, { wordPhrase: 0.78, duration: 0.3, ease: "none" }, 1.15)
        .to(state, { wordPhrase: 1, duration: 0.4, ease: "power2.in" }, 1.45)

        /* --------------------------- 01 / footing --------------------------- */
        .to(state, { stageIn: 1, duration: 0.35, ease: "power2.out" }, 1.9)
        .to(state, { bootSketch: 1, duration: 0.8, ease: "power1.inOut" }, 1.95)

        /* --------------------------- morph 01 → 02 -------------------------- */
        .to(state, { focus: 1, duration: 0.48, ease: "power2.inOut" }, 2.7)
        .fromTo(
          state,
          { shake: 0.5 },
          { shake: 0, duration: 0.34, ease: "power2.out" },
          2.74,
        )

        /* ------------------------ 02 / reflector shirt ---------------------- */
        .to(state, { reflector: 1, duration: 1.2, ease: "power1.inOut" }, 2.78)

        /* --------------------------- morph 02 → 03 -------------------------- */
        .to(state, { focus: 2, duration: 0.48, ease: "power2.inOut" }, 3.92)
        .fromTo(
          state,
          { shake: 0.46 },
          { shake: 0, duration: 0.32, ease: "power2.out" },
          3.96,
        )

        /* --------------------------- 03 / gloves ---------------------------- */
        .to(state, { gloves: 1, duration: 0.8, ease: "power1.inOut" }, 3.98)

        /* --------------------------- morph 03 → 04 -------------------------- */
        .to(state, { focus: 3, duration: 0.48, ease: "power2.inOut" }, 4.72)
        .fromTo(
          state,
          { shake: 0.46 },
          { shake: 0, duration: 0.32, ease: "power2.out" },
          4.76,
        )

        /* --------------------------- 04 / helmet ---------------------------- */
        .to(state, { helmet: 1, duration: 1.15, ease: "power1.inOut" }, 4.8)

        /* ----------------------------- finale ------------------------------- */
        // SEEDAfrique runs 6.35s into its exit wipe; this lands on the same
        // total playback time.
        .call(reveal, [], 6.2)
        .to(state, { zoom: 6.5, duration: 0.72, ease: "expo.in" }, 6.2)
        .call(startWipe, [], 6.35);

      // Start once Inter 900 and the skip label are ready, with a short
      // failsafe so a blocked font request never traps the visitor.
      const play = () => {
        if (started || done) return;
        started = true;
        tl.play(0);
      };

      const fontTimer = window.setTimeout(play, 700);
      const fonts = document.fonts;
      if (fonts) {
        Promise.all([
          fonts.load('900 100px "Inter"'),
          fonts.load('400 12px "Space Mono"'),
        ])
          .then(() => {
            window.clearTimeout(fontTimer);
            play();
          })
          .catch(play);
      } else {
        window.clearTimeout(fontTimer);
        play();
      }

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") skip();
      };
      window.addEventListener("keydown", onKeyDown);

      return () => {
        done = true;
        window.clearTimeout(fontTimer);
        window.removeEventListener("keydown", onKeyDown);
        tl.kill();
        cleanup();
        timelineRef.current = null;
        skipRef.current = () => {};
      };
    },
    { scope: rootRef },
  );

  if (hidden) return null;

  return (
    <div
      ref={rootRef}
      className="if-intro"
      role="dialog"
      aria-modal="true"
      aria-label="Industrial workwear introduction"
    >
      <canvas ref={canvasRef} className="if-intro__canvas" aria-hidden="true" />

      <p className="if-intro__sr">
        An animated blueprint sequence of industrial safety gear. Press Escape or
        choose Skip to enter the editorial.
      </p>

      <button
        type="button"
        className="if-intro__skip"
        onClick={() => skipRef.current()}
        aria-label="Skip introduction"
      >
        Skip
      </button>

      <div className="if-intro__progress" aria-hidden="true">
        <div ref={progressRef} className="if-intro__progress-fill" />
      </div>
    </div>
  );
}
