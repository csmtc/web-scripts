const { chromium } = require("wigolo/node_modules/playwright");
const fs = require("fs");
const path = require("path");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Load the saved HTML file (no network needed)
  const htmlPath = "file:///" + path.resolve("C:\\SoftwareGreen\\amuse\\web-scripts\\rsshub-helper\\assets\\RSSHub.html").replace(/\\/g, "/");
  console.log("Loading saved HTML:", htmlPath);
  await page.goto(htmlPath, { waitUntil: "domcontentloaded", timeout: 15000 });

  // Wait a moment for any scripts to run
  await page.waitForTimeout(1000);

  // Check DOM state
  const routeCount = await page.evaluate(() => document.querySelectorAll(".route-block").length);
  console.log("Route blocks on page:", routeCount);

  const pathCode = await page.evaluate(() => {
    const el = document.querySelector(".route-block p.path code");
    return el ? el.textContent : "NOT FOUND";
  });
  console.log("Route path code:", pathCode);

  const paramCount = await page.evaluate(() => document.querySelectorAll("li.params").length);
  console.log("Param items:", paramCount);

  // Read and inject the userscript
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
  await page.waitForTimeout(1500);

  // Check panel
  const panelInfo = await page.evaluate(() => {
    const panel = document.querySelector(".rsshub-helper");
    if (!panel) return { exists: false };
    const rect = panel.getBoundingClientRect();
    return {
      exists: true,
      visible: panel.style.display !== "none",
      display: getComputedStyle(panel).display,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      top: Math.round(rect.top),
      right: Math.round(rect.right),
      routeCards: panel.querySelectorAll(".rsshub-helper__route-card").length,
      domainInput: panel.querySelector(".rsshub-helper__domain-input")?.value || "",
      bodyHTML: panel.querySelector(".rsshub-helper__routes")?.innerHTML.substring(0, 200) || "",
    };
  });
  console.log("Panel info:", JSON.stringify(panelInfo, null, 2));

  // Screenshot
  await page.screenshot({
    path: "C:\\SoftwareGreen\\amuse\\web-scripts\\rsshub-helper\\assets\\test-result.png",
    fullPage: false,
  });
  console.log("Screenshot saved to assets/test-result.png");

  await browser.close();
  console.log("Done.");
})();
