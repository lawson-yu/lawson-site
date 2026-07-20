import { expect, test } from "@playwright/test";

test("访客可按周和主题浏览已发布精选项目详情", async ({ page }) => {
  await page.goto("/zh-CN/curated");

  await expect(
    page.getByRole("heading", { name: "精选项目", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("2026-W30", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "2026-W30", exact: true }).click();
  await expect(page).toHaveURL(/\?week=2026-W30$/);
  await expect(page.getByText("当前筛选：2026-W30 · 全部主题")).toBeVisible();
  await page.getByRole("link", { name: "AI 系统", exact: true }).click();
  await expect(page).toHaveURL(/\?topic=ai-systems$/);
  await page.getByRole("link", { name: "LangChain", exact: true }).click();

  await expect(
    page.getByRole("heading", { name: "LangChain", exact: true }),
  ).toBeVisible();
  await expect(page.locator("dt", { hasText: "解决的问题" })).toBeVisible();
  await expect(page.locator("dt", { hasText: "适用场景" })).toBeVisible();
  await expect(page.locator("dt", { hasText: "作者短评" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "查看 GitHub 仓库" }),
  ).toHaveAttribute("href", "https://github.com/langchain-ai/langchain");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/zh-CN\/curated\/langchain$/,
  );
});

test("访客不能写入精选项目", async ({ request }) => {
  const response = await request.post("/api/author/curated", {
    data: {},
  });

  expect(response.status()).toBe(401);
});
