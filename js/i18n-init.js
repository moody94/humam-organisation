(() => {
  const root = document.documentElement;

  function revealEnglishFallback() {
    root.lang = "en";
    root.dir = "ltr";
    root.classList.remove("i18n-loading");
  }

  function isI18nScript(url) {
    try {
      return new URL(url, document.baseURI).pathname.endsWith("/js/i18n.js");
    } catch {
      return false;
    }
  }

  // This runs in <head>, before the source markup is painted. Normalize both
  // directions here so the first paint cannot inherit a stale page state.
  try {
    const savedLocale = localStorage.getItem("meal-bridge-language");
    const isArabic = savedLocale === "ar";

    root.lang = isArabic ? "ar" : "en";
    root.dir = isArabic ? "rtl" : "ltr";

    if (isArabic) {
      root.classList.add("i18n-loading");

      // Avoid a permanently blank page if the deferred translation script
      // cannot be downloaded or throws before it can reveal the document.
      window.addEventListener("error", (event) => {
        const target = event.target;
        if (
          (target?.tagName === "SCRIPT" && isI18nScript(target.src)) ||
          isI18nScript(event.filename)
        ) {
          revealEnglishFallback();
        }
      }, true);

      // A final safeguard for an interrupted or stalled script request. This
      // only runs when i18n.js has not already revealed the translated page.
      window.setTimeout(() => {
        if (root.classList.contains("i18n-loading")) revealEnglishFallback();
      }, 8000);
    }
  } catch {
    // If storage is unavailable, keep the first paint explicitly English/LTR.
    root.lang = "en";
    root.dir = "ltr";
  }
})();
