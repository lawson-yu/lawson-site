"use client";

import { usePathname, useRouter } from "next/navigation";

import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import type { ContentState } from "./pagination";

export function ContentFilters({ state }: { state: ContentState | undefined }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="mt-6 flex items-center gap-3">
      <label className="text-muted text-sm font-bold" htmlFor="content-state">
        状态
      </label>
      <NativeSelect
        id="content-state"
        name="state"
        onChange={(event) => {
          const params = new URLSearchParams();
          if (event.target.value !== "all") {
            params.set("state", event.target.value);
          }
          const query = params.toString();
          router.push(query ? `${pathname}?${query}` : pathname);
        }}
        value={state ?? "all"}
      >
        <NativeSelectOption value="all">全部状态</NativeSelectOption>
        <NativeSelectOption value="draft">草稿</NativeSelectOption>
        <NativeSelectOption value="published">已发布</NativeSelectOption>
      </NativeSelect>
    </div>
  );
}
