"use client";

import { useEffect, useRef } from "react";
import { PlateFace } from "./card-faces";

const ANGLE_STEP = 0.45;
const EXPAND_ANGLE = 0.25;
const EXPAND_SPAN = 1.5;
const END_ANGLE = -1.5;
const INTRO_HOLD = 0.45;
const RADIANS_PER_SCREEN = 0.5;
const SHOW_FROM = 1.65;
const SHOW_FULL = 1.15;
const HIDE_FROM = -1.2;
const HIDE_AT = -1.75;

const PLATES = [
  {
    key: "new-york",
    label: "Lower Manhattan across the harbor",
    src: "/cards/new-york.jpg",
    position: "center 70%",
    title: ["New York"],
    text: "Glass and steel stacked across the harbor.",
  },
  {
    key: "hong-kong",
    label: "Hong Kong harbor at night",
    src: "/cards/hong-kong.jpg",
    position: "center 48%",
    title: ["Hong Kong"],
    text: "Towers crowd the harbor after dark.",
  },
  {
    key: "barcelona",
    label: "Barcelona climbing toward the ridge",
    src: "/cards/barcelona.jpg",
    position: "center 55%",
    title: ["Barcelona"],
    text: "The city climbs toward the ridge and the sea.",
  },
  {
    key: "london",
    label: "London from Waterloo Bridge",
    src: "/cards/london.jpg",
    position: "center 62%",
    title: ["London"],
    text: "The Thames carries the city through blue hour.",
  },
  {
    key: "singapore",
    label: "Marina Bay, Singapore",
    src: "/cards/singapore.jpg",
    position: "center 60%",
    title: ["Singapore"],
    text: "Marina Bay folds the skyline into the water.",
  },
  {
    key: "istanbul",
    label: "Istanbul along the water",
    src: "/cards/istanbul.jpg",
    position: "center 58%",
    title: ["Istanbul"],
    text: "Two continents meet along the water.",
  },
  {
    key: "rome",
    label: "Rome across its hills",
    src: "/cards/rome.jpg",
    position: "30% center",
    title: ["Rome"],
    text: "Domes and tiled roofs gather on the hills.",
  },
  {
    key: "dubai",
    label: "Dubai and the Burj Khalifa",
    src: "/cards/dubai.jpg",
    position: "center 40%",
    title: ["Dubai"],
    text: "The Burj Khalifa lifts the skyline with it.",
  },
  {
    key: "paris",
    label: "Paris and the Eiffel Tower at night",
    src: "/cards/paris.jpg",
    position: "24% center",
    title: ["Paris"],
    text: "The tower holds the river in its light.",
  },
  {
    key: "tokyo",
    label: "Minato, Tokyo at night",
    src: "/cards/tokyo.jpg",
    position: "64% center",
    title: ["Tokyo"],
    text: "Minato burns through the night above the bay.",
  },
  {
    key: "tehran",
    label: "Tehran skyline over Laleh Park",
    src: "/cards/tehran.jpg",
    position: "center 42%",
    title: ["Tehran"],
    text: "The city rises above the park toward the mountains.",
  },
] as const;

const FIRST_INDEX = PLATES.length - 1;
const START_ANGLE =
  EXPAND_ANGLE + EXPAND_SPAN + INTRO_HOLD + FIRST_INDEX * ANGLE_STEP;

type Metrics = {
  cardSize: number;
  radius: number;
  expandedWidth: number;
  expandedHeight: number;
  originX: number;
  originY: number;
  originRotation: number;
};

function computeMetrics(): Metrics {
  const narrow = window.innerWidth < 1000;
  const cardSize = narrow ? 320 : 500;
  const radius = narrow ? 800 : 1250;
  const inset = 64;
  return {
    cardSize,
    radius,
    expandedWidth: window.innerWidth - inset,
    expandedHeight: window.innerHeight - inset,
    originX: Math.sin(EXPAND_ANGLE) * radius,
    originY: (1 - Math.cos(EXPAND_ANGLE)) * radius,
    originRotation: EXPAND_ANGLE * (180 / Math.PI),
  };
}

function arcOpacity(angle: number) {
  const fadeIn = (SHOW_FROM - angle) / (SHOW_FROM - SHOW_FULL);
  const fadeOut = (angle - HIDE_AT) / (HIDE_FROM - HIDE_AT);
  return Math.min(1, Math.max(0, fadeIn)) * Math.min(1, Math.max(0, fadeOut));
}

