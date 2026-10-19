"use client";

import Link from "next/link";
import { externalLinks } from "./content";
import { lifelogCopy } from "./lifelog-content";
import { LifeIcon, type LifeIconName } from "./lifelog-icons";
import { useSite } from "./site-context";

export default function LifeLogPage() {
  const { locale } = useSite();
  const copy = lifelogCopy[locale];
  return (
    <main className="life-page">
      <section className="life-hero">
        <div className="life-container life-hero-grid">
          <div className="life-hero-copy">
            <div className="life-breadcrumbs"><Link href="/">{locale === "zh" ? "首页" : "Home"}</Link><span aria-hidden="true">/</span><span>{copy.name}</span></div>
            <span className="life-eyebrow">{copy.badge}</span>
            <h1>{copy.title.map(line => <span key={line}>{line}</span>)}</h1>
            <p className="life-lead">{copy.intro}</p>
            <div className="life-actions"><a className="life-button life-button-primary" href={externalLinks.appStore} target="_blank" rel="noreferrer">{copy.download}<LifeIcon name="arrow" /></a><a className="life-button life-button-secondary" href="#get-started">{copy.how}</a></div>
            <dl className="life-facts">{copy.facts.map(([value,label]) => <div key={value}><dt>{value}</dt><dd>{label}</dd></div>)}</dl>
            <p className="life-duration-note">{copy.durationNote}</p>
          </div>
          <figure className="life-hero-art"><img src="/assets/lifelog/watch-life-recorder.webp" alt={copy.posterAlt} width="853" height="1844" fetchPriority="high" /></figure>
        </div>
      </section>

      <section className="life-section life-features">
        <div className="life-container">
          <div className="life-section-heading"><span className="life-eyebrow">{copy.featuresKicker}</span><h2>{copy.featuresTitle}</h2></div>
          <div className="life-feature-grid">{copy.features.map(feature => <article className="life-feature" key={feature.title}><span className="life-feature-icon"><LifeIcon name={feature.icon as LifeIconName} /></span><h3>{feature.title}</h3><p>{feature.body}</p></article>)}</div>
        </div>
      </section>

      <section className="life-section life-example-section">
        <div className="life-container">
          <div className="life-section-heading"><span className="life-eyebrow">{copy.exampleKicker}</span><h2>{copy.exampleTitle}</h2><p>{copy.exampleLead}</p></div>
          <div className="life-example-grid">
            <ol className="life-timeline">{copy.timeline.map(([time,title,body]) => <li key={time}><time>{time}</time><div><div className="life-moment-heading"><h3>{title}</h3><span><LifeIcon name="bookmark" />{copy.marked}</span></div><p>{body}</p></div></li>)}</ol>
            <article className="life-recap"><div className="life-recap-label"><LifeIcon name="spark" /><span>{copy.recapLabel}</span></div><h3>{copy.recapTitle}</h3><p>{copy.recapBody}</p><span className="life-next-label">{copy.nextLabel}</span><div className="life-next-task"><span aria-hidden="true" /><p>{copy.nextTask}</p></div></article>
          </div>
        </div>
      </section>

      <section className="life-section" id="get-started">
        <div className="life-container">
          <div className="life-section-heading"><span className="life-eyebrow">{copy.howKicker}</span><h2>{copy.howTitle}</h2></div>
          <ol className="life-steps">{copy.steps.map(([title,body],index) => <li key={title}><span className="life-step-number">{String(index+1).padStart(2,"0")}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol>
        </div>
      </section>

      <section className="life-section life-faq-section">
        <div className="life-container life-faq-grid"><h2>{copy.faqTitle}</h2><div className="life-faqs">{copy.faqs.map(([question,answer]) => <details key={question}><summary><span>{question}</span><svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><path d="m5 8 5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></summary><p>{answer}</p></details>)}</div></div>
      </section>

      <section className="life-final"><div className="life-container"><span className="life-eyebrow">{copy.name}</span><h2>{copy.finalTitle}</h2><p>{copy.finalLead}</p><div className="life-actions"><a className="life-button life-button-primary" href={externalLinks.appStore} target="_blank" rel="noreferrer">{copy.download}<LifeIcon name="arrow" /></a><Link className="life-button life-button-secondary" href="/pricing/#pricing-plans">{copy.membership}</Link></div></div></section>
    </main>
  );
}
