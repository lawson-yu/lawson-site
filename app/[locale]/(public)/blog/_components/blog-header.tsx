import Link from "next/link";

export function BlogHeader({ locale }: { locale: string }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex min-h-16 max-w-site items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          className="text-sm font-extrabold tracking-eyebrow text-brand outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-canvas"
          href={`/${locale}/blog`}
        >
          LAWSON
        </Link>
        <span className="text-sm text-muted">AI 与工程实践</span>
      </div>
    </header>
  );
}
