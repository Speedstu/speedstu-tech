"use strict";

const languageButton = document.querySelector("#language");
const languagePreference = "speedstu-lang";
const translations = [];

for (const [dataAttribute, attribute] of [
  ["data-fr", null],
  ["data-fr-label", "aria-label"],
  ["data-fr-alt", "alt"],
]) {
  for (const element of document.querySelectorAll(`[${dataAttribute}]`)) {
    translations.push({
      element,
      attribute,
      english: attribute ? element.getAttribute(attribute) : element.textContent,
      french: element.getAttribute(dataAttribute),
    });
  }
}

function setLanguage(language) {
  const french = language === "fr";
  document.documentElement.lang = french ? "fr" : "en";
  languageButton.textContent = french ? "EN" : "FR";
  for (const translation of translations) {
    const { element, attribute } = translation;
    const content = french ? translation.french : translation.english;
    if (attribute) element.setAttribute(attribute, content);
    else element.textContent = content;
  }
}

if (languageButton) {
  try {
    setLanguage(localStorage.getItem(languagePreference));
  } catch {
    setLanguage(document.documentElement.lang);
  }

  languageButton.hidden = false;
  languageButton.addEventListener("click", () => {
    const language = document.documentElement.lang === "fr" ? "en" : "fr";
    setLanguage(language);
    try {
      localStorage.setItem(languagePreference, language);
    } catch {
      // The switch still works when storage is unavailable.
    }
  });
}

const hero = document.querySelector(".hero");
const jet = document.querySelector(".jet");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
const narrow = matchMedia("(max-width: 660px)");
let pointerX = 0;
let pointerY = 0;
let scheduled = false;

function renderMotion() {
  scheduled = false;
  if (!hero || !jet) return;
  if (reducedMotion.matches) {
    hero.style.removeProperty("--progress");
    jet.style.removeProperty("transform");
    return;
  }
  const bounds = hero.getBoundingClientRect();
  if (bounds.bottom < 0 || bounds.top > innerHeight) return;
  const progress = Math.min(1, Math.max(0, -bounds.top / Math.max(1, hero.offsetHeight - innerHeight)));
  hero.style.setProperty("--progress", progress);
  const travel = progress * progress * (3 - 2 * progress);
  const baseAngle = narrow.matches ? -21 : -16;
  jet.style.transform =
    `translate(calc(-50% + ${travel * 105 + pointerX * 1.4}vw), calc(-50% - ${travel * 40 + pointerY * 1.2}vh)) rotate(${baseAngle - travel * 15 + pointerX * 3}deg) scale(${1 + travel * .8})`;
}

function requestMotion() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(renderMotion);
}

if (hero) {
  document.documentElement.classList.add("motion-ready");
  addEventListener("scroll", requestMotion, { passive: true });
  addEventListener("resize", requestMotion);
  addEventListener("pageshow", requestMotion);
  reducedMotion.addEventListener("change", requestMotion);
  hero.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || reducedMotion.matches) return;
    pointerX = event.clientX / innerWidth - .5;
    pointerY = event.clientY / innerHeight - .5;
    requestMotion();
  });
  hero.addEventListener("pointerleave", () => {
    pointerX = 0;
    pointerY = 0;
    requestMotion();
  });
  requestMotion();
}
