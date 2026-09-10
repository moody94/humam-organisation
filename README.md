# MEAL Bridge — final GitHub Pages website

Upload the contents of this folder to the root of the GitHub repository that publishes `meal-bridge.com`.

## Main pages

- `index.html` — Home
- `solutions.html` — Consultancy and Systems Development
- `academy.html` — Academy catalogue, courses, pathways, and organizational training
- `academy-apply.html` — Individual Academy and mentoring application
- `academy-training.html` — Organizational training request
- `about.html` — About and founder profile
- `contact.html` — Contact, partnership, and professional-network inquiries
- `join-us.html` — Community, Professional Practices, internships, and open positions
- `privacy.html` — Privacy & Data Protection Policy and privacy-rights contact information

`services.html` remains as a compatibility redirect to `solutions.html`, so older links and bookmarks continue to work.

## Formspark connections

The website is already connected to these Formspark submission actions:

- Contact and Partnerships: `https://submit-form.com/7ARE8eDGE`
- Individual Academy Applications: `https://submit-form.com/HhDC3X93G`
- Organizational Training Requests: `https://submit-form.com/zAmPaD0Im`
- Professional Practice Applications: `https://submit-form.com/URUojGs3Z`

The forms submit through JavaScript as JSON and retain standard HTML `POST` actions. This does not provide a complete no-JavaScript flow: hidden Join Us and organizational panels, the mobile drawer, prefills and branded success/error handling depend on JavaScript. Every field has a Formspark-compatible `name`, required fields use browser validation, submit buttons are protected against repeated clicks, and a honeypot field is included.

### Required Formspark dashboard status

For notifications to remain active:

1. Keep the Contact form recipient active at `info@meal-bridge.com`.
2. Keep the two Academy form recipients active at the confirmed internal Academy recipient.
3. Keep the three published custom notification templates assigned to their correct forms.
4. Do not enable Turnstile, reCAPTCHA, hCaptcha, or Botpoison in the Formspark dashboard unless the matching website integration is added. Formspark's automatic filtering and the website honeypot remain available.

The website shows an immediate branded success message after every accepted submission. Submitter autoresponder emails are separate: they only begin after the Formspark workspace is upgraded and an autoresponder template is created and published for each form.

### Post-upload form test

Submit one test through each live submission path:

1. `contact.html`
2. `academy-apply.html` — individual Academy application
3. `academy-apply.html` or `academy-training.html` — organizational training request
4. `join-us.html` — Professional Practice application

Confirm that each test appears in the correct Formspark form and reaches the intended notification mailbox.

## Leadership images

- `assets/images/humam-alherk.webp` — Humam Alherk
- `assets/images/academy-partner.webp` — Hadeel Wardeh
- `assets/images/muhamed-kheer-abo-khalaf.webp` — Muhamed Kheer Abo Khalaf

The Muhamed image is the current temporary image. To replace it later without editing HTML, prepare the new portrait as WebP, keep the exact filename `muhamed-kheer-abo-khalaf.webp`, and replace the file in `assets/images`.

## SEO and technical files

- Canonical URLs, Open Graph tags, X/Twitter metadata, structured data, accessible image text, and page-specific titles and descriptions are included.
- `sitemap.xml`, `robots.txt`, `404.html`, `CNAME`, `favicon.svg`, and `og.png` are ready for GitHub Pages.
- `CNAME` must remain in the repository root to preserve the custom domain.
- Uploading these files does not change the domain's SSL certificate configuration.


Website update version: V1.5.2


## V1.4 privacy implementation

- Added `privacy.html` and linked it from the website footer.
- Added purpose-specific 18+ explicit data-processing consent and a Privacy Policy link to all live form flows.
- Kept existing Formspark endpoints, field names, JavaScript submission logic, layout behavior, and V1.3 mobile hotfix unchanged.
- Added the privacy page to `sitemap.xml`.

## V1.4 navigation/footer correction
- Privacy & Data Protection remains a standalone page and is intentionally excluded from primary navigation.
- Privacy & Data Protection is linked from the footer of every rendered website page.
- Primary navigation markup is normalized across rendered pages; active-state behavior is preserved.
- Legacy redirect stubs (`services.html`, `partners.html`) remain minimal redirects and are unchanged.

## V1.5 analytics and consent implementation

