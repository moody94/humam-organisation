(() => {
  const supportedLocales = new Set(["en", "ar"]);
  const storageKey = "meal-bridge-language";
  const i18nVersion = new URL(
    document.currentScript?.src || document.baseURI,
    document.baseURI,
  ).searchParams.get("v");

  function prepareSharedNavigation() {
    const navigation = document.querySelector(".main-nav");
    if (navigation && !document.querySelector(".language-toggle")) {
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "language-toggle";
      toggle.setAttribute("aria-label", "Switch to Arabic");
      toggle.setAttribute("aria-pressed", "false");
      toggle.textContent = "العربية";
      navigation.querySelector(".mobile-nav-label")?.after(toggle);
    }

    const navKeys = {
      "index.html": "nav.home", "solutions.html": "nav.solutions",
      "academy.html": "nav.academy", "about.html": "nav.about",
      "join-us.html": "nav.join", "contact.html": "nav.contact",
    };
    navigation?.querySelectorAll("a").forEach((link) => {
      const file = new URL(link.href, window.location.href).pathname.split("/").pop();
      if (link.classList.contains("button")) link.dataset.i18n ||= "nav.conversation";
      else if (navKeys[file]) link.dataset.i18n ||= navKeys[file];
    });

    document.querySelectorAll(".header-cta, .mobile-nav-cta").forEach((link) => {
      link.dataset.i18n ||= "nav.conversation";
    });
  }

  prepareSharedNavigation();
  const languageToggle = document.querySelector(".language-toggle");

  const getValue = (source, path) =>
    path.split(".").reduce(
      (value, key) => value?.[key],
      source
    );

  let activeLocale = "en";
  let activeTranslations = {};
  let englishTranslations = {};
  let textTranslations = new Map();
  const englishByTranslation = new Map();
  const normalize = (text) => text.replace(/\s+/g, " ").trim();
  const originalText = new WeakMap();
  const originalAttributes = new WeakMap();
  const localeRequests = new Map();
  let languageRequest = 0;
  let requestedLocale = "en";

  function buildTextTranslations() {
    textTranslations = new Map();
    function visit(english, translated) {
      for (const [key, value] of Object.entries(english)) {
        if (key === "auto") continue;
        if (typeof value === "string" && typeof translated?.[key] === "string") {
          textTranslations.set(normalize(value), translated[key]);
        } else if (value && typeof value === "object") visit(value, translated?.[key]);
      }
    }
    visit(englishTranslations, activeTranslations);
    for (const [english, translated] of Object.entries(activeTranslations.auto || {})) {
      textTranslations.set(normalize(english), translated);
    }
    if (activeLocale === "ar") {
      for (const [english, translated] of textTranslations) englishByTranslation.set(normalize(translated), english);
    }
  }

  window.mealBridgeI18n = {
    get(path, fallback = "") {
      return getValue(activeTranslations, path) ?? fallback;
    },
    locale() {
      return activeLocale;
    },
    text(english) {
      return textTranslations.get(normalize(english)) ?? english;
    },
  };

  async function loadLocale(locale) {
    if (localeRequests.has(locale)) return localeRequests.get(locale);
    const request = fetchLocale(locale).catch((error) => {
      localeRequests.delete(locale);
      throw error;
    });
    localeRequests.set(locale, request);
    return request;
  }

  async function fetchLocale(locale) {
    const localeUrl = new URL(`locales/${locale}.json`, document.baseURI);
    // Keep locale data in step with the versioned i18n script after deploys.
    if (i18nVersion) localeUrl.searchParams.set("v", i18nVersion);
    const response = await fetch(localeUrl);

    if (!response.ok) {
      throw new Error(
        `Could not load locales/${locale}.json (${response.status})`
      );
    }

    return response.json();
  }

  function updateDocumentLanguage(locale) {
    const isArabic = locale === "ar";

    document.documentElement.lang = locale;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";

    languageToggle?.setAttribute(
      "aria-pressed",
      String(isArabic)
    );

    languageToggle?.setAttribute(
      "aria-label",
      isArabic
        ? activeTranslations.auto?.["Switch to English"] || "Switch to English"
        : "Switch to Arabic"
    );

    if (languageToggle) {
      languageToggle.textContent = isArabic
        ? "English"
        : "العربية";
    }
    document.querySelector('meta[property="og:locale"]')?.setAttribute("content", isArabic ? "ar_SY" : "en_US");
  }

  function setElementText(element, translation) {
    if (element.tagName === "OPTION" && !element.hasAttribute("value")) {
      // Keep form submissions stable when the visible option label is translated.
      element.value = element.value;
    }
    const textNode = [...element.childNodes].find(
      (node) => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim(),
    );
    if (textNode) {
      if (textNode.nodeValue !== translation) {
        textNode.nodeValue = translation;
      }
    } else if (element.textContent !== translation) {
      element.textContent = translation;
    }
  }

  function applyExplicitTranslations(translations = activeTranslations) {
    document
      .querySelectorAll("[data-i18n]")
      .forEach((element) => {
        const translation = getValue(
          translations,
          element.dataset.i18n
        );

        if (translation !== undefined) {
          setElementText(element, translation);
        }
      });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      const translation = getValue(translations, element.dataset.i18nPlaceholder);
      if (translation !== undefined) element.placeholder = translation;
    });

    document.querySelectorAll("[data-i18n-label]").forEach((element) => {
      const translation = getValue(translations, element.dataset.i18nLabel);
      if (translation !== undefined) element.label = translation;
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      const translation = getValue(translations, element.dataset.i18nAriaLabel);
      if (translation !== undefined) element.setAttribute("aria-label", translation);
    });

    document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
      const translation = getValue(translations, element.dataset.i18nAlt);
      if (translation !== undefined) element.alt = translation;
    });

    document.querySelectorAll("[data-i18n-content]").forEach((element) => {
      const translation = getValue(translations, element.dataset.i18nContent);
      if (translation !== undefined) element.setAttribute("content", translation);
    });
  }

  function applyAutomaticTranslations() {
    // Remember source strings per node, so repeated switches never translate a translation.
    // Observe text added by forms, cookie preferences, navigation and sharing controls too.
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest('script, style, textarea, [contenteditable], .language-toggle, [translate="no"]') || parent.hasAttribute("data-i18n")) return NodeFilter.FILTER_REJECT;
        return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      let saved = originalText.get(node);
      if (!saved || saved.rendered !== node.nodeValue) {
        const source = englishByTranslation.get(normalize(node.nodeValue)) ?? node.nodeValue;
        saved = { source };
      }
      const translation = textTranslations.get(normalize(saved.source));
      if (translation === undefined) return;
      const parent = node.parentElement;
      if (parent.tagName === "OPTION" && !parent.hasAttribute("value")) parent.value = parent.value;
      const value = `${saved.source.match(/^\s*/)[0]}${translation}${saved.source.match(/\s*$/)[0]}`;
      if (node.nodeValue !== value) node.nodeValue = value;
      saved.rendered = value;
      originalText.set(node, saved);
    });

    const attributes = ["aria-label", "alt", "placeholder", "title", "label"];
    document.querySelectorAll('*').forEach((element) => {
      if (element.closest('.language-toggle, [translate="no"]')) return;
      const names = [...attributes];
      if (element.matches('meta[name="description"], meta[name^="twitter:"][name$="title"], meta[name^="twitter:"][name$="description"], meta[name="twitter:image:alt"], meta[property="og:title"], meta[property="og:description"], meta[property="og:image:alt"], meta[property="og:site_name"]')) names.push("content");
      const saved = originalAttributes.get(element) || {};
      for (const name of names) {
        if (!element.hasAttribute(name) || element.hasAttribute(`data-i18n-${name}`)) continue;
        const current = element.getAttribute(name);
        if (!saved[name] || saved[name].rendered !== current) saved[name] = { source: current };
        const translation = textTranslations.get(normalize(saved[name].source));
        if (translation === undefined) continue;
        if (current !== translation) element.setAttribute(name, translation);
        saved[name].rendered = translation;
      }
      originalAttributes.set(element, saved);
    });
  }

  const observer = new MutationObserver(() => {
    observer.disconnect();
    applyExplicitTranslations();
    applyAutomaticTranslations();
    observeChanges();
  });
  function observeChanges() {
    observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["aria-label", "alt", "placeholder", "title", "label", "content"] });
  }

  function setToggleLoading(isLoading) {
    if (!languageToggle) return;
    languageToggle.disabled = isLoading;
    languageToggle.toggleAttribute("aria-busy", isLoading);
  }

  async function setLanguage(
    locale,
    { persist = true, initial = false } = {}
  ) {
    if (!supportedLocales.has(locale)) return;
    const request = ++languageRequest;
    requestedLocale = locale;
    setToggleLoading(true);

    try {
      const [english, translations] = await Promise.all([loadLocale("en"), loadLocale(locale)]);
      if (request !== languageRequest) return;

      observer.disconnect();
      activeLocale = locale;
      activeTranslations = translations;
      englishTranslations = english;
      buildTextTranslations();

      // The source HTML is already English.
      // On the first English page load, don't rewrite the DOM unnecessarily.
      // This prevents the navbar from repainting/flashing.
      if (!(initial && locale === "en")) {
        applyExplicitTranslations(translations);
        applyAutomaticTranslations();
      }

      updateDocumentLanguage(locale);
      observeChanges();
      document.dispatchEvent(new CustomEvent("mealbridge:language-change", { detail: { locale } }));

      if (persist) {
        try {
          localStorage.setItem(storageKey, locale);
        } catch {
          // Ignore localStorage errors
        }
      }

    } catch (error) {
      if (request !== languageRequest) return;
      // The source HTML is English. If an initial Arabic translation cannot
      // load, reveal that safe fallback instead of leaving the page hidden.
      if (document.documentElement.classList.contains("i18n-loading")) {
        updateDocumentLanguage("en");
      }
      requestedLocale = activeLocale;
      console.error(
        `Language "${locale}" could not be loaded:`,
        error
      );
    } finally {
      if (request !== languageRequest) return;
      // i18n-init.js adds this class before first paint for saved Arabic.
      // Reveal only after the chosen language (or its fallback) is ready.
      document.documentElement.classList.remove("i18n-loading");
      setToggleLoading(false);
    }
  }

  let savedLocale = null;

  try {
    savedLocale = localStorage.getItem(storageKey);
  } catch {
    // Ignore localStorage errors
  }

  const initialLocale =
    supportedLocales.has(savedLocale)
      ? savedLocale
      : "en";

  setLanguage(initialLocale, { initial: true });

  languageToggle?.addEventListener("click", () => {
    const nextLocale =
      requestedLocale === "ar"
        ? "en"
        : "ar";

    setLanguage(nextLocale);
  });

  function savedLocaleOrEnglish() {
    try {
      const saved = localStorage.getItem(storageKey);
      return supportedLocales.has(saved) ? saved : "en";
    } catch {
      return "en";
    }
  }

  function synchronizeLanguagePreference() {
    const preferredLocale = savedLocaleOrEnglish();
    if (preferredLocale !== requestedLocale) {
      setLanguage(preferredLocale, { persist: false });
    }
  }

  // A page restored from the Back/Forward cache does not rerun initialization.
  // Reconcile it with the user's current preference before it is shown again.
  window.addEventListener("pageshow", synchronizeLanguagePreference);
  window.addEventListener("storage", (event) => {
    if (event.key === storageKey) synchronizeLanguagePreference();
  });
})();
