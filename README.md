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

The forms submit through JavaScript as JSON and also retain a standard HTML `POST` action as a fallback. Every field has a Formspark-compatible `name`, required fields use browser validation, submit buttons are protected against repeated clicks, and a honeypot field is included.

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


Website update version: V1.4


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
