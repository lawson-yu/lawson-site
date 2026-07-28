import { redirect } from "next/navigation";

import { ContentTable } from "../content-table";
import {
  contentPageSize,
  getContentPageCount,
  parseContentPage,
} from "../pagination";
import { getAuthorIdentity } from "@/lib/author/identity";
import { listWorkspaceCuratedProjectsPage } from "@/lib/content/curated";

export default async function AuthorCuratedPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const author = await getAuthorIdentity();
  if (!author) redirect("/auth/login?error=unauthorized");
  const page = parseContentPage((await searchParams).page);
  const { items, total } = await listWorkspaceCuratedProjectsPage(
    author.userId,
    page,
    contentPageSize,
  );
  if (page > getContentPageCount(total)) redirect("/author/curated");
  return (
    <ContentTable
      createHref="/author/curated/new"
      contentBase="/author/curated"
      items={items}
      page={page}
      title="精选项目"
      total={total}
    />
  );
}