- Added privacy-first Google Analytics 4 integration using Measurement ID `G-D2C4KFRFYD`.
- Google Analytics does not load until a visitor selects **Accept analytics**; rejecting non-essential analytics prevents the external Google tag from loading.
- Advertising storage, advertising user data, advertising personalisation, and personalisation storage remain denied in the website consent configuration.
- Added a compact site-wide analytics consent banner and a **Cookie preferences** control in every rendered page footer so visitors can change their choice later.
- The visitor's analytics preference is stored locally in the browser and is not used for marketing or profiling.
- No personal/contact details or free-text answers are sent to Google Analytics. Successful events may include only the approved non-identifying categorical context described below.
- Added Formspark-confirmed conversion events for the four active submission flows:
  - `contact_inquiry_submitted`
  - `academy_application_submitted`
  - `organizational_training_submitted`
  - `practice_application_submitted`
- Conversion events fire only after Formspark returns a successful response.
- Updated the Privacy & Data Protection Policy to describe GA4, consent behavior, data categories, retention, disabled advertising features, and preference management.
- Existing Formspark endpoints, navigation, responsive files, founder-experience hotfix, page content, imagery, and unrelated JavaScript behavior remain unchanged.

### Post-upload analytics test

1. Open the website in a private/incognito window and confirm the analytics banner appears.
2. Select **Reject non-essential**, browse several pages, and confirm no `gtag/js` request is made to Google Tag Manager in browser developer tools.
3. Open **Cookie preferences**, select **Accept analytics**, and confirm the Google tag loads.
4. In Google Analytics, open **Reports > Realtime** and confirm your visit appears after acceptance.
5. Submit one test through each of the four live form flows and confirm the corresponding custom event appears in Realtime/DebugView after Analytics has processed it.
6. In GA4 **Admin > Data display > Events**, mark the four submission events as key events after they first appear if you want them reported as conversions/key events.



## V1.5.1 consolidated measurement plan

V1.5.1 adds the approved website interaction inventory without changing unrelated page content or existing form endpoints.

### Measurement categories
- **Key events / business outcomes:** successful Contact inquiry, Academy application, organizational training request, Professional Practice application, plus the explicit **Email MEAL Bridge** CTA click.
- **CTA events:** selected high-intent calls to action on Home, Solutions, Academy, About, and Join Us.
- **Information-seeking events:** Solutions/Join Us FAQ openings, working-principles exploration, Academy course expansions, and Academy pathway expansions.
- **Behavioral events:** capability/solution choices, Academy structure navigation, application route choices, selected Academy/training preferences, Contact topic selection, Professional Practice card interest, and Practice selection changes.
- **Advocacy/referral events:** sharing of Academy courses, Academy pathways, and Professional Practice cards, plus opening a website-generated shared-content link.

### Share architecture
- Share buttons are intentionally limited to shareable offerings: Academy course cards, Academy pathway cards, Professional Practice cards, and the Consultancy / Systems Development parent offerings and capability cards on Solutions.
- Mobile browsers use the native share sheet when supported; otherwise the site copies a trackable link.
- Shared URLs contain `utm_source=website_share`, `utm_medium=referral`, `utm_campaign=content_share`, and non-personal content identifiers.
- Shared Academy links open the exact course/pathway; shared Practice links open the Community/Professional Practices area and scroll to the exact Practice; shared Solutions links scroll to and highlight the exact Consultancy or Systems offering/capability.

### Privacy safeguards
- Analytics remains fully blocked until analytics consent is granted.
- No names, email addresses, phone numbers, organization names, free-text answers, motivation statements, or message contents are sent to GA4.
- Form-success events may include only the explicitly approved non-identifying dropdown context (for example programme, language, delivery format, contact topic, or Practice choice).
- Internship/Open Position form conversion tracking remains inactive while those application forms are hidden.


## V1.5.2 targeted update

- Extended the existing V1.5.1 share architecture on `solutions.html` only: the Consultancy and Systems Development parent offerings plus each of their six capability/service cards now have the same tracked Share behavior used elsewhere.
- Shared Solutions links deep-link to the exact parent offering or capability card and continue using the existing `content_shared` / `shared_content_opened` analytics events and website-share UTM attribution.
- Added a **Join for free** badge to the MEAL Bridge Community path card on `join-us.html`.
- Added a clear free-of-charge notice in the Professional Practice application header while preserving the existing eligibility/selection distinction.
- Added the FAQ **Is it free to join the MEAL Bridge Community?**; it is automatically covered by the existing `faq_item_opened` analytics tracking.
- Preserved the manually updated current social-preview artwork as `og.png`.
- No Formspark endpoints, form fields, navigation, privacy/consent logic, existing analytics event names, responsive behavior, or unrelated page content were changed.

## Group 4 review candidate: consent and attribution

