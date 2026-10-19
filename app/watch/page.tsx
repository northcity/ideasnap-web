import type { Metadata } from "next";
import DetailPage from "../detail-page";
export const metadata: Metadata = { title: "Apple Watch 人生记录仪与快速录音｜闪念", description: "用闪念 Apple Watch 记录与标记重要时刻，在 iPhone 查看每日记录、时间轴回放和 AI 总结，也保留随手快速录音。", alternates: { canonical: "/watch" } };
export default function Page() { return <DetailPage page="watch" />; }
