import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  IndianRupee,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
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
          "Book premium football turf by the hour. Enjoy exclusive access, professional floodlights, FIFA-grade turf and instant booking.",
      },
      { property: "og:title", content: "TurfOn24" },
      {
        property: "og:description",
        content:
          "Premium football turf with instant booking, professional floodlights and 24/7 availability.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const HOURLY_PRICE = 700;

const trustItems = [
  {
    icon: BadgeCheck,
    title: "Verified Turf",
    sub: "100% Quality Checked",
  },
  {
    icon: CalendarCheck,
    title: "Instant Booking",
    sub: "Quick & Hassle-free",
  },
  {
    icon: IndianRupee,
    title: "Best Price",
    sub: "Guaranteed",
  },
  {
    icon: Clock,
    title: "Always Open",
    sub: "24/7 Access",
  },
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
    id: "fifa-grade",
    icon: Trophy,
    title: "FIFA-Grade Turf",
    text: "50mm shock-absorbing artificial grass, maintained weekly to ensure safe, high-performance play.",
  },
  {
    id: "premium-infrastructure",
    icon: Trophy,
    title: "Premium Infrastructure",
    text: "Professional-grade floodlights and infrastructure for perfect visibility any time of day.",
  },
  {
    id: "availability",
    icon: Clock,
    title: "24/7 Availability",
    text: "Book anytime, play anytime. Our turf is available round the clock for your convenience.",
  },
  {
    id: "support",
    icon: Users,
    title: "Professional Support",
    text: "Expert staff ready to assist with event planning, setup, and technical requirements.",
  },
  {
    id: "instant-confirmation",
    icon: ShieldCheck,
    title: "Instant Confirmation",
    text: "Bookings are confirmed instantly — no waiting, no manual approval.",
  },
];

const gallery = [
  {
    src: turf1,
    alt: "Floodlit five-a-side football turf at night",
  },
  {
    src: turf2,
    alt: "Rooftop football turf with city skyline behind",
  },
  {
    src: turf3,
    alt: "Indoor covered football turf arena",
  },
];

const galleryLabels = [
  "STADIUM NIGHT",
  "PREMIUM TURF",
  "FLOODLIGHT EXPERIENCE",
];

const galleryDetails = [
  {
    label: "01 — MAIN TURF",
    subtitle: "FULL SIZE FIELD",
  },
  {
    label: "02 — ROOFTOP",
    subtitle: "NIGHT SESSION",
  },
  {
    label: "03 — INDOOR",
    subtitle: "ALL WEATHER",
  },
];

