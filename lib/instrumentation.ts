import type { MutableRefObject } from "react";

type LogLevel = "log" | "info" | "warn" | "error";

type MetricRecord = {
  sum: number;
  min: number;
  max: number;
  count: number;
  lastLogged: number;
};

declare global {
  interface Window {
    __PORTFOLIO_TELEMETRY__?: {
      enabled: boolean;
      enable: () => void;
      disable: () => void;
      toggle: () => void;
      setEnabled: (value: boolean, persist?: boolean) => void;
      getEnabled: () => boolean;
    };
  }
}

const LOGGING_STORAGE_KEY = "portfolio:telemetry:enabled";
const DEFAULT_THROTTLE_MS = 1200;
const DEFAULT_SAMPLE_SIZE = 45;

interface ComponentLogPayload {
  event: string;
  detail?: Record<string, unknown>;
  level?: LogLevel;
  throttleMs?: number;
  group?: boolean;
}

interface RenderLogPayload {
  durationMs: number;
  renderCount: number;
  propsSnapshot?: Record<string, unknown>;
  stateSnapshot?: Record<string, unknown>;
  extraMetrics?: Record<string, unknown>;
  throttleMs?: number;
}

interface MetricOptions {
  units?: string;
  throttleMs?: number;
  sampleSize?: number;
  formatter?: (value: number) => number | string;
}

interface InstrumentationState {
  enabled: boolean;
  lastLogTimes: Map<string, number>;
  metricBuffers: Map<string, MetricRecord>;
}

const envFlag =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_ENABLE_LOGS === "true"
    : false;

const state: InstrumentationState = {
  enabled: envFlag,
  lastLogTimes: new Map(),
  metricBuffers: new Map(),
};

const manualComponents = new Set<string>();

export const registerManualInstrumentation = (name: string) => {
  if (!manualComponents.has(name)) {
    manualComponents.add(name);
  }
};

export const isComponentManuallyInstrumented = (name: string) =>
  manualComponents.has(name);

const safeNow = () => {
  if (
    typeof performance !== "undefined" &&
    typeof performance.now === "function"
  ) {
    return performance.now();
  }
  return Date.now();
};

const shouldLog = (key: string, throttleMs: number) => {
  const now = safeNow();
  const last = state.lastLogTimes.get(key);
  if (last && now - last < throttleMs) {
    return false;
  }
  state.lastLogTimes.set(key, now);
  return true;
};

const ensureWindowBridge = () => {
  if (typeof window === "undefined") {
    return;
  }

  const bridge = (
    window as typeof window & {
      __PORTFOLIO_TELEMETRY__?: {
        enabled: boolean;
        enable: () => void;
        disable: () => void;
        toggle: () => void;
        setEnabled: (value: boolean, persist?: boolean) => void;
        getEnabled: () => boolean;
      };
    }
  ).__PORTFOLIO_TELEMETRY__;

  type BridgeConfig = {
    enabled: boolean;
    enable: () => void;
    disable: () => void;
    toggle: () => void;
    setEnabled: (value: boolean, persist?: boolean) => void;
    getEnabled: () => boolean;
  };

  const config: BridgeConfig = bridge ?? {
    enabled: state.enabled,
    enable: () => {},
    disable: () => {},
    toggle: () => {},
    setEnabled: () => {},
    getEnabled: () => state.enabled,
  };

  const setEnabledInternal = (value: boolean, persist = true) => {
    state.enabled = value;
    config.enabled = value;
    if (persist) {
      try {
        window.localStorage.setItem(LOGGING_STORAGE_KEY, value ? "1" : "0");
      } catch (error) {
        console.warn("[telemetry] failed to persist logging preference", error);
      }
    }
  };

  config.setEnabled = setEnabledInternal;
  config.enable = () => setEnabledInternal(true);
  config.disable = () => setEnabledInternal(false);
  config.toggle = () => setEnabledInternal(!state.enabled);
  config.getEnabled = () => state.enabled;

  config.enabled = state.enabled;
  (
    window as typeof window & {
      __PORTFOLIO_TELEMETRY__?: typeof config;
    }
  ).__PORTFOLIO_TELEMETRY__ = config;
};

ensureWindowBridge();

if (typeof window !== "undefined") {
  try {
    const stored = window.localStorage.getItem(LOGGING_STORAGE_KEY);
    if (stored !== null) {
      state.enabled = stored === "1";
    }
  } catch (error) {
    console.warn("[telemetry] unable to read logging preference", error);
  }
  ensureWindowBridge();
}

export const isLoggingEnabled = () => state.enabled;

export const setLoggingEnabled = (value: boolean, persist = true) => {
  state.enabled = value;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(LOGGING_STORAGE_KEY, value ? "1" : "0");
    } catch (error) {
      console.warn("[telemetry] failed to persist logging preference", error);
    }
  }
  ensureWindowBridge();
};

