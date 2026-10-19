"use client";

import { useEffect, useState, type AnchorHTMLAttributes } from "react";
import { detailPages, pageLabels, type Action, type PageKey } from "./content";
import { useSite } from "./site-context";
import CommercePricing from "./commerce-pricing";
import { resolveDownloadTarget, type DownloadTarget } from "./device-download";

function Link({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a href={href} {...props} />;
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M4 10h11M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ActionLink({ action, secondary = false }: { action: Action; secondary?: boolean }) {
  const className = secondary ? "button button-secondary" : "button button-primary";
  if (action.external || !action.href.startsWith("/")) {
    const opensWindow = action.href.startsWith("http");
    return (
      <a className={className} href={action.href} target={opensWindow ? "_blank" : undefined} rel={opensWindow ? "noreferrer" : undefined}>
        {action.label} <ArrowIcon />
      </a>
    );
  }
  return (
    <Link className={className} href={action.href}>
      {action.label} <ArrowIcon />
    </Link>
  );
}

export default function DetailPage({ page }: { page: PageKey }) {
  const { locale } = useSite();
  const copy = detailPages[locale][page];
  const labels = pageLabels[locale];
  const isDownload = page === "download";
  const [downloadTarget, setDownloadTarget] = useState<DownloadTarget | null>(null);

  useEffect(() => {
    if (!isDownload) return;
    let active = true;
    resolveDownloadTarget().then((target) => {
      if (active) setDownloadTarget(target);
    });
    return () => {
      active = false;
    };
  }, [isDownload]);

  return (
    <main className={`detail-page page-${page}`}>
      <section className="detail-hero">
        <div className="detail-hero-glow" />
        <div className="container detail-hero-grid">
          <div className="detail-hero-copy">
            <div className="breadcrumbs" aria-label={locale === "zh" ? "面包屑导航" : "Breadcrumbs"}>
              <Link href="/">{locale === "zh" ? "首页" : "Home"}</Link>
              <span>/</span>
              <span>{labels[page]}</span>
            </div>
            <span className="section-kicker">{copy.group}</span>
            <h1>{copy.title}</h1>
            <p>{copy.lead}</p>
            <div className="detail-hero-actions">
              {isDownload ? (
                <>
                  <a
                    className="button button-primary"
                    href={downloadTarget?.href || "#all-downloads"}
                    target={downloadTarget?.href.startsWith("http") ? "_blank" : undefined}
                    rel={downloadTarget?.href.startsWith("http") ? "noreferrer" : undefined}
                  >
                    {downloadTarget
                      ? downloadTarget.label[locale]
                      : (locale === "zh" ? "正在识别设备…" : "Detecting device…")} <ArrowIcon />
                  </a>
                  <a className="button button-secondary" href="#all-downloads">
                    {locale === "zh" ? "查看全部平台" : "All platforms"} <ArrowIcon />
                  </a>
                </>
              ) : (
                <>
                  <ActionLink action={copy.primary} />
                  {copy.secondary && <ActionLink action={copy.secondary} secondary />}
                </>
              )}
            </div>
            {isDownload && (
              <>
                <p className="download-detect-note" aria-live="polite">
                  {downloadTarget && downloadTarget.platform !== "unknown" ? (
                    <>
                      <span className="download-detect-main">
                        <span className="status-dot" />
                        <span>{locale === "zh" ? `已识别：${downloadTarget.device.zh}` : `Detected: ${downloadTarget.device.en}`}</span>
                      </span>
                      <span className="download-detect-hint">
                        {locale === "zh" ? "· 识别不准？在下方手动选择" : "· Wrong device? Choose below"}
                      </span>
                    </>
                  ) : (
                    <span>
                      {downloadTarget
                        ? (locale === "zh" ? "未识别到设备，请在下方选择对应版本" : "Device not detected. Choose your build below.")
                        : (locale === "zh" ? "正在识别你的设备…" : "Detecting your device…")}
                    </span>
                  )}
                </p>
                <ul className="download-platform-chips" aria-label={locale === "zh" ? "支持的平台" : "Supported platforms"}>
                  {["iPhone / iPad", "Apple Watch", "Android", "Windows", "macOS", "Linux"].map((platform) => (
                    <li key={platform}>{platform}</li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="detail-hero-media">
            <div className="detail-media-frame">
              <img src={copy.heroImage} alt={copy.heroAlt} width="1200" height="900" />
            </div>
            <div className="detail-media-note">
              <span className="status-dot" />
              <span>
                <small>{locale === "zh" ? "产品指南" : "Product guide"}</small>
                <strong>{labels[page]}</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="detail-overview">
        <div className="container detail-highlight-grid">
          {copy.highlights.map((item) => (
            <div className="detail-highlight" key={`${item.value}-${item.label}`}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {page === "pricing" && (
        <section className="section commerce-pricing-section" aria-label={locale === "zh" ? "Waffo 实时会员方案" : "Live Waffo membership plans"}>
          <div className="container">
            <CommercePricing locale={locale} />
          </div>
        </section>
      )}

      <section className="detail-body section" id={isDownload ? "all-downloads" : undefined}>
        <div className="container detail-body-grid">
          <aside className="detail-toc">
            <span>{locale === "zh" ? "本页内容" : "On this page"}</span>
            {copy.sections.map((section, index) => (
              <a href={`#${section.id}`} key={section.id}>
                <em>{String(index + 1).padStart(2, "0")}</em>
                {section.title}
              </a>
            ))}
          </aside>

          <div className="detail-sections">
            {copy.sections.map((section, index) => (
              <article className={`detail-section-card ${section.image ? "has-image" : ""}`} id={section.id} key={section.id}>
                <div className="detail-section-copy">
                  <span className="detail-section-index">{String(index + 1).padStart(2, "0")}</span>
                  {section.eyebrow && <span className="section-kicker">{section.eyebrow}</span>}
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                  {section.bullets && (
                    <ul className="detail-check-list">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}><i aria-hidden="true">✓</i>{bullet}</li>
                      ))}
                    </ul>
                  )}
                  {section.actions && (
                    <div className="detail-inline-actions">
                      {[...section.actions]
                        .sort((a, b) => {
                          if (!isDownload || !downloadTarget) return 0;
                          return a.href === downloadTarget.href ? -1 : b.href === downloadTarget.href ? 1 : 0;
                        })
                        .map((action) => {
                          const recommended = isDownload && downloadTarget?.href === action.href;
                          const badge = recommended ? (
                            <em className="download-recommend-badge">{locale === "zh" ? "推荐" : "Recommended"}</em>
                          ) : null;
                          return action.external || !action.href.startsWith("/") ? (
                            <a
                              href={action.href}
                              key={action.href}
                              className={recommended ? "is-recommended" : undefined}
                              target={action.href.startsWith("http") ? "_blank" : undefined}
                              rel={action.href.startsWith("http") ? "noreferrer" : undefined}
                            >
                              {badge}{action.label} <ArrowIcon />
                            </a>
                          ) : (
                            <Link href={action.href} key={action.href} className={recommended ? "is-recommended" : undefined}>
                              {badge}{action.label} <ArrowIcon />
                            </Link>
                          );
                        })}
                    </div>
                  )}
                </div>
                {section.image && (
                  <div className="detail-section-image">
                    <img src={section.image} alt={section.imageAlt || ""} width="1000" height="760" loading="lazy" />
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="related-section section">
        <div className="container">
          <div className="related-heading">
            <div>
              <span className="section-kicker">{locale === "zh" ? "继续了解" : "Explore next"}</span>
              <h2>{locale === "zh" ? "从一个入口，继续深入产品" : "Go deeper from here"}</h2>
            </div>
            <Link href="/">{locale === "zh" ? "返回首页" : "Back to home"} <ArrowIcon /></Link>
          </div>
          <div className="related-grid">
            {copy.related.map((key, index) => {
              const related = detailPages[locale][key];
              return (
                <Link className="related-card" href={`/${key}`} key={key}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{labels[key]}</h3>
                  <p>{related.lead}</p>
                  <em>{locale === "zh" ? "查看详情" : "View details"} <ArrowIcon /></em>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="detail-final-cta">
        <div className="container detail-final-inner">
          <div>
            <span>{locale === "zh" ? "从下一句开始" : "Start with the next sentence"}</span>
            <h2>{locale === "zh" ? "让灵感先留下来，再慢慢长成结果" : "Capture the thought first. Let it grow into an outcome."}</h2>
          </div>
          <Link className="button button-primary" href="/download">
            {locale === "zh" ? "下载闪念" : "Download IdeaSnap"} <ArrowIcon />
          </Link>
        </div>
      </section>
    </main>
  );
}
