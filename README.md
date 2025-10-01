# Portfolio v2 Telemetry Instrumentation

This portfolio leverages a comprehensive client-side telemetry layer to help you inspect rendering, animation performance, and interaction flow across every React component. The instrumentation is opt-in and throttled so that you can explore behaviour without overwhelming the browser console.

## Enabling logs

- Set `NEXT_PUBLIC_ENABLE_LOGS=true` in your environment (e.g. in `.env.local`) before starting the dev server.
- Or toggle at runtime in the browser console:
  ```js
  window.__PORTFOLIO_TELEMETRY__?.setEnabled(true)
  // turn off again
  window.__PORTFOLIO_TELEMETRY__?.setEnabled(false)
  ```
- The last toggle state is persisted to `localStorage` under `portfolio:telemetry:enabled`.

When enabled, structured console groups will appear for renders, lifecycle events, throttled input handlers, animation frame summaries, and performance metrics.

## What gets reported

- **Render cycles** — duration, render count, component props/state snapshots, and heap usage (when supported by the browser).
- **Lifecycle events** — mounts, unmounts, visibility changes, and key value transitions declared via instrumentation hooks.
- **Animation metrics** — frame durations and intervals for React Three Fiber scenes and other custom raf loops.
- **User interactions** — throttled analytics for scrolls, clicks, touch gestures, and async state transitions.

The telemetry layer automatically wraps React components, and critical surfaces are additionally hand-instrumented for richer metrics (3D background, navigation, contact form, loading flow, UI primitives, etc.).

## Runtime helpers

Open the browser console to access the helpers exposed on `window.__PORTFOLIO_TELEMETRY__`:

| Method | Description |
| --- | --- |
| `getEnabled()` | Returns the current logging state. |
| `setEnabled(boolean)` | Enables or disables telemetry and persists the preference. |
| `enable()` / `disable()` / `toggle()` | Convenience wrappers around `setEnabled`. |

## Development tips

- Logs are grouped and throttled: most surfaces emit roughly every 1.5–3 seconds, while the 3D background now uses a coarser 4–6 second cadence and movement deltas to avoid spam.
- Auto instrumentation sanitises prop payloads (functions, React elements, large objects) into concise descriptors to avoid console noise.
- Manual instrumentation hooks exist in `hooks/use-instrumentation.ts` if you need deeper metrics for new components.
- Global instrumentation lives in `lib/react-telemetry.ts`; importing this module once (see `app/page.tsx`) patches `React.createElement` on the client to attach telemetry to every component render.

Disable telemetry before shipping to production if you do not want debug logging available to end users.
