import { existsSync } from "node:fs";

import { expect, test } from "@playwright/test";

const authorStorageState = "evidence/auth/author.json";

test.describe("作者个人项目生命周期", () => {
  test.skip(
    !existsSync(authorStorageState),
    "需要本地 GitHub 作者登录态；不提交 evidence/auth/。",
  );
  test.use({ storageState: authorStorageState });

  test("创建、发布、编辑发布并撤回个人项目", async ({ page }) => {
    const suffix = Date.now().toString(36);
    const slug = `e2e-project-${suffix}`;
    const title = `E2E 个人项目 ${suffix}`;

    await page.goto("/author");
    await page.getByRole("link", { name: "新建项目", exact: true }).click();
    await page.getByLabel("标题").fill(title);
    await page.getByLabel("URL slug").fill(slug);
    await page.getByLabel("摘要").fill("用于验证作者项目生命周期的草稿。");
    await page.getByLabel("问题").fill("验证项目内容权限与公开可见性。");
    await page.getByLabel("成果").fill("建立可重复执行的作者工作流。");
    await page.getByLabel("技术栈（用逗号分隔）").fill("Next.js, Supabase");
    await page
      .getByLabel("代码仓库")
      .fill("https://github.com/lawson/lawson-site");
    await page
      .getByLabel("项目说明（Markdown）")
      .fill("# E2E 项目\n\n验证完整生命周期。");

    const created = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === "/api/author/projects" &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "保存草稿" }).click();
    expect((await created).status()).toBe(201);
    await expect(page).toHaveURL(/\/author\/project\/[0-9a-f-]{36}$/);
    const firstId = page.url().split("/").at(-1)!;

    await page.getByRole("button", { name: "发布" }).click();
    await expect(
      page.getByRole("button", { name: "撤回为草稿" }),
    ).toBeVisible();
    await page.goto(`/zh-CN/projects/${slug}`);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();

    await page.goto(`/author/project/${firstId}`);
    const editNavigation = page.waitForURL(
      (url) => url.pathname !== `/author/project/${firstId}`,
    );
    await page.getByRole("button", { name: "创建编辑草稿" }).click();
    await editNavigation;
    await page.getByRole("button", { name: "发布" }).click();
    await expect(
      page.getByRole("button", { name: "撤回为草稿" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "撤回为草稿" }).click();
    await expect(page.getByRole("button", { name: "发布" })).toBeVisible();
    await page.goto(`/zh-CN/projects/${slug}`);
    await expect(page.getByRole("heading", { name: title })).not.toBeVisible();
  });
});
