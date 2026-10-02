const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const { mkdirSync } = require("node:fs");
const { join } = require("node:path");

const base = process.env.PREVIEW_URL || "http://localhost:3003";
const output = join(process.env.TEMP || process.cwd(), "novacore-margen-review");
mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined });
  const errors = [];
  try {
    const page = await browser.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    for (const width of [1440, 360]) {
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto(`${base}/margen`);
      assert.equal(response.status(), 200);
      await page.reload();
      await page.locator("#margen-heading").waitFor();
      await page.evaluate(async () => {
        for (const image of document.images) {
          image.loading = "eager";
          await image.decode();
        }
        await document.fonts.ready;
      });
      const checks = await page.evaluate(() => ({
        width: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        canonical: document.querySelector('link[rel="canonical"]').href,
        images: [...document.images].map(image => ({
          src: image.getAttribute("src"), alt: image.alt,
          loaded: image.complete && image.naturalWidth > 0,
          ratio: image.getBoundingClientRect().width / image.getBoundingClientRect().height,
          originalRatio: image.naturalWidth / image.naturalHeight,
        })),
        brokenAnchors: [...document.querySelectorAll('a[href^="#"]')]
          .filter(link => !document.getElementById(link.hash.slice(1))).map(link => link.hash),
        contact: [...document.querySelectorAll('a[href^="mailto:"]')].map(link => link.href),
        nav: [...document.querySelectorAll(".main-nav a")].map(link => link.getAttribute("href")),
      }));
      assert.equal(checks.documentWidth, width, "Horizontal overflow");
      assert.equal(checks.canonical, "https://novacoresystemssv.vercel.app/margen");
      assert.deepEqual(checks.brokenAnchors, []);
      assert(checks.images.every(image => image.loaded && image.alt));
      assert(checks.images.filter(image => image.src.includes("prototipo"))
        .every(image => Math.abs(image.ratio - image.originalRatio) < 0.01));
      assert(checks.contact.every(link => link === "mailto:mario.paz.software@gmail.com?subject=Consulta%20sobre%20Margen"));
      await page.screenshot({ path: join(output, `margen-${width}.png`), fullPage: true });
      await page.screenshot({ path: join(output, `margen-cover-${width}.png`) });
      await page.locator('#galeria').scrollIntoViewIfNeeded();
      await page.screenshot({ path: join(output, `margen-gallery-${width}.png`) });
      await page.locator('#preguntas details').nth(1).locator('summary').focus();
      await page.keyboard.press("Enter");
      assert(await page.locator('#preguntas details').nth(1).getAttribute("open") !== null);
      await page.locator('#preguntas details').nth(1).locator('summary').focus();
      await page.keyboard.press("Enter");
      if (width === 360) {
        await page.locator('.menu-button').focus();
        await page.keyboard.press("Enter");
        assert.equal(await page.locator('.menu-button').getAttribute("aria-expanded"), "true");
        await page.keyboard.press("Escape");
        assert.equal(await page.locator('.menu-button').getAttribute("aria-expanded"), "false");
        await page.locator('.menu-button').click();
        await page.locator('.main-nav a[href="/#soluciones"]').click();
        await page.waitForURL(`${base}/#soluciones`);
      } else {
        await page.goto(base);
      }
      await page.evaluate(() => localStorage.removeItem("novacore-language"));
      await page.reload();
      await page.locator('#margen').scrollIntoViewIfNeeded();
      await page.evaluate(async () => {
        for (const image of document.querySelectorAll('#margen img')) await image.decode();
        document.getElementById('margen').scrollIntoView({ block: 'start', behavior: 'instant' });
      });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
      const missingHomeAnchors = await page.evaluate(() => [...document.querySelectorAll('.main-nav a[href^="#"]')]
        .filter(link => !document.getElementById(link.hash.slice(1))).map(link => link.hash));
      assert.deepEqual(missingHomeAnchors, []);
      await page.screenshot({ path: join(output, `home-product-${width}.png`) });
      await page.locator('#language-select').selectOption('en');
      assert.equal(await page.locator('#margen').getAttribute('lang'), 'es-419');
      await page.locator('#margen a').click();
      await page.waitForURL(`${base}/margen`);
      console.log(JSON.stringify({ width, checks, navigation: "PASS", keyboard: "PASS" }));
    }
    assert.deepEqual(errors, [], "Browser console/page errors");
    console.log(`PASS: desktop/mobile, route reload, images, navigation, mailto, FAQ keyboard. Screenshots: ${output}`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
