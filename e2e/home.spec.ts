import { expect, test } from "@playwright/test";

test("公开首页可访问并显示站点标题", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Lawson Site/i);
  await expect(
    page.getByRole("heading", { name: "lawson-site" }),
  ).toBeVisible();
});
