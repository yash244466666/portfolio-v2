type Point = { x: number; y: number }

export type NeuralViewport = { width: number; height: number; pixelRatio: number }

export type NeuralUpdate =
  | { type: "resize"; viewport: NeuralViewport }
  | { type: "pointer"; point: Point | null }
  | { type: "pulse"; point: Point }

export type NeuralWorkerMessage =
  | { type: "start"; canvas: OffscreenCanvas; viewport: NeuralViewport }
  | NeuralUpdate

interface NeuralNode extends Point {
  vx: number
  vy: number
  radius: number
  baseOpacity: number
  pulse: number
  pulseSpeed: number
}

const NODE_COUNT = 40
const CONNECTION_DIST = 200
const MOUSE_RADIUS = 280
const PULSE_WAVE_SPEED = 300
const FRAME_DURATION = 1000 / 60
const NODE_COLOR = { r: 202, g: 138, b: 4 }
const ACTIVE_COLOR = { r: 250, g: 204, b: 21 }
const ENERGY_COLOR = { r: 253, g: 224, b: 71 }

function initNodes(width: number, height: number): NeuralNode[] {
  return Array.from({ length: NODE_COUNT }, () => {
    const angle = Math.random() * Math.PI * 2
    const speed = 0.1 + Math.random() * 0.25
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 2 + Math.random() * 2.5,
      baseOpacity: 0.4 + Math.random() * 0.4,
      pulse: 0,
      pulseSpeed: 0.5 + Math.random() * 1.5,
    }
  })
}

