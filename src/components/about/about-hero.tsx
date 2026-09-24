"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const FRAME_COUNT = 130;
// Scroll distance required per frame. Deliberately generous so a fast
// flick can't blow through the whole turn in one go — a real scroll
// gesture, on any input device, just can't cover this much distance
// instantly. Paired with `scrub: 0.6` below for a touch of inertia so
// playback eases rather than snapping frame-to-frame.
const SCROLL_PX_PER_FRAME = 45;

// Content choreography, keyed to scroll progress through the pin (0–1):
// the quote holds on the opening frame, fades out as he starts turning,
// then the name/title only reveals in the final stretch, landing right as
// the last frame hits and the section unpins.
const QUOTE_OUT_START = 0.1;
const QUOTE_OUT_END = 0.22;
const CUE_OUT_START = 0.04;
const CUE_OUT_END = 0.1;
const NAME_IN_START = 0.72;
const NAME_IN_END = 1;

// Three words take over the quote's spot for the turn itself (right where
// the quote vacates it, handing off to the name reveal at the far end) —
// each fades in, holds, and fades out in its own slice of the range, never
// more than one on screen at once.
const WORDS = ["Innovative", "Practical", "Responsible"] as const;
const WORDS_START = QUOTE_OUT_END;
const WORDS_END = NAME_IN_START;
const WORD_SLOT = (WORDS_END - WORDS_START) / WORDS.length;
const WORD_WINDOWS = WORDS.map((_, i) => {
  const start = WORDS_START + i * WORD_SLOT;
  const end = start + WORD_SLOT;
  const edge = WORD_SLOT * 0.25;
  return { fadeInEnd: start + edge, fadeOutStart: end - edge, start, end };
});

function frameUrl(index: number) {
  return `/about-hero-frames/frame-${String(index + 1).padStart(3, "0")}.jpg`;
}

function fade(
  progress: number,
  start: number,
  end: number,
  direction: "in" | "out",
) {
  const t = Math.min(1, Math.max(0, (progress - start) / (end - start)));
  return direction === "in" ? t : 1 - t;
}

/** Pinned GSAP ScrollTrigger frame sequence: scrolling scrubs through the
 * 130-frame turn-around shot exactly (scrub: true), so scrolling back
 * reverses it frame-for-frame. The pin's scroll distance maps 1:1 to the
 * frame count, so the last frame lands exactly as the pin releases and the
 * page continues into the next section. Canvas size is fixed to the source
 * frames' native resolution; `object-cover` handles on-page scaling/cropping
 * the same way the previous next/image fill did.
 *
 * Uses `useGSAP` (rather than a plain `useEffect` + `gsap.context`) because
 * `pin: true` wraps the section in a "pin-spacer" div outside React's
 * knowledge — under React 18 Strict Mode's dev-only double-invoke of
 * effects, a hand-rolled cleanup can revert before GSAP has even finished
 * the async pin setup, leaving a stray spacer that later makes React's own
 * unmount throw "Failed to execute 'removeChild'". `useGSAP` is GSAP's own
 * hook built specifically to sequence this correctly. */