These local review changes are not a record of production deployment. Browser/network and GA4 report verification remain scheduled for final QA.

### Consent corrections (M04)
- Withdrawal sets the existing GA disable flag before updating a previously requested Google tag to denied consent. The external tag is still not requested for undecided or denied visitors.
- If saving a choice fails, that choice remains authoritative for the current page; an older stored grant cannot override a rejection. A later successfully saved choice resumes normal persistence.
- A change to the consent key in another same-origin tab synchronizes this tab's analytics state. Removal or invalidation of the key stops analytics without writing a replacement choice. The current stored value is read to avoid applying stale queued storage-event values. Other storage keys/areas are ignored.
- An accepted choice in another tab can initialize a previously unmeasured open page. An already initialized page reuses its tag and existing config. Each document retains at most one loader request and one config call from this script; no manual page_view, session_start, session-ID override or blanket event replay is added.
- A visible preferences status message follows a synchronized choice without moving focus. If storage cannot save the local choice, the current-page fallback remains in effect instead of accepting cross-tab overrides.
- Network-level stopping, consent transitions and resulting GA4 sessions still need final verification. The code changes alone do not establish the cause of missing landing pages or Unassigned traffic.

### Future campaign URL convention
| Field | Convention |
|---|---|
| `utm_source` | Lowercase platform identifier; use `linkedin` for new controlled LinkedIn links |
| `utm_medium` | `social` for organic LinkedIn; `paid_social` for paid LinkedIn campaigns |
| `utm_campaign` | Stable lowercase snake_case initiative name, such as `community_of_practice_launch` |
| `utm_content` | Stable placement/creative identifier; choose a new value only when the placement genuinely needs separate measurement |
| `utm_term` | Omit unless keyword or campaign requirements give it a defined purpose |

Include source, medium and campaign on new manually tagged campaign links. Do not include personal details in campaign parameters. Preserve functional content identifiers and fragments. Do not add UTMs to internal navigation.

Existing live campaign URLs, including the previously used Community of Practice LinkedIn link and its `organic_post` content value, are not changed. Standardization applies to future controlled links; it does not merge historical source rows. The website's generic share buttons retain `website_share / referral / content_share` because the chosen destination application is not reliably known.

### Shared-content and report interpretation (M06)
- The existing `shared_content_opened` event still sends `share_source=website_share` whenever a valid shared-content target is opened, including manually tagged LinkedIn URLs. This legacy parameter cannot establish the actual traffic source or prove that a website Share button generated the URL.
- Preserve its name and values for historical continuity pending a report-specific decision. For a session acquisition question, use GA4's Session source/medium and Session channel dimensions, with an explicitly defined shared-content event filter. Do not silently replace a session-scoped field with an event-scoped field or sum session totals across overlapping event rows.
- A future event-level source parameter or a change to `share_source` requires an agreed meaning, a dated reporting transition and approval before implementation. No such schema change is included here.
- `(unknown / no landing page)` is not generated in this repository. Missing landing page, missing source/medium and Unassigned channel are distinct diagnostics. Investigate the exact report, dimensions, filters, fallback logic and consent/session traces before changing page-view behavior.

Final QA should compare first acceptance, stored acceptance, rejection, withdrawal/re-acceptance, two open tabs, storage failure, long-idle tabs, Academy history changes, legacy redirects and the five form flows. Confirm Enhanced Measurement and created/modified events in the GA4 property before concluding that duplicate or missing report rows are caused by the website. Existing measurement ID and event names remain unchanged.

## Active styles and maintenance boundaries

All ten rendered pages load only `assets/css/style.css` as an external stylesheet. Their existing inline mobile-navigation rules also apply. Preserve the live stylesheet's cascade and repeated page markup; changes to unused files will not fix the displayed site.

The six other CSS files are retained historical files and are not loaded by the current pages:

- `assets/css/components.css`
- `assets/css/utilities.css`
- `assets/css/variables.css`
- `assets/css/responsive.css`
- `assets/css/#U200f#U200fresponsive.css`
- The additional `responsive.css` filename prefixed by two U+200F right-to-left marks in `assets/css/`.

The last two names contain byte-identical content; they are distinct filenames. Do not rename, delete or add stylesheet links to these files as routine cleanup. Commented catalogue and career-form templates remain inactive; their presence is not evidence that a live route or tracking event should be enabled. Arabic and other language work is outside the current task.

The current review changes have not been deployed. Browser/visual checks against the exact source candidate, real Formspark receipt and GA4 property/report verification remain required before production sign-off. The original archive and previous review packages remain the comparison baselines.
