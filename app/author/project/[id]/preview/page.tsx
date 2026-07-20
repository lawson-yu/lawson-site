import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";

import { MarkdownContent } from "@/app/[locale]/(public)/blog/[slug]/markdown-content";
import { getAuthorIdentity } from "@/lib/author/identity";
import { getWorkspaceProject } from "@/lib/content/projects";

export default async function ProjectPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const author = await getAuthorIdentity();
  if (!author) redirect("/auth/login?error=unauthorized");
  const project = await getWorkspaceProject(author.userId, (await params).id);
  if (!project) notFound();
  return (
    <main className="bg-canvas text-ink min-h-screen">
      <article className="max-w-reading mx-auto px-4 py-16 sm:px-6">
        <p className="tracking-eyebrow text-accent text-sm font-bold">
          项目草稿预览
        </p>
        <h1 className="mt-4 text-4xl font-extrabold">{project.title}</h1>
        <p className="text-muted mt-6 text-xl">{project.summary}</p>
        <dl className="mt-10 grid gap-6">
          <div>
            <dt className="font-bold">问题</dt>
            <dd className="text-muted mt-2">{project.metadata.problem}</dd>
          </div>
          <div>
            <dt className="font-bold">成果</dt>
            <dd className="text-muted mt-2">{project.metadata.outcomes}</dd>
          </div>
          <div>
            <dt className="font-bold">技术栈</dt>
            <dd className="text-muted mt-2">
              {project.metadata.techStack.join("、")}
            </dd>
          </div>
          <div>
            <dt className="font-bold">代码仓库</dt>
            <dd className="text-muted mt-2">
              {project.metadata.repositoryUrl}
            </dd>
          </div>
          {project.metadata.demoUrl ? (
            <div>
              <dt className="font-bold">演示链接</dt>
              <dd className="text-muted mt-2">{project.metadata.demoUrl}</dd>
            </div>
          ) : null}
        </dl>
        <div className="border-line mt-12 border-t pt-8">
          <MarkdownContent markdown={project.bodyMarkdown} />
        </div>
      </article>
    </main>
  );
}
