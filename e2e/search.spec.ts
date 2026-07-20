import { expect, test } from "@playwright/test";

test("访客可搜索已发布内容、按类型筛选，且搜索页不被索引", async ({ page }) => {
  await page.goto("/zh-CN/search?q=LAWSON");

  await expect(
    page.getByRole("heading", { name: "搜索", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "LAWSON Site", exact: true }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );

  await page.getByRole("link", { name: "个人项目", exact: true }).click();
  await expect(page).toHaveURL(/kind=project/);
  await expect(page.getByText("个人项目 · “LAWSON” 的搜索结果")).toBeVisible();
  await page.getByRole("link", { name: "LAWSON Site", exact: true }).click();
  await expect(page).toHaveURL(/\/zh-CN\/projects\/lawson-site$/);

  await page.goto(
    "/zh-CN/search?q=%E4%B8%8D%E4%BC%9A%E5%87%BA%E7%8E%B0%E5%9C%A8%E5%85%AC%E5%BC%80%E7%AB%99",
  );
  await expect(page.getByText("没有匹配的已发布内容。")).toBeVisible();
});
