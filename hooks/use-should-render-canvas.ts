"use client";

import { useEffect, useState } from "react";

export interface ShouldRenderCanvasOptions {
  /**
   * Media query string that defines small screens where the canvas should be disabled.
   * Defaults to "(max-width: 768px)".
   */
  smallScreenQuery?: string;
}

export function useShouldRenderCanvas(options: ShouldRenderCanvasOptions = {}) {
  const { smallScreenQuery = "(max-width: 768px)" } = options;
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const screenQuery = window.matchMedia(smallScreenQuery);
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateShouldRender = () => {
      setShouldRender(!screenQuery.matches && !motionQuery.matches);
    };

    updateShouldRender();

    const handleChange = () => updateShouldRender();

    screenQuery.addEventListener("change", handleChange);
    motionQuery.addEventListener("change", handleChange);

    return () => {
      screenQuery.removeEventListener("change", handleChange);
      motionQuery.removeEventListener("change", handleChange);
    };
  }, [smallScreenQuery]);

  return shouldRender;
}

export default useShouldRenderCanvas;
