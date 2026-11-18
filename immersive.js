"use strict";

const languageButton = document.querySelector("#language");
const translatedText = [...document.querySelectorAll("[data-fr]")].map((element) => ({
  element,
  english: element.textContent,
  french: element.dataset.fr,
}));
const translatedLabels = [...document.querySelectorAll("[data-fr-label]")].map((element) => ({
  element,
  english: element.getAttribute("aria-label"),
  french: element.dataset.frLabel,
}));
const languagePreference = "speedstu-lang";
let language = document.documentElement.lang;

function setLanguage(nextLanguage) {
  language = nextLanguage === "fr" ? "fr" : "en";
  const isEnglish = language === "en";
  document.documentElement.lang = language;
  languageButton.textContent = language.toUpperCase();
  for (const { element, french, english } of translatedText) {
    element.textContent = isEnglish ? english : french;
  }
  for (const { element, french, english } of translatedLabels) {
    element.setAttribute("aria-label", isEnglish ? english : french);
  }
}

try {
  setLanguage(localStorage.getItem(languagePreference));
} catch {
  setLanguage(language);
}

languageButton.hidden = false;
languageButton.addEventListener("click", () => {
  setLanguage(language === "fr" ? "en" : "fr");
  try {
    localStorage.setItem(languagePreference, language);
  } catch {
    // The language can still be changed when storage is disabled.
  }
});

const header = document.querySelector("#header");
const hero = document.querySelector("#home");
const flightToggle = document.querySelector("#flight-toggle");
const flyby = document.querySelector("#flight");
const flybyJet = flyby.querySelector(".flyby-jet");
// The seven V1 poses retained by V14, timed against the shorter transition.
const flightPath = [
  { time: 0, x: -113, y: 35, angle: -23, scale: .48 },
  { time: .17, x: -70, y: 25, angle: -16, scale: .61 },
  { time: .34, x: -17, y: 8, angle: -10, scale: .86 },
  { time: .47, x: 0, y: 0, angle: -7, scale: 1.05 },
  { time: .63, x: 28, y: -9, angle: -13, scale: 1.26 },
  { time: .78, x: 65, y: -21, angle: -21, scale: 1.45 },
  { time: 1, x: 155, y: -36, angle: -30, scale: 1.8 },
];
const navigation = [...header.querySelectorAll(".nav a")].map((link) => ({
  link,
  section: document.querySelector(link.hash),
}));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
let scrollFrame = 0;

function updateFlyby() {
  if (reducedMotion.matches) {
    flybyJet.style.removeProperty("--flyby-transform");
    return;
  }
  const bounds = flyby.getBoundingClientRect();
  if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
  const start = window.innerHeight * .9;
  const progress = Math.max(0, Math.min(1, (start - bounds.top) / (start + bounds.height * .1)));
  const endIndex = flightPath.findIndex(({ time }, index) => index > 0 && progress <= time);
  const from = flightPath[endIndex - 1];
  const to = flightPath[endIndex];
  const t = (progress - from.time) / (to.time - from.time);
  const eased = t * t * (3 - 2 * t);
  const interpolate = (key) => from[key] + (to[key] - from[key]) * eased;
  flybyJet.style.setProperty("--flyby-transform",
    `translate(calc(-50% + ${interpolate("x")}vw), calc(-50% + ${interpolate("y")}cqh)) rotate(${interpolate("angle")}deg) scale(${interpolate("scale")})`);
}

function updateScroll() {
  scrollFrame = 0;
  const navHeight = header.getBoundingClientRect().bottom;
  const heroBottom = hero.getBoundingClientRect().bottom;
  header.classList.toggle("is-docked", window.scrollY > 72);
  if (!reducedMotion.matches && heroBottom > 0) {
    hero.style.setProperty("--scroll-y", `${Math.min(52, Math.max(0, window.scrollY) * .13)}px`);
  }
  updateFlyby();
  const current = navigation.findLast(({ section }) => section.getBoundingClientRect().top <= navHeight + 58);
  for (const item of navigation) {
    if (item === current) item.link.setAttribute("aria-current", "location");
    else item.link.removeAttribute("aria-current");
  }
}

function requestScrollUpdate() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
}

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate);
window.addEventListener("pageshow", requestScrollUpdate);
reducedMotion.addEventListener("change", requestScrollUpdate);
updateScroll();

function setFlightMode(active) {
  flightToggle.setAttribute("aria-pressed", String(active));
  hero.classList.toggle("flight-active", active);
}

flightToggle.hidden = false;
flightToggle.addEventListener("click", () => {
  setFlightMode(flightToggle.getAttribute("aria-pressed") !== "true");
});
hero.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && flightToggle.getAttribute("aria-pressed") === "true") {
    setFlightMode(false);
    flightToggle.focus({ preventScroll: true });
  }
});

function attachPointerEffect(element, update, reset) {
  let frame = 0;
  element.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || reducedMotion.matches || event.pointerType === "touch") return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const bounds = element.getBoundingClientRect();
      update((event.clientX - bounds.left) / bounds.width - .5,
        (event.clientY - bounds.top) / bounds.height - .5);
    });
  });
  const clear = () => {
    cancelAnimationFrame(frame);
    reset();
  };
  element.addEventListener("pointerleave", clear);
  reducedMotion.addEventListener("change", clear);
  finePointer.addEventListener("change", clear);
}

attachPointerEffect(hero, (x, y) => {
  const amplitude = hero.classList.contains("flight-active") ? 31 : 15;
  hero.style.setProperty("--parallax-x", `${-x * amplitude}px`);
  hero.style.setProperty("--parallax-y", `${-y * amplitude}px`);
}, () => {
  hero.style.removeProperty("--parallax-x");
  hero.style.removeProperty("--parallax-y");
});

for (const card of document.querySelectorAll(".card")) {
  attachPointerEffect(card, (x, y) => {
    card.style.setProperty("--tilt-x", `${-y * 5}deg`);
    card.style.setProperty("--tilt-y", `${x * 5}deg`);
  }, () => {
    card.style.removeProperty("--tilt-x");
    card.style.removeProperty("--tilt-y");
  });
}

const labControls = document.querySelector("#lab-controls");
const tabs = [...labControls.querySelectorAll('[role="tab"]')];
const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));

function activateTab(index, moveFocus = false) {
  tabs.forEach((tab, tabIndex) => {
    const selected = tabIndex === index;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    panels[tabIndex].hidden = !selected;
  });
  if (moveFocus) tabs[index].focus();
}

tabs.forEach((tab, index) => {
  panels[index].setAttribute("role", "tabpanel");
  panels[index].setAttribute("aria-labelledby", tab.id);
  panels[index].tabIndex = 0;
  tab.addEventListener("click", () => activateTab(index));
  tab.addEventListener("keydown", (event) => {
    const positions = {
      ArrowLeft: (index + tabs.length - 1) % tabs.length,
      ArrowRight: (index + 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    if (!Object.hasOwn(positions, event.key)) return;
    event.preventDefault();
    activateTab(positions[event.key], true);
  });
});
activateTab(0);
labControls.hidden = false;
