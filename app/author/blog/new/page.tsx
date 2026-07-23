import { redirect } from "next/navigation";
import { connection } from "next/server";

import { BlogForm } from "../../blog-form";
import { getAuthorIdentity } from "@/lib/author/identity";
import { listWorkspaceTags } from "@/lib/content/workspace";

export default async function NewBlogPage() {
  await connection();
  if (!(await getAuthorIdentity())) {
    redirect("/auth/login?error=unauthorized");
  }

  return (
    <main className="bg-canvas text-ink min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <section className="max-w-site mx-auto">
        <header className="border-line border-b pb-8">
          <p className="tracking-eyebrow text-accent text-sm font-bold">
            AUTHOR WORKSPACE
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight">
            新建博客
          </h1>
        </header>
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div>
            <BlogForm tags={await listWorkspaceTags()} />
          </div>
          <aside className="border-line bg-surface h-fit rounded-md border p-5 text-sm leading-6">
            保存后可在内容页预览、发布或撤回草稿。
          </aside>
        </div>
      </section>
    </main>
  );
}
