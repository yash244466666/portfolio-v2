// Performance optimization utilities
export const PerformanceConfig = {
  // Device capability detection
  isLowEndDevice(): boolean {
    // Check multiple indicators for low-end devices
    const indicators = [
      // CPU cores
      (navigator.hardwareConcurrency || 0) < 4,

      // Memory (if available)
      (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4,

      // Mobile device
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ),

      // Screen size
      window.innerWidth < 768 || window.innerHeight < 600,

      // Connection speed
      (navigator as any).connection &&
        ["slow-2g", "2g", "3g"].includes(
          (navigator as any).connection.effectiveType
        ),

      // WebGL support
      !this.hasWebGLSupport(),
    ];

    // If 2 or more indicators suggest low-end device, treat as low-end
    return indicators.filter(Boolean).length >= 2;
  },

  hasWebGLSupport(): boolean {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      return !!gl;
    } catch (e) {
      return false;
    }
  },

  // Get optimal settings based on device capabilities
  getOptimalSettings() {
    const isLowEnd = this.isLowEndDevice();

    return {
      // Background settings
      useHeavy3DBackground: !isLowEnd,
      use2DParticles: isLowEnd,

      // Animation settings
      reduceAnimations: isLowEnd,
      animationDuration: isLowEnd ? 0.2 : 0.6,

      // Rendering settings
      devicePixelRatio: isLowEnd ? 1 : Math.min(window.devicePixelRatio, 1.5),
      antialiasing: !isLowEnd,

      // Feature toggles
      enableCustomCursor: !isLowEnd,
      enableComplexHovers: !isLowEnd,
      enableParallax: !isLowEnd,

      // Performance thresholds
      maxParticles: isLowEnd ? 10 : 30,
      targetFPS: isLowEnd ? 30 : 60,

      // Grid settings for 3D background
      gridDensity: isLowEnd ? 15 : 30, // Reduce grid size for low-end devices
      lightingComplexity: isLowEnd ? "simple" : "complex",
    };
  },

  // Performance monitoring
  createPerformanceObserver(
    callback: (entries: PerformanceObserverEntryList) => void
  ) {
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver(callback);
      observer.observe({ entryTypes: ["measure", "navigation"] });
      return observer;
    }
    return null;
  },

  // Memory usage monitoring (if available)
  getMemoryInfo() {
    const memory = (performance as any).memory;
    if (memory) {
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };
    }
    return null;
  },

  // FPS monitoring
  createFPSMonitor(callback: (fps: number) => void) {
    let lastTime = 0;
    let frameCount = 0;
    let fps = 0;

    function measureFPS(currentTime: number) {
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        callback(fps);
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    }

    requestAnimationFrame(measureFPS);
  },
};

// CSS-in-JS performance optimizations
export const performanceCSS = `
  /* Force GPU acceleration for specific elements */
  .gpu-layer {
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
  }
  
  /* Optimize repaints */
  .will-change-transform {
    will-change: transform;
  }
  
  .will-change-opacity {
    will-change: opacity;
  }
  
  /* Containment for better rendering performance */
  .contain-layout {
    contain: layout;
  }
  
  .contain-paint {
    contain: paint;
  }
`;

// React performance utilities
export const usePerformanceOptimized = () => {
  const settings = PerformanceConfig.getOptimalSettings();

  return {
    shouldReduceAnimations: settings.reduceAnimations,
    shouldUse3DBackground: settings.useHeavy3DBackground,
    shouldEnableCustomCursor: settings.enableCustomCursor,
    animationDuration: settings.animationDuration,
    maxParticles: settings.maxParticles,
    gridDensity: settings.gridDensity,
  };
};
