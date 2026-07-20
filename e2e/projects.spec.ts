import { expect, test } from "@playwright/test";

test("访客可浏览已发布个人项目及其关键事实", async ({ page }) => {
  await page.goto("/zh-CN/projects");

  await expect(
    page.getByRole("heading", { name: "个人项目", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "LAWSON Site", exact: true }).click();

  await expect(
    page.getByRole("heading", { name: "LAWSON Site", exact: true }),
  ).toBeVisible();
  await expect(page.locator("dt", { hasText: "问题" })).toBeVisible();
  await expect(page.locator("dt", { hasText: "成果" })).toBeVisible();
  await expect(page.locator("dt", { hasText: "技术栈" })).toBeVisible();
  await expect(page.getByRole("link", { name: "查看代码" })).toHaveAttribute(
    "href",
    "https://github.com/lawson/lawson-site",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/zh-CN\/projects\/lawson-site$/,
  );
  expect(
    await page.locator('script[type="application/ld+json"]').textContent(),
  ).toContain('"@type":"Project"');
});
