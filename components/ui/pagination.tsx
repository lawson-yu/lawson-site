import type { ComponentProps } from "react";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

function Pagination({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav
      aria-label="分页"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: ComponentProps<"ul">) {
  return <ul className={cn("flex items-center gap-1", className)} {...props} />;
}

function PaginationItem({ ...props }: ComponentProps<"li">) {
  return <li {...props} />;
}

function PaginationLink({
  className,
  isActive,
  ...props
}: ComponentProps<typeof Link> & { isActive?: boolean }) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "border-line hover:bg-surface inline-flex h-10 min-w-10 items-center justify-center rounded-md border text-sm font-bold",
        isActive && "bg-surface text-ink",
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  ...props
}: ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink className={cn("gap-1 px-3", className)} {...props}>
      <ChevronLeft aria-hidden="true" size={16} />
      <span>上一页</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink className={cn("gap-1 px-3", className)} {...props}>
      <span>下一页</span>
      <ChevronRight aria-hidden="true" size={16} />
    </PaginationLink>
  );
}

function PaginationEllipsis({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn("flex size-10 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal aria-hidden="true" size={16} />
      <span className="sr-only">更多页码</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
