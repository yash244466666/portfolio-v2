"use client";

import { useEffect, useRef, useState } from "react";

type IntersectionObserverOptions = {
  root?: Element | Document | null;
  rootMargin?: string;
  threshold?: number | number[];
};

export interface SectionVisibilityOptions extends IntersectionObserverOptions {
  /**
   * Whether the observer should disconnect after the element becomes visible once.
   * Defaults to true.
   */
  once?: boolean;
  /**
   * Fallback value to force visibility when IntersectionObserver isn't supported or should be skipped.
   * Defaults to true.
   */
  fallbackVisible?: boolean;
  /**
   * Optional predicate to skip the observer when certain conditions are met (e.g. reduced motion).
   */
  shouldSkip?: () => boolean;
}

export function useSectionVisibility<T extends HTMLElement = HTMLElement>(
  options: SectionVisibilityOptions = {}
) {
  const {
    once = true,
    fallbackVisible = true,
    shouldSkip,
    root = null,
    rootMargin = "0px",
    threshold = 0.25,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<T | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (shouldSkip?.()) {
      setIsVisible(true);
      return;
    }

    const element = sectionRef.current;

    if (!element || !("IntersectionObserver" in window)) {
      setIsVisible(fallbackVisible);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [fallbackVisible, once, root, rootMargin, shouldSkip, threshold]);

  return { sectionRef, isVisible };
}

export default useSectionVisibility;
