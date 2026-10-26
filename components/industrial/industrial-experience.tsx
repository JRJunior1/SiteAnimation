"use client";

import { useCallback, useState } from "react";
import IndustrialIntro from "@/components/industrial/industrial-intro";
import { Storefront } from "@/components/industrial/storefront";

/**
 * Standalone /industrial experience. The storefront is always mounted under
 * the canvas; the intro reveals it with the mechanical shear instead of routing
 * or remounting the page.
 */
export default function IndustrialExperience() {
  const [run, setRun] = useState(0);
  const [live, setLive] = useState(false);

  const handleReveal = useCallback(() => setLive(true), []);

  const handleComplete = useCallback(() => {
    // The overlay unmounts itself. Keeping this callback lets the storefront
    // stay mounted and interactive underneath.
  }, []);

  const replay = useCallback(() => {
    window.scrollTo(0, 0);
    setLive(false);
    setRun((value) => value + 1);
  }, []);

  return (
    <div className="industrial-site">
      <Storefront live={live} onReplay={replay} />
      <IndustrialIntro key={run} onReveal={handleReveal} onComplete={handleComplete} />
    </div>
  );
}
