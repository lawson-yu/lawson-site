export default function LoginPage() {
  return (
    <main className="bg-canvas text-ink grid min-h-screen place-items-center px-4 py-10 sm:px-6">
      <section className="border-line bg-surface w-full max-w-md rounded-md border p-6 sm:p-8">
        <p className="tracking-eyebrow text-accent text-sm font-bold">
          AUTHOR ACCESS
        </p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight">
          作者登录
        </h1>
        <p className="text-muted mt-4 leading-7">
          仅 LAWSON 的 GitHub OAuth 身份可以进入内容工作区。
        </p>
        {/* OAuth 必须由浏览器直接导航，避免客户端 RSC 请求跨域授权地址。 */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          className="bg-action text-canvas focus-visible:ring-brand mt-8 inline-flex min-h-11 items-center rounded-md px-4 py-3 font-bold outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          href="/auth/login/github"
        >
          使用 GitHub 登录
        </a>
      </section>
    </main>
  );
}
