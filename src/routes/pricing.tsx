import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [{ title: "Pricing — TurfOn24" }] }),
  component: PricingPage,
});

function PricingPage() {
  const plans = [
    { name: "Hourly", price: "₹1,200 / hour", perks: ["Any single hour", "Up to 14 players"] },
    { name: "Full Day", price: "₹14,000 / day", perks: ["6 AM to 12 AM", "Exclusive access"] },
    { name: "Tournament", price: "₹24,000 / 24 hours", perks: ["Full 24-hour block", "Scoreboard & sound"] },
  ];

  return (
    <PageShell eyebrow="Pricing" title={"Simple rates, no surprises"} intro="Transparent pricing for every use case.">
      <div className="mt-8 grid gap-6 md:grid-cols-3 items-stretch">
        {plans.map((p) => (
          <div key={p.name} className="flex h-full flex-col rounded-2xl border p-8">
            <p className="text-lg font-bold">{p.name}</p>
            <p className="mt-3 text-2xl font-extrabold text-turf">{p.price}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {p.perks.map((perk) => (
                <li key={perk}>{perk}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
