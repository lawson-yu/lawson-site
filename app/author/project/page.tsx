import { redirect } from "next/navigation";

import { ContentTable } from "../content-table";
import {
  contentPageSize,
  getContentPageCount,
  parseContentPage,
} from "../pagination";
import { getAuthorIdentity } from "@/lib/author/identity";
import { listWorkspaceProjectsPage } from "@/lib/content/projects";

export default async function AuthorProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const author = await getAuthorIdentity();
  if (!author) redirect("/auth/login?error=unauthorized");
  const page = parseContentPage((await searchParams).page);
  const { items, total } = await listWorkspaceProjectsPage(
    author.userId,
    page,
    contentPageSize,
  );
  if (page > getContentPageCount(total)) redirect("/author/project");
  return (
    <ContentTable
      createHref="/author/project/new"
      contentBase="/author/project"
      items={items}
      page={page}
      title="个人项目"
      total={total}
    />
  );
}
