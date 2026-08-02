import "./style.css";

// ── Storage helpers (GM_setValue / GM_getValue with fallback) ──
const storage = {
  get(key, fallback) {
    try {
      if (typeof GM_getValue === "function") return GM_getValue(key, fallback);
      return JSON.parse(localStorage.getItem(`rsshub-helper:${key}`)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      if (typeof GM_setValue === "function") return GM_setValue(key, value);
      localStorage.setItem(`rsshub-helper:${key}`, JSON.stringify(value));
    } catch {
      /* noop */
    }
  },
};

// ── Constants ──
const PANEL_MIN_WIDTH = 340;
const PANEL_MAX_WIDTH = 520;

// ── SVG icons ──
const ICON_COPY = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
const ICON_CHECK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
const ICON_LINK = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;

// ── Route detection ──────────────────────────────────────────

/**
 * Parse a route path string like "/cool18/:id?/:type?/:keyword?"
 * into an array of { name, optional } objects.
 */
function parseRouteParams(routePath) {
  const params = [];
  const regex = /:([a-zA-Z_][a-zA-Z0-9_]*)(\?)?/g;
  let match;
  while ((match = regex.exec(routePath)) !== null) {
    params.push({
      name: match[1],
      optional: !!match[2],
    });
  }
  return params;
}

/**
 * Detect all route blocks on the page.
 * Returns: Array<{ element, title, routePath, params, exampleUrl }>
 */
function detectRoutes() {
  const blocks = document.querySelectorAll(".route-block");
  const routes = [];

  for (const block of blocks) {
    // Route path from the <code> inside .path
    const pathEl = block.querySelector(".path code");
    if (!pathEl) continue;
    const routePath = pathEl.textContent.trim();

    // Title from <h3>
    const h3 = block.querySelector("h3");
    const title = h3
      ? h3.textContent.replace(/#$/, "").trim()
      : routePath;

    // Example URL
    const exampleEl = block.querySelector(".example a");
    const exampleUrl = exampleEl ? exampleEl.getAttribute("href") : "";

    // Parameters from li.params
    const paramEls = block.querySelectorAll("li.params");
    const params = [];
    for (const li of paramEls) {
      const codeEl = li.querySelector("code");
      if (!codeEl) continue;
      const name = codeEl.textContent.trim();
      const badge = li.querySelector(".VPBadge");
      const optional =
        badge && badge.textContent.trim().toLowerCase().includes("optional");
      params.push({ name, optional });
    }

    // If no params detected from DOM, parse from route path
    const effectiveParams =
      params.length > 0 ? params : parseRouteParams(routePath);

    routes.push({
      element: block,
      title,
      routePath,
      params: effectiveParams,
      exampleUrl,
    });
  }

  return routes;
}

// ── URL builder ──────────────────────────────────────────────

function buildUrl(domain, routePath, paramValues) {
  // Remove trailing slash from domain
  const base = domain.replace(/\/+$/, "");
  // Replace :param and :param? with values
  let path = routePath;
  for (const [name, value] of Object.entries(paramValues)) {
    const required = new RegExp(`:${name}(?!\\?)`, "g");
    const optional = new RegExp(`:${name}\\?`, "g");
    if (value) {
      // If user provided a value, replace the param
      path = path.replace(required, encodeURIComponent(value));
      path = path.replace(optional, encodeURIComponent(value));
    } else {
      // No value: required → keep placeholder, optional → remove segment
      path = path.replace(required, `:${name}`);
      // For optional params, remove the segment including leading /
      path = path.replace(new RegExp(`/:${name}\\?`, "g"), "");
    }
  }
  // Clean up any double slashes
  path = path.replace(/\/+/g, "/");
  return `${base}${path}`;
}

// ── Toast ────────────────────────────────────────────────────

function showToast(msg) {
  let toast = document.querySelector(".rsshub-helper__toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "rsshub-helper__toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("✓ Copied!");
  } catch {
    // fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast("✓ Copied!");
  }
}

// ── Build UI ─────────────────────────────────────────────────

function createPanel(routes) {
  const domain = storage.get("domain", "");
  const openStates = storage.get("openStates", {});
  const paramValues = storage.get("paramValues", {});

  // ── Container ──
  const panel = document.createElement("div");
  panel.className = "rsshub-helper";
  panel.innerHTML = `
    <div class="rsshub-helper__header">
      <div class="rsshub-helper__header-left">
        <span style="font-size:18px">🧡</span>
        <h3>RSSHub Helper</h3>
      </div>
      <div class="rsshub-helper__header-actions">
        <button class="rsshub-helper__btn-minimize" title="Minimize">−</button>
      </div>
    </div>
    <div class="rsshub-helper__body">
      <div class="rsshub-helper__domain">
        <label>🔗 Your RSSHub Domain</label>
        <div class="rsshub-helper__domain-input-wrap">
          <input class="rsshub-helper__domain-input"
                 type="text"
                 placeholder="https://rsshub.app"
                 value="${escapeAttr(domain)}" />
          <button class="rsshub-helper__domain-btn">Apply</button>
        </div>
      </div>
      <div class="rsshub-helper__routes"></div>
    </div>
  `;

  const domainInput = panel.querySelector(".rsshub-helper__domain-input");
  const domainBtn = panel.querySelector(".rsshub-helper__domain-btn");
  const routesContainer = panel.querySelector(".rsshub-helper__routes");
  const minimizeBtn = panel.querySelector(".rsshub-helper__btn-minimize");

  // ── Toggle button (for minimized state) ──
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "rsshub-helper__toggle";
  toggleBtn.innerHTML = "🧡";
  toggleBtn.title = "RSSHub Helper";
  toggleBtn.style.display = "none";

  // ── Domain save ──
  function saveDomain() {
    const val = domainInput.value.trim();
    if (val) {
      storage.set("domain", val);
      updateAllResults();
      showToast("✓ Domain saved!");
    }
  }
  domainBtn.addEventListener("click", saveDomain);
  domainInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveDomain();
  });

  // ── Minimize / restore ──
  minimizeBtn.addEventListener("click", () => {
    panel.style.display = "none";
    toggleBtn.style.display = "flex";
  });
  toggleBtn.addEventListener("click", () => {
    panel.style.display = "flex";
    toggleBtn.style.display = "none";
  });

  // ── Make draggable ──
  makeDraggable(panel, panel.querySelector(".rsshub-helper__header"));

  // ── Build route cards ──
  const resultEls = []; // track result elements for updates

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const cardId = `route-${i}`;
    const isOpen = !!openStates[route.routePath];
    const paramCount = route.params.length;
    const optionalCount = route.params.filter((p) => p.optional).length;
    const requiredCount = paramCount - optionalCount;

    const card = document.createElement("div");
    card.className = `rsshub-helper__route-card${isOpen ? " open" : ""}`;

    // Badge text
    let badgeText = `${paramCount} params`;
    if (requiredCount > 0 && optionalCount > 0) {
      badgeText = `${requiredCount}R + ${optionalCount}O`;
    } else if (optionalCount > 0) {
      badgeText = `${optionalCount} optional`;
    }

    card.innerHTML = `
      <div class="rsshub-helper__route-header" data-card="${cardId}">
        <div class="rsshub-helper__route-header-left">
          <span class="rsshub-helper__route-arrow">▶</span>
          <span class="rsshub-helper__route-name" title="${escapeAttr(route.routePath)}">${escapeHtml(route.routePath)}</span>
        </div>
        <span class="rsshub-helper__route-badge">${badgeText}</span>
      </div>
      <div class="rsshub-helper__route-body">
        ${route.params
          .map((p) => {
            const val = getNestedValue(paramValues, route.routePath, p.name) || "";
            return `
            <div class="rsshub-helper__param-row">
              <span class="rsshub-helper__param-label">${escapeHtml(p.name)}</span>
              ${p.optional ? '<span class="rsshub-helper__param-optional">(opt)</span>' : ""}
              <input class="rsshub-helper__param-input"
                     type="text"
                     data-route="${escapeAttr(route.routePath)}"
                     data-param="${escapeAttr(p.name)}"
                     placeholder="${p.optional ? "optional" : "required"}"
                     value="${escapeAttr(val)}" />
            </div>`;
          })
          .join("")}
        <div class="rsshub-helper__result" data-route="${escapeAttr(route.routePath)}"></div>
      </div>
    `;

    // Toggle open/close
    const header = card.querySelector(".rsshub-helper__route-header");
    header.addEventListener("click", () => {
      card.classList.toggle("open");
      const states = storage.get("openStates", {});
      states[route.routePath] = card.classList.contains("open");
      storage.set("openStates", states);
    });

    // Param input changes
    const inputs = card.querySelectorAll(".rsshub-helper__param-input");
    for (const input of inputs) {
      input.addEventListener("input", () => {
        const vals = storage.get("paramValues", {});
        if (!vals[route.routePath]) vals[route.routePath] = {};
        vals[route.routePath][input.dataset.param] = input.value;
        storage.set("paramValues", vals);
        updateResult(route, card);
      });
    }

    resultEls.push({ route, card });
    routesContainer.appendChild(card);
  }

  // ── Update all results ──
  function updateAllResults() {
    for (const { route, card } of resultEls) {
      updateResult(route, card);
    }
  }

  // ── Update single result ──
  function updateResult(route, card) {
    const resultEl = card.querySelector(".rsshub-helper__result");
    const currentDomain =
      domainInput.value.trim() || "https://rsshub.app";
    const inputs = card.querySelectorAll(".rsshub-helper__param-input");
    const values = {};
    for (const input of inputs) {
      values[input.dataset.param] = input.value.trim();
    }
    const url = buildUrl(currentDomain, route.routePath, values);

    resultEl.innerHTML = `
      <div class="rsshub-helper__result-label">Generated URL</div>
      <div class="rsshub-helper__result-url">
        <a href="${escapeAttr(url)}" target="_blank" rel="noopener">${escapeHtml(url)}</a>
        <button class="rsshub-helper__copy-btn" title="Copy URL">${ICON_COPY}</button>
      </div>
    `;

    const copyBtn = resultEl.querySelector(".rsshub-helper__copy-btn");
    copyBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      copyText(url);
      copyBtn.innerHTML = ICON_CHECK;
      setTimeout(() => (copyBtn.innerHTML = ICON_COPY), 1500);
    });
  }

  // Initial render of results
  updateAllResults();

  // ── Empty state ──
  if (routes.length === 0) {
    routesContainer.innerHTML = `
      <div class="rsshub-helper__empty">
        <div class="rsshub-helper__empty-icon">🔍</div>
        <div>No routes detected on this page.<br>Navigate to a specific route page.</div>
      </div>
    `;
  }

  // ── Mount ──
  document.body.appendChild(panel);
  document.body.appendChild(toggleBtn);

  // Update results when domain changes
  domainInput.addEventListener("input", updateAllResults);
}