export function AboutHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const canvas = canvasRef.current;
      if (!section || !canvas) return;

      const ctx2d = canvas.getContext("2d");
      const images: HTMLImageElement[] = [];
      let currentFrame = -1;

      function drawFrame(index: number) {
        const img = images[index];
        if (!ctx2d || !img || !img.complete || img.naturalWidth === 0) return;
        if (index === currentFrame) return;
        if (
          canvas!.width !== img.naturalWidth ||
          canvas!.height !== img.naturalHeight
        ) {
          canvas!.width = img.naturalWidth;
          canvas!.height = img.naturalHeight;
        }
        ctx2d.drawImage(img, 0, 0);
        currentFrame = index;
      }

      function applyContent(progress: number) {
        const quoteOpacity = fade(
          progress,
          QUOTE_OUT_START,
          QUOTE_OUT_END,
          "out",
        );
        const cueOpacity = fade(progress, CUE_OUT_START, CUE_OUT_END, "out");
        const nameOpacity = fade(progress, NAME_IN_START, NAME_IN_END, "in");

        if (quoteRef.current) {
          quoteRef.current.style.opacity = String(quoteOpacity);
          quoteRef.current.style.transform = `translateY(${(1 - quoteOpacity) * -10}px)`;
        }
        if (cueRef.current) {
          cueRef.current.style.opacity = String(cueOpacity);
        }
        if (nameRef.current) {
          nameRef.current.style.opacity = String(nameOpacity);
          nameRef.current.style.transform = `translateY(${(1 - nameOpacity) * 12}px)`;
        }

        WORD_WINDOWS.forEach((w, i) => {
          const el = wordRefs.current[i];
          if (!el) return;
          const opacity = Math.min(
            fade(progress, w.start, w.fadeInEnd, "in"),
            fade(progress, w.fadeOutStart, w.end, "out"),
          );
          el.style.opacity = String(opacity);
          el.style.transform = `translateY(${(1 - opacity) * 10}px)`;
        });
      }

      for (let i = 0; i < FRAME_COUNT; i++) {
        const img = new Image();
        img.src = frameUrl(i);
        if (i === 0) {
          img.onload = () => drawFrame(0);
        }
        images.push(img);
      }
      applyContent(0);

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${FRAME_COUNT * SCROLL_PX_PER_FRAME}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 0.6,
        onUpdate: (self) => {
          const index = Math.min(
            FRAME_COUNT - 1,
            Math.floor(self.progress * FRAME_COUNT),
          );
          drawFrame(index);
          applyContent(self.progress);
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-[#0c0c0b]"
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Viet Anh Le"
        className="block h-full w-full object-cover object-[center_20%] [filter:grayscale(100%)_contrast(1.2)_brightness(0.85)]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(217,79,48,0.35),rgba(44,95,93,0.45))] [mix-blend-mode:color]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_35%,rgba(0,0,0,0.65)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.85),rgba(0,0,0,0.1)_55%,rgba(0,0,0,0.35)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-[5vh] bg-black" />
      <div className="absolute inset-x-0 bottom-0 h-[5vh] bg-black" />

      <div
        ref={quoteRef}
        className="absolute inset-x-0 top-1/2 -translate-y-[58%] px-8 text-center"
      >
        <p
          className="mx-auto max-w-[680px] text-[clamp(24px,4vw,36px)] leading-[1.35] text-[#fdfcfa] italic [text-shadow:0_2px_24px_rgba(0,0,0,0.4)]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          &ldquo;Somewhere between a blank editor and a shipped product, I found
          the work I actually love.&rdquo;
        </p>
      </div>

      {WORDS.map((word, i) => (
        <div
          key={word}
          ref={(el) => {
            wordRefs.current[i] = el;
          }}
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-8 text-center opacity-0"
        >
          <span className="text-[clamp(32px,6vw,56px)] font-bold tracking-[0.1em] text-white uppercase [text-shadow:0_2px_24px_rgba(0,0,0,0.4)]">
            {word}
          </span>
        </div>
      ))}

      <div
        ref={cueRef}
        className="absolute inset-x-0 bottom-[11vh] text-center text-xs tracking-[0.08em] text-white/55 uppercase"
      >
        Scroll to explore ↓
      </div>

      <div
        ref={nameRef}
        className="absolute inset-x-0 bottom-[16vh] px-6 opacity-0"
      >
        <div className="mx-auto max-w-[860px]">
          <h1 className="mb-1.5 text-[32px] leading-[38px] font-bold text-white">
            Viet Anh Le
          </h1>
          <p className="text-[15px] tracking-[0.02em] text-white/80">
            Fullstack Developer · Da Nang, Vietnam
          </p>
        </div>
      </div>
    </section>
  );
}
