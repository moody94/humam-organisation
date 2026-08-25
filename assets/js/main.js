(() => {
  const navigation = document.querySelector(".main-nav");
  const menuButton = document.querySelector(".menu-button");
  const closeButton = document.querySelector(".mobile-nav-label button");
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
    if (restoreFocus) menuButton?.focus();
  }

  function openNavigation() {
    if (!navigation || !menuButton) return;
    navigation.classList.add("is-open");
    document.body.classList.add("nav-open");
    menuButton.setAttribute("aria-expanded", "true");
    scrim = document.createElement("button");
    scrim.className = "nav-scrim";
    scrim.type = "button";
    scrim.setAttribute("aria-label", "Close navigation");
    scrim.addEventListener("click", () => closeNavigation({ restoreFocus: true }));
    document.querySelector(".site-header")?.append(scrim);
    closeButton?.focus();
  }

  menuButton?.addEventListener("click", () => {
    if (navigation?.classList.contains("is-open")) closeNavigation({ restoreFocus: true });
    else openNavigation();
  });
  closeButton?.addEventListener("click", () => closeNavigation({ restoreFocus: true }));
  navigation?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeNavigation()));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigation?.classList.contains("is-open")) {
      closeNavigation({ restoreFocus: true });
    }
  });

  const intentLabels = {
    consultancy: "MEAL consultancy",
    systems: "Systems development",
    partnership: "Partnership opportunity",
    academy: "Academy & training",
    join: "Join MEAL Bridge",
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
    "practice-application": '<span aria-hidden="true">✓</span><h2>Practice application received.</h2><p>Thank you. Your application will be reviewed by the relevant MEAL Bridge Practice team.</p><button type="button" class="button button-secondary">Submit another application</button>',
    "career-application": '<span aria-hidden="true">✓</span><h2>Application received.</h2><p>Thank you. The MEAL Bridge team will review your application against the selected opportunity.</p><button type="button" class="button button-secondary">Submit another application</button>',
  };

  document.querySelectorAll(".contact-form-new, .academy-application-form").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      if (button?.disabled) return;

      if (form === academyForm) syncAcademyApplication();
      const originalButton = button?.innerHTML || "Submit";
      const formType = form.dataset.formType || "contact";
      const fallbackEmail = form.dataset.fallbackEmail || "info@meal-bridge.com";
      form.querySelector(".form-error")?.remove();

      if (button) {
        button.disabled = true;
        button.textContent = formType === "contact" ? "Sending…" : "Submitting…";
      }

      try {
        const response = await fetch(form.action, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(formDataToObject(form)),
        });
        if (!response.ok) throw new Error(`Submission failed with status ${response.status}`);

        const result = document.createElement("div");
        result.className = "form-result form-result-success";
        result.setAttribute("role", "status");
        result.setAttribute("aria-live", "polite");
        result.setAttribute("tabindex", "-1");
        result.innerHTML = successContent[formType] || successContent.contact;
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
          form.querySelector("input, select, textarea")?.focus();
        });
      } catch {
        const error = document.createElement("p");
        error.className = "form-error";
        error.setAttribute("role", "alert");
        error.innerHTML = `The form could not be sent. Please try again or email <a href="mailto:${fallbackEmail}">${fallbackEmail}</a>.`;
        form.append(error);
      } finally {
        if (button) {
          button.disabled = false;
          button.innerHTML = originalButton;
        }
      }
    });
  });


  // V1.2 Join Us: expand pathway panels and prefill shared application forms.
  const joinExpandButtons = document.querySelectorAll("[data-join-expand]");
  const joinPanels = document.querySelectorAll("[data-join-panel]");
  const practiceShell = document.getElementById("practice-application");
  const careerShell = document.getElementById("career-application");

  function showJoinPanel(target) {
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
    document.getElementById(`join-panel-${target}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  joinExpandButtons.forEach((button) => button.addEventListener("click", () => showJoinPanel(button.dataset.joinExpand)));

  document.querySelectorAll(".practice-apply").forEach((button) => button.addEventListener("click", () => {
    if (!practiceShell) return;
    practiceShell.hidden = false;
    const select = practiceShell.querySelector('select[name="practice"]');
    if (select) select.value = button.dataset.practice || "";
    practiceShell.scrollIntoView({ behavior: "smooth", block: "start" });
  }));

  document.querySelectorAll(".career-apply").forEach((button) => button.addEventListener("click", () => {
    if (!careerShell) return;
    careerShell.hidden = false;
    const type = careerShell.querySelector('select[name="opportunity_type"]');
    const opportunity = careerShell.querySelector('select[name="opportunity"]');
    if (type) type.value = button.dataset.opportunityType || "";
    if (opportunity) opportunity.value = button.dataset.opportunity || "";
    careerShell.scrollIntoView({ behavior: "smooth", block: "start" });
  }));


  // Academy Apply: switch between individual and organizational forms.
  const applySwitches = document.querySelectorAll("[data-apply-target]");
  const applyPanels = document.querySelectorAll("[data-apply-panel]");
  if (applySwitches.length && applyPanels.length) {
    const showApplyPanel = (target) => {
      applySwitches.forEach((button) => {
        const active = button.dataset.applyTarget === target;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", active ? "true" : "false");
      });
      applyPanels.forEach((panel) => {
        const active = panel.dataset.applyPanel === target;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });
    };
    applySwitches.forEach((button) => button.addEventListener("click", () => showApplyPanel(button.dataset.applyTarget)));
    if (currentFile === "academy-apply.html") {
      const requestedType = new URLSearchParams(window.location.search).get("type");
      showApplyPanel(requestedType === "organization" || requestedType === "training" ? "organization" : "individual");
    }
  }

})();
