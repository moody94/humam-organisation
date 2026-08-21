# MEAL Bridge final website

This is the upload-ready static website for `meal-bridge.com`.

## Main pages

- `index.html` — Home
- `services.html` — Solutions
- `academy.html` — Academy catalogue, courses and pathways
- `academy-apply.html` — Academy application form
- `about.html` — About
- `contact.html` — Contact
- `404.html` — Page-not-found screen

`partners.html` and `join-us.html` safely redirect old links to the relevant contact form.

## SEO included

- Unique page titles and descriptions
- Canonical URLs
- Search-engine indexing directives
- Open Graph and X/Twitter sharing metadata
- Organization, service, course, FAQ, breadcrumb and person structured data
- XML sitemap and robots file
- Descriptive image alternatives, explicit image dimensions and image optimization
- Semantic headings, internal links, mobile-first layouts and a custom 404 page

## Academy application process

The Academy application form uses the existing Formspree endpoint. A CV is not requested during the first application. If a CV is needed, the Academy requests it later by email.

After uploading, submit one test Academy application. In Formspree, confirm that Academy application notifications are delivered to `academy@meal-bridge.com`. If the main contact form must continue going to `info@meal-bridge.com`, create a separate Formspree form for the Academy and replace the `action` address inside `academy-apply.html`.

## Manual image replacement

Replace a file inside `assets/images/` while keeping its exact filename and extension:

- `evidence-to-impact.webp` — Home hero and Solutions image
- `meal-ecosystem.webp` — Home ecosystem diagram
- `academy-partner.webp` — Hadeel Wardeh / Academy image
- `humam-alherk.webp` — Founder image
- `meal-bridge-logo.png` — Header logo

The `CNAME` file must remain in the repository root because it connects GitHub Pages to `meal-bridge.com`.
