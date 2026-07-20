import type { MetadataRoute } from "next";

import { listPublishedBlogs, supportedLocale } from "@/lib/content/catalog";
import { listPublishedCuratedProjects } from "@/lib/content/curated";
import { listPublishedProjects } from "@/lib/content/projects";
import { absoluteSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogs, projects, curated] = await Promise.all([
    listPublishedBlogs(supportedLocale),
    listPublishedProjects(supportedLocale),
    listPublishedCuratedProjects(supportedLocale),
  ]);
  const now = new Date();
  const staticPaths = ["", "/blog", "/projects", "/curated", "/about"];
  return [
    ...staticPaths.map((path) => ({
      url: absoluteSiteUrl(`/${supportedLocale}${path}`),
      lastModified: now,
    })),
    ...blogs.map((item) => ({
      url: absoluteSiteUrl(`/${supportedLocale}/blog/${item.slug}`),
      lastModified: new Date(item.updatedAt),
    })),
    ...projects.map((item) => ({
      url: absoluteSiteUrl(`/${supportedLocale}/projects/${item.slug}`),
      lastModified: new Date(item.updatedAt),
    })),
    ...curated.map((item) => ({
      url: absoluteSiteUrl(`/${supportedLocale}/curated/${item.slug}`),
      lastModified: new Date(item.updatedAt),
    })),
  ];
}
