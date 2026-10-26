"use client";

import Image from "next/image";
import { Image as ImageIcon, ImageOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type SmartImageProps = {
  src?: string;
  alt?: string;
  label?: string;
  sizes?: string;
  priority?: boolean;
  tone?: "light" | "warm" | "dark";
  fallback?: string;
  className?: string;
};

export function SmartImage({
  src,
  alt = "",
  label,
  sizes = "100vw",
  priority,
  tone = "light",
  fallback,
  className,
}: SmartImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  const showImage = Boolean(currentSrc) && !failed;

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        showImage && (tone === "dark" ? "bg-[#14283c]" : "bg-[#ebe8df]"),
        className,
      )}
    >
      {showImage ? (
        <Image
          src={currentSrc as string}
          alt={alt}
          sizes={sizes}
          priority={priority}
          fill
          className="object-cover"
          onError={() => {
            if (fallback && currentSrc !== fallback) {
              setCurrentSrc(fallback);
            } else {
              setFailed(true);
            }
          }}
        />
      ) : (
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-center",
            label && "p-3",
            tone === "light" &&
              "bg-[linear-gradient(140deg,#e3eef7_0%,#cfe2f1_55%,#bcd6ea_100%)] text-sa-blue-deep/55",
            tone === "warm" &&
              "bg-[linear-gradient(140deg,#fbe9d6_0%,#f6d9b9_55%,#efc89f_100%)] text-sa-orange/60",
            tone === "dark" &&
              "bg-[linear-gradient(140deg,#1d3a55_0%,#14304a_55%,#0f2438_100%)] text-white/40",
          )}
        >
          {failed ? (
            <ImageOff size={label ? 22 : 14} strokeWidth={1.5} />
          ) : (
            <ImageIcon size={label ? 22 : 14} strokeWidth={1.5} />
          )}
          {label && (
            <span className="max-w-[90%] text-[11px] font-medium uppercase tracking-[0.12em]">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default SmartImage;
