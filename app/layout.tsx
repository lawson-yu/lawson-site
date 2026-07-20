import type { Metadata } from "next";

import { siteUrl } from "@/lib/site-url";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "LAWSON — AI 与工程实践",
  description: "关于 AI、工程实践与可持续维护的技术系统。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
