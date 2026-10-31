"use client";

import { useEffect } from "react";

/** Root attribute that CSS uses to hide overflow (see app/globals.css). */
export const SCROLL_LOCK_ATTRIBUTE = "data-scroll-locked";

/**
 * Locks background scrolling while `locked` is true.
 *
 * The scrollbar gutter is reserved globally with `scrollbar-gutter: stable`
 * (see app/globals.css), so hiding the root overflow does not shift the page
 * or any fixed chrome. The previous scroll offset is restored when the lock is
 * released, even if the browser moved the document in the meantime.
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked || typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    const scrollY = window.scrollY;
    const previousScrollBehavior = root.style.scrollBehavior;

    root.setAttribute(SCROLL_LOCK_ATTRIBUTE, "true");

    return () => {
      root.removeAttribute(SCROLL_LOCK_ATTRIBUTE);

      if (window.scrollY !== scrollY) {
        // globals.css enables smooth scrolling; restoring must be instant.
        root.style.scrollBehavior = "auto";
        window.scrollTo(0, scrollY);
        root.style.scrollBehavior = previousScrollBehavior;
      }
    };
  }, [locked]);
}

export default useBodyScrollLock;
