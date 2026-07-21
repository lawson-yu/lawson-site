"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const RIPPLE_DURATION_MS = 800;
const RIPPLE_INTERVAL_MS = 110;
const MAX_RIPPLES = 2;

type Ripple = { startedAt: number; x: number; y: number };

function RiverRipples() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const drawRef = useRef<(timestamp: number) => void>(null);
  const lastRippleAtRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const [rippleState, setRippleState] = useState<"active" | "idle">("idle");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    let autoRippleTimer: number | null = null;
    const stopAutoRipples = () => {
      if (autoRippleTimer !== null) {
        window.clearInterval(autoRippleTimer);
        autoRippleTimer = null;
      }
    };
    const startAutoRipples = () => {
      stopAutoRipples();
      if (reducedMotion.matches || !coarsePointer.matches) return;
      autoRippleTimer = window.setInterval(() => {
        const bounds = canvas.getBoundingClientRect();
        const timestamp = performance.now();
        ripplesRef.current = [
          ...ripplesRef.current.slice(-(MAX_RIPPLES - 1)),
          {
            startedAt: timestamp,
            x: bounds.width * 0.52,
            y: bounds.height * 0.6,
          },
        ];
        setRippleState("active");
        if (animationFrameRef.current === null && drawRef.current) {
          animationFrameRef.current = window.requestAnimationFrame(
            drawRef.current,
          );
        }
      }, 5_000);
    };
    const syncMotionPreference = () => {
      reducedMotionRef.current = reducedMotion.matches;
      if (reducedMotion.matches) {
        ripplesRef.current = [];
        setRippleState("idle");
        if (animationFrameRef.current !== null) {
          window.cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
      startAutoRipples();
    };
    const resize = () => {
      const { height, width } = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };
    const observer = new ResizeObserver(resize);

    resize();
    syncMotionPreference();
    observer.observe(canvas);
    reducedMotion.addEventListener("change", syncMotionPreference);
    coarsePointer.addEventListener("change", startAutoRipples);

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", syncMotionPreference);
      coarsePointer.removeEventListener("change", startAutoRipples);
      stopAutoRipples();
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const draw = (timestamp: number) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const { height, width } = canvas.getBoundingClientRect();
    context.clearRect(0, 0, width, height);
    ripplesRef.current = ripplesRef.current.filter(
      (ripple) => timestamp - ripple.startedAt < RIPPLE_DURATION_MS,
    );

    for (const ripple of ripplesRef.current) {
      const progress = (timestamp - ripple.startedAt) / RIPPLE_DURATION_MS;
      const radius = 20 + progress * 90;
      context.save();
      context.globalAlpha = (1 - progress) * 0.52;
      context.strokeStyle = "#e4f5ff";
      context.lineWidth = 1.4 - progress * 0.45;
      context.beginPath();
      context.ellipse(
        ripple.x,
        ripple.y,
        radius,
        radius * 0.36,
        -0.12,
        0,
        Math.PI * 2,
      );
      context.stroke();
      context.restore();
    }

    if (ripplesRef.current.length) {
      animationFrameRef.current = window.requestAnimationFrame(draw);
      return;
    }
    animationFrameRef.current = null;
    setRippleState("idle");
  };
  useEffect(() => {
    drawRef.current = draw;
  });

  const addRipple = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (reducedMotionRef.current || event.pointerType === "touch") return;

    const timestamp = performance.now();
    if (timestamp - lastRippleAtRef.current < RIPPLE_INTERVAL_MS) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    lastRippleAtRef.current = timestamp;
    ripplesRef.current = [
      ...ripplesRef.current.slice(-(MAX_RIPPLES - 1)),
      {
        startedAt: timestamp,
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      },
    ];
    setRippleState("active");
    if (animationFrameRef.current === null) {
      animationFrameRef.current = window.requestAnimationFrame(draw);
    }
  };

  return (
    <div
      aria-label="浅色河流"
      className="absolute bottom-[-4%] left-1/2 z-20 aspect-[1304/293] w-[min(92vw,420px)] -translate-x-1/2 transition-transform duration-200 ease-out motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:right-[-8%] sm:left-auto sm:w-[min(72vw,600px)] sm:translate-x-0 lg:right-[-6%] lg:bottom-[-16%] lg:w-[min(56vw,744px)] lg:hover:-translate-y-1"
      data-ripple-state={rippleState}
      data-river-surface
      role="img"
    >
      <Image
        alt=""
        aria-hidden="true"
        className="pointer-events-none object-contain"
        fill
        sizes="(min-width: 1024px) 56vw, (min-width: 640px) 72vw, 92vw"
        src="/images/hero-river-transparent-v3.png"
        unoptimized
      />
      <canvas
        aria-hidden="true"
        className="relative z-10 h-full w-full cursor-crosshair"
        onPointerMove={addRipple}
        ref={canvasRef}
      />
    </div>
  );
}

export function RiverHero() {
  return (
    <section
      aria-labelledby="river-hero-title"
      className="bg-canvas relative isolate h-[400px] overflow-hidden lg:h-[530px]"
      data-home-hero
    >
      <Image
        alt="夜色山谷中的河流"
        className="object-cover object-center"
        fill
        priority
        sizes="100vw"
        src="/images/river-hero-background-v2.png"
        unoptimized
      />
      <div className="from-canvas via-canvas/72 absolute inset-0 bg-linear-to-r to-[#08121d]/20" />
      <div className="from-canvas via-canvas/35 absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t to-transparent" />

      <div className="max-w-site relative mx-auto flex h-full items-start px-4 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-36">
        <h1
          aria-label="LAWSON — AI 与工程实践"
          className="text-ink max-w-sm text-4xl leading-[0.9] font-black tracking-[-0.06em] sm:text-6xl lg:text-7xl"
          id="river-hero-title"
        >
          <span className="block">LAWSON</span>
          <span className="text-muted mt-4 block text-sm font-bold tracking-[0.18em] sm:text-base">
            AI 与工程实践
          </span>
        </h1>

        <RiverRipples />
        <Image
          alt="LAWSON 的原创圆润潮玩 3D 人物形象"
          className="pointer-events-none absolute bottom-0 left-1/2 z-10 h-auto w-[min(68vw,250px)] -translate-x-1/2 object-contain sm:right-[6%] sm:left-auto sm:w-[min(42vw,280px)] sm:translate-x-0 lg:right-[9%] lg:w-[min(28vw,310px)]"
          height={1402}
          priority
          sizes="(min-width: 1024px) 28vw, (min-width: 640px) 42vw, 68vw"
          src="/images/hero-character-transparent-v2.png"
          unoptimized
          width={1122}
        />
      </div>
    </section>
  );
}
