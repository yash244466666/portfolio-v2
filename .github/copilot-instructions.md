# Anime.js v4 Agent Skill — Complete Animation Reference

> Copilot agent skill for **anime.js v4** in this Next.js React portfolio.
> Covers 100% of the official API: https://animejs.com/documentation/
> Items marked **JS** are JS-engine only. Items marked **WAAPI** are WAAPI only.

---

## Table of Contents

1. [Installation & Module Imports](#installation--module-imports)
2. [Using with React (Next.js)](#using-with-react-nextjs)
3. [Timer: createTimer()](#timer-createtimer)
4. [Animation: animate()](#animation-animate)
5. [Targets](#targets)
6. [Animatable Properties](#animatable-properties)
7. [Tween Value Types](#tween-value-types)
8. [Tween Parameters](#tween-parameters)
9. [Keyframes](#keyframes)
10. [Playback Settings](#playback-settings)
11. [Animation Callbacks](#animation-callbacks)
12. [Animation Methods](#animation-methods)
13. [Animation Properties (Read-Only)](#animation-properties-read-only)
14. [Timeline: createTimeline()](#timeline-createtimeline)
15. [Timeline Methods](#timeline-methods)
16. [Timeline Properties (Read-Only)](#timeline-properties-read-only)
17. [Animatable: createAnimatable()](#animatable-createanimatable)
18. [Draggable: createDraggable()](#draggable-createdraggable)
19. [Draggable Properties (Read-Only)](#draggable-properties-read-only)
20. [Layout: createLayout()](#layout-createlayout)
21. [Layout Properties (Read-Only)](#layout-properties-read-only)
22. [Scope: createScope()](#scope-createscope)
23. [Scope Properties (Read-Only)](#scope-properties-read-only)
24. [ScrollObserver: onScroll()](#scrollobserver-onscroll)
25. [ScrollObserver Properties (Read-Only)](#scrollobserver-properties-read-only)
26. [SVG Utilities](#svg-utilities)
27. [Text: splitText()](#text-splittext)
28. [Stagger: stagger()](#stagger-stagger)
29. [Utility Functions](#utility-functions)
30. [Easings](#easings)
31. [Spring Physics](#spring-physics)
32. [Engine Configuration](#engine-configuration)
33. [Engine Properties (Read-Only)](#engine-properties-read-only)
34. [Engine Defaults](#engine-defaults)
35. [WAAPI (Web Animation API)](#waapi-web-animation-api)
36. [Common Patterns & Recipes](#common-patterns--recipes)
37. [Project-Specific Integration Notes](#project-specific-integration-notes)

---

## Installation & Module Imports

```bash
pnpm add animejs
```

### CDN / Direct Import
```html
<!-- ESM via esm.sh -->
<script type="module">
  import { animate } from 'https://esm.sh/animejs';
</script>

<!-- ESM via JsDelivr -->
<script type="module">
  import { animate } from 'https://cdn.jsdelivr.net/npm/animejs/+esm';
</script>

<!-- UMD (global: anime) -->
<script src="https://cdn.jsdelivr.net/npm/animejs/lib/anime.umd.min.js"></script>
<script>
  anime.animate('.el', { x: 100 });
</script>
```

### Import Map
```html
<script type="importmap">
{
  "imports": {
    "animejs": "https://esm.sh/animejs"
  }
}
</script>
<script type="module">
  import { animate } from 'animejs';
</script>
```

**Bundle sizes**: ~24.50 KB (full), ~10 KB (animate only), ~3 KB (WAAPI only)

### Main Module (all features)
```ts
import {
  animate, createTimeline, createTimer, createScope, createDraggable,
  createAnimatable, createLayout,
  stagger, spring, onScroll, splitText,
  eases, cubicBezier, linear, steps, irregular,
  $, get, set, remove, cleanInlineStyles, sync, keepTime,
  random, createSeededRandom, randomPick, shuffle,
  round, clamp, snap, wrap, mapRange, lerp, damp,
  roundPad, padStart, padEnd, degToRad, radToDeg,
  engine, waapi, utils, easings, svg, events
} from 'animejs';
```

### Subpath Imports (tree-shaking)
```ts
import { animate } from 'animejs/animation';
import { createTimeline } from 'animejs/timeline';
import { createTimer } from 'animejs/timer';
import { createAnimatable } from 'animejs/animatable';
import { createDraggable } from 'animejs/draggable';
import { createLayout } from 'animejs/layout';
import { createScope } from 'animejs/scope';
import { engine } from 'animejs/engine';
import { onScroll } from 'animejs/events';
import { eases, cubicBezier, spring, linear, steps, irregular } from 'animejs/easings';
import { stagger, $, get, set, random, clamp, snap, wrap, mapRange, lerp, round, remove,
         sync, shuffle, randomPick, cleanInlineStyles, damp, roundPad, padStart, padEnd,
         degToRad, radToDeg, createSeededRandom, keepTime } from 'animejs/utils';
import { morphTo, createDrawable, createMotionPath } from 'animejs/svg';
import { splitText } from 'animejs/text';
import { waapi } from 'animejs/waapi';
```

---

## Using with React (Next.js)

### CRITICAL PATTERN: createScope + useEffect

All anime.js animations in React MUST follow this pattern:

```tsx
'use client';

import { animate, createScope, spring, createDraggable } from 'animejs';
import { useEffect, useRef, useState } from 'react';

function App() {
  const root = useRef(null);
  const scope = useRef(null);
  const [rotations, setRotations] = useState(0);

  useEffect(() => {
    scope.current = createScope({ root }).add(self => {
      // All anime.js instances here are scoped to <div ref={root}>
      // CSS selectors are relative to root element

      animate('.logo', {
        scale: [
          { to: 1.25, ease: 'inOut(3)', duration: 200 },
          { to: 1, ease: spring({ bounce: .7 }) }
        ],
        loop: true,
        loopDelay: 250,
      });

      createDraggable('.logo', {
        container: [0, 0, 0, 0],
        releaseEase: spring({ bounce: .7 })
      });

      // Register methods callable from outside useEffect
      self.add('rotateLogo', (i) => {
        animate('.logo', {
          rotate: i * 360,
          ease: 'out(4)',
          duration: 1500,
        });
      });
    });

    // CLEANUP: Always revert on unmount
    return () => scope.current.revert();
  }, []);

  const handleClick = () => {
    setRotations(prev => {
      const newRotations = prev + 1;
      scope.current.methods.rotateLogo(newRotations);
      return newRotations;
    });
  };

  return (
    <div ref={root}>
      <div className="large centered row">
        <img src={reactLogo} className="logo react" alt="React logo" />
      </div>
      <div className="medium row">
        <fieldset className="controls">
          <button onClick={handleClick}>rotations: {rotations}</button>
        </fieldset>
      </div>
    </div>
  );
}
```

### Key Rules for React Integration
1. **Always use `createScope({ root })`** — scopes CSS selectors to the component's DOM
2. **Always call `scope.current.revert()` in cleanup** — prevents memory leaks
3. **Use `self.add('name', fn)` for methods** — exposes animation triggers outside useEffect
4. **Call methods via `scope.current.methods.name()`** — safe external invocation
5. **Use `"use client"` directive** — anime.js requires DOM access
6. **Use refs, not state, for scope** — avoids unnecessary re-renders

---

## Timer: createTimer()

The simplest timing primitive. Animation and Timeline extend Timer.

```ts
import { createTimer } from 'animejs';

const timer = createTimer({
  duration: 5000,
  loop: true,
  alternate: true,
  frameRate: 60,
  playbackRate: 1,
  autoplay: true,
  reversed: false,
  onBegin: (self) => {},
  onUpdate: (self) => { console.log(self.progress); },
  onComplete: (self) => {},
  onLoop: (self) => {},
  onPause: (self) => {},
});

// Promise-based completion
timer.then(() => console.log('done'));
```

### Timer Playback Settings

| Parameter | Type | Default | Availability |
|-----------|------|---------|-------------|
| `delay` | `number` | `0` | JS & WAAPI |
| `duration` | `number` | `1000` | JS & WAAPI |
| `loop` | `number\|boolean` | `false` | JS & WAAPI |
| `loopDelay` | `number` | `0` | **JS only** |
| `alternate` | `boolean` | `false` | JS & WAAPI |
| `reversed` | `boolean` | `false` | JS & WAAPI |
| `autoplay` | `boolean` | `true` | JS & WAAPI |
| `frameRate` | `number` | `Infinity` | **JS only** |
| `playbackRate` | `number` | `1` | JS & WAAPI |

### Timer Callbacks

| Callback | Availability | Description |
|----------|-------------|-------------|
| `onBegin` | **JS only** | Fired once when the timer begins (after delay) |
| `onUpdate` | **JS only** | Fired every frame |
| `onComplete` | JS & WAAPI | Fired when timer completes |
| `onLoop` | **JS only** | Fired on each loop iteration |
| `onPause` | **JS only** | Fired when paused |
| `then()` | JS & WAAPI | Promise-based completion |

### Timer Methods

| Method | Description |
|--------|-------------|
| `play()` | Start/resume |
| `pause()` | Pause |
| `restart()` | Restart from beginning |
| `reverse()` | Reverse playback direction |
| `alternate()` | Toggle direction |
| `resume()` | Resume after direction change |
| `complete()` | Jump to end |
| `reset()` | Reset to initial state |
| `cancel()` | Cancel and clean up |
| `revert()` | Cancel and restore original values |
| `seek(time)` | Seek to ms or `'50%'` |
| `stretch(duration)` | Stretch total duration |

### Timer Properties (Read-Only)

| Property | Type | Description |
|----------|------|-------------|
| `id` | `Number` | Unique ID (auto-incremented) |
| `deltaTime` | `Number` | Time since last frame (ms) |
| `currentTime` | `Number` | Current time in ms |
| `iterationCurrentTime` | `Number` | Current iteration time |
| `progress` | `Number` | Overall progress (0–1) |
| `iterationProgress` | `Number` | Current iteration progress (0–1) |
| `currentIteration` | `Number` | Current loop count |
| `speed` | `Number` | Playback rate |
| `fps` | `Number` | Current FPS |
| `paused` | `Boolean` | Is paused |
| `began` | `Boolean` | Has begun playing |
| `completed` | `Boolean` | Has completed |
| `reversed` | `Boolean` | Is reversed |
| `backwards` | `Boolean` | Is currently playing backwards |

---

## Animation: animate()

```ts
const animation = animate(targets, parameters);
// Returns: JSAnimation instance
```

### Full Signature
```ts
animate('.element', {
  // Animatable Properties
  x: 100, y: 50, z: 0,
  scale: 1.5, scaleX: 2, scaleY: 0.5,
  rotate: '1turn', rotateX: 45, rotateY: 45, rotateZ: 90,
  skew: 15, skewX: 10, skewY: 5,
  perspective: 1000,
  translateX: '10rem', translateY: '5vh',
  opacity: 0.5,
  backgroundColor: '#ff0',

  // Tween Parameters
  duration: 1000,
  delay: 200,
  ease: 'outExpo',

  // Playback Settings
  loop: 3,
  loopDelay: 500,           // JS only
  alternate: true,
  reversed: false,
  autoplay: true,
  frameRate: 60,             // JS only
  playbackRate: 1,
  playbackEase: 'linear',   // JS only
  persist: false,            // WAAPI only

  // Callbacks
  onBegin: (anim) => {},     // JS only
  onBeforeUpdate: (anim) => {}, // JS only
  onUpdate: (anim) => {},    // JS only
  onRender: (anim) => {},    // JS only
  onLoop: (anim) => {},      // JS only
  onPause: (anim) => {},     // JS only
  onComplete: (anim) => {},
});

// Promise-based
animate('.el', { x: 100 }).then((anim) => {});
```

---

## Targets

```ts
// CSS Selector
animate('.class', { ... });
animate('#id', { ... });
animate('div > .child', { ... });

// DOM Element
animate(document.querySelector('.box'), { ... });

// NodeList / Multiple DOM Elements
animate(document.querySelectorAll('.item'), { ... });

// JavaScript Object (JS only)
const obj = { value: 0, progress: 0 };
animate(obj, { value: 100, duration: 1000, onUpdate: () => console.log(obj.value) });

// Array of mixed targets
animate(['.class', el, obj], { ... });
```

---

## Animatable Properties

### CSS Properties
```ts
animate('.el', {
  opacity: 0.5,
  width: '100px',
  height: '50%',
  backgroundColor: '#ff0',
  borderRadius: '50%',
  boxShadow: '0 0 10px rgba(0,0,0,0.5)',
  // All CSS properties in camelCase
});
```

### CSS Transforms (Individual Shorthands)
```ts
animate('.el', {
  x: 100,              // translateX (px)
  y: 50,               // translateY (px)
  z: 0,                // translateZ (px)
  translateX: '10rem',
  translateY: '5vh',
  rotate: 90,          // deg
  rotateX: 45,
  rotateY: 45,
  rotateZ: 90,
  scale: 1.5,
  scaleX: 2,
  scaleY: 0.5,
  skew: 15,            // deg
  skewX: 10,
  skewY: 5,
  perspective: 1000,
});
```

### CSS Variables (JS only)
```ts
animate('.el', { '--custom-color': '#ff0000', '--progress': 1 });
```

### JS Object Properties (JS only)
```ts
const data = { x: 0, y: 0 };
animate(data, { x: 100, y: 200, onUpdate: () => {} });
```

### HTML Attributes (JS only)
```ts
animate('input[type=range]', { value: 100 });
```

### SVG Attributes (JS only)
```ts
animate('circle', { cx: 100, cy: 100, r: 50, strokeDashoffset: [0, 100] });
```

---

## Tween Value Types

```ts
animate('.el', {
  // Numerical — from current to target
  x: 100,
  opacity: 0.5,

  // With units
  x: '10rem',
  width: '50%',
  rotate: '1turn',

  // Relative values (JS only) — relative to current
  x: '+=100',       // add
  x: '-=50',        // subtract
  x: '*=2',         // multiply

  // From → To arrays
  opacity: [0, 1],
  x: ['0px', '100px'],

  // Color values — hex, rgb, rgba, hsl, hsla
  backgroundColor: '#ff0000',
  color: 'rgb(255, 0, 0)',
  borderColor: 'hsl(120, 100%, 50%)',

  // Color function values (WAAPI only)
  // Uses CSS color functions like oklch(), lab(), etc.

  // CSS variable as value
  x: 'var(--move-distance)',

  // Function-based values — per-target dynamic
  x: (el, index, total) => index * 50,
  delay: (el, index, total) => index * 100,

  // Object syntax for from/to
  x: { from: 0, to: 100 },
  opacity: { from: 0 },               // from value → current
  scale: { to: 1.5, ease: 'outBack' }, // per-property easing
});
```

---

## Tween Parameters

Parameters can be global or per-property using object syntax:

```ts
animate('.el', {
  // Per-property parameters
  x: {
    to: 100,
    from: 0,
    delay: 0,
    duration: 500,
    ease: 'inOut(4)',
    composition: 'blend',          // JS only
    modifier: v => Math.round(v),  // JS only
  },

  // Global parameters (inherited by all properties)
  duration: 1000,
  delay: 100,
  ease: 'out(3)',
});
```

### to / from
- `to`: Target value. Accepts number, string with unit, array, function-based.
- `from`: Start value. If only `from` is set, animates FROM that value to the element's current value.

### delay / duration
- Per-property or global. Accept number (ms) or function-based `(el, i, total) => value`.

### ease
- Per-property or global. Accept string shorthand, easing function, or spring.

### composition (JS only)

Defines behavior when another animation on the same target/property is already playing:

| Value | Shorthand | Description |
|-------|-----------|-------------|
| `'replace'` | `0` | Replace and cancel running animation (default if < 1000 targets) |
| `'none'` | `1` | Do NOT replace running animation; previous continues if longer. Better performance. (default if >= 1000 targets) |
| `'blend'` | `2` | Additive animation — blends values with running animation |

**Blend gotchas**: `'blend'` does NOT work with: keyframes, color values, `reverse()`, `loop`, `reversed`, `alternate`. Only use for overlapping forward-playing animations.

Set global default:
```ts
import { engine } from 'animejs';
engine.defaults.composition = 'blend';
```

### modifier (JS only)

A function that transforms the animated numerical value each frame. If the value has units (like `'100px'`), the string part is auto-appended after the modifier runs.

```ts
animate('.el', {
  x: '17rem',
  modifier: utils.round(0),   // round to 0 decimals
});

animate('.el', {
  x: '85rem',
  modifier: v => v % 17,      // modulo
});

animate('.el', {
  x: '17rem',
  y: {
    to: '70rem',
    modifier: v => Math.cos(v) / 2,  // per-property modifier
  },
});
```

Most utility functions can be used as modifiers. Set global default:
```ts
engine.defaults.modifier = v => Math.round(v);
```

---

## Keyframes

### Tween Values Keyframes (array of values)
```ts
animate('.el', {
  x: [0, 100, 50, 200],         // animates through each value
  rotate: [0, 90, 45, 360],
});
```

### Tween Parameters Keyframes (array of objects) (JS only)
```ts
animate('.el', {
  x: [
    { to: 100, ease: 'outExpo', duration: 600 },
    { to: 0, ease: 'outBounce', duration: 800, delay: 100 },
  ],
});
```

### Duration-Based Keyframes (JS only)
```ts
animate('.el', {
  x: [
    { to: 250, duration: 1000 },
    { to: 0, duration: 1500 },
  ],
});
```

### Percentage-Based Keyframes (JS only)
```ts
animate('.el', {
  x: [
    { to: 250, at: '50%' },
    { to: 0, at: '100%' },
  ],
  duration: 2000,
});
```

---

## Playback Settings

All settings from Timer plus these animation-specific ones:

| Parameter | Type | Default | Availability |
|-----------|------|---------|-------------|
| `delay` | `number` | `0` | JS & WAAPI |
| `duration` | `number` | `1000` | JS & WAAPI |
| `loop` | `number\|boolean` | `false` | JS & WAAPI |
| `loopDelay` | `number` | `0` | **JS only** |
| `alternate` | `boolean` | `false` | JS & WAAPI |
| `reversed` | `boolean` | `false` | JS & WAAPI |
| `autoplay` | `boolean` | `true` | JS & WAAPI |
| `frameRate` | `number` | `Infinity` | **JS only** |
| `playbackRate` | `number` | `1` | JS & WAAPI |
| `playbackEase` | `EaseFunction` | `undefined` | **JS only** |
| `persist` | `boolean` | `false` | **WAAPI only** — keep styles after completion |

---

## Animation Callbacks

| Callback | Availability | Description |
|----------|-------------|-------------|
| `onBegin` | **JS only** | Fired once when animation begins (after delay) |
| `onComplete` | JS & WAAPI | Fired when animation completes |
| `onBeforeUpdate` | **JS only** | Fired before each frame update |
| `onUpdate` | **JS only** | Fired on each frame update |
| `onRender` | **JS only** | Fired after DOM rendering |
| `onLoop` | **JS only** | Fired on each loop iteration |
| `onPause` | **JS only** | Fired when paused |
| `then()` | JS & WAAPI | Promise-based completion |

---

## Animation Methods

Same as Timer methods plus:

| Method | Availability | Description |
|--------|-------------|-------------|
| `play()` | JS & WAAPI | Start/resume |
| `pause()` | JS & WAAPI | Pause |
| `restart()` | JS & WAAPI | Restart from beginning |
| `reverse()` | JS & WAAPI | Reverse direction |
| `alternate()` | JS & WAAPI | Toggle direction |
| `resume()` | JS & WAAPI | Resume after direction change |
| `complete()` | JS & WAAPI | Jump to end |
| `cancel()` | JS & WAAPI | Cancel and clean up |
| `revert()` | JS & WAAPI | Cancel and restore original values |
| `reset()` | **JS only** | Reset to initial state |
| `seek(time)` | JS & WAAPI | Seek to ms or `'50%'` |
| `stretch(duration)` | **JS only** | Stretch total duration |
| `refresh()` | **JS only** | Recalculate values |

---

## Animation Properties (Read-Only)

| Property | Type | Availability | Description |
|----------|------|-------------|-------------|
| `id` | `Number` | **JS only** | Unique animation ID |
| `targets` | `Array` | JS & WAAPI | Target elements |
| `currentTime` | `Number` | JS & WAAPI | Current time (ms) |
| `iterationCurrentTime` | `Number` | **JS only** | Current iteration time |
| `deltaTime` | `Number` | **JS only** | Time since last frame |
| `progress` | `Number` | JS & WAAPI | Overall progress (0–1) |
| `iterationProgress` | `Number` | **JS only** | Current iteration progress |
| `currentIteration` | `Number` | **JS only** | Current loop count |
| `duration` | `Number` | JS & WAAPI | Single iteration duration |
| `speed` | `Number` | JS & WAAPI | Playback rate |
| `fps` | `Number` | **JS only** | Current FPS |
| `paused` | `Boolean` | JS & WAAPI | Is paused |
| `began` | `Boolean` | **JS only** | Has begun |
| `completed` | `Boolean` | JS & WAAPI | Is completed |
| `reversed` | `Boolean` | **JS only** | Is reversed |
| `backwards` | `Boolean` | **JS only** | Is currently playing backwards |

---

## Timeline: createTimeline()

```ts
import { createTimeline } from 'animejs';

const tl = createTimeline({
  defaults: { duration: 750, ease: 'outExpo' },
  loop: true,
  alternate: true,
  autoplay: true,
  playbackEase: 'inOutQuad',  // JS only
  // All playback settings and callbacks available
});

// Add animations (sequential by default)
tl.add('.box1', { x: 100 })                        // after previous
  .add('.box2', { x: 200 }, 0)                     // at absolute 0ms
  .add('.box3', { x: 300 }, '+=200')               // 200ms after previous ends
  .add('.box4', { x: 400 }, '-=100')               // 100ms before previous ends
  .add('.box5', { x: 500 }, '<')                   // at end of previous
  .add('.box6', { x: 600 }, '<+=200')              // 200ms after end of previous
  .add('.label1', { opacity: 1 }, 'myLabel');       // at label position

// Add timer (no targets)
tl.add({ duration: 500, onUpdate: (timer) => {} }, 0);

// Add label
tl.label('myLabel', 1000);

// Call function at position
tl.call(() => console.log('fired!'), 500);

// Set values instantly
tl.set('.el', { opacity: 0 }, 0);

// Sync another timeline / WAAPI animation
tl.sync(otherTimeline, 0);

// Remove child
tl.remove(anim);

// Initialize without autoplay
tl.init();
```

### Time Position Syntax (for add/set/sync/call/label)
| Syntax | Description |
|--------|-------------|
| `0` | Absolute time in ms |
| `'+=200'` | 200ms after previous child ends |
| `'-=100'` | 100ms before previous child ends |
| `'*=.5'` | At half of the total element duration (multiplier) |
| `'<'` | At end position of the previous child |
| `'<<'` | At start position of the previous child |
| `'<+=200'` | 200ms after end of previous child |
| `'<-=100'` | 100ms before end of previous child |
| `'<<+=250'` | 250ms after start of previous child |
| `'labelName'` | At named label position |
| `'labelName+=200'` | 200ms after label |
| `stagger(10)` | Stagger the children positions by 10ms |

### Timeline Playback Settings

Same as Animation playback settings plus:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `defaults` | `Object` | `{}` | Default parameters for all children |

Timeline does NOT have `persist` (WAAPI only).

### Timeline Callbacks

| Callback | Description |
|----------|-------------|
| `onBegin` | Fired once when timeline begins |
| `onComplete` | Fired when timeline completes |
| `onBeforeUpdate` | Fired before each frame |
| `onUpdate` | Fired on each frame |
| `onRender` | Fired after DOM rendering |
| `onLoop` | Fired on each loop |
| `onPause` | Fired when paused |
| `then()` | Promise-based completion |

---

## Timeline Methods

All Animation methods plus:

| Method | Description |
|--------|-------------|
| `add(targets, params, position?)` | Add animation at position |
| `add(timerParams, position?)` | Add timer at position |
| `set(targets, params, position?)` | Set values instantly |
| `sync(timeline\|waapi, position?)` | Sync another timeline or WAAPI animation |
| `label(name, position?)` | Add named label |
| `remove(child)` | Remove child animation/timer |
| `call(fn, position?)` | Call function at position |
| `init()` | Initialize (when autoplay: false) |
| `play()` | Play |
| `pause()` | Pause |
| `restart()` | Restart |
| `reverse()` | Reverse |
| `alternate()` | Toggle direction |
| `resume()` | Resume |
| `complete()` | Complete |
| `cancel()` | Cancel |
| `revert()` | Revert |
| `reset()` | Reset |
| `seek(time)` | Seek |
| `stretch(duration)` | Stretch |
| `refresh()` | Refresh |

---

## Timeline Properties (Read-Only)

Same as Animation properties plus:

| Property | Type | Description |
|----------|------|-------------|
| `labels` | `Object` | Map of label names → time positions |

---

## Animatable: createAnimatable()

Creates reactive properties that smoothly interpolate when set:

```ts
import { createAnimatable } from 'animejs';

const animatable = createAnimatable('.el', {
  x: { unit: 'px', duration: 500, ease: 'outExpo', modifier: v => Math.round(v) },
  y: { unit: 'px', duration: 500, ease: 'outExpo' },
  scale: { duration: 300, ease: 'outBack' },
  rotate: { unit: 'deg', duration: 400 },
  opacity: { duration: 200 },
});

// Setter (smooth transition)
animatable.x(100);
animatable.y(200);
animatable.scale(1.5);

// Getter
const currentX = animatable.x();

// Revert
animatable.revert();
```

### Animatable Settings (per-property)

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `unit` | `String` | `''` | CSS unit for value |
| `duration` | `Number` | `200` | Transition duration (ms) |
| `ease` | `String\|Function` | `'outQuint'` | Easing function |
| `modifier` | `Function` | `null` | Value modifier |

### Animatable Methods
- **Getters**: `animatable.propName()` — returns current value
- **Setters**: `animatable.propName(value)` — smoothly animates to value
- **`revert()`** — clean up

### Animatable Properties (Read-Only)

| Property | Type | Description |
|----------|------|-------------|
| `targets` | `Array` | Array of target elements |
| `animations` | `Object` | Map of property name → animation instance |

---

## Draggable: createDraggable()

```ts
import { createDraggable, spring } from 'animejs';

const draggable = createDraggable('.element', {
  // Axes parameters
  x: { snap: 50, modifier: v => Math.round(v), mapTo: '.other' },
  y: { snap: 100 },

  // Settings
  trigger: '.handle',
  container: '.bounds',
  containerPadding: 10,
  containerFriction: 0.85,
  releaseContainerFriction: 0.5,
  releaseMass: 1,
  releaseStiffness: 80,
  releaseDamping: 20,
  releaseEase: spring({ bounce: 0.35 }),
  velocityMultiplier: 1,
  minVelocity: 0,
  maxVelocity: Infinity,
  dragSpeed: 1,
  dragThreshold: 0,
  scrollThreshold: 50,
  scrollSpeed: 10,
  cursor: true,

  // Callbacks
  onGrab: (self) => {},
  onDrag: (self) => {},
  onUpdate: (self) => {},
  onRelease: (self) => {},
  onSnap: (self) => {},
  onSettle: (self) => {},
  onResize: (self) => {},
  onAfterResize: (self) => {},
});
```

### Draggable Axes Parameters

| Param | Type | Description |
|-------|------|-------------|
| `x` | `Boolean\|Object` | Enable/configure X axis |
| `y` | `Boolean\|Object` | Enable/configure Y axis |
| `snap` | `Number\|Array\|Function` | Snap increment or positions |
| `modifier` | `Function` | Value modifier |
| `mapTo` | `String\|Element` | Map movement to another element |

### Draggable Settings

| Setting | Type | Default |
|---------|------|---------|
| `trigger` | `String\|Element` | `null` |
| `container` | `String\|Element\|Array` | `null` |
| `containerPadding` | `Number\|Array` | `0` |
| `containerFriction` | `Number` | `0.85` |
| `releaseContainerFriction` | `Number` | `0.5` |
| `releaseMass` | `Number` | `1` |
| `releaseStiffness` | `Number` | `80` |
| `releaseDamping` | `Number` | `20` |
| `releaseEase` | `Function\|String` | `spring()` |
| `velocityMultiplier` | `Number` | `1` |
| `minVelocity` | `Number` | `0` |
| `maxVelocity` | `Number` | `Infinity` |
| `dragSpeed` | `Number` | `1` |
| `dragThreshold` | `Number` | `0` |
| `scrollThreshold` | `Number` | `50` |
| `scrollSpeed` | `Number` | `10` |
| `cursor` | `Boolean` | `true` |

### Draggable Callbacks

| Callback | Description |
|----------|-------------|
| `onGrab` | When element is grabbed |
| `onDrag` | During drag movement |
| `onUpdate` | Each frame during drag/release |
| `onRelease` | When element is released |
| `onSnap` | When snapping to position |
| `onSettle` | When all motion stops |
| `onResize` | On window resize |
| `onAfterResize` | After resize recalculation |

### Draggable Methods

| Method | Description |
|--------|-------------|
| `disable()` | Disable dragging |
| `enable()` | Enable dragging |
| `setX(value)` | Set X position |
| `setY(value)` | Set Y position |
| `animateInView()` | Animate into view |
| `scrollInView()` | Scroll into view |
| `stop()` | Stop current motion |
| `reset()` | Reset position |
| `revert()` | Clean up |
| `refresh()` | Recalculate |

---

## Draggable Properties (Read-Only)

### Position Properties

| Property | Type | Description |
|----------|------|-------------|
| `x` | `Number` | Current X position |
| `y` | `Number` | Current Y position |
| `progressX` | `Number` | X progress within container (0–1) |
| `progressY` | `Number` | Y progress within container (0–1) |
| `velocity` | `Number` | Current velocity |
| `angle` | `Number` | Current movement angle |
| `destX` | `Number` | Destination X |
| `destY` | `Number` | Destination Y |
| `deltaX` | `Number` | X delta since last frame |
| `deltaY` | `Number` | Y delta since last frame |

### State Booleans

| Property | Type | Description |
|----------|------|-------------|
| `enabled` | `Boolean` | Is enabled |
| `grabbed` | `Boolean` | Is currently grabbed |
| `dragged` | `Boolean` | Has been dragged |
| `released` | `Boolean` | Has been released |
| `updated` | `Boolean` | Has been updated |
| `contained` | `Boolean` | Is within container bounds |
| `canScroll` | `Boolean` | Can trigger scrolling |
| `manual` | `Boolean` | Manual mode |
| `initialized` | `Boolean` | Is initialized |
| `isFinePointer` | `Boolean` | Using fine pointer (mouse) |
| `useWin` | `Boolean` | Using window as scroll container |
| `fixed` | `Boolean` | Fixed positioning |
| `disabled` | `Boolean` | Is disabled |

### Gettable/Settable Properties

| Property | Type | Description |
|----------|------|-------------|
| `snapX` | `Number\|Array\|Function` | X snap config |
| `snapY` | `Number\|Array\|Function` | Y snap config |
| `scrollSpeed` | `Number` | Auto-scroll speed |
| `scrollThreshold` | `Number` | Scroll trigger threshold |
| `dragSpeed` | `Number` | Drag speed multiplier |
| `maxVelocity` | `Number` | Max velocity cap |
| `minVelocity` | `Number` | Min velocity threshold |
| `velocityMultiplier` | `Number` | Velocity scale |
| `releaseEase` | `Function\|String` | Release easing |
| `containerPadding` | `Number\|Array` | Container padding |
| `containerFriction` | `Number` | Container friction |
| `cursor` | `Boolean` | Update cursor style |

### Container / Reference Properties

| Property | Type | Description |
|----------|------|-------------|
| `containerBounds` | `Object` | Container bounding rect |
| `containerArray` | `Array` | Container bounds as array |
| `$container` | `Element` | Container element |
| `$target` | `Element` | Target element |
| `$trigger` | `Element` | Trigger element |
| `$scrollContainer` | `Element` | Scroll container element |

### Advanced Properties

| Property | Type | Description |
|----------|------|-------------|
| `xProp` | `Object` | X axis animation property |
| `yProp` | `Object` | Y axis animation property |
| `releaseSpring` | `Object` | Release spring instance |
| `scroll` | `Object` | Scroll state |
| `coords` | `Object` | Current coordinates |
| `snapped` | `Object` | Snapped position |
| `pointer` | `Object` | Pointer state |
| `scrollView` | `Object` | Scroll view state |
| `dragArea` | `Object` | Drag area bounds |
| `scrollBounds` | `Object` | Scroll bounds |
| `targetBounds` | `Object` | Target bounding rect |
| `window` | `Object` | Window reference |
| `pointerVelocity` | `Number` | Raw pointer velocity |
| `pointerAngle` | `Number` | Raw pointer angle |
| `activeProp` | `Object` | Currently active axis prop |

---

## Layout: createLayout()

Animates layout changes automatically (FLIP technique):

```ts
import { createLayout } from 'animejs';

const layout = createLayout('.container', {
  children: '.item',
  duration: 500,
  delay: 0,
  ease: 'outExpo',
  properties: ['x', 'y', 'width', 'height', 'opacity'],

  // Enter/Leave/Swap states
  enterFrom: { opacity: 0, scale: 0.5 },
  leaveTo: { opacity: 0, scale: 0.5 },
  swapAt: 0.65,  // swap threshold (0–1)

  // Callbacks (inherits all Timeline callbacks)
  onBegin: (self) => {},
  onUpdate: (self) => {},
  onComplete: (self) => {},
});
```

### Layout Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `children` | `String\|Array<String>` | `'*'` | Child selector(s) |
| `delay` | `Number` | `0` | Animation delay (ms) |
| `duration` | `Number` | `500` | Animation duration (ms) |
| `ease` | `String\|Function` | `'outExpo'` | Easing |
| `properties` | `Array<String>` | `['x','y','width','height']` | Properties to animate |

### Layout States

| State | Type | Description |
|-------|------|-------------|
| `enterFrom` | `Object` | Entering elements animate FROM these values |
| `leaveTo` | `Object` | Leaving elements animate TO these values |
| `swapAt` | `Number\|Object` | Swap threshold (0–1) or per-property object |

### Layout Usage Patterns

- **Specifying a root**: Pass a root element as first argument
- **CSS display animation**: Animate `display: none` ↔ `display: block` transitions
- **Staggered layout**: Children animate with stagger
- **DOM order animation**: Reorder children with smooth transitions
- **Enter layout animation**: New elements animate in from `enterFrom`
- **Exit layout animation**: Removed elements animate out to `leaveTo`
- **Swap parent animation**: Move elements between containers
- **Modal dialog animation**: Animate modal open/close

### Layout Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `record()` | `void` | Snapshot current positions |
| `animate()` | `Timeline` | Animate from snapshot to new positions |
| `update(fn)` | `Timeline` | `record()` → execute `fn` → `animate()` in one call |
| `revert()` | `void` | Clean up |

The returned Timeline supports `.then()` for promise-based completion.

### Layout ID Attribute

Use `data-layout-id` to animate elements across different DOM positions:

```ts
// Two elements with same layout id — one hidden, one visible
$itemA1.dataset.layoutId = "item-A";
$itemA2.dataset.layoutId = "item-A";
// When one hides and the other shows, auto-animates between them
```

### Layout Callbacks

Layout inherits **all Timeline callbacks**: `onBegin`, `onComplete`, `onBeforeUpdate`, `onUpdate`, `onRender`, `onLoop`, `onPause`, plus `then()`.

### Common Layout Gotchas

1. **Elements fading unexpectedly** — Add to children selector or set `swapAt: { opacity: 1 }`
2. **Root element jumping** — Use parent element as new root
3. **Text jumping during transition** — Use `white-space: nowrap`
4. **Inline elements not moving** — Wrap text in `<span>` tags
5. **Transform shorthands not working** — Use `transform: 'scale(0)'` string, NOT `{ scale: 0 }`
6. **SVG elements not animated** — Layout is HTML only

---

## Layout Properties (Read-Only)

| Property | Type | Description |
|----------|------|-------------|
| `params` | `AutoLayoutParams` | Original creation parameters |
| `root` | `HTMLElement` | Root container element |
| `children` | `String\|Array<String>` | Children selector |
| `enterFromParams` | `Object` | Enter state parameters |
| `leaveToParams` | `Object` | Leave state parameters |
| `swapAtParams` | `Object` | Swap state parameters |
| `properties` | `Set<String>` | Properties being animated |
| `oldState` | `LayoutSnapshot` | Previous layout snapshot |
| `newState` | `LayoutSnapshot` | Current layout snapshot |
| `timeline` | `Timeline\|null` | Current running timeline |
| `animating` | `Array<DOMTarget>` | Elements currently animating |
| `swapping` | `Array<DOMTarget>` | Elements currently swapping |
| `entering` | `Array<DOMTarget>` | Elements entering |
| `leaving` | `Array<DOMTarget>` | Elements leaving |
| `id` | `Number` | Layout instance ID |

**LayoutSnapshot helpers**: `.getNode(element)` returns node, `.getComputedValue(element, property)` returns computed value.

Runtime arrays (`entering`, `leaving`, `swapping`, `animating`) are cleared and repopulated on each `.animate()` call.

---

## Scope: createScope()

```ts
import { createScope } from 'animejs';

const scope = createScope({
  root: document.querySelector('#container'),
  defaults: { duration: 500, ease: 'outExpo' },
  mediaQueries: {
    portrait: '(orientation: portrait)',
    mobile: '(max-width: 768px)',
  },
});

// Add constructor (re-runs on refresh)
scope.add((self, { matches }) => {
  // 'matches' contains media query results: { portrait: boolean, mobile: boolean }
  animate('.item', { x: 100 });  // selector scoped to root

  // Register callable methods
  self.add('fadeIn', (delay = 0) => {
    animate('.item', { opacity: [0, 1], delay });
  });
});

// Add once (only runs once, NOT re-run on refresh)
scope.addOnce(self => {
  // One-time setup code
});

// Call registered methods
scope.methods.fadeIn(200);

// Keep time across all timers/animations in scope
scope.keepTime();

// Refresh (re-run constructors, reverts first)
scope.refresh();

// Clean up everything
scope.revert();
```

### Scope Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `root` | `Document\|HTMLElement` | `document` | Scope CSS selectors to this element |
| `defaults` | `Object` | `{}` | Default params for all animations in scope |
| `mediaQueries` | `Object` | `{}` | Named media queries — results in `matches` |

### Scope Methods

| Method | Description |
|--------|-------------|
| `add(fn)` | Add constructor function (receives `self` and `{ matches }`) |
| `addOnce(fn)` | Add constructor that runs only once |
| `keepTime()` | Preserve time across all scope timers |
| `revert()` | Clean up all scope-managed instances |
| `refresh()` | Revert then re-run constructors |

---

## Scope Properties (Read-Only)

| Property | Type | Description |
|----------|------|-------------|
| `data` | `Object` | User data (cleared on revert) |
| `defaults` | `Object` | Default parameters |
| `root` | `Document\|HTMLElement` | Root element |
| `constructors` | `Array<Function>` | Added constructor functions |
| `revertConstructors` | `Array<Function>` | Cleanup functions |
| `revertibles` | `Array` | Managed instances (Tickable, Animatable, Draggable, ScrollObserver, Scope) |
| `methods` | `Object` | Registered method functions |
| `matches` | `Object` | Media query match results |
| `mediaQueryLists` | `Object` | Raw MediaQueryList objects |

---

## ScrollObserver: onScroll()

```ts
import { animate, onScroll } from 'animejs';

const anim = animate('.el', { x: 200, autoplay: false });

// Basic scroll-triggered
onScroll(anim, {
  target: '.el',
  container: window,
  axis: 'y',
  repeat: true,
  debug: false,
});

// Scroll-linked (scrubbed)
onScroll(anim, {
  target: '.el',
  sync: 'playback',
  enter: 'bottom',
  leave: 'top',
});
```

### ScrollObserver Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `container` | `Element\|Window` | `window` | Scroll container |
| `target` | `String\|Element` | first target | Element to observe |
| `debug` | `Boolean` | `false` | Show debug markers |
| `axis` | `'x'\|'y'` | `'y'` | Scroll axis |
| `repeat` | `Boolean` | `false` | Re-trigger on re-enter |

### ScrollObserver Thresholds

| Param | Accepts | Description |
|-------|---------|-------------|
| `enter` | `'top'\|'center'\|'bottom'\|Number(0–1)` | When element enters viewport |
| `leave` | `'top'\|'center'\|'bottom'\|Number(0–1)` | When element leaves viewport |

**Numeric values**: `0` = container top edge, `1` = container bottom edge.

**Relative position values**: Adding pixels or percentages to position shorthands.

**Min/Max**: Thresholds can have `[min, max]` array values.

### Synchronisation Modes

| Mode | Description |
|------|-------------|
| `sync: 'play'` | Call `play()` on enter |
| `sync: 'restart'` | Call `restart()` on enter |
| `sync: 'playback'` | Link progress directly to scroll position |
| `sync: 'smooth'` | Smoothed scroll-linked progress |
| `sync: 'eased'` | Eased scroll-linked progress |
| Method names | Any method: `'play'`, `'pause'`, `'restart'`, `'reverse'`, `'alternate'`, `'complete'`, `'reset'` |

### ScrollObserver Callbacks

| Callback | Description |
|----------|-------------|
| `onEnter` | Element enters viewport |
| `onEnterForward` | Enters while scrolling forward |
| `onEnterBackward` | Enters while scrolling backward |
| `onLeave` | Element leaves viewport |
| `onLeaveForward` | Leaves while scrolling forward |
| `onLeaveBackward` | Leaves while scrolling backward |
| `onUpdate` | Each scroll frame |
| `onSyncComplete` | Sync animation completes |
| `onResize` | On resize |

### ScrollObserver Methods

| Method | Description |
|--------|-------------|
| `link(anim)` | Link another animation to this observer |
| `refresh()` | Recalculate positions |
| `revert()` | Clean up |

---

## ScrollObserver Properties (Read-Only)

| Property | Type | Description |
|----------|------|-------------|
| `id` | `Number` | Unique ID |
| `container` | `Element\|Window` | Scroll container |
| `target` | `Element` | Observed target |
| `linked` | `Array` | Linked animations |
| `repeat` | `Boolean` | Repeat setting |
| `horizontal` | `Boolean` | Is horizontal (axis: 'x') |
| `enter` | `Number` | Enter threshold |
| `leave` | `Number` | Leave threshold |
| `sync` | `String` | Sync mode |
| `velocity` | `Number` | Current scroll velocity |
| `backward` | `Boolean` | Scrolling backward |
| `scroll` | `Number` | Current scroll position |
| `progress` | `Number` | Scroll progress (0–1) |
| `completed` | `Boolean` | Has completed |
| `began` | `Boolean` | Has begun |
| `isInView` | `Boolean` | Target is in viewport |
| `offset` | `Number` | Current offset |
| `offsetStart` | `Number` | Start offset |
| `offsetEnd` | `Number` | End offset |
| `distance` | `Number` | Total scroll distance |

---

## SVG Utilities

```ts
import { morphTo, createDrawable, createMotionPath, animate } from 'animejs';

// SVG Morph
animate('.path-a', {
  d: morphTo('.path-b'),
  duration: 1000,
  ease: 'inOutQuad',
});

// SVG Line Drawing
const drawable = createDrawable('.svg-path');
animate(drawable, {
  draw: '0 1',              // draw from 0% to 100%
  duration: 2000,
  ease: 'inOutExpo',
});

// SVG Motion Path
animate('.element', {
  ...createMotionPath('.svg-path'),  // spreads x, y, rotate
  duration: 3000,
  ease: 'inOutQuad',
  loop: true,
});
```

---

## Text: splitText()

```ts
import { splitText, animate, stagger } from 'animejs';

const splitter = splitText('.text-element', {
  lines: true,              // split into lines (default: true)
  words: true,              // split into words (default: true)
  chars: true,              // split into chars (default: false)
  debug: false,
  includeSpaces: false,
  accessible: true,         // add aria attributes
});

const { lines, words, chars } = splitter;

// Animate characters
animate(chars, {
  opacity: [0, 1],
  y: [20, 0],
  delay: stagger(30),
  ease: 'outExpo',
});
```

### TextSplitter Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `lines` | `Boolean` | `true` | Split into lines |
| `words` | `Boolean` | `true` | Split into words |
| `chars` | `Boolean\|Object` | `false` | Split into characters |
| `debug` | `Boolean` | `false` | Show debug outlines |
| `includeSpaces` | `Boolean` | `false` | Include space characters |
| `accessible` | `Boolean` | `true` | Add ARIA attributes |

### Split Parameters (per-type: chars, words, lines)

| Param | Type | Description |
|-------|------|-------------|
| `class` | `String` | CSS class for wrapper elements |
| `wrap` | `String` | Wrapper element tag (e.g. `'span'`) |
| `clone` | `Boolean` | Clone original element |

### HTML Template
Custom wrapping templates for split elements.

### TextSplitter Methods

| Method | Description |
|--------|-------------|
| `addEffect(fn)` | Add animation effect `(chars, words, lines) => {}` |
| `revert()` | Restore original text |
| `refresh()` | Re-split after DOM changes |

### TextSplitter Properties (Read-Only)

| Property | Type | Description |
|----------|------|-------------|
| `lines` | `Array<Element>` | Line wrapper elements |
| `words` | `Array<Element>` | Word wrapper elements |
| `chars` | `Array<Element>` | Character wrapper elements |

---

## Stagger: stagger()

```ts
import { stagger } from 'animejs';

// Time staggering
animate('.items', {
  x: 100,
  delay: stagger(100),           // 0, 100, 200, 300...
  duration: stagger(500, { start: 200 }), // 200, 700, 1200...
});

// Values staggering
animate('.items', {
  rotate: stagger(45),           // 0, 45, 90, 135...
  scale: stagger([0.5, 1.5]),    // range 0.5 → 1.5
  x: stagger([-100, 100]),       // range -100 → 100
});

// Timeline position staggering
tl.add('.items', { x: 100 }, stagger(200));
```

### Stagger Value Types

| Type | Example | Description |
|------|---------|-------------|
| Numerical | `stagger(100)` | Fixed increment per element |
| Range | `stagger([0, 100])` | Distributed from start to end |

### Stagger Parameters

```ts
stagger(100, {
  start: 500,           // initial offset value
  from: 'center',       // 'first'|'last'|'center'|number(index)
  reversed: true,        // reverse stagger order
  ease: 'inOutQuad',    // ease distribution curve
  grid: [10, 10],       // 2D grid [columns, rows]
  axis: 'x',            // grid axis: 'x'|'y' (requires grid)
  modifier: v => Math.round(v), // transform stagger value
  use: 'delay',         // explicitly set which property to stagger (for timeline positions)
  total: 20,            // override total element count
});
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `start` | `Number` | `0` | Start value offset |
| `from` | `String\|Number` | `'first'` | Origin: `'first'`, `'last'`, `'center'`, or index |
| `reversed` | `Boolean` | `false` | Reverse order |
| `ease` | `String\|Function` | `'linear'` | Distribution curve |
| `grid` | `[cols, rows]` | `null` | 2D grid staggering |
| `axis` | `'x'\|'y'` | `null` | Grid axis (requires `grid`) |
| `modifier` | `Function` | `null` | Transform value |
| `use` | `String` | auto | Target property name |
| `total` | `Number` | auto | Override element count |

---

## Utility Functions

### DOM Utilities
```ts
import { $, get, set, remove, cleanInlineStyles, sync, keepTime } from 'animejs';

$('.selector');                      // querySelectorAll → Array
get('.el', 'translateX');            // get current CSS/transform value
set('.el', { opacity: 0.5 });       // set CSS values immediately
remove(animation);                   // remove animation from engine
cleanInlineStyles('.el');            // remove anime.js inline styles
sync(anim1, anim2);                 // synchronize animations
keepTime(timer1, timer2);           // keep time across timers
```

### Random / Array
```ts
import { random, createSeededRandom, randomPick, shuffle } from 'animejs';

random(0, 100);                      // random int 0–100
random(0, 100, 2);                   // random float with 2 decimals
randomPick(['a', 'b', 'c']);         // random array element
shuffle([1, 2, 3, 4, 5]);           // shuffle array in-place

const seeded = createSeededRandom(42);
seeded();                            // deterministic 0–1
```

### Numeric / Math
```ts
import { round, clamp, snap, wrap, mapRange, lerp, damp } from 'animejs';

round(3.14159, 2);                   // 3.14
clamp(value, 0, 100);               // clamp between min/max
snap(67, 25);                        // 75 (nearest multiple)
wrap(360, 0, 360);                   // 0 (wrap around)
mapRange(0.5, 0, 1, 0, 100);        // 50 (map ranges)
lerp(0, 100, 0.5);                  // 50 (linear interpolation)
damp(current, target, smoothing, dt); // damped interpolation
```

### String / Formatting
```ts
import { roundPad, padStart, padEnd } from 'animejs';

roundPad(3.1, 2);                    // "3.10"
padStart('5', 3, '0');               // "005"
padEnd('5', 3, '0');                 // "500"
```

### Angle Conversion
```ts
import { degToRad, radToDeg } from 'animejs';

degToRad(180);                       // π
radToDeg(Math.PI);                   // 180
```

### Chain-able Utilities

Chain-able functions are created when calling a utility function without its optional value parameter. They work great as `modifier` tween parameters.

**Functions that support chaining**:
`round()`, `clamp()`, `snap()`, `wrap()`, `mapRange()`, `interpolate()` (alias for `lerp()`), `roundPad()`, `padStart()`, `padEnd()`, `degToRad()`, `radToDeg()`

```ts
import { animate, utils } from 'animejs';

// Create chain-able function (call without value param)
const chainableClamp = utils.clamp(0, 100);
chainableClamp(150); // 100

// Chain multiple utilities together
const normalizeAndRound = utils.mapRange(0, 255, 0, 1).round(1);
normalizeAndRound(128); // '0.5'
normalizeAndRound(64);  // '0.3'

// Complex chain as modifier
animate('.value', {
  innerHTML: 1000,
  modifier: utils.wrap(0, 10).roundPad(3).padStart(6, '0'),
  duration: 100000,
  alternate: true,
  loop: true,
  ease: 'linear',
});

// Combine clamp + round + padStart
const clampRoundPad = utils.clamp(0, 100).round(2).padStart(6, '0');
clampRoundPad(125);   // '000100'
clampRoundPad(75.25); // '075.25'
```

---

## Easings

### Built-in Ease Functions

| Ease | In | Out | InOut |
|------|----|-----|-------|
| Quad | `'inQuad'` | `'outQuad'` | `'inOutQuad'` |
| Cubic | `'inCubic'` | `'outCubic'` | `'inOutCubic'` |
| Quart | `'inQuart'` | `'outQuart'` | `'inOutQuart'` |
| Quint | `'inQuint'` | `'outQuint'` | `'inOutQuint'` |
| Sine | `'inSine'` | `'outSine'` | `'inOutSine'` |
| Expo | `'inExpo'` | `'outExpo'` | `'inOutExpo'` |
| Circ | `'inCirc'` | `'outCirc'` | `'inOutCirc'` |
| Back | `'inBack'` | `'outBack'` | `'inOutBack'` |
| Bounce | `'inBounce'` | `'outBounce'` | `'inOutBounce'` |
| Elastic | `'inElastic'` | `'outElastic'` | `'inOutElastic'` |

### Power Shorthand
```ts
animate('.el', { x: 100, ease: 'out(3)' });     // outCubic
animate('.el', { x: 100, ease: 'inOut(4)' });    // inOutQuart
animate('.el', { x: 100, ease: 'in(2)' });       // inQuad
```

### Custom Easings
```ts
import { cubicBezier, linear, steps, irregular } from 'animejs';

cubicBezier(0.7, 0.1, 0.5, 0.9);       // cubic bézier curve
linear(0, 0.5, 0.5, 1);                 // linear with control points
steps(5);                                // stepped easing
irregular(10, 2);                        // length, randomness
```

### Programmatic Access
```ts
import { eases } from 'animejs';
const ease = eases.outQuad;  // direct function reference
```

---

## Spring Physics

```ts
import { spring, createSpring } from 'animejs';

// Spring with bounce (simplified)
animate('.el', {
  x: 200,
  ease: spring({ bounce: 0.35 }),  // bounce: 0–1+ (higher = more bounce)
});

// Spring with raw physics
animate('.el', {
  x: 200,
  ease: spring({
    stiffness: 200,   // default: 100
    damping: 15,       // default: 10
    mass: 1,           // default: 1
    velocity: 0,       // default: 0
  }),
});

// createSpring for draggable (persistent spring instance)
createDraggable('.el', {
  releaseEase: createSpring({ stiffness: 120, damping: 6 }),
});
```

---

## Engine Configuration

```ts
import { engine } from 'animejs';

// Parameters (get/set)
engine.timeUnit = 'ms';            // 'ms' | 's'
engine.speed = 1;                   // global speed multiplier
engine.fps = 60;                    // target FPS
engine.precision = 4;               // decimal precision
engine.pauseOnDocumentHidden = true; // pause when tab hidden

// Methods
engine.update();    // manual frame update
engine.pause();     // pause all animations
engine.resume();    // resume all animations
```

### Engine Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `timeUnit` | `'ms'\|'s'` | `'ms'` | Time unit for all durations |
| `speed` | `Number` | `1` | Global speed multiplier |
| `fps` | `Number` | `120` | Target frames per second |
| `precision` | `Number` | `4` | Decimal precision for calculations |
| `pauseOnDocumentHidden` | `Boolean` | `true` | Pause animations when tab is hidden |

### Engine Methods

| Method | Description |
|--------|-------------|
| `update()` | Manually trigger a frame update |
| `pause()` | Pause all running animations globally |
| `resume()` | Resume all paused animations globally |

---

## Engine Properties (Read-Only)

| Property | Type | Description |
|----------|------|-------------|
| `timeUnit` | `String` | Current time unit |
| `currentTime` | `Number` | Engine current time |
| `deltaTime` | `Number` | Time since last frame |
| `precision` | `Number` | Current precision |
| `speed` | `Number` | Current speed |
| `fps` | `Number` | Current FPS setting |
| `useDefaultMainLoop` | `Boolean` | Using default rAF loop |
| `pauseOnDocumentHidden` | `Boolean` | Tab-hidden pause setting |

---

## Engine Defaults

Override global default values for all animations:

```ts
import { engine } from 'animejs';

engine.defaults.duration = 500;
engine.defaults.ease = 'outExpo';
engine.defaults.composition = 'blend';
engine.defaults.modifier = v => Math.round(v);
```

### All Available Defaults

| Default | Type |
|---------|------|
| `playbackEase` | `String \| Function` |
| `playbackRate` | `Number` |
| `frameRate` | `Number` |
| `loop` | `Number \| Boolean` |
| `reversed` | `Boolean` |
| `alternate` | `Boolean` |
| `autoplay` | `Boolean` |
| `duration` | `Number \| Function` |
| `delay` | `Number \| Function` |
| `composition` | `String \| Function` |
| `ease` | `String \| Function` |
| `loopDelay` | `Number` |
| `modifier` | `Function` |
| `onBegin` | `Function` |
| `onUpdate` | `Function` |
| `onRender` | `Function` |
| `onLoop` | `Function` |
| `onComplete` | `Function` |
| `onPause` | `Function` |

---

## WAAPI (Web Animation API)

Lightweight alternative (~3KB) using browser-native Web Animations API:

```ts
import { waapi } from 'animejs';

const anim = waapi.animate('.el', {
  x: 200,
  rotate: 360,
  opacity: [0, 1],
  duration: 1000,
  ease: spring({ bounce: 0.35 }),
  loop: true,
  alternate: true,
  persist: true,  // keep styles after completion (WAAPI only)
});
```

### When to Use WAAPI vs JS
- **WAAPI**: Simple opacity/transform animations, hardware-accelerated, performance-critical, smaller bundle
- **JS**: Complex sequencing, JS objects, scroll-linked, function-based values, composition, modifier, keyframes (tween params/duration/percentage), loopDelay, frameRate, playbackEase, onBegin/onBeforeUpdate/onUpdate/onRender/onLoop/onPause

### Hardware-Accelerated Properties (prefer WAAPI)
`opacity`, `transform` (x, y, rotate, scale), `filter`

### Improvements Over Native WAAPI
1. **Sensible defaults** — duration: 1000ms, ease: out(3), fill: both
2. **Multi-targets** — animate multiple elements in one call
3. **Default units** — `x: 100` auto-adds `px`
4. **Function-based values** — `x: (el, i, total) => i * 50`
5. **Individual transforms** — `x`, `y`, `rotate`, `scale` (no transform string)
6. **Individual property params** — per-property duration/delay/ease
7. **Spring and custom easings** — `spring()`, `cubicBezier()`, etc.

### API Differences with Native WAAPI

| anime.js | Native WAAPI | Description |
|----------|-------------|-------------|
| `loop: 3` / `loop: true` | `iterations: 3` / `iterations: Infinity` | Loop count |
| `alternate: true` | `direction: 'alternate'` | Ping-pong |
| `ease: 'outExpo'` | `easing: 'ease-out'` | Easing syntax |
| `.then()` | `.finished` | Promise completion |

### convertEase()
```ts
const cssEasing = waapi.convertEase('outExpo');
// Returns CSS easing string for native WAAPI use
```

---

## Common Patterns & Recipes

### Fade In on Mount (React)
```tsx
useEffect(() => {
  scope.current = createScope({ root: rootRef.current! }).add(() => {
    animate('.fade-in', {
      opacity: [0, 1],
      y: [30, 0],
      delay: stagger(80),
      duration: 800,
      ease: 'outExpo',
    });
  });
  return () => scope.current?.revert();
}, []);
```

### Staggered Grid Animation
```ts
animate('.grid-item', {
  scale: [0, 1],
  opacity: [0, 1],
  delay: stagger(50, { grid: [4, 4], from: 'center' }),
  ease: 'outBack',
});
```

### Text Reveal
```ts
const { chars } = splitText('.heading', { chars: true });
animate(chars, {
  y: ['1.2em', 0],
  opacity: [0, 1],
  delay: stagger(25),
  duration: 600,
  ease: 'outExpo',
});
```

### Scroll-Linked Progress Bar
```ts
const anim = animate('.progress-bar', {
  scaleX: [0, 1],
  duration: 1000,
  autoplay: false,
  ease: 'linear',
});
onScroll(anim, { sync: 'playback' });
```

### Section Enter Animation (Scroll)
```ts
const anim = animate('.section-content', {
  opacity: [0, 1],
  y: [50, 0],
  delay: stagger(100),
  autoplay: false,
  ease: 'outExpo',
});
onScroll(anim, {
  target: '.section',
  enter: 'bottom',
  leave: 'top',
  sync: 'play',
});
```

### Complex Timeline Sequence
```ts
const tl = createTimeline({
  defaults: { duration: 600, ease: 'outExpo' },
})
  .add('.logo', { scale: [0, 1], opacity: [0, 1] })
  .add('.title', { y: [30, 0], opacity: [0, 1] }, '-=300')
  .add('.subtitle', { y: [20, 0], opacity: [0, 1] }, '-=200')
  .add('.cta', { scale: [0.8, 1], opacity: [0, 1] }, '-=100');
```

### Draggable Card
```ts
createDraggable('.card', {
  container: '.card-container',
  releaseEase: spring({ stiffness: 120, damping: 6 }),
  x: { snap: 100 },
  y: { snap: 100 },
  onGrab: () => animate('.card', { scale: 1.05, duration: 200 }),
  onRelease: () => animate('.card', { scale: 1, duration: 300 }),
});
```

### Responsive Animations with Scope
```ts
createScope({
  root: container,
  mediaQueries: {
    mobile: '(max-width: 768px)',
    desktop: '(min-width: 769px)',
  },
}).add((self, { matches }) => {
  if (matches.mobile) {
    animate('.hero', { x: 0, y: 50, duration: 500 });
  } else {
    animate('.hero', { x: 100, y: 0, duration: 800 });
  }
});
```

### Interactive Hover with Composition Blend
```ts
const enter = { scale: 1.5, duration: 350 };
const leave = { scale: 1.0, duration: 250 };

el.addEventListener('mouseenter', () => animate(el, { composition: 'blend', ...enter }));
el.addEventListener('mouseleave', () => animate(el, { composition: 'blend', ...leave }));
```

### Auto Layout Animation
```ts
const layout = createLayout('.container', {
  children: '.item',
  duration: 500,
  ease: 'outExpo',
  enterFrom: { opacity: 0, scale: 0.5 },
  leaveTo: { opacity: 0, scale: 0.5 },
});

// Animate after DOM changes
layout.update(() => {
  container.appendChild(newElement);
}).then(() => console.log('layout animated'));
```

### SVG Drawing + Morph
```ts
const drawable = createDrawable('.svg-path');
const tl = createTimeline()
  .add(drawable, { draw: '0 1', duration: 2000, ease: 'inOutExpo' })
  .add('.path-a', { d: morphTo('.path-b'), duration: 1000 }, '-=500');
```

---

## Project-Specific Integration Notes

### This Portfolio Stack
- **Next.js 15.2.4** with App Router, static export (`output: 'export'`)
- **React 19** — all components use `"use client"` directive
- **TypeScript 5** — type anime.js imports properly
- **Tailwind CSS v4** — combine with anime.js for dynamic animations beyond CSS
- **Three.js** already used for 3D background — anime.js complements with DOM animations
- **pnpm** as package manager — use `pnpm add animejs`

### Existing Animation Systems
1. CSS transitions/animations via Tailwind
2. Section visibility observer (`use-section-visibility.ts`)
3. Cycling typewriter effect (`use-cycling-typewriter.ts`)
4. Three.js 3D animations
5. Scroll-threshold detection (`use-scroll-threshold.ts`)

### Where anime.js Fits
- Replace CSS-only entrance animations with richer anime.js sequences
- Add scroll-linked animations via `onScroll()`
- Create complex multi-step hero section entrance with `createTimeline()`
- Animate text reveals with `splitText()` + staggered animations
- Add micro-interactions (hover effects, click feedback) via `animate()`
- Keep Three.js for 3D — use anime.js for all 2D DOM animations
- Use `createLayout()` for list/grid reordering animations

### Performance Tips
- Use `waapi.animate()` for simple opacity/transform animations (hardware accelerated)
- Use `autoplay: false` + `onScroll()` for scroll-triggered animations (lazy)
- Always `revert()` in React cleanup to prevent memory leaks
- Use `composition: 'blend'` for overlapping interactive animations
- Use subpath imports for smaller bundle: `import { animate } from 'animejs/animation'`
- Avoid animating layout-triggering properties (width, height, top, left) — prefer transforms
- For 1000+ targets, composition defaults to `'none'` for performance
- Use `frameRate` to cap FPS for non-critical animations

---

*Comprehensive reference from https://animejs.com/documentation/ — anime.js v4*
*Covers: Timer, Animation, Timeline, Animatable, Draggable, Layout, Scope, Events/onScroll, SVG, Text, Utilities, Stagger, Easings, Spring, Engine, WAAPI*
*Last updated: 2025*
