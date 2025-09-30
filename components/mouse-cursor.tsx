"use client"

import { useCustomCursor } from "@/hooks/use-custom-cursor"
import { CursorDot } from "@/components/mouse-cursor/cursor-dot"
import { CursorOuter } from "@/components/mouse-cursor/cursor-outer"
import { CursorTrail } from "@/components/mouse-cursor/cursor-trail"

export default function MouseCursor() {
  const { shouldRender, cursorRef, outerRef, trailRef } = useCustomCursor()

  if (!shouldRender) {
    return null
  }

  return (
    <>
      <CursorDot layerRef={cursorRef} />
      <CursorOuter layerRef={outerRef} />
      <CursorTrail layerRef={trailRef} />
    </>
  )
}
