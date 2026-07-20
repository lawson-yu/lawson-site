import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";

import { MarkdownContent } from "@/app/[locale]/(public)/blog/[slug]/markdown-content";
import { getAuthorIdentity } from "@/lib/author/identity";
import { getWorkspaceCuratedProject } from "@/lib/content/curated";

export default async function CuratedPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const author = await getAuthorIdentity();
  if (!author) redirect("/auth/login?error=unauthorized");
  const project = await getWorkspaceCuratedProject(
    author.userId,
    (await params).id,
  );
  if (!project) notFound();
  return (
    <main className="bg-canvas text-ink min-h-screen">
      <article className="max-w-reading mx-auto px-4 py-16 sm:px-6">
        <p className="tracking-eyebrow text-accent text-sm font-bold">
          PREVIEW
        </p>
        <h1 className="mt-4 text-4xl font-extrabold">{project.title}</h1>
        <p className="text-muted mt-6 text-xl leading-8">{project.summary}</p>
        <div className="mt-12">
          <MarkdownContent markdown={project.bodyMarkdown} />
        </div>
      </article>
    </main>
  );
}
