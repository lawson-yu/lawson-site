import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="bg-canvas text-ink grid min-h-screen place-items-center px-4">
      <section className="border-line bg-surface w-full max-w-md border p-8">
        <p className="tracking-eyebrow text-accent text-sm font-bold">
          AUTHOR ACCESS
        </p>
        <h1 className="mt-4 text-3xl font-extrabold">作者登录</h1>
        <p className="text-muted mt-4 leading-7">
          仅 LAWSON 的 GitHub OAuth 身份可以进入内容工作区。
        </p>
        <Link
          className="bg-action text-canvas mt-8 inline-flex min-h-11 items-center rounded-lg px-4 py-3 font-bold"
          href="/auth/login/github"
        >
          使用 GitHub 登录
        </Link>
      </section>
    </main>
  );
}
