"use client";

import { ArrowRight, Sprout } from "lucide-react";
import Link from "next/link";
import { CountUp } from "@/components/ui/count-up";
import { LinkButton } from "@/components/ui/link-button";
import { Scribble } from "@/components/ui/scribble";

const stats = [
  { to: 6, suffix: "", label: "Programmes" },
  { to: 1200, suffix: "+", label: "Students reached" },
  { to: 16, suffix: "", label: "Regions" },
  { to: 40, suffix: "+", label: "School partners" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-3 pb-10 pt-10 md:px-5 md:pt-14">
      <div className="mx-auto max-w-[1280px]">
        <div className="relative overflow-hidden rounded-[34px] bg-sa-ink px-6 py-14 text-white md:px-12 md:py-20 lg:px-16 lg:py-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full bg-sa-orange/25 blur-[120px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 -left-20 h-[380px] w-[380px] rounded-full bg-sa-blue/40 blur-[130px]"
          />

          <div className="relative max-w-[820px]">
            <span className="animate-sa-up flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70 [animation-delay:80ms]">
              <Sprout size={15} className="text-sa-orange" />
              STEM for young Africans
            </span>

            <h1 className="animate-sa-up mt-6 font-hand text-[44px] leading-[0.98] text-white sm:text-[64px] lg:text-[82px] [animation-delay:160ms]">
              Growing the next generation of{" "}
              <Scribble color="#e2703a">
                <span className="text-sa-orange">problem solvers</span>
              </Scribble>
            </h1>

            <p className="animate-sa-up mt-7 max-w-[560px] text-[15px] leading-relaxed text-white/65 [animation-delay:260ms] md:text-[16px]">
              Hands-on programmes, mentors, and competitions that help students
              across Africa turn curiosity into something they can build.
            </p>

            <div className="animate-sa-up mt-9 flex flex-wrap items-center gap-4 [animation-delay:360ms]">
              <LinkButton href="/joinus" tone="orange">
                Join the community
              </LinkButton>
              <Link
                href="#stories"
                className="group inline-flex items-center gap-2 text-[13.5px] font-semibold text-white/80 transition-colors hover:text-white"
              >
                Read our stories
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>

          <dl className="animate-sa-up relative mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/15 pt-8 [animation-delay:480ms] lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">
                  {stat.label}
                </dt>
                <dd className="mt-2 font-hand text-[38px] leading-none text-white lg:text-[44px]">
                  <CountUp to={stat.to} suffix={stat.suffix} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

export default Hero;
