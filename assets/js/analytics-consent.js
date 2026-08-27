(() => {
  "use strict";

  const MEASUREMENT_ID = "G-D2C4KFRFYD";
  const STORAGE_KEY = "mealbridge_analytics_consent_v1";
  const COOKIE_PREFIXES = ["_ga"];
  const VALID_STATES = new Set(["granted", "denied"]);
  let googleTagRequested = false;
  let sessionConsent = null;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };

  // Privacy-first default: no Google storage or advertising signals are allowed.
  // The external Google tag is not requested at all until analytics is accepted.
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    personalization_storage: "denied",
    functionality_storage: "denied",
    security_storage: "granted"
  });

  function readConsent() {
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      if (VALID_STATES.has(value)) {
        sessionConsent = value;
        return value;
      }
    } catch {
      // Fall back to the in-memory choice for this page.
    }
    return sessionConsent;
  }

  function storeConsent(value) {
    sessionConsent = value;
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // If storage is unavailable, the choice still applies for this page.
    }
  }

  function analyticsAllowed() {
    return readConsent() === "granted";
  }

  function loadGoogleAnalytics() {
    if (googleTagRequested) {
      window[`ga-disable-${MEASUREMENT_ID}`] = false;
      window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        personalization_storage: "denied"
      });
      return;
    }

    googleTagRequested = true;
    window[`ga-disable-${MEASUREMENT_ID}`] = false;

    window.gtag("js", new Date());
    window.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      personalization_storage: "denied"
    });
    window.gtag("config", MEASUREMENT_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
    script.dataset.mealBridgeAnalytics = "true";
    document.head.append(script);
  }

  function deleteAnalyticsCookies() {
    const host = window.location.hostname;
    const labels = host.split(".").filter(Boolean);
    const registrableDomain = labels.length >= 2 ? `.${labels.slice(-2).join(".")}` : null;
    const domains = [null, host, `.${host}`, registrableDomain].filter((value, index, list) => value && list.indexOf(value) === index);

    document.cookie.split(";").forEach((rawCookie) => {
      const name = rawCookie.split("=")[0]?.trim();
      if (!name || !COOKIE_PREFIXES.some((prefix) => name === prefix || name.startsWith(`${prefix}_`))) return;

      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      domains.forEach((domain) => {
        document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}; SameSite=Lax`;
      });
    });
  }

  function rejectAnalytics() {
    storeConsent("denied");
    window[`ga-disable-${MEASUREMENT_ID}`] = true;
    deleteAnalyticsCookies();
  }

  function acceptAnalytics() {
    storeConsent("granted");
    loadGoogleAnalytics();
  }

  const eventNames = {
    contact: "contact_inquiry_submitted",
    "academy-application": "academy_application_submitted",
    "organizational-training": "organizational_training_submitted",
    "practice-application": "practice_application_submitted"
  };

  function trackFormSuccess(formType) {
    const eventName = eventNames[formType];
    if (!eventName || !analyticsAllowed()) return;
    loadGoogleAnalytics();
    window.gtag("event", eventName, {
      event_category: "form_submission"
    });
  }

  function createConsentInterface() {
    const banner = document.createElement("section");
    banner.className = "analytics-consent";
    banner.hidden = true;
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Analytics preferences");
    banner.innerHTML = `
      <div class="analytics-consent-inner">
        <div class="analytics-consent-copy">
          <span class="analytics-consent-eyebrow">Privacy choice</span>
          <h2>Optional analytics</h2>
          <p>We use Google Analytics only if you accept, to understand website traffic and successful inquiry or application submissions. Analytics stays off if you reject. We do not send your form answers or contact details to Analytics. <a href="privacy.html#cookies-analytics">Privacy &amp; Data Protection</a></p>
          <p class="analytics-consent-status" data-consent-status hidden></p>
        </div>
        <div class="analytics-consent-actions">
          <button class="button button-secondary" type="button" data-consent-reject>Reject non-essential</button>
          <button class="button button-primary" type="button" data-consent-accept>Accept analytics</button>
          <button class="analytics-consent-close" type="button" data-consent-close aria-label="Close analytics preferences" hidden>×</button>
        </div>
      </div>`;
    document.body.append(banner);

    const status = banner.querySelector("[data-consent-status]");
    const close = banner.querySelector("[data-consent-close]");

    function showPreferences({ allowClose = true } = {}) {
      const current = readConsent();
      if (status) {
        status.hidden = !current;
        status.textContent = current === "granted"
          ? "Analytics is currently enabled on this browser."
          : current === "denied"
            ? "Analytics is currently disabled on this browser."
            : "";
      }
      if (close) close.hidden = !allowClose;
      banner.hidden = false;
      requestAnimationFrame(() => banner.classList.add("is-visible"));
      if (allowClose) {
        banner.querySelector(current === "granted" ? "[data-consent-reject]" : "[data-consent-accept]")?.focus({ preventScroll: true });
      }
    }

    function hidePreferences() {
      banner.classList.remove("is-visible");
      window.setTimeout(() => { banner.hidden = true; }, 180);
    }

    banner.querySelector("[data-consent-accept]")?.addEventListener("click", () => {
      acceptAnalytics();
      hidePreferences();
    });

    banner.querySelector("[data-consent-reject]")?.addEventListener("click", () => {
      rejectAnalytics();
      hidePreferences();
    });

    close?.addEventListener("click", hidePreferences);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !banner.hidden && readConsent()) hidePreferences();
    });

    document.querySelectorAll(".footer-bottom").forEach((footerBottom) => {
      if (footerBottom.querySelector("[data-privacy-preferences]")) return;
      const privacyLink = footerBottom.querySelector('a[href="privacy.html"]');
      const paragraph = privacyLink?.closest("p");
      if (!paragraph) return;
      const separator = document.createTextNode(" · ");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "footer-preference-link";
      button.dataset.privacyPreferences = "true";
      button.textContent = "Cookie preferences";
      privacyLink.after(separator, button);
      button.addEventListener("click", () => showPreferences({ allowClose: true }));
    });

    if (!readConsent()) showPreferences({ allowClose: false });
  }

  const storedConsent = readConsent();
  if (storedConsent === "granted") loadGoogleAnalytics();
  else window[`ga-disable-${MEASUREMENT_ID}`] = true;

  window.MEALBridgeAnalytics = Object.freeze({
    measurementId: MEASUREMENT_ID,
    getConsent: readConsent,
    trackFormSuccess,
    openPreferences: () => document.querySelector(".analytics-consent")?.hidden && document.querySelector("[data-privacy-preferences]")?.click()
  });

  createConsentInterface();
})();
