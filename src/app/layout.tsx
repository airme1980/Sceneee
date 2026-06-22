import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Word Scene Trainer",
  description: "A pixel RPG demo for learning English words in scenes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
