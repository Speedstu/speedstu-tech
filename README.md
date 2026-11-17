# speedstu.tech

Personal portfolio for my Rocket League bots, Trackmania simulation and CUDA-on-AMD experiments.

## V12 — Index

A completely revised editorial site, inspired by strong work on [Awwwards](https://www.awwwards.com/), particularly the photography-first, minimal approach found in work by Gionatan Nese and Prødux. **No templates or proprietary site assets were copied.** The code is original.

### Interface

- Warm monochrome typography-led homepage with a mouse-responsive collage.
- Real Rocket League and Trackmania screenshots, and the existing Radeon/Rafale visuals — no AI-generated project artwork.
- Full-width photographic work, horizontally driven by ordinary vertical scrolling on desktop. The same sections are vertically stacked on mobile.
- Sharp type and restrained navigation, subtle parallax, responsive interactions, keyboard-accessible links.
- Full-screen owner-provided Marin illustration without any overlaid text.
- About contains only the owner's two YouTube Music links.
- The site is English-only. Reduced-motion users see a conventional vertical project list.
- Static HTML/CSS/JS, no remote JavaScript dependencies, cookies, analytics or forms.

### Contents

- `index.html` — markup, project links, accessibility
- `v12.css` — visual design and responsive layouts
- `v12.js` — scroll-linked gallery, theme changes, hover/mouse responses
- `assets/rocketleague-real.webp` — screenshot used as an illustrative image for Rocket League
- `assets/trackmania-real.webp` — screenshot used as an illustrative image for Trackmania 2020
- `assets/radeon-rx9060xt.webp` — existing Radeon card photograph
- `assets/rafale-v1.webp` — original Rafale art from V1
- `assets/marin-kitagawa.webp` — owner-supplied manga illustration

### Visual sources and attribution

These are illustrative photographs/screenshots of the underlying games and products, **not footage of the user's bots or simulations**.

- Rocket League screenshot: [GamesRadar+ review](https://www.gamesradar.com/rocket-league-review/) (game © Psyonix/Epic Games; screenshot hosted by GamesRadar+).
- Trackmania 2020 screenshot: [GameGrin game gallery](https://www.gamegrin.com/directory/game/trackmania-2020/images) (game © Ubisoft/Nadeo; screenshot hosted by GameGrin).
- GPU photograph: [Padgriffin / Wikimedia Commons](https://commons.wikimedia.org/wiki/File:AMD_Radeon_RX9060XT.png), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), modified for sizing/monochrome treatment.
- Marin image was supplied by the owner. The characters, marks and associated media belong to their respective rightsholders.

### Preview

Run `python -m http.server 8000` from this repository, then open `http://localhost:8000`.

### Deployment

GitHub Pages deploys the `main` branch to `speedstu.tech`. DNS management is separate. **Do not add credentials or API keys.** Previous versions are available in Git history.
