import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <table className={cn("w-full text-left text-sm", className)} {...props} />
  );
}

function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return (
    <thead
      className={cn("border-line text-muted border-b", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody className={cn("divide-line divide-y", className)} {...props} />;
}

function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return <tr className={cn("hover:bg-surface/70", className)} {...props} />;
}

function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      className={cn("px-4 py-3 text-xs font-bold tracking-[0.08em]", className)}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-4 py-4 align-top", className)} {...props} />;
}

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };
