import { notFound, redirect } from "next/navigation";

import { MarkdownContent } from "@/app/[locale]/(public)/blog/[slug]/markdown-content";
import { getAuthorIdentity } from "@/lib/author/identity";
import { getWorkspaceBlog } from "@/lib/content/workspace";

export default async function BlogPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const author = await getAuthorIdentity();
  if (!author) {
    redirect("/auth/login?error=unauthorized");
  }
  const { id } = await params;
  const blog = await getWorkspaceBlog(author.userId, id);
  if (!blog) {
    notFound();
  }

  return (
    <main className="bg-canvas text-ink min-h-screen">
      <article className="max-w-reading mx-auto px-4 py-16 sm:px-6">
        <p className="tracking-eyebrow text-accent text-sm font-bold">
          草稿预览
        </p>
        <h1 className="mt-4 text-4xl font-extrabold">{blog.title}</h1>
        <p className="text-muted mt-6 text-xl">{blog.summary}</p>
        <div className="border-line mt-12 border-t pt-8">
          <MarkdownContent markdown={blog.bodyMarkdown} />
        </div>
      </article>
    </main>
  );
}
