"use client";

import { usePathname } from "next/navigation";
import { BackToTop } from "@/components/back-to-top";
import Intro from "@/components/intro";
import { SiteFooter } from "@/components/site-footer";

/**
 * The SEEDAfrique intro and footer belong to the main site. The industrial
 * workwear experience at /industrial is a standalone demo with its own intro,
 * so it renders without the SEEDAfrique chrome.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const standalone = pathname?.startsWith("/industrial");

  if (standalone) return <>{children}</>;

  return (
    <>
      <Intro />
      <div id="intro-stage">
        {children}
        <SiteFooter />
      </div>
      <BackToTop />
    </>
  );
}

export default SiteChrome;
