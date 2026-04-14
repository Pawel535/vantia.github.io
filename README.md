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
- CSS3 (`styles.css` + responsive layout + visual system)
- Vanilla JavaScript (`script.js`, modular runtime behavior)
- FormSubmit (contact form delivery to email inbox)

No React, Node.js or backend API is required to run the site locally.

## Key features

- Premium landing page layout and branded UI
- Language switcher (PL/EN) with persisted preference
- Scroll reveal, counters, preloader, progress bar, canvas background
- Cookie banner with consent modes
- Contact form with:
  - validation (`name`, `email`, `subject`, `phone`, `project`),
  - anti-spam honeypot field,
  - AJAX submit and request timeout handling,
  - clear success/error notifications.

## Project structure

```text
Vantia/
├── index.html                    # Main homepage
├── styles.css                    # Global styles and sections
├── script.js                     # Frontend runtime modules
├── portfolio.html                # Portfolio page
├── blog.html                     # Blog listing
├── blog/                         # Blog post pages
├── privacy.html                  # Privacy policy
├── terms.html                    # Terms of service
├── 404.html                      # Not-found page
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

## Contact form setup

Current integration sends submissions to:
- `kikaspawel@gmail.com` via FormSubmit AJAX endpoint.

If you want to change recipient:
1. Open `script.js`.
2. Edit `ContactForm.endpoint`.
3. Replace the email in the URL:
   `https://formsubmit.co/ajax/your-email@example.com`.

Recommended:
- keep `_captcha` and honeypot enabled,
- test both PL and EN flows,
- verify inbox and spam folder after changes.

## Content updates

Typical edits:
- homepage content: `index.html`,
- visual style: `styles.css`,
- interactions and behavior: `script.js`,
- articles: files in `blog/`.

## Performance and quality notes

- Fonts and styles are loaded in non-blocking mode where possible.
- Heavy visual effects degrade gracefully on low-power devices.
- Preloader behavior is session-optimized.
- Form submission includes timeout and robust error handling.

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