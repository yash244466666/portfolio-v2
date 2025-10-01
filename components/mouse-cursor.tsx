// "use client"

// // import { useCustomCursor } from "@/hooks/use-custom-cursor"
// // import { CursorDot } from "@/components/mouse-cursor/cursor-dot"
// // import { CursorOuter } from "@/components/mouse-cursor/cursor-outer"
// // import { CursorTrail } from "@/components/mouse-cursor/cursor-trail"
// import { useComponentInstrumentation } from "@/hooks/use-instrumentation"
// import { logComponentEvent } from "@/lib/instrumentation"

// export default function MouseCursor() {
//   const { shouldRender, cursorRef, outerRef, trailRef } = useCustomCursor()

//   useComponentInstrumentation("MouseCursor", {
//     stateSnapshot: () => ({ shouldRender }),
//     trackValues: () => ({ shouldRender }),
//     throttleMs: 1800,
//   })

//   logComponentEvent("MouseCursor", {
//     event: "render",
//     detail: { shouldRender },
//     throttleMs: 2500,
//   })

//   if (!shouldRender) {
//     return null
//   }

//   return (
//     <>
//       <CursorDot layerRef={cursorRef} />
//       <CursorOuter layerRef={outerRef} />
//       <CursorTrail layerRef={trailRef} />
//     </>
//   )
// }
