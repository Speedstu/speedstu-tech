# speedstu.tech

Personal portfolio for Rocket League bots, Trackmania simulation, and CUDA compatibility projects on AMD GPUs.

## V10 — Editorial

A deliberately quiet black-and-off-white layout. The design draws inspiration from minimalist editorial portfolios (including Voidfolio, Galery, DiazX) without copying their code or using a commercial template.

- `index.html` — single accessible document, all English
- `v10.css` — typography, editorial gallery layouts, mobile breakpoints
- `v10.js` — native WebGL backdrop, scroll timing, subtle interactions and reduced-motion control
- `assets/rafale-v1.webp` — translucent Rafale artwork within the hero
- `assets/marin-kitagawa.webp` — full-screen owner-supplied manga artwork, shown **without text**
- three featured projects: VelocityRL (private), TM2020-Sim and CUDA for AMD on Windows
- links to additional public GitHub repositories, and two owner-selected YouTube Music links in About

The 3D renderer uses native WebGL (no external animation library or remote CDN). It is disabled on narrow screens and drawing stops after the hero is offscreen. Interaction should never block keyboard access or content readability.

### Preview

Open `index.html` directly or serve from the repository directory:

```sh
python -m http.server 8000
```

Then visit http://localhost:8000.

### Deployment

This repository is deployed through GitHub Pages to speedstu.tech. DNS and `CNAME` are handled separately. **Never commit API keys, passwords, tokens, or `.env` files.**

### Media

The Rafale visual belongs to the site assets. The Marin image was supplied by the site owner for visual use. The project SVGs are abstract, illustrative interaction studies — not bot footage or benchmark measurements.

Older versions remain available through Git history.
