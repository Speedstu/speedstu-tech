# speedstu.tech

A personal portfolio for Rocket League bots, Trackmania simulation, and CUDA compatibility experiments on AMD GPUs.

## V13 — Flight Study

This edition restores the **last approved design before Marin** (commit `54aab32`) and carefully builds on top of it.

### Interactions
- The original V1 Rafale flight: **exact keyframes**, left-to-right pass, approach to camera, contrails and heading behind the plane. The aircraft choreography in `script.js` is unchanged.
- Custom depth-field renderer: a scroll-controlled 3D-perspective tunnel behind the Rafale, with pointer-responsive vanishing point and restrained illumination. Implemented locally in Canvas 2D, no remote 3D assets or stock scenes.
- Interactive color aperture on each project's real photo: the rest of the image stays monochrome. The color lens only runs on fine-pointer devices and is disabled for reduced motion.
- Full-width, alternating editorial project chapters (not rounded cards).
- The original `speed type shit` hero text, all-English content and the two owner-selected YouTube Music links.
- No Marin interlude and no fake portfolio slogans.
- Reduced-motion support, mobile graphics at lower detail, a maximum 30fps for the desktop flight effect, keyboard navigation and meaningful image alt text.
- Static GitHub Pages site with **no external JavaScript libraries, no ads, no analytics and no API tokens in the code**.

### Files
- `index.html` — content and project information.
- `styles.css` / `personal.css` / `script.js` — retained pre-Marin base.
- `v13.css` — V13 visual refinements.
- `v13.js` — depth field, responsive pointer interactions and optical image reveal.
- `assets/hero-rafale.webp` / `assets/rafale-v1.webp` — hero and flight artwork.
- `assets/rocketleague-real.webp` / `assets/trackmania-real.webp` — illustrative gameplay screenshots.
- `assets/radeon-rx9060xt.webp` — Radeon photograph.

### Media notes
The game images illustrate the actual games, not the user's bot runs. The Rocket League image comes from a game press screenshot and the Trackmania image from a game gallery. The Radeon image is by [Padgriffin](https://commons.wikimedia.org/wiki/File:AMD_Radeon_RX9060XT.png), shared under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

### Spline
A published Spline scene can be embedded after its owner exports a Spline Viewer URL, but V13 deliberately avoids inserting a generic third-party Spline scene. The original perspective field is lighter and keeps the restored Rafale interaction intact. Refer to the [Spline Viewer documentation](https://docs.spline.design/exporting-your-scene/web/exporting-as-spline-viewer) for a future authored scene.

### Local preview
```sh
python -m http.server 8000
```
Then visit `http://localhost:8000`.

### Deployment
The `main` branch is published by GitHub Pages to `speedstu.tech`. DNS is separate. Keep all credentials out of this repository. Previous designs remain available via Git history.
