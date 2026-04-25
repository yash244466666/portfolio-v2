import type { ToolCategory, ToolDefinition, ToolsPageContent } from "./types"

export const toolCategories: ToolCategory[] = [
  { id: "core", label: "Core Tools", description: "Essential utilities for everyday tasks" },
  { id: "dev", label: "Dev Utilities", description: "Developer tools for coding and design" },
  { id: "text", label: "Text Utilities", description: "Tools for working with text and content" },
  { id: "media", label: "Media Tools", description: "Audio, video, and file processing tools" },
  { id: "security", label: "Security Tools", description: "Privacy, security, and policy generators" },
  { id: "math", label: "Math & Logic", description: "Calculators, converters, and visual simulators" },
]

export const tools: ToolDefinition[] = [
  // === Core Tools ===
  { id: "pdf-converter", label: "PDF Converter", description: "Convert images to PDF, merge PDFs, and extract text from PDF files.", icon: "FileText", category: "core", tags: ["pdf", "convert", "merge", "extract"] },
  { id: "currency-converter", label: "Currency Converter", description: "Convert between currencies with live exchange rates and offline caching.", icon: "DollarSign", category: "core", tags: ["currency", "money", "convert", "exchange"] },
  { id: "unit-converter", label: "Unit Converter", description: "Convert between units of length, weight, temperature, volume, and more.", icon: "Ruler", category: "core", tags: ["unit", "convert", "measurement"] },
  { id: "timestamp-converter", label: "Timestamp Converter", description: "Convert between Unix timestamps and human-readable dates with a live clock.", icon: "Clock", category: "core", tags: ["timestamp", "date", "unix", "time"] },
  { id: "number-base-converter", label: "Number Base Converter", description: "Convert numbers between decimal, binary, octal, hex, and custom radix.", icon: "Hash", category: "core", tags: ["number", "base", "binary", "hex", "convert"] },
  { id: "hash-generator", label: "Hash Generator", description: "Generate SHA-1, SHA-256, SHA-512 hashes and compare checksums.", icon: "Shield", category: "core", tags: ["hash", "sha", "checksum", "security"] },
  { id: "image-compressor", label: "Image Compressor", description: "Compress PNG and JPG images in-browser with adjustable quality and size.", icon: "Image", category: "core", tags: ["image", "compress", "optimize", "resize"] },

  // === Dev Utilities ===
  { id: "json-editor", label: "JSON Editor", description: "Edit, format, and explore JSON with a professional dual-panel editor featuring code view and interactive tree.", icon: "Braces", category: "dev", tags: ["json", "format", "validate", "minify", "editor", "tree"], wide: true },
  { id: "base64-tool", label: "Base64 Encode/Decode", description: "Encode and decode text and files to and from Base64 format.", icon: "Binary", category: "dev", tags: ["base64", "encode", "decode"] },
  { id: "qr-generator", label: "QR Code Generator", description: "Generate QR codes from text or URLs and download as PNG images.", icon: "QrCode", category: "dev", tags: ["qr", "code", "generate"] },
  { id: "password-generator", label: "Password Generator", description: "Generate secure random passwords with configurable length and character types.", icon: "KeyRound", category: "dev", tags: ["password", "generate", "security"] },
  { id: "color-picker", label: "Color Picker", description: "Pick colors, convert between formats, check contrast, and generate palettes.", icon: "Palette", category: "dev", tags: ["color", "picker", "convert", "palette"] },
  { id: "lorem-ipsum-generator", label: "Lorem Ipsum Generator", description: "Generate Lorem Ipsum placeholder text by paragraphs, sentences, or words.", icon: "Type", category: "dev", tags: ["lorem", "ipsum", "placeholder", "text"] },
  { id: "markdown-preview", label: "Markdown Preview", description: "Write Markdown and see the rendered output side-by-side in real time.", icon: "FileCode", category: "dev", tags: ["markdown", "preview", "render", "md"] },
  { id: "regex-tester", label: "Regex Tester", description: "Test regex patterns with match highlighting and capture group inspection.", icon: "Regex", category: "dev", tags: ["regex", "pattern", "match", "test"] },
  { id: "url-encoder", label: "URL Encoder/Decoder", description: "Encode and decode URLs and query parameters, plus parse URL parts.", icon: "Link", category: "dev", tags: ["url", "encode", "decode", "parse"] },
  { id: "html-entity-encoder", label: "HTML Entity Encoder", description: "Encode, decode, and escape HTML entities and special characters.", icon: "Code", category: "dev", tags: ["html", "entity", "encode", "escape"] },
  { id: "jwt-decoder", label: "JWT Decoder", description: "Decode and inspect JWT tokens — view header, payload, and expiry.", icon: "Key", category: "dev", tags: ["jwt", "token", "decode", "inspect"] },
  { id: "svg-optimizer", label: "SVG Optimizer", description: "Paste SVG markup to minify, pretty-print, and get file size info.", icon: "PenTool", category: "dev", tags: ["svg", "optimize", "minify", "pretty"] },
  { id: "css-gradient-generator", label: "CSS Gradient Generator", description: "Build CSS gradients visually and copy the generated code.", icon: "Blend", category: "dev", tags: ["css", "gradient", "generate", "style"] },
  { id: "color-palette-from-image", label: "Color Palette from Image", description: "Upload an image and extract its dominant colors as a palette.", icon: "Pipette", category: "dev", tags: ["color", "palette", "image", "extract"] },
  // New Dev tools
  { id: "csv-json-converter", label: "CSV to JSON Converter", description: "Convert CSV data to JSON and back with delimiter options.", icon: "Table", category: "dev", tags: ["csv", "json", "convert", "table"] },
  { id: "yaml-json-converter", label: "YAML to JSON Converter", description: "Convert between YAML and JSON formats bidirectionally.", icon: "FileJson", category: "dev", tags: ["yaml", "json", "convert", "format"] },
  { id: "xml-formatter", label: "XML Formatter", description: "Pretty-print and validate XML with syntax highlighting.", icon: "FileCode2", category: "dev", tags: ["xml", "format", "validate", "pretty"] },
  { id: "sql-formatter", label: "SQL Formatter", description: "Format and beautify SQL queries with keyword highlighting.", icon: "Database", category: "dev", tags: ["sql", "format", "query", "beautify"] },
  { id: "ical-generator", label: "iCalendar Generator", description: "Create .ics calendar files for events with download.", icon: "Calendar", category: "dev", tags: ["ical", "calendar", "event", "ics"] },
  { id: "vcard-generator", label: "vCard Generator", description: "Create .vcf contact cards with structured fields.", icon: "Contact", category: "dev", tags: ["vcard", "contact", "vcf", "generate"] },
  { id: "rot13-cipher", label: "ROT13 / Caesar Cipher", description: "Encode and decode text with ROT13 or configurable Caesar cipher shift.", icon: "Lock", category: "dev", tags: ["rot13", "caesar", "cipher", "encode"] },
  { id: "morse-code-translator", label: "Morse Code Translator", description: "Translate text to and from Morse code with audio playback.", icon: "Radio", category: "dev", tags: ["morse", "code", "translate", "audio"] },
  { id: "hmac-generator", label: "HMAC Generator", description: "Generate HMAC signatures using SHA algorithms with a secret key.", icon: "ShieldCheck", category: "dev", tags: ["hmac", "signature", "secret", "crypto"] },
  { id: "uuid-generator", label: "UUID Generator", description: "Generate v4 UUIDs in bulk with copy and format options.", icon: "Fingerprint", category: "dev", tags: ["uuid", "generate", "id", "unique"] },
  { id: "box-shadow-generator", label: "Box Shadow Generator", description: "Design CSS box shadows visually and copy the generated code.", icon: "Square", category: "dev", tags: ["css", "shadow", "box", "generate"] },
  { id: "border-radius-generator", label: "Border Radius Generator", description: "Control individual corners and copy CSS border-radius code.", icon: "RectangleHorizontal", category: "dev", tags: ["css", "border", "radius", "corner"] },
  { id: "text-shadow-generator", label: "Text Shadow Generator", description: "Design CSS text shadows with live preview and code output.", icon: "Type", category: "dev", tags: ["css", "text", "shadow", "generate"] },
  { id: "flexbox-playground", label: "Flexbox Playground", description: "Test CSS flexbox properties interactively with live preview.", icon: "Columns3", category: "dev", tags: ["css", "flexbox", "layout", "playground"] },
  { id: "grid-generator", label: "CSS Grid Generator", description: "Build CSS Grid layouts visually with drag-and-drop areas.", icon: "Grid3X3", category: "dev", tags: ["css", "grid", "layout", "generate"] },
  { id: "triangle-generator", label: "CSS Triangle Generator", description: "Create CSS triangles with adjustable direction, size, and color.", icon: "Triangle", category: "dev", tags: ["css", "triangle", "shape", "generate"] },
  { id: "http-status-codes", label: "HTTP Status Codes", description: "Searchable reference of all HTTP status codes with descriptions.", icon: "Globe", category: "dev", tags: ["http", "status", "code", "reference"] },
  { id: "mime-type-lookup", label: "MIME Type Lookup", description: "Search file extensions and MIME types bidirectionally.", icon: "FileSearch", category: "dev", tags: ["mime", "type", "file", "extension"] },
  { id: "dns-lookup", label: "DNS Lookup", description: "Query DNS records for any domain using public DNS APIs.", icon: "Search", category: "dev", tags: ["dns", "lookup", "domain", "network"] },
  { id: "open-graph-preview", label: "Open Graph Preview", description: "Preview how a URL appears when shared on social media.", icon: "Eye", category: "dev", tags: ["og", "preview", "social", "meta"] },
  { id: "meta-tag-generator", label: "Meta Tag Generator", description: "Build SEO meta tags for your website with structured output.", icon: "Tag", category: "dev", tags: ["meta", "seo", "tag", "generate"] },
  { id: "text-to-slug", label: "Text to Slug", description: "Convert text to URL-safe slugs with customizable separators.", icon: "Link2", category: "dev", tags: ["slug", "url", "text", "convert"] },
  { id: "unicode-lookup", label: "Unicode Lookup", description: "Search Unicode characters by name or code point.", icon: "Languages", category: "dev", tags: ["unicode", "character", "lookup", "search"] },
  { id: "ascii-table", label: "ASCII Table", description: "Interactive ASCII character reference with decimal, hex, and octal.", icon: "Table2", category: "dev", tags: ["ascii", "table", "character", "reference"] },
  { id: "fake-data-generator", label: "Fake Data Generator", description: "Generate realistic fake names, emails, addresses, and phone numbers.", icon: "UserRound", category: "dev", tags: ["fake", "data", "generate", "mock"] },
  { id: "gradient-border-generator", label: "Gradient Border Generator", description: "Create CSS gradient borders with live preview and code output.", icon: "Frame", category: "dev", tags: ["css", "gradient", "border", "generate"] },
  { id: "animation-css-generator", label: "CSS Animation Generator", description: "Build CSS @keyframes animations visually with preview.", icon: "Play", category: "dev", tags: ["css", "animation", "keyframes", "generate"] },
  { id: "glassmorphism-generator", label: "Glassmorphism Generator", description: "Create frosted glass UI effects with backdrop-filter and copy CSS.", icon: "Snowflake", category: "dev", tags: ["css", "glassmorphism", "frost", "generate"] },
  { id: "neumorphism-generator", label: "Neumorphism Generator", description: "Create soft UI neumorphic elements with shadow controls.", icon: "Cloud", category: "dev", tags: ["css", "neumorphism", "soft", "ui"] },
  { id: "chart-generator", label: "Chart Generator", description: "Create simple bar, pie, and line charts and export as PNG.", icon: "BarChart3", category: "dev", tags: ["chart", "bar", "pie", "graph"] },

  // === Text Utilities ===
  { id: "word-counter", label: "Word Counter", description: "Count words, characters, sentences, paragraphs, and estimate reading time.", icon: "AlignLeft", category: "text", tags: ["word", "count", "character", "reading"] },
  { id: "case-converter", label: "Case Converter", description: "Convert text between uppercase, lowercase, title case, camelCase, and more.", icon: "CaseSensitive", category: "text", tags: ["case", "convert", "uppercase", "lowercase"] },
  { id: "text-diff", label: "Text Diff", description: "Compare two texts and highlight the differences between them.", icon: "GitCompare", category: "text", tags: ["diff", "compare", "text"] },
  { id: "remove-duplicates", label: "Remove Duplicates", description: "Remove duplicate lines or words from text with sorting options.", icon: "ListFilter", category: "text", tags: ["duplicate", "remove", "deduplicate", "unique"] },
  { id: "character-counter", label: "Character Counter", description: "Count characters with and without spaces, and analyze text composition.", icon: "Text", category: "text", tags: ["character", "count", "text"] },
  { id: "emoji-picker", label: "Emoji Picker", description: "Search and copy emojis organized by category.", icon: "Smile", category: "text", tags: ["emoji", "picker", "copy", "search"] },
  { id: "hash-diff", label: "Hash Diff", description: "Compare two strings by generating and comparing their hashes.", icon: "Fingerprint", category: "text", tags: ["hash", "compare", "diff", "checksum"] },
  { id: "pomodoro-timer", label: "Pomodoro Timer", description: "Focus timer with work/break intervals and browser notifications.", icon: "Timer", category: "text", tags: ["timer", "pomodoro", "focus", "productivity"] },
  { id: "cron-builder", label: "Cron Expression Builder", description: "Build and understand cron expressions with a visual interface.", icon: "CalendarClock", category: "text", tags: ["cron", "schedule", "builder", "expression"] },
  // New Text tools
  { id: "find-replace", label: "Find & Replace", description: "Regex-powered find and replace with live preview.", icon: "Replace", category: "text", tags: ["find", "replace", "regex", "search"] },
  { id: "reverse-text", label: "Reverse Text", description: "Reverse text by characters, words, or lines.", icon: "Undo2", category: "text", tags: ["reverse", "text", "flip", "mirror"] },
  { id: "sort-lines", label: "Sort Lines", description: "Sort text lines alphabetically, numerically, in reverse, or shuffle.", icon: "ArrowUpDown", category: "text", tags: ["sort", "lines", "alphabetical", "numerical"] },
  { id: "add-line-numbers", label: "Add Line Numbers", description: "Prepend line numbers to text with customizable formatting.", icon: "ListOrdered", category: "text", tags: ["line", "number", "prepend", "format"] },
  { id: "trim-whitespace", label: "Trim Whitespace", description: "Remove leading, trailing, and extra whitespace from text.", icon: "Scissors", category: "text", tags: ["trim", "whitespace", "clean", "space"] },
  { id: "invisible-character-detector", label: "Invisible Character Detector", description: "Find zero-width characters, BOMs, and non-breaking spaces in text.", icon: "ScanEye", category: "text", tags: ["invisible", "zero-width", "detect", "hidden"] },
  { id: "notes-scratchpad", label: "Notes / Scratchpad", description: "A simple notepad that persists your notes in localStorage.", icon: "StickyNote", category: "text", tags: ["notes", "scratchpad", "notepad", "persist"] },
  { id: "bookmark-manager", label: "Bookmark Manager", description: "Save and organize links with tags, stored in localStorage.", icon: "Bookmark", category: "text", tags: ["bookmark", "save", "organize", "link"] },

  // === Media Tools ===
  { id: "audio-recorder", label: "Audio Recorder", description: "Record audio from your microphone, play back, and download as WAV.", icon: "Mic", category: "media", tags: ["audio", "record", "mic", "wav"] },
  { id: "video-to-gif", label: "Video to GIF", description: "Convert short video clips to animated GIFs in-browser.", icon: "Film", category: "media", tags: ["video", "gif", "convert", "animate"] },
  { id: "file-hash-checker", label: "File Hash Checker", description: "Drag a file to compute its SHA-256, SHA-1, and MD5 checksums.", icon: "FileCheck", category: "media", tags: ["file", "hash", "checksum", "verify"] },

  // === Security Tools ===
  { id: "password-strength-checker", label: "Password Strength Checker", description: "Analyze password strength with crack-time estimates and feedback.", icon: "ShieldAlert", category: "security", tags: ["password", "strength", "analyze", "security"] },
  { id: "data-sanitizer", label: "Data Sanitizer", description: "Strip PII like emails, phone numbers, and IP addresses from text.", icon: "Eraser", category: "security", tags: ["sanitize", "pii", "privacy", "strip"] },
  { id: "csp-generator", label: "CSP Generator", description: "Build Content-Security-Policy headers with a visual interface.", icon: "ShieldHalf", category: "security", tags: ["csp", "security", "header", "policy"] },
  { id: "cors-header-builder", label: "CORS Header Builder", description: "Generate Access-Control headers for your API configuration.", icon: "ArrowLeftRight", category: "security", tags: ["cors", "header", "api", "access"] },
  { id: "robots-txt-generator", label: "Robots.txt Generator", description: "Visually build robots.txt files for your website.", icon: "Bot", category: "security", tags: ["robots", "txt", "crawler", "seo"] },

  // === Math & Logic ===
  { id: "percentage-calculator", label: "Percentage Calculator", description: "Calculate percentages, percentage change, and percentage of values.", icon: "Percent", category: "math", tags: ["percentage", "calculate", "percent", "change"] },
  { id: "age-calculator", label: "Age Calculator", description: "Calculate exact age in years, months, days, and hours from birth date.", icon: "Cake", category: "math", tags: ["age", "calculate", "birthday", "date"] },
  { id: "tip-calculator", label: "Tip Calculator", description: "Calculate tips and split bills with customizable percentages.", icon: "Receipt", category: "math", tags: ["tip", "bill", "split", "calculate"] },
  { id: "gcd-lcm-calculator", label: "GCD/LCM Calculator", description: "Find greatest common divisor and least common multiple of numbers.", icon: "Sigma", category: "math", tags: ["gcd", "lcm", "divisor", "multiple"] },
  { id: "roman-numeral-converter", label: "Roman Numeral Converter", description: "Convert between Roman numerals and Arabic numbers.", icon: "Hash", category: "math", tags: ["roman", "numeral", "convert", "ancient"] },
  { id: "bitwise-calculator", label: "Bitwise Calculator", description: "Perform bitwise operations: AND, OR, XOR, NOT, shifts with visual binary.", icon: "Binary", category: "math", tags: ["bitwise", "binary", "and", "or", "xor"] },
  { id: "color-blindness-simulator", label: "Color Blindness Simulator", description: "See how colors look with different types of color vision deficiency.", icon: "EyeOff", category: "math", tags: ["color", "blindness", "simulate", "accessibility"] },
  { id: "calculator", label: "Scientific Calculator", description: "Calculator with standard and scientific functions and history.", icon: "Calculator", category: "math", tags: ["calculator", "scientific", "math", "history"] },
  { id: "stopwatch", label: "Stopwatch", description: "Stopwatch with start, stop, lap, and reset functionality.", icon: "Watch", category: "math", tags: ["stopwatch", "timer", "lap", "measure"] },
  { id: "countdown-timer", label: "Countdown Timer", description: "Set a countdown with alerts when time is up.", icon: "Hourglass", category: "math", tags: ["countdown", "timer", "alert", "deadline"] },
]

export const toolsPageContent: ToolsPageContent = {
  heading: "Developer Tools",
  description: "A collection of free, client-side utilities. No data leaves your browser — everything runs locally.",
  searchPlaceholder: "Search tools...",
  backToGridLabel: "Back to Tools",
  categories: toolCategories,
  tools,
}

export type { ToolCategory, ToolDefinition, ToolsPageContent }