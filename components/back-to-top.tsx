"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        const reduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      }}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      className={cn(
        "group fixed bottom-5 right-5 z-[60] flex h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-full bg-sa-ink ring-4 ring-sa-orange/25 transition-all duration-300 hover:w-[140px] hover:bg-sa-orange focus-visible:w-[140px] focus-visible:bg-sa-orange focus-visible:outline-none md:bottom-8 md:right-8",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <svg
        viewBox="0 0 384 512"
        aria-hidden="true"
        className="w-3 fill-white transition-transform duration-300 group-hover:-translate-y-[200%] group-focus-visible:-translate-y-[200%]"
      >
        <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
      </svg>
      <span
        aria-hidden="true"
        className="absolute -bottom-5 whitespace-nowrap text-[0px] font-semibold text-white transition-all duration-300 group-hover:bottom-auto group-hover:text-[13px] group-focus-visible:bottom-auto group-focus-visible:text-[13px]"
      >
        Back to top
      </span>
    </button>
  );
}

export default BackToTop;
