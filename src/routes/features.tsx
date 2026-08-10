import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Lightbulb } from "lucide-react";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [{ title: "Features — TurfOn24" }],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  const features = [
    { title: "Pro Floodlights", text: "Match-grade LED towers keep midnight games as clear as daylight.", icon: Lightbulb },
    { title: "FIFA-Grade Turf", text: "Shock-absorbing artificial grass, re-groomed weekly." },
    { title: "Changing Rooms", text: "Showers, lockers and chilled drinking water." },
    { title: "Free Parking", text: "Space for 40+ vehicles right beside the entrance gate." },
    { title: "Instant Confirmation", text: "Bookings are confirmed instantly — no waiting, no manual approval." },
  ];

  return (
    <PageShell eyebrow="Why TurfOn24" title={"Everything a serious game needs"} intro="Features built for play and performance.">
      <div
        className="mt-8"
          style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 420px)",
          gridTemplateRows: "repeat(2, 240px)",
          gap: "32px",
          justifyContent: "center",
        }}
      >
        {features.map((f) => (
          <div
            key={f.title}
            className="flex-none flex flex-col justify-between rounded-3xl border border-turf/15 bg-night-soft/50 p-10 shadow-[0_0_25px_-12px_rgba(60,235,120,0.45)] card-entrance transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_0_35px_-10px_rgba(60,235,120,0.55)]"
            style={{ width: "420px", height: "240px" }}
          >
            <p className="mt-5 text-xl font-bold">{f.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
