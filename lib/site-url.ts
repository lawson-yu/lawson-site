const configuredSiteUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const siteUrl = new URL(configuredSiteUrl);

export function absoluteSiteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}
