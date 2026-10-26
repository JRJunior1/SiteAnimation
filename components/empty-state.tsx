import Link from "next/link";
import { ArrowUpRight, CalendarClock, Images, PenLine, Sprout } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";

const links: {
  href: string;
  title: string;
  body: string;
  icon: LucideIcon;
}[] = [
  {
    href: "/upcomingevents",
    title: "Events",
    body: "Races, workshops, and trips, past and upcoming.",
    icon: CalendarClock,
  },
  {
    href: "/gallery",
    title: "Gallery",
    body: "Photo albums from hackathons, competitions, and outreach days.",
    icon: Images,
  },
  {
    href: "/about",
    title: "About us",
    body: "Why SEEDAfrique exists and the six programmes we run.",
    icon: Sprout,
  },
];

export function EmptyState() {
  return (
    <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
      <div className="px-2 lg:px-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sa-orange-soft text-sa-orange">
          <PenLine size={24} strokeWidth={1.6} />
        </span>
        <p className="mt-6 font-hand text-[34px] leading-[1.08] text-sa-ink sm:text-[42px]">
          The first stories are{" "}
          <span className="text-sa-ink/45">on their way</span>
        </p>
        <p className="mt-4 max-w-[420px] text-[14.5px] leading-relaxed text-sa-ink/65">
          Our team is writing up recent school visits and competition days. Join
          as a member and you will hear about new posts first.
        </p>
        <LinkButton href="/joinus" tone="orange" className="mt-7">
          Become a member
        </LinkButton>
      </div>

      <div>
        <p className="px-2 text-[12px] font-medium text-sa-ink/45 lg:px-6">
          In the meantime
        </p>
        <div className="mt-3 border-t border-sa-ink/15">
          {links.map(({ href, title, body, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-5 border-b border-sa-ink/15 px-2 py-6 md:px-6"
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -inset-y-px bg-sa-night transition-[clip-path] duration-500 ease-[cubic-bezier(.65,0,.35,1)] [clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0_0_0)]"
              />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-sa-ink/20 text-sa-ink transition-colors duration-500 group-hover:border-sa-orange group-hover:bg-sa-orange group-hover:text-white">
                <Icon size={20} strokeWidth={1.5} />
              </span>
              <span className="relative">
                <span className="block font-hand text-[28px] leading-none text-sa-ink transition-colors duration-500 group-hover:text-white">
                  {title}
                </span>
                <span className="mt-1.5 block text-[13.5px] text-sa-ink/60 transition-colors duration-500 group-hover:text-white/70">
                  {body}
                </span>
              </span>
              <ArrowUpRight
                size={20}
                className="relative text-sa-ink transition-[color,transform] duration-500 group-hover:rotate-45 group-hover:text-white"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EmptyState;
