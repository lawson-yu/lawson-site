import { existsSync } from "node:fs";

import { expect, test, type Page } from "@playwright/test";

const importSecret = process.env.IMPORT_TEST_SECRET;
const authorStorageState = "evidence/auth/author.json";

type Image = { name: string; type?: string };

async function submitImport(
  page: Page,
  document: string,
  images: Image[] = [],
) {
  if (page.url() === "about:blank") await page.goto("/");
  return page.evaluate(
    async ({ document, images, secret }) => {
      const form = new FormData();
      form.append(
        "markdown",
        new File([document], "content.md", { type: "text/markdown" }),
      );
      for (const image of images) {
        form.append(
          image.name,
          new File(["image"], "image.png", { type: image.type ?? "image/png" }),
        );
      }
      const response = await fetch("/api/import", {
        body: form,
        headers: { Authorization: `Bearer ${secret}` },
        method: "POST",
      });
      return { body: await response.json(), status: response.status };
    },
    { document, images, secret: importSecret },
  );
}

function markdown(input: {
  externalId: string;
  kind?: "blog" | "project" | "curated";
  metadata?: string;
  slug: string;
  tags?: string[];
  title?: string;
  body?: string;
}) {
  const tagLines = (input.tags ?? ["导入测试"])
    .map((tag) => `  - ${tag}`)
    .join("\n");
  const metadataLine = input.metadata ? `\nmetadata: ${input.metadata}` : "";
  return `---
externalId: ${input.externalId}
kind: ${input.kind ?? "blog"}
locale: zh-CN
slug: ${input.slug}
title: ${input.title ?? "导入契约测试"}
summary: 用于验证受限导入边界的测试草稿。
tags:
${tagLines}${metadataLine}
---
${input.body ?? "# 导入测试\n\n正文。"}`;
}

test("导入接口拒绝缺失和错误密钥", async ({ request }) => {
  expect((await request.post("/api/import")).status()).toBe(401);
  expect(
    (
      await request.post("/api/import", {
        headers: { Authorization: "Bearer not-the-import-secret" },
      })
    ).status(),
  ).toBe(401);
});

test.describe("受限导入契约", () => {
  test.skip(
    !importSecret,
    "需要未提交的 IMPORT_TEST_SECRET 运行受限导入契约。",
  );

  test("三种内容均创建草稿、pending 标签和受管图片，且 externalId 幂等", async ({
    page,
  }) => {
    const suffix = Date.now().toString(36);
    const blog = markdown({
      body: "# 图片\n\n![导入图片](<images/diagram.png>)",
      externalId: `e2e-import-blog-${suffix}`,
      slug: `e2e-import-blog-${suffix}`,
      tags: ["待确认导入标签"],
    });
    const created = await submitImport(page, blog, [
      { name: "images/diagram.png" },
    ]);
    expect(created.status).toBe(201);
    expect(created.body.result).toBe("created");
    expect(created.body.draftVariantId).toMatch(/[0-9a-f-]{36}/);

    const repeated = await submitImport(page, blog, [
      { name: "images/diagram.png" },
    ]);
    expect(repeated.status).toBe(200);
    expect(repeated.body.result).toBe("unchanged");
    expect(repeated.body.draftVariantId).toBe(created.body.draftVariantId);

    const updated = await submitImport(
      page,
      markdown({
        externalId: `e2e-import-blog-${suffix}`,
        slug: `e2e-import-blog-${suffix}`,
        title: "更新后的导入草稿",
      }),
    );
    expect(updated.status).toBe(200);
    expect(updated.body.result).toBe("updated");
    expect(updated.body.draftVariantId).toBe(created.body.draftVariantId);

    const project = await submitImport(
      page,
      markdown({
        externalId: `e2e-import-project-${suffix}`,
        kind: "project",
        metadata:
          '{"problem":"问题","outcomes":"成果","techStack":["TypeScript"],"repositoryUrl":"https://example.com/repository"}',
        slug: `e2e-import-project-${suffix}`,
      }),
    );
    expect(project.status).toBe(201);

    const curated = await submitImport(
      page,
      markdown({
        externalId: `e2e-import-curated-${suffix}`,
        kind: "curated",
        metadata:
          '{"sourceRepositoryUrl":"https://example.com/repository","problem":"问题","useCases":"用途","commentary":"短评","collectedAt":"2026-07-21","week":"2026-W30"}',
        slug: `e2e-import-curated-${suffix}`,
      }),
    );
    expect(curated.status).toBe(201);
  });

  test("拒绝 HTML、路径穿越、远程或未引用图片、重复路径和超额图片", async ({
    page,
  }) => {
    const suffix = Date.now().toString(36);
    const invalidPackages = [
      [
        markdown({
          body: "<script>alert(1)</script>",
          externalId: `e2e-import-html-${suffix}`,
          slug: `e2e-import-html-${suffix}`,
        }),
        [],
      ],
      [
        markdown({
          body: "![路径](../outside.png)",
          externalId: `e2e-import-traversal-${suffix}`,
          slug: `e2e-import-traversal-${suffix}`,
        }),
        [{ name: "../outside.png" }],
      ],
      [
        markdown({
          body: "![远程](https://example.com/image.png)",
          externalId: `e2e-import-remote-${suffix}`,
          slug: `e2e-import-remote-${suffix}`,
        }),
        [],
      ],
      [
        markdown({
          externalId: `e2e-import-unreferenced-${suffix}`,
          slug: `e2e-import-unreferenced-${suffix}`,
        }),
        [{ name: "unused.png" }],
      ],
      [
        markdown({
          body: "![重复](duplicate.png)",
          externalId: `e2e-import-duplicate-${suffix}`,
          slug: `e2e-import-duplicate-${suffix}`,
        }),
        [{ name: "duplicate.png" }, { name: "duplicate.png" }],
      ],
      [
        markdown({
          body: Array.from(
            { length: 11 },
            (_, index) => `![图片${index}](image-${index}.png)`,
          ).join("\n"),
          externalId: `e2e-import-many-${suffix}`,
          slug: `e2e-import-many-${suffix}`,
        }),
        Array.from({ length: 11 }, (_, index) => ({
          name: `image-${index}.png`,
        })),
      ],
    ] as const;
    for (const [document, images] of invalidPackages) {
      expect((await submitImport(page, document, [...images])).status).toBe(
        400,
      );
    }
  });

  test("导入已发布内容只创建编辑草稿，不直接改变公开版本", async ({
    browser,
    page,
  }) => {
    test.skip(
      !existsSync(authorStorageState),
      "需要未提交的作者登录态验证已发布内容保护。",
    );
    const author = await browser.newContext({
      storageState: authorStorageState,
    });
    const suffix = Date.now().toString(36);
    const externalId = `e2e-import-published-${suffix}`;
    const slug = `e2e-import-published-${suffix}`;
    try {
      const first = await submitImport(page, markdown({ externalId, slug }));
      expect(first.status).toBe(201);
      expect(
        (
          await author.request.post(
            `/api/author/blogs/${first.body.draftVariantId}/publish`,
          )
        ).status(),
      ).toBe(200);
      const next = await submitImport(
        page,
        markdown({ externalId, slug, title: "不能直接覆盖公开内容" }),
      );
      expect(next.status).toBe(200);
      expect(next.body.draftVariantId).not.toBe(first.body.draftVariantId);
      await page.goto(`/zh-CN/blog/${slug}`);
      await expect(
        page.getByRole("heading", { name: "导入契约测试" }),
      ).toBeVisible();
    } finally {
      await author.close();
    }
  });
});
