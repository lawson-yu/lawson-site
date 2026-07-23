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

  test("创建、发布、编辑发布并下架博客", async ({ page, browser }) => {
    test.setTimeout(60_000);
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

      await page
        .getByRole("navigation", { name: "新建内容" })
        .getByRole("link", { name: "新建博客", exact: true })
        .click();
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

      await expect(page).toHaveURL(/\/author\/blog\/[0-9a-f-]{36}$/, {
        timeout: 30_000,
      });
      const firstVariantId = page.url().split("/").at(-1)!;

      const mediaUpload = page
        .getByRole("group", { name: "添加受管图片" })
        .first();
      await expect(mediaUpload).toBeVisible();
      await mediaUpload.getByLabel("选择图片").setInputFiles({
        buffer: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL4VQAAAABJRU5ErkJggg==",
          "base64",
        ),
        mimeType: "image/png",
        name: "e2e.png",
      });
      await mediaUpload.getByLabel("图片替代文本").fill("E2E 受管图片");
      const uploadResponse = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname === "/api/author/media" &&
          response.request().method() === "POST",
      );
      await mediaUpload
        .getByRole("button", { name: "上传并插入 Markdown" })
        .click();
      const uploaded = await uploadResponse;
      expect(uploaded.status()).toBe(201);
      const assetId = ((await uploaded.json()) as { id: string }).id;
      await expect(page.getByLabel("Markdown 正文").first()).toHaveValue(
        new RegExp(`/media/${firstVariantId}/`),
      );
      const draftMedia = await page.request.get(
        `/media/${firstVariantId}/${assetId}`,
      );
      expect(draftMedia.status()).toBe(200);
      const saveMediaResponse = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname ===
            `/api/author/blogs/${firstVariantId}` &&
          response.request().method() === "PATCH",
      );
      await page.getByRole("button", { name: "保存草稿" }).click();
      expect((await saveMediaResponse).status()).toBe(200);
      const referencedDelete = await page.request.delete("/api/author/media", {
        data: { assetId, variantId: firstVariantId },
      });
      expect(referencedDelete.status()).toBe(400);
      await mediaUpload.getByLabel("选择图片").setInputFiles({
        buffer: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL4VQAAAABJRU5ErkJggg==",
          "base64",
        ),
        mimeType: "image/png",
        name: "removable.png",
      });
      await mediaUpload.getByLabel("图片替代文本").fill("待删除图片");
      const removableResponse = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname === "/api/author/media" &&
          response.request().method() === "POST",
      );
      await mediaUpload
        .getByRole("button", { name: "上传并插入 Markdown" })
        .click();
      const removable = await removableResponse;
      expect(removable.status()).toBe(201);
      const removableAsset = (await removable.json()) as {
        id: string;
        markdown: string;
      };
      const body = page.getByLabel("Markdown 正文").first();
      await body.fill(
        (await body.inputValue()).replace(removableAsset.markdown, ""),
      );
      const saveUnreferencedResponse = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname ===
            `/api/author/blogs/${firstVariantId}` &&
          response.request().method() === "PATCH",
      );
      await page.getByRole("button", { name: "保存草稿" }).click();
      expect((await saveUnreferencedResponse).status()).toBe(200);
      const deleted = await page.request.delete("/api/author/media", {
        data: { assetId: removableAsset.id, variantId: firstVariantId },
      });
      expect(deleted.status()).toBe(204);
      expect(
        (
          await page.request.get(
            `/media/${firstVariantId}/${removableAsset.id}`,
          )
        ).status(),
      ).toBe(404);
      if (existsSync("evidence/auth/non-author.json")) {
        const nonAuthor = await browser.newContext({
          storageState: "evidence/auth/non-author.json",
        });
        const nonAuthorDraftMedia = await nonAuthor.request.get(
          `/media/${firstVariantId}/${assetId}`,
        );
        expect(nonAuthorDraftMedia.status()).toBe(404);
        await nonAuthor.close();
      }

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
      await expect(
        page.getByRole("img", { name: "E2E 受管图片" }),
      ).toHaveAttribute("src", new RegExp(`/media/${firstVariantId}/`));
      const visitor = await browser.newContext();
      const publicMedia = await visitor.request.get(
        `/media/${firstVariantId}/${assetId}`,
      );
      expect(publicMedia.status()).toBe(200);
      expect(publicMedia.headers()["content-type"]).toMatch(/^image\//);
      await visitor.close();

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
      const copiedMediaMatch = new RegExp(
        `/media/${editVariantId}/([0-9a-f-]{36})`,
      ).exec(await editForm.getByLabel("Markdown 正文").inputValue());
      expect(copiedMediaMatch?.[1]).toBeTruthy();
      const copiedAssetId = copiedMediaMatch![1];
      expect(
        (
          await page.request.get(`/media/${editVariantId}/${copiedAssetId}`)
        ).status(),
      ).toBe(200);

      const secondPublishResponse = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname ===
            `/api/author/blogs/${editVariantId}/publish` &&
          response.request().method() === "POST",
      );
      await page.getByRole("button", { name: "发布" }).first().click();
      expect((await secondPublishResponse).status()).toBe(200);
      await page.goto(`/zh-CN/blog/${slug}`);
      await expect(
        page.getByRole("img", { name: "E2E 受管图片" }),
      ).toHaveAttribute(
        "src",
        new RegExp(`/media/${editVariantId}/${copiedAssetId}`),
      );
      const afterReplacement = await browser.newContext();
      expect(
        (
          await afterReplacement.request.get(
            `/media/${editVariantId}/${copiedAssetId}`,
          )
        ).status(),
      ).toBe(200);
      await afterReplacement.close();
      await page.goto(`/author/blog/${editVariantId}`);
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
