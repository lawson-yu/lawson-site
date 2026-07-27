import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { RiverHero } from "@/app/[locale]/(public)/_components/river-hero";
import { listPublishedBlogs, supportedLocale } from "@/lib/content/catalog";
import { listPublishedCuratedProjects } from "@/lib/content/curated";
import { listPublishedProjects } from "@/lib/content/projects";

/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5
 * Hallmark · genre: modern-minimal · macrostructure: Ecosystem Index · theme: Cobalt
 * audience: 技术实践的读者 · use: 发现可阅读、可复用的内容 · tone: 技术感
 * enrichment: existing RiverHero + topic ticker · nav: existing floating shell · footer: existing inline shell
 */

type HomePageProps = { params: Promise<{ locale: string }> };

const topicRail = [
  "AI 系统",
  "工程实践",
  "可验证工作流",
  "个人项目",
  "精选仓库",
];
const topicRailLoop = [...topicRail, ...topicRail, ...topicRail];

export const metadata: Metadata = {
  alternates: { canonical: "/zh-CN" },
  description: "LAWSON 分享真实项目、AI 工具与工程问题拆解。",
  title: "LAWSON — AI 与工程实践",
};

function HomeFallback() {
  return <main className="min-h-screen" />;
}

function ContentLink({
  href,
  children,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      className="font-display focus-visible:ring-brand text-2xl leading-tight font-bold tracking-[-0.045em] outline-none hover:underline focus-visible:ring-2 sm:text-3xl"
      href={href}
    >
      {children}
    </Link>
  );
}

