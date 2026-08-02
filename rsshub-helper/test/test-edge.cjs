const { chromium } = require("wigolo/node_modules/playwright");
const fs = require("fs");

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  console.log("Connected to Edge browser via CDP 9222");

  const context = browser.contexts()[0] || await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://docs.rsshub.app/routes/cool18", {
    waitUntil: "networkidle",
    timeout: 30000,
  });
  await page.waitForTimeout(3000);

  const userScript = fs.readFileSync(
    "C:\\SoftwareGreen\\amuse\\web-scripts\\rsshub-helper\\dist\\rsshub-helper.user.js",
    "utf8"
  );
  const jsBody = userScript.replace(
    /^\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==\s*/,
    ""
  );

  console.log("Injecting userscript...");
  await page.evaluate(jsBody);
  await page.waitForTimeout(2000);

  const result = await page.evaluate(() => {
    const panel = document.querySelector(".rsshub-helper");
    if (!panel) return { exists: false };
    return {
      exists: true,
      display: getComputedStyle(panel).display,
      routeCards: panel.querySelectorAll(".rsshub-helper__route-card").length,
      emptyState: !!panel.querySelector(".rsshub-helper__empty"),
    };
  });
  console.log("Panel:", JSON.stringify(result));

  await page.screenshot({
    path: "C:\\SoftwareGreen\\amuse\\web-scripts\\rsshub-helper\\assets\\test-edge.png",
    fullPage: false,
  });
  console.log("Screenshot saved to assets/test-edge.png");

  await page.close();
  await browser.close();
})();
