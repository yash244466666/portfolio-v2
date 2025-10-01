"use client";

import type { ComponentType, FC, ReactNode } from "react";
import React from "react";
import { useComponentInstrumentation } from "@/hooks/use-instrumentation";
import { isComponentManuallyInstrumented } from "@/lib/instrumentation";

const instrumentedCache = new WeakMap<
  ComponentType<unknown>,
  ComponentType<unknown>
>();
const WRAPPED_FLAG = "__IS_TELEMETRY_WRAPPED__" as const;
let patched = false;

type CreateElementArgs = Parameters<typeof React.createElement>;
type CreateElementTypeArg = CreateElementArgs[0];
type CreateElementPropsArg = CreateElementArgs[1];
type CreateElementChildrenArgs = unknown[];

const manualNameOverrides = new Set<string>([
  "Home",
  "Smooth3DBackground",
  "HexagonalInstancedMesh",
  "HexagonalGrid",
  "BackToTop",
  "Footer",
  "AboutSection",
  "ContactSection",
  "HeroSection",
  "Navigation",
  "ProjectsSection",
  "LoadingScreen",
  "MouseCursor",
  "DynamicLights",
  "BackgroundFallback",
  "Input",
  "UIButton",
  "Card",
  "CardHeader",
  "CardTitle",
  "CardDescription",
  "CardAction",
  "CardContent",
  "CardFooter",
]);

const sanitizeProps = (props: Record<string, unknown> | null | undefined) => {
  if (!props) {
    return {};
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (key === "children") {
      if (Array.isArray(value)) {
        sanitized.children = `children(${value.length})`;
      } else if (value === undefined || value === null) {
        sanitized.children = null;
      } else {
        sanitized.children = "child";
      }
      continue;
    }

    if (typeof value === "function") {
      sanitized[key] = "function";
      continue;
    }

    if (React.isValidElement(value)) {
      const elementType = describeElementType(value);
      sanitized[key] = `ReactElement(${elementType})`;
      continue;
    }

    if (Array.isArray(value)) {
      sanitized[key] = `Array(${value.length})`;
      continue;
    }

    if (value instanceof Date) {
      sanitized[key] = value.toISOString();
      continue;
    }

    if (typeof value === "object" && value !== null) {
      sanitized[key] = "Object";
      continue;
    }

    sanitized[key] = value;
  }

  return sanitized;
};

const describeElementType = (value: React.ReactNode) => {
  if (!React.isValidElement(value)) {
    return "unknown";
  }

  if (typeof value.type === "string") {
    return value.type;
  }

  const typeLike = value.type as { displayName?: string; name?: string };
  return typeLike.displayName ?? typeLike.name ?? "unknown";
};

const shouldSkipAutoInstrumentation = (componentName: string) => {
  if (!componentName || componentName === "Anonymous") {
    return true;
  }

  if (
    manualNameOverrides.has(componentName) ||
    isComponentManuallyInstrumented(componentName)
  ) {
    return true;
  }

  // Avoid wrapping React internals or already instrumented wrappers
  return (
    componentName.startsWith("Telemetry(") ||
    componentName.startsWith("Instrumented(")
  );
};

export const ensureReactTelemetryPatched = () => {
  if (patched || typeof window === "undefined") {
    return;
  }
  patched = true;

  const originalCreateElement = React.createElement;

  const telemetryCreateElement = ((
    type: CreateElementTypeArg,
    props: CreateElementPropsArg,
    ...children: CreateElementChildrenArgs
  ) => {
    if (typeof type === "function") {
      if (Reflect.get(type, WRAPPED_FLAG)) {
        return originalCreateElement.call(
          React,
          type,
          props,
          ...(children as ReactNode[])
        );
      }

      const componentName =
        (type as ComponentType<unknown>).displayName ??
        (type as ComponentType<unknown>).name ??
        "Anonymous";

      if (!shouldSkipAutoInstrumentation(componentName)) {
        let wrapped = instrumentedCache.get(type as ComponentType<unknown>);

        if (!wrapped) {
          const Wrapped: FC<Record<string, unknown>> = (componentProps) => {
            useComponentInstrumentation(componentName, {
              propsSnapshot: () => sanitizeProps(componentProps),
              throttleMs: 2000,
            });
            return originalCreateElement.call(
              React,
              type as ComponentType<unknown>,
              componentProps
            );
          };

          Wrapped.displayName = `Telemetry(${componentName})`;
          Reflect.set(Wrapped, WRAPPED_FLAG, true);
          instrumentedCache.set(
            type as ComponentType<unknown>,
            Wrapped as ComponentType<unknown>
          );
          wrapped = Wrapped as ComponentType<unknown>;
        }

        return originalCreateElement.call(
          React,
          wrapped,
          props,
          ...(children as ReactNode[])
        );
      }
    }

    return originalCreateElement.call(
      React,
      type,
      props,
      ...(children as ReactNode[])
    );
  }) as typeof React.createElement;

  React.createElement = telemetryCreateElement;
};

ensureReactTelemetryPatched();
