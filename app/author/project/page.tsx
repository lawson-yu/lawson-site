import { redirect } from "next/navigation";

import { ContentTable } from "../content-table";
import {
  contentPageSize,
  getContentPageCount,
  parseContentPage,
  parseContentState,
} from "../pagination";
import { getAuthorIdentity } from "@/lib/author/identity";
import { listWorkspaceProjectsPage } from "@/lib/content/projects";

export default async function AuthorProjectsPage({
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
  const { items, total } = await listWorkspaceProjectsPage(
    author.userId,
    page,
    contentPageSize,
    state,
  );
  if (page > getContentPageCount(total)) {
    redirect(state ? `/author/project?state=${state}` : "/author/project");
  }
  return (
    <ContentTable
      createHref="/author/project/new"
      contentBase="/author/project"
      items={items}
      page={page}
      state={state}
      title="个人项目"
      total={total}
    />
  );
}
