# speedstu.tech

An English-language personal portfolio for Rocket League bots, Trackmania simulation, and AMD GPU experiments.

## Design

- One **fixed full-screen scene** shared by the entire site.
- Transparent Rafale artwork moves behind the hero and the introduction as you scroll.
- Native, local **WebGL** draws a lightweight three-dimensional airflow sculpture (no CDN, shader library or remote runtime).
- The owner's original black-and-white Marin Kitagawa image takes over that same background farther down the page.
- Projects are shown with interactive **illustrative diagrams** rather than fabricated gameplay captures or generated product imagery.
- Native mouse interaction, semantic navigation, keyboard-accessible controls, a functional background-motion toggle, and reduced-motion support.
- WebGL is intentionally disabled on narrow screens for power efficiency.
- 3D rendering is capped at approximately 30 frames per second, with device pixel ratio capped at 1.4.

## Featured projects

VelocityRL (private), TM2020-Sim and CUDA for AMD on Windows (public). Additional public repository links are included.

## Local preview

Run from this directory:

```sh
python -m http.server 8000
```

Then visit http://localhost:8000. The site is static HTML, CSS, JS and local WebP assets. No build step.

## Deployment

GitHub Pages deploys the repository root to **speedstu.tech**. The DNS and CNAME are already configured. Don't upload credentials or .env files.

## Attribution

The Rafale scene is the site's existing creative illustration. The Marin artwork was supplied by the site owner; it is used as a visual design element, not an officially licensed anime product. Names and trademarks of games, hardware and media belong to their respective holders. Featured project diagrams are conceptual, not benchmarking data or bot screenshots.

## Files

- `index.html` — accessible content and SVG project diagrams.
- `v9.css` — dark editorial design, typography and responsive states.
- `v9.js` — native WebGL scene, interactive studies and scroll coordination.
- `assets/rafale-v1.webp` and `assets/marin-kitagawa.webp` — local visual assets.

Legacy static assets and styles remain temporarily for compatibility with cached older pages; earlier versions are also available in Git history.
