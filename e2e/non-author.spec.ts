import { existsSync } from "node:fs";

import { expect, test } from "@playwright/test";

const nonAuthorStorageState = "evidence/auth/non-author.json";

test.describe("已登录非作者", () => {
  test.skip(
    !existsSync(nonAuthorStorageState),
    "需要本地 GitHub 非作者登录态；不提交 evidence/auth/。",
  );
  test.use({ storageState: nonAuthorStorageState });

  test("不能进入作者工作区", async ({ page }) => {
    await page.goto("/author");

    await expect(page).toHaveURL(/\/auth\/login\?error=unauthorized$/);
    await expect(page.getByRole("heading", { name: "作者登录" })).toBeVisible();
  });

  test("不能写入精选项目", async ({ page }) => {
    const response = await page.request.post("/api/author/curated", {
      data: {},
    });

    expect(response.status()).toBe(401);
  });
});
