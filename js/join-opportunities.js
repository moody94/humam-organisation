(() => {
  // Edit this list to update each role's directory row, dialog card, application link, and share link.
  const opportunities = [
    {
      id: "eoi-ai-responsible-ai-fact-checking-trainer",
      name: "AI, Responsible AI & Fact-Checking Trainer",
      branch: "Academy",
      country: "Syria",
      division: "Academy Division",
      deadline: "2026-11-05T23:59:59+03:00",
      description: "Deliver practical training on AI, responsible AI use and fact-checking, helping learners understand and apply these skills.",
      profile: "Experience in AI, digital literacy or fact-checking, with the ability to communicate complex ideas clearly.",
      pdf: "assets/docs/eoi/EOI-01-AI-Responsible-Ethical-AI-Fact-Checking-Trainer.pdf",
      applyEmail: "careers@meal-bridge.com",
      applySubject: "EOI Application - AI, Responsible AI & Fact-Checking Trainer"
    },
    {
      id: "eoi-meal-trainer",
      name: "MEAL Trainer",
      branch: "Academy",
      country: "Syria",
      division: "Academy Division",
      deadline: "2026-11-05T23:59:59+03:00",
      description: "Deliver practical training in Monitoring, Evaluation, Accountability and Learning (MEAL), connecting concepts with real-world programme experience.",
      profile: "MEAL experience, knowledge of relevant tools and approaches, and strong facilitation and communication skills.",
      pdf: "assets/docs/eoi/EOI-02-MEAL-Trainer-Final-25Oct2026.docx.pdf",
      applyEmail: "careers@meal-bridge.com",
      applySubject: "EOI Application - MEAL Trainer"
    },
    {
      id: "eoi-professional-development-trainer",
      name: "Professional Development Trainer",
      branch: "Academy",
      country: "Syria",
      division: "Academy Division",
      deadline: "2026-11-05T23:59:59+03:00",
      description: "Help learners strengthen their professional communication, workplace skills, networking and career development.",
      profile: "Relevant professional experience and the ability to turn practical knowledge into engaging learning.",
      pdf: "assets/docs/eoi/EOI-03-Professional-Development-Trainer-Final-25Oct2026.docx.pdf",
      applyEmail: "careers@meal-bridge.com",
      applySubject: "EOI Application - Professional Development Trainer"
    },
    {
      id: "eoi-leadership-trainer",
      name: "Leadership Trainer",
      branch: "Academy",
      country: "Syria",
      division: "Academy Division",
      deadline: "2026-11-05T23:59:59+03:00",
      description: "Deliver practical learning experiences that help learners develop leadership, team management, decision-making and people-management skills.",
      profile: "Leadership or management experience and the ability to facilitate interactive, practice-oriented learning.",
      pdf: "assets/docs/eoi/EOI-04-Leadership-Trainer-Final-25Oct2026.docx.pdf",
      applyEmail: "careers@meal-bridge.com",
      applySubject: "EOI Application - Leadership Trainer"
    }
  ];

  window.MEALBridgeJoinOpportunities = opportunities;

  const directoryBody = document.querySelector("[data-opportunity-directory]");
  const opportunityList = document.querySelector("[data-opportunity-list]");
  if (!directoryBody || !opportunityList) return;

  const makeElement = (tagName, className, text) => {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  const deadlineFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Damascus"
  });

  const rows = opportunities.map((opportunity, index) => {
    const row = document.createElement("tr");
    row.append(makeElement("th", "", String(index + 1).padStart(2, "0")));
    row.cells[0].scope = "row";

    const nameCell = document.createElement("td");
    const nameButton = makeElement("button", "join-directory-link", opportunity.name);
    nameButton.type = "button";
    nameButton.dataset.opportunityId = opportunity.id;
    nameCell.append(nameButton);
    row.append(nameCell);
    row.append(makeElement("td", "", opportunity.branch));
    row.append(makeElement("td", "", opportunity.country));
    return row;
  });
  directoryBody.replaceChildren(...rows);

  const cards = opportunities.map((opportunity) => {
    const deadlineDate = new Date(opportunity.deadline);
    const formattedDeadline = deadlineFormatter.format(deadlineDate);
    const card = makeElement("article", "join-opportunity-card");
    card.id = opportunity.id;
    card.dataset.opportunityCard = "eoi";
    card.dataset.deadline = opportunity.deadline;
    card.dataset.deadlineLabel = `${formattedDeadline} Syria time`;

    card.append(makeElement("span", "opportunity-division division-academy", opportunity.division));
    card.append(makeElement("h4", "", opportunity.name));

    const location = makeElement("p", "opportunity-location");
    location.append(makeElement("strong", "", "Location:"), document.createTextNode(` ${opportunity.country}`));
    card.append(location);

    const dates = makeElement("dl", "opportunity-dates");
    const closeDate = makeElement("div");
    closeDate.append(
      makeElement("dt", "", "Closes"),
      makeElement("dd", "", `${formattedDeadline.replace(" at ", " · ")} Syria time`)
    );
    dates.append(closeDate);
    card.append(dates);

    card.append(makeElement("p", "", opportunity.description));
    const profile = makeElement("p", "opportunity-requirements");
    profile.append(makeElement("strong", "", "Key profile:"), document.createTextNode(` ${opportunity.profile}`));
    card.append(profile);

    const actions = makeElement("div", "opportunity-actions");
    const pdfLink = makeElement("a", "button button-secondary opportunity-pdf", "Opportunity PDF");
    pdfLink.href = opportunity.pdf;
    pdfLink.target = "_blank";
    pdfLink.rel = "noopener";

    const applyLink = makeElement("a", "button button-primary eoi-apply", "Apply");
    applyLink.dataset.opportunity = opportunity.id.replace(/^eoi-/, "");
    applyLink.href = `mailto:${opportunity.applyEmail}?subject=${encodeURIComponent(opportunity.applySubject)}`;

    const shareButton = makeElement("button", "content-share-button opportunity-share", "Share");
    shareButton.type = "button";
    shareButton.setAttribute("aria-label", `Share ${opportunity.name}`);
    shareButton.dataset.shareContent = "";
    shareButton.dataset.contentType = "expression_of_interest";
    shareButton.dataset.contentId = opportunity.id;
    shareButton.dataset.contentName = opportunity.name;

    actions.append(pdfLink, applyLink, shareButton);
    card.append(actions);
    return card;
  });
  opportunityList.replaceChildren(...cards);
})();
