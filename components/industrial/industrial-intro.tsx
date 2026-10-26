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

      // Skip is quick but still dissolves the canvas over the storefront.
      const skip = () => {
        if (done) return;
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
        onComplete: complete,
      });
      timelineRef.current = tl;

      /* ---------------------------- master clock ---------------------------- */
      tl.to(state, { progress: 1, duration: 16.35, ease: "none" }, 0)
        .to(state, { grid: 1, duration: 0.9, ease: "power2.out" }, 0.05)

        /* --------------------------- stage statement ------------------------ */
        .to(state, { wordPhrase: 0.32, duration: 2.4, ease: "power2.out" }, 0.1)
        .to(state, { wordPhrase: 0.65, duration: 11.3, ease: "none" }, 2.5)
        .to(state, { wordPhrase: 1, duration: 2.2, ease: "power2.in" }, 13.8)

        /* -------------------------- 01 / footing ---------------------------- */
        .to(state, { bootAlpha: 1, duration: 0.75, ease: "power2.out" }, 0.35)
        .to(state, { bootSketch: 1, duration: 1.9, ease: "power1.inOut" }, 0.55)
        .to(state, { bootAlpha: 0, duration: 0.5, ease: "power2.in" }, 3.0)

        /* --------------------------- 02 / shell ----------------------------- */
        .to(state, { suitAlpha: 1, duration: 0.7, ease: "power2.out" }, 3.65)
        .to(state, { suit: 1, duration: 1.9, ease: "power1.inOut" }, 3.8)
        .to(state, { suitAlpha: 0, duration: 0.5, ease: "power2.in" }, 6.45)

        /* ---------------------------- 03 / rig ------------------------------ */
        .to(state, { rigAlpha: 1, duration: 0.6, ease: "power2.out" }, 7.1)
        .to(state, { rig: 1, duration: 1.7, ease: "power1.inOut" }, 7.25)
        .to(state, { rigAlpha: 0, duration: 0.5, ease: "power2.in" }, 9.55)

        /* --------------------------- 04 / gloves ---------------------------- */
        .to(state, { glovesAlpha: 1, duration: 0.65, ease: "power2.out" }, 10.15)
        .to(state, { gloves: 1, duration: 1.75, ease: "power1.inOut" }, 10.3)
        .to(state, { glovesAlpha: 0, duration: 0.5, ease: "power2.in" }, 12.6)

        /* --------------------------- 05 / helmet ---------------------------- */
        .to(state, { helmetAlpha: 1, duration: 0.65, ease: "power2.out" }, 13.15)
        .to(state, { helmet: 1, duration: 1.6, ease: "power1.inOut" }, 13.3)
        .call(reveal, [], 15.7)
        .to(state, { helmetAlpha: 0, duration: 0.5, ease: "power2.in" }, 15.35)
        .to(root, { autoAlpha: 0, duration: 0.5, ease: "power2.out" }, 15.85);

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
