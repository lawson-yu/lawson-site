"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TagConfirmButton({ id }: { id: string }) {
  const router = useRouter();
  const [working, setWorking] = useState(false);

  return (
    <button
      className="border-line min-h-11 rounded-lg border px-3 py-2 text-sm font-semibold"
      disabled={working}
      onClick={async () => {
        setWorking(true);
        await fetch(`/api/author/tags/${id}/confirm`, { method: "POST" });
        setWorking(false);
        router.refresh();
      }}
      type="button"
    >
      确认
    </button>
  );
}
