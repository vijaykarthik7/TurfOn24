import { ArrowRight, Menu, X } from "lucide-react";
import taglineImg from "@/assets/Tagline.png";
import { useState } from "react";

const navLinks = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "Gallery", href: "#gallery" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header id="site-header" className="site-header relative z-30 w-full">
      <div className="w-full px-4 py-2 sm:px-5 md:px-6 lg:px-6">
        <div className="relative mx-auto flex w-full max-w-[1700px] items-center gap-x-8 min-h-[80px]">
          {/* Brand (left) */}
          <div className="flex items-center gap-3">
            <a href="#hero" data-cursor="VIEW" className="relative flex min-w-0 items-center gap-3 overflow-visible">
              <div className="relative z-10 flex flex-col justify-center gap-1">
                <img src={taglineImg} alt="TurfOn24 - Your Turf. Your Time. Your Game." className="h-auto w-48 object-contain" />
              </div>
            </a>
          </div>

          {/* Nav (left) */}
          <div className="flex-1 min-w-0 flex justify-start">
            <div className="w-full max-w-[calc(100vw-260px)] mr-8 rounded-full border border-turf/25 bg-night-soft/70 px-3 py-2 backdrop-blur h-full flex items-center justify-start">
              <div className="flex flex-wrap items-center gap-2">
                {navLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    data-cursor="VIEW"
                    className={`flex-shrink-0 rounded-full px-3 py-2 text-sm transition-colors ${
                      "isAdmin" in l && l.isAdmin
                        ? "bg-turf/15 text-turf shadow-[inset_0_0_0_1px_rgba(60,235,120,0.25)] hover:bg-turf/25"
                        : "text-foreground hover:text-turf-bright"
                    }`}
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" aria-label="Toggle menu" onClick={() => setOpen((v) => !v)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-turf/25 bg-night-soft/70 text-foreground lg:hidden">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <nav className="mx-auto mt-3 w-full max-w-[min(100%-40px,1400px)] rounded-2xl border border-turf/20 bg-night-soft/95 p-3 backdrop-blur lg:hidden">
          <div className="grid gap-2">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm ${
                  "isAdmin" in l && l.isAdmin ? "bg-turf/15 text-turf" : ""
                }`}
              >
                {l.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
