import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Clock, Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact TurfOn24 — Call, Visit or Message Us" },
      {
        name: "description",
        content:
          "Reach the TurfOn24 team any hour: phone, email, WhatsApp or the ground office at Periya Kanganankuppam, Cuddalore. Send us a message and we reply within an hour.",
      },
      { property: "og:title", content: "Contact TurfOn24 — Call, Visit or Message Us" },
      {
        property: "og:description",
        content: "Phone, email and ground address for TurfOn24 — open 24 hours.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

const channels = [
  { icon: Phone, title: "Call the ground", value: "89399 89366", note: "Answered 24 hours" },
  { icon: Mail, title: "Email us", value: "play@turfon24.com", note: "Replies within an hour" },
  { icon: MessageSquare, title: "WhatsApp", value: "89399 89366", note: "Fastest for slot swaps" },
  { icon: MapPin, title: "Visit", value: "Periya Kanganankuppam, (Behind KUN HYNDAI/TRUE VALUE Show Room), Cuddalore - 607002", note: "Free parking on site" },
];

function ContactPage() {
  const [sent, setSent] = useState(false);
  const inputClass =
    "w-full rounded-xl border border-turf/20 bg-night/70 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-turf";

  return (
    <PageShell
      eyebrow="Contact"
      title={
        <>
          Talk to the people
          <br />
          <span className="text-turf">who run the turf.</span>
        </>
      }
      intro="No call centre. Messages land with the ground staff on shift, at any hour."
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          {channels.map(({ icon: Icon, title, value, note }) => (
            <div
              key={title}
              className="flex items-start gap-4 rounded-2xl border border-turf/15 bg-night-soft/50 p-6"
            >
              <Icon className="mt-1 h-6 w-6 shrink-0 text-turf drop-shadow-[0_0_12px_rgba(60,235,120,0.45)]" />
              <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="mt-1 text-lg font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{note}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3 rounded-2xl border border-turf/25 bg-turf/10 p-6 text-sm">
            <Clock className="h-5 w-5 text-turf" /> Open every day, all 24 hours.
          </div>
        </div>

        <div className="rounded-3xl border border-turf/15 bg-night-soft/50 p-8">
          {sent ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-turf" />
              <p className="mt-5 text-xl font-bold">Message sent</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Our ground staff will get back to you shortly.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-7 rounded-xl bg-turf px-6 py-3 font-semibold text-night"
              >
                Send another
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-5"
            >
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-turf">Send a message</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <input required placeholder="Your name" className={inputClass} />
                <input required placeholder="Phone or email" className={inputClass} />
              </div>
              <input placeholder="Subject" className={inputClass} />
              <textarea
                required
                rows={6}
                placeholder="Tell us what you need — date, squad size, anything special."
                className={inputClass}
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-turf px-6 py-4 font-semibold text-night transition-transform hover:scale-[1.02]"
              >
                Send Message
              </button>
              <p className="text-xs text-muted-foreground">
                Demo form — messages are not stored yet.
              </p>
            </form>
          )}
        </div>
      </div>
    </PageShell>
  );
}
