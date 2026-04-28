"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { useLanguage } from "@/context/LanguageContext";

const TEXT_EXCLUDE_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEXTAREA",
  "CODE",
  "PRE",
  "IFRAME",
  "SVG",
]);

const ATTRIBUTE_KEYS = ["placeholder", "title", "aria-label"];
const TRANSLATABLE_LOCALES = new Set(["bn", "ar"]);
const TRANSLATION_CACHE_KEY = "irwa-page-translation-cache-v2";
const NEVER_TRANSLATE_TEXTS = new Set([
  "irwaa",
  "irwa",
  "url",
  "faq",
  "seo",
  "ui",
  "ux",
]);
const TARGET_SCRIPT_REGEX = {
  ar: /[\u0600-\u06FF]/,
  bn: /[\u0980-\u09FF]/,
};

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function shouldTranslateText(value) {
  const text = normalizeText(value);
  if (!text) return false;
  if (NEVER_TRANSLATE_TEXTS.has(text.toLowerCase())) return false;
  if (/^[A-Z0-9&.\-\s]{2,12}$/.test(text) && !text.includes(" ")) {
    return false;
  }
  if (text.length === 1 && /[^\p{L}\p{N}]/u.test(text)) return false;
  return /[\p{L}]/u.test(text);
}

function hasTargetScript(value, locale) {
  return TARGET_SCRIPT_REGEX[locale]?.test(String(value || "")) || false;
}

function withOriginalSpacing(originalValue, translatedValue) {
  const original = String(originalValue || "");
  const leading = original.match(/^\s*/)?.[0] || "";
  const trailing = original.match(/\s*$/)?.[0] || "";
  return `${leading}${translatedValue}${trailing}`;
}

