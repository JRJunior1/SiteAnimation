import { Sprout } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Eyebrow({
  children,
  icon: Icon = Sprout,
  light,
  className,
}: {
  children: ReactNode;
  icon?: LucideIcon;
  light?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]",
        light ? "text-white/70" : "text-sa-ink/70",
        className,
      )}
    >
      <Icon size={15} className="text-sa-orange" />
      {children}
    </span>
  );
}

export default Eyebrow;
