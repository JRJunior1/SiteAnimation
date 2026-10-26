import { ReplayIntro } from "@/components/replay-intro";

export function SiteFooter() {
  return (
    <footer className="px-3 pb-10 md:px-5">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 border-t border-sa-ink/10 px-2 pt-6 text-[12px] text-sa-ink/45 lg:px-4">
        <span>© {new Date().getFullYear()} SEEDAfrique. Stories from the field.</span>
        <ReplayIntro />
      </div>
    </footer>
  );
}

export default SiteFooter;
