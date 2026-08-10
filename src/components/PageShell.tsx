import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export function PageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-night text-foreground">
      <div className="relative overflow-hidden border-b border-turf/15">
        <div className="flood-blink pointer-events-none absolute -top-24 right-[12%] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.35)_0%,rgba(160,255,190,0.18)_35%,transparent_70%)] blur-lg" />
        <div className="field-pulse pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(ellipse_at_60%_100%,rgba(60,235,120,0.25),transparent_70%)]" />
        <div className="dot-grid pointer-events-none absolute left-0 top-24 h-72 w-32" />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-6">
          <SiteHeader />
          <div className="mt-16">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-turf">{eyebrow}</p>
            <div className="mt-3 h-1 w-14 rounded-full bg-turf" />
            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              {title}
            </h1>
            {intro && <p className="mt-6 max-w-2xl text-muted-foreground">{intro}</p>}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-20">{children}</div>

      <SiteFooter />
    </main>
  );
}
