import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";

import { ProjectForm } from "../../project-form";
import { ProjectLifecycleActions } from "../../project-lifecycle-actions";
import { getAuthorIdentity } from "@/lib/author/identity";
import { getWorkspaceProject } from "@/lib/content/projects";
import { listWorkspaceTags } from "@/lib/content/workspace";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const author = await getAuthorIdentity();
  if (!author) redirect("/auth/login?error=unauthorized");
  const { id } = await params;
  const [project, tags] = await Promise.all([
    getWorkspaceProject(author.userId, id),
    listWorkspaceTags(),
  ]);
  if (!project) notFound();
  return (
    <main className="bg-canvas text-ink min-h-screen px-4 py-12 sm:px-6">
      <section className="max-w-reading mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-muted text-sm">
              {project.state === "draft" ? "草稿" : "已发布"}
            </p>
            <h1 className="mt-2 text-4xl font-extrabold">编辑个人项目</h1>
          </div>
          <Link
            className="min-h-11 px-2 py-3 underline"
            href={`/author/project/${project.id}/preview`}
          >
            预览
          </Link>
        </div>
        <div className="mt-8">
          <ProjectLifecycleActions id={project.id} state={project.state} />
        </div>
        <div className="mt-10">
          <ProjectForm project={project} tags={tags} />
        </div>
      </section>
    </main>
  );
}
