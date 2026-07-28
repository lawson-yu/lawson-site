import { redirect } from "next/navigation";

import { ContentTable } from "../content-table";
import { getAuthorIdentity } from "@/lib/author/identity";
import { listWorkspaceCuratedProjects } from "@/lib/content/curated";

export default async function AuthorCuratedPage() {
  const author = await getAuthorIdentity();
  if (!author) redirect("/auth/login?error=unauthorized");
  const items = await listWorkspaceCuratedProjects(author.userId);
  return (
    <ContentTable
      createHref="/author/curated/new"
      editBase="/author/curated"
      items={items}
      title="精选项目"
    />
  );
}
