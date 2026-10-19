"use client";

import { useEffect, useState, type AnchorHTMLAttributes } from "react";
import { homeCopy } from "./content";
import CommercePricing from "./commerce-pricing";
import { useSite } from "./site-context";

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

function detectPlatform(): PlatformKey {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("android")) return "android";
  if (ua.includes("iphone") || ua.includes("ipad")) return "ios";
  if (ua.includes("windows")) return "windows";
  if (ua.includes("mac")) return "macos";
  if (ua.includes("linux")) return "linux";
  return "ios";
}

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

export default function Home() {
  const { locale } = useSite();
  const copy = homeCopy[locale];
  const [platform, setPlatform] = useState<PlatformKey>("ios");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setPlatform(detectPlatform()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const recommended = platformData[platform];
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
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="hero" id="top">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" />{copy.eyebrow}</div>
            <h1>
              <span className="hero-title-main">{copy.titleMain}</span>
              <span className="hero-title-accent">{copy.titleAccent}</span>
            </h1>
            <p className="hero-description">{copy.description}</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/download">{copy.download} <ArrowIcon /></Link>
              <Link className="button button-secondary" href="/features">{copy.learn}</Link>
            </div>
            <div className="proof-strip" aria-label={locale === "zh" ? "产品荣誉" : "Product recognition"}>
              {copy.proof.map((item, index) => (
                <span className="proof-item" key={item}>{index > 0 && <i />}{item}</span>
              ))}
            </div>
          </div>

          <Link className="hero-visual" href="/workflow" aria-label={locale === "zh" ? "查看闪念完整工作流" : "View the complete IdeaSnap workflow"}>
            <div className="hero-image-wrap">
              <img className="hero-image" src="https://ideasnap.xyz/assets/showcase/platform-hero.webp" alt={locale === "zh" ? "闪念在 Apple Watch、手机与电脑上的真实界面" : "IdeaSnap on Apple Watch, mobile, and desktop"} width="1536" height="1024" />
              <div className="result-card result-card-top">
                <span className="result-icon">AI</span>
                <span><small>{copy.aiDone}</small><strong>{copy.aiResult}</strong></span>
              </div>
              <div className="result-card result-card-bottom">
                <span className="status-dot" />
                <span><small>{copy.sync}</small><strong>{copy.updated}</strong></span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="output-section section" id="features">
        <div className="container">
          <div className="section-heading centered">
            <span className="section-kicker">{copy.featureKicker}</span>
            <h2>{copy.featureTitle}</h2>
            <p>{copy.featureLead}</p>
          </div>
          <div className="output-grid">
            <Link className="output-card note-output" href="/features#capture">
              <div className="card-label">{copy.features[0][0]}</div>
              <h3>{copy.features[0][1]}</h3>
              <div className="note-paper" aria-hidden="true">
                <div className="paper-heading" /><div className="paper-line line-long" /><div className="paper-line" /><div className="paper-line line-short" />
              </div>
              <p>{copy.features[0][2]}</p>
              <em className="card-link">{locale === "zh" ? "了解详情" : "Learn more"} <ArrowIcon /></em>
            </Link>
            <Link className="output-card task-output" href="/features#organize">
              <div className="card-label">{copy.features[1][0]}</div>
              <h3>{copy.features[1][1]}</h3>
              <div className="task-list">
                <span><CheckIcon />{locale === "zh" ? "整理会议结论" : "Organize decisions"}</span>
                <span><CheckIcon />{locale === "zh" ? "周五前发送方案" : "Send proposal by Friday"}</span>
                <span><CheckIcon />{locale === "zh" ? "同步到提醒事项" : "Keep the next step"}</span>
              </div>
              <p>{copy.features[1][2]}</p>
              <em className="card-link">{locale === "zh" ? "了解详情" : "Learn more"} <ArrowIcon /></em>
            </Link>
            <Link className="output-card structure-output" href="/features#retrieve">
              <div className="card-label">{copy.features[2][0]}</div>
              <h3>{copy.features[2][1]}</h3>
              <div className="tag-cloud">
                {(locale === "zh" ? ["产品想法", "灵感", "工作", "待跟进"] : ["Product", "Idea", "Work", "Follow-up"]).map((tag) => <span key={tag}>{tag}</span>)}
              </div>
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
              <div className="visual-topbar"><span className="visual-platform-label">{copy.mobile}</span><span className="visual-live"><i />{copy.multiSync}</span></div>
              <div className="visual-orbit mobile-orbit-one" /><div className="visual-orbit mobile-orbit-two" />
              <div className="mobile-device-wrap"><img src="https://ideasnap.xyz/assets/showcase/mobile-device-ios.webp" alt={locale === "zh" ? "闪念 iOS 端真实笔记界面" : "IdeaSnap iOS notes"} width="1122" height="1402" loading="lazy" /></div>
              <div className="floating-status mobile-status-one"><span className="recording-mark"><i /><i /><i /></span><span><small>{copy.voiceNote}</small><strong>{copy.captured}</strong></span></div>
              <div className="floating-status mobile-status-two"><span className="ai-mark">AI</span><span><small>{copy.autoOrganize}</small><strong>{copy.generated}</strong></span></div>
              <div className="visual-footer"><span><strong>{copy.phoneWatch}</strong><small>{copy.mobileLine}</small></span><span className="footer-symbol microphone-symbol"><i /></span></div>
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
              <div className="visual-topbar"><span className="visual-platform-label">{copy.desktop}</span><span className="window-controls" aria-hidden="true"><i /><i /><i /></span></div>
              <div className="desktop-grid-pattern" />
              <div className="desktop-device-wrap"><img src="https://ideasnap.xyz/assets/showcase/windows-illustration.webp" alt={locale === "zh" ? "闪念桌面端真实笔记整理界面" : "IdeaSnap desktop notes"} width="1500" height="1000" loading="lazy" /></div>
              <div className="floating-status desktop-status-one"><span className="check-mark"><CheckIcon /></span><span><small>{copy.aiOrganized}</small><strong>{copy.tasks}</strong></span></div>
              <div className="desktop-tags" aria-label={locale === "zh" ? "自动添加的标签" : "Automatically added tags"}>{copy.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              <div className="visual-footer"><span><strong>{copy.desktop}</strong><small>{copy.desktopLine}</small></span><span className="footer-symbol desktop-symbol"><i /><i /></span></div>
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
                <article><span className="scenario-index">{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{body}</p><em className="card-link">{locale === "zh" ? "查看使用方法" : "See the workflow"} <ArrowIcon /></em></article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="download-section section" id="download">
        <div className="container download-shell">
          <div className="download-copy">
            <span className="section-kicker light-kicker">{copy.downloadKicker}</span>
            <h2>{copy.downloadTitle}</h2>
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
              <div><h3>{locale === "zh" ? recommended.zh : recommended.en}</h3><p>{locale === "zh" ? "查看官方安装包、版本与首次安装说明" : "Official package, version, and first-launch guidance"}</p></div>
            </div>
            <Link className="button download-button" href={`/download#${recommended.section}`}>{copy.downloadDetails} <ArrowIcon /></Link>
            <small>{locale === "zh" ? "当前版本 1.0.36 · 支持全平台同步" : "Current version 1.0.36 · Cross-platform sync"}</small>
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
              return <Link href={hrefs[index]} key={title}><article><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{body}</p></div></article></Link>;
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
