import { cn } from "@/lib/utils";

export function AuthorBadge({ name, light }: { name?: string; light?: boolean }) {
  const displayName = name?.trim() || "SEEDAfrique";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <span className="flex items-center gap-2.5">
      <span
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
          light ? "bg-white text-sa-ink" : "bg-sa-orange-soft text-sa-orange",
        )}
      >
        {initials}
      </span>
      <span
        className={cn(
          "text-[13px] font-medium",
          light ? "text-white" : "text-sa-ink",
        )}
      >
        {displayName}
      </span>
    </span>
  );
}

export default AuthorBadge;
