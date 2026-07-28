import { redirect } from "next/navigation";

import { ContentTable } from "../content-table";
import {
  contentPageSize,
  getContentPageCount,
  parseContentPage,
  parseContentState,
} from "../pagination";
import { getAuthorIdentity } from "@/lib/author/identity";
import { listWorkspaceCuratedProjectsPage } from "@/lib/content/curated";

export default async function AuthorCuratedPage({
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
  const { items, total } = await listWorkspaceCuratedProjectsPage(
    author.userId,
    page,
    contentPageSize,
    state,
  );
  if (page > getContentPageCount(total)) {
    redirect(state ? `/author/curated?state=${state}` : "/author/curated");
  }
  return (
    <ContentTable
      createHref="/author/curated/new"
      contentBase="/author/curated"
      items={items}
      page={page}
      state={state}
      title="精选项目"
      total={total}
    />
  );
}
