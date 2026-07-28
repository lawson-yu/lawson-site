"use client";

import { motion, useReducedMotion } from "motion/react";
import type { TargetAndTransition } from "motion/react";
import Image from "next/image";
import Link from "next/link";

function RiverRipples() {
  const prefersReducedMotion = useReducedMotion();
  const activeAnimation: TargetAndTransition | undefined = prefersReducedMotion
    ? undefined
    : {
        filter: "saturate(1.14) brightness(1.08)",
        y: -3,
        transition: { duration: 0.45, ease: "easeOut" },
      };

  return (
    <motion.div
      aria-label="浅色河流"
      className="absolute bottom-[2%] left-[56%] z-20 aspect-[1304/293] w-[min(92vw,420px)] -translate-x-1/2 cursor-default sm:right-[-4%] sm:bottom-[2%] sm:left-auto sm:w-[min(72vw,600px)] sm:translate-x-0 lg:right-[-2%] lg:bottom-[-8%] lg:w-[min(56vw,744px)]"
      data-river-surface
      role="img"
      whileHover={activeAnimation}
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-[-4%] top-[-28%] bottom-[-10%] z-30 cursor-default"
        whileHover={activeAnimation}
      />
      <Image
        alt=""
        aria-hidden="true"
        className="pointer-events-none z-0 object-contain"
        fill
        sizes="(min-width: 1024px) 56vw, (min-width: 640px) 72vw, 92vw"
        src="/images/hero-river-transparent-v3.png"
        unoptimized
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
      >
        <motion.span
          animate={
            prefersReducedMotion
              ? { opacity: 0 }
              : {
                  opacity: [0.18, 0.34, 0.22],
                  scaleX: [1, 1.025, 0.995],
                  x: ["-1.4%", "1.8%", "-0.6%"],
                  y: ["0.6%", "-1%", "0.2%"],
                }
          }
          className="absolute inset-0"
          transition={{
            duration: 3.8,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
          }}
        >
          <Image
            alt=""
            aria-hidden="true"
            className="pointer-events-none object-contain brightness-110 saturate-125"
            fill
            sizes="(min-width: 1024px) 56vw, (min-width: 640px) 72vw, 92vw"
            src="/images/hero-river-transparent-v3.png"
            unoptimized
          />
        </motion.span>
        <motion.span
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  opacity: [0.12, 0.26, 0.16],
                  scaleY: [1, 0.985, 1.02],
                  x: ["2%", "-1.2%", "0.8%"],
                  y: ["-1.4%", "0.8%", "-0.2%"],
                }
          }
          className="absolute inset-0 blur-[1.2px]"
          transition={{
            duration: 4.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
          }}
        >
          <Image
            alt=""
            aria-hidden="true"
            className="pointer-events-none object-contain brightness-125 saturate-150"
            fill
            sizes="(min-width: 1024px) 56vw, (min-width: 640px) 72vw, 92vw"
            src="/images/hero-river-transparent-v3.png"
            unoptimized
          />
        </motion.span>
        <motion.span
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  opacity: [0.1, 0.22, 0.14],
                  x: ["-22%", "28%", "-12%"],
                }
          }
          className="absolute top-[24%] left-[4%] h-16 w-[88%] rounded-[50%] bg-[linear-gradient(90deg,transparent,var(--color-river-shimmer),var(--color-river-highlight),transparent)] blur-[12px]"
          transition={{
            duration: 4.2,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
        <motion.span
          animate={
            prefersReducedMotion
              ? undefined
              : { opacity: [0.18, 0.32, 0.2], scaleX: [0.96, 1.06, 1] }
          }
          className="bg-river-deep/22 absolute inset-x-[12%] top-[34%] h-16 rounded-[50%] blur-[14px]"
          transition={{
            duration: 4,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
      </div>
    </motion.div>
  );
}
type RiverHeroProps = {
  locale: string;
  topics: readonly string[];
};

export function RiverHero({ locale, topics }: RiverHeroProps) {
  const topicLoop = [...topics, ...topics, ...topics];

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
        src="/images/hero-river-light-v1.png"
        unoptimized
      />
      <div className="from-canvas via-canvas/72 absolute inset-0 bg-linear-to-r to-transparent" />
      <div className="from-canvas via-canvas/35 absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t to-transparent" />

      <div className="max-w-site relative mx-auto flex h-full items-start px-4 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-36">
        <div className="relative z-30 max-w-sm lg:max-w-[29rem]">
          <h1
            aria-label="LAWSON — AI 与工程实践"
            className="font-display text-ink text-4xl leading-[0.9] font-black tracking-[-0.06em] sm:text-6xl lg:text-7xl"
            id="river-hero-title"
          >
            <span className="block">LAWSON</span>
            <span className="text-muted mt-4 block text-sm font-bold tracking-[0.18em] sm:text-base">
              AI 与工程实践
            </span>
          </h1>

          <div className="hidden lg:block">
            <p className="text-muted mt-7 text-base leading-7">
              把 AI 工具、工程方法与可验证工作流，沉淀成能复用的实践记录。
              <br />
              从一次次真实构建里，整理出可阅读、可运行、可持续维护的系统。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                className="bg-action text-canvas focus-visible:ring-brand hover:bg-action/85 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] px-4 py-3 font-mono text-xs font-extrabold tracking-[0.1em] transition-colors outline-none focus-visible:ring-2"
                href={`/${locale}/blog`}
              >
                阅读最新文章 →
              </Link>
              <Link
                className="border-line text-ink focus-visible:ring-brand bg-canvas/55 hover:bg-surface-raised inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border px-4 py-3 font-mono text-xs font-extrabold tracking-[0.1em] transition-colors outline-none focus-visible:ring-2"
                href={`/${locale}/projects`}
              >
                查看个人项目 →
              </Link>
            </div>
            <div
              aria-label="本站主题"
              className="home-topic-ticker border-line bg-canvas/55 text-brand mt-8 overflow-hidden border px-4 py-2.5"
            >
              <p className="sr-only">{topics.join(" · ")}</p>
              <div className="home-topic-ticker__track" aria-hidden="true">
                {[0, 1].map((group) => (
                  <div
                    className="home-topic-ticker__group font-mono"
                    key={group}
                  >
                    {topicLoop.map((topic, index) => (
                      <span key={`${topic}-${index}`}>{topic}</span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

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
