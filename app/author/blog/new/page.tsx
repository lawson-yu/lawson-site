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
    <main className="bg-canvas text-ink min-h-screen px-4 py-12 sm:px-6">
      <section className="max-w-reading mx-auto">
        <h1 className="text-4xl font-extrabold">新建博客</h1>
        <div className="mt-10">
          <BlogForm tags={await listWorkspaceTags()} />
        </div>
      </section>
    </main>
  );
}