export default function ArcSweep() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("is-static");
      return;
    }

    let alive = true;
    let kill = () => {};

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }, { default: Lenis }] =
        await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("lenis"),
        ]);
      if (!alive || !rootRef.current) return;

      gsap.registerPlugin(ScrollTrigger);

      const spotlight = root.querySelector<HTMLElement>(".spotlight");
      const copy = root.querySelector<HTMLElement>(".copy");
      const cards = Array.from(
        root.querySelectorAll<HTMLElement>(".card"),
      ).sort((a, b) => Number(a.dataset.index) - Number(b.dataset.index));
      const medias = cards.map((card) =>
        card.querySelector<HTMLElement>(".card-media"),
      );
      if (!spotlight || !copy || cards.length === 0) return;

      const metrics = computeMetrics();
      const firstIndex = cards.length - 1;
      let revealed = false;
      let copyHidden = true;

      const updateCopy = (shouldHide: boolean) => {
        if (shouldHide === copyHidden) return;
        copyHidden = shouldHide;
        gsap.to(copy, {
          opacity: shouldHide ? 0 : 1,
          duration: 0.3,
          overwrite: true,
        });
      };

      const place = (progress: number) => {
        const base = gsap.utils.interpolate(START_ANGLE, END_ANGLE, progress);
        const firstAngle = base - firstIndex * ANGLE_STEP;
        const firstOpen = gsap.utils.clamp(
          0,
          1,
          (firstAngle - EXPAND_ANGLE) / EXPAND_SPAN,
        );
        updateCopy(firstOpen >= 0.35 || base <= 1);

        cards.forEach((card, index) => {
          const angle = base - index * ANGLE_STEP;
          const media = medias[index];
          const opacity = revealed ? 1 : 0;

          if (index === 0 && angle < EXPAND_ANGLE) {
            const expand = gsap.utils.clamp(
              0,
              1,
              (EXPAND_ANGLE - angle) / EXPAND_SPAN,
            );
            gsap.set(card, {
              x: gsap.utils.interpolate(metrics.originX, 0, expand),
              y: gsap.utils.interpolate(metrics.originY, 0, expand),
              rotation: gsap.utils.interpolate(
                metrics.originRotation,
                0,
                expand,
              ),
              width: gsap.utils.interpolate(
                metrics.cardSize,
                metrics.expandedWidth,
                expand,
              ),
              height: gsap.utils.interpolate(
                metrics.cardSize,
                metrics.expandedHeight,
                expand,
              ),
              borderRadius: gsap.utils.interpolate(10, 20, expand),
              zIndex: cards.length,
              opacity,
            });
            if (media)
              gsap.set(media, {
                scale: gsap.utils.interpolate(1.15, 1, expand),
              });
            return;
          }

          if (index === firstIndex && angle > EXPAND_ANGLE) {
            const open = gsap.utils.clamp(
              0,
              1,
              (angle - EXPAND_ANGLE) / EXPAND_SPAN,
            );
            gsap.set(card, {
              x: gsap.utils.interpolate(metrics.originX, 0, open),
              y: gsap.utils.interpolate(metrics.originY, 0, open),
              rotation: gsap.utils.interpolate(metrics.originRotation, 0, open),
              width: gsap.utils.interpolate(
                metrics.cardSize,
                metrics.expandedWidth,
                open,
              ),
              height: gsap.utils.interpolate(
                metrics.cardSize,
                metrics.expandedHeight,
                open,
              ),
              borderRadius: gsap.utils.interpolate(10, 20, open),
              zIndex: cards.length + 1,
              opacity,
            });
            if (media)
              gsap.set(media, { scale: gsap.utils.interpolate(1.15, 1, open) });
            return;
          }

          gsap.set(card, {
            x: Math.sin(angle) * metrics.radius,
            y: (1 - Math.cos(angle)) * metrics.radius,
            rotation: (angle * 180) / Math.PI,
            width: metrics.cardSize,
            height: metrics.cardSize,
            borderRadius: 10,
            zIndex: cards.length - index,
            opacity: revealed ? arcOpacity(angle) : 0,
          });
          if (media) gsap.set(media, { scale: 1.15 });
        });
      };

      gsap.set(cards, {
        xPercent: -50,
        yPercent: -50,
        transformOrigin: "center center",
      });
      gsap.set(medias, { scale: 1.15, transformOrigin: "center center" });
      gsap.set(copy, { opacity: 0 });
      place(0);

      const lenis = new Lenis();
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      let progress = 0;
      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: spotlight,
          start: "top top",
          end: () =>
            `+=${window.innerHeight * ((START_ANGLE - END_ANGLE) / RADIANS_PER_SCREEN)}`,
          pin: true,
          onUpdate: (self) => {
            progress = self.progress;
            place(progress);
          },
        });
      }, root);

      revealed = true;
      place(progress);
      root.classList.add("is-ready");

      const onResize = () => {
        Object.assign(metrics, computeMetrics());
        ScrollTrigger.refresh();
        place(progress);
      };
      window.addEventListener("resize", onResize);

      kill = () => {
        window.removeEventListener("resize", onResize);
        ctx.revert();
        gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(500, 33);
        lenis.destroy();
        root.classList.remove("is-ready");
      };
    })();

    return () => {
      alive = false;
      kill();
    };
  }, []);

  return (
    <main className="arc" ref={rootRef}>
      <section className="panel intro">
        <h1>Eleven cities on a circle.</h1>
      </section>

      <section className="panel spotlight" aria-labelledby="arc-heading">
        <div className="orbit">
          {PLATES.map((plate, index) => (
            <article
              key={plate.key}
              className="card"
              data-index={index}
              data-role={
                index === 0
                  ? "last"
                  : index === FIRST_INDEX
                    ? "first"
                    : undefined
              }
              style={{ zIndex: PLATES.length - index }}
              aria-label={plate.label}
            >
              <div className="card-media">
                <PlateFace
                  src={plate.src}
                  position={plate.position}
                  title={"title" in plate ? plate.title : undefined}
                  text={"text" in plate ? plate.text : undefined}
                />
              </div>
            </article>
          ))}
        </div>
        <div className="copy">
          <h2 id="arc-heading">
            Cities along
            <br />
            the arc
          </h2>
          <p>
            Eleven skylines, each holding its own tilt. The first closes onto
            the circle. They travel the arc until the last one stops,
            straightens, and opens across the frame.
          </p>
        </div>
      </section>

      <section className="panel outro">
        <h1>Opened to the skyline.</h1>
        <p className="credits">
          4K city stills via Wikimedia Commons — Tehran, Tokyo, Paris, London,
          Dubai, Rome, Istanbul, Singapore, Hong Kong, Barcelona, New York.
        </p>
      </section>
    </main>
  );
}
