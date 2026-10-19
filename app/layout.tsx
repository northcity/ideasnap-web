import type { Metadata } from "next";
import "./globals.css";
import "./commerce.css";
import Script from "next/script";
import SiteShell from "./site-shell";
import { SiteProvider } from "./site-context";

export const metadata: Metadata = {
  metadataBase: new URL("https://ideasnap.xyz"),
  title:
    "闪念 - AI 语音笔记 | Apple Watch、iOS、Android、Windows、macOS、Linux",
  description:
    "想到什么，直接说。闪念自动转写、总结并提取待办，在 Apple Watch、手机与电脑之间持续同步。",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "/",
    siteName: "闪念 AI 语音笔记",
    title: "想到什么，直接说。AI 自动整理成笔记和待办",
    description:
      "语音、图片和零散想法自动转写、总结并提取待办，全平台持续同步。",
    images: [
      {
        url: "/assets/showcase/platform-hero.webp",
        width: 1536,
        height: 1024,
        alt: "闪念 AI 语音笔记全平台界面",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "闪念 AI 语音笔记",
    description: "想到什么，直接说。AI 自动整理成笔记和待办。",
    images: ["/assets/showcase/platform-hero.webp"],
  },
  icons: {
    icon: "https://ideasnap.xyz/assets/icons/Appicon.png",
    apple: "https://ideasnap.xyz/assets/icons/Appicon.png",
  },
  other: {
    "codex-preview": "development",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeScript = `
    (function () {
      try {
        var params = new URLSearchParams(location.search);
        var paramTheme = params.get('theme');
        var saved = localStorage.getItem('ideasnap-theme');
        var theme = (paramTheme === 'dark' || paramTheme === 'light')
          ? paramTheme
          : (saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
        if (params.get('embed') === '1') {
          document.documentElement.dataset.embed = '1';
        }
      } catch (e) {
        document.documentElement.dataset.theme = 'light';
        document.documentElement.style.colorScheme = 'light';
      }
    })();
  `;
  const apiBases = [
    process.env.NEXT_PUBLIC_SHANNIAN_API_BASE,
    "https://ai.northcity.top",
    "https://waffo-webhook.chenxi19930623.workers.dev",
  ].filter((value): value is string => Boolean(value));

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Script id="shannian-api-config" strategy="beforeInteractive">
          {`window.SHANNIAN_API_BASES=${JSON.stringify(apiBases)};window.SHANNIAN_API_BASE=${JSON.stringify(apiBases[0])};`}
        </Script>
      </head>
      <body>
        <SiteProvider>
          <SiteShell>{children}</SiteShell>
        </SiteProvider>
      </body>
    </html>
  );
}
