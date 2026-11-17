# speedstu.tech

Personal portfolio: Rocket League bots, Trackmania simulation, and CUDA experiments on AMD hardware.

## Current design

The live site is deliberately small and bespoke. It is not a purchased portfolio template and it does not use AI-generated portfolio artwork.

It borrows **design principles**, not source code, from personal sites by designers such as [Rauno Fäderholm](https://rauno.me/) and [Paco Coursey](https://paco.me/), plus recurring design feedback on [r/webdesign](https://www.reddit.com/r/webdesign/). The emphasis is on typography, alignment, honest content and one distinctive interaction.

- Dark, photo-led cover with the original **speed type shit** copy.
- The exact V1 Rafale scroll path (seven keyframes), contrails, heading behind the aircraft and a white wipe into the project index.
- One editorial work index with a single sticky, context-sensitive preview instead of cards, chips, or numbered steps.
- No Marin section. No fabricated personal biography or corporate slogans.
- Real game screenshots and a GPU photo, plus the original Rafale artwork.
- The owner's two YouTube Music links, GitHub repositories, and **my github** footer.
- Mobile displays the same project images inline.
- Supports reduced motion, keyboard navigation, alt text and no-JavaScript fallback.
- Fully static. No external scripts, telemetry, forms, tracking, CDN dependency or private tokens.

## Files

- `index.html` — page content and accessible navigation.
- `index-v14.css` — one standalone stylesheet.
- `index-v14.js` — native scroll flight and image selection; animation only runs when scrolling.
- `assets/` — local photos and Rafale artwork.
- `404.html`, `_headers`, `CNAME`, `robots.txt`, `sitemap.xml` — Pages deployment and site metadata.

Old iterations are accessible in **Git history**. Production no longer carries their separate CSS/JS files.

## Media notes

Gameplay imagery is illustrative of the original games, not recordings of the user's bots.

- Rocket League screenshot: public game screenshot originally from TechSpot; Rocket League © Psyonix / Epic Games.
- Trackmania 2020 screenshot: press/media screenshot originally linked from DNA; Trackmania © Ubisoft / Nadeo.
- AMD Radeon photo: [Padgriffin](https://commons.wikimedia.org/wiki/File:AMD_Radeon_RX9060XT.png), under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- The Rafale imagery is the owner's previously deployed creative asset.

## Preview

```sh
python -m http.server 8000
```

Visit `http://localhost:8000`. Deployment uses GitHub Pages with `speedstu.tech` configured as custom domain.

**Security:** Keep Name.com tokens and GitHub credentials outside this repository. HTTPS enforcement depends on GitHub Pages issuing the domain certificate; check that separately.
