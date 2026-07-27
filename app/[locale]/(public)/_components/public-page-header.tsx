export function PublicPageHeader({
  children,
  description,
  eyebrow,
  title,
}: {
  children?: React.ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <header className="border-line grid gap-8 border-t pt-8 min-[992px]:grid-cols-[minmax(0,0.72fr)_minmax(16rem,0.28fr)] min-[992px]:gap-12 min-[992px]:pt-10">
      <div className="min-w-0">
        <p className="tracking-eyebrow text-muted font-mono text-xs font-medium">
          {eyebrow}
        </p>
        <h1 className="mt-3 max-w-4xl text-4xl leading-[1.05] font-light tracking-tight [overflow-wrap:anywhere] min-[992px]:text-6xl sm:text-5xl">
          {title}
        </h1>
        <p className="text-muted mt-5 max-w-2xl text-base leading-7">
          {description}
        </p>
      </div>
      {children ? (
        <div className="border-line bg-surface self-start border-l-2 px-5 py-4">
          {children}
        </div>
      ) : null}
    </header>
  );
}
