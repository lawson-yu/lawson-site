import { listPublishedBlogs, supportedLocale } from "@/lib/content/catalog";

function escapeXml(value: string) {
  return value.replace(
    /[<>&'\"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
        "<": "&lt;",
        ">": "&gt;",
      })[character] ?? character,
  );
}

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const blogs = await listPublishedBlogs(supportedLocale);
  const items = blogs
    .map(
      (blog) =>
        `<item><title>${escapeXml(blog.title)}</title><description>${escapeXml(blog.summary)}</description><link>${origin}/${supportedLocale}/blog/${blog.slug}</link><guid>${origin}/${supportedLocale}/blog/${blog.slug}</guid><pubDate>${new Date(blog.publishedAt).toUTCString()}</pubDate></item>`,
    )
    .join("");
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>LAWSON — AI 与工程实践</title><link>${origin}/${supportedLocale}</link><description>LAWSON 的工程实践、教程与 AI 内容。</description>${items}</channel></rss>`;
  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
