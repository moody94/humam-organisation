(() => {
  const navigation = document.querySelector(".main-nav");
  const menuButton = document.querySelector(".menu-button");
  const closeButton = document.querySelector(".mobile-nav-label button");
  let scrim = null;

  function closeNavigation() {
    navigation?.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    menuButton?.setAttribute("aria-expanded", "false");
    scrim?.remove();
    scrim = null;
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
    scrim.addEventListener("click", closeNavigation);
    document.querySelector(".site-header")?.append(scrim);
  }

  menuButton?.addEventListener("click", () => {
    if (navigation?.classList.contains("is-open")) closeNavigation();
    else openNavigation();
  });
  closeButton?.addEventListener("click", closeNavigation);
  navigation?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNavigation));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNavigation();
  });

  const intentLabels = {
    service: "Consultancy or systems support",
    training: "Training and capacity development",
    partnership: "Partnership opportunity",
    join: "Join the professional network",
    question: "General inquiry",
  };
  const intent = new URLSearchParams(window.location.search).get("intent");
  const interest = document.querySelector('select[name="interest"]');
  if (interest && intentLabels[intent]) interest.value = intentLabels[intent];

  const academyForm = document.querySelector(".academy-application-form");
  const programSelect = academyForm?.querySelector('select[name="program"]');
  const applicationType = academyForm?.querySelector('input[name="application_type"]');
  const applicationSubject = academyForm?.querySelector('input[name="_subject"]');
  const requestedProgram = new URLSearchParams(window.location.search).get("program");

  function syncAcademyApplication() {
    if (!programSelect) return;
    const selectedOption = programSelect.selectedOptions[0];
    const programType = selectedOption?.dataset.programType ?? "";
    if (applicationType) applicationType.value = programType;
    if (applicationSubject) {
      applicationSubject.value = programSelect.value
        ? `New MEAL Bridge Academy application — ${programSelect.value}`
        : "New MEAL Bridge Academy application";
    }
  }

  function applyRequestedProgram() {
    if (!programSelect || !requestedProgram) return;
    const matchingOption = [...programSelect.options].find((option) => option.value === requestedProgram);
    if (matchingOption) programSelect.value = matchingOption.value;
    syncAcademyApplication();
  }

  applyRequestedProgram();
  programSelect?.addEventListener("change", syncAcademyApplication);

  document.querySelectorAll(".contact-form-new, .academy-application-form").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (form === academyForm) syncAcademyApplication();

      const button = form.querySelector('button[type="submit"]');
      const originalButton = button?.innerHTML ?? "Submit";
      const isAcademyApplication = form === academyForm;
      const fallbackEmail = form.dataset.fallbackEmail || "info@meal-bridge.com";
      form.querySelector(".form-error")?.remove();

      if (button) {
        button.disabled = true;
        button.textContent = isAcademyApplication ? "Submitting…" : "Sending…";
      }

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("Submission failed");

        const result = document.createElement("div");
        result.className = "form-result form-result-success";
        result.setAttribute("role", "status");
        result.setAttribute("aria-live", "polite");
        result.innerHTML = isAcademyApplication
          ? '<span aria-hidden="true">✓</span><h2>Application received.</h2><p>The Academy will review your information before confirming dates, fees, and the separate enrollment step. If a CV is needed, we will request it by email.</p><button type="button" class="button button-secondary">Submit another application</button>'
          : '<span aria-hidden="true">✓</span><h2>Thank you for reaching out.</h2><p>Your inquiry has been received. We will review it and respond with the most appropriate next step.</p><button type="button" class="button button-secondary">Send another inquiry</button>';
        form.hidden = true;
        form.after(result);
        result.querySelector("button")?.addEventListener("click", () => {
          form.reset();
          result.remove();
          form.hidden = false;
          if (form === academyForm) applyRequestedProgram();
          if (form.classList.contains("contact-form-new") && interest && intentLabels[intent]) {
            interest.value = intentLabels[intent];
          }
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
})();