export function startNeuralAnimation(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  initialViewport: NeuralViewport,
) {
  let viewport: NeuralViewport = { width: 0, height: 0, pixelRatio: 0 }
  const nodes = initNodes(initialViewport.width, initialViewport.height)
  let pointer: Point | null = null
  let pulse: (Point & { time: number }) | null = null
  let frameId: number
  let previousTime: number | undefined
  const startTime = performance.now()

  function resize(next: NeuralViewport) {
    if (viewport.width === next.width && viewport.height === next.height && viewport.pixelRatio === next.pixelRatio) {
      return
    }
    viewport = next
    const pixelWidth = Math.round(next.width * next.pixelRatio)
    const pixelHeight = Math.round(next.height * next.pixelRatio)
    if (ctx.canvas.width !== pixelWidth) ctx.canvas.width = pixelWidth
    if (ctx.canvas.height !== pixelHeight) ctx.canvas.height = pixelHeight
    ctx.setTransform(pixelWidth / next.width, 0, 0, pixelHeight / next.height, 0, 0)
  }

  resize(initialViewport)
  // Draw the same gradient at the pointer using a translation to reuse its stops.
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, MOUSE_RADIUS)
  glow.addColorStop(0, `rgba(${ACTIVE_COLOR.r},${ACTIVE_COLOR.g},${ACTIVE_COLOR.b},0.05)`)
  glow.addColorStop(1, "transparent")

  function pointerInfluence(x: number, y: number) {
    if (!pointer) return 0
    const distanceSquared = (x - pointer.x) ** 2 + (y - pointer.y) ** 2
    return distanceSquared < MOUSE_RADIUS ** 2 ? 1 - Math.sqrt(distanceSquared) / MOUSE_RADIUS : 0
  }

  function draw(time: number) {
    const { width, height } = viewport
    const elapsed = (time - startTime) / 1000
    const fade = Math.min(1, Math.max(0, elapsed / 2))
    // Keep the original motion at 60 Hz and bound the catch-up after a delayed frame.
    const step = previousTime === undefined ? 1 : Math.min(3, (time - previousTime) / FRAME_DURATION)
    const damping = 0.985 ** step
    previousTime = time

    ctx.clearRect(0, 0, width, height)

    let pulseRadius = 0
    let pulseAlpha = 0
    if (pulse) {
      pulseRadius = Math.max(0, elapsed - pulse.time) * PULSE_WAVE_SPEED
      pulseAlpha = Math.max(0, 1 - pulseRadius / (Math.max(width, height) * 0.8))
      if (pulseAlpha === 0) pulse = null
    }

    for (const node of nodes) {
      if (pointer) {
        const dx = pointer.x - node.x
        const dy = pointer.y - node.y
        const distanceSquared = dx * dx + dy * dy
        if (distanceSquared > 0 && distanceSquared < MOUSE_RADIUS ** 2) {
          const distance = Math.sqrt(distanceSquared)
          const force = (1 - distance / MOUSE_RADIUS) * 0.3 * step
          node.vx += (dx / distance) * force
          node.vy += (dy / distance) * force
        }
      }

      node.vx *= damping
      node.vy *= damping
      const speedSquared = node.vx * node.vx + node.vy * node.vy
      if (speedSquared < 0.08 ** 2) {
        const speed = Math.sqrt(speedSquared) || 1
        node.vx = (node.vx / speed) * 0.08
        node.vy = (node.vy / speed) * 0.08
      }

      node.x += node.vx * step
      node.y += node.vy * step
      if (node.x < -20) node.x = width + 20
      if (node.x > width + 20) node.x = -20
      if (node.y < -20) node.y = height + 20
      if (node.y > height + 20) node.y = -20

      node.pulse = 0
      if (pulse) {
        const distance = Math.sqrt((node.x - pulse.x) ** 2 + (node.y - pulse.y) ** 2)
        const distanceToWave = Math.abs(distance - pulseRadius)
        if (distanceToWave < 80) node.pulse = (1 - distanceToWave / 80) * pulseAlpha
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]
      const energyPhase = (elapsed * 2 + i * 0.3) % 1
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const distanceSquared = dx * dx + dy * dy
        if (distanceSquared >= CONNECTION_DIST ** 2) continue

        const proximity = 1 - Math.sqrt(distanceSquared) / CONNECTION_DIST
        const mouse = pointerInfluence((a.x + b.x) / 2, (a.y + b.y) / 2)
        const connectionPulse = Math.max(a.pulse, b.pulse)
        const energyBrightness = connectionPulse > 0 ? connectionPulse : mouse * 0.5
        const activity = mouse + connectionPulse
        const alpha = proximity * 0.2 * fade + energyBrightness * 0.4
        const color = connectionPulse > 0.2 ? ENERGY_COLOR : mouse > 0.2 ? ACTIVE_COLOR : NODE_COLOR
        const red = Math.round(NODE_COLOR.r + (color.r - NODE_COLOR.r) * activity)
        const green = Math.round(NODE_COLOR.g + (color.g - NODE_COLOR.g) * activity)
        const blue = Math.round(NODE_COLOR.b + (color.b - NODE_COLOR.b) * activity)

        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = `rgba(${red},${green},${blue},${alpha})`
        ctx.lineWidth = 0.5 + activity * 1.5
        ctx.stroke()

        if (energyBrightness > 0.15) {
          ctx.beginPath()
          ctx.arc(a.x + dx * energyPhase, a.y + dy * energyPhase, 1.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${ACTIVE_COLOR.r},${ACTIVE_COLOR.g},${ACTIVE_COLOR.b},${energyBrightness * 0.7 * fade})`
          ctx.fill()
        }
      }
    }

    for (const node of nodes) {
      const activity = pointerInfluence(node.x, node.y) + node.pulse
      const breathe = 0.8 + 0.2 * Math.sin(elapsed * node.pulseSpeed)
      const red = Math.round(NODE_COLOR.r + (ACTIVE_COLOR.r - NODE_COLOR.r) * activity)
      const green = Math.round(NODE_COLOR.g + (ACTIVE_COLOR.g - NODE_COLOR.g) * activity)
      const blue = Math.round(NODE_COLOR.b + (ACTIVE_COLOR.b - NODE_COLOR.b) * activity)
      const alpha = (node.baseOpacity + activity * 0.4) * breathe * fade

      ctx.beginPath()
      ctx.arc(node.x, node.y, node.radius + activity * 3, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${red},${green},${blue},${alpha})`
      ctx.fill()

      if (activity > 0.2) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * 4 + activity * 6, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${ACTIVE_COLOR.r},${ACTIVE_COLOR.g},${ACTIVE_COLOR.b},${activity * 0.1 * fade})`
        ctx.fill()
      }
    }

    if (pointer && pointer.x > 0 && pointer.y > 0) {
      ctx.save()
      ctx.translate(pointer.x, pointer.y)
      ctx.globalAlpha = fade
      ctx.fillStyle = glow
      ctx.fillRect(-MOUSE_RADIUS, -MOUSE_RADIUS, MOUSE_RADIUS * 2, MOUSE_RADIUS * 2)
      ctx.restore()
    }

    frameId = requestAnimationFrame(draw)
  }

  frameId = requestAnimationFrame(draw)

  return {
    update(message: NeuralUpdate) {
      switch (message.type) {
        case "resize":
          resize(message.viewport)
          break
        case "pointer":
          pointer = message.point
          break
        case "pulse":
          pulse = { ...message.point, time: (performance.now() - startTime) / 1000 }
          break
      }
    },
    stop() {
      cancelAnimationFrame(frameId)
    },
  }
}
