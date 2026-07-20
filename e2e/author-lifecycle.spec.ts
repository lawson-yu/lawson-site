import { existsSync } from "node:fs";

import { expect, test, type Page } from "@playwright/test";

const authorStorageState = "evidence/auth/author.json";

type WorkspaceBlog = {
  id: string;
  slug: string;
  state: "draft" | "published";
};

async function unpublishBlogSlug(page: Page, slug: string) {
  const statuses = await page.evaluate(async (targetSlug) => {
    const response = await fetch("/api/author/blogs");
    const blogs = (await response.json()) as WorkspaceBlog[];
    const variants = blogs.filter((blog) => blog.slug === targetSlug);
    const draft = variants.find((blog) => blog.state === "draft");
    const published = variants.find((blog) => blog.state === "published");
    const actions: number[] = [];

    if (draft && published) {
      actions.push(
        (
          await fetch(`/api/author/blogs/${draft.id}/publish`, {
            method: "POST",
          })
        ).status,
      );
      actions.push(
        (
          await fetch(`/api/author/blogs/${draft.id}/unpublish`, {
            method: "POST",
          })
        ).status,
      );
    } else if (published) {
      actions.push(
        (
          await fetch(`/api/author/blogs/${published.id}/unpublish`, {
            method: "POST",
          })
        ).status,
      );
    }

    return actions;
  }, slug);

  expect(statuses.every((status) => status === 200)).toBeTruthy();
}

test.describe("作者博客生命周期", () => {
  test.skip(
    !existsSync(authorStorageState),
    "需要本地 GitHub 作者登录态；不提交 evidence/auth/。",
  );
  test.use({ storageState: authorStorageState });

  test("创建、发布、编辑发布并下架博客", async ({ page }) => {
    const suffix = Date.now().toString(36);
    const slug = `e2e-author-lifecycle-${suffix}`;
    const title = `E2E 作者生命周期 ${suffix}`;
    const editedTitle = `${title} 已编辑`;
    let editVariantId: string | undefined;

    try {
      await page.goto("/author");
      await expect(
        page.getByRole("heading", { name: "内容工作区" }),
      ).toBeVisible();

      await page.getByRole("link", { name: "新建博客", exact: true }).click();
      await page.getByLabel("标题").first().fill(title);
      await page.getByLabel("URL slug").first().fill(slug);
      await page
        .getByLabel("摘要")
        .first()
        .fill("由 E2E 创建的非公开测试草稿。");
      await page
        .getByLabel("Markdown 正文")
        .first()
        .fill("# E2E\n\n验证作者博客生命周期。");
      const createResponse = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname === "/api/author/blogs" &&
          response.request().method() === "POST",
      );
      await page.getByRole("button", { name: "保存草稿" }).first().click();
      expect((await createResponse).status()).toBe(201);

      await expect(page).toHaveURL(/\/author\/blog\/[0-9a-f-]{36}$/);
      const firstVariantId = page.url().split("/").at(-1)!;

      const firstPublishResponse = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname ===
            `/api/author/blogs/${firstVariantId}/publish` &&
          response.request().method() === "POST",
      );
      await page.getByRole("button", { name: "发布" }).first().click();
      expect((await firstPublishResponse).status()).toBe(200);

      await page.goto(`/zh-CN/blog/${slug}`);
      await expect(page.getByRole("heading", { name: title })).toBeVisible();

      await page.goto(`/author/blog/${firstVariantId}`);
      const editResponse = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname ===
            `/api/author/blogs/${firstVariantId}/edit` &&
          response.request().method() === "POST",
      );
      await page.getByRole("button", { name: "创建编辑草稿" }).first().click();
      const editResult = await editResponse;
      expect(editResult.status()).toBe(201);
      editVariantId = ((await editResult.json()) as { id: string }).id;
      await page.goto(`/author/blog/${editVariantId}`);
      await expect(page).toHaveURL(`/author/blog/${editVariantId}`);

      const editForm = page.locator("form");
      await editForm.getByLabel("标题").fill(editedTitle);
      const updateResponse = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname ===
            `/api/author/blogs/${editVariantId}` &&
          response.request().method() === "PATCH",
      );
      await editForm.getByRole("button", { name: "保存草稿" }).click();
      expect((await updateResponse).status()).toBe(200);
      await expect(page).toHaveURL(`/author/blog/${editVariantId}`);

      const secondPublishResponse = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname ===
            `/api/author/blogs/${editVariantId}/publish` &&
          response.request().method() === "POST",
      );
      await page.getByRole("button", { name: "发布" }).first().click();
      expect((await secondPublishResponse).status()).toBe(200);
      const unpublishResponse = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname ===
            `/api/author/blogs/${editVariantId}/unpublish` &&
          response.request().method() === "POST",
      );
      await page.getByRole("button", { name: "撤回为草稿" }).first().click();
      expect((await unpublishResponse).status()).toBe(200);

      await page.goto(`/zh-CN/blog/${slug}`);
      await expect(
        page.getByRole("heading", { name: editedTitle }),
      ).not.toBeVisible();
    } finally {
      await unpublishBlogSlug(page, slug);
    }
  });
});
