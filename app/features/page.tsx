import type { Metadata } from "next";
import DetailPage from "../detail-page";
export const metadata: Metadata = { title: "功能总览｜闪念 AI 语音笔记", description: "了解闪念的语音捕捉、AI 转写与总结、多端整理，以及 Apple Watch + iPhone 人生记录仪的每日记录与回顾。", alternates: { canonical: "/features" } };
export default function Page() { return <DetailPage page="features" />; }