async function HomeContent({ params }: HomePageProps) {
  await connection();
  const { locale } = await params;
  if (locale !== supportedLocale) notFound();
  const [blogs, projects, curated] = await Promise.all([
    listPublishedBlogs(locale),
    listPublishedProjects(locale),
    listPublishedCuratedProjects(locale),
  ]);
  const featuredProject =
    projects.find((project) => project.metadata.featured) ?? projects[0];

  return (
    <main lang={locale}>
      <RiverHero />

      <section className="border-line bg-surface border-y">
        <div className="max-w-site mx-auto px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div
            aria-label="本站主题"
            className="home-topic-ticker border-line bg-surface-raised text-brand overflow-hidden border px-4 py-3 sm:px-6"
          >
            <p className="sr-only">{topicRail.join(" · ")}</p>
            <div className="home-topic-ticker__track" aria-hidden="true">
              {[0, 1].map((group) => (
                <div className="home-topic-ticker__group font-mono" key={group}>
                  {topicRailLoop.map((topic, index) => (
                    <span key={`${topic}-${index}`}>{topic}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 grid gap-12 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,0.42fr)] lg:gap-20">
            <div className="min-w-0">
              <div className="border-line flex items-end justify-between gap-4 border-b pb-5">
                <div>
                  <p className="text-accent font-mono text-xs font-bold tracking-[0.18em]">
                    INDEX / 01
                  </p>
                  <h2
                    className="font-display home-display-shadow mt-3 text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl"
                    data-shadow="最新博客"
                  >
                    最新博客
                  </h2>
                </div>
                <Link
                  className="text-brand focus-visible:ring-brand mb-1 shrink-0 font-mono text-xs font-bold tracking-[0.12em] whitespace-nowrap outline-none hover:underline focus-visible:ring-2"
                  href={`/${locale}/blog`}
                >
                  全部文章 →
                </Link>
              </div>
              <div className="mt-8 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                {blogs.slice(0, 3).map((blog, index) => (
                  <article
                    className="border-line bg-surface-raised flex min-h-full flex-col border-t p-6 sm:p-8"
                    key={blog.slug}
                  >
                    <p className="text-muted font-mono text-xs font-bold tracking-[0.14em]">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="text-accent mt-10 font-mono text-xs font-bold tracking-[0.14em]">
                      {blog.tags.map((tag) => tag.label).join(" · ") ||
                        "工程实践"}
                    </p>
                    <h3 className="mt-4 min-w-0 [overflow-wrap:anywhere]">
                      <ContentLink href={`/${locale}/blog/${blog.slug}`}>
                        {blog.title}
                      </ContentLink>
                    </h3>
                    <p className="text-muted mt-4 leading-7">{blog.summary}</p>
                  </article>
                ))}
                {!blogs.length ? (
                  <p className="text-muted border-line border-t py-8">
                    文章正在整理中。
                  </p>
                ) : null}
              </div>
            </div>
            <aside className="border-brand/20 bg-canvas self-start border p-6 sm:p-8 lg:mt-12">
              <p className="text-accent font-mono text-xs font-bold tracking-[0.16em]">
                SIGNAL
              </p>
              <h2 className="font-display mt-5 text-2xl font-extrabold tracking-[-0.035em]">
                关注主题
              </h2>
              <p className="text-muted mt-4 leading-7">
                围绕 AI 系统、工程实践和可验证的工作流持续更新。
              </p>
              <Link
                className="text-brand focus-visible:ring-brand hover:text-accent mt-8 inline-block min-h-11 border-b border-current py-2 font-mono text-xs font-bold tracking-[0.12em] whitespace-nowrap outline-none focus-visible:ring-2"
                href={`/${locale}/search`}
              >
                搜索已发布内容 →
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <section className="max-w-site mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-20">
          <div className="min-w-0">
            <h2
              className="font-display home-display-shadow text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl"
              data-shadow="代表项目"
            >
              代表项目
            </h2>
            <p className="text-muted mt-5 max-w-xl leading-7">
              从可运行的想法到可维护的系统，记录构建过程与取舍。
            </p>
            {featuredProject ? (
              <article className="border-brand/20 mt-9 border-t pt-6">
                <p className="text-muted font-mono text-xs font-bold tracking-[0.14em]">
                  FEATURED BUILD
                </p>
                <h3 className="mt-4 min-w-0 [overflow-wrap:anywhere]">
                  <ContentLink
                    href={`/${locale}/projects/${featuredProject.slug}`}
                  >
                    {featuredProject.title}
                  </ContentLink>
                </h3>
                <p className="text-muted mt-4 max-w-2xl leading-7">
                  {featuredProject.summary}
                </p>
                <p className="text-muted border-accent mt-6 border-l-2 pl-4 font-mono text-xs leading-6 tracking-[0.08em]">
                  {featuredProject.metadata.techStack.join(" · ")}
                </p>
              </article>
            ) : (
              <p className="text-muted mt-8">项目正在整理中。</p>
            )}
            <Link
              className="text-brand focus-visible:ring-brand hover:text-accent mt-8 inline-block min-h-11 border-b border-current py-2 font-mono text-xs font-bold tracking-[0.12em] whitespace-nowrap outline-none focus-visible:ring-2"
              href={`/${locale}/projects`}
            >
              浏览个人项目 →
            </Link>
          </div>
          <div className="border-line border-t pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
            <h2
              className="font-display home-display-shadow text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl"
              data-shadow="精选项目"
            >
              精选项目
            </h2>
            {curated[0] ? (
              <article className="border-brand/20 bg-surface-raised mt-8 border p-6 sm:p-8">
                <p className="text-muted font-mono text-xs font-bold tracking-[0.14em]">
                  {curated[0].metadata.week}
                </p>
                <h3 className="mt-6 min-w-0 [overflow-wrap:anywhere]">
                  <Link
                    className="font-display text-brand focus-visible:ring-accent text-3xl leading-tight font-bold tracking-[-0.035em] outline-none hover:underline focus-visible:ring-2 sm:text-4xl"
                    href={`/${locale}/curated/${curated[0].slug}`}
                  >
                    {curated[0].title}
                  </Link>
                </h3>
                <p className="text-muted mt-5 max-w-lg leading-7">
                  {curated[0].metadata.problem}
                </p>
              </article>
            ) : (
              <p className="text-muted mt-8">精选项目正在整理中。</p>
            )}
            <Link
              className="text-brand focus-visible:ring-brand hover:text-accent mt-8 inline-block min-h-11 border-b border-current py-2 font-mono text-xs font-bold tracking-[0.12em] whitespace-nowrap outline-none focus-visible:ring-2"
              href={`/${locale}/curated`}
            >
              浏览精选项目 →
            </Link>
          </div>
        </div>
      </section>

      <section className="border-line bg-inverse text-inverse-ink border-t">
        <div className="max-w-site mx-auto grid gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-8 lg:py-20">
          <div className="min-w-0">
            <h2 className="font-display max-w-3xl text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">
              一起讨论下一段工程实践
            </h2>
            <p className="text-inverse-ink/80 mt-5 max-w-2xl leading-7">
              通过 GitHub、LinkedIn 或邮件联系；也可以订阅 RSS 跟踪后续内容。
            </p>
          </div>
          <Link
            className="bg-accent focus-visible:ring-accent focus-visible:ring-offset-inverse inline-flex min-h-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] px-5 py-3 font-mono text-xs font-extrabold tracking-[0.1em] whitespace-nowrap text-white transition-transform duration-200 outline-none hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-4 active:translate-y-0"
            href={`/${locale}/about`}
          >
            查看联系入口 →
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function HomePage(props: HomePageProps) {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeContent {...props} />
    </Suspense>
  );
}
