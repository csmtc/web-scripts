import re

with open(r'C:\SoftwareGreen\amuse\web-scripts\rsshub-helper\src\main.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the init section
start_marker = "// \u2500\u2500 Init \u2500"
end_marker = 'init();\n}'
start_idx = content.index(start_marker)
# Find the last occurrence of init();
end_idx = content.rindex('init();\n}') + len('init();\n}')

old_section = content[start_idx:end_idx]

new_section = """// \u2500\u2500 Init \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

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
}"""

content = content[:start_idx] + new_section + content[end_idx:]

with open(r'C:\SoftwareGreen\amuse\web-scripts\rsshub-helper\src\main.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Patch applied successfully.')
print(f'Replaced {len(old_section)} chars with {len(new_section)} chars')
