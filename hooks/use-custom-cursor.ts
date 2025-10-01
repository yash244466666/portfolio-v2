// "use client";

// import type { RefObject } from "react";
// import { useEffect, useRef, useState } from "react";

// type CursorRefs = {
//   cursorRef: RefObject<HTMLDivElement | null>;
//   outerRef: RefObject<HTMLDivElement | null>;
//   trailRef: RefObject<HTMLDivElement | null>;
// };

// const INTERACTIVE_TAGS = new Set(["BUTTON", "A"]);

// const isInteractiveElement = (target: EventTarget | null) => {
//   if (!(target instanceof HTMLElement)) {
//     return false;
//   }

//   return (
//     INTERACTIVE_TAGS.has(target.tagName) ||
//     target.classList.contains("cursor-pointer") ||
//     target.getAttribute("role") === "button"
//   );
// };

// export function useCustomCursor(): { shouldRender: boolean } & CursorRefs {
//   const [shouldRender, setShouldRender] = useState(false);

//   const cursorRef = useRef<HTMLDivElement>(null);
//   const outerRef = useRef<HTMLDivElement>(null);
//   const trailRef = useRef<HTMLDivElement>(null);

//   const positionRef = useRef({ x: 0, y: 0 });
//   const targetRef = useRef({ x: 0, y: 0 });
//   const animationRef = useRef<number | null>(null);
//   const isHoveringRef = useRef(false);
//   const isRunningRef = useRef(false);
//   const styleElementRef = useRef<HTMLStyleElement | null>(null);

//   useEffect(() => {
//     if (typeof window === "undefined" || typeof document === "undefined") {
//       return;
//     }

//     const detectMobile = () =>
//       /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
//         navigator.userAgent
//       ) ||
//       (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
//       window.innerWidth < 768;

//     const prefersReducedMotion = window.matchMedia(
//       "(prefers-reduced-motion: reduce)"
//     );
//     const shouldDisableCursor = detectMobile() || prefersReducedMotion.matches;

//     setShouldRender(!shouldDisableCursor);

//     if (shouldDisableCursor) {
//       return;
//     }

//     const handleMouseMove = (event: MouseEvent) => {
//       targetRef.current.x = event.clientX;
//       targetRef.current.y = event.clientY;
//     };

//     const handleMouseOver = (event: MouseEvent) => {
//       isHoveringRef.current = isInteractiveElement(event.target);
//     };

//     const handleMouseOut = (event: MouseEvent) => {
//       if (isInteractiveElement(event.target)) {
//         isHoveringRef.current = false;
//       }
//     };

//     const animate = () => {
//       if (!isRunningRef.current) {
//         return;
//       }

//       const cursor = cursorRef.current;
//       const outer = outerRef.current;
//       const trail = trailRef.current;

//       if (cursor && outer && trail) {
//         positionRef.current.x +=
//           (targetRef.current.x - positionRef.current.x) * 0.2;
//         positionRef.current.y +=
//           (targetRef.current.y - positionRef.current.y) * 0.2;

//         const baseCursorTransform = `translate3d(${
//           positionRef.current.x - 8
//         }px, ${positionRef.current.y - 8}px, 0)`;
//         const baseOuterTransform = `translate3d(${
//           positionRef.current.x - 24
//         }px, ${positionRef.current.y - 24}px, 0)`;
//         const baseTrailTransform = `translate3d(${
//           positionRef.current.x - 16
//         }px, ${positionRef.current.y - 16}px, 0)`;

//         if (isHoveringRef.current) {
//           cursor.style.transform = `${baseCursorTransform} scale(1.8)`;
//           outer.style.transform = `${baseOuterTransform} scale(1.5)`;
//           trail.style.transform = `${baseTrailTransform} scale(1.3)`;
//         } else {
//           cursor.style.transform = baseCursorTransform;
//           outer.style.transform = baseOuterTransform;
//           trail.style.transform = baseTrailTransform;
//         }
//       }

//       if (isRunningRef.current) {
//         animationRef.current = requestAnimationFrame(animate);
//       }
//     };

//     const startAnimation = () => {
//       if (!isRunningRef.current) {
//         isRunningRef.current = true;
//         animationRef.current = requestAnimationFrame(animate);
//       }
//     };

//     const stopAnimation = () => {
//       if (isRunningRef.current) {
//         isRunningRef.current = false;
//         if (animationRef.current !== null) {
//           cancelAnimationFrame(animationRef.current);
//           animationRef.current = null;
//         }
//       }
//     };

//     const handleVisibilityChange = () => {
//       if (document.hidden) {
//         stopAnimation();
//       } else {
//         startAnimation();
//       }
//     };

//     document.addEventListener("mousemove", handleMouseMove, { passive: true });
//     document.addEventListener("mouseover", handleMouseOver, { passive: true });
//     document.addEventListener("mouseout", handleMouseOut, { passive: true });
//     document.addEventListener("visibilitychange", handleVisibilityChange);

//     const style = document.createElement("style");
//     style.textContent = `
//       *, *::before, *::after {
//         cursor: none !important;
//       }
//       body, html {
//         cursor: none !important;
//       }
//       button, a, [role="button"] {
//         cursor: none !important;
//       }
//     `;
//     document.head.appendChild(style);
//     styleElementRef.current = style;

//     isRunningRef.current = true;
//     animationRef.current = requestAnimationFrame(animate);

//     return () => {
//       document.removeEventListener("mousemove", handleMouseMove);
//       document.removeEventListener("mouseover", handleMouseOver);
//       document.removeEventListener("mouseout", handleMouseOut);
//       document.removeEventListener("visibilitychange", handleVisibilityChange);

//       if (styleElementRef.current) {
//         document.head.removeChild(styleElementRef.current);
//         styleElementRef.current = null;
//       }

//       if (animationRef.current !== null) {
//         cancelAnimationFrame(animationRef.current);
//         animationRef.current = null;
//       }

//       isRunningRef.current = false;
//     };
//   }, []);

//   return {
//     shouldRender,
//     cursorRef,
//     outerRef,
//     trailRef,
//   };
// }

// export default useCustomCursor;
