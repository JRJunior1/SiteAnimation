import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tones = {
  ink: {
    pill: "bg-sa-ink text-white hover:bg-sa-blue",
    dot: "bg-white text-sa-ink",
  },
  blue: {
    pill: "bg-sa-blue text-white hover:bg-sa-blue-deep",
    dot: "bg-white text-sa-blue",
  },
  light: {
    pill: "bg-white text-sa-ink hover:bg-sa-cream",
    dot: "bg-sa-orange text-white",
  },
  orange: {
    pill: "bg-sa-orange text-white hover:bg-sa-ink",
    dot: "bg-white text-sa-orange",
  },
} as const;

export function LinkButton({
  href,
  children,
  tone = "ink",
  className,
}: {
  href: string;
  children: ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  const styles = tones[tone];

  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-6 rounded-full py-1.5 pl-6 pr-1.5 text-[13.5px] font-semibold transition-colors",
        styles.pill,
        className,
      )}
    >
      {children}
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition-transform group-hover:rotate-45",
          styles.dot,
        )}
      >
        <ArrowUpRight size={16} />
      </span>
    </Link>
  );
}

export default LinkButton;