const withLogging = (action: () => void) => {
  if (!state.enabled) {
    return;
  }
  action();
};

const logToConsole = (
  level: LogLevel,
  message: string,
  detail?: Record<string, unknown>,
  group = true
) => {
  if (group && typeof console.groupCollapsed === "function") {
    console.groupCollapsed(message);
    if (detail) {
      console[level](detail);
    }
    console.groupEnd();
  } else {
    if (detail) {
      console[level](message, detail);
    } else {
      console[level](message);
    }
  }
};

export const logComponentEvent = (
  component: string,
  payload: ComponentLogPayload
) => {
  const {
    event,
    detail = {},
    level = "info",
    throttleMs = DEFAULT_THROTTLE_MS,
    group = true,
  } = payload;
  const key = `${component}:${event}`;

  withLogging(() => {
    if (!shouldLog(key, throttleMs)) {
      return;
    }
    logToConsole(level, `[${component}] ${event}`, detail, group);
  });
};

export const logRenderCycle = (
  component: string,
  payload: RenderLogPayload
) => {
  const {
    durationMs,
    renderCount,
    propsSnapshot,
    stateSnapshot,
    extraMetrics,
    throttleMs = DEFAULT_THROTTLE_MS,
  } = payload;
  const key = `${component}:render`;

  withLogging(() => {
    if (!shouldLog(key, throttleMs)) {
      return;
    }

    const detail: Record<string, unknown> = {
      durationMs: Number(durationMs.toFixed(2)),
      renderCount,
    };

    if (propsSnapshot) {
      detail.props = propsSnapshot;
    }
    if (stateSnapshot) {
      detail.state = stateSnapshot;
    }
    if (extraMetrics) {
      detail.metrics = extraMetrics;
    }

    if (
      typeof performance !== "undefined" &&
      (
        performance as Performance & {
          memory?: { usedJSHeapSize: number; totalJSHeapSize: number };
        }
      ).memory
    ) {
      const { usedJSHeapSize, totalJSHeapSize } = (
        performance as Performance & {
          memory?: { usedJSHeapSize: number; totalJSHeapSize: number };
        }
      ).memory!;
      detail.memoryMB = {
        used: Number((usedJSHeapSize / (1024 * 1024)).toFixed(2)),
        total: Number((totalJSHeapSize / (1024 * 1024)).toFixed(2)),
      };
    }

    logToConsole("info", `[${component}] render`, detail);
  });
};

export const recordMetric = (
  component: string,
  metric: string,
  value: number,
  options?: MetricOptions
) => {
  const {
    units = "ms",
    throttleMs = DEFAULT_THROTTLE_MS,
    sampleSize = DEFAULT_SAMPLE_SIZE,
    formatter,
  } = options ?? {};
  const key = `${component}:${metric}`;
  const bucketKey = `${key}:bucket`;

  const record = state.metricBuffers.get(bucketKey) ?? {
    sum: 0,
    min: Number.POSITIVE_INFINITY,
    max: Number.NEGATIVE_INFINITY,
    count: 0,
    lastLogged: 0,
  };

  record.sum += value;
  record.count += 1;
  record.min = Math.min(record.min, value);
  record.max = Math.max(record.max, value);

  const shouldFlush =
    record.count >= sampleSize ||
    (safeNow() - record.lastLogged >= throttleMs && record.count > 0);

  if (!shouldFlush) {
    state.metricBuffers.set(bucketKey, record);
    return;
  }

  const average = record.sum / record.count;
  const formattedAverage = formatter
    ? formatter(average)
    : Number(average.toFixed(2));
  const formattedMin = formatter
    ? formatter(record.min)
    : Number(record.min.toFixed(2));
  const formattedMax = formatter
    ? formatter(record.max)
    : Number(record.max.toFixed(2));

  const payload = {
    samples: record.count,
    average: formattedAverage,
    min: formattedMin,
    max: formattedMax,
    units,
  };

  record.sum = 0;
  record.count = 0;
  record.min = Number.POSITIVE_INFINITY;
  record.max = Number.NEGATIVE_INFINITY;
  record.lastLogged = safeNow();

  state.metricBuffers.set(bucketKey, record);

  logComponentEvent(component, {
    event: `metric:${metric}`,
    detail: payload,
    throttleMs,
  });
};

export const createDurationTracker = (
  component: string,
  metric: string,
  options?: MetricOptions
) => {
  const start = safeNow();
  return () => {
    const end = safeNow();
    recordMetric(component, metric, end - start, options);
  };
};

export const trackMutation = (
  component: string,
  ref: MutableRefObject<{ version: number } | null | undefined>,
  event: string,
  throttleMs = DEFAULT_THROTTLE_MS
) => {
  if (!ref.current) {
    ref.current = { version: 0 };
  }

  ref.current.version += 1;

  logComponentEvent(component, {
    event,
    detail: { version: ref.current.version },
    throttleMs,
  });
};
