import { redirect } from "next/navigation";

import { TagConfirmButton } from "../tag-confirm-button";
import { getAuthorIdentity } from "@/lib/author/identity";
import { listWorkspaceTags } from "@/lib/content/workspace";

export default async function AuthorTagsPage() {
  const author = await getAuthorIdentity();
  if (!author) redirect("/auth/login?error=unauthorized");

  const pendingTags = (await listWorkspaceTags()).filter(
    (tag) => tag.state === "pending",
  );

  return (
    <main>
      <section className="min-w-0 px-4 py-8 sm:px-8 lg:px-12">
        <header className="border-line border-b pb-7">
          <p className="text-accent text-xs font-bold tracking-[0.16em]">
            AUTHOR WORKSPACE
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
            待确认标签
          </h1>
          <p className="text-muted mt-2">
            确认后，标签可用于公开内容的筛选与检索。
          </p>
        </header>
        {pendingTags.length ? (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {pendingTags.map((tag) => (
              <li
                className="border-line bg-surface flex min-h-16 items-center justify-between gap-4 rounded-md border p-4"
                key={tag.id}
              >
                <span className="font-bold">{tag.label}</span>
                <TagConfirmButton id={tag.id} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted border-line mt-8 rounded-md border px-4 py-10 text-center">
            没有待确认标签。
          </p>
        )}
      </section>
    </main>
  );
}
