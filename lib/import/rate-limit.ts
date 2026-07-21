import { createHash } from "node:crypto";

const windowMs = 60_000;
const maxRequests = 12;
const attempts = new Map<string, number[]>();

function requestKey(request: Request) {
  const address =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return createHash("sha256").update(address).digest("hex");
}

/** Per-instance brute-force guard; the import secret remains the authorization boundary. */
export function isImportRateLimited(request: Request) {
  const now = Date.now();
  const key = requestKey(request);
  const recent = (attempts.get(key) ?? []).filter(
    (time) => time > now - windowMs,
  );
  recent.push(now);
  attempts.set(key, recent);
  return recent.length > maxRequests;
}
