import Link from "next/link";

import { Eye, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ContentItem = {
  id: string;
  title: string;
  summary: string;
  state: "draft" | "published";
};

export function ContentTable({
  createHref,
  editBase,
  items,
  title,
}: {
  createHref: string;
  editBase: string;
  items: ContentItem[];
  title: string;
}) {
  return (
    <main>
      <section className="min-w-0 px-4 py-8 sm:px-8 lg:px-12">
        <header className="border-line flex flex-wrap items-end justify-between gap-5 border-b pb-7">
          <div>
            <p className="text-accent text-xs font-bold tracking-[0.16em]">
              AUTHOR WORKSPACE
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
              {title}
            </h1>
            <p className="text-muted mt-2">
              按状态浏览内容，进入编辑页完成发布与撤回。
            </p>
          </div>
          <Link
            className="bg-action text-canvas inline-flex min-h-11 items-center gap-2 rounded-md px-4 py-3 text-sm font-bold"
            href={createHref}
          >
            <Plus aria-hidden="true" size={17} />
            新建{title}
          </Link>
        </header>
        <div className="border-line mt-8 overflow-x-auto rounded-md border">
          <Table>
            <caption className="sr-only">{title}内容列表</caption>
            <TableHeader>
              <tr>
                <TableHead>标题</TableHead>
                <TableHead className="hidden md:table-cell">摘要</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="min-w-52">
                    <Link
                      className="hover:text-action font-bold underline-offset-4 hover:underline"
                      href={`${editBase}/${item.id}`}
                    >
                      {item.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted hidden max-w-md md:table-cell">
                    {item.summary}
                  </TableCell>
                  <TableCell>
                    <Badge>{item.state === "draft" ? "草稿" : "已发布"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      aria-label={`预览 ${item.title}`}
                      className="text-muted hover:text-ink inline-flex min-h-11 items-center gap-2 text-sm font-bold"
                      href={`${editBase}/${item.id}/preview`}
                    >
                      <Eye aria-hidden="true" size={16} />
                      预览
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!items.length ? (
            <div className="text-muted border-line border-t px-4 py-10 text-center">
              暂无内容。使用右上角按钮新建。
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
