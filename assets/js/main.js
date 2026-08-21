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

  const form = document.querySelector(".contact-form-new");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const originalButton = button?.innerHTML ?? "Send inquiry";
    form.querySelector(".form-error")?.remove();
    if (button) {
      button.disabled = true;
      button.textContent = "Sending…";
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
      result.innerHTML = '<span aria-hidden="true">✓</span><h2>Thank you for reaching out.</h2><p>Your inquiry has been received. We will review it and respond with the most appropriate next step.</p><button type="button" class="button button-secondary">Send another inquiry</button>';
      form.hidden = true;
      form.after(result);
      result.querySelector("button")?.addEventListener("click", () => {
        form.reset();
        result.remove();
        form.hidden = false;
        if (interest && intentLabels[intent]) interest.value = intentLabels[intent];
      });
    } catch {
      const error = document.createElement("p");
      error.className = "form-error";
      error.setAttribute("role", "alert");
      error.innerHTML = 'The inquiry could not be sent. Please try again or email <a href="mailto:info@meal-bridge.com">info@meal-bridge.com</a>.';
      form.append(error);
    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML = originalButton;
      }
    }
  });
})();
