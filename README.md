# speedstu.tech

Personal portfolio for Rocket League bots, Trackmania simulation, and AMD GPU experiments. Static site deployed on GitHub Pages.

## V11 — Aether

An original interactive installation inspired by the **craft** rather than the code or assets of [mindcorpus.org](https://mindcorpus.org/) and a user-supplied web design video:

- **One shared scene** across the entire page with a custom WebGL particle renderer.
- Thousands of actual GPU-rendered particles: depth-graded dust, five-petal blossom sprites, and a connected 3D node network.
- Scroll-linked spatial morphing from neural network to a flowing particle field, and a translucent Rafale illustration.
- Pointer interaction that bends the particle field; click the open hero area to make a short ripple.
- Three curated, lightweight project previews with subtle 3D pointer tilt, Trackmania movement and a compute-grid animation.
- The owner's black-and-white Marin Kitagawa image appears as a completely silent **full-screen interlude**, with no overlaid text.
- All text is in English. The About section contains only the two requested YouTube Music links.
- Reduced-motion support, semantic anchors, keyboard-accessible menus and controls.
- Mobile fallback uses a lightweight 2D canvas instead of WebGL. Motion is capped at about 30 fps, device pixel ratio is capped at 1.5.
- No external fonts, JavaScript packages, tracking, cookies or image APIs. All visual assets are local.

### Source files

- `index.html` — content, navigation, accessible SVG illustrations.
- `v11.css` — responsive layout and art direction.
- `v11.js` — WebGL/canvas particle engine, pointer/scroll coordination and project interactions.
- `assets/rafale-v1.webp` — Rafale artwork.
- `assets/marin-kitagawa.webp` — owner-provided manga illustration.

### Local preview

```sh
python -m http.server 8000
```

Visit `http://localhost:8000`. No build tools required.

### Deployment and security

Pushing `main` publishes this static site via GitHub Pages to **speedstu.tech**. DNS remains managed separately at Name.com.

Never add credentials or `.env` files to this repository. The site has no analytics, form submission or third-party API calls. Images of games and characters are used as thematic artwork; the project diagrams are illustrations rather than measurements, benchmarks or footage of the bots.

Past versions remain in Git history.
