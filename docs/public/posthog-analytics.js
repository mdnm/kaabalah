(function () {
  const config = window.__KAABALAH_DOCS_ANALYTICS__;
  if (!config || !config.posthogKey) return;
  if (window.location.hostname !== "docs.kaabalah.com") return;

  const CAPTURE_URL = "https://us.i.posthog.com/capture/";
  const DISTINCT_ID_KEY = "kaabalah_docs:distinct_id";
  const allowedKeys = new Set([
    "app",
    "surface",
    "path_group",
    "route_name",
    "source_app",
    "source_surface",
    "intent",
    "tool_type",
    "input_kind",
    "system",
    "step",
    "step_index",
    "step_total",
    "has_birth_date",
    "has_birth_time",
    "has_location",
    "is_authenticated",
    "membership_tier",
    "cta_id",
    "doc_section",
    "package_name",
    "has_query",
    "env",
    "distinct_id",
  ]);

  function getDistinctId() {
    try {
      const existing = window.localStorage.getItem(DISTINCT_ID_KEY);
      if (existing) return existing;

      const next =
        window.crypto && typeof window.crypto.randomUUID === "function"
          ? window.crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem(DISTINCT_ID_KEY, next);
      return next;
    } catch {
      return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
  }

  function sanitizeProperties(properties) {
    const safe = {};
    for (const [key, value] of Object.entries(properties)) {
      if (!allowedKeys.has(key)) continue;
      if (typeof value === "string") {
        safe[key] = value.slice(0, 80);
      } else if (
        typeof value === "number" ||
        typeof value === "boolean" ||
        value === null ||
        value === undefined
      ) {
        safe[key] = value;
      }
    }
    return safe;
  }

  function getPathGroup(pathname) {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "home";
    if (parts[0] === "getting-started" && parts[1]) return `getting-started/${parts[1]}`;
    if (parts[0] === "modules" && parts[1]) return `modules/${parts[1]}`;
    if (parts[0] === "guides" && parts[1]) return `guides/${parts[1]}`;
    if (parts[0] === "reference") return "reference/api";
    if (parts[0] === "about" && parts[1]) return `about/${parts[1]}`;
    return parts[0];
  }

  function getSurface(pathname) {
    if (pathname.startsWith("/reference")) return "api_reference";
    if (pathname.startsWith("/getting-started/installation")) return "install";
    if (pathname.startsWith("/getting-started")) return "guide";
    if (pathname.startsWith("/guides")) return "guide";
    if (pathname.startsWith("/modules")) return "api_reference";
    return "docs";
  }

  function getSourceApp(referrer) {
    if (!referrer) return "direct";
    try {
      const hostname = new URL(referrer).hostname;
      if (hostname === "www.entergamu.com" || hostname === "entergamu.com") return "gamu";
      if (hostname === "docs.kaabalah.com") return "kaabalah_docs";
      if (hostname.endsWith("kaabalah.com")) return "kaabalah";
      if (hostname === "github.com") return "github";
      if (hostname === "www.npmjs.com" || hostname === "npmjs.com") return "npm";
      return "external";
    } catch {
      return "unknown";
    }
  }

  function baseProperties() {
    const pathname = window.location.pathname;
    const pathGroup = getPathGroup(pathname);
    return {
      app: "kaabalah_docs",
      env: "production",
      surface: getSurface(pathname),
      path_group: pathGroup,
      doc_section: pathGroup,
      package_name: "kaabalah",
      has_query: window.location.search.length > 0,
      distinct_id: getDistinctId(),
    };
  }

  function capture(event, properties) {
    const payload = JSON.stringify({
      api_key: config.posthogKey,
      event,
      properties: sanitizeProperties({ ...baseProperties(), ...properties }),
    });

    if (navigator.sendBeacon) {
      const sent = navigator.sendBeacon(CAPTURE_URL, new Blob([payload], { type: "application/json" }));
      if (sent) return;
    }

    fetch(CAPTURE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(function () {
      // Analytics is best-effort.
    });
  }

  capture("page_viewed", {
    source_app: getSourceApp(document.referrer),
  });

  if (window.location.pathname.startsWith("/reference")) {
    capture("api_reference_viewed");
  }

  let engaged = false;
  function captureEngaged() {
    if (engaged) return;
    engaged = true;
    capture("page_engaged");
  }
  window.setTimeout(captureEngaged, 30000);
  window.addEventListener(
    "scroll",
    function () {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      if (window.scrollY / scrollable >= 0.5) captureEngaged();
    },
    { passive: true }
  );

  document.addEventListener("click", function (event) {
    const link = event.target.closest && event.target.closest("a[href]");
    if (!link) return;

    const href = link.href || "";
    if (href.includes("github.com/mdnm/kaabalah")) {
      capture("github_cta_clicked", { cta_id: "github" });
    } else if (href.includes("npmjs.com/package/kaabalah")) {
      capture("npm_cta_clicked", { cta_id: "npm" });
    } else if (href.includes("entergamu.com")) {
      capture("gamu_cta_clicked", {
        cta_id: "gamu",
        source_app: "kaabalah_docs",
        source_surface: getSurface(window.location.pathname),
        intent: "save_map",
      });
    }
  });

  document.addEventListener("copy", function () {
    const text = String(window.getSelection ? window.getSelection() : "").slice(0, 500);
    if (!text) return;

    if (text.includes("npm install kaabalah") || text.includes("pnpm add kaabalah")) {
      capture("install_cta_clicked", { cta_id: "copy_install" });
    } else if (text.includes("from 'kaabalah") || text.includes('from "kaabalah')) {
      capture("example_copied");
    }
  });
})();
