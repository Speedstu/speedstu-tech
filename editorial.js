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
