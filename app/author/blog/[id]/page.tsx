import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";

import { BlogForm } from "../../blog-form";
import { BlogLifecycleActions } from "../../blog-lifecycle-actions";
import { getAuthorIdentity } from "@/lib/author/identity";
import { getWorkspaceBlog, listWorkspaceTags } from "@/lib/content/workspace";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const author = await getAuthorIdentity();
  if (!author) {
    redirect("/auth/login?error=unauthorized");
  }
  const { id } = await params;
  const [blog, tags] = await Promise.all([
    getWorkspaceBlog(author.userId, id),
    listWorkspaceTags(),
  ]);
  if (!blog) {
    notFound();
  }

  return (
    <main className="bg-canvas text-ink min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <section className="max-w-site mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-muted text-sm">
              {blog.state === "draft" ? "草稿" : "已发布"}
            </p>
            <h1 className="mt-2 text-4xl font-extrabold">编辑博客</h1>
          </div>
          <Link
            className="focus-visible:ring-brand min-h-11 px-2 py-3 underline outline-none focus-visible:ring-2"
            href={`/author/blog/${blog.id}/preview`}
          >
            预览
          </Link>
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div>
            <BlogForm blog={blog} tags={tags} />
          </div>
          <aside className="border-line bg-surface h-fit rounded-md border p-5">
            <h2 className="text-lg font-bold">内容状态</h2>
            <div className="mt-4">
              <BlogLifecycleActions id={blog.id} state={blog.state} />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