// ── Draggable ────────────────────────────────────────────────

function makeDraggable(panel, handle) {
  let isDragging = false;
  let startX, startY, startLeft, startTop;

  handle.addEventListener("mousedown", (e) => {
    if (e.target.closest("button")) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = panel.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    panel.style.position = "fixed";
    panel.style.left = `${startLeft}px`;
    panel.style.top = `${startTop}px`;
    panel.style.right = "auto";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    e.preventDefault();
  });

  function onMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    panel.style.left = `${startLeft + dx}px`;
    panel.style.top = `${startTop + dy}px`;
  }

  function onUp() {
    isDragging = false;
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  }
}

// ── Utility ──────────────────────────────────────────────────

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getNestedValue(store, routePath, paramName) {
  return store?.[routePath]?.[paramName] || "";
}

// ── Init ─────────────────────────────────────────────

let currentPanel = null;
let currentToggle = null;
let currentUrl = location.href;

function removePanel() {
  if (currentPanel) { currentPanel.remove(); currentPanel = null; }
  if (currentToggle) { currentToggle.remove(); currentToggle = null; }
}

function setupPanel() {
  const routes = detectRoutes();
  if (routes.length > 0) {
    removePanel();
    createPanel(routes);
    currentPanel = document.querySelector(".rsshub-helper");
    currentToggle = document.querySelector(".rsshub-helper__toggle");
  } else {
    removePanel();
  }
}

