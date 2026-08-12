import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  ShieldCheck,
  Users,
  BadgeCheck,
  IndianRupee,
  Star,
  Sparkles,
  Trophy,
  Droplets,
  ParkingCircle,
  Lightbulb,
} from "lucide-react";
import {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent,
  TouchEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import useEmblaCarousel from "embla-carousel-react";
import heroImg from "@/assets/turf-hero.jpg";
import turf1 from "@/assets/turf-1.jpg";
import turf2 from "@/assets/turf-2.jpg";
import turf3 from "@/assets/turf-3.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  BookingSection,
  useBooking,
} from "@/components/BookingSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TurfOn24" },
      {
        name: "description",
        content:
          "Book an entire football turf for a full day. Morning to night exclusive access for teams and events, with instant booking and guaranteed best price.",
      },
      { property: "og:title", content: "TurfOn24" },
      {
        property: "og:description",
        content:
          "Full-day turf booking with exclusive access, instant confirmation and 24/7 availability.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const trustItems = [
  { icon: BadgeCheck, title: "Verified Turf", sub: "100% Quality Checked" },
  { icon: CalendarCheck, title: "Instant Booking", sub: "Quick & Hassle-free" },
  { icon: IndianRupee, title: "Best Price", sub: "Guaranteed" },
  { icon: Clock, title: "Always Open", sub: "24/7 Access" },
];

const sectionOrder = [
  { id: "hero", title: "Hero" },
  { id: "about", title: "About" },
  { id: "features", title: "Features" },
  { id: "gallery", title: "Gallery" },
  { id: "pricing", title: "Pricing" },
  { id: "booking", title: "Booking" },
  { id: "contact", title: "Contact" },
];

