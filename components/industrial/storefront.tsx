"use client";

import type { CSSProperties } from "react";

type StorefrontProps = {
  live: boolean;
  onReplay: () => void;
};

const MODULES = [
  {
    id: "01",
    title: "Footing",
    spec: "M-2 / 200J steel toe",
    copy: "A lugged platform, puncture plate and oil-resistant sole. The first point of contact, engineered to hold.",
  },
  {
    id: "02",
    title: "Shell",
    spec: "Ripstop / 240gsm",
    copy: "A three-layer textile matrix with reflective banding and a sealed seam map. Quiet structure, on the move.",
  },
  {
    id: "03",
    title: "Head",
    spec: "S-4 / EN 397",
    copy: "A vented shell, padded collar and four-point harness. The system closes where the work begins.",
  },
];

export function Storefront({ live, onReplay }: StorefrontProps) {
  return (
    <div className={`if-store${live ? " is-live" : ""}`}>
      <header className="if-ed-head">
        <div className="if-ed-logo">
          <div>CLOTHES <span style={{ color: "#FF5722" }}>THAT WORK</span></div>
          <small>Industrial workwear</small>
        </div>
        <p className="if-ed-head__meta">SYSTEM 06 / LONDON</p>
        <button type="button" className="if-ed-replay" onClick={onReplay}>
          Replay intro <span aria-hidden="true">↺</span>
        </button>
      </header>

      <main>
        <section className="if-ed-hero">
          <p className="if-rise if-ed-kicker" style={{ "--if-delay": "60ms" } as CSSProperties}>
            Workwear, drawn from the line
          </p>

          <h1 className="if-rise" style={{ "--if-delay": "140ms" } as CSSProperties}>
            <span>Built for the</span>
            <br />
            <em>work,</em>
          </h1>

          <div
            className="if-rise if-ed-hero__foot"
            style={{ "--if-delay": "260ms" } as CSSProperties}
          >
            <p>
              Six industrial modules, one sealed kit. Blueprinted, field-tested and
              built to return — boot to helmet, sole to shell.
            </p>
            <dl>
              <div>
                <dt>Edition</dt>
                <dd>06 / SS26</dd>
              </div>
              <div>
                <dt>Tested</dt>
                <dd>EN 397 · EN 388</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>In service</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="if-ed-index">
          <div className="if-ed-index__head">
            <p>01 — 03 / The kit</p>
            <h2>Engineered in sequence.</h2>
          </div>

          <div className="if-ed-modules">
            {MODULES.map((module) => (
              <article key={module.id} className="if-ed-module">
                <span className="if-ed-module__id">{module.id}</span>
                <h3>{module.title}</h3>
                <p className="if-ed-module__spec">{module.spec}</p>
                <p className="if-ed-module__copy">{module.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="if-ed-note">
          <p className="if-ed-note__quote">
            “The best protective gear disappears into the work. You only notice it
            when it holds.”
          </p>
          <p className="if-ed-note__source">Field notes / 06 — CLOTHES THAT WORK</p>
        </section>
      </main>

      <footer className="if-ed-foot">
        <span>© {new Date().getFullYear()} CLOTHES THAT WORK</span>
        <span>Built for the line. Tested to return.</span>
        <button type="button" onClick={onReplay}>
          Replay animation <span aria-hidden="true">↺</span>
        </button>
      </footer>
    </div>
  );
}

export default Storefront;
