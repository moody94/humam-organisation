(() => {
  "use strict";

  const currentFile = window.location.pathname.split("/").pop() || "index.html";
  const selectState = new WeakMap();
  const PRACTICE_INITIAL_KEY = "mealbridge_practice_initial_v151";
  const PRACTICE_CURRENT_KEY = "mealbridge_practice_current_v151";

  const text = (node) => (node?.textContent || "").replace(/\s+/g, " ").trim();
  const slug = (value) => String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
  const short = (value, max = 100) => String(value || "").trim().slice(0, max);

  function safeSessionGet(key) {
    try { return window.sessionStorage.getItem(key) || ""; } catch { return ""; }
  }
  function safeSessionSet(key, value) {
    try { window.sessionStorage.setItem(key, value); } catch { /* session-only fallback not required */ }
  }
  function safeSessionRemove(key) {
    try { window.sessionStorage.removeItem(key); } catch { /* no-op */ }
  }

  function track(eventName, parameters = {}, interactionType = "event") {
    return window.MEALBridgeAnalytics?.trackEvent?.(eventName, {
      interaction_type: interactionType,
      page_file: currentFile,
      ...parameters
    }) || false;
  }

  function bindClick(selector, handler) {
    document.querySelectorAll(selector).forEach((element) => {
      element.addEventListener("click", () => handler(element));
    });
  }

  function bindInfoDetails(selector, eventName, parameterBuilder) {
    document.querySelectorAll(selector).forEach((details) => {
      const summary = details.querySelector(":scope > summary");
      summary?.addEventListener("click", () => {
        // At click time `open` still reflects the pre-click state. Count openings only.
        if (details.open) return;
        track(eventName, parameterBuilder(details, summary), "info_seeking");
      });
    });
  }

  function bindSelect(selector, eventName, valueParameter, extraBuilder = () => ({})) {
    document.querySelectorAll(selector).forEach((select) => {
      selectState.set(select, select.value || "");
      select.addEventListener("change", () => {
        const previous = selectState.get(select) || "";
        const current = select.value || "";
        const params = {
          [valueParameter]: short(current),
          previous_value: short(previous),
          selection_changed: previous && previous !== current ? 1 : 0,
          ...extraBuilder(select, previous, current)
        };
        track(eventName, params, "event");
        selectState.set(select, current);
      });
    });
  }

  // HOME
  if (currentFile === "index.html") {
    bindClick('.home-hero .hero-actions a[href="solutions.html"]', () =>
      track("cta_clicked", { cta_name: "explore_solutions", section: "hero" }, "cta"));
    bindClick('.home-hero .hero-actions a[href="contact.html"]', () =>
      track("cta_clicked", { cta_name: "discuss_your_priorities", section: "hero" }, "cta"));
    bindClick('.division-grid .division-card .card-link', (link) => {
      const card = link.closest(".division-card");
      const name = text(card?.querySelector("h3")) || text(link).replace(/^Explore\s+/i, "");
      track("capability_card_clicked", { capability_name: short(name), section: "connected_capabilities" }, "event");
    });
    bindClick('.delivery-section a[href="about.html#approach"]', () =>
      track("working_principles_clicked", { section: "how_we_work" }, "info_seeking"));
    bindClick('.final-cta-section .final-cta a[href="contact.html"]', () =>
      track("cta_clicked", { cta_name: "start_the_conversation", section: "final_cta" }, "cta"));
  }

  // SOLUTIONS
  if (currentFile === "solutions.html") {
    bindClick('.service-overview .section-jump a', (link) => {
      const target = (link.getAttribute("href") || "").replace(/^#/, "");
      track("solution_path_clicked", { solution_path: target || slug(text(link)), section: "starting_point" }, "event");
    });
    bindInfoDetails('.faq-section .faq-list details', "faq_item_opened", (_details, summary) => ({
      question_id: slug(text(summary)), question_text: short(text(summary)), section: "faq"
    }));
    bindClick('.final-cta-section .final-cta a[href^="contact.html"]', () =>
      track("cta_clicked", { cta_name: "discuss_your_needs", section: "final_cta" }, "cta"));
  }

  // ACADEMY CATALOGUE
  if (currentFile === "academy.html") {
    bindClick('.academy-page-hero .hero-actions a[href="#courses"]', () =>
      track("cta_clicked", { cta_name: "explore_courses", section: "hero" }, "cta"));
    bindClick('[data-academy-section]', (button) =>
      track("academy_structure_clicked", { structure_item: button.dataset.academySection || slug(text(button)), section: "academy_structure" }, "event"));
    bindClick('.academy-catalog-nav a[href="academy-apply.html"]', () =>
      track("cta_clicked", { cta_name: "academy_apply", section: "academy_catalog_nav" }, "cta"));

    bindInfoDetails('details.academy-course-card', "academy_course_expanded", (details) => ({
      course_id: details.id, course_name: short(text(details.querySelector("h3"))), section: "courses"
    }));
    bindInfoDetails('details.professional-pathway-card', "academy_pathway_expanded", (details) => ({
      pathway_id: details.id, pathway_name: short(text(details.querySelector("h3"))), section: "pathways"
    }));

    bindClick('details.academy-course-card a[href*="type=course"]', (link) => {
      const card = link.closest("details");
      track("academy_course_apply_clicked", { course_id: card?.id || "", course_name: short(text(card?.querySelector("h3"))), section: "courses" }, "cta");
    });
    bindClick('details.professional-pathway-card a[href*="type=pathway"]', (link) => {
      const card = link.closest("details");
      track("academy_pathway_apply_clicked", { pathway_id: card?.id || "", pathway_name: short(text(card?.querySelector("h3"))), section: "pathways" }, "cta");
    });

    bindClick('.academy-pathway-cta a[href="academy-apply.html"]', () =>
      track("cta_clicked", { cta_name: "apply_or_request_guidance", section: "pathways" }, "cta"));
    bindClick('.organization-cta a[href*="type=organization"]', () =>
      track("cta_clicked", { cta_name: "request_organizational_training", section: "organizations" }, "cta"));
    bindClick('.academy-final-cta a[href="academy-apply.html"]', () =>
      track("cta_clicked", { cta_name: "apply_to_the_academy", section: "final_cta" }, "cta"));
  }

  // ACADEMY APPLY + ORGANIZATIONAL TRAINING FORMS
  if (currentFile === "academy-apply.html") {
    bindClick('[data-apply-target]', (button) =>
      track("academy_application_route_selected", { application_route: button.dataset.applyTarget || slug(text(button)), section: "application_switcher" }, "event"));
    bindSelect('[data-form-type="academy-application"] select[name="program"]', "academy_program_selected", "academy_program", (select) => ({
      program_type: short(select.selectedOptions[0]?.dataset.programType || "")
    }));
    bindSelect('[data-form-type="academy-application"] select[name="preferred_language"]', "academy_language_selected", "language");
  }

  if (currentFile === "academy-apply.html" || currentFile === "academy-training.html") {
    bindSelect('[data-form-type="organizational-training"] select[name="programme_format"]', "training_program_format_selected", "program_format");
    bindSelect('[data-form-type="organizational-training"] select[name="preferred_language"]', "training_language_selected", "language");
    bindSelect('[data-form-type="organizational-training"] select[name="delivery_format"]', "training_delivery_format_selected", "delivery_format");
  }

  // ABOUT
  if (currentFile === "about.html") {
    bindClick('.collaboration-section a[href*="intent=partnership"]', () =>
      track("cta_clicked", { cta_name: "explore_partnership", section: "collaboration" }, "cta"));
    bindClick('.final-cta-section .final-cta a[href="contact.html"]', () =>
      track("cta_clicked", { cta_name: "talk_with_meal_bridge", section: "final_cta" }, "cta"));
  }

  // JOIN US
  if (currentFile === "join-us.html") {
    bindClick('.join-page-hero .hero-actions a[href="#join-paths"]', () =>
      track("cta_clicked", { cta_name: "explore_your_opportunities", section: "hero" }, "cta"));
    bindClick('[data-join-expand]', (button) =>
      track("join_opportunity_clicked", { opportunity_type: button.dataset.joinExpand || slug(text(button)), section: "choose_your_path" }, "event"));

    document.querySelectorAll('.practice-apply').forEach((button) => {
      button.addEventListener("click", () => {
        const practice = button.dataset.practice || "";
        const select = document.querySelector('#practice-application select[name="practice"]');
        if (!safeSessionGet(PRACTICE_INITIAL_KEY)) safeSessionSet(PRACTICE_INITIAL_KEY, practice);
        safeSessionSet(PRACTICE_CURRENT_KEY, practice);
        if (select) selectState.set(select, practice);
        track("practice_card_clicked", { practice_name: short(practice), section: "professional_practices" }, "event");
      });
    });

    const practiceSelect = document.querySelector('#practice-application select[name="practice"]');
    if (practiceSelect) {
      selectState.set(practiceSelect, practiceSelect.value || safeSessionGet(PRACTICE_CURRENT_KEY) || "");
      practiceSelect.addEventListener("change", () => {
        const previous = selectState.get(practiceSelect) || safeSessionGet(PRACTICE_CURRENT_KEY) || "";
        const current = practiceSelect.value || "";
        let initial = safeSessionGet(PRACTICE_INITIAL_KEY);
        if (!initial) {
          initial = current;
          safeSessionSet(PRACTICE_INITIAL_KEY, current);
        }
        safeSessionSet(PRACTICE_CURRENT_KEY, current);
        track("practice_selection_changed", {
          initial_practice: short(initial),
          previous_practice: short(previous),
          new_practice: short(current),
          selection_changed: previous && previous !== current ? 1 : 0,
          section: "practice_application"
        }, "event");
        selectState.set(practiceSelect, current);
      });
    }

    bindInfoDetails('.join-faq details', "faq_item_opened", (_details, summary) => ({
      question_id: slug(text(summary)), question_text: short(text(summary)), section: "faq"
    }));
    bindClick('.join-final-cta a[href*="career-advisor"]', () =>
      track("cta_clicked", { cta_name: "talk_to_career_advisor", section: "final_cta" }, "cta"));
  }

  // CONTACT
  if (currentFile === "contact.html") {
    bindClick('.conversation-grid > a', (link) => {
      const cardName = text(link.querySelector("h2"));
      const target = new URL(link.href, window.location.href).searchParams.get("intent") || (cardName.toLowerCase().includes("consultancy") ? "consultancy_systems" : slug(cardName));
      track("contact_card_clicked", { contact_type: short(target), contact_card_name: short(cardName), section: "conversation_routes" }, "event");
    });
    bindSelect('[data-form-type="contact"] select[name="interest"]', "contact_topic_selected", "contact_topic");
    bindClick('.simple-cta a.button[href^="mailto:"]', () =>
      track("email_meal_bridge_clicked", { section: "simple_cta", email_role: "general_inquiries" }, "key_event"));
  }

  // WHITELISTED, NON-PII FORM CONTEXT FOR SUCCESS EVENTS.
  function getFormContext(formType, form) {
    if (!form) return {};
    if (formType === "academy-application") {
      const program = form.querySelector('select[name="program"]');
      const language = form.querySelector('select[name="preferred_language"]');
      return {
        academy_program: short(program?.value),
        program_type: short(program?.selectedOptions[0]?.dataset.programType || ""),
        academy_language: short(language?.value)
      };
    }
    if (formType === "organizational-training") {
      return {
        program_format: short(form.querySelector('select[name="programme_format"]')?.value),
        training_language: short(form.querySelector('select[name="preferred_language"]')?.value),
        delivery_format: short(form.querySelector('select[name="delivery_format"]')?.value)
      };
    }
    if (formType === "practice-application") {
      const submitted = form.querySelector('select[name="practice"]')?.value || "";
      const initial = safeSessionGet(PRACTICE_INITIAL_KEY) || submitted;
      return {
        initial_practice: short(initial),
        submitted_practice: short(submitted),
        selection_changed: initial && submitted && initial !== submitted ? 1 : 0
      };
    }
    if (formType === "contact") {
      return { contact_topic: short(form.querySelector('select[name="interest"]')?.value) };
    }
    return {};
  }

  function resetFormContext(formType) {
    if (formType === "practice-application") {
      safeSessionRemove(PRACTICE_INITIAL_KEY);
      safeSessionRemove(PRACTICE_CURRENT_KEY);
    }
  }

  window.MEALBridgeMeasurement = Object.freeze({ getFormContext, resetFormContext });

  // SHAREABLE CONTENT: Academy courses/pathways + Community and Professional Practice cards.
  function buildShareUrl(button) {
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("utm_source", "website_share");
    url.searchParams.set("utm_medium", "referral");
    url.searchParams.set("utm_campaign", "content_share");
    url.searchParams.set("shared_content_type", button.dataset.contentType || "content");
    url.searchParams.set("shared_content_id", button.dataset.contentId || "");
    url.hash = button.dataset.contentId ? `#${button.dataset.contentId}` : "";
    return url.toString();
  }

  async function copyShareLink(url) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
    const input = document.createElement("textarea");
    input.value = url;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.append(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();
    return copied;
  }

  function flashShareStatus(button, label) {
    const original = button.dataset.originalLabel || text(button) || "Share";
    button.dataset.originalLabel = original;
    button.textContent = label;
    window.setTimeout(() => { button.textContent = original; }, 1600);
  }

  document.querySelectorAll('[data-share-content]').forEach((button) => {
    button.addEventListener("click", async () => {
      const shareUrl = buildShareUrl(button);
      const contentType = button.dataset.contentType || "content";
      const contentId = button.dataset.contentId || "";
      const contentName = button.dataset.contentName || "MEAL Bridge";
      const payload = { title: `${contentName} | MEAL Bridge`, text: `Explore ${contentName} on MEAL Bridge.`, url: shareUrl };

      if (navigator.share) {
        try {
          await navigator.share(payload);
          track("content_shared", { content_type: contentType, content_id: contentId, content_name: short(contentName), share_method: "native_share" }, "advocacy_referral");
          flashShareStatus(button, "Shared");
          return;
        } catch (error) {
          if (error?.name === "AbortError") return;
        }
      }

      try {
        if (await copyShareLink(shareUrl)) {
          track("content_shared", { content_type: contentType, content_id: contentId, content_name: short(contentName), share_method: "copy_link" }, "advocacy_referral");
          flashShareStatus(button, "Link copied");
        }
      } catch {
        flashShareStatus(button, "Copy failed");
      }
    });
  });

  // Deep-link recipients land on and see the exact shared item.
  const shareQuery = new URLSearchParams(window.location.search);
  const sharedType = shareQuery.get("shared_content_type") || "";
  const sharedId = shareQuery.get("shared_content_id") || "";
  const sharedTarget = sharedId ? document.getElementById(sharedId) : null;

  if (sharedTarget && sharedType) {
    if (currentFile === "academy.html" && (sharedType === "academy_course" || sharedType === "academy_pathway")) {
      if (sharedTarget.tagName.toLowerCase() === "details") sharedTarget.open = true;
    }
    if (currentFile === "join-us.html") {
      const containingPanel = sharedTarget.closest("[data-join-panel]");
      const panelKey = containingPanel?.dataset.joinPanel || "";
      if (panelKey) {
        document.querySelectorAll('[data-join-panel]').forEach((panel) => { panel.hidden = panel.dataset.joinPanel !== panelKey; });
        document.querySelectorAll('[data-join-expand]').forEach((button) => button.setAttribute("aria-expanded", button.dataset.joinExpand === panelKey ? "true" : "false"));
        const practiceShell = document.getElementById("practice-application");
        const careerShell = document.getElementById("career-application");
        if (practiceShell) practiceShell.hidden = true;
        if (careerShell) careerShell.hidden = true;
      }
    }

    sharedTarget.classList.add("shared-content-target");
    requestAnimationFrame(() => sharedTarget.scrollIntoView({ behavior: "smooth", block: "center" }));
    window.setTimeout(() => sharedTarget.classList.remove("shared-content-target"), 4500);

    const sharedName = text(sharedTarget.querySelector("h3, h4")) || sharedTarget.dataset.contentName || sharedId;
    let sharedOpenTracked = false;
    const trackSharedOpen = () => {
      if (sharedOpenTracked) return;
      if (window.MEALBridgeAnalytics?.getConsent?.() !== "granted") return;
      sharedOpenTracked = track("shared_content_opened", {
        content_type: sharedType,
        content_id: sharedId,
        content_name: short(sharedName),
        share_source: "website_share"
      }, "advocacy_referral");
    };
    trackSharedOpen();
    document.addEventListener("mealbridge:analytics-consent", (event) => {
      if (event.detail?.state === "granted") trackSharedOpen();
    });
  }
})();
