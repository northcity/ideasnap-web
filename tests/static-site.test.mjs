import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const routes = [
  "features", "workflow", "pricing", "download", "mobile", "watch",
  "desktop", "integrations", "help", "about", "contact", "privacy", "terms", "lifelog",
];

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("exports the homepage and all 14 product and detail routes", async () => {
  const pages = await Promise.all([
    read("index.html"),
    ...routes.map((route) => read(`${route}/index.html`)),
  ]);
  assert.equal(pages.length, 15);
  for (const html of pages) {
    assert.match(html, /闪念|IdeaSnap/);
    assert.match(html, /ideasnap-theme/);
  }
});

test("keeps account, Waffo checkout, membership and payment-success wiring", async () => {
  const [home, pricing, success, commerce, successScript] = await Promise.all([
    read("index.html"),
    read("pricing/index.html"),
    read("waffo/success/index.html"),
    read("js/shannian-commerce.js"),
    read("js/waffo-success.js"),
  ]);
  assert.match(home, /id="account-trigger"/);
  assert.match(home, /data-plan-id="monthly"/);
  assert.match(pricing, /data-plan-id="lifetime_early_bird"/);
  assert.match(success, /payment-status/);
  assert.match(commerce, /\/api\/checkout/);
  assert.match(successScript, /\/api\/payments\/verify/);
  assert.match(commerce, /formatMembership/);
});

test("keeps the Notion OAuth callback and custom-scheme return", async () => {
  const callback = await read("notion/callback/index.html");
  assert.match(callback, /notion-callback/);
  assert.match(callback, /comchenxijiyisuipian:\/\//);
  assert.match(callback, /p\.get\("code"\)/);
  assert.match(callback, /p\.get\("state"\)/);
});

test("keeps GitHub Pages domain and no-Jekyll marker", async () => {
  assert.equal((await read("CNAME")).trim(), "ideasnap.xyz");
  await read(".nojekyll");
});
