# Obaloluwa Adeleke: Portfolio

Primary portfolio covering AI automation and brand & design work. Static HTML, CSS and JavaScript, hosted on GitHub Pages at https://obaloluwaadeleke.github.io/portfolio/

The detailed automation case studies live on a separate site, https://obaloluwa-automates.vercel.app/, and the Work section links to them.

## Structure

```
index.html          Page content (all sections)
style.css           Design tokens and styles (also used by 404.html)
script.js           Nav, reveal, hero run log, work filter, contact form
404.html            Not-found page
site.webmanifest    PWA metadata
media/profile/      headshot.jpg
media/og-image.jpg  1200x630 link-preview image (og:image)
media/projects/     Brand & design project images (bams-energy.jpg is currently unused)
```

## Design system

- Light glass theme (palette B, emerald accent). Emerald `#0b7a5a` marks automation work; ink `#111111` marks brand & design work. Background `#f4f4f1`. The hero run log stays a dark terminal.
- Type: Instrument Serif (display), Geist (body), Geist Mono (labels and logs).
- Tokens live at the top of `style.css`.

## Run locally

```bash
npx serve -l 5500 .
```

## Editing content

- **Add an automation project:** copy a `card--auto` article in `#work-grid` and set `data-track="auto"`.
- **Add a brand project:** copy a `card--media` article, set `data-track="brand"`, and add the image under `media/projects/`.
- **Add an automation testimonial:** see the `NEED` comment in the Testimonials section and use a `quote quote--auto` figure.
- The contact form posts to Formspree (`action` in `index.html`).

## Open items

- Add real automation client testimonials.
