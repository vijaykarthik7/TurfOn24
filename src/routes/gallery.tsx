import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import turf1 from "@/assets/turf-1.jpg";
import turf2 from "@/assets/turf-2.jpg";
import turf3 from "@/assets/turf-3.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [{ title: "Gallery — TurfOn24" }] }),
  component: GalleryPage,
});

function GalleryPage() {
  const gallery = [
    { src: turf1, alt: "Floodlit five-a-side football turf at night" },
    { src: turf2, alt: "Rooftop football turf with city skyline behind" },
    { src: turf3, alt: "Indoor covered football turf arena" },
  ];

  return (
    <PageShell eyebrow="Gallery" title={"Under the lights"} intro="A few snaps from our grounds.">
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {gallery.map((g) => (
          <div key={g.alt} className="group overflow-hidden rounded-2xl border border-turf/15">
            <img src={g.src} alt={g.alt} className="h-64 w-full object-cover" />
          </div>
        ))}
      </div>
    </PageShell>
  );
}