const pricing = {
  features: [
    {
      icon: Clock,
      title: "Any single hour",
      text: "Book for just the time you need",
    },
    {
      icon: Users,
      title: "Up to 14 players",
      text: "Perfect for small & large teams",
    },
    {
      icon: Lightbulb,
      title: "Full floodlights",
      text: "Play day or night",
    },
    {
      icon: Trophy,
      title: "FIFA-grade turf",
      text: "Premium playing surface",
    },
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

function Index() {
  const booking = useBooking();

  const [animatedPrice, setAnimatedPrice] = useState(0);

  const [galleryActiveIndex, setGalleryActiveIndex] = useState<number | null>(
    null,
  );
  const [galleryHoverIndex, setGalleryHoverIndex] = useState<number | null>(
    null,
  );
  const [galleryLightboxIndex, setGalleryLightboxIndex] = useState<
    number | null
  >(null);

  const [galleryCursor, setGalleryCursor] = useState({
    x: 210,
    y: 120,
  });

  const [galleryCarouselRef, galleryCarouselApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    containScroll: false,
  });

  const [gallerySelectedIndex, setGallerySelectedIndex] = useState(0);

  const galleryItemRects = useRef<
    Record<number, DOMRect | null>
  >({});

  const galleryPointerRef = useRef<{
    x: number;
    y: number;
    index: number | null;
  } | null>(null);

  const galleryRafRef = useRef<number | null>(null);

  const galleryDragRef = useRef<{
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);

  const touchDeviceDetected = useRef(false);

  const [activeSection, setActiveSection] = useState("hero");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoveredStatIndex, setHoveredStatIndex] = useState<number | null>(
    null,
  );
  const [statsCount] = useState([24, 14, 48, 60]);
  const [starReveal, setStarReveal] = useState(false);

  const [galleryLightboxTouchStartX, setGalleryLightboxTouchStartX] =
    useState<number | null>(null);

  const aboutCardRef = useRef<HTMLDivElement | null>(null);
  const pricingRef = useRef<HTMLElement | null>(null);

  const sectionRefs = useRef<
    Record<string, HTMLElement | null>
  >({});

  const featureCardRefs = useRef<
    Array<HTMLDivElement | null>
  >([]);

  const timelinePathRef = useRef<SVGPathElement | null>(null);
  const timelineSvgRef = useRef<SVGSVGElement | null>(null);
  const timelineShellRef = useRef<HTMLDivElement | null>(null);

  const [timelineD, setTimelineD] = useState(
    "M40 100 C 40 200 260 200 260 300 C 260 400 40 400 40 500 C 40 600 260 600 260 700 C 260 800 40 800 40 900",
  );

  const [timelinePoints, setTimelinePoints] = useState<
    Array<{ x: number; y: number }>
  >([
    { x: 40, y: 100 },
    { x: 260, y: 300 },
    { x: 40, y: 500 },
    { x: 260, y: 700 },
    { x: 40, y: 900 },
  ]);

  const sections = sectionOrder;

  const activeIndex = sections.findIndex(
    (section) => section.id === activeSection,
  );

  const aboutStats = [
    {
      value: `${statsCount[0]}/7`,
      label: "Round-the-clock access",
    },
    {
      value: `${statsCount[1]}+`,
      label: "Players per slot",
    },
    {
      value: "4.8/5",
      label: "Trusted rating",
    },
    {
      value: `${statsCount[3]}+`,
      label: "Night matches monthly",
    },
  ];

  const buildTimelinePath = (
    points: Array<{ x: number; y: number }>,
  ) => {
    const first = points[0];

    if (!first || points.length < 2) {
      return "M0 0";
    }

    let d = `M ${first.x} ${first.y}`;

    for (let i = 1; i < points.length; i += 1) {
      const prev = points[i - 1];
      const next = points[i];

      if (!prev || !next) continue;

      const midY =
        prev.y + (next.y - prev.y) / 2;

      d += ` C ${prev.x} ${midY}, ${next.x} ${midY}, ${next.x} ${next.y}`;
    }

    return d;
  };

  const computeTimelinePath = () => {
    if (typeof window === "undefined") return;
    if (!timelineSvgRef.current) return;

    const svgRect =
      timelineSvgRef.current.getBoundingClientRect();

    const svgWidth = svgRect.width;
    const svgHeight = svgRect.height;

    if (svgWidth === 0 || svgHeight === 0) return;

    const points = featureCardRefs.current
      .slice(0, features.length)
      .map((card, index) => {
        if (!card) return null;

        const rect = card.getBoundingClientRect();
        const centerY =
          rect.top + rect.height / 2;

        const x =
          index % 2 === 0
            ? rect.left + 12
            : rect.right - 12;

        return {
          x: ((x - svgRect.left) / svgWidth) * 300,
          y: ((centerY - svgRect.top) / svgHeight) * 1000,
        };
      });

    if (points.some((point) => point === null)) {
      return;
    }

    const resolvedPoints =
      points as Array<{ x: number; y: number }>;

    const normalizedPoints = resolvedPoints.map(
      (point) => ({
        x: Math.max(
          20,
          Math.min(280, point.x),
        ),
        y: Math.max(
          24,
          Math.min(976, point.y),
        ),
      }),
    );

    setTimelinePoints(normalizedPoints);
    setTimelineD(
      buildTimelinePath(normalizedPoints),
    );
  };

  useLayoutEffect(() => {
    const recompute = () => {
      window.requestAnimationFrame(() => {
        computeTimelinePath();
      });
    };

    const frame = window.requestAnimationFrame(
      recompute,
    );

    let resizeObserver: ResizeObserver | null =
      null;

    if (
      typeof ResizeObserver !== "undefined"
    ) {
      resizeObserver = new ResizeObserver(
        recompute,
      );

      if (timelineShellRef.current) {
        resizeObserver.observe(
          timelineShellRef.current,
        );
      }

      if (
        timelineSvgRef.current?.parentElement
      ) {
        resizeObserver.observe(
          timelineSvgRef.current.parentElement,
        );
      }

      featureCardRefs.current.forEach(
        (card) => {
          if (card) {
            resizeObserver?.observe(card);
          }
        },
      );
    }

    window.addEventListener(
      "resize",
      recompute,
    );

    window.addEventListener(
      "load",
      recompute,
    );

    return () => {
      window.cancelAnimationFrame(frame);

      window.removeEventListener(
        "resize",
        recompute,
      );

      window.removeEventListener(
        "load",
        recompute,
      );

      resizeObserver?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (
      !timelineD ||
      !timelinePathRef.current
    ) {
      return;
    }

    const length =
      timelinePathRef.current.getTotalLength();

    timelinePathRef.current.style.setProperty(
      "--timeline-length",
      `${length}`,
    );
  }, [timelineD]);

  /*
   * Gallery
   */

  const handleGalleryPointerDown = (
    event: PointerEvent<HTMLDivElement>,
  ) => {
    if (event.pointerType === "touch") {
      touchDeviceDetected.current = true;
    }
  };

  const handleGalleryPointerEnter = (
    event: PointerEvent<HTMLDivElement>,
    index: number,
  ) => {
    galleryItemRects.current[index] =
      event.currentTarget.getBoundingClientRect();

    setGalleryHoverIndex(index);
  };

  const flushGalleryPointer = () => {
    const pointer =
      galleryPointerRef.current;

    if (
      !pointer ||
      pointer.index === null
    ) {
      return;
    }

    const rect =
      galleryItemRects.current[
        pointer.index
      ];

    if (!rect) return;

    const x = Math.min(
      Math.max(
        pointer.x - rect.left,
        0,
      ),
      rect.width,
    );

    const y = Math.min(
      Math.max(
        pointer.y - rect.top,
        0,
      ),
      rect.height,
    );

    setGalleryCursor({ x, y });

    galleryRafRef.current = null;
  };

  const handleGalleryPointerMove = (
    event: PointerEvent<HTMLDivElement>,
    index: number,
  ) => {
    galleryPointerRef.current = {
      x: event.clientX,
      y: event.clientY,
      index,
    };

    if (
      galleryRafRef.current === null
    ) {
      galleryRafRef.current =
        window.requestAnimationFrame(
          flushGalleryPointer,
        );
    }

    if (galleryHoverIndex !== index) {
      setGalleryHoverIndex(index);
    }
  };

  const handleGalleryPointerLeave = () => {
    setGalleryHoverIndex(null);

    setGalleryCursor({
      x: 210,
      y: 120,
    });

    galleryPointerRef.current = null;

    if (
      galleryRafRef.current !== null
    ) {
      window.cancelAnimationFrame(
        galleryRafRef.current,
      );

      galleryRafRef.current = null;
    }

    if (!touchDeviceDetected.current) {
      setGalleryActiveIndex(null);
    }
  };

  const handleGalleryContainerPointerMove = (
    event: PointerEvent<HTMLDivElement>,
  ) => {
    const target =
      event.target as HTMLElement;

    const card = target.closest(
      ".gallery-card",
    ) as HTMLElement | null;

    if (!card) return;

    const rawIndex =
      card.dataset["index"];

    if (rawIndex === undefined) {
      return;
    }

    const index = Number(rawIndex);

    if (!Number.isInteger(index)) {
      return;
    }

    handleGalleryPointerMove(
      event,
      index,
    );
  };

  const handleGalleryContainerPointerOver = (
    event: PointerEvent<HTMLDivElement>,
  ) => {
    const target =
      event.target as HTMLElement;

    const card = target.closest(
      ".gallery-card",
    ) as HTMLElement | null;

    if (!card) return;

    const rawIndex =
      card.dataset["index"];

    if (rawIndex === undefined) {
      return;
    }

    const index = Number(rawIndex);

    if (!Number.isInteger(index)) {
      return;
    }

    const relatedTarget =
      event.relatedTarget as Node | null;

    if (
      relatedTarget &&
      card.contains(relatedTarget)
    ) {
      return;
    }

    handleGalleryPointerEnter(
      event,
      index,
    );
  };

  const handleGalleryContainerPointerOut = (
    event: PointerEvent<HTMLDivElement>,
  ) => {
    const relatedTarget =
      event.relatedTarget as Node | null;

    const from =
      (event.target as HTMLElement).closest(
        ".gallery-card",
      ) as HTMLElement | null;

    if (!from) return;

    if (
      relatedTarget &&
      from.contains(relatedTarget)
    ) {
      return;
    }

    handleGalleryPointerLeave();
  };

  const handleGalleryClick = (
    index: number,
  ) => {
    if (touchDeviceDetected.current) {
      if (
        galleryActiveIndex === index
      ) {
        setGalleryLightboxIndex(index);
      } else {
        setGalleryActiveIndex(index);
      }

      return;
    }

    setGalleryLightboxIndex(index);
  };

  const handleCarouselSlidePointerDown = (
    event: PointerEvent<HTMLDivElement>,
  ) => {
    galleryDragRef.current = {
      x: event.clientX,
      y: event.clientY,
      moved: false,
    };

    handleGalleryPointerDown(event);
  };

  const handleCarouselSlidePointerMove = (
    event: PointerEvent<HTMLDivElement>,
  ) => {
    const drag =
      galleryDragRef.current;

    if (!drag) return;

    const dx = Math.abs(
      event.clientX - drag.x,
    );

    const dy = Math.abs(
      event.clientY - drag.y,
    );

    if (dx > 8 || dy > 8) {
      drag.moved = true;
    }
  };

  const handleCarouselSlideClick = (
    index: number,
  ) => {
    const drag =
      galleryDragRef.current;

    galleryDragRef.current = null;

    if (drag?.moved) {
      return;
    }

    if (
      index === gallerySelectedIndex
    ) {
      handleGalleryClick(index);
    } else {
      galleryCarouselApi?.scrollTo(index);
    }
  };

  const handleCarouselKeyDown = (
    event: ReactKeyboardEvent<HTMLDivElement>,
  ) => {
    if (!galleryCarouselApi) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      galleryCarouselApi.scrollPrev();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      galleryCarouselApi.scrollNext();
    }
  };

  const handleGalleryCardKeyDown = (
    event: ReactKeyboardEvent<HTMLDivElement>,
    index: number,
  ) => {
    if (
      event.key !== "Enter" &&
      event.key !== " "
    ) {
      return;
    }

    event.preventDefault();
    handleCarouselSlideClick(index);
  };

  useEffect(() => {
    if (!galleryCarouselApi) return;

    const onCarouselSelect = () => {
      setGallerySelectedIndex(
        galleryCarouselApi.selectedScrollSnap(),
      );
    };

    onCarouselSelect();

    galleryCarouselApi.on(
      "select",
      onCarouselSelect,
    );

    galleryCarouselApi.on(
      "reInit",
      onCarouselSelect,
    );

    return () => {
      galleryCarouselApi.off(
        "select",
        onCarouselSelect,
      );

      galleryCarouselApi.off(
        "reInit",
        onCarouselSelect,
      );
    };
  }, [galleryCarouselApi]);

  const closeGalleryLightbox = () => {
    setGalleryLightboxIndex(null);
    setGalleryActiveIndex(null);
  };

  const handleLightboxPrev = () => {
    setGalleryLightboxIndex(
      (current) =>
        current === null
          ? null
          : (current +
              gallery.length -
              1) %
            gallery.length,
    );
  };

  const handleLightboxNext = () => {
    setGalleryLightboxIndex(
      (current) =>
        current === null
          ? null
          : (current + 1) %
            gallery.length,
    );
  };

  useEffect(() => {
    if (
      galleryLightboxIndex === null
    ) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow =
      "hidden";

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        closeGalleryLightbox();
        return;
      }

      if (event.key === "ArrowLeft") {
        handleLightboxPrev();
        return;
      }

      if (event.key === "ArrowRight") {
        handleLightboxNext();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );

      document.body.style.overflow =
        "";
    };
  }, [galleryLightboxIndex]);

  const handleLightboxTouchStart = (
    event: TouchEvent<HTMLDivElement>,
  ) => {
    setGalleryLightboxTouchStartX(
      event.touches[0]?.clientX ?? null,
    );
  };

  const handleLightboxTouchEnd = (
    event: TouchEvent<HTMLDivElement>,
  ) => {
    if (
      galleryLightboxTouchStartX === null
    ) {
      return;
    }

    const touch =
      event.changedTouches[0];

    if (!touch) return;

    const deltaX =
      touch.clientX -
      galleryLightboxTouchStartX;

    if (deltaX > 50) {
      handleLightboxPrev();
    } else if (deltaX < -50) {
      handleLightboxNext();
    }

    setGalleryLightboxTouchStartX(
      null,
    );
  };

  /*
   * Active section / hash navigation
   */

  useEffect(() => {
    const observer =
      new IntersectionObserver(
        (entries) => {
          const viewportCenter =
            (window.innerHeight ||
              document.documentElement
                .clientHeight) /
            2;

          const visible =
            entries.filter(
              (entry) =>
                entry.isIntersecting,
            );

          if (visible.length === 0) {
            return;
          }

          const best = visible
            .map((entry) => {
              const rect =
                entry.boundingClientRect;

              const elementCenter =
                rect.top +
                rect.height / 2;

              const distance =
                Math.abs(
                  elementCenter -
                    viewportCenter,
                );

              return {
                entry,
                distance,
                ratio:
                  entry.intersectionRatio,
              };
            })
            .sort((a, b) =>
              a.distance !== b.distance
                ? a.distance -
                  b.distance
                : b.ratio -
                  a.ratio,
            )[0];

          const visibleSection =
            best?.entry;

          if (
            visibleSection?.target?.id
          ) {
            const sectionId =
              visibleSection.target.id;

            setActiveSection(
              sectionId,
            );

            window.history.replaceState(
              null,
              "",
              `#${sectionId}`,
            );
          }
        },
        {
          root: null,
          rootMargin:
            "-45% 0px -45% 0px",
          threshold: [
            0.25,
            0.4,
            0.6,
            0.8,
          ],
        },
      );

    sections.forEach((section) => {
      const element =
        document.getElementById(
          section.id,
        );

      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    const scrollToHash = () => {
      const hash =
        window.location.hash.replace(
          "#",
          "",
        );

      if (!hash) return;

      const target =
        sectionRefs.current[hash];

      if (!target) return;

      setActiveSection(hash);

      window.requestAnimationFrame(
        () => {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        },
      );
    };

    scrollToHash();

    window.addEventListener(
      "hashchange",
      scrollToHash,
    );

    return () => {
      window.removeEventListener(
        "hashchange",
        scrollToHash,
      );
    };
  }, []);

  /*
   * Scroll progress
   */

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop =
        window.scrollY ||
        window.pageYOffset;

      const docHeight =
        document.documentElement
          .scrollHeight;

      const winHeight =
        window.innerHeight;

      const progress =
        docHeight > winHeight
          ? scrollTop /
            (docHeight - winHeight)
          : 0;

      setScrollProgress(
        Math.min(
          Math.max(progress, 0),
          1,
        ),
      );
    };

    updateProgress();

    window.addEventListener(
      "scroll",
      updateProgress,
      { passive: true },
    );

    window.addEventListener(
      "resize",
      updateProgress,
    );

    return () => {
      window.removeEventListener(
        "scroll",
        updateProgress,
      );

      window.removeEventListener(
        "resize",
        updateProgress,
      );
    };
  }, []);

  /*
   * About section reveal
   */

  useEffect(() => {
    if (!aboutCardRef.current) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setStarReveal(
              entry.isIntersecting,
            );
          });
        },
        {
          threshold: 0.35,
        },
      );

    observer.observe(
      aboutCardRef.current,
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  /*
   * Pricing number animation
   */

  useEffect(() => {
    if (!pricingRef.current) {
      return;
    }

    let frameId: number | null =
      null;

    let startTime: number | null =
      null;

    let hasAnimated = false;

    const animatePrice = () => {
      if (hasAnimated) {
        return;
      }

      hasAnimated = true;

      if (frameId !== null) {
        cancelAnimationFrame(
          frameId,
        );
      }

      startTime = null;

      const duration = 1200;

      const step = (
        timestamp: number,
      ) => {
        if (startTime === null) {
          startTime = timestamp;
        }

        const progress = Math.min(
          (timestamp - startTime) /
            duration,
          1,
        );

        setAnimatedPrice(
          Math.round(
            HOURLY_PRICE *
              progress,
          ),
        );

        if (progress < 1) {
          frameId =
            requestAnimationFrame(
              step,
            );
        } else {
          frameId = null;
        }
      };

      frameId =
        requestAnimationFrame(step);
    };

    const observer =
      new IntersectionObserver(
        (entries) => {
          if (
            entries.some(
              (entry) =>
                entry.isIntersecting,
            )
          ) {
            animatePrice();
            observer.disconnect();
          }
        },
        {
          threshold: 0.4,
        },
      );

    observer.observe(
      pricingRef.current,
    );

    return () => {
      observer.disconnect();

      if (frameId !== null) {
        cancelAnimationFrame(
          frameId,
        );
      }
    };
  }, []);

  /*
   * Section reveal animation
   */

  useEffect(() => {
    const revealTargets =
      document.querySelectorAll<HTMLElement>(
        "#gallery, #pricing, #booking",
      );

    const revealClass =
      "section-reveal-in";

    if (
      typeof window ===
        "undefined" ||
      !(
        "IntersectionObserver" in
        window
      )
    ) {
      revealTargets.forEach(
        (target) =>
          target.classList.add(
            revealClass,
          ),
      );

      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (
              entry.isIntersecting
            ) {
              entry.target.classList.add(
                revealClass,
              );

              observer.unobserve(
                entry.target,
              );
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin:
            "0px 0px -8% 0px",
        },
      );

    revealTargets.forEach(
      (target) =>
        observer.observe(target),
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  const scrollProgressPercent =
    Math.min(
      Math.max(
        scrollProgress,
        0,
      ),
      1,
    ) * 100;

  return (
    <main className="min-h-[100svh] has-mobile-hero relative overflow-x-clip overflow-hidden bg-transparent text-foreground">
      {/* Mobile hero wrapper */}
      <div className="mobile-hero-wrap">
        <div className="hero-bg-layer pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div
            className="hero-bg-img absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${heroImg})`,
              backgroundSize: "cover",
              backgroundPosition:
                "center",
            }}
          />

          <div className="absolute inset-0">
            <div className="flood-blink absolute right-[10%] top-[14%] h-72 w-72 rounded-full">
              <div className="h-full w-full rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.85)_0%,rgba(190,255,210,0.25)_35%,transparent_70%)] blur-md motion-safe:animate-[spin_18s_linear_infinite]" />
            </div>

            <div className="flood-blink-slow absolute right-[26%] top-[30%] h-44 w-44 rounded-full">
              <div className="h-full w-full rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.7)_0%,rgba(160,255,190,0.2)_40%,transparent_72%)] blur-md motion-safe:animate-[spin_24s_linear_infinite_reverse]" />
            </div>

            <div className="field-pulse absolute right-0 top-[80%] h-[40%] w-[70%] bg-[radial-gradient(ellipse_at_70%_40%,rgba(60,235,120,0.35)_0%,transparent_65%)]" />

            <div className="dot-grid absolute left-0 top-32 h-96 w-40" />
          </div>
        </div>

        {/* Hero */}
        <div
          id="hero"
          ref={(node) => {
            sectionRefs.current["hero"] =
              node;
          }}
          className="relative z-10 mx-auto flex w-[min(96vw,1700px)] flex-col justify-center overflow-x-clip px-4 pb-10 pt-0 sm:px-5 md:px-6 lg:px-6"
        >
          <div className="relative overflow-hidden rounded-[2.5rem] bg-transparent">
            <div className="relative z-10 flex flex-col gap-10 rounded-[2.5rem] px-4 pb-10 pt-2 sm:px-6 sm:pb-12 sm:pt-4 lg:px-8 lg:pb-14">
              <SiteHeader />

              <section className="flex flex-col gap-10">
                <div className="hero-content w-full max-w-[min(100%,760px)]">
                  <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
                    {/* Rotating hero logo */}
                    <div
                      className="hero-logo hidden shrink-0 self-center md:block"
                      aria-hidden="true"
                    >
                      <svg
                        viewBox="0 0 200 200"
                        className="h-28 w-28 lg:h-32 lg:w-32"
                      >
                        <defs>
                          <linearGradient
                            id="heroLogoGrad"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="rgba(96,240,120,0.9)"
                            />
                            <stop
                              offset="100%"
                              stopColor="rgba(60,235,120,0.2)"
                            />
                          </linearGradient>

                          <path
                            id="heroLogoCirclePath"
                            d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0"
                          />
                        </defs>

                        <circle
                          cx="100"
                          cy="100"
                          r="98"
                          fill="rgba(8,14,10,0.75)"
                          stroke="url(#heroLogoGrad)"
                          strokeWidth="2"
                        />

                        <g className="hero-logo-rotor">
                          <circle
                            cx="100"
                            cy="100"
                            r="92"
                            fill="none"
                            stroke="rgba(96,240,120,0.28)"
                            strokeWidth="1.5"
                            strokeDasharray="4 9"
                          />

                          <text
                            fontSize="12.5"
                            letterSpacing="3"
                            fontFamily="Manrope, ui-sans-serif, sans-serif"
                            fontWeight="800"
                            fill="rgba(96,240,120,0.95)"
                          >
                            <textPath href="#heroLogoCirclePath">
                              TURFON24 • 24/7 • FULL DAY • TURFON24 • 24/7 • FULL DAY •
                            </textPath>
                          </text>
                        </g>

                        <circle
                          cx="100"
                          cy="100"
                          r="60"
                          fill="#0c1510"
                          stroke="rgba(96,240,120,0.35)"
                          strokeWidth="1.5"
                        />

                        <g opacity="0.6">
                          <polygon
                            points="100,72 117,83 111,103 89,103 83,83"
                            fill="none"
                            stroke="#3ceb78"
                            strokeWidth="2"
                          />

                          <line
                            x1="100"
                            y1="72"
                            x2="100"
                            y2="42"
                            stroke="#3ceb78"
                            strokeWidth="2"
                          />

                          <line
                            x1="117"
                            y1="83"
                            x2="142"
                            y2="60"
                            stroke="#3ceb78"
                            strokeWidth="2"
                          />

                          <line
                            x1="111"
                            y1="103"
                            x2="142"
                            y2="140"
                            stroke="#3ceb78"
                            strokeWidth="2"
                          />

                          <line
                            x1="89"
                            y1="103"
                            x2="58"
                            y2="140"
                            stroke="#3ceb78"
                            strokeWidth="2"
                          />

                          <line
                            x1="83"
                            y1="83"
                            x2="58"
                            y2="60"
                            stroke="#3ceb78"
                            strokeWidth="2"
                          />
                        </g>

                        <text
                          x="100"
                          y="109"
                          textAnchor="middle"
                          fontSize="27"
                          letterSpacing="1"
                          fontFamily="Manrope, ui-sans-serif, sans-serif"
                          fontWeight="800"
                          fill="#3ceb78"
                          filter="drop-shadow(0 0 12px rgba(60,235,120,0.45))"
                        >
                          24/7
                        </text>
                      </svg>
                    </div>

                    <div className="w-full">
                      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-turf">
                        Premium Football Turf
                      </p>
                    </div>
                  </div>

                  <h1 className="mt-6 text-[clamp(2.5rem,1.2rem+4.5vw,4.25rem)] font-black leading-[1.03] tracking-tight text-white">
                    Book the Turf
                    <span className="block text-turf">
                      By the Hour
                    </span>
                  </h1>

                  <ul className="mt-7 flex flex-wrap items-center gap-6 text-sm text-foreground/85">
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-turf" />
                      Morning to Night
                    </li>

                    <li className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-turf" />
                      Exclusive Access
                    </li>

                    <li className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-turf" />
                      For Teams &amp; Events
                    </li>
                  </ul>

                  <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                    <a
                      href="#pricing"
                      className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      <CalendarDays className="h-5 w-5 text-turf" />
                      Check Pricing
                    </a>

                    <a
                      href="#booking"
                      className="inline-flex items-center gap-3 rounded-xl bg-turf px-6 py-3 text-sm font-semibold text-night shadow-[0_0_35px_rgba(60,235,120,0.45)] transition hover:brightness-110"
                    >
                      Book Now
                      <ArrowRight className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </section>

              <section className="mt-4 grid grid-cols-1 items-stretch gap-4 overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
                {trustItems.map(
                  ({
                    icon: Icon,
                    title,
                    sub,
                  }) => (
                    <div
                      key={title}
                      className="flex h-full items-center gap-4 px-8 py-8"
                    >
                      <Icon className="h-9 w-9 shrink-0 text-turf" />

                      <div>
                        <p className="text-lg font-bold">
                          {title}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {sub}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <section
        id="about"
        ref={(node) => {
          sectionRefs.current["about"] =
            node;
        }}
        className="relative mx-auto mb-16 max-w-7xl overflow-hidden px-6 py-24 scroll-mt-24 md:mb-0 md:px-10 md:py-18 lg:px-10 xl:px-12"
      >
        <div className="pointer-events-none absolute left-0 top-10 h-28 w-28 rounded-full bg-turf/10 blur-3xl" />

        <div className="pointer-events-none absolute right-0 top-20 h-36 w-36 rounded-full bg-turf/15 blur-3xl" />

        <div className="grid gap-6 lg:gap-7 xl:grid-cols-[1.55fr_1fr]">
          <div
            ref={aboutCardRef}
            className={`group relative overflow-hidden rounded-[1.75rem] border border-turf/15 bg-white/15 p-8 shadow-[0_0_80px_rgba(16,221,86,0.14)] backdrop-blur-2xl transition duration-500 hover:-translate-y-1 hover:shadow-[0_0_90px_rgba(16,221,86,0.18)] lg:p-9 ${
              starReveal
                ? "about-star-reveal"
                : ""
            }`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,221,86,0.16),transparent_40%)]" />

            <div className="absolute bottom-10 right-10 h-28 w-28 rounded-full bg-turf/10 blur-3xl" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-turf/20 bg-turf/10 px-4 py-2 text-sm text-turf">
                <Sparkles className="h-4 w-4" />
                Featured experience
              </span>

              <p className="mt-7 text-sm font-semibold uppercase tracking-[0.35em] text-turf">
                ABOUT US
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Premium Football Experience
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base md:mt-4">
                TurfOn24 brings championship-level pitch, floodlights, and night-time energy together for teams, leagues, and events.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {aboutStats.map(
                  (stat, index) => (
                    <div
                      key={stat.label}
                      onPointerEnter={() =>
                        setHoveredStatIndex(
                          index,
                        )
                      }
                      onPointerLeave={() =>
                        setHoveredStatIndex(
                          null,
                        )
                      }
                      className={`rounded-2xl border border-turf/10 bg-night/10 p-5 text-sm transition duration-300 ${
                        hoveredStatIndex ===
                        index
                          ? "scale-[1.02] border-turf/30 bg-black/20 shadow-[0_0_30px_rgba(96,240,120,0.16)]"
                          : "hover:border-turf/20 hover:bg-white/5"
                      }`}
                    >
                      <p className="text-2xl font-bold text-turf">
                        {stat.value}
                      </p>

                      <p className="mt-2 text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  ),
                )}
              </div>

              <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-turf/20 bg-turf/10 px-4 py-2.5 text-sm text-turf shadow-sm">
                <BadgeCheck className="h-4 w-4" />
                Verified premium venue
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {features
              .slice(0, 3)
              .map(
                ({
                  id,
                  icon: Icon,
                  title,
                  text,
                }) => (
                  <div
                    key={id}
                    className="relative overflow-hidden rounded-[1.5rem] border border-turf/15 bg-black/40 p-6 shadow-[0_0_40px_rgba(16,221,86,0.08)] backdrop-blur-2xl transition duration-500 hover:-translate-y-1 hover:shadow-[0_0_50px_rgba(16,221,86,0.12)] lg:p-7"
                  >
                    <div className="absolute left-6 top-6 h-14 w-14 rounded-full bg-turf/10 blur-3xl" />

                    <div className="relative z-10 flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-turf/10 text-turf">
                        <Icon className="h-5 w-5" />
                      </div>

                      <p className="text-lg font-semibold">
                        {title}
                      </p>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {text}
                    </p>
                  </div>
                ),
              )}
          </div>
        </div>
      </section>

      {/* Why TurfOn24 */}
      <section
        id="features"
        ref={(node) => {
          sectionRefs.current["features"] =
            node;
        }}
        className="relative mx-auto mb-16 max-w-7xl overflow-hidden px-6 py-24 scroll-mt-24 md:mb-0 md:px-10 md:py-18 lg:px-10 xl:px-12"
      >
        <div className="pointer-events-none absolute left-0 top-12 h-32 w-32 rounded-full bg-turf/10 blur-3xl" />

        <div className="pointer-events-none absolute bottom-10 right-0 h-28 w-28 rounded-full bg-turf/15 blur-3xl" />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-turf">
              Why TurfOn24
            </p>

            <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
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

        <div
          ref={timelineShellRef}
          className="relative mt-10 overflow-visible lg:mt-12"
        >
          <div className="timeline-snake pointer-events-none absolute inset-0">
            <svg
              ref={timelineSvgRef}
              viewBox="0 0 300 1000"
              preserveAspectRatio="none"
              className="h-full w-full"
            >
              <defs>
                <linearGradient
                  id="snakeGradient"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="rgba(96,240,120,0.8)"
                  />

                  <stop
                    offset="30%"
                    stopColor="rgba(96,240,120,0.25)"
                  />

                  <stop
                    offset="55%"
                    stopColor="rgba(96,240,120,0.65)"
                  />

                  <stop
                    offset="100%"
                    stopColor="rgba(96,240,120,0.4)"
                  />
                </linearGradient>

                <filter
                  id="snakePulseGlow"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur
                    stdDeviation="4"
                    result="blur"
                  />

                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <path
                id="snakePath"
                ref={timelinePathRef}
                className="timeline-snake-base"
                d={timelineD || "M0 0"}
              />

              {timelinePoints.map(
                (point, index) => (
                  <circle
                    key={`timeline-node-${index}`}
                    className="timeline-snake-node"
                    cx={point.x}
                    cy={point.y}
                    r="6"
                  />
                ),
              )}

              <circle
                className="timeline-snake-pulse"
                r="7"
                cx="0"
                cy="0"
              >
                <animateMotion
                  dur="8s"
                  repeatCount="indefinite"
                >
                  <mpath href="#snakePath" />
                </animateMotion>
              </circle>
            </svg>
          </div>

          <div className="grid gap-6">
            {features.map(
              (
                {
                  id,
                  icon: Icon,
                  title,
                  text,
                },
                index,
              ) => (
                <div
                  ref={(node) => {
                    featureCardRefs.current[
                      index
                    ] = node;
                  }}
                  key={id}
                  className={`relative overflow-hidden rounded-[1.75rem] border border-turf/15 p-6 shadow-[0_0_40px_rgba(16,221,86,0.08)] backdrop-blur-2xl transition duration-500 hover:-translate-y-1 hover:shadow-[0_0_55px_rgba(16,221,86,0.16)] lg:p-7 ${
                    index % 2 === 0
                      ? "bg-black/40 lg:mr-auto lg:max-w-[540px] lg:self-end"
                      : "bg-white/5 lg:ml-auto lg:max-w-[540px] lg:self-start"
                  }`}
                >
                  <div className="absolute left-1/2 top-0 h-9 w-9 -translate-x-1/2 rounded-full bg-turf/15 ring-1 ring-turf/25" />

                  <div className="relative z-10 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-turf/10 text-turf animate-pulse">
                      <Icon className="h-5 w-5" />
                    </div>

                    <p className="text-xs uppercase tracking-[0.3em] text-turf">
                      Step {index + 1}
                    </p>
                  </div>

                  <h3 className="mt-5 text-xl font-bold">
                    {title}
                  </h3>

                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {text}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section
        id="gallery"
        ref={(node) => {
          sectionRefs.current["gallery"] =
            node;
        }}
        className="gallery mx-auto mb-16 max-w-7xl scroll-mt-24 px-6 py-20 md:mb-0 md:px-10 md:py-18 lg:px-10 lg:py-24 xl:px-12"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-turf">
          Gallery
        </p>

        <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
          See the turf in action
        </h2>

        <p className="mt-5 max-w-2xl text-muted-foreground md:mt-4">
          Browse the venue, floodlights, and premium feel of our turf experience.
        </p>

        <div className="gallery-carousel relative mt-10">
          <div className="gallery-light-spot" />

          <div
            ref={galleryCarouselRef}
            className="gallery-carousel-viewport"
            role="region"
            aria-roledescription="carousel"
            aria-label="Turf gallery"
            tabIndex={0}
            onKeyDown={
              handleCarouselKeyDown
            }
            onPointerMove={
              handleGalleryContainerPointerMove
            }
            onPointerOver={
              handleGalleryContainerPointerOver
            }
            onPointerOut={
              handleGalleryContainerPointerOut
            }
          >
            <div className="gallery-carousel-track">
              {gallery.map(
                (item, index) => {
                  const selected =
                    gallerySelectedIndex ===
                    index;

                  const hovered =
                    galleryHoverIndex ===
                    index;

                  const active =
                    selected || hovered;

                  const anyHover =
                    galleryHoverIndex !==
                    null;

                  const rotateX =
                    active &&
                    !touchDeviceDetected.current
                      ? Math.min(
                          Math.max(
                            (galleryCursor.y -
                              120) /
                              28,
                            -4,
                          ),
                          4,
                        )
                      : 0;

                  const rotateY =
                    active &&
                    !touchDeviceDetected.current
                      ? Math.min(
                          Math.max(
                            (galleryCursor.x -
                              210) /
                              28,
                            -4,
                          ),
                          4,
                        )
                      : 0;

                  const detail =
                    galleryDetails[
                      index
                    ];

                  const stateClass =
                    selected
                      ? "gallery-carousel-card-selected"
                      : hovered
                        ? "gallery-card-active"
                        : anyHover
                          ? "gallery-carousel-card-dimmed"
                          : "";

                  return (
                    <div
                      key={`gallery-slide-${index}`}
                      className="gallery-carousel-slide"
                      role="group"
                      aria-roledescription="slide"
                      aria-label={`${index + 1} of ${gallery.length}`}
                      aria-current={
                        selected
                          ? "true"
                          : undefined
                      }
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        data-index={index}
                        className={`gallery-carousel-card gallery-card group relative h-full w-full overflow-hidden rounded-[1.85rem] border border-turf/15 bg-black/10 shadow-[0_0_32px_rgba(0,0,0,0.26)] transition duration-500 ease-out ${stateClass}`}
                        onPointerDown={
                          handleCarouselSlidePointerDown
                        }
                        onPointerMove={
                          handleCarouselSlidePointerMove
                        }
                        onClick={() =>
                          handleCarouselSlideClick(
                            index,
                          )
                        }
                        onKeyDown={(event) =>
                          handleGalleryCardKeyDown(
                            event,
                            index,
                          )
                        }
                        onPointerEnter={(
                          event,
                        ) =>
                          handleGalleryPointerEnter(
                            event,
                            index,
                          )
                        }
                        onPointerLeave={
                          handleGalleryPointerLeave
                        }
                        style={{
                          transform: active
                            ? `translate3d(0,-6px,0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)${
                                selected
                                  ? ""
                                  : " scale(0.92)"
                              }`
                            : undefined,
                        }}
                      >
                        <img
                          src={item.src}
                          alt={item.alt}
                          draggable={false}
                          className="gallery-card-img absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out"
                        />

                        <svg
                          className="gallery-frame pointer-events-none absolute inset-1"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          aria-hidden="true"
                        >
                          <defs>
                            <linearGradient
                              id={`frameGrad-${index}`}
                              x1="0"
                              x2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="rgba(96,240,120,0.95)"
                              />

                              <stop
                                offset="40%"
                                stopColor="rgba(96,240,120,0.4)"
                              />

                              <stop
                                offset="100%"
                                stopColor="rgba(96,240,120,0.95)"
                              />
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
                              "--frame-delay": `${
                                (index % 3) *
                                0.45
                              }s`,
                            } as React.CSSProperties}
                          />
                        </svg>

                        <span className="gallery-corner-bracket gallery-corner-tl" />
                        <span className="gallery-corner-bracket gallery-corner-tr" />
                        <span className="gallery-corner-bracket gallery-corner-bl" />
                        <span className="gallery-corner-bracket gallery-corner-br" />

                        <div className="gallery-card-overlay pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 ease-out" />

                        <div className="gallery-card-glow pointer-events-none absolute inset-0 rounded-[1.85rem] opacity-0 transition-opacity duration-300 ease-out" />

                        <span
                          className="gallery-card-spot pointer-events-none absolute h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(96,240,120,0.18),transparent_70%)] opacity-0 transition-all duration-200 ease-out"
                          style={{
                            left: `${galleryCursor.x}px`,
                            top: `${galleryCursor.y}px`,
                            opacity: active
                              ? 0.85
                              : 0,
                            transform:
                              "translate(-50%, -50%)",
                          }}
                        />

                        <div
                          className="gallery-card-shine pointer-events-none absolute left-[-15%] top-0 h-28 w-[120%] rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-all duration-300 ease-out"
                          style={{
                            transform: active
                              ? "translateX(170px)"
                              : "translateX(-140px)",
                            opacity: active
                              ? 0.8
                              : 0,
                          }}
                        />

                        <div className="gallery-card-meta pointer-events-none absolute inset-x-0 bottom-6 px-6 text-left opacity-0 transition-all duration-300 ease-out">
                          <span className="block text-[0.7rem] uppercase tracking-[0.35em] text-turf/90">
                            {detail?.label}
                          </span>

                          <span className="mt-1 block text-sm font-semibold uppercase tracking-[0.28em] text-white">
                            {detail?.subtitle}
                          </span>
                        </div>

                        <div className="gallery-card-number absolute left-6 top-6 text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-turf/80">
                          {detail?.label.split(
                            " — ",
                          )[0]}
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              galleryCarouselApi?.scrollPrev()
            }
            aria-label="Previous image"
            className="gallery-carousel-nav gallery-carousel-nav-prev"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() =>
              galleryCarouselApi?.scrollNext()
            }
            aria-label="Next image"
            className="gallery-carousel-nav gallery-carousel-nav-next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="gallery-carousel-caption mt-6 flex flex-wrap items-center justify-center gap-4">
            <span className="text-[0.7rem] uppercase tracking-[0.35em] text-turf/90">
              {galleryLabels[
                gallerySelectedIndex
              ] ?? ""}
            </span>

            <span className="flex items-center gap-2">
              {gallery.map(
                (_, index) => (
                  <button
                    key={`gallery-dot-${index}`}
                    type="button"
                    onClick={() =>
                      galleryCarouselApi?.scrollTo(
                        index,
                      )
                    }
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={
                      index ===
                      gallerySelectedIndex
                    }
                    className={`gallery-carousel-dot ${
                      index ===
                      gallerySelectedIndex
                        ? "gallery-carousel-dot-active"
                        : ""
                    }`}
                  />
                ),
              )}
            </span>
          </div>
        </div>

        {/* Gallery Lightbox */}
        {galleryLightboxIndex !==
        null ? (
          <div
            className="gallery-lightbox fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 text-white"
            onClick={closeGalleryLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Gallery image viewer"
          >
            <button
              type="button"
              onClick={closeGalleryLightbox}
              aria-label="Close gallery"
              className="gallery-lightbox-close absolute right-6 top-6 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-turf/30 bg-black/70 text-turf shadow-[0_0_30px_rgba(60,235,120,0.25)] transition hover:bg-black/80"
            >
              <span
                className="text-2xl leading-none"
                aria-hidden="true"
              >
                ×
              </span>
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleLightboxPrev();
              }}
              aria-label="Previous image"
              className="gallery-lightbox-nav absolute left-6 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-turf/30 bg-black/70 text-turf shadow-[0_0_30px_rgba(60,235,120,0.2)] transition hover:bg-black/80"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleLightboxNext();
              }}
              aria-label="Next image"
              className="gallery-lightbox-nav absolute right-6 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-turf/30 bg-black/70 text-turf shadow-[0_0_30px_rgba(60,235,120,0.2)] transition hover:bg-black/80"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <div
              className="gallery-lightbox-inner relative z-10 mx-auto max-h-[90vh] max-w-[90vw] overflow-hidden rounded-[1.75rem] border border-turf/15 bg-black/90"
              onClick={(event) =>
                event.stopPropagation()
              }
              onTouchStart={
                handleLightboxTouchStart
              }
              onTouchEnd={
                handleLightboxTouchEnd
              }
            >
              <img
                src={
                  gallery[
                    galleryLightboxIndex
                  ]?.src
                }
                alt={
                  gallery[
                    galleryLightboxIndex
                  ]?.alt ??
                  "Turf gallery image"
                }
                draggable={false}
                className="max-h-[85vh] max-w-[85vw] object-contain"
              />

              <div className="absolute inset-x-0 bottom-6 mx-auto flex max-w-[92%] flex-col items-center gap-2 text-center text-sm text-white/80">
                <p className="text-xs uppercase tracking-[0.35em] text-turf">
                  {
                    galleryLabels[
                      galleryLightboxIndex
                    ]
                  }
                </p>

                <p className="text-sm">
                  Swipe left or right to browse. Tap the close icon or outside to exit.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        ref={(node) => {
          sectionRefs.current["pricing"] =
            node;
          pricingRef.current = node;
        }}
        className="relative mx-auto mb-16 max-w-7xl overflow-hidden px-6 py-24 scroll-mt-24 md:mb-0 md:px-10 md:py-18 lg:px-10 xl:px-12"
      >
        <div className="pointer-events-none absolute left-0 top-10 h-28 w-28 rounded-full bg-turf/10 blur-3xl" />

        <div className="pointer-events-none absolute right-0 top-20 h-36 w-36 rounded-full bg-turf/15 blur-3xl" />

        <div className="grid gap-6 lg:gap-7 xl:grid-cols-[1.55fr_1fr]">
          <div className="group relative overflow-hidden rounded-[1.75rem] border border-turf/15 bg-white/15 p-8 shadow-[0_0_80px_rgba(16,221,86,0.14)] backdrop-blur-2xl transition duration-500 hover:-translate-y-1 hover:shadow-[0_0_90px_rgba(16,221,86,0.18)] lg:p-9">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,221,86,0.16),transparent_40%)]" />

            <div className="absolute bottom-10 right-10 h-28 w-28 rounded-full bg-turf/10 blur-3xl" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-turf/20 bg-turf/10 px-4 py-2 text-sm text-turf">
                <Clock className="h-4 w-4" />
                Best hourly rate
              </span>

              <p className="mt-7 text-sm font-semibold uppercase tracking-[0.35em] text-turf">
                Pricing
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Choose your game plan
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base md:mt-4">
                Flexible turf packages for casual matches, teams and events.
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
                {pricing.features.map(
                  (feature) => (
                    <div
                      key={feature.title}
                      className="rounded-2xl border border-turf/10 bg-night/10 p-5 text-sm transition duration-300 hover:border-turf/20 hover:bg-white/5"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-turf/10 text-turf">
                          <feature.icon className="h-4 w-4" />
                        </span>

                        <p className="font-semibold">
                          {feature.title}
                        </p>
                      </div>

                      <p className="mt-2 text-muted-foreground">
                        {feature.text}
                      </p>
                    </div>
                  ),
                )}
              </div>

              <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-turf/20 bg-turf/10 px-4 py-2.5 text-sm text-turf shadow-sm">
                <BadgeCheck className="h-4 w-4" />
                Best value for weekend matches
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {pricingHighlights.map(
              ({
                icon: Icon,
                title,
                text,
              }) => (
                <div
                  key={title}
                  className="relative overflow-hidden rounded-[1.5rem] border border-turf/15 bg-black/40 p-6 shadow-[0_0_40px_rgba(16,221,86,0.08)] backdrop-blur-2xl transition duration-500 hover:-translate-y-1 hover:shadow-[0_0_50px_rgba(16,221,86,0.12)] lg:p-7"
                >
                  <div className="absolute left-6 top-6 h-14 w-14 rounded-full bg-turf/10 blur-3xl" />

                  <div className="relative z-10 flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-turf/10 text-turf">
                      <Icon className="h-5 w-5" />
                    </div>

                    <p className="text-lg font-semibold">
                      {title}
                    </p>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {text}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Booking */}
      <BookingSection
        booking={booking}
        sectionRef={(node) => {
          sectionRefs.current["booking"] =
            node;
        }}
      />

      {/* Contact */}
      <section
        id="contact"
        ref={(node) => {
          sectionRefs.current["contact"] =
            node;
        }}
        className="mx-auto mb-16 max-w-7xl scroll-mt-24 px-6 py-20 md:mb-0 md:px-10 md:py-18 lg:px-10 lg:py-24 xl:px-12"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-turf">
          Contact
        </p>

        <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
          Reach out for bookings and enquiries
        </h2>

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
          <div className="flex h-full flex-col rounded-3xl border border-turf/15 bg-black/50 p-8 shadow-[0_0_25px_-12px_rgba(60,235,120,0.45)] backdrop-blur-2xl transition-all duration-500 ease-out hover:-translate-y-1 hover:border-turf/25 hover:shadow-[0_0_35px_-10px_rgba(60,235,120,0.6)]">
            <p className="font-semibold text-white">
              Location
            </p>

            <p className="mt-3 text-sm text-muted-foreground">
              Sector 12, Sports City, Cityville
            </p>
          </div>

          <div className="flex h-full flex-col rounded-3xl border border-turf/15 bg-black/50 p-8 shadow-[0_0_25px_-12px_rgba(60,235,120,0.45)] backdrop-blur-2xl transition-all duration-500 ease-out hover:-translate-y-1 hover:border-turf/25 hover:shadow-[0_0_35px_-10px_rgba(60,235,120,0.6)]">
            <p className="font-semibold text-white">
              Phone
            </p>

            <p className="mt-3 text-sm text-muted-foreground">
              +91 98765 43210
            </p>
          </div>

          <div className="flex h-full flex-col rounded-3xl border border-turf/15 bg-black/50 p-8 shadow-[0_0_25px_-12px_rgba(60,235,120,0.45)] backdrop-blur-2xl transition-all duration-500 ease-out hover:-translate-y-1 hover:border-turf/25 hover:shadow-[0_0_35px_-10px_rgba(60,235,120,0.6)]">
            <p className="font-semibold text-white">
              Email
            </p>

            <p className="mt-3 text-sm text-muted-foreground">
              play@turfon24.com
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />

      {/* Optional scroll progress value for existing CSS animations */}
      <span
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 left-0 z-[60] h-[2px] bg-turf transition-[width] duration-150"
        style={{
          width: `${scrollProgressPercent}%`,
        }}
      />
    </main>
  );
}