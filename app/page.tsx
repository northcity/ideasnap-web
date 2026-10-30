"use client";

import { useEffect, useRef, useState, type AnchorHTMLAttributes } from "react";
import { homeCopy } from "./content";
import CommercePricing from "./commerce-pricing";
import LifeLogShowcase from "./lifelog-showcase";
import { artwork } from "./artwork";
import { useSite } from "./site-context";
import { resolveDownloadTarget, type DownloadTarget } from "./device-download";

function Link({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a href={href} {...props} />;
}

type PlatformKey = "ios" | "android" | "windows" | "macos" | "linux";

const platformData: Record<PlatformKey, { icon: string; zh: string; en: string; section: string }> = {
  ios: { icon: "https://ideasnap.xyz/assets/icons/apple.png", zh: "iPhone、iPad 与 Apple Watch", en: "iPhone, iPad & Apple Watch", section: "mobile-packages" },
  android: { icon: "https://ideasnap.xyz/assets/icons/android.png", zh: "Android", en: "Android", section: "mobile-packages" },
  windows: { icon: "https://ideasnap.xyz/assets/icons/windows.png", zh: "Windows", en: "Windows", section: "desktop-packages" },
  macos: { icon: "https://ideasnap.xyz/assets/icons/apple.png", zh: "macOS", en: "macOS", section: "desktop-packages" },
  linux: { icon: "https://ideasnap.xyz/assets/icons/linux.png", zh: "Linux", en: "Linux", section: "desktop-packages" },
};

const platformOrder: PlatformKey[] = ["ios", "android", "windows", "macos", "linux"];

const targetFamily: Record<DownloadTarget["platform"], PlatformKey> = {
  ios: "ios",
  android: "android",
  windows: "windows",
  "macos-arm64": "macos",
  "macos-x64": "macos",
  macos: "macos",
  linux: "linux",
  unknown: "ios",
};

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M4 10h11M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="m5 10 3.1 3L15 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DiagonalArrowIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><path d="m5 5 10 10M6 15h9V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function FeatureIcon({ kind }: { kind: "voice" | "note" | "spark" | "meeting" | "watch" | "reading" | "writing" }) {
  const paths = {
    voice: <><rect x="8" y="3" width="8" height="12" rx="4" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" /></>,
    note: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h5" /></>,
    spark: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z" /></>,
    meeting: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    watch: <><rect x="6" y="6" width="12" height="12" rx="4" /><path d="m9 6 1-4h4l1 4m-6 12 1 4h4l1-4M12 9v3l2 1" /></>,
    reading: <><path d="M12 5v16M3 3h4a5 5 0 0 1 5 3 5 5 0 0 1 5-3h4v16h-4a5 5 0 0 0-5 2 5 5 0 0 0-5-2H3z" /></>,
    writing: <><path d="m16 3 5 5L9 20l-6 1 1-6zM14 5l5 5M3 21h18" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{paths[kind]}</svg>;
}

const examples = {
  zh: [
    { label: "一闪而过的灵感", title: "让记录更顺手", transcript: "刚想到，首页可以加一个快速录音的入口。用户一打开就能直接说，不用先想放在哪个分类里。这个想法下次做原型时试一下。", summary: "在首页增加快速录音入口，减少记录前的操作。先捕捉想法，再整理分类。", tasks: ["下次制作原型时验证快速录音入口"], tags: ["产品灵感", "交互设计"] },
    { label: "刚结束的会议", title: "周会重点与下一步", transcript: "今天大家对新版方向没有异议，先把录音和搜索的体验做好。周五前整理一版原型，下周一找团队一起评审。", summary: "团队确认新版方向，优先优化录音与搜索体验。", tasks: ["周五前完成新版原型", "下周一组织团队评审"], tags: ["周会", "产品迭代"] },
    { label: "突然想起的待办", title: "把想到的事，接着做", transcript: "别忘了把今天的会议结论整理一下。还有，明天下午要把方案发给同事，周末再读完那本书。", summary: "整理会议结论，发送方案，并继续本周的阅读计划。", tasks: ["整理今天的会议结论", "明天下午发送方案给同事", "周末读完正在看的书"], tags: ["工作", "生活"] },
  ],
  en: [
    { label: "A passing idea", title: "Make capture feel effortless", transcript: "What if we put a quick recording shortcut on the home screen? People could start speaking without choosing a category first. Let's try that in the next prototype.", summary: "Add quick recording to the home screen. Capture the thought first and organize it later.", tasks: ["Try the quick recording shortcut in the next prototype"], tags: ["Product ideas", "Interaction"] },
    { label: "A meeting recap", title: "This week's decisions", transcript: "Everyone agrees on the new direction. Let's focus on recording and search first, finish a prototype by Friday, and review it together next Monday.", summary: "The team agreed on the new direction, prioritizing recording and search.", tasks: ["Finish the prototype by Friday", "Schedule the team review for Monday"], tags: ["Team meeting", "Product"] },
    { label: "A task to remember", title: "Turn a thought into a next step", transcript: "I need to write up today's meeting, send the proposal to my colleague tomorrow afternoon, and finish that book over the weekend.", summary: "Capture the meeting decisions, send the proposal, and continue the reading plan.", tasks: ["Write up today's meeting", "Send the proposal tomorrow afternoon", "Finish the book this weekend"], tags: ["Work", "Life"] },
  ],
};

export default function Home() {
  const { locale } = useSite();
  const copy = homeCopy[locale];
  const visuals = artwork[locale];
  const [downloadTarget, setDownloadTarget] = useState<DownloadTarget | null>(null);
  const [activeExample, setActiveExample] = useState(0);
  const exampleTabs = useRef<(HTMLButtonElement | null)[]>([]);
  const example = examples[locale][activeExample];

  useEffect(() => {
    let active = true;
    resolveDownloadTarget().then((target) => {
      if (active) setDownloadTarget(target);
    });
    return () => {
      active = false;
    };
  }, []);

  const detected = downloadTarget && downloadTarget.platform !== "unknown" ? downloadTarget : null;
  const recommended = platformData[detected ? targetFamily[detected.platform] : "ios"];
  const recommendedTitle = detected ? detected.device[locale] : (locale === "zh" ? recommended.zh : recommended.en);
  const recommendedHref = detected ? detected.href : `/download#${recommended.section}`;
  const recommendedExternal = recommendedHref.startsWith("http");
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: locale === "zh" ? "闪念 AI 语音笔记" : "IdeaSnap AI Voice Notes",
    operatingSystem: "Apple Watch, iOS, iPadOS, Android, Windows, macOS, Linux",
    applicationCategory: "ProductivityApplication",
    description: copy.description,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "CNY",
      offerCount: "3",
      url: "https://ideasnap.xyz/pricing/",
    },
  };

  return (
    <main className="home-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="hero" id="top">
        <div className="container hero-grid">
          <div className="hero-copy">
            <Link className="eyebrow life-announcement" href="/lifelog/"><span className="eyebrow-ring" />{locale === "zh" ? "新功能 · Apple Watch 人生记录仪" : "NEW · LIFE RECORDER FOR APPLE WATCH"}<ArrowIcon /></Link>
            <h1>
              <span className="hero-title-main">{copy.titleMain}</span>
              <span className="hero-title-accent">{locale === "zh" ? "让灵感，自然成形。" : "Let the thought take shape."}</span>
            </h1>
            <p className="hero-description">{locale === "zh" ? "不必停下来打字，也不用急着整理。说出你的想法，闪念会把它变成清晰的笔记和下一步。" : "No need to stop and type, or organize as you go. Say what's on your mind. IdeaSnap turns it into a clear note and a next step."}</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/download">{copy.download} <ArrowIcon /></Link>
              <Link className="button button-secondary" href="#try-it">{locale === "zh" ? "看看怎么整理" : "See it in action"} <DiagonalArrowIcon /></Link>
            </div>
            <div className="proof-strip" aria-label={locale === "zh" ? "产品荣誉" : "Product recognition"}>
              {copy.proof.map((item, index) => (
                <span className="proof-item" key={item}>{index > 0 && <i />}{item}</span>
              ))}
            </div>
          </div>

          <Link className="hero-visual" href="/workflow" aria-label={locale === "zh" ? "查看闪念完整工作流" : "View the complete IdeaSnap workflow"}>
            <div className="hero-image-wrap">
              <img className="hero-image" src={visuals.platformHero} alt={locale === "zh" ? "闪念在 Apple Watch、手机与电脑上的产品示意图" : "IdeaSnap product illustration on Apple Watch, mobile, and desktop"} width="1536" height="1024" fetchPriority="high" />
            </div>
          </Link>
          <div className="hero-platforms"><span>{locale === "zh" ? "每台设备，都接得住灵感" : "Your thought, on every device"}</span><div>Apple Watch <i /> iOS <i /> Android <i /> macOS <i /> Windows <i /> Linux</div></div>
        </div>
      </section>

      <LifeLogShowcase />

      <section className="thought-demo section" id="try-it">
        <div className="container">
          <div className="section-heading centered"><span className="section-kicker">{locale === "zh" ? "从一句话，到一份好笔记" : "FROM A THOUGHT TO A CLEAR NOTE"}</span><h2>{locale === "zh" ? "你只管说，闪念帮你理清。" : "You speak. IdeaSnap brings clarity."}</h2><p>{locale === "zh" ? "想法不需要一开始就很有条理。先留下来，剩下的慢慢展开。" : "A thought doesn't have to arrive neatly organized. Capture it first. Build on it later."}</p></div>
          <div className="example-tabs" role="tablist" aria-label={locale === "zh" ? "选择整理示例" : "Choose an organization example"}>
            {examples[locale].map((item, index) => <button type="button" role="tab" id={`example-tab-${index}`} aria-selected={activeExample === index} aria-controls="example-panel" tabIndex={activeExample === index ? 0 : -1} ref={(element) => { exampleTabs.current[index] = element; }} key={index} onClick={() => setActiveExample(index)} onKeyDown={(event) => {
              let next = activeExample;
              if (event.key === "ArrowRight") next = (index + 1) % 3;
              else if (event.key === "ArrowLeft") next = (index + 2) % 3;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = 2;
              else return;
              event.preventDefault(); setActiveExample(next); exampleTabs.current[next]?.focus();
            }}>{item.label}</button>)}
          </div>
          <div className="example-panel" role="tabpanel" id="example-panel" aria-labelledby={`example-tab-${activeExample}`} tabIndex={0}>
            <div className="example-source"><div className="example-label"><FeatureIcon kind="voice" /><span>{locale === "zh" ? "随口说下来的想法" : "JUST AS YOU SAID IT"}</span></div><blockquote>“{example.transcript}”</blockquote><div className="example-wave" aria-hidden="true">{[12,20,30,18,40,26,48,34,18,42,58,30,42,22,50,34,20,38,24,44,30,16,34,24,12].map((height,index) => <i key={index} style={{height}} />)}</div><small>{locale === "zh" ? "语音整理示例" : "Illustrative voice note"}</small></div>
            <div className="example-result" aria-live="polite"><div className="example-label"><FeatureIcon kind="spark" /><span>{locale === "zh" ? "闪念整理后" : "ORGANIZED WITH IDEASNAP"}</span><span className="example-done"><CheckIcon />{locale === "zh" ? "清晰了" : "Ready"}</span></div><h3>{example.title}</h3><p>{example.summary}</p><span className="example-task-label">{locale === "zh" ? "接下来可以做" : "YOUR NEXT STEPS"}</span><ul>{example.tasks.map(task=><li key={task}><span className="example-checkbox" />{task}</li>)}</ul><div className="example-tags">{example.tags.map(tag=><span key={tag}># {tag}</span>)}</div></div>
          </div>
        </div>
      </section>

      <section className="output-section section" id="features">
        <div className="container">
          <div className="outcome-grid">
            <Link className="outcome-card" href="/features#capture">
              <div className="outcome-heading"><span className="feature-symbol"><FeatureIcon kind="note" /></span><span className="outcome-label">{copy.features[0][0]}</span></div>
              <h3>{copy.features[0][1]}</h3>
              <p>{copy.features[0][2]}</p>
              <em className="card-link">{locale === "zh" ? "了解详情" : "Learn more"} <ArrowIcon /></em>
            </Link>
            <Link className="outcome-card" href="/features#organize">
              <div className="outcome-heading"><span className="feature-symbol"><CheckIcon /></span><span className="outcome-label">{copy.features[1][0]}</span></div>
              <h3>{copy.features[1][1]}</h3>
              <p>{copy.features[1][2]}</p>
              <em className="card-link">{locale === "zh" ? "了解详情" : "Learn more"} <ArrowIcon /></em>
            </Link>
            <Link className="outcome-card" href="/features#retrieve">
              <div className="outcome-heading"><span className="feature-symbol"><FeatureIcon kind="spark" /></span><span className="outcome-label">{copy.features[2][0]}</span></div>
              <h3>{copy.features[2][1]}</h3>
              <p>{copy.features[2][2]}</p>
              <em className="card-link">{locale === "zh" ? "了解详情" : "Learn more"} <ArrowIcon /></em>
            </Link>
          </div>
        </div>
      </section>

      <section className="workflow-section section" id="workflow">
        <div className="container">
          <div className="section-heading split-heading">
            <div><span className="section-kicker">{copy.workflowKicker}</span><h2>{copy.workflowTitle}</h2></div>
            <p>{copy.workflowLead}</p>
          </div>
          <div className="workflow-grid">
            <Link className="workflow-visual mobile-visual" href="/mobile">
              <div className="device-story"><span className="section-kicker">{copy.phoneWatch}</span><h3>{locale === "zh" ? "灵感来了，随时说。" : "A thought arrives. You're ready."}</h3><p>{locale === "zh" ? "走路、通勤或睡前，抬腕或打开手机，就能把当下的想法留住。" : "On a walk, on your commute, or before bed. Raise your wrist or open your phone and capture the moment."}</p><span className="card-link">{locale === "zh" ? "了解移动端" : "Explore mobile"} <ArrowIcon /></span></div>
              <div className="mobile-device-wrap"><img src={visuals.mobileIOS} alt={locale === "zh" ? "闪念 iOS 端笔记产品示意图" : "IdeaSnap iOS notes product illustration"} width="1122" height="1402" loading="lazy" /></div>
              <div className="watch-companion"><img src={visuals.watchRecorder} alt={locale === "zh" ? "闪念手表录音示意图" : "IdeaSnap Watch recording illustration"} width="1536" height="1024" loading="lazy" /></div>
            </Link>

            <div className="workflow-steps">
              {copy.workflowSteps.map(([title, body], index) => {
                const ids = ["quick-start", "ai-process", "desktop-finish"];
                return (
                  <Link className="workflow-step-link" href={`/workflow#${ids[index]}`} key={title}>
                    <article><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{body}</p></div></article>
                  </Link>
                );
              })}
            </div>

            <Link className="workflow-visual desktop-visual" href="/desktop">
              <div className="device-story"><span className="section-kicker">Windows / macOS / Linux</span><h3>{locale === "zh" ? "回到电脑，接着展开。" : "Back at your desk. Keep going."}</h3><p>{locale === "zh" ? "在更大的屏幕上编辑、搜索与归档。零碎的输入，也能成为长期的积累。" : "Edit, search, and organize on a bigger screen. Let the small fragments grow into lasting knowledge."}</p><span className="card-link">{locale === "zh" ? "了解桌面端" : "Explore desktop"} <ArrowIcon /></span></div>
              <div className="desktop-device-wrap"><img src={visuals.desktopWindows} alt={locale === "zh" ? "闪念桌面端笔记整理产品示意图" : "IdeaSnap desktop notes product illustration"} width="1536" height="1024" loading="lazy" /></div>
            </Link>
          </div>
        </div>
      </section>

      <section className="scenarios section" id="scenarios">
        <div className="container">
          <div className="section-heading centered compact-heading"><span className="section-kicker">{copy.scenarioKicker}</span><h2>{copy.scenarioTitle}</h2></div>
          <div className="scenario-grid">
            {copy.scenarios.map(([title, body, anchor], index) => (
              <Link href={`/workflow#${anchor === "watch" ? "quick-start" : "scenarios"}`} key={title}>
                <article><span className="scenario-symbol"><FeatureIcon kind={(["meeting", "watch", "reading", "writing"] as const)[index]} /></span><h3>{title}</h3><p>{body}</p><em className="card-link">{locale === "zh" ? "查看使用方法" : "See the workflow"} <ArrowIcon /></em></article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="download-section section" id="download">
        <div className="container download-shell">
          <div className="download-copy">
            <span className="section-kicker light-kicker">{copy.downloadKicker}</span>
            <h2>{locale === "zh" ? <><span>一个闪念账号，</span><span>覆盖你的所有设备</span></> : copy.downloadTitle}</h2>
            <p>{copy.downloadLead}</p>
            <div className="platform-icons" aria-label={locale === "zh" ? "支持的平台" : "Supported platforms"}>
              {platformOrder.map((key) => (
                <Link key={key} href={`/download#${platformData[key].section}`} title={locale === "zh" ? platformData[key].zh : platformData[key].en}>
                  <img src={platformData[key].icon} alt="" width="28" height="28" />
                </Link>
              ))}
            </div>
          </div>
          <div className="recommended-download">
            <div className="recommended-tag"><span className="status-dot" />{locale === "zh" ? "为当前设备推荐" : "Recommended for this device"}</div>
            <div className="recommended-product">
              <img src={recommended.icon} alt="" width="52" height="52" />
              <div>
                <h3>{recommendedTitle}</h3>
                <p>{detected
                  ? (locale === "zh" ? "已按当前设备匹配官方安装包" : "Official package matched to this device")
                  : (locale === "zh" ? "查看官方安装包、版本与首次安装说明" : "Official package, version, and first-launch guidance")}</p>
              </div>
            </div>
            <Link
              className="button download-button"
              href={recommendedHref}
              target={recommendedExternal ? "_blank" : undefined}
              rel={recommendedExternal ? "noreferrer" : undefined}
            >
              {detected ? (locale === "zh" ? "下载当前设备版本" : "Download for this device") : copy.downloadDetails} <ArrowIcon />
            </Link>
            <small>{locale === "zh" ? "当前版本 1.0.39 · 支持全平台同步" : "Current version 1.0.39 · Cross-platform sync"}</small>
          </div>
        </div>
      </section>

      <section className="pricing-section section" id="pricing">
        <div className="container">
          <div className="section-heading centered"><span className="section-kicker">{copy.pricingKicker}</span><h2>{copy.pricingTitle}</h2><p>{copy.pricingLead}</p></div>
          <CommercePricing locale={locale} />
        </div>
      </section>

      <section className="trust-section section">
        <div className="container trust-grid">
          <div className="trust-copy">
            <span className="section-kicker">{copy.trustKicker}</span><h2>{copy.trustTitle}</h2><p>{copy.trustLead}</p>
            <Link href="/privacy">{copy.privacy} <ArrowIcon /></Link>
          </div>
          <div className="trust-points">
            {copy.trustPoints.map(([title, body], index) => {
              const hrefs = ["/about", "/privacy", "/integrations"];
              return <Link href={hrefs[index]} key={title}><article><span><CheckIcon /></span><div><h3>{title}</h3><p>{body}</p></div></article></Link>;
            })}
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="container final-cta-inner">
          <img src="https://ideasnap.xyz/assets/icons/Appicon.png" alt={locale === "zh" ? "闪念" : "IdeaSnap"} width="76" height="76" loading="lazy" />
          <div><span>{copy.finalLabel}</span><h2>{copy.finalTitle}</h2><p>{copy.finalLead}</p></div>
          <Link className="button button-primary" href="/download">{copy.download} <ArrowIcon /></Link>
        </div>
      </section>
    </main>
  );
}
