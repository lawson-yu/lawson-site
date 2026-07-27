"use client";

import Link from "next/link";
import { useSyncExternalStore, useState } from "react";

const publicNavigation = [
  ["博客", "blog"],
  ["项目", "projects"],
  ["精选项目", "curated"],
  ["关于", "about"],
  ["搜索", "search"],
] as const;

const pathChangeEvent = "lawson:pathchange";

function getPathname() {
  return typeof window === "undefined" ? "" : window.location.pathname;
}

function subscribeToPathname(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;
  const notify = () => window.dispatchEvent(new Event(pathChangeEvent));

  window.history.pushState = function pushState(...args) {
    const result = originalPushState.apply(this, args);
    notify();
    return result;
  };
  window.history.replaceState = function replaceState(...args) {
    const result = originalReplaceState.apply(this, args);
    notify();
    return result;
  };

  window.addEventListener(pathChangeEvent, callback);
  window.addEventListener("popstate", callback);

  return () => {
    window.history.pushState = originalPushState;
    window.history.replaceState = originalReplaceState;
    window.removeEventListener(pathChangeEvent, callback);
    window.removeEventListener("popstate", callback);
  };
}

export function PublicNavigation({ locale }: { locale: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = useSyncExternalStore(
    subscribeToPathname,
    getPathname,
    () => "",
  );

  return (
    <>
      <button
        aria-controls="public-navigation"
        aria-expanded={isOpen}
        className="border-line/80 bg-surface/70 text-ink focus-visible:ring-brand rounded-control min-h-11 border px-3 py-2 font-mono text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-offset-2 min-[992px]:hidden"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        菜单
      </button>
      <nav
        aria-label="公开导航"
        className={`${
          isOpen ? "flex" : "hidden"
        } border-line/80 bg-canvas/95 absolute inset-x-0 top-[calc(100%+8px)] rounded-[var(--radius-control)] border px-4 py-3 shadow-[0_18px_48px_rgb(3_7_16/0.08)] backdrop-blur-xl min-[992px]:inset-0 min-[992px]:top-0 min-[992px]:flex min-[992px]:items-center min-[992px]:border-0 min-[992px]:bg-transparent min-[992px]:p-0 min-[992px]:shadow-none min-[992px]:backdrop-blur-none`}
        id="public-navigation"
      >
        <div className="flex w-full flex-col gap-1 min-[992px]:grid min-[992px]:h-full min-[992px]:grid-cols-[1fr_auto_1fr] min-[992px]:items-center min-[992px]:px-6">
          <div className="flex flex-col gap-1 min-[992px]:col-start-2 min-[992px]:flex-row min-[992px]:items-center min-[992px]:gap-3">
            {publicNavigation.map(([label, path]) => (
              <Link
                aria-current={
                  pathname === `/${locale}/${path}` ||
                  pathname.startsWith(`/${locale}/${path}/`)
                    ? "page"
                    : undefined
                }
                className={`focus-visible:ring-brand rounded-control min-h-11 px-3 py-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-offset-2 min-[992px]:min-h-10 min-[992px]:px-3 min-[992px]:py-2 ${
                  pathname === `/${locale}/${path}` ||
                  pathname.startsWith(`/${locale}/${path}/`)
                    ? "text-ink"
                    : "text-muted hover:text-ink"
                }`}
                href={`/${locale}/${path}`}
                key={path}
                onClick={() => setIsOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="border-line mt-3 flex flex-col gap-2 border-t pt-3 min-[992px]:col-start-3 min-[992px]:mt-0 min-[992px]:ml-auto min-[992px]:flex-row min-[992px]:border-t-0 min-[992px]:pt-0">
            <Link
              className="bg-action focus-visible:ring-brand rounded-control hover:bg-action/85 inline-flex min-h-11 items-center justify-center px-4 py-3 text-sm font-extrabold text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-2 min-[992px]:min-h-10 min-[992px]:py-2"
              href="/auth/login"
              onClick={() => setIsOpen(false)}
            >
              登录
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
