import { redirect } from "next/navigation";

import { ContentTable } from "../content-table";
import { getAuthorIdentity } from "@/lib/author/identity";
import { listWorkspaceProjects } from "@/lib/content/projects";

export default async function AuthorProjectsPage() {
  const author = await getAuthorIdentity();
  if (!author) redirect("/auth/login?error=unauthorized");
  const items = await listWorkspaceProjects(author.userId);
  return (
    <ContentTable
      createHref="/author/project/new"
      editBase="/author/project"
      items={items}
      title="个人项目"
    />
  );
}
