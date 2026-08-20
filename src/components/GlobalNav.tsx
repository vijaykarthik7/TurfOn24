import React, { useEffect, useRef, useState } from "react";

const sectionOrder = [
  { id: "hero", title: "Hero" },
  { id: "about", title: "About" },
  { id: "features", title: "Features" },
  { id: "gallery", title: "Gallery" },
  { id: "pricing", title: "Pricing" },
  { id: "booking", title: "Booking" },
  { id: "contact", title: "Contact" },
];

export function GlobalNav() {
  const [activeSection, setActiveSection] = useState<string>(sectionOrder[0].id);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [footballMoving, setFootballMoving] = useState(false);
  const rafRef = useRef<number | null>(null);

  const activeIndex = sectionOrder.findIndex((s) => s.id === activeSection);
  const ballTop = `${0.9 + (activeIndex >= 0 ? activeIndex * 3.2 : 0)}rem`;
  const lineFillHeight = `${Math.min(Math.max(scrollProgress, 0), 1) * 100}%`;
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [indicatorTop, setIndicatorTop] = useState("0px");

  const updateIndicatorPosition = () => {
    const activeButton = itemRefs.current[activeIndex];
    if (activeButton) {
      setIndicatorTop(`${activeButton.offsetTop + activeButton.offsetHeight / 2}px`);
    }
  };

  const scrollToSection = (sectionId: string) => {
    if (typeof window === "undefined") return;
    const target = document.getElementById(sectionId);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(sectionId);
    window.history.replaceState(null, "", `#${sectionId}`);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const currentHash = window.location.hash.replace("#", "");
    if (currentHash && sectionOrder.some((section) => section.id === currentHash)) {
      setActiveSection(currentHash);
    }

    const updateActiveSection = () => {
      const offset = 160;
      let currentSection = sectionOrder[0].id;

      sectionOrder.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (!el) return;

        const rect = el.getBoundingClientRect();
        if (rect.top <= offset) {
          currentSection = id;
        }
      });

      setActiveSection((current) => (current === currentSection ? current : currentSection));
    };

    const onScroll = () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = window.requestAnimationFrame(updateActiveSection);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && sectionOrder.some((section) => section.id === hash)) {
        setActiveSection(hash);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY || window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const progress = docHeight > winHeight ? scrollTop / (docHeight - winHeight) : 0;
      setScrollProgress(Math.min(Math.max(progress, 0), 1));
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  useEffect(() => {
    if (activeIndex < 0) return;
    setFootballMoving(true);
    updateIndicatorPosition();
    const t = window.setTimeout(() => setFootballMoving(false), 360);
    return () => window.clearTimeout(t);
  }, [activeIndex]);

  useEffect(() => {
    updateIndicatorPosition();
  }, []);

  return (
    <div className="fixed right-2 top-1/2 z-50 hidden lg:flex -translate-y-1/2">
      <nav
        aria-label="Football match timeline"
        className="relative h-[min(750px,calc(100vh-4rem))] max-w-[175px] w-[min(175px,calc(100vw-3rem))] overflow-hidden rounded-[32px] border border-[rgba(15,168,87,0.25)] bg-[rgba(3,6,7,0.85)] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-[18px]"
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 rounded-b-[32px] bg-[radial-gradient(circle_at_bottom,rgba(32,205,85,0.12),transparent_70%)]" />
        <div className="relative flex h-full items-start gap-6">
          <div className="relative flex h-full flex-col items-center">
            <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 rounded-full bg-slate-700/70" />
            <div
              className="absolute left-1/2 top-4 w-[2px] -translate-x-1/2 rounded-full bg-turf/70 shadow-[0_0_12px_rgba(15,168,87,0.14)] transition-[height] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ height: lineFillHeight }}
            />
            <div
              className="absolute left-1/2 h-5 w-5 -translate-x-[140%] rounded-full border border-white/10 bg-black shadow-[0_0_20px_rgba(42,240,105,0.28)] transition-[top,transform] duration-[300ms] ease-out"
              style={{ top: ballTop, transform: `translate(-50%, -50%) rotate(${footballMoving ? 22 : 0}deg)` }}
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current text-turf" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="8" fill="currentColor" opacity="0.15" />
                <path d="M10 2.5l1.7 3.5 3.8.5-2.8 2.4.7 3.8L10 11.4 5.6 12.7l.7-3.8L3.5 6.5l3.8-.5L10 2.5Z" fill="white" opacity="0.85" />
              </svg>
            </div>
          </div>

          <div className="relative flex h-full w-full flex-col justify-between gap-2 py-2">
            {sectionOrder.map((step, index) => {
              const isActive = activeSection === step.id;
              return (
                <button
                  key={step.id}
                  ref={(el) => (itemRefs.current[index] = el)}
                  type="button"
                  onClick={() => scrollToSection(step.id)}
                  className={`group flex w-full items-center justify-between gap-2 rounded-[20px] px-3 py-2 text-left transition duration-300 ${
                    isActive ? "" : "hover:bg-white/5"
                  }`}
                >
                  <span className={`text-[11px] font-semibold font-mono transition ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={`text-[12px] uppercase tracking-[0.18em] font-mono transition ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{step.title}</span>
                </button>
              );
            })}
            <div
              className="pointer-events-none absolute left-0 h-4 w-4 rounded-full border border-[rgba(15,168,87,0.25)] bg-[#030607] shadow-[0_0_16px_rgba(57,255,122,0.3)] transition-all duration-300 ease-out"
              style={{ top: indicatorTop, transform: "translate(-160%, -50%)" }}
            >
              <div className="flex h-full w-full items-center justify-center rounded-full bg-black/90">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.5l1.78 3.6 3.98.58-2.88 2.8.68 3.98L12 13.7l-3.56 1.86.68-3.98-2.88-2.8 3.98-.58L12 2.5Z" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default GlobalNav;
