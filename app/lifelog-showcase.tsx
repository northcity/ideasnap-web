"use client";

import Link from "next/link";
import { artwork } from "./artwork";
import { useSite } from "./site-context";
import { lifelogCopy } from "./lifelog-content";
import { LifeIcon } from "./lifelog-icons";

export default function LifeLogShowcase() {
  const { locale } = useSite();
  const copy = lifelogCopy[locale];
  return (
    <section className="life-promo" id="life-recorder">
      <div className="container">
        <div className="life-promo-shell">
          <div className="life-promo-copy">
            <span className="life-eyebrow">{copy.badge}</span>
            <h2>{copy.promoTitle}</h2>
            <p>{copy.promoLead}</p>
            <ul className="life-check-list">{copy.promoPoints.map(point => <li key={point}><LifeIcon name="check" /><span>{point}</span></li>)}</ul>
            <Link className="life-button life-button-primary" href="/lifelog/">{copy.more}<LifeIcon name="arrow" /></Link>
            <small className="life-promo-note">{copy.promoNote}</small>
          </div>
          <Link className="life-promo-art" href="/lifelog/" aria-label={copy.more}>
            <img src={artwork[locale].lifeRecorder} alt={copy.posterAlt} width="853" height="1844" loading="lazy" />
          </Link>
        </div>
      </div>
    </section>
  );
}
