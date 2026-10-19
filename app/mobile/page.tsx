import type { Metadata } from "next";
import DetailPage from "../detail-page";
export const metadata: Metadata = { title: "手机端｜闪念 AI 语音笔记", description: "了解闪念手机端的语音记录、卡片浏览与跨端同步，以及 iPhone 配合 Apple Watch 使用的人生记录仪、时间轴回放与每日 AI 总结。", alternates: { canonical: "/mobile" } };
export default function Page() { return <DetailPage page="mobile" />; }
