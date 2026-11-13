"use client";

import { useEffect, useState } from "react";

export interface UseCyclingTypewriterOptions {
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  startDelay?: number;
}

export function useCyclingTypewriter(
  phrases: string[],
  {
    typingSpeed = 80,
    deletingSpeed = 50,
    pauseDuration = 2000,
    startDelay = 0,
  }: UseCyclingTypewriterOptions = {}
) {
  // Start with the first phrase fully typed: the server render and the first
  // client render therefore show a complete, meaningful label instead of an
  // empty line. The cycle deletes and retypes it after `pauseDuration`.
  const [displayText, setDisplayText] = useState(phrases[0] ?? "");
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [shouldStart, setShouldStart] = useState(startDelay === 0);

  useEffect(() => {
    if (startDelay === 0) {
      return;
    }

    const timer = setTimeout(() => {
      setShouldStart(true);
    }, startDelay);

    return () => clearTimeout(timer);
  }, [startDelay]);

  useEffect(() => {
    if (!shouldStart || phrases.length === 0) {
      return;
    }

    const currentPhrase = phrases[currentPhraseIndex];

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayText.length < currentPhrase.length) {
            setDisplayText(currentPhrase.slice(0, displayText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), pauseDuration);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText(displayText.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
          }
        }
      },
      isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timeout);
  }, [
    displayText,
    phrases,
    currentPhraseIndex,
    isDeleting,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    shouldStart,
  ]);

  return displayText;
}

export default useCyclingTypewriter;
