import { startNeuralAnimation, type NeuralWorkerMessage } from "./neural-network-animation"

let animation: ReturnType<typeof startNeuralAnimation> | undefined

self.addEventListener("message", ({ data }: MessageEvent<NeuralWorkerMessage>) => {
  if (data.type !== "start") {
    animation?.update(data)
    return
  }

  const ctx = data.canvas.getContext("2d")
  if (!ctx || typeof requestAnimationFrame !== "function") {
    self.postMessage("fallback")
    return
  }

  animation = startNeuralAnimation(ctx, data.viewport)
})
