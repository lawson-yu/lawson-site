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
    page.getByText(
      "把 AI 工具、工程方法与可验证工作流，沉淀成能复用的实践记录。",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "阅读最新文章" }),
  ).toHaveAttribute("href", "/zh-CN/blog");
  await expect(
    page.getByRole("link", { name: "查看个人项目" }),
  ).toHaveAttribute("href", "/zh-CN/projects");
  await expect(page.getByRole("link", { name: "LAWSON Site" })).toBeVisible();
  await expect(
    page
      .getByRole("heading", { name: "精选项目" })
      .locator("..")
      .getByRole("article")
      .first()
      .getByRole("link"),
  ).toBeVisible();

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

test("公开导航切换不会触发同步更新错误", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/zh-CN/about");
  await page.getByRole("link", { name: "博客" }).first().click();
  await expect(page).toHaveURL("/zh-CN/blog");

  expect(errors).not.toContainEqual(
    expect.stringContaining("useInsertionEffect must not schedule updates"),
  );
});

test("公开博客页不会阻塞布局渲染", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/zh-CN/blog");
  await expect(
    page.getByRole("heading", { name: "博客", exact: true }),
  ).toBeVisible();

  expect(errors).not.toContainEqual(
    expect.stringContaining("Uncached data or `connection()` was accessed"),
  );
});

test("博客标签可筛选、清除、空态，并从详情回到筛选", async ({ page }) => {
  await page.goto("/zh-CN/blog");

  const firstTag = page
    .getByRole("navigation", { name: "博客标签" })
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
  await expect(page).toHaveURL("/zh-CN/blog");

  await page.goto("/zh-CN/blog?tag=not-a-real-tag");
  await expect(page.getByText("没有匹配内容。")).toBeVisible();

  await page.goto("/zh-CN/blog/personal-site-foundation");
  const detailTag = page.locator("article").getByRole("link").first();
  await expect(detailTag).toBeVisible();
  await detailTag.click();
  await expect(page).toHaveURL(/\?tag=/);
});

test("小屏公开导航可由键盘展开并访问既有链接", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/zh-CN/about");

  const menu = page.getByRole("button", { name: "菜单" });
  await expect(menu).toHaveAttribute("aria-controls", "public-navigation");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("link", { name: "博客" })).toBeVisible();
  await page.getByRole("link", { name: "博客" }).click();
  await expect(page).toHaveURL("/zh-CN/blog");
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
      .getByRole("heading", { name: "LAWSON — AI 与工程实践" })
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
});

test("首页 Hero 保留波纹交互并遵从减少动态效果", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/zh-CN");

  const river = page.locator("[data-river-surface]");
  await expect(river).toHaveAttribute("data-ripple-state", "idle");
  await river.hover({ position: { x: 220, y: 120 } });
  await expect(river).toHaveAttribute("data-ripple-state", "active");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/zh-CN");
  await expect(river).toHaveAttribute("data-ripple-state", "idle");
});
