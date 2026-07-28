import type { ComponentProps } from "react";

import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

function NativeSelect({ className, ...props }: ComponentProps<"select">) {
  return (
    <span className="relative inline-flex">
      <select
        className={cn(
          "border-line bg-canvas text-ink focus-visible:ring-brand h-10 appearance-none rounded-md border pr-10 pl-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          className,
        )}
        {...props}
      />
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
        size={16}
      />
    </span>
  );
}

function NativeSelectOption({ ...props }: ComponentProps<"option">) {
  return <option {...props} />;
}

export { NativeSelect, NativeSelectOption };
