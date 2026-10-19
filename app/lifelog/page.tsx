import type { Metadata } from "next";
import LifeLogPage from "../lifelog-page";

export const metadata: Metadata = {
  title: "人生记录仪｜Apple Watch 录音与 iPhone 每日回顾｜闪念",
  description: "Apple Watch 主动开启长时间录音、标记重要时刻，分段同步到 iPhone。每天一篇记录，支持时间轴回放、搜索转录、AI 每日总结与本地转录。闪念 6.1 iOS 版会员功能。",
  alternates: { canonical: "/lifelog/" },
  openGraph: {
    title: "Apple Watch，你的人生记录仪｜闪念",
    description: "手表留住当下，iPhone 帮你慢慢回顾。了解人生记录仪的标记、每日记录、时间轴回放与 AI 总结。",
    url: "/lifelog/",
    images: [{ url: "/assets/lifelog/watch-life-recorder.webp", width: 853, height: 1844, alt: "闪念 Apple Watch 人生记录仪" }],
  },
};

export default function Page() { return <LifeLogPage />; }
