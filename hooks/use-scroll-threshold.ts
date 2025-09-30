"use client";

import { useEffect, useState } from "react";

export function useScrollThreshold(threshold = 50) {
  const [passedThreshold, setPassedThreshold] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleScroll = () => {
      setPassedThreshold(window.scrollY > threshold);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return passedThreshold;
}

export default useScrollThreshold;
