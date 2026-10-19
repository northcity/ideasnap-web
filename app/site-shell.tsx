"use client";

import { useEffect, useRef, useState, type AnchorHTMLAttributes } from "react";
import { usePathname } from "next/navigation";
import { commonCopy } from "./content";
import { useSite } from "./site-context";
import { AccountButton, CommerceLayer } from "./commerce-ui";

function Link({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a href={href} {...props} />;
}

function ThemeIcon({ dark }: { dark: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dark ? (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
      ) : <path d="M20.7 13.2A8.6 8.6 0 0 1 10.8 3.3a8.6 8.6 0 1 0 9.9 9.9Z" />}
    </svg>
  );
}

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const { locale, theme, embed, toggleLocale, toggleTheme } = useSite();
  const copy = commonCopy[locale];
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [menuOpen]);

  // App 内嵌模式：只保留页面主体，页头页脚由客户端外壳提供
  if (embed) {
    return <>{children}</>;
  }

  return (
    <>
      <header
        className="site-header shell-polished-header"
        ref={headerRef}
        onKeyDown={(event) => {
          if (event.key === "Escape" && menuOpen) {
            setMenuOpen(false);
            menuButtonRef.current?.focus();
          }
        }}
      >
        <div className="header-inner">
          <Link className="brand" href="/" aria-label={locale === "zh" ? "闪念首页" : "IdeaSnap home"}>
            <img
              src="/assets/icons/Appicon.png"
              alt=""
              width="48"
              height="48"
            />
            <span>
              <strong>{copy.brand}</strong>
              <small>{copy.tagline}</small>
            </span>
          </Link>

          <div className={`shell-nav-panel${menuOpen ? " is-open" : ""}`} id="site-navigation">
            <nav className="shell-main-nav" aria-label={locale === "zh" ? "主导航" : "Main navigation"}>
              {copy.nav.map(([label, href]) => (
                <Link href={href} key={href} aria-current={pathname === href ? "page" : undefined} onClick={() => setMenuOpen(false)}>
                  {label}
                  <svg className="shell-mobile-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
                </Link>
              ))}
            </nav>

            <div className="shell-panel-controls">
              <div className="header-utilities">
                <button
                  className="utility-button theme-toggle"
                  type="button"
                  onClick={toggleTheme}
                  aria-label={theme === "dark" ? copy.themeLight : copy.themeDark}
                  title={theme === "dark" ? copy.themeLight : copy.themeDark}
                >
                  <ThemeIcon dark={theme === "dark"} />
                </button>
                <button
                  className="utility-button language-toggle"
                  type="button"
                  onClick={toggleLocale}
                  aria-label={copy.language}
                  title={copy.language}
                >
                  {locale === "zh" ? "EN" : "中"}
                </button>
              </div>
              <div className="shell-account">
                <AccountButton locale={locale} />
              </div>
            </div>
          </div>

          <Link className="header-cta" href="/download" onClick={() => setMenuOpen(false)}>
            {copy.download}
          </Link>
          <button
            className="shell-menu-toggle"
            ref={menuButtonRef}
            type="button"
            aria-label={menuOpen ? (locale === "zh" ? "收起导航菜单" : "Close navigation menu") : (locale === "zh" ? "展开导航菜单" : "Open navigation menu")}
            aria-controls="site-navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? <path d="m6 6 12 12M6 18 18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </header>

      {children}

      <footer className="site-footer shell-polished-footer" id="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand-block">
            <Link className="brand footer-logo" href="/">
              <img src="/assets/icons/Appicon.png" alt="" width="48" height="48" loading="lazy" />
              <span>
                <strong>{copy.brand}</strong>
                <small>{copy.tagline}</small>
              </span>
            </Link>
            <div className="shell-footer-thought">{locale === "zh" ? "让好想法，有迹可循。" : "Give every idea a place to stay."}</div>
            <p>{copy.footerNote}</p>
            <div className="footer-preferences">
              <button type="button" onClick={toggleTheme}>
                <ThemeIcon dark={theme === "dark"} />
                <span className="shell-visually-hidden">{locale === "zh" ? "切换到" : "Switch to "}</span>
                {theme === "dark" ? (locale === "zh" ? "浅色模式" : "light mode") : (locale === "zh" ? "深色模式" : "dark mode")}
              </button>
              <button type="button" onClick={toggleLocale}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 5h11M8.5 3v2M5 5c0 5 4 9 8 11M12 5c0 4-3 8-8 11m10-1 3-8 4 12m-6-4h5" /></svg>
                <span className="shell-visually-hidden">{locale === "zh" ? "切换到" : "Switch to "}</span>
                {locale === "zh" ? "English" : "中文"}
              </button>
            </div>
          </div>

          <div className="footer-directory">
            {copy.groups.map((group) => (
              <div className="footer-group" key={group.title}>
                <h4>{group.title}</h4>
                {group.links.map(([label, href]) =>
                  href.startsWith("/") ? (
                    <Link href={href} key={href}>{label}</Link>
                  ) : (
                    <a href={href} key={href} target="_blank" rel="noreferrer">{label}</a>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="container footer-bottom">
          <small>{copy.copyright}</small>
          <span>{locale === "zh" ? "由独立开发者北城打造" : "Built by indie developer Beicheng"}</span>
        </div>
      </footer>
      <CommerceLayer locale={locale} />
    </>
  );
}
