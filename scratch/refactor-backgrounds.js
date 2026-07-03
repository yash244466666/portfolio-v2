const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../components/backgrounds');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && f !== 'index.tsx');

for (const file of files) {
  const filePath = path.join(dir, file);
  let code = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Add prefers-reduced-motion check to useEffect
  if (code.includes('useEffect(() => {') && !code.includes('prefers-reduced-motion')) {
    code = code.replace(/useEffect\(\(\) => \{\n/, `useEffect(() => {\n    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;\n`);
    changed = true;
  }

  // 2. Fix devicePixelRatio scaling
  if (code.includes('canvas.width = w') && !code.includes('devicePixelRatio')) {
    code = code.replace(/let w = container\.offsetWidth\s*\n\s*let h = container\.offsetHeight\s*\n\s*canvas\.width = w\s*\n\s*canvas\.height = h/, 
      `let w = container.offsetWidth\n    let h = container.offsetHeight\n    const dpr = window.devicePixelRatio || 1\n    canvas.width = w * dpr\n    canvas.height = h * dpr\n    ctx.scale(dpr, dpr)`);
    changed = true;
  }

  // 3. Fix mouse event rect offsets
  if (code.includes('e.clientX') && !code.includes('rect.left') && code.includes('onMouseMove')) {
    code = code.replace(/mouseRef\.current = \{ x: e\.clientX, y: e\.clientY \}/, 
      `const rect = canvas.getBoundingClientRect()\n      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }`);
    changed = true;
  }

  // 4. Stale closure refs in fireflies and bokeh
  if ((file === 'fireflies-background.tsx' || file === 'bokeh-background.tsx') && code.includes('useRef(generate')) {
    const genFunc = file === 'fireflies-background.tsx' ? 'generateFireflies' : 'generateBokeh';
    code = code.replace(new RegExp(`const itemsRef = useRef\\(${genFunc}\\(\\)\\)`), 
      `const itemsRef = useRef<any[]>(null)\n  if (!itemsRef.current) itemsRef.current = ${genFunc}()`);
    code = code.replace(/itemsRef\.current/g, '(itemsRef.current as any[])');
    changed = true;
  }

  // 5. Debounce resize event
  if (code.includes('window.addEventListener("resize", onResize)') && !code.includes('resizeTimeout')) {
    code = code.replace(/const onResize = \(\) => \{([^}]+)\}/, 
      `let resizeTimeout: NodeJS.Timeout;\n    const onResize = () => {\n      clearTimeout(resizeTimeout);\n      resizeTimeout = setTimeout(() => {\n        $1\n      }, 150);\n    }`);
    changed = true;
  }

  // 6. Fix drops array in rain-background.tsx
  if (file === 'rain-background.tsx') {
    code = code.replace(/drops\.length = 0/, `// drops.length = 0; // Prevent clearing to avoid visual glitches`);
    changed = true;
  }
  
  // 7. Fix particles fade-in restart
  if (file === 'particles-background.tsx') {
    code = code.replace(/startTime = performance\.now\(\)/g, `// startTime = performance.now() // Prevent visible fade-in restart`);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, code);
    console.log(`Updated ${file}`);
  }
}
