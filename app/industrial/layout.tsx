import type { Metadata } from "next";
import "./industrial.css";

export const metadata: Metadata = {
  title: "FORGE+FIELD — Industrial workwear systems",
  description:
    "A high-performance, canvas-driven industrial workwear experience: safety boots, ripstop shells, fall arrest rigs and certified head protection.",
  openGraph: {
    title: "FORGE+FIELD — Industrial workwear systems",
    description:
      "Six modules. One sealed kit. Built for the line, tested to return.",
    type: "website",
  },
};

export default function IndustrialLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
