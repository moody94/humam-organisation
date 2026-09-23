(() => {
  const navigation = document.querySelector(".main-nav");
  const menuButton = document.querySelector(".menu-button");
  const closeButton = document.querySelector(".mobile-nav-label button");
  const mobileNavigation = navigation && menuButton ? window.matchMedia("(max-width: 760px)") : null;
  let inactiveRegions = [];
  let scrim = null;

  const pageAliases = {
    "": "index.html",
    "services.html": "solutions.html",
    "academy-apply.html": "academy.html",
    "academy-training.html": "academy.html",
    "partners.html": "contact.html",
  };

  const currentFile = window.location.pathname.split("/").pop() || "index.html";
  const currentNavFile = pageAliases[currentFile] || currentFile;

  navigation?.querySelectorAll(":scope > a:not(.button)").forEach((link) => {
    const linkFile = new URL(link.href, window.location.href).pathname.split("/").pop() || "index.html";
    const isCurrent = linkFile === currentNavFile;
    link.classList.toggle("active", isCurrent);
    if (isCurrent) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  function closeNavigation({ restoreFocus = false } = {}) {
    navigation?.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    menuButton?.setAttribute("aria-expanded", "false");
    scrim?.remove();
    scrim = null;
    inactiveRegions.forEach(([region, previous]) => {
      if (previous === null) region.removeAttribute("inert");
      else region.setAttribute("inert", previous);
    });
    inactiveRegions = [];
    if (restoreFocus) menuButton?.focus();
  }

  function openNavigation() {
    if (!navigation || !menuButton || !mobileNavigation?.matches || navigation.classList.contains("is-open")) return;
    navigation.classList.add("is-open");
    document.body.classList.add("nav-open");
    menuButton.setAttribute("aria-expanded", "true");
    scrim = document.createElement("button");
    scrim.className = "nav-scrim";
    scrim.type = "button";
    scrim.tabIndex = -1;
    scrim.setAttribute("aria-label", "Close navigation");
    scrim.addEventListener("click", () => closeNavigation({ restoreFocus: true }));
    document.querySelector(".site-header")?.append(scrim);
    closeButton?.focus();
    inactiveRegions = [...document.querySelectorAll(".skip-link, .site-header .brand, .header-actions, main, .site-footer")].map((region) => {
      const previous = region.getAttribute("inert");
      region.setAttribute("inert", "");
      return [region, previous];
    });
  }

  menuButton?.addEventListener("click", () => {
    if (navigation?.classList.contains("is-open")) closeNavigation({ restoreFocus: true });
    else openNavigation();
  });
  closeButton?.addEventListener("click", () => closeNavigation({ restoreFocus: true }));
  navigation?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeNavigation()));
  document.addEventListener("keydown", (event) => {
    if (!navigation?.classList.contains("is-open") || !mobileNavigation?.matches) return;
    const consent = document.querySelector(".analytics-consent:not([hidden])");
    if (event.key === "Escape") {
      if (consent?.contains(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
      closeNavigation({ restoreFocus: true });
      return;
    }
    if (event.key !== "Tab" || event.altKey || event.ctrlKey || event.metaKey) return;
    const controls = [...navigation.querySelectorAll('a[href], button:not([disabled])'), ...(consent?.querySelectorAll('a[href], button:not([disabled])') || [])]
      .filter((control) => control.tabIndex >= 0 && !control.closest("[inert]") && control.getClientRects().length);
    if (!controls.length) return;
    const index = controls.indexOf(document.activeElement);
    if (index < 0 || (event.shiftKey ? index === 0 : index === controls.length - 1)) {
      event.preventDefault();
      controls[event.shiftKey ? controls.length - 1 : 0].focus();
    }
  }, true);
  document.addEventListener("focusin", (event) => {
    if (navigation?.classList.contains("is-open") && event.target.closest?.(".analytics-consent:not([hidden])")) {
      closeNavigation();
    }
  });
  mobileNavigation?.addEventListener("change", (event) => {
    if (event.matches || !navigation?.classList.contains("is-open")) return;
    const focused = document.activeElement;
    closeNavigation();
    if (focused && !focused.getClientRects().length) {
      (navigation.querySelector('a[aria-current="page"]') || navigation.querySelector("a[href]"))?.focus();
    }
  });

  const intentLabels = {
    consultancy: "MEAL consultancy",
    systems: "Systems development",
    partnership: "Partnership opportunity",
    academy: "Academy & training",
    join: "Join MEAL Bridge",
    career: "Career Consultation Session",
    question: "General inquiry",
  };
  const query = new URLSearchParams(window.location.search);
  const intent = query.get("intent");

  const interest = document.querySelector('select[name="interest"]');
  if (interest && intentLabels[intent]) interest.value = intentLabels[intent];

  const academyForm = document.querySelector('[data-form-type="academy-application"]');
  const programSelect = academyForm?.querySelector('select[name="program"]');
  const applicationType = academyForm?.querySelector('input[name="application_type"]');
  const requestedProgram = query.get("program");

  function syncAcademyApplication() {
    if (!programSelect) return;
    const selectedOption = programSelect.selectedOptions[0];
    if (applicationType) applicationType.value = selectedOption?.dataset.programType || "";
  }

  function applyRequestedProgram() {
    if (!programSelect || !requestedProgram) return;
    const matchingOption = [...programSelect.options].find((option) => option.value === requestedProgram);
    if (matchingOption) programSelect.value = matchingOption.value;
    syncAcademyApplication();
  }

  applyRequestedProgram();
  programSelect?.addEventListener("change", syncAcademyApplication);

  function formDataToObject(form) {
    const payload = {};
    new FormData(form).forEach((value, key) => {
      // Formspark uses a blank _honeypot value as an explicit anti-spam signal.
      if (value === "" && key !== "_honeypot") return;
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        payload[key] = Array.isArray(payload[key]) ? [...payload[key], value] : [payload[key], value];
      } else {
        payload[key] = value;
      }
    });
    return payload;
  }

  const successContent = {
    contact: '<span aria-hidden="true">✓</span><h2>Thank you for reaching out.</h2><p>Your inquiry has been received. We will review it and respond with the most appropriate next step, normally within two working days.</p><button type="button" class="button button-secondary">Send another inquiry</button>',
    "academy-application": '<span aria-hidden="true">✓</span><h2>Application received.</h2><p>The Academy will review your programme fit, experience, and objective, normally within three working days. If a CV is needed, we will request it by email.</p><button type="button" class="button button-secondary">Submit another application</button>',
    "organizational-training": '<span aria-hidden="true">✓</span><h2>Training request received.</h2><p>The Academy will review your objective, participant profile, scope, and timing. We normally acknowledge the request within two working days and arrange a discovery call when appropriate.</p><button type="button" class="button button-secondary">Submit another request</button>',
    "practice-application": '<span aria-hidden="true">✓</span><h2>Submission received.</h2><p>Thank you. We received your Community of Practice registration or Professional Practice application and will contact you about any next steps.</p><button type="button" class="button button-secondary">Submit another response</button>',
    "career-application": '<span aria-hidden="true">✓</span><h2>Application received.</h2><p>Thank you. The MEAL Bridge team will review your application against the selected opportunity.</p><button type="button" class="button button-secondary">Submit another application</button>',
    "eoi-application": '<span aria-hidden="true">✓</span><h2>Expression of Interest received.</h2><p>Thank you. MEAL Bridge will review your application against the selected consulting role. Shortlisted applicants may be contacted while the call remains open.</p><button type="button" class="button button-secondary">Submit another Expression of Interest</button>',
  };

  const academyFeedbackKeys = {
    "academy-application": "academyApply.feedback",
    "organizational-training": "academyTraining.feedback",
  };

  function t(path, fallback) {
    return window.mealBridgeI18n?.get?.(path, fallback) ?? fallback;
  }

  function translatedText(english) {
    return window.mealBridgeI18n?.text(english) ?? english;
  }

  // Native validation follows the browser's UI language unless we supply a message.
  function localizeValidation(field) {
    field.setCustomValidity("");
    const state = field.validity;
    if (state.valid) return;
    const key = state.valueMissing ? "required" : state.typeMismatch && field.type === "email" ? "email" : "invalid";
    field.setCustomValidity(t(`validation.${key}`, field.validationMessage));
  }
  document.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("invalid", () => localizeValidation(field));
    field.addEventListener("input", () => field.setCustomValidity(""));
    field.addEventListener("change", () => field.setCustomValidity(""));
  });
  document.addEventListener("mealbridge:language-change", () => {
    document.querySelectorAll("input, select, textarea").forEach((field) => {
      if (field.validity.customError) localizeValidation(field);
    });
  });

  function formSuccessContent(formType) {
    const prefix = academyFeedbackKeys[formType];
    if (!prefix) return successContent[formType] || successContent.contact;

    const fallback = formType === "academy-application"
      ? {
        title: "Application received.",
        text: "The Academy will review your programme fit, experience, and objective, normally within three working days. If a CV is needed, we will request it by email.",
        button: "Submit another application",
      }
      : {
        title: "Training request received.",
        text: "The Academy will review your objective, participant profile, scope, and timing. We normally acknowledge the request within two working days and arrange a discovery call when appropriate.",
        button: "Submit another request",
      };

    return `<span aria-hidden="true">✓</span><h2 data-i18n="${prefix}.successTitle">${t(`${prefix}.successTitle`, fallback.title)}</h2><p data-i18n="${prefix}.successText">${t(`${prefix}.successText`, fallback.text)}</p><button type="button" class="button button-secondary" data-i18n="${prefix}.successButton">${t(`${prefix}.successButton`, fallback.button)}</button>`;
  }

  function formSubmittingLabel(formType) {
    const prefix = academyFeedbackKeys[formType];
    if (!prefix) return formType === "contact" ? "Sending…" : "Submitting…";
    return t(`${prefix}.submitting`, "Submitting…");
  }

  function formErrorContent(formType, fallbackEmail) {
    const prefix = academyFeedbackKeys[formType];
    if (!prefix) {
      return `The form could not be sent. Please try again or email <a href="mailto:${fallbackEmail}">${fallbackEmail}</a>.`;
    }

    return `<span data-i18n="${prefix}.errorStart">${t(`${prefix}.errorStart`, "The form could not be sent. Please try again or email ")}</span><a href="mailto:${fallbackEmail}">${fallbackEmail}</a><span data-i18n="${prefix}.errorEnd">${t(`${prefix}.errorEnd`, ".")}</span>`;
  }

  document.querySelectorAll(".contact-form-new, .academy-application-form").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      if (button?.disabled) return;

      if (form === academyForm) syncAcademyApplication();
      const originalButton = button?.innerHTML || "Submit";
      const originalButtonKey = button?.getAttribute("data-i18n");
      const formType = form.dataset.formType || "contact";
      const fallbackEmail = form.dataset.fallbackEmail || "info@meal-bridge.com";
      form.querySelector(".form-error")?.remove();

      if (button) {
        button.disabled = true;
        if (academyFeedbackKeys[formType]) button.dataset.i18n = `${academyFeedbackKeys[formType]}.submitting`;
        button.textContent = formSubmittingLabel(formType);
      }

      try {
        const payload = formDataToObject(form);
        let analyticsContext = null;
        try {
          // Capture the permitted context with the payload, before fields can change.
          analyticsContext = window.MEALBridgeMeasurement?.getFormContext?.(formType, form) || {};
        } catch {
          // Optional context must not prevent submission; retain the no-event fallback.
        }
        const hasFileUpload = [...form.querySelectorAll('input[type="file"]')].some((input) => input.files?.length);
        const requestOptions = hasFileUpload
          ? { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) }
          : { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) };
        const response = await fetch(form.action, requestOptions);
        if (!response.ok) throw new Error(`Submission failed with status ${response.status}`);

        // V1.5.1 analytics: count only Formspark-confirmed submissions and attach only
        // explicitly whitelisted, non-identifying context (never contact details or free text).
        try {
          if (analyticsContext !== null) {
            window.MEALBridgeAnalytics?.trackFormSuccess(formType, analyticsContext);
            window.MEALBridgeMeasurement?.resetFormContext?.(formType, form);
          }
        } catch {
          // Optional analytics must not turn an accepted submission into an error.
        }

        const result = document.createElement("div");
        result.className = "form-result form-result-success";
        result.setAttribute("role", "status");
        result.setAttribute("aria-live", "polite");
        result.setAttribute("tabindex", "-1");
        result.innerHTML = formSuccessContent(formType);
        form.hidden = true;
        form.after(result);
        result.focus();
        result.querySelector("button")?.addEventListener("click", () => {
          form.reset();
          result.remove();
          form.hidden = false;
          if (form === academyForm) applyRequestedProgram();
          if (formType === "contact" && interest && intentLabels[intent]) {
            interest.value = intentLabels[intent];
          }
          try {
            window.MEALBridgeMeasurement?.resetFormContext?.(formType, form);
          } catch {
            // Optional tracking state must not interrupt reopening the form.
          }
          form.querySelector('input:not([type="hidden"]):not(.form-honeypot):enabled, select:enabled, textarea:enabled')?.focus();
        });
      } catch {
        const error = document.createElement("p");
        error.className = "form-error";
        error.setAttribute("role", "alert");
        error.innerHTML = formErrorContent(formType, fallbackEmail);
        form.append(error);
      } finally {
        if (button) {
          button.disabled = false;
          button.innerHTML = originalButton;
          if (originalButtonKey) {
            button.dataset.i18n = originalButtonKey;
            button.textContent = t(originalButtonKey, button.textContent);
          } else button.removeAttribute("data-i18n");
        }
      }
    });
  });


  // V1.2 Join Us: expand pathway panels and prefill shared application forms.
  const joinExpandButtons = document.querySelectorAll("[data-join-expand]");
  const joinPanels = document.querySelectorAll("[data-join-panel]");
  const practiceShell = document.getElementById("practice-application");
  const careerShell = document.getElementById("career-application");
  const eoiShell = document.getElementById("eoi-application");

  function showJoinPanel(target, { scroll = true } = {}) {
    joinPanels.forEach((panel) => {
      const active = panel.dataset.joinPanel === target;
      panel.hidden = !active;
    });
    joinExpandButtons.forEach((button) => {
      const active = button.dataset.joinExpand === target;
      button.setAttribute("aria-expanded", active ? "true" : "false");
    });
    if (practiceShell) practiceShell.hidden = true;
    if (careerShell) careerShell.hidden = true;
    if (eoiShell) eoiShell.hidden = true;
    if (scroll) {
      document.getElementById(`join-panel-${target}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  joinExpandButtons.forEach((button) => button.addEventListener("click", () => showJoinPanel(button.dataset.joinExpand)));

  // Deep links should reveal any Join Us panel that contains the hash target before scrolling to it.
  function showJoinPanelFromHash() {
    let targetId = "";
    try {
      targetId = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : "";
    } catch {
      return;
    }
    if (!targetId) return;

    const deepTarget = document.getElementById(targetId);
    if (!deepTarget) return;

    const containingPanel = deepTarget.closest("[data-join-panel]");
    if (!containingPanel?.dataset.joinPanel) return;

    showJoinPanel(containingPanel.dataset.joinPanel, { scroll: false });
    requestAnimationFrame(() => deepTarget.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  showJoinPanelFromHash();
  window.addEventListener("hashchange", showJoinPanelFromHash);

  document.querySelectorAll(".practice-apply").forEach((button) => button.addEventListener("click", () => {
    if (!practiceShell) return;
    practiceShell.hidden = false;
    const select = practiceShell.querySelector('select[name="practice"]');
    if (select) select.value = button.dataset.practice || "";
    practiceShell.scrollIntoView({ behavior: "smooth", block: "start" });
  }));

  document.querySelectorAll(".career-apply").forEach((button) => button.addEventListener("click", () => {
    const opportunityType = button.dataset.opportunityType || "Opportunity";
    const opportunity = button.dataset.opportunity || "MEAL Bridge opportunity";
    const subject = t("careers.subject", "Application - {opportunity}").replace("{opportunity}", translatedText(opportunity));
    const body = [
      "Dear MEAL Bridge Careers Team,",
      "",
      t("careers.introduction", "I would like to apply for the {type}: {opportunity}.").replace("{type}", translatedText(opportunityType)).replace("{opportunity}", translatedText(opportunity)),
      "",
      "Full name:",
      "Phone:",
      "LinkedIn / professional profile (if available):",
      "Short note of interest:",
      "",
      "Required attachments:",
      "- CV / Resume",
      "- Cover Letter",
      "",
      "Kind regards,"
    ].map(translatedText).join("\n");
    window.location.href = `mailto:careers@meal-bridge.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }));

  const eoiCards = [...document.querySelectorAll('[data-opportunity-card="eoi"]')];
  const eoiRoleSelect = eoiShell?.querySelector('select[name="opportunity"]');
  const eoiDeadlineNote = eoiShell?.querySelector('.eoi-deadline-note');

  const cardForRole = (role) => eoiCards.find((card) => card.querySelector('.eoi-apply')?.dataset.opportunity === role);
  const deadlineForRole = (role) => {
    const card = cardForRole(role);
    const raw = card?.dataset.deadline || "";
    const date = raw ? new Date(raw) : null;
    return { card, raw, date, label: card?.dataset.deadlineLabel || "the stated deadline" };
  };

  document.querySelectorAll(".eoi-apply").forEach((button) => button.addEventListener("click", () => {
    if (!eoiShell || button.disabled) return;
    eoiShell.hidden = false;
    if (eoiRoleSelect) {
      eoiRoleSelect.value = button.dataset.opportunity || "";
      eoiRoleSelect.dispatchEvent(new Event("change", { bubbles: true }));
    }
    eoiShell.scrollIntoView({ behavior: "smooth", block: "start" });
  }));

  // Expression of Interest: live word guidance and role-specific deadline enforcement.
  // Each EOI card owns its deadline via data-deadline, so future cards can use different closing dates.
  const eoiForm = document.querySelector('[data-form-type="eoi-application"]');
  if (eoiForm) {
    const experience = eoiForm.querySelector('[data-word-limit]');
    const counter = document.getElementById("eoi-word-count");
    const submitButton = eoiForm.querySelector('button[type="submit"]');
    const closedMessage = eoiForm.querySelector('.eoi-closed-message');
    let overWordLimit = false;
    let deadlineClosed = false;

    const refreshSubmitState = () => { if (submitButton) submitButton.disabled = overWordLimit || deadlineClosed || !eoiRoleSelect?.value; };
    const countWords = () => {
      const words = (experience?.value || "").trim().match(/\S+/g)?.length || 0;
      const limit = Number(experience?.dataset.wordLimit || 250);
      overWordLimit = words > limit;
      if (counter) { counter.textContent = `${words} / ${limit} words`; counter.classList.toggle("is-over-limit", overWordLimit); }
      if (experience) experience.setCustomValidity(overWordLimit ? `Please reduce your response to ${limit} words or fewer.` : "");
      refreshSubmitState();
    };

    const enforceDeadline = () => {
      const role = eoiRoleSelect?.value || "";
      const { date, label } = deadlineForRole(role);
      deadlineClosed = Boolean(role && date && !Number.isNaN(date.getTime()) && Date.now() > date.getTime());

      // Only the selected role controls whether submission is open; the form itself has no global deadline.
      eoiForm.querySelectorAll('input, textarea').forEach((field) => {
        if (!field.classList.contains('form-honeypot')) field.disabled = deadlineClosed;
      });
      eoiForm.querySelectorAll('select').forEach((field) => { field.disabled = false; });

      eoiCards.forEach((card) => {
        const button = card.querySelector('.eoi-apply');
        const raw = card.dataset.deadline || "";
        const cardDeadline = raw ? new Date(raw) : null;
        const closed = Boolean(cardDeadline && !Number.isNaN(cardDeadline.getTime()) && Date.now() > cardDeadline.getTime());
        if (button) { button.disabled = closed; button.textContent = closed ? "Closed" : "Apply"; }
      });

      if (eoiDeadlineNote) {
        eoiDeadlineNote.innerHTML = role
          ? `<strong>Deadline for ${role}:</strong> ${label}. Applications are reviewed on a rolling basis.`
          : '<strong>Deadline:</strong> Select a role to view its application deadline. Applications are reviewed on a rolling basis.';
      }
      if (closedMessage) {
        closedMessage.hidden = !deadlineClosed;
        if (deadlineClosed) closedMessage.textContent = `This Expression of Interest is closed. The application deadline for ${role} was ${label}.`;
      }
      refreshSubmitState();
    };

    eoiRoleSelect?.addEventListener("change", enforceDeadline);
    experience?.addEventListener("input", countWords);
    countWords();
    enforceDeadline();
    window.setInterval(enforceDeadline, 30000);
  }


  // Academy catalogue: show one primary section at a time while preserving deep links and no-JS fallback.
  const academySectionButtons = document.querySelectorAll("[data-academy-section]");
  const academyPanels = document.querySelectorAll("[data-academy-panel]");
  const academyShowLinks = document.querySelectorAll("[data-academy-show]");

  if (academySectionButtons.length && academyPanels.length) {
    const academyPanelKeys = new Set([...academyPanels].map((panel) => panel.dataset.academyPanel));

    const panelForHash = (hash) => {
      if (!hash) return null;
      const key = hash.replace(/^#/, "");
      if (academyPanelKeys.has(key)) return key;
      if (key.startsWith("course-")) return "courses";
      if (key.startsWith("pathway-")) return "pathways";
      return null;
    };

    const showAcademyPanel = (target, { scroll = false, updateHash = false } = {}) => {
      if (!academyPanelKeys.has(target)) return;
      academyPanels.forEach((panel) => {
        panel.hidden = panel.dataset.academyPanel !== target;
      });
      academySectionButtons.forEach((button) => {
        const active = button.dataset.academySection === target;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
      if (updateHash && window.history?.replaceState) {
        window.history.replaceState(null, "", `#${target}`);
      }
      if (scroll) {
        requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" }));
      }
    };

    academySectionButtons.forEach((button) => button.addEventListener("click", () => {
      showAcademyPanel(button.dataset.academySection, { scroll: true, updateHash: true });
    }));

    academyShowLinks.forEach((link) => link.addEventListener("click", (event) => {
      const target = link.dataset.academyShow;
      if (!academyPanelKeys.has(target)) return;
      event.preventDefault();
      showAcademyPanel(target, { scroll: true, updateHash: true });
    }));

    const initialPanel = panelForHash(window.location.hash) || "courses";
    showAcademyPanel(initialPanel);

    let deepTargetId = "";
    try {
      deepTargetId = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : "";
    } catch {
      // Ignore an invalid fragment without interrupting the remaining controls.
    }
    const deepTarget = deepTargetId ? document.getElementById(deepTargetId) : null;
    if (deepTarget && window.location.hash !== `#${initialPanel}`) {
      requestAnimationFrame(() => deepTarget.scrollIntoView({ block: "start" }));
    }

    window.addEventListener("hashchange", () => {
      const target = panelForHash(window.location.hash);
      if (target) showAcademyPanel(target);
    });
  }


  // Academy Apply: switch between individual and organizational forms.
  const applySwitches = document.querySelectorAll("[data-apply-target]");
  const applyPanels = document.querySelectorAll("[data-apply-panel]");
  if (applySwitches.length && applyPanels.length) {
    const showApplyPanel = (target) => {
      applySwitches.forEach((button) => {
        const active = button.dataset.applyTarget === target;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", active ? "true" : "false");
        button.setAttribute("tabindex", active ? "0" : "-1");
      });
      applyPanels.forEach((panel) => {
        const active = panel.dataset.applyPanel === target;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });
    };
    applySwitches.forEach((button, index) => {
      button.addEventListener("click", () => showApplyPanel(button.dataset.applyTarget));
      button.addEventListener("keydown", (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        let targetIndex;
        switch (event.key) {
          case "ArrowLeft": targetIndex = (index - 1 + applySwitches.length) % applySwitches.length; break;
          case "ArrowRight": targetIndex = (index + 1) % applySwitches.length; break;
          case "Home": targetIndex = 0; break;
          case "End": targetIndex = applySwitches.length - 1; break;
          default: return;
        }
        event.preventDefault();
        applySwitches.forEach((tab, tabIndex) => tab.setAttribute("tabindex", tabIndex === targetIndex ? "0" : "-1"));
        applySwitches[targetIndex].focus();
      });
      button.addEventListener("blur", (event) => {
        if ([...applySwitches].includes(event.relatedTarget)) return;
        applySwitches.forEach((tab) => tab.setAttribute("tabindex", tab.getAttribute("aria-selected") === "true" ? "0" : "-1"));
      });
    
  // Open the EOI panel when a PDF or shared URL links to a specific EOI card.
  const openEoiFromHash = () => {
    const hash = window.location.hash;
    if (!hash || !hash.startsWith("#eoi-")) return;
    const target = document.querySelector(hash);
    const panel = document.getElementById("join-panel-eoi");
    const trigger = document.querySelector('[data-join-expand="eoi"]');
    if (!target || !panel) return;
    panel.hidden = false;
    trigger?.setAttribute("aria-expanded", "true");
    window.setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
  };
  openEoiFromHash();
  window.addEventListener("hashchange", openEoiFromHash);
});
    if (currentFile === "academy-apply.html") {
      const requestedType = new URLSearchParams(window.location.search).get("type");
      showApplyPanel(requestedType === "organization" || requestedType === "training" ? "organization" : "individual");
    }
  }

})();
