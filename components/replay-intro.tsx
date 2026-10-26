"use client";

import { Play } from "lucide-react";
import { INTRO_REPLAY_EVENT } from "@/lib/site";

export function ReplayIntro() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(INTRO_REPLAY_EVENT))}
      className="flex items-center gap-1.5 transition-colors hover:text-sa-orange"
    >
      <Play size={12} className="fill-current" />
      Replay intro
    </button>
  );
}

export default ReplayIntro;
