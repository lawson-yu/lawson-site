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

test("访客可用项目标签筛选、清除并从详情返回筛选", async ({ page }) => {
  await page.goto("/zh-CN/projects");

  const firstTag = page
    .getByRole("navigation", { name: "项目标签" })
    .getByRole("link")
    .nth(1);
  const tagLabel = (await firstTag.textContent())?.replace(/\d+$/, "").trim();
  expect(tagLabel).toBeTruthy();

  await firstTag.click();
  await expect(page).toHaveURL(/\?tag=/);
  await expect(
    page.getByRole("link", { name: tagLabel!, exact: true }).first(),
  ).toBeVisible();
  await page.getByRole("link", { name: "全部", exact: true }).click();
  await expect(page).toHaveURL("/zh-CN/projects");

  await page.goto("/zh-CN/projects?tag=not-a-real-tag");
  await expect(page.getByText("没有匹配内容。")).toBeVisible();

  await page.goto("/zh-CN/projects/lawson-site");
  const detailTag = page
    .locator("dt", { hasText: "标签" })
    .locator("..")
    .getByRole("link")
    .first();
  await expect(detailTag).toBeVisible();
  await detailTag.click();
  await expect(page).toHaveURL(/\?tag=/);
});