/** Poll until routes appear in the DOM (VitePress renders asynchronously) */
function pollForRoutes(maxAttempts, intervalMs, callback) {
  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    const routes = detectRoutes();
    if (routes.length > 0 || attempts >= maxAttempts) {
      clearInterval(timer);
      if (callback) callback();
    }
  }, intervalMs);
}

/** Called on every navigation (initial load, SPA, popstate) */
function onNavigate() {
  currentUrl = location.href;
  removePanel();
  pollForRoutes(40, 500, () => setupPanel());
}

function init() {
  // Initial attempt (immediate, then poll for late-rendering)
  setupPanel();
  pollForRoutes(30, 500, () => {
    if (!currentPanel) setupPanel();
  });

  // SPA navigation via popstate (VitePress client-side routing)
  window.addEventListener("popstate", onNavigate);

  // SPA navigation via pushState - intercept History API
  const origPushState = history.pushState;
  history.pushState = function (...args) {
    origPushState.apply(this, args);
    if (location.href !== currentUrl) onNavigate();
  };
  const origReplaceState = history.replaceState;
  history.replaceState = function (...args) {
    origReplaceState.apply(this, args);
    if (location.href !== currentUrl) onNavigate();
  };

  // Fallback: poll URL changes every 500ms (catches edge cases)
  setInterval(() => {
    if (location.href !== currentUrl) onNavigate();
  }, 500);
}

// Start when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}