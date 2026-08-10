import { createFileRoute } from "@tanstack/react-router";
import { Clock, Users, Trophy, Sparkles } from "lucide-react";
import turf2 from "@/assets/turf-2.jpg";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About TurfOn24 — Football, Any Hour of the Night" },
      {
        name: "description",
        content:
          "TurfOn24 keeps floodlit football grounds open 24 hours a day. Learn how we started, what we stand for and the numbers behind the turf.",
      },
      { property: "og:title", content: "About TurfOn24 — Football, Any Hour of the Night" },
      {
        property: "og:description",
        content: "The story behind a city's round-the-clock floodlit football grounds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const stats = [
  { value: "3", label: "Floodlit grounds" },
  { value: "400+", label: "Teams hosted" },
  { value: "24/7", label: "Hours open" },
  { value: "12k+", label: "Matches played" },
];

const aboutValues = [
  {
    icon: Trophy,
    title: "FIFA-Grade Turf",
    text: "50mm shock-absorbing artificial grass, maintained weekly to ensure safe, high-performance play.",
  },
  {
    icon: Sparkles,
    title: "Premium Infrastructure",
    text: "Professional-grade floodlights and infrastructure for perfect visibility any time of day.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    text: "Book anytime, play anytime. Our turf is available round the clock for your convenience.",
  },
  {
    icon: Users,
    title: "Professional Support",
    text: "Expert staff ready to assist with event planning, setup, and technical requirements.",
  },
];

function AboutPage() {
  return (
    <PageShell eyebrow="ABOUT US" title={"Premium Football Experience"} intro="Everything we do is built for the serious game.">
      <div
        className="mt-6"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 420px)",
          gridTemplateRows: "repeat(2, 240px)",
          gap: "32px",
          justifyContent: "center",
        }}
      >
        {aboutValues.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="flex-none flex flex-col justify-between rounded-3xl border border-turf/15 bg-night-soft/60 p-10 shadow-[0_0_25px_-12px_rgba(60,235,120,0.45)] card-entrance transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_0_35px_-10px_rgba(60,235,120,0.55)]"
            style={{ width: "420px", height: "240px" }}
          >
            <Icon className="h-10 w-10 text-turf drop-shadow-[0_0_18px_rgba(60,235,120,0.45)]" />
            <p className="mt-6 text-xl font-bold">{title}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-turf/15 bg-night-soft/60 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="border-turf/10 px-8 py-10 text-center lg:border-r lg:last:border-r-0">
            <p className="text-4xl font-extrabold text-turf drop-shadow-[0_0_18px_rgba(60,235,120,0.4)]">{s.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
