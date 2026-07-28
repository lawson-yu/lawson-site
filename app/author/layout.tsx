import type { ReactNode } from "react";

import { AuthorShell } from "./author-shell";

export default function AuthorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-canvas text-ink h-dvh overflow-hidden">
      <AuthorShell>{children}</AuthorShell>
    </div>
  );
}
