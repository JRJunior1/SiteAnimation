"use client";

import type { ReactNode } from "react";
import { useInView } from "@/lib/use-in-view";

export function Scribble({
  children,
  color,
}: {
  children: ReactNode;
  color: string;
}) {
  const [ref, inView] = useInView();

  return (
    <span ref={ref} className="relative inline-block">
      {children}
      <svg
        viewBox="0 0 200 20"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute -bottom-1.5 left-0 h-3 w-full"
      >
        <path
          d="M3 14 C 50 4, 110 4, 197 10"
          pathLength={1}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          style={{
            strokeDasharray: 1,
            strokeDashoffset: +!inView,
            transition: "stroke-dashoffset 900ms cubic-bezier(.65,0,.35,1) 200ms",
          }}
        />
      </svg>
    </span>
  );
}

export default Scribble;
