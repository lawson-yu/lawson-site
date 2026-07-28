import { redirect } from "next/navigation";

import { ContentTable } from "../content-table";
import { getAuthorIdentity } from "@/lib/author/identity";
import { listWorkspaceBlogs } from "@/lib/content/workspace";

export default async function AuthorBlogsPage() {
  const author = await getAuthorIdentity();
  if (!author) redirect("/auth/login?error=unauthorized");
  const items = await listWorkspaceBlogs(author.userId);
  return (
    <ContentTable
      createHref="/author/blog/new"
      editBase="/author/blog"
      items={items}
      title="博客"
    />
  );
}
