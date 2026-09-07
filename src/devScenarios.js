// Local-only browser scenarios. Vite removes this branch from production builds.
// These exercise the real matchMedia/context-failure paths before React mounts.
if (import.meta.env.DEV) {
  const scenario = new URLSearchParams(location.search).get("qa");
  if (scenario === "reduced-motion") {
    const matchMedia = window.matchMedia.bind(window);
    window.matchMedia = (query) => {
      const media = matchMedia(query);
      if (query === "(prefers-reduced-motion: reduce)")
        Object.defineProperty(media, "matches", { value: true });
      return media;
    };
  }
  if (scenario === "large-text")
    document.documentElement.style.fontSize = "200%";
  if (scenario === "no-webgl") {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...options) {
      return /webgl/i.test(type)
        ? null
        : getContext.call(this, type, ...options);
    };
  }
}
