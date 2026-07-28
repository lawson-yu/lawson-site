import type { ReactNode } from "react";

import { AuthorShell } from "./author-shell";

export default function AuthorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-canvas text-ink min-h-screen">
      <AuthorShell>{children}</AuthorShell>
    </div>
  );
}