const features = [
  {
    icon: Trophy,
    title: "FIFA-Grade Turf",
    text: "50mm shock-absorbing artificial grass, maintained weekly to ensure safe, high-performance play.",
  },
  {
    icon: Trophy,
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
  {
    icon: ShieldCheck,
    title: "Instant Confirmation",
    text: "Bookings are confirmed instantly — no waiting, no manual approval.",
  },
];

const gallery = [
  { src: turf1, alt: "Floodlit five-a-side football turf at night" },
  { src: turf2, alt: "Rooftop football turf with city skyline behind" },
  { src: turf3, alt: "Indoor covered football turf arena" },
];

const galleryLabels = [
  "STADIUM NIGHT",
  "PREMIUM TURF",
  "FLOODLIGHT EXPERIENCE",
  "GAME DAY",
];

const galleryDetails = [
  { label: "01 — MAIN TURF", subtitle: "FULL SIZE FIELD" },
  { label: "02 — ROOFTOP", subtitle: "NIGHT SESSION" },
  { label: "03 — INDOOR", subtitle: "ALL WEATHER" },
  { label: "04 — STADIUM", subtitle: "FULL FLOODLIGHTS" },
];

const pricing = {
  features: [
    { icon: Clock, title: "Any single hour", text: "Book for just the time you need" },
    { icon: Users, title: "Up to 14 players", text: "Perfect for small & large teams" },
    { icon: Lightbulb, title: "Full floodlights", text: "Play day or night" },
    { icon: Trophy, title: "FIFA-grade turf", text: "Premium playing surface" },
  ],
};

const pricingHighlights = [
  {
    icon: Trophy,
    title: "Premium Football Turf",
    text: "Experience professional quality artificial turf for a smooth and consistent play.",
  },
  {
    icon: Lightbulb,
    title: "Full Floodlight Access",
    text: "Bright, even lighting for a safe and energetic game, anytime.",
  },
  {
    icon: Star,
    title: "Professional Quality Pitch",
    text: "Tournament-ready turf with excellent surface for the best playing experience.",
  },
];

const testimonials = [
  { name: "Arjun Mehta", role: "Captain, Steel City FC", text: "We booked the full day for our league finals. Lights, pitch, staff — everything was spotless." },
  { name: "Priya Nair", role: "HR, Nexa Labs", text: "Perfect for our company sports day. Booking took two minutes and the price was unbeatable." },
  { name: "Rohit Das", role: "Weekend regular", text: "Playing at 2 AM sounds crazy until you try it here. Turf is always ready, always lit." },
];

function Index() {
  const [animatedPrice, setAnimatedPrice] = useState(0);
  const booking = useBooking();
  const [galleryActiveIndex, setGalleryActiveIndex] = useState<number | null>(null);
  const [galleryHoverIndex, setGalleryHoverIndex] = useState<number | null>(null);
  const [galleryLightboxIndex, setGalleryLightboxIndex] = useState<number | null>(null);
  const [galleryCursor, setGalleryCursor] = useState({ x: 210, y: 120 });
  const galleryItemRects = useRef<Record<number, DOMRect | null>>({});
  const galleryPointerRef = useRef<{ x: number; y: number; index: number | null } | null>(null);
  const galleryRafRef = useRef<number | null>(null);
  const [galleryCarouselRef, galleryCarouselApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    containScroll: false,
  });
  const [gallerySelectedIndex, setGallerySelectedIndex] = useState(0);
  const galleryDragRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const [activeSection, setActiveSection] = useState("hero");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoveredStatIndex, setHoveredStatIndex] = useState<number | null>(null);
  const [statsCount, setStatsCount] = useState([24, 14, 48, 60]);
  const [starReveal, setStarReveal] = useState(false);
  const [galleryLightboxTouchStartX, setGalleryLightboxTouchStartX] = useState<number | null>(null);
  const [footballMoving, setFootballMoving] = useState(false);
  const touchDeviceDetected = useRef(false);
  const aboutCardRef = useRef<HTMLDivElement | null>(null);
  const pricingRef = useRef<HTMLElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const featureCardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const timelinePathRef = useRef<SVGPathElement | null>(null);
  const timelineSvgRef = useRef<SVGSVGElement | null>(null);
  const timelineShellRef = useRef<HTMLDivElement | null>(null);
  const [timelineD, setTimelineD] = useState(
    "M240 40 C210 140 160 220 120 300 C100 350 90 390 100 420 C120 500 160 560 220 600 C200 820 160 880 140 960 C180 940 220 920 260 900"
  );
  const [timelinePoints, setTimelinePoints] = useState<Array<{ x: number; y: number }>>([
    { x: 240, y: 40 },
    { x: 100, y: 420 },
    { x: 240, y: 780 },
    { x: 140, y: 960 },
    { x: 260, y: 900 },
  ]);

  const buildTimelinePath = (points: Array<{ x: number; y: number }>) => {
    if (points.length < 2) return "M0 0";

    let d = `M${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i += 1) {
      const prev = points[i - 1];
      const next = points[i];
      const deltaX = next.x - prev.x;
      const controlOffset = Math.min(Math.abs(deltaX) * 0.7, 110);
      const cp1x = prev.x + (deltaX > 0 ? controlOffset : -controlOffset);
      const cp2x = next.x - (deltaX > 0 ? controlOffset : -controlOffset);
      const curveHeight = Math.min(Math.abs(next.y - prev.y) * 0.45, 130);
      const cp1y = prev.y + curveHeight * 0.65;
      const cp2y = next.y - curveHeight * 0.65;
      d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${next.x} ${next.y}`;
    }

    return d;
  };

  const computeTimelinePath = () => {
    if (typeof window === "undefined") return;
    if (!timelineSvgRef.current) return;

    const svgRect = timelineSvgRef.current.getBoundingClientRect();
    const svgWidth = svgRect.width;
    const svgHeight = svgRect.height;
    if (svgWidth === 0 || svgHeight === 0) return;

    const points = featureCardRefs.current.slice(0, features.length).map((card, index) => {
      if (!card) return null;
      const rect = card.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const x = index % 2 === 0 ? rect.right - 12 : rect.left + 12;
      return {
        x: ((x - svgRect.left) / svgWidth) * 300,
        y: ((centerY - svgRect.top) / svgHeight) * 1000,
      };
    });

    if (points.some((point) => point === null)) return;

    const resolvedPoints = points as Array<{ x: number; y: number }>;
    const normalizedPoints = resolvedPoints.map((point) => ({
      x: Math.max(20, Math.min(280, point.x)),
      y: Math.max(24, Math.min(976, point.y)),
    }));

    setTimelinePoints(normalizedPoints);
    setTimelineD(buildTimelinePath(normalizedPoints));
  };

  useLayoutEffect(() => {
    const recompute = () => {
      window.requestAnimationFrame(() => computeTimelinePath());
    };

    const frame = window.requestAnimationFrame(() => recompute());
    const timeout = window.setTimeout(recompute, 180);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => recompute());
      if (timelineShellRef.current) {
        resizeObserver.observe(timelineShellRef.current);
      }
      if (timelineSvgRef.current?.parentElement) {
        resizeObserver.observe(timelineSvgRef.current.parentElement);
      }
      featureCardRefs.current.forEach((card) => {
        if (card) {
          resizeObserver?.observe(card);
        }
      });
    }

    window.addEventListener("resize", recompute);
    window.addEventListener("load", recompute);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      window.removeEventListener("resize", recompute);
      window.removeEventListener("load", recompute);
      resizeObserver?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!timelineD || !timelinePathRef.current) return;
    const length = timelinePathRef.current.getTotalLength();
    timelinePathRef.current.style.setProperty("--timeline-length", `${length}`);
  }, [timelineD]);

  const galleryItems = [...gallery, gallery[0]];

  const sections = sectionOrder;

  const activeIndex = sections.findIndex((section) => section.id === activeSection);
  const ballTop = `${0.9 + (activeIndex >= 0 ? activeIndex * 3.2 : 0)}rem`;
  const lineFillHeight = `${Math.min(Math.max(scrollProgress, 0), 1) * 100}%`;

  const aboutStats = [
    { value: `${statsCount[0]}/7`, label: "Round-the-clock access" },
    { value: `${statsCount[1]}+`, label: "Players per slot" },
    { value: "4.8/5", label: "Trusted rating" },
    { value: `${statsCount[3]}+`, label: "Night matches monthly" },
  ];

  const handleGalleryPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") {
      touchDeviceDetected.current = true;
    }
  };

  const handleGalleryPointerEnter = (event: PointerEvent<HTMLDivElement>, index: number) => {
    try {
      galleryItemRects.current[index] = event.currentTarget.getBoundingClientRect();
    } catch (e) {
      galleryItemRects.current[index] = null;
    }
    if (galleryHoverIndex !== index) {
      setGalleryHoverIndex(index);
    }
  };

  const flushGalleryPointer = () => {
    const p = galleryPointerRef.current;
    if (!p || p.index === null) return;
    const rect = galleryItemRects.current[p.index];
    if (!rect) return;
    const x = Math.min(Math.max(p.x - rect.left, 0), rect.width);
    const y = Math.min(Math.max(p.y - rect.top, 0), rect.height);
    setGalleryCursor({ x, y });
    galleryRafRef.current = null;
  };

  const handleGalleryPointerMove = (event: PointerEvent<HTMLDivElement>, index: number) => {
    // Store latest pointer position and schedule a single rAF update
    galleryPointerRef.current = { x: event.clientX, y: event.clientY, index };
    if (galleryRafRef.current === null) {
      galleryRafRef.current = window.requestAnimationFrame(() => flushGalleryPointer());
    }

    if (galleryHoverIndex !== index) {
      setGalleryHoverIndex(index);
    }
  };

  // Container-level handlers (event delegation) to avoid attaching many listeners
  const handleGalleryContainerPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const card = target.closest('.gallery-card') as HTMLElement | null;
    if (!card) return;
    const idx = card.dataset.index ? parseInt(card.dataset.index, 10) : NaN;
    if (Number.isNaN(idx)) return;
    handleGalleryPointerMove(event, idx);
  };

  const handleGalleryContainerPointerOver = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const card = target.closest('.gallery-card') as HTMLElement | null;
    if (!card) return;
    const idx = card.dataset.index ? parseInt(card.dataset.index, 10) : NaN;
    if (Number.isNaN(idx)) return;
    handleGalleryPointerEnter(event, idx);
  };

  const handleGalleryContainerPointerOut = (event: PointerEvent<HTMLDivElement>) => {
    const related = (event as unknown as PointerEvent).relatedTarget as Node | null;
    const from = (event.target as HTMLElement).closest('.gallery-card') as HTMLElement | null;
    if (!from) return;
    if (related && from.contains(related)) return;
    handleGalleryPointerLeave();
  };

  const handleGalleryPointerLeave = () => {
    setGalleryHoverIndex(null);
    setGalleryCursor({ x: 210, y: 120 });
    galleryPointerRef.current = null;
    if (galleryRafRef.current !== null) {
      window.cancelAnimationFrame(galleryRafRef.current);
      galleryRafRef.current = null;
    }

    if (!touchDeviceDetected.current) {
      setGalleryActiveIndex(null);
    }
  };

  const handleGalleryClick = (index: number) => {
    if (touchDeviceDetected.current) {
      if (galleryActiveIndex === index) {
        setGalleryLightboxIndex(index);
        return;
      }
      setGalleryActiveIndex(index);
      return;
    }

    setGalleryLightboxIndex(index);
  };

  const handleCarouselSlidePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    galleryDragRef.current = { x: event.clientX, y: event.clientY, moved: false };
    handleGalleryPointerDown(event);
  };

  const handleCarouselSlidePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = galleryDragRef.current;
    if (drag) {
      const dx = Math.abs(event.clientX - drag.x);
      const dy = Math.abs(event.clientY - drag.y);
      if (dx > 8 || dy > 8) {
        drag.moved = true;
      }
    }
  };

  const handleCarouselSlideClick = (index: number) => {
    const drag = galleryDragRef.current;
    galleryDragRef.current = null;
    if (drag?.moved) return;
    if (index === gallerySelectedIndex) {
      handleGalleryClick(index);
    } else {
      galleryCarouselApi?.scrollTo(index);
    }
  };

  const handleCarouselKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!galleryCarouselApi) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      galleryCarouselApi.scrollPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      galleryCarouselApi.scrollNext();
    }
  };

  useEffect(() => {
    if (!galleryCarouselApi) return;
    const onCarouselSelect = () => {
      setGallerySelectedIndex(galleryCarouselApi.selectedScrollSnap());
    };
    onCarouselSelect();
    galleryCarouselApi.on("select", onCarouselSelect);
    galleryCarouselApi.on("reInit", onCarouselSelect);
    return () => {
      galleryCarouselApi.off("select", onCarouselSelect);
      galleryCarouselApi.off("reInit", onCarouselSelect);
    };
  }, [galleryCarouselApi]);

  const closeGalleryLightbox = () => {
    setGalleryLightboxIndex(null);
    setGalleryActiveIndex(null);
  };

  const handleLightboxPrev = () => {
    setGalleryLightboxIndex((current) =>
      current === null ? null : (current + galleryItems.length - 1) % galleryItems.length
    );
  };

  const handleLightboxNext = () => {
    setGalleryLightboxIndex((current) =>
      current === null ? null : (current + 1) % galleryItems.length
    );
  };

  useEffect(() => {
    if (galleryLightboxIndex === null) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeGalleryLightbox();
      }
      if (event.key === "ArrowLeft") {
        handleLightboxPrev();
      }
      if (event.key === "ArrowRight") {
        handleLightboxNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [galleryLightboxIndex]);

  const handleLightboxTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setGalleryLightboxTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleLightboxTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (galleryLightboxTouchStartX === null) {
      return;
    }

    const deltaX = event.changedTouches[0]?.clientX - galleryLightboxTouchStartX;
    if (deltaX > 50) {
      setGalleryLightboxIndex((current) =>
        current === null ? null : (current + galleryItems.length - 1) % galleryItems.length
      );
    } else if (deltaX < -50) {
      setGalleryLightboxIndex((current) =>
        current === null ? null : (current + 1) % galleryItems.length
      );
    }

    setGalleryLightboxTouchStartX(null);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Choose the entry whose element center is closest to the viewport center.
        const viewportCenter = (window.innerHeight || document.documentElement.clientHeight) / 2;

        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;

        const best = visible
          .map((entry) => {
            const rect = entry.boundingClientRect;
            const elemCenter = rect.top + rect.height / 2;
            const distance = Math.abs(elemCenter - viewportCenter);
            return { entry, distance, ratio: entry.intersectionRatio };
          })
          .sort((a, b) => (a.distance !== b.distance ? a.distance - b.distance : b.ratio - a.ratio))[0];

        const visibleSection = best?.entry;
        if (visibleSection?.target?.id) {
          const sectionId = visibleSection.target.id;
          setActiveSection(sectionId);
          window.history.replaceState(null, "", `#${sectionId}`);
        }
      },
      {
        root: null,
        // Use symmetric root margins so the element near center is preferred
        rootMargin: "-45% 0px -45% 0px",
        threshold: [0.25, 0.4, 0.6, 0.8],
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash.replace("#", "");
    if (!hash) return;

    const target = sectionRefs.current[hash];
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(hash);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) return;
      const target = sectionRefs.current[hash];
      if (!target) return;

      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(hash);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (activeIndex < 0) return;
    setFootballMoving(true);
    const timeout = window.setTimeout(() => setFootballMoving(false), 360);
    return () => window.clearTimeout(timeout);
  }, [activeIndex]);

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
    if (!aboutCardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setStarReveal(entry.isIntersecting);
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(aboutCardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!pricingRef.current) return;

    let frameId: number | null = null;
    let startTime: number | null = null;

    const animatePrice = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      startTime = null;

      const duration = 1200;

      const step = (timestamp: number) => {
        if (startTime === null) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setAnimatedPrice(Math.round(700 * progress));

        if (progress < 1) {
          frameId = requestAnimationFrame(step);
        } else {
          frameId = null;
        }
      };

      frameId = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animatePrice();
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(pricingRef.current);

    return () => {
      observer.disconnect();
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, []);

  useEffect(() => {
    const revealTargets = document.querySelectorAll<HTMLElement>(
      "#gallery, #pricing, #booking"
    );
    const revealClass = "section-reveal-in";
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      revealTargets.forEach((target) => target.classList.add(revealClass));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(revealClass);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealTargets.forEach((target) => observer.observe(target));
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <main className="min-h-[100svh] bg-transparent text-foreground relative overflow-x-clip overflow-hidden">
      <div className="hero-bg-layer pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="hero-bg-img absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0">
          <div className="flood-blink absolute right-[10%] top-[14%] h-72 w-72 rounded-full">
            <div className="h-full w-full rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.85)_0%,rgba(190,255,210,0.25)_35%,transparent_70%)] blur-md motion-safe:animate-[spin_18s_linear_infinite]" />
          </div>
          <div className="flood-blink-slow absolute right-[26%] top-[30%] h-44 w-44 rounded-full">
            <div className="h-full w-full rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.7)_0%,rgba(160,255,190,0.2)_40%,transparent_72%)] blur-md motion-safe:animate-[spin_24s_linear_infinite_reverse]" />
          </div>
          <div className="field-pulse absolute top-[80%] right-0 h-[40%] w-[70%] bg-[radial-gradient(ellipse_at_70%_40%,rgba(60,235,120,0.35)_0%,transparent_65%)]" />
          <div className="dot-grid absolute left-0 top-32 h-96 w-40" />
        </div>
      </div>

      

      {/* Hero */}
      <div
        id="hero"
        ref={(node) => {
          sectionRefs.current["hero"] = node;
        }}
        className="relative z-10 mx-auto flex w-[min(96vw,1700px)] flex-col justify-center overflow-x-clip px-4 pt-0 pb-10 sm:px-5 md:px-6 lg:px-6"
      >
        <div className="relative overflow-hidden rounded-[2.5rem] bg-transparent">
          <div className="relative z-10 flex flex-col gap-10 rounded-[2.5rem] px-4 pb-10 pt-2 sm:px-6 sm:pb-12 sm:pt-4 lg:px-8 lg:pb-14">
            <SiteHeader />

            <section className="flex flex-col gap-10">
              <div className="hero-content w-full max-w-[min(100%,760px)]">
                <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
                  {/* Rotating hero logo */}
                  <div className="hero-logo hidden shrink-0 self-center md:block" aria-hidden="true">
                    <svg viewBox="0 0 200 200" className="h-28 w-28 lg:h-32 lg:w-32">
                      <defs>
                        <linearGradient id="heroLogoGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="rgba(96,240,120,0.9)" />
                          <stop offset="100%" stopColor="rgba(60,235,120,0.2)" />
                        </linearGradient>
                        <path id="heroLogoCirclePath" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" />
                      </defs>
                      <circle cx="100" cy="100" r="98" fill="rgba(8,14,10,0.75)" stroke="url(#heroLogoGrad)" strokeWidth="2" />
                      <g className="hero-logo-rotor">
                        <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(96,240,120,0.28)" strokeWidth="1.5" strokeDasharray="4 9" />
                        <text fontSize="12.5" letterSpacing="3" fontFamily="Manrope, ui-sans-serif, sans-serif" fontWeight="800" fill="rgba(96,240,120,0.95)">
                          <textPath href="#heroLogoCirclePath">TURFON24 • 24/7 • FULL DAY • TURFON24 • 24/7 • FULL DAY •</textPath>
                        </text>
                      </g>
                      <circle cx="100" cy="100" r="60" fill="#0c1510" stroke="rgba(96,240,120,0.35)" strokeWidth="1.5" />
                      <g opacity="0.6">
                        <polygon points="100,72 117,83 111,103 89,103 83,83" fill="none" stroke="#3ceb78" strokeWidth="2" />
                        <line x1="100" y1="72" x2="100" y2="42" stroke="#3ceb78" strokeWidth="2" />
                        <line x1="117" y1="83" x2="142" y2="60" stroke="#3ceb78" strokeWidth="2" />
                        <line x1="111" y1="103" x2="142" y2="140" stroke="#3ceb78" strokeWidth="2" />
                        <line x1="89" y1="103" x2="58" y2="140" stroke="#3ceb78" strokeWidth="2" />
                        <line x1="83" y1="83" x2="58" y2="60" stroke="#3ceb78" strokeWidth="2" />
                      </g>
                      <text x="100" y="109" textAnchor="middle" fontSize="27" letterSpacing="1" fontFamily="Manrope, ui-sans-serif, sans-serif" fontWeight="800" fill="#3ceb78" filter="drop-shadow(0 0 12px rgba(60,235,120,0.45))">24/7</text>
                    </svg>
                  </div>
                  <div className="w-full">
                    <p className="text-sm font-semibold uppercase tracking-[0.35em] text-turf">
                      Full-Day Turf Booking
                    </p>
                  </div>
                </div>

                <h1 className="mt-6 text-[clamp(2.5rem,1.2rem+4.5vw,4.25rem)] font-black leading-[1.03] tracking-tight text-white">
                  Book the Entire Turf
                  <span className="block text-turf">For a Full Day</span>
                </h1>

                <ul className="mt-7 flex flex-wrap items-center gap-6 text-sm text-foreground/85">
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-turf" /> Morning to Night
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-turf" /> Exclusive Access
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-turf" /> For Teams &amp; Events
                  </li>
                </ul>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                  <a
                    href="#pricing"
                    className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    <CalendarDays className="h-5 w-5 text-turf" /> Check Pricing
                  </a>
                  <a
                    href="#booking"
                    className="inline-flex items-center gap-3 rounded-xl bg-turf px-6 py-3 text-sm font-semibold text-night shadow-[0_0_35px_rgba(60,235,120,0.45)] transition hover:brightness-110"
                  >
                    Book Now <ArrowRight className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </section>

            <section className="mt-4 grid grid-cols-1 gap-4 overflow-hidden sm:grid-cols-2 lg:grid-cols-4 items-stretch">
              {trustItems.map(({ icon: Icon, title, sub }) => (
                <div
                  key={title}
                  className="flex h-full items-center gap-4 px-8 py-8"
                >
                  <Icon className="h-9 w-9 shrink-0 text-turf" />
                  <div>
                    <p className="text-lg font-bold">{title}</p>
                    <p className="text-sm text-muted-foreground">{sub}</p>
                  </div>
                </div>
              ))}
            </section>
          </div>
        </div>
      </div>

      {/* About */}
      <section
        id="about"
        ref={(node) => { sectionRefs.current["about"] = node; }}
        className="mx-auto max-w-6xl px-6 py-24 mb-16 relative overflow-hidden scroll-mt-24"
      >
        <div className="pointer-events-none absolute left-0 top-10 h-28 w-28 rounded-full bg-turf/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-20 h-36 w-36 rounded-full bg-turf/15 blur-3xl" />

        <div className="grid gap-6 lg:gap-7 xl:grid-cols-[1.55fr_1fr]">
          <div
          ref={aboutCardRef}
          className={`group relative overflow-hidden rounded-[1.75rem] border border-turf/15 bg-white/10 backdrop-blur-2xl p-8 lg:p-9 shadow-[0_0_80px_rgba(16,221,86,0.14)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_0_90px_rgba(16,221,86,0.18)] ${starReveal ? "about-star-reveal" : ""}`}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,221,86,0.16),transparent_40%)]" />
            <div className="absolute right-10 bottom-10 h-28 w-28 rounded-full bg-turf/10 blur-3xl" />
            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-turf/20 bg-turf/10 px-4 py-2 text-sm text-turf">
                <Sparkles className="h-4 w-4" /> Featured experience
              </span>
              <p className="mt-7 text-sm font-semibold uppercase tracking-[0.35em] text-turf">ABOUT US</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Premium Football Experience
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                TurfOn24 brings championship-level pitch, floodlights, and night-time energy together for teams, leagues, and events.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {aboutStats.map((stat, index) => (
                  <div
                    key={stat.label}
                    onPointerEnter={() => setHoveredStatIndex(index)}
                    onPointerLeave={() => setHoveredStatIndex(null)}
                    className={`rounded-2xl border border-turf/10 bg-night/10 p-5 text-sm transition duration-300 ${
                      hoveredStatIndex === index
                        ? "scale-[1.02] border-turf/30 bg-black/20 shadow-[0_0_30px_rgba(96,240,120,0.16)]"
                        : "hover:border-turf/20 hover:bg-white/5"
                    }`}
                  >
                    <p className="text-2xl font-bold text-turf">{stat.value}</p>
                    <p className="mt-2 text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-turf/20 bg-turf/10 px-4 py-2.5 text-sm text-turf shadow-sm">
                <BadgeCheck className="h-4 w-4" /> Verified premium venue
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {features.slice(0, 3).map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="relative overflow-hidden rounded-[1.5rem] border border-turf/15 bg-white/5 backdrop-blur-2xl p-6 lg:p-7 shadow-[0_0_40px_rgba(16,221,86,0.08)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_0_50px_rgba(16,221,86,0.12)]"
              >
                <div className="absolute left-6 top-6 h-14 w-14 rounded-full bg-turf/10 blur-3xl" />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-turf/10 text-turf">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-lg font-semibold">{title}</p>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why TurfOn24 */}
      <section
        id="features"
        ref={(node) => { sectionRefs.current["features"] = node; }}
        className="mx-auto max-w-6xl px-6 py-24 mb-16 relative overflow-hidden scroll-mt-24"
      >
        <div className="pointer-events-none absolute left-0 top-12 h-32 w-32 rounded-full bg-turf/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 bottom-10 h-28 w-28 rounded-full bg-turf/15 blur-3xl" />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-turf">Why TurfOn24</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
              Everything a serious game needs
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              A premium feature journey built for competitive teams, late-night events, and unforgettable matches.
            </p>
          </div>
          <div className="rounded-full border border-turf/15 bg-white/5 px-4 py-2.5 text-[0.7rem] uppercase tracking-[0.3em] text-turf shadow-[0_0_30px_rgba(16,221,86,0.08)]">
            Connected feature timeline
          </div>
        </div>

        <div ref={timelineShellRef} className="relative mt-10 lg:mt-12 overflow-visible">
          <div className="timeline-snake absolute inset-0 pointer-events-none">
            <svg
              ref={timelineSvgRef}
              viewBox="0 0 300 1000"
              preserveAspectRatio="none"
              className="h-full w-full"
            >
              <defs>
                <linearGradient id="snakeGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(96,240,120,0.8)" />
                  <stop offset="30%" stopColor="rgba(96,240,120,0.25)" />
                  <stop offset="55%" stopColor="rgba(96,240,120,0.65)" />
                  <stop offset="100%" stopColor="rgba(96,240,120,0.4)" />
                </linearGradient>
                <filter id="snakePulseGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Single continuous path through all five steps */}
              <path
                id="snakePath"
                ref={timelinePathRef}
                className="timeline-snake-base"
                d={timelineD || "M0 0"}
              />
              {timelinePoints.map((point, index) => (
                <circle
                  key={`${index}-${point.x.toFixed(0)}-${point.y.toFixed(0)}`}
                  className="timeline-snake-node"
                  cx={point.x}
                  cy={point.y}
                  r="6"
                />
              ))}
              <circle className="timeline-snake-pulse" r="7" cx="0" cy="0">
                <animateMotion dur="8s" repeatCount="indefinite">
                  <mpath href="#snakePath" />
                </animateMotion>
              </circle>
            </svg>
          </div>
          <div className="grid gap-6">
            {features.map(({ icon: Icon, title, text }, index) => (
              <div
                ref={(node) => {
                  featureCardRefs.current[index] = node;
                }}
                key={title}
                className={`relative overflow-hidden rounded-[1.75rem] border border-turf/15 bg-white/5 backdrop-blur-2xl p-6 lg:p-7 shadow-[0_0_40px_rgba(16,221,86,0.08)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_0_55px_rgba(16,221,86,0.16)] ${
                  index % 2 === 0 ? "lg:self-start lg:ml-auto lg:max-w-[480px]" : "lg:self-end lg:mr-auto lg:max-w-[480px]"
                }`}
              >
                <div className="absolute left-1/2 top-0 h-9 w-9 -translate-x-1/2 rounded-full bg-turf/15 ring-1 ring-turf/25" />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-turf/10 text-turf animate-pulse">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.3em] text-turf">Step {index + 1}</p>
                </div>
                <h3 className="mt-5 text-xl font-bold">{title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section
        id="gallery"
        ref={(node) => { sectionRefs.current["gallery"] = node; }}
        className="gallery mx-auto max-w-6xl px-6 py-20 mb-16 scroll-mt-24"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-turf">Gallery</p>
        <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
          See the turf in action
        </h2>
        <p className="mt-5 max-w-2xl text-muted-foreground">
          Browse the venue, floodlights, and premium feel of our full-day turf experience.
        </p>
        <div className="gallery-carousel mt-10 relative">
          <div className="gallery-light-spot" />
          <div
            ref={galleryCarouselRef}
            className="gallery-carousel-viewport"
            role="region"
            aria-roledescription="carousel"
            aria-label="Turf gallery"
            tabIndex={0}
            onKeyDown={handleCarouselKeyDown}
            onPointerMove={handleGalleryContainerPointerMove}
            onPointerOver={handleGalleryContainerPointerOver}
            onPointerOut={handleGalleryContainerPointerOut}
          >
            <div className="gallery-carousel-track">
              {galleryItems.map((item, index) => {
                const selected = gallerySelectedIndex === index;
                const hovered = galleryHoverIndex === index;
                const active = selected || hovered;
                const anyHover = galleryHoverIndex !== null;
                const rotateX = active && !touchDeviceDetected.current ? Math.min(Math.max((galleryCursor.y - 120) / 28, -4), 4) : 0;
                const rotateY = active && !touchDeviceDetected.current ? Math.min(Math.max((galleryCursor.x - 210) / 28, -4), 4) : 0;
                const detail = galleryDetails[index];
                const label = detail?.label;
                const subtitle = detail?.subtitle;
                const stateClass = selected
                  ? "gallery-carousel-card-selected"
                  : hovered
                    ? "gallery-card-active"
                    : anyHover
                      ? "gallery-carousel-card-dimmed"
                      : "";

                return (
                  <div
                    key={`${item.alt}-${index}`}
                    className="gallery-carousel-slide"
                    aria-roledescription="slide"
                    aria-label={`${index + 1} of ${galleryItems.length}`}
                    aria-hidden={!selected}
                  >
                    <div
                      role="button"
                      data-index={index}
                      tabIndex={-1}
                      className={`gallery-carousel-card gallery-card group relative h-full w-full overflow-hidden rounded-[1.85rem] border border-turf/15 bg-black/10 shadow-[0_0_32px_rgba(0,0,0,0.26)] transition duration-500 ease-out ${stateClass}`}
                      onPointerDown={handleCarouselSlidePointerDown}
                      onPointerMove={handleCarouselSlidePointerMove}
                      onPointerEnter={(event) => handleGalleryPointerEnter(event, index)}
                      onPointerLeave={handleGalleryPointerLeave}
                      onClick={() => handleCarouselSlideClick(index)}
                      style={{
                        transform: active ? `translate3d(0,-6px,0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)${selected ? "" : " scale(0.92)"}` : undefined,
                      }}
                    >
                      <img
                        src={item.src}
                        alt={item.alt}
                        className="gallery-card-img absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out"
                      />
                      {/* Animated inner frame (SVG) - subtle neon highlight travels around border */}
                      <svg className="gallery-frame absolute inset-1 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                        <defs>
                          <linearGradient id={`frameGrad-${index}`} x1="0" x2="1">
                            <stop offset="0%" stopColor="rgba(96,240,120,0.95)" />
                            <stop offset="40%" stopColor="rgba(96,240,120,0.4)" />
                            <stop offset="100%" stopColor="rgba(96,240,120,0.95)" />
                          </linearGradient>
                        </defs>
                        <rect
                          x="2"
                          y="2"
                          width="96"
                          height="96"
                          rx="14"
                          ry="14"
                          pathLength="1000"
                          fill="none"
                          stroke={`url(#frameGrad-${index})`}
                          strokeWidth="1.5"
                          className="gallery-frame-rect"
                          style={{
                            // per-card delay so animations are not synchronous
                            ['--frame-delay' as any]: `${(index % 4) * 0.45}s`,
                          }}
                        />
                      </svg>
                      <span className="gallery-corner-bracket gallery-corner-tl" />
                      <span className="gallery-corner-bracket gallery-corner-tr" />
                      <span className="gallery-corner-bracket gallery-corner-bl" />
                      <span className="gallery-corner-bracket gallery-corner-br" />
                      <div className="gallery-card-overlay absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 ease-out pointer-events-none" />
                      <div className="gallery-card-glow absolute inset-0 rounded-[1.85rem] opacity-0 transition-opacity duration-300 ease-out pointer-events-none" />
                      <span
                        className="gallery-card-spot absolute h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(96,240,120,0.18),transparent_70%)] opacity-0 transition-all duration-200 ease-out pointer-events-none"
                        style={{
                          left: `${galleryCursor.x}px`,
                          top: `${galleryCursor.y}px`,
                          opacity: active ? 0.85 : 0,
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                      <div
                        className="gallery-card-shine absolute left-[-15%] top-0 h-28 w-[120%] rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-all duration-300 ease-out pointer-events-none"
                        style={{
                          transform: active ? "translateX(170px)" : "translateX(-140px)",
                          opacity: active ? 0.8 : 0,
                        }}
                      />
                      <div className="gallery-card-meta absolute inset-x-0 bottom-6 px-6 text-left opacity-0 transition-all duration-300 ease-out">
                        <span className="block text-[0.7rem] uppercase tracking-[0.35em] text-turf/90">{label}</span>
                        <span className="mt-1 block text-sm font-semibold uppercase tracking-[0.28em] text-white">{subtitle}</span>
                      </div>
                      <div className="gallery-card-number absolute left-6 top-6 text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-turf/80">
                        {detail?.label.split(" — ")[0]}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => galleryCarouselApi?.scrollPrev()}
            aria-label="Previous image"
            className="gallery-carousel-nav gallery-carousel-nav-prev"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => galleryCarouselApi?.scrollNext()}
            aria-label="Next image"
            className="gallery-carousel-nav gallery-carousel-nav-next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="gallery-carousel-caption mt-6 flex flex-wrap items-center justify-center gap-4">
            <span className="text-[0.7rem] uppercase tracking-[0.35em] text-turf/90">
              {galleryLabels[gallerySelectedIndex] ?? ""}
            </span>
            <span className="flex items-center gap-2">
              {galleryItems.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => galleryCarouselApi?.scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`gallery-carousel-dot ${index === gallerySelectedIndex ? "gallery-carousel-dot-active" : ""}`}
                />
              ))}
            </span>
          </div>
        </div>

        {galleryLightboxIndex !== null ? (
          <div className="gallery-lightbox fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 text-white">
            <button
              type="button"
              onClick={closeGalleryLightbox}
              className="gallery-lightbox-close absolute right-6 top-6 inline-flex h-11 w-11 items-center justify-center rounded-full border border-turf/30 bg-black/70 text-turf shadow-[0_0_30px_rgba(60,235,120,0.25)] transition hover:bg-black/80 z-20"
            >
              <span className="text-2xl leading-none">×</span>
            </button>
            <button
              type="button"
              onClick={handleLightboxPrev}
              className="gallery-lightbox-nav absolute left-6 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-turf/30 bg-black/70 text-turf shadow-[0_0_30px_rgba(60,235,120,0.2)] transition hover:bg-black/80"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={handleLightboxNext}
              className="gallery-lightbox-nav absolute right-6 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-turf/30 bg-black/70 text-turf shadow-[0_0_30px_rgba(60,235,120,0.2)] transition hover:bg-black/80"
            >
              ›
            </button>
            <div
              className="gallery-lightbox-inner relative z-10 mx-auto max-h-[90vh] max-w-[90vw] overflow-hidden rounded-[1.75rem] border border-turf/15 bg-black/90"
              onTouchStart={handleLightboxTouchStart}
              onTouchEnd={handleLightboxTouchEnd}
            >
              <img
                src={galleryItems[galleryLightboxIndex].src}
                alt={galleryItems[galleryLightboxIndex].alt}
                className="max-h-[85vh] max-w-[85vw] object-contain"
              />
              <div className="absolute inset-x-0 bottom-6 mx-auto flex max-w-[92%] flex-col items-center gap-2 text-center text-sm text-white/80">
                <p className="text-xs uppercase tracking-[0.35em] text-turf">
                  {galleryLabels[galleryLightboxIndex]}
                </p>
                <p className="text-sm">
                  Swipe left or right to browse. Tap the close icon or outside to exit.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeGalleryLightbox}
              className="absolute inset-0 h-full w-full bg-transparent"
              aria-hidden="true"
            />
          </div>
        ) : null}
      </section>

      <section
        id="pricing"
        ref={(node) => {
          sectionRefs.current["pricing"] = node;
          if (pricingRef) {
            pricingRef.current = node;
          }
        }}
        className="mx-auto max-w-6xl px-6 py-24 mb-16 relative overflow-hidden scroll-mt-24"
      >
        <div className="pointer-events-none absolute left-0 top-10 h-28 w-28 rounded-full bg-turf/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-20 h-36 w-36 rounded-full bg-turf/15 blur-3xl" />

        <div className="grid gap-6 lg:gap-7 xl:grid-cols-[1.55fr_1fr]">
          <div className="group relative overflow-hidden rounded-[1.75rem] border border-turf/15 bg-white/10 backdrop-blur-2xl p-8 lg:p-9 shadow-[0_0_80px_rgba(16,221,86,0.14)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_0_90px_rgba(16,221,86,0.18)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,221,86,0.16),transparent_40%)]" />
            <div className="absolute right-10 bottom-10 h-28 w-28 rounded-full bg-turf/10 blur-3xl" />
            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-turf/20 bg-turf/10 px-4 py-2 text-sm text-turf">
                <Clock className="h-4 w-4" /> Best hourly rate
              </span>
              <p className="mt-7 text-sm font-semibold uppercase tracking-[0.35em] text-turf">Pricing</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Choose your game plan
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Flexible turf packages for casual matches, teams and full-day events.
              </p>
              <div className="mt-8 flex items-end gap-3">
                <span className="text-6xl font-black leading-none tracking-tight text-turf">
                  ₹{animatedPrice}
                </span>
                <span className="pb-1 text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  / hour
                </span>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {pricing.features.map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-turf/10 bg-night/10 p-5 text-sm transition duration-300 hover:border-turf/20 hover:bg-white/5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-turf/10 text-turf">
                        <feature.icon className="h-4 w-4" />
                      </span>
                      <p className="font-semibold">{feature.title}</p>
                    </div>
                    <p className="mt-2 text-muted-foreground">{feature.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-turf/20 bg-turf/10 px-4 py-2.5 text-sm text-turf shadow-sm">
                <BadgeCheck className="h-4 w-4" /> Best value for weekend matches
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {pricingHighlights.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="relative overflow-hidden rounded-[1.5rem] border border-turf/15 bg-white/5 backdrop-blur-2xl p-6 lg:p-7 shadow-[0_0_40px_rgba(16,221,86,0.08)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_0_50px_rgba(16,221,86,0.12)]"
              >
                <div className="absolute left-6 top-6 h-14 w-14 rounded-full bg-turf/10 blur-3xl" />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-turf/10 text-turf">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-lg font-semibold">{title}</p>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Slot */}
      <BookingSection
        booking={booking}
        sectionRef={(node) => { sectionRefs.current["booking"] = node; }}
      />

      {/* Contact */}
      <section
        id="contact"
        ref={(node) => { sectionRefs.current["contact"] = node; }}
        className="mx-auto max-w-6xl px-6 py-20 mb-16 scroll-mt-24"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-turf">Contact</p>
        <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
          Reach out for bookings and enquiries
        </h2>
        <div className="mt-12 grid gap-6 lg:grid-cols-3 items-stretch">
          <div className="flex h-full flex-col rounded-3xl border border-turf/15 bg-white/10 backdrop-blur-2xl p-8 shadow-[0_0_25px_-12px_rgba(60,235,120,0.45)] transition-all duration-500 ease-out hover:-translate-y-1 hover:border-turf/25 hover:shadow-[0_0_35px_-10px_rgba(60,235,120,0.6)]">
            <p className="font-semibold text-white">Location</p>
            <p className="mt-3 text-sm text-muted-foreground">Sector 12, Sports City, Cityville</p>
          </div>
          <div className="flex h-full flex-col rounded-3xl border border-turf/15 bg-white/10 backdrop-blur-2xl p-8 shadow-[0_0_25px_-12px_rgba(60,235,120,0.45)] transition-all duration-500 ease-out hover:-translate-y-1 hover:border-turf/25 hover:shadow-[0_0_35px_-10px_rgba(60,235,120,0.6)]">
            <p className="font-semibold text-white">Phone</p>
            <p className="mt-3 text-sm text-muted-foreground">+91 98765 43210</p>
          </div>
          <div className="flex h-full flex-col rounded-3xl border border-turf/15 bg-white/10 backdrop-blur-2xl p-8 shadow-[0_0_25px_-12px_rgba(60,235,120,0.45)] transition-all duration-500 ease-out hover:-translate-y-1 hover:border-turf/25 hover:shadow-[0_0_35px_-10px_rgba(60,235,120,0.6)]">
            <p className="font-semibold text-white">Email</p>
            <p className="mt-3 text-sm text-muted-foreground">play@turfon24.com</p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
