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

function shouldTranslateText(text) {
  const value = String(text || "").trim();
  if (!value) return false;
  if (value.length === 1 && /[^\p{L}\p{N}]/u.test(value)) return false;
  return /[\p{L}]/u.test(value);
}

function hasBengaliText(text) {
  return /[\u0980-\u09FF]/.test(String(text || ""));
}

export default function BengaliAutoTranslator() {
  const { isLanguageReady, locale } = useLanguage();
  const pathname = usePathname();
  const textNodeCacheRef = useRef(new Map());
  const attributeCacheRef = useRef(new Map());
  const activeJobRef = useRef(0);
  const jobSequenceRef = useRef(0);
  const translationCacheRef = useRef(new Map());

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const textNodeCache = textNodeCacheRef.current;
    const attributeCache = attributeCacheRef.current;
    const translationCache = translationCacheRef.current;

    const rememberAttribute = (element, attributeName, value) => {
      const existing = attributeCache.get(element) || {};
      if (!(attributeName in existing)) {
        existing[attributeName] = value;
        attributeCache.set(element, existing);
      }
    };

    const restoreOriginals = () => {
      textNodeCache.forEach((original, node) => {
        if (node?.isConnected) {
          node.textContent = original;
        }
      });

      attributeCache.forEach((attributes, element) => {
        if (!element?.isConnected) return;
        Object.entries(attributes).forEach(([name, value]) => {
          if (value === null || value === undefined) {
            element.removeAttribute(name);
          } else {
            element.setAttribute(name, value);
          }
        });
      });
    };

    const collectNodes = (root) => {
      const textNodes = [];
      const attributeNodes = [];

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ALL, {
        acceptNode(node) {
          if (node.nodeType === Node.TEXT_NODE) {
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
          }

          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node;
            if (
              TEXT_EXCLUDE_TAGS.has(element.tagName) ||
              element.getAttribute("data-no-translate") === "true"
            ) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_SKIP;
          }

          return NodeFilter.FILTER_SKIP;
        },
      });

      let currentNode = walker.nextNode();
      while (currentNode) {
        textNodes.push(currentNode);
        currentNode = walker.nextNode();
      }

      root.querySelectorAll?.("*").forEach((element) => {
        if (element.getAttribute("data-no-translate") === "true") return;
        ATTRIBUTE_KEYS.forEach((attributeName) => {
          const value = element.getAttribute(attributeName);
          if (shouldTranslateText(value)) {
            attributeNodes.push({ element, attributeName, value });
          }
        });
      });

      return { textNodes, attributeNodes };
    };

    const translateNodes = async (root = document.body) => {
      const jobId = jobSequenceRef.current + 1;
      jobSequenceRef.current = jobId;
      activeJobRef.current = jobId;

      const { textNodes, attributeNodes } = collectNodes(root);
      const texts = [];

      textNodes.forEach((node) => {
        const currentText = node.textContent;
        if (hasBengaliText(currentText)) {
          return;
        }

        const instantTranslation = translationCache.get(currentText);
        if (instantTranslation && instantTranslation !== currentText) {
          if (!textNodeCache.has(node)) {
            textNodeCache.set(node, currentText);
          }
          node.textContent = instantTranslation;
          return;
        }

        const cachedOriginal = textNodeCache.get(node);
        const original =
          cachedOriginal && cachedOriginal === currentText
            ? cachedOriginal
            : currentText;

        textNodeCache.set(node, original);

        if (shouldTranslateText(original) && !hasBengaliText(original)) {
          texts.push(original);
        }
      });

      attributeNodes.forEach(({ element, attributeName, value }) => {
        if (hasBengaliText(value)) return;
        const instantTranslation = translationCache.get(value);
        if (instantTranslation && instantTranslation !== value) {
          rememberAttribute(
            element,
            attributeName,
            element.getAttribute(attributeName),
          );
          element.setAttribute(attributeName, instantTranslation);
          return;
        }

        rememberAttribute(
          element,
          attributeName,
          element.getAttribute(attributeName),
        );
        texts.push(value);
      });

      const uniqueTexts = [
        ...new Set(
          texts.map((value) => String(value || "").trim()).filter(Boolean),
        ),
      ].slice(0, 420);
      if (!uniqueTexts.length) return;

      const translations = {};
      for (let index = 0; index < uniqueTexts.length; index += 70) {
        if (activeJobRef.current !== jobId) return;

        const response = await fetch("/api/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            target: "bn",
            texts: uniqueTexts.slice(index, index + 70),
          }),
        });

        if (!response.ok || activeJobRef.current !== jobId) {
          return;
        }

        try {
          const payload = await response.json();
          Object.assign(translations, payload?.translations || {});
        } catch {
          return;
        }
      }

      Object.entries(translations).forEach(([original, translated]) => {
        if (translated && translated !== original) {
          translationCache.set(original, translated);
        }
      });

      textNodes.forEach((node) => {
        const original = textNodeCache.get(node);
        if (!node?.isConnected || !original) return;
        const translated = translations[original] || original;
        if (node.textContent !== translated) {
          node.textContent = translated;
        }
      });

      attributeNodes.forEach(({ element, attributeName, value }) => {
        if (!element?.isConnected) return;
        if (hasBengaliText(element.getAttribute(attributeName))) return;
        const translated = translations[value] || value;
        if (element.getAttribute(attributeName) !== translated) {
          element.setAttribute(attributeName, translated);
        }
      });
    };

    if (!isLanguageReady || locale !== "bn") {
      activeJobRef.current = jobSequenceRef.current + 1;
      restoreOriginals();
      return undefined;
    }

    const timers = [250, 1200, 2800].map((delay) =>
      window.setTimeout(() => {
        translateNodes(document.body).catch((error) => {
          console.error("Unable to auto-translate page into Bengali:", error);
        });
      }, delay),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      activeJobRef.current = jobSequenceRef.current + 1;
    };
  }, [isLanguageReady, locale, pathname]);

  return null;
}
