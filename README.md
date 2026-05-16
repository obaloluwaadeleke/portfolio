# Obaloluwa Enoch Adeleke — Portfolio Website

## Project Structure

```
/portfolio
│
├── index.html        → Main HTML structure
├── style.css         → Complete CSS styling system
├── script.js         → All JavaScript interactions
│
└── /media
    ├── /profile
    │   └── headshot.jpg          ← Add your profile photo here
    │
    ├── /projects
    │   ├── webq.jpg              ← WebQ Solutions project image
    │   ├── seokits.jpg           ← SEO Kits project image
    │   ├── bams-energy.jpg       ← Bams Energy project image
    │   ├── queuesigns.jpg        ← Queuesigns project image
    │   └── bee-ileewa.jpg        ← Bee-Ileewa project image
    │
    ├── /certifications           ← Add cert images here
    ├── /icons                    ← Custom icons if needed
    └── /backgrounds              ← Background assets if needed
```

---

## Quick Setup

1. **Add your headshot** → Drop your photo into `media/profile/headshot.jpg`
2. **Add project images** → Drop each project screenshot/mockup into `media/projects/`
3. **Update contact details** → In `index.html`, find the Contact section and replace:
   - Email: `hello@obaloluwaadeleke.com`
   - Phone: `+234 800 000 0000`
   - Social links: Update the `href="#"` anchors in the Contact and Footer sections
4. **Connect your form** → In `script.js`, locate the `initContactForm()` function and replace the `setTimeout` simulation with your real form endpoint (Formspree, EmailJS, etc.)
5. **Deploy** → Upload all files to your hosting (GitHub Pages, Netlify, Namecheap, etc.)

---

## Customization Quick Reference

### Colors (in `style.css` — CSS Variables section)
```css
--clr-accent: #c8a96e;     /* Gold accent — change to your brand color */
--clr-bg: #0a0a0a;          /* Page background */
--clr-white: #ffffff;        /* Primary text */
```

### Fonts (in `style.css`)
```css
--font-display: 'DM Serif Display', Georgia, serif;   /* Headings */
--font-sans:    'Syne', sans-serif;                    /* UI text */
--font-body:    'DM Sans', sans-serif;                 /* Body text */
```

### Adding a New Project
In `index.html`, copy any `<article class="project-card">` block and update:
- `src="media/projects/your-image.jpg"`
- Project title, category, year, description

### Adding a New Testimonial
Copy a `.testimonial-card` div block and update the content.

---

## Tech Stack
- **HTML5** — Semantic structure
- **CSS3** — Grid, Flexbox, CSS variables, animations
- **Vanilla JavaScript** — Zero dependencies

---

Built by Obaloluwa Enoch Adeleke · Lagos, Nigeria
