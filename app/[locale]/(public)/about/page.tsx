import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowUpRight,
  AtSign,
  BriefcaseBusiness,
  Code2,
  Mail,
  Rss,
} from "lucide-react";

import { supportedLocale } from "@/lib/content/catalog";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  alternates: { canonical: "/zh-CN/about" },
  description: "了解 LAWSON 的 AI 与工程实践写作方向和工作方式。",
  title: "关于 | LAWSON",
};

const profiles = [
  {
    href: "https://github.com/lawson",
    icon: Code2,
    label: "GitHub",
    value: "lawson",
  },
  {
    href: "https://x.com/lawson_zz",
    icon: AtSign,
    label: "X",
    value: "@lawson_zz",
  },
  {
    href: "https://www.linkedin.com/in/lawson/",
    icon: BriefcaseBusiness,
    label: "LinkedIn",
    value: "lawson",
  },
  {
    href: "mailto:lawson@example.com",
    icon: Mail,
    label: "邮箱",
    value: "lawson@example.com",
  },
  { href: "/rss.xml", icon: Rss, label: "RSS", value: "订阅更新" },
];

const siteSurfaces = [
  {
    description: "记录工程实践、AI 系统和维护判断。",
    href: "blog",
    label: "博客",
    number: "01",
  },
  {
    description: "展示真实项目的问题、技术栈和成果。",
    href: "projects",
    label: "个人项目",
    number: "02",
  },
  {
    description: "按月内周次和标签整理外部 GitHub 项目。",
    href: "curated",
    label: "精选项目",
    number: "03",
  },
];

function AboutFallback() {
  return <main className="min-h-screen" />;
}

function AboutContent({ locale }: { locale: string }) {
  if (locale !== supportedLocale) notFound();

  return (
    <main className="bg-canvas text-ink min-h-screen" lang={locale}>
      <section className="max-w-site mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="border-line flex flex-wrap items-center justify-between gap-3 border-y py-4 font-mono text-xs font-bold tracking-[0.14em]">
          <span>ABOUT / LAWSON</span>
          <span className="text-muted">PERSONAL DOSSIER</span>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.62fr)] lg:gap-16">
          <div className="min-w-0">
            <p className="text-accent font-mono text-xs font-bold tracking-[0.18em]">
              PROFILE
            </p>
            <h1 className="font-display mt-5 max-w-3xl text-5xl leading-[0.94] font-extrabold tracking-[-0.06em] sm:text-7xl">
              LAWSON
              <span className="text-muted mt-3 block text-3xl tracking-[-0.045em] sm:text-5xl">
                AI 产品与工程实践者
              </span>
            </h1>
            <p className="mt-9 max-w-2xl text-xl leading-8 sm:text-2xl sm:leading-9">
              我关心工具怎样进入真实工作，也关心一个判断如何经得起时间、使用和复盘。
            </p>
            <p className="text-muted mt-6 max-w-xl leading-7">
              在这里，我记录产品与工程实践里的问题、选择、结果，以及那些仍在继续调整的部分。
            </p>
          </div>

          <aside
            className="border-line bg-surface-raised border p-6 sm:p-8"
            aria-label="外部链接"
          >
            <p className="text-accent font-mono text-xs font-bold tracking-[0.16em]">
              AROUND THE WEB
            </p>
            <div className="mt-5 grid gap-0">
              {profiles.map((profile) => {
                const Icon = profile.icon;
                const external = profile.href.startsWith("http");
                return (
                  <a
                    className="border-line hover:text-accent focus-visible:ring-brand group flex min-h-12 items-center justify-between gap-4 border-t py-3 outline-none last:border-b focus-visible:ring-2"
                    href={profile.href}
                    key={profile.label}
                    rel={external ? "noreferrer" : undefined}
                    target={external ? "_blank" : undefined}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Icon className="text-accent size-4 shrink-0" />
                      <span className="font-mono text-xs font-bold tracking-[0.08em]">
                        {profile.label}
                      </span>
                    </span>
                    <span className="text-muted group-hover:text-brand min-w-0 truncate text-right text-sm">
                      {profile.value}
                    </span>
                  </a>
                );
              })}
            </div>
          </aside>
        </div>

        <section className="mt-18" aria-labelledby="site-guide-heading">
          <div className="border-line border-t pt-5">
            <p className="text-accent font-mono text-xs font-bold tracking-[0.16em]">
              THIS SITE
            </p>
            <h2
              className="font-display mt-4 text-3xl font-bold tracking-[-0.04em]"
              id="site-guide-heading"
            >
              探索这个网站
            </h2>
            <p className="text-muted mt-3 max-w-xl leading-6">
              这是一个持续维护的个人内容站：记录、整理，也保留重新判断的空间。
            </p>
          </div>

          <div className="border-line mt-7 border-t">
            {siteSurfaces.map((surface) => (
              <Link
                className="border-line hover:bg-surface focus-visible:ring-brand group grid gap-3 border-b px-1 py-5 transition-colors duration-200 outline-none min-[640px]:grid-cols-[3rem_minmax(10rem,0.8fr)_minmax(0,1.4fr)_1.5rem] min-[640px]:items-center min-[640px]:gap-5 min-[640px]:px-4"
                href={`/${locale}/${surface.href}`}
                key={surface.href}
              >
                <span className="text-accent font-mono text-xs font-bold tracking-[0.14em]">
                  {surface.number}
                </span>
                <span className="font-display block text-2xl font-bold tracking-[-0.035em]">
                  {surface.label}
                </span>
                <span className="text-muted block text-sm leading-6">
                  {surface.description}
                </span>
                <ArrowUpRight className="text-muted group-hover:text-brand size-4 justify-self-end" />
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default function AboutPage(props: AboutPageProps) {
  return (
    <Suspense fallback={<AboutFallback />}>
      {props.params.then(({ locale }) => (
        <AboutContent locale={locale} />
      ))}
    </Suspense>
  );
}
