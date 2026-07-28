import { redirect } from "next/navigation";

import { ContentTable } from "../content-table";
import {
  contentPageSize,
  getContentPageCount,
  parseContentPage,
} from "../pagination";
import { getAuthorIdentity } from "@/lib/author/identity";
import { listWorkspaceBlogsPage } from "@/lib/content/workspace";

export default async function AuthorBlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const author = await getAuthorIdentity();
  if (!author) redirect("/auth/login?error=unauthorized");
  const page = parseContentPage((await searchParams).page);
  const { items, total } = await listWorkspaceBlogsPage(
    author.userId,
    page,
    contentPageSize,
  );
  if (page > getContentPageCount(total)) redirect("/author/blog");
  return (
    <ContentTable
      createHref="/author/blog/new"
      contentBase="/author/blog"
      items={items}
      page={page}
      title="博客"
      total={total}
    />
  );
}
