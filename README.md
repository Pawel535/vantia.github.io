# VANTIA Studio

Premium website for VANTIA Studio focused on high-end web design services, fast UX, and bilingual communication (PL/EN).

## What this project is

This repository contains the production website for VANTIA:
- marketing homepage with service, pricing, portfolio and blog sections,
- multilingual UI (Polish and English),
- modern visual effects with performance-focused behavior,
- contact form integrated with email delivery via FormSubmit.

## Tech stack

- HTML5 (semantic structure and SEO metadata)
- CSS3 (`styles.css` source, `styles.min.css` served in production)
- Vanilla JavaScript (`script.js` source, `script.min.js` served in production)
- FormSubmit (contact form delivery to email inbox)

No React or backend API is required to run the site. Node.js is only needed if you want to regenerate the minified files.

## Key features

- Premium landing page layout and branded UI
- Language switcher (PL/EN) with persisted preference
- Scroll reveal, counters, preloader, progress bar, canvas background
- Cookie banner with consent modes
- Contact form with:
  - validation (`name`, `email`, `project`),
  - anti-spam honeypot field,
  - AJAX submit and request timeout handling,
  - clear success/error notifications and a direct e-mail fallback.

## Project structure

```text
Vantia/
├── index.html                    # Main homepage
├── styles.css                    # Global styles source
├── styles.min.css                # Minified stylesheet loaded by the HTML
├── script.js                     # Frontend runtime source
├── script.min.js                 # Minified runtime loaded by the HTML
├── portfolio.html                # Portfolio page (case studies + concepts)
├── demos/                        # Six concept demos (noindex)
├── blog.html                     # Blog listing
├── blog/                         # Blog post pages
├── privacy.html                  # Privacy policy
├── terms.html                    # Terms of service
├── 404.html                      # Not-found page
├── assets/                       # Social image and editorial plates
├── sitemap.xml                   # SEO sitemap
└── README.md
```

## Local development

Because this is a static site, you can run it with any local web server.

### Option A (VS Code Live Server)
1. Open the project in VS Code / Cursor.
2. Open `index.html`.
3. Start **Live Server**.

### Option B (Python)
```bash
python -m http.server 5500
```
Then open `http://localhost:5500`.

## Editing styles and scripts

The HTML loads `styles.min.css` and `script.min.js`. Edit the source files (`styles.css`, `script.js`), then regenerate the production files:

```bash
npx --yes csso-cli styles.css -o styles.min.css
npx --yes terser script.js -c -m -o script.min.js
```

Do not edit only the minified files — the next build will overwrite them.

## Contact form setup

Current integration sends submissions to:
- `vantia.official@interia.pl` via the activated FormSubmit endpoint.
- The public HTML and AJAX endpoint use FormSubmit's hashed form ID
  (`2b3564f146adcea1b08422e8ed1a0c00`), so the e-mail address is not exposed
  in the page source.

If you want to change recipient:
1. Activate the new address with FormSubmit.
2. Open `index.html` and replace the form `action` URL.
3. Open `script.js` and edit `ContactForm.endpoint` with the matching
   `https://formsubmit.co/ajax/<form-id>` URL.
4. Regenerate `script.min.js`.

Recommended:
- keep `_captcha` and honeypot enabled,
- test both PL and EN flows,
- verify inbox and spam folder after changes.

Important for a new recipient: FormSubmit requires one-time activation. Submit the form once, then click the activation link sent to `vantia.official@interia.pl`. Until the address is activated, the AJAX endpoint returns an error (the site shows a direct e-mail fallback).

## Content updates

Typical edits:
- homepage content: `index.html`,
- visual style: `styles.css`,
- interactions and behavior: `script.js`,
- articles: files in `blog/`.

## Performance and quality notes

- Fonts and styles are loaded in non-blocking mode where possible.
- Native smooth scrolling replaces the former third-party scroll runtime.
- Hover/scroll motion is limited to fine pointers and disabled for `prefers-reduced-motion`.
- Heavy visual effects degrade gracefully on low-power devices.
- Form submission includes robust error handling and a direct e-mail fallback.

## Deployment

The site is static and can be deployed to:
- Vercel,
- Netlify,
- GitHub Pages,
- any static hosting.

After deployment, verify:
- language switching,
- contact form delivery,
- canonical/OG metadata,
- navigation and internal links.

## Maintainer

Project: **VANTIA Studio**  
Maintained by: **Pawel (Pawel535)**