import { expect, test } from "@playwright/test";

test("无 locale 入口会进入中文公开站，并能从首页访问真实内容", async ({
  page,
  request,
}) => {
  for (const [path, localePath] of [
    ["/", "/zh-CN"],
    ["/about", "/zh-CN/about"],
    ["/blog", "/zh-CN/blog"],
    ["/curated", "/zh-CN/curated"],
    ["/projects", "/zh-CN/projects"],
    ["/search", "/zh-CN/search"],
  ]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(response.headers().location).toBe(localePath);
  }

  await page.goto("/");

  await expect(page).toHaveURL(/\/zh-CN$/);
  await expect(
    page.getByRole("heading", { name: "LAWSON — AI 与工程实践" }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "夜色山谷中的河流" }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "LAWSON 的原创 3D 人物形象" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "阅读最新文章" }),
  ).not.toBeVisible();
  await expect(page.getByRole("link", { name: "LAWSON Site" })).toBeVisible();
  await expect(page.getByRole("link", { name: "LangChain" })).toBeVisible();

  const latestBlog = page.locator("main article").first().getByRole("link");
  await expect(latestBlog).toBeVisible();
  await latestBlog.click();
  await expect(page).toHaveURL(/\/zh-CN\/blog\//);
});

test("公开导航、联系入口和 SEO 文档可访问", async ({ page, request }) => {
  await page.goto("/zh-CN/about");
  const origin = new URL(page.url()).origin;

  await expect(page.getByRole("link", { name: "博客" })).toHaveAttribute(
    "href",
    "/zh-CN/blog",
  );
  await expect(
    page.getByRole("link", { name: "项目", exact: true }),
  ).toHaveAttribute("href", "/zh-CN/projects");
  await expect(page.getByRole("link", { name: "精选项目" })).toHaveAttribute(
    "href",
    "/zh-CN/curated",
  );
  await expect(page.getByRole("link", { name: "搜索" })).toHaveAttribute(
    "href",
    "/zh-CN/search",
  );
  await expect(page.getByRole("link", { name: "GitHub" })).toBeVisible();
  await expect(page.getByRole("link", { name: "LinkedIn" })).toBeVisible();
  await expect(page.getByRole("link", { name: "邮箱" })).toBeVisible();
  await expect(page.getByRole("link", { name: "RSS" })).toHaveAttribute(
    "href",
    "/rss.xml",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `${origin}/zh-CN/about`,
  );

  for (const path of ["blog", "projects", "curated", "search"]) {
    await page.goto(`/zh-CN/${path}`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${origin}/zh-CN/${path}`,
    );
  }

  const [rss, sitemap] = await Promise.all([
    request.get("/rss.xml"),
    request.get("/sitemap.xml"),
  ]);
  expect(rss.ok()).toBeTruthy();
  expect(rss.headers()["content-type"]).toContain("application/rss+xml");
  await expect(rss).toBeOK();
  expect(await rss.text()).toContain("personal-site-foundation");
  expect(sitemap.ok()).toBeTruthy();
  const sitemapText = await sitemap.text();
  const locations = [...sitemapText.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  );
  expect(locations.length).toBeGreaterThan(0);
  expect(
    locations.every((location) => location?.startsWith(origin)),
  ).toBeTruthy();
  expect(sitemapText).toContain(
    `${origin}/zh-CN/blog/personal-site-foundation`,
  );
});

test("公开站在目标宽度无横向滚动，键盘焦点清晰且遵从减少动态效果", async ({
  page,
}) => {
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/zh-CN");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/zh-CN");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
  expect(
    await page
      .locator("[data-home-hero]")
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
});

test("桌面端浅色河流在指针经过时产生并消散波纹", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/zh-CN");

  const river = page.locator("[data-river-surface]");
  await expect(river).toHaveAttribute("data-ripple-state", "idle");
  await river.hover({ position: { x: 220, y: 120 } });
  await expect(river).toHaveAttribute("data-ripple-state", "active");
  await expect(river).toHaveAttribute("data-ripple-state", "idle", {
    timeout: 2_000,
  });
});

test("触摸设备使用低频自动波纹，减少动态效果时保持静止", async ({
  browser,
  page,
}) => {
  const touchContext = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { height: 844, width: 390 },
  });
  const touchPage = await touchContext.newPage();

  await touchPage.goto("/zh-CN");
  const character = touchPage.getByRole("img", {
    name: "LAWSON 的原创 3D 人物形象",
  });
  const characterBounds = await character.boundingBox();
  expect(characterBounds).not.toBeNull();
  expect(
    Math.abs(
      characterBounds!.x +
        characterBounds!.width / 2 -
        (await touchPage.viewportSize())!.width / 2,
    ),
  ).toBeLessThanOrEqual(4);
  await expect(touchPage.locator("[data-river-surface]")).toHaveAttribute(
    "data-ripple-state",
    "active",
    { timeout: 7_000 },
  );
  await touchContext.close();

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/zh-CN");
  await expect(page.locator("[data-river-surface]")).toHaveAttribute(
    "data-ripple-state",
    "idle",
  );
  await page.waitForTimeout(1_200);
  await expect(page.locator("[data-river-surface]")).toHaveAttribute(
    "data-ripple-state",
    "idle",
  );
});
