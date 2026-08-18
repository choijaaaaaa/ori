import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { AdminAccessButton } from "@/components/admin-access-button";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "日韓交流会 / 일한교류회",
  description: "大阪梅田を拠点に活動する日韓言語交流コミュニティ / 오사카 우메다를 거점으로 활동하는 한일 언어교류 커뮤니티",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const authenticated = await isAdminAuthenticated();

  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AdminAccessButton authenticated={authenticated} />
        {children}
      </body>
    </html>
  );
}
