import { LinkButton } from "@/components/ui/link-button";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { ReactNode } from "react";

export function PageShell({
  eyebrow,
  title,
  accent,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  children: ReactNode;
}) {
  return (
    <main className="px-3 pb-16 pt-10 md:px-5">
      <div className="mx-auto max-w-[1280px]">
        <div className="relative overflow-hidden rounded-[34px] bg-sa-ink px-6 py-14 text-white md:px-12 md:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-32 h-[380px] w-[380px] rounded-full bg-sa-orange/20 blur-[110px]"
          />
          <div className="relative max-w-[760px]">
            <Eyebrow light>{eyebrow}</Eyebrow>
            <h1 className="mt-5 font-hand text-[46px] leading-[1] text-white sm:text-[64px]">
              {title}{" "}
              {accent && <span className="text-white/45">{accent}</span>}
            </h1>
            <div className="mt-5 max-w-[560px] text-[15px] leading-relaxed text-white/65">
              {children}
            </div>
            <LinkButton href="/" tone="orange" className="mt-9">
              Back to stories
            </LinkButton>
          </div>
        </div>
      </div>
    </main>
  );
}

export default PageShell;
