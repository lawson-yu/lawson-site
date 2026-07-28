import { redirect } from "next/navigation";

import { ContentTable } from "../content-table";
import {
  contentPageSize,
  getContentPageCount,
  parseContentPage,
  parseContentState,
} from "../pagination";
import { getAuthorIdentity } from "@/lib/author/identity";
import { listWorkspaceBlogsPage } from "@/lib/content/workspace";

export default async function AuthorBlogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string | string[];
    state?: string | string[];
  }>;
}) {
  const author = await getAuthorIdentity();
  if (!author) redirect("/auth/login?error=unauthorized");
  const params = await searchParams;
  const page = parseContentPage(params.page);
  const state = parseContentState(params.state);
  const { items, total } = await listWorkspaceBlogsPage(
    author.userId,
    page,
    contentPageSize,
    state,
  );
  if (page > getContentPageCount(total)) {
    redirect(state ? `/author/blog?state=${state}` : "/author/blog");
  }
  return (
    <ContentTable
      createHref="/author/blog/new"
      contentBase="/author/blog"
      items={items}
      page={page}
      state={state}
      title="博客"
      total={total}
    />
  );
}
