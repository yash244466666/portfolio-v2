"use client";

import type { ComponentType } from "react";
import { createElement, useCallback, useEffect, useRef } from "react";
import {
  createDurationTracker,
  isLoggingEnabled,
  logComponentEvent,
  logRenderCycle,
  recordMetric,
  registerManualInstrumentation,
} from "@/lib/instrumentation";

type SnapshotProducer = () => Record<string, unknown>;

type TrackableValues = () => Record<string, unknown>;

interface ComponentInstrumentationOptions {
  propsSnapshot?: SnapshotProducer;
  stateSnapshot?: SnapshotProducer;
  metricsSnapshot?: SnapshotProducer;
  trackValues?: TrackableValues;
  throttleMs?: number;
}

interface FrameInstrumentationOptions {
  metricName?: string;
  throttleMs?: number;
  sampleSize?: number;
  trackInterval?: boolean;
  units?: string;
}

export function useComponentInstrumentation(
  componentName: string,
  options?: ComponentInstrumentationOptions
) {
  const renderCountRef = useRef(0);
  const renderStartRef = useRef<number>(0);
  const prevTrackedValuesRef = useRef<Record<string, unknown>>({});

  const captureSnapshot = useCallback(
    (producer?: SnapshotProducer, label?: string) => {
      if (!producer) {
        return undefined;
      }
      try {
        return producer();
      } catch (error) {
        console.warn(
          label
            ? `[telemetry] failed to capture ${label} snapshot for ${componentName}`
            : `[telemetry] failed to capture snapshot for ${componentName}`,
          error
        );
        return undefined;
      }
    },
    [componentName]
  );

  const takeStateSnapshot = useCallback(() => {
    if (!options?.stateSnapshot) {
      return undefined;
    }
    try {
      return options.stateSnapshot();
    } catch (error) {
      console.warn(
        `[telemetry] failed to capture state snapshot for ${componentName}`,
        error
      );
      return undefined;
    }
  }, [componentName, options?.stateSnapshot]);

  renderCountRef.current += 1;
  renderStartRef.current =
    typeof performance !== "undefined" && typeof performance.now === "function"
      ? performance.now()
      : Date.now();

  registerManualInstrumentation(componentName);

  useEffect(() => {
    if (!isLoggingEnabled()) {
      return;
    }

    const propsSnapshot = captureSnapshot(options?.propsSnapshot, "props");

    logComponentEvent(componentName, {
      event: "mount",
      detail: propsSnapshot ? { props: propsSnapshot } : undefined,
      throttleMs: options?.throttleMs,
    });

    return () => {
      logComponentEvent(componentName, {
        event: "unmount",
        throttleMs: options?.throttleMs,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoggingEnabled()) {
      return;
    }

    const duration =
      (typeof performance !== "undefined" &&
      typeof performance.now === "function"
        ? performance.now()
        : Date.now()) - renderStartRef.current;

    const stateSnapshot = takeStateSnapshot();
    const propsSnapshot = captureSnapshot(options?.propsSnapshot, "props");
    const metricsSnapshot = captureSnapshot(
      options?.metricsSnapshot,
      "metrics"
    );

    logRenderCycle(componentName, {
      durationMs: duration,
      renderCount: renderCountRef.current,
      propsSnapshot: propsSnapshot as Record<string, unknown> | undefined,
      stateSnapshot,
      extraMetrics: metricsSnapshot,
      throttleMs: options?.throttleMs,
    });
  });

  useEffect(() => {
    if (!isLoggingEnabled() || !options?.trackValues) {
      return;
    }

    let nextValues: Record<string, unknown>;
    try {
      nextValues = captureSnapshot(options.trackValues, "tracked-values") ?? {};
    } catch (error) {
      return;
    }

    const previous = prevTrackedValuesRef.current;
    const changes: Record<string, { previous: unknown; next: unknown }> = {};

    const mergedKeys = new Set([
      ...Object.keys(previous),
      ...Object.keys(nextValues),
    ]);
    mergedKeys.forEach((key) => {
      if (!Object.is(previous[key], nextValues[key])) {
        changes[key] = {
          previous: previous[key],
          next: nextValues[key],
        };
      }
    });

    prevTrackedValuesRef.current = { ...nextValues };

    if (Object.keys(changes).length > 0) {
      logComponentEvent(componentName, {
        event: "value-change",
        detail: changes,
        throttleMs: options?.throttleMs,
      });
    }
  });
}

export function useFrameInstrumentation<TArgs extends unknown[]>(
  componentName: string,
  callback: (...args: TArgs) => void,
  options?: FrameInstrumentationOptions
) {
  const lastFrameTimeRef = useRef<number | null>(null);

  return useCallback(
    (...args: TArgs) => {
      if (!isLoggingEnabled()) {
        callback(...args);
        return;
      }

      const now =
        typeof performance !== "undefined" &&
        typeof performance.now === "function"
          ? performance.now()
          : Date.now();
      if (options?.trackInterval) {
        const last = lastFrameTimeRef.current;
        if (last !== null) {
          const delta = now - last;
          recordMetric(
            componentName,
            `${options.metricName ?? "frame"}:interval`,
            delta,
            {
              throttleMs: options.throttleMs,
              sampleSize: options.sampleSize,
              units: options.units ?? "ms",
              formatter: (value) => Number(value.toFixed(2)),
            }
          );
        }
        lastFrameTimeRef.current = now;
      }

      const stop = createDurationTracker(
        componentName,
        options?.metricName ?? "frame",
        {
          throttleMs: options?.throttleMs,
          sampleSize: options?.sampleSize,
          units: options?.units ?? "ms",
          formatter: (value) => Number(value.toFixed(2)),
        }
      );

      try {
        callback(...args);
      } finally {
        stop();
      }
    },
    [
      callback,
      componentName,
      options?.metricName,
      options?.sampleSize,
      options?.throttleMs,
      options?.trackInterval,
      options?.units,
    ]
  );
}

export function instrumentComponent<P>(
  Component: ComponentType<P>,
  componentName: string,
  optionsFactory?: (props: P) => ComponentInstrumentationOptions
) {
  const Instrumented = (props: P) => {
    const options = optionsFactory
      ? optionsFactory(props)
      : {
          propsSnapshot: () => ({ ...props } as Record<string, unknown>),
        };
    useComponentInstrumentation(componentName, options);
    return createElement(Component as ComponentType<any>, props as any);
  };

  Instrumented.displayName = `Instrumented(${
    Component.displayName ?? Component.name ?? "Component"
  })`;

  return Instrumented;
}
