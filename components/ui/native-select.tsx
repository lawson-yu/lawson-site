import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function NativeSelect({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "border-line bg-canvas text-ink focus-visible:ring-brand h-10 rounded-md border px-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    />
  );
}

function NativeSelectOption({ ...props }: ComponentProps<"option">) {
  return <option {...props} />;
}

export { NativeSelect, NativeSelectOption };
