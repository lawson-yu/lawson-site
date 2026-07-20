import { existsSync } from "node:fs";

import { expect, test } from "@playwright/test";

const authorStorageState = "evidence/auth/author.json";

test.describe("作者精选项目生命周期", () => {
  test.skip(
    !existsSync(authorStorageState),
    "需要本地 GitHub 作者登录态；不提交 evidence/auth/。",
  );
  test.use({ storageState: authorStorageState });

  test("创建、发布并撤回精选项目", async ({ page }) => {
    const suffix = Date.now().toString(36);
    const slug = `e2e-curated-${suffix}`;
    const title = `E2E 精选项目 ${suffix}`;
    await page.goto("/author");
    await page.getByRole("link", { name: "新建精选项目", exact: true }).click();
    await page.getByLabel("标题").fill(title);
    await page.getByLabel("URL slug").fill(slug);
    await page.getByLabel("摘要").fill("用于验证精选项目生命周期。 ");
    await page
      .getByLabel("来源仓库")
      .fill("https://github.com/langchain-ai/langchain");
    await page.getByLabel("解决的问题").fill("验证公开与作者权限边界。");
    await page.getByLabel("适用场景").fill("验证内容资料库工作流。");
    await page.getByLabel("作者短评").fill("可重复执行的端到端验证。");
    await page.getByLabel("收录日期").fill("2026-07-20");
    await page.getByLabel("周信息").fill("2026-W30");
    await page
      .getByLabel("精选说明（Markdown）")
      .fill("# E2E 精选\n\n验证完整生命周期。");
    const created = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === "/api/author/curated" &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "保存草稿" }).click();
    expect((await created).status()).toBe(201);
    await expect(page).toHaveURL(/\/author\/curated\/[0-9a-f-]{36}$/);
    const id = page.url().split("/").at(-1)!;
    await page.getByRole("button", { name: "发布" }).click();
    await expect(
      page.getByRole("button", { name: "撤回为草稿" }),
    ).toBeVisible();
    await page.goto(`/zh-CN/curated/${slug}`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: title })).toBeVisible({
      timeout: 15_000,
    });
    await page.goto(`/author/curated/${id}`);
    await page.getByRole("button", { name: "撤回为草稿" }).click();
    await expect(page.getByRole("button", { name: "发布" })).toBeVisible();
    await page.goto(`/zh-CN/curated/${slug}`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: title })).toHaveCount(0, {
      timeout: 15_000,
    });
  });
});
