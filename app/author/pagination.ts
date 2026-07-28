export const contentPageSize = 10;
export type ContentState = "draft" | "published";

export function getContentPageCount(total: number) {
  return Math.max(1, Math.ceil(total / contentPageSize));
}

export function parseContentPage(value: string | string[] | undefined) {
  const page = Number.parseInt(typeof value === "string" ? value : "", 10);

  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export function parseContentState(value: string | string[] | undefined) {
  return value === "draft" || value === "published" ? value : undefined;
}