export default function PageLanguageTranslator() {
  const { isLanguageReady, locale } = useLanguage();
  const pathname = usePathname();
  const textOriginalsRef = useRef(new WeakMap());
  const attributeOriginalsRef = useRef(new WeakMap());
  const translationCacheRef = useRef(new Map());
  const jobRef = useRef(0);
  const renderedLocaleRef = useRef("en");

  useEffect(() => {
    try {
      const storedCache = window.sessionStorage.getItem(TRANSLATION_CACHE_KEY);
      if (!storedCache) return;

      Object.entries(JSON.parse(storedCache)).forEach(([key, value]) => {
        translationCacheRef.current.set(key, value);
      });
    } catch (error) {
      console.warn("Unable to load translation cache:", error);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const textOriginals = textOriginalsRef.current;
    const attributeOriginals = attributeOriginalsRef.current;
    const translationCache = translationCacheRef.current;

    const persistTranslationCache = () => {
      try {
        const entries = Array.from(translationCache.entries()).slice(-900);
        window.sessionStorage.setItem(
          TRANSLATION_CACHE_KEY,
          JSON.stringify(Object.fromEntries(entries)),
        );
      } catch (error) {
        console.warn("Unable to persist translation cache:", error);
      }
    };

    const rememberAttribute = (element, attributeName, value) => {
      const existing = attributeOriginals.get(element) || {};
      if (!(attributeName in existing)) {
        existing[attributeName] = value;
        attributeOriginals.set(element, existing);
      }
    };

    const restoreOriginals = () => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
      );

      let node = walker.nextNode();
      while (node) {
        const original = textOriginals.get(node);
        if (original !== undefined && node.textContent !== original) {
          node.textContent = original;
        }
        node = walker.nextNode();
      }

      document.body.querySelectorAll("*").forEach((element) => {
        const attributes = attributeOriginals.get(element);
        if (!attributes) return;

        Object.entries(attributes).forEach(([name, value]) => {
          if (value === null || value === undefined) {
            element.removeAttribute(name);
          } else if (element.getAttribute(name) !== value) {
            element.setAttribute(name, value);
          }
        });
      });
    };

    const collectTargets = () => {
      const textNodes = [];
      const attributeTargets = [];
      const texts = [];

      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            const parent = node.parentElement;
            if (!parent || TEXT_EXCLUDE_TAGS.has(parent.tagName)) {
              return NodeFilter.FILTER_REJECT;
            }
            if (parent.closest("[data-no-translate='true']")) {
              return NodeFilter.FILTER_REJECT;
            }
            return shouldTranslateText(node.textContent)
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT;
          },
        },
      );

      let node = walker.nextNode();
      while (node) {
        const currentValue = node.textContent || "";

        if (hasTargetScript(currentValue, locale)) {
          node = walker.nextNode();
          continue;
        }

        if (!textOriginals.has(node)) {
          textOriginals.set(node, currentValue);
        }

        const original = textOriginals.get(node);
        if (shouldTranslateText(original)) {
          textNodes.push({ node, original });
          texts.push(normalizeText(original));
        }

        node = walker.nextNode();
      }

      document.body.querySelectorAll("*").forEach((element) => {
        if (element.getAttribute("data-no-translate") === "true") return;
        if (TEXT_EXCLUDE_TAGS.has(element.tagName)) return;

        ATTRIBUTE_KEYS.forEach((attributeName) => {
          const currentValue = element.getAttribute(attributeName);
          if (!shouldTranslateText(currentValue)) return;
          if (hasTargetScript(currentValue, locale)) return;

          rememberAttribute(element, attributeName, currentValue);
          const original = attributeOriginals.get(element)?.[attributeName];

          if (shouldTranslateText(original)) {
            attributeTargets.push({ element, attributeName, original });
            texts.push(normalizeText(original));
          }
        });
      });

      return {
        attributeTargets,
        textNodes,
        texts: [...new Set(texts)].slice(0, 900),
      };
    };

    const translatePage = async () => {
      if (!TRANSLATABLE_LOCALES.has(locale)) return;

      const jobId = jobRef.current + 1;
      jobRef.current = jobId;

      if (renderedLocaleRef.current !== locale) {
        restoreOriginals();
        renderedLocaleRef.current = locale;
      }

      const { attributeTargets, textNodes, texts } = collectTargets();
      const missingTexts = texts.filter(
        (text) => !translationCache.has(`${locale}:${text}`),
      );

      for (let index = 0; index < missingTexts.length; index += 60) {
        if (jobRef.current !== jobId) return;

        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            target: locale,
            texts: missingTexts.slice(index, index + 60),
          }),
        });

        if (!response.ok || jobRef.current !== jobId) return;

        const payload = await response.json().catch(() => null);
        Object.entries(payload?.translations || {}).forEach(
          ([original, translated]) => {
            translationCache.set(
              `${locale}:${normalizeText(original)}`,
              translated || original,
            );
          },
        );
        persistTranslationCache();
      }

      if (jobRef.current !== jobId) return;

      textNodes.forEach(({ node, original }) => {
        if (!node.isConnected) return;
        const translated = translationCache.get(
          `${locale}:${normalizeText(original)}`,
        );
        if (translated) {
          node.textContent = withOriginalSpacing(original, translated);
        }
      });

      attributeTargets.forEach(({ element, attributeName, original }) => {
        if (!element.isConnected) return;
        const translated = translationCache.get(
          `${locale}:${normalizeText(original)}`,
        );
        if (translated) {
          element.setAttribute(attributeName, translated);
        }
      });
    };

    if (!isLanguageReady || !TRANSLATABLE_LOCALES.has(locale)) {
      jobRef.current += 1;
      restoreOriginals();
      renderedLocaleRef.current = "en";
      return undefined;
    }

    const timer = window.setTimeout(() => {
      translatePage().catch((error) => {
        console.error("Unable to translate page language:", error);
      });
    }, 250);

    return () => {
      window.clearTimeout(timer);
      jobRef.current += 1;
    };
  }, [isLanguageReady, locale, pathname]);

  return null;
}
