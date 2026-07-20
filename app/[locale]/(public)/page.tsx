import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { listPublishedBlogs, supportedLocale } from "@/lib/content/catalog";
import { listPublishedCuratedProjects } from "@/lib/content/curated";
import { listPublishedProjects } from "@/lib/content/projects";

type HomePageProps = { params: Promise<{ locale: string }> };

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
      className="focus-visible:ring-brand text-xl font-bold outline-none hover:underline focus-visible:ring-2 sm:text-2xl"
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
      <section className="max-w-site mx-auto grid gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center lg:gap-16 lg:px-8 lg:py-32">
        <div data-home-hero className="home-hero">
          <p className="tracking-eyebrow text-accent text-sm font-bold">
            AI × ENGINEERING NOTES
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl leading-none font-extrabold tracking-tight sm:text-7xl">
            LAWSON — AI 与工程实践
          </h1>
          <p className="text-muted mt-6 max-w-2xl text-lg leading-8">
            从真实项目出发，拆解 AI 工具、工程问题与可持续维护的技术系统。
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              className="bg-action focus-visible:ring-brand text-canvas focus-visible:ring-offset-canvas min-h-11 px-5 py-3 text-sm font-extrabold outline-none focus-visible:ring-2 focus-visible:ring-offset-4"
              href={`/${locale}/blog`}
            >
              阅读最新文章
            </Link>
            <Link
              className="border-line focus-visible:ring-brand hover:bg-surface-raised focus-visible:ring-offset-canvas min-h-11 border px-5 py-3 text-sm font-extrabold outline-none focus-visible:ring-2 focus-visible:ring-offset-4"
              href={`/${locale}/about`}
            >
              认识 LAWSON
            </Link>
          </div>
        </div>
        <div
          aria-label="抽象的 AI 与工程插画"
          className="border-line bg-surface relative min-h-64 overflow-hidden border p-8"
          role="img"
        >
          <div className="border-brand absolute top-8 left-8 size-16 border-4" />
          <div className="border-accent absolute top-20 right-10 size-24 rounded-full border-4" />
          <div className="bg-action absolute right-16 bottom-10 h-4 w-40" />
          <div className="border-brand absolute top-1/2 left-1/4 h-px w-1/2 border-t-2 border-dashed" />
          <p className="text-muted absolute right-8 bottom-8 font-mono text-xs">
            BUILD · TEST · LEARN
          </p>
        </div>
      </section>

      <section className="bg-surface border-line border-y">
        <div className="max-w-site mx-auto grid gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-8 lg:py-24">
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-3xl font-extrabold sm:text-4xl">最新博客</h2>
              <Link
                className="text-brand focus-visible:ring-brand text-sm font-bold outline-none focus-visible:ring-2"
                href={`/${locale}/blog`}
              >
                全部文章 →
              </Link>
            </div>
            <div className="mt-8 grid gap-4">
              {blogs.slice(0, 3).map((blog) => (
                <article className="border-line border-t pt-5" key={blog.slug}>
                  <p className="text-accent tracking-eyebrow text-xs font-bold">
                    {blog.tags.map((tag) => tag.label).join(" · ") ||
                      "工程实践"}
                  </p>
                  <h3 className="mt-3">
                    <ContentLink href={`/${locale}/blog/${blog.slug}`}>
                      {blog.title}
                    </ContentLink>
                  </h3>
                  <p className="text-muted mt-3 leading-7">{blog.summary}</p>
                </article>
              ))}
              {!blogs.length ? (
                <p className="text-muted">文章正在整理中。</p>
              ) : null}
            </div>
          </div>
          <aside className="border-line border-t pt-5 lg:border-t-0 lg:border-l lg:pl-8">
            <p className="tracking-eyebrow text-accent text-sm font-bold">
              关注主题
            </p>
            <p className="text-muted mt-4 leading-7">
              围绕 AI 系统、工程实践和可验证的工作流持续更新。
            </p>
            <Link
              className="text-brand focus-visible:ring-brand mt-6 inline-block font-bold outline-none focus-visible:ring-2"
              href={`/${locale}/search`}
            >
              搜索已发布内容 →
            </Link>
          </aside>
        </div>
      </section>

      <section className="max-w-site mx-auto grid gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div>
          <p className="tracking-eyebrow text-accent text-sm font-bold">
            FEATURED BUILD
          </p>
          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">代表项目</h2>
          {featuredProject ? (
            <article className="border-line bg-surface mt-8 border p-6">
              <h3>
                <ContentLink
                  href={`/${locale}/projects/${featuredProject.slug}`}
                >
                  {featuredProject.title}
                </ContentLink>
              </h3>
              <p className="text-muted mt-3 leading-7">
                {featuredProject.summary}
              </p>
              <p className="text-muted mt-4 text-sm">
                {featuredProject.metadata.techStack.join(" · ")}
              </p>
            </article>
          ) : (
            <p className="text-muted mt-8">项目正在整理中。</p>
          )}
          <Link
            className="text-brand focus-visible:ring-brand mt-6 inline-block font-bold outline-none focus-visible:ring-2"
            href={`/${locale}/projects`}
          >
            浏览个人项目 →
          </Link>
        </div>
        <div>
          <p className="tracking-eyebrow text-accent text-sm font-bold">
            CURATED REPOSITORIES
          </p>
          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">精选项目</h2>
          {curated[0] ? (
            <article className="border-line bg-surface mt-8 border p-6">
              <p className="text-muted text-sm">{curated[0].metadata.week}</p>
              <h3 className="mt-3">
                <ContentLink href={`/${locale}/curated/${curated[0].slug}`}>
                  {curated[0].title}
                </ContentLink>
              </h3>
              <p className="text-muted mt-3 leading-7">
                {curated[0].metadata.problem}
              </p>
            </article>
          ) : (
            <p className="text-muted mt-8">精选项目正在整理中。</p>
          )}
          <Link
            className="text-brand focus-visible:ring-brand mt-6 inline-block font-bold outline-none focus-visible:ring-2"
            href={`/${locale}/curated`}
          >
            浏览精选项目 →
          </Link>
        </div>
      </section>

      <section className="bg-surface border-line border-y">
        <div className="max-w-site mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <p className="tracking-eyebrow text-accent text-sm font-bold">
            CONTACT
          </p>
          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
            一起讨论下一段工程实践
          </h2>
          <p className="text-muted mt-4 max-w-2xl leading-7">
            通过 GitHub、LinkedIn 或邮件联系；也可以订阅 RSS 跟踪后续内容。
          </p>
          <Link
            className="bg-action focus-visible:ring-brand text-canvas focus-visible:ring-offset-surface mt-8 inline-block min-h-11 px-5 py-3 text-sm font-extrabold outline-none focus-visible:ring-2 focus-visible:ring-offset-4"
            href={`/${locale}/about`}
          >
            查看联系入口
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
