import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { TagConfirmButton } from "./tag-confirm-button";
import { getAuthorIdentity } from "@/lib/author/identity";
import { listWorkspaceCuratedProjects } from "@/lib/content/curated";
import { listWorkspaceProjects } from "@/lib/content/projects";
import { listWorkspaceBlogs, listWorkspaceTags } from "@/lib/content/workspace";

export default async function AuthorWorkspacePage() {
  await connection();
  const author = await getAuthorIdentity();
  if (!author) {
    redirect("/auth/login?error=unauthorized");
  }

  const [blogs, projects, curatedProjects, tags] = await Promise.all([
    listWorkspaceBlogs(author.userId),
    listWorkspaceProjects(author.userId),
    listWorkspaceCuratedProjects(author.userId),
    listWorkspaceTags(),
  ]);
  const pendingTags = tags.filter((tag) => tag.state === "pending");

  return (
    <main className="bg-canvas text-ink min-h-screen">
      <section className="max-w-site mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="tracking-eyebrow text-accent text-sm font-bold">
              AUTHOR WORKSPACE
            </p>
            <h1 className="mt-3 text-4xl font-extrabold">内容工作区</h1>
          </div>
          <Link
            className="bg-action text-canvas focus-visible:ring-brand min-h-11 rounded-lg px-4 py-3 font-bold outline-none focus-visible:ring-2"
            href="/author/blog/new"
          >
            新建博客
          </Link>
          <Link
            className="bg-action text-canvas focus-visible:ring-brand min-h-11 rounded-lg px-4 py-3 font-bold outline-none focus-visible:ring-2"
            href="/author/project/new"
          >
            新建项目
          </Link>
          <Link
            className="bg-action text-canvas focus-visible:ring-brand min-h-11 rounded-lg px-4 py-3 font-bold outline-none focus-visible:ring-2"
            href="/author/curated/new"
          >
            新建精选项目
          </Link>
        </div>

        <section className="mt-12 grid gap-4">
          {blogs.map((blog) => (
            <article
              className="border-line bg-surface border p-5"
              key={blog.id}
            >
              <p className="text-muted text-sm">
                {blog.state === "draft" ? "草稿" : "已发布"}
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                <Link
                  className="focus-visible:ring-brand inline-flex min-h-11 items-center outline-none focus-visible:ring-2"
                  href={`/author/blog/${blog.id}`}
                >
                  {blog.title}
                </Link>
              </h2>
              <p className="text-muted mt-2">{blog.summary}</p>
            </article>
          ))}
        </section>

        <section className="mt-12 grid gap-4">
          {curatedProjects.map((project) => (
            <article
              className="border-line bg-surface border p-5"
              key={project.id}
            >
              <p className="text-muted text-sm">
                {project.state === "draft" ? "精选项目草稿" : "已发布精选项目"}
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                <Link
                  className="focus-visible:ring-brand inline-flex min-h-11 items-center outline-none focus-visible:ring-2"
                  href={`/author/curated/${project.id}`}
                >
                  {project.title}
                </Link>
              </h2>
              <p className="text-muted mt-2">{project.summary}</p>
            </article>
          ))}
        </section>

        <section className="mt-12 grid gap-4">
          {projects.map((project) => (
            <article
              className="border-line bg-surface border p-5"
              key={project.id}
            >
              <p className="text-muted text-sm">
                {project.state === "draft" ? "项目草稿" : "已发布项目"}
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                <Link
                  className="focus-visible:ring-brand inline-flex min-h-11 items-center outline-none focus-visible:ring-2"
                  href={`/author/project/${project.id}`}
                >
                  {project.title}
                </Link>
              </h2>
              <p className="text-muted mt-2">{project.summary}</p>
            </article>
          ))}
        </section>

        <section className="border-line mt-16 border-t pt-8">
          <h2 className="text-2xl font-bold">待确认标签</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {pendingTags.map((tag) => (
              <div
                className="border-line flex items-center gap-3 rounded-lg border p-3"
                key={tag.id}
              >
                <span>{tag.label}</span>
                <TagConfirmButton id={tag.id} />
              </div>
            ))}
            {!pendingTags.length ? (
              <p className="text-muted">没有待确认标签。</p>
            ) : null}
          </div>
        </section>
        <form action="/auth/logout" className="mt-12" method="post">
          <button className="text-muted focus-visible:ring-brand min-h-11 px-2 text-sm underline outline-none focus-visible:ring-2">
            退出登录
          </button>
        </form>
      </section>
    </main>
  );
}
