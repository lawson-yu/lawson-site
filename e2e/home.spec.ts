import { expect, test } from "@playwright/test";

test("访客可阅读已发布博客，且正文不会执行原始 HTML", async ({ page }) => {
  await page.goto("/zh-CN/blog");

  await expect(page).toHaveTitle(/博客.*LAWSON/i);
  await page
    .getByRole("link", { name: "从零搭建可持续维护的个人技术站" })
    .click();

  await expect(page).toHaveURL(/\/zh-CN\/blog\/personal-site-foundation$/);
  await expect(
    page.getByRole("heading", { name: "从零搭建可持续维护的个人技术站" }),
  ).toBeVisible();
  const article = page.locator("article").filter({ hasText: "先定义内容契约" });
  await expect(article.getByText("工程实践", { exact: true })).toBeVisible();
  await expect(article.getByText("待确认标签", { exact: true })).not.toBeVisible();
  await expect(article.getByRole("button", { name: "复制代码" })).toBeVisible();
  await expect(article.locator("script")).toHaveCount(0);
  await article.getByRole("link", { name: "工程实践" }).click();
  await expect(page).toHaveURL(/\/zh-CN\/blog\?tag=engineering$/);
  await expect(
    page.getByRole("link", { name: "从零搭建可持续维护的个人技术站" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "把 agent 工作流变成可验证的工程流程" }),
  ).not.toBeVisible();
  await expect(article).toContainText("先定义内容契约");
});
