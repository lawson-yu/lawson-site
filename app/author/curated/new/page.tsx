import { redirect } from "next/navigation";
import { connection } from "next/server";

import { CuratedForm } from "../../curated-form";
import { getAuthorIdentity } from "@/lib/author/identity";
import { listWorkspaceTags } from "@/lib/content/workspace";

export default async function NewCuratedProjectPage() {
  await connection();
  if (!(await getAuthorIdentity())) redirect("/auth/login?error=unauthorized");
  return (
    <main className="bg-canvas text-ink min-h-screen px-4 py-12 sm:px-6">
      <section className="max-w-reading mx-auto">
        <p className="tracking-eyebrow text-accent text-sm font-bold">
          AUTHOR WORKSPACE
        </p>
        <h1 className="mt-3 text-4xl font-extrabold">新建精选项目</h1>
        <div className="mt-10">
          <CuratedForm tags={await listWorkspaceTags()} />
        </div>
      </section>
    </main>
  );
}
