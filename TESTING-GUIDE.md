# Tools Page — End-to-End Manual Test Guide

**Project:** portfolio-v2
**Page:** `/tools/`
**Total Tools:** 86
**Categories:** Core (7), Dev (44), Text (17), Media (3), Security (5), Math (10)

---

## Table of Contents

1. [Pre-Test Setup](#1-pre-test-setup)
2. [Global / Tools Grid Tests](#2-global--tools-grid-tests)
3. [Core Tools](#3-core-tools)
4. [Dev Utilities](#4-dev-utilities)
5. [Text Utilities](#5-text-utilities)
6. [Media Tools](#6-media-tools)
7. [Security Tools](#7-security-tools)
8. [Math & Logic](#8-math--logic)
9. [Cross-Cutting Concerns](#9-cross-cutting-concerns)
10. [Regression Checklist](#10-regression-checklist)

---

## 1. Pre-Test Setup

### Environment
- [ ] Start dev server: `npm run dev`
- [ ] Open browser (Chrome/Firefox recommended)
- [ ] Open DevTools Console (F12) — keep it open to catch JS errors
- [ ] Navigate to `http://localhost:3000/tools/`

### Browser Requirements
- Microphone permission (for Audio Recorder)
- Clipboard API support (for Copy buttons)
- Modern browser (Chrome 90+, Firefox 90+, Safari 15+)

---

## 2. Global / Tools Grid Tests

These apply to the tools landing page before entering any individual tool.

### 2.1 Page Load
| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Navigate to `/tools/` | Page loads without errors in console | |
| 2 | Page is not blank | "Developer Tools" heading is visible | |
| 3 | Description text visible | "A collection of free, client-side utilities..." appears below heading | |
| 4 | Search bar visible | Input with "Search tools..." placeholder | |
| 5 | Category filter buttons visible | "All", "Core Tools", "Dev Utilities", "Text Utilities", "Media Tools", "Security Tools", "Math & Logic" | |

### 2.2 Category Filtering
| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Click "All" | All 86 tool cards visible (scroll to verify all categories) | |
| 2 | Click "Core Tools" | Only 7 Core tool cards shown, heading "Core Tools" with description | |
| 3 | Click "Dev Utilities" | Only 44 Dev tool cards shown | |
| 4 | Click "Text Utilities" | Only 17 Text tool cards shown | |
| 5 | Click "Media Tools" | Only 3 Media tool cards shown | |
| 6 | Click "Security Tools" | Only 5 Security tool cards shown | |
| 7 | Click "Math & Logic" | Only 10 Math tool cards shown | |
| 8 | Switch back to "All" | All categories and cards reappear | |

### 2.3 Search
| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Type "pdf" in search bar | Only "PDF Converter" card shown | |
| 2 | Type "json" | JSON Formatter, CSV to JSON Converter, YAML to JSON Converter shown | |
| 3 | Type "xyznotexist" | "No tools found matching 'xyznotexist'" message | |
| 4 | Clear search input | All tools reappear | |
| 5 | Search by tag: type "hash" | Hash Generator, Hash Diff, File Hash Checker, HMAC Generator shown | |

### 2.4 Tool Card Interaction
| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Hover over a tool card | Card lifts (-translate-y-2), shadow increases, "Open tool" text fades in | |
| 2 | Category badge visible on card | Each card shows category label (Core/Dev/Text/Media/Security/Math) | |
| 3 | Category badge colors match | Core=blue, Dev=emerald, Text=amber, Media=purple, Security=red, Math=cyan | |
| 4 | Click a tool card | Navigates to tool view (URL changes to `#tool-id`), tool renders | |
| 5 | Click "Back to Tools" button | Returns to grid view, hash cleared | |
| 6 | Browser back button | Returns to grid from tool view | |
| 7 | Navigate directly to `/tools/#pdf-converter` | PDF Converter tool loads directly | |

### 2.5 Card Animation
| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Scroll down slowly | Cards fade in (animate-fade-in-up) as they enter viewport | |
| 2 | Cards not visible before scroll | Cards below fold start with opacity-0 | |
| 3 | Cards animate only once | Scrolling up and back down doesn't re-trigger animation | |

---

## 3. Core Tools

### 3.1 PDF Converter (`#pdf-converter`)

**Tabs:** Images to PDF | Merge PDFs | Extract Text

#### Images to PDF Tab
| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Open tool, verify "Images to PDF" tab is active | Dropzone visible | |
| 2 | Drag & drop a PNG or JPG image into dropzone | File appears in file list with size | |
| 3 | Click dropzone to browse files | File picker opens, accepts image types | |
| 4 | Add multiple images (2-3) | All listed with individual sizes | |
| 5 | Click "Convert to PDF" | Button shows loading, then PDF downloads | |
| 6 | Open downloaded PDF | Contains all uploaded images | |
| 7 | Click remove (X) on a file | File removed from list | |
| 8 | Click "Clear All" | All files removed | |
| 9 | Drop a non-image file (e.g., .txt) | File rejected or error shown | |

#### Merge PDFs Tab
| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Switch to "Merge PDFs" tab | Dropzone visible, accepts PDF | |
| 2 | Upload 2+ PDF files | Files listed with sizes | |
| 3 | Click "Merge PDFs" | Merged PDF downloads | |
| 4 | Open merged PDF | Contains pages from all uploaded PDFs | |

#### Extract Text Tab
| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Switch to "Extract Text" tab | Dropzone for single PDF | |
| 2 | Upload a text-based PDF | "Extract Text" button active | |
| 3 | Click "Extract Text" | Extracted text shown in output area | |
| 4 | Click Copy button | Text copied to clipboard | |

### 3.2 Currency Converter (`#currency-converter`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Open tool | Two dropdowns (From/To currency), amount input, result display | |
| 2 | Enter amount "100" | Result updates (or shows loading) | |
| 3 | Select "USD" to "EUR" | Converted amount shown with exchange rate | |
| 4 | Click swap button (if exists) | From/To currencies swapped, result recalculated | |
| 5 | Change amount to "0" | Result is 0 or empty | |
| 6 | Change amount to negative number | Handled gracefully (0 or error) | |
| 7 | Switch to offline/disconnect network | Cached rates still work (if previously loaded) | |

### 3.3 Unit Converter (`#unit-converter`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Open tool | Category tabs (Length, Weight, Temperature, Volume, etc.) | |
| 2 | Select "Length" category | Two unit dropdowns (e.g., Meters, Feet), input field | |
| 3 | Enter "1000" in meters | Result shows in selected target unit | |
| 4 | Change target to "Kilometers" | Result updates to 1 km | |
| 5 | Switch to "Temperature" | Units change to Celsius/Fahrenheit/Kelvin | |
| 6 | Enter "100" Celsius, target Fahrenheit | Result shows 212°F | |
| 7 | Swap units | 212°F → 100°C | |

### 3.4 Timestamp Converter (`#timestamp-converter`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Open tool | Current Unix timestamp displayed, live clock updating | |
| 2 | Enter Unix timestamp "1700000000" | Human-readable date shown (approx Nov 14, 2023) | |
| 3 | Enter a date in the date picker | Unix timestamp calculated | |
| 4 | Click "Use Current Time" | Populates with current timestamp | |
| 5 | Copy buttons work | Timestamp and formatted date can be copied | |

### 3.5 Number Base Converter (`#number-base-converter`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Enter "255" in decimal | Binary: 11111111, Hex: FF, Octal: 377 | |
| 2 | Enter "FF" in hex field | Decimal: 255, other fields update | |
| 3 | Enter "1010" in binary | Decimal: 10, Hex: A | |
| 4 | Enter invalid input (e.g., "GG" in hex) | Error shown or field clears | |
| 5 | Clear all fields | All outputs empty | |

### 3.6 Hash Generator (`#hash-generator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Type "hello" in input | SHA-1, SHA-256, SHA-512 hashes generated | |
| 2 | Click copy button next to any hash | Hash copied to clipboard, "Copied" feedback | |
| 3 | Clear input | All hashes empty | |
| 4 | Paste a known hash in compare field | Match/mismatch indicator shown | |
| 5 | Compare matching hashes | "Match" indicator | |
| 6 | Compare non-matching hashes | "Mismatch" indicator | |

### 3.7 Image Compressor (`#image-compressor`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Drop or browse a PNG/JPG image | Image preview shown, file size displayed | |
| 2 | Adjust quality slider (e.g., to 50%) | Preview updates, estimated size changes | |
| 3 | Adjust max width/height | Preview updates | |
| 4 | Click "Compress" | Compressed image downloads | |
| 5 | Verify compressed size < original | File size reduced | |
| 6 | Upload a very small image (1px) | Tool handles without error | |
| 7 | Upload a large image (5MB+) | Tool processes without freezing | |

---

## 4. Dev Utilities

### 4.1 JSON Formatter (`#json-formatter`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Paste valid JSON: `{"a":1}` | Formatted output shown with indentation | |
| 2 | Click "Format" button | Output pretty-printed | |
| 3 | Click "Minify" | Output collapsed to single line | |
| 4 | Click "Validate" | "Valid JSON" message shown | |
| 5 | Paste invalid JSON: `{a:1}` | Error message with line/position | |
| 6 | Click "Clear" | Input and output cleared | |
| 7 | Click Copy button | Formatted JSON copied | |

### 4.2 Base64 Encode/Decode (`#base64-tool`)

**Tabs:** Text | File

#### Text Tab
| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Select "Encode" mode | Input for plain text | |
| 2 | Type "Hello World" | Base64 output: "SGVsbG8gV29ybGQ=" | |
| 3 | Switch to "Decode" | Input for Base64 string | |
| 4 | Paste "SGVsbG8gV29ybGQ=" | Output: "Hello World" | |
| 5 | Paste invalid Base64 (e.g., "!!!") | Error shown | |

#### File Tab
| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Upload a small text file | Base64 string generated | |
| 2 | Copy button works | Base64 string copied | |

### 4.3 QR Code Generator (`#qr-generator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Type "https://example.com" | QR code preview generates | |
| 2 | Adjust size slider | QR code resizes | |
| 3 | Click "Download PNG" | PNG file downloads | |
| 4 | Clear input | QR code disappears | |
| 5 | Enter very long text (500+ chars) | QR code still generates (may be dense) | |

### 4.4 Password Generator (`#password-generator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Click "Generate" | Random password shown | |
| 2 | Adjust length slider (e.g., to 20) | Password length changes | |
| 3 | Toggle uppercase OFF | No uppercase letters in generated password | |
| 4 | Toggle lowercase OFF | No lowercase letters | |
| 5 | Toggle numbers OFF | No digits | |
| 6 | Toggle symbols OFF | No special characters | |
| 7 | All toggles OFF then generate | Error or fallback (at least one charset required) | |
| 8 | Click Copy | Password copied | |
| 9 | Click "Generate" multiple times | New password each time | |

### 4.5 Color Picker (`#color-picker`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Click color input | Native color picker opens | |
| 2 | Select a color | HEX, RGB, HSL values shown | |
| 3 | Edit HEX value directly | Color updates, RGB/HSL convert | |
| 4 | Edit RGB values | HEX/HSL update | |
| 5 | Copy any format | Value copied | |
| 6 | Check contrast ratio (if available) | Contrast score shown | |

### 4.6 Lorem Ipsum Generator (`#lorem-ipsum-generator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Select "Paragraphs" mode | Count input visible | |
| 2 | Enter "3" | 3 paragraphs generated | |
| 3 | Switch to "Sentences" | Count input, generates N sentences | |
| 4 | Switch to "Words" | Generates N words | |
| 5 | Click Copy | Generated text copied | |
| 6 | Enter "0" | No text generated or minimum 1 | |

### 4.7 Markdown Preview (`#markdown-preview`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Type `# Hello` in editor | Rendered as H1 heading in preview | |
| 2 | Type `**bold**` | Bold text in preview | |
| 3 | Type `- item 1\n- item 2` | Bullet list rendered | |
| 4 | Type `[link](https://example.com)` | Clickable link in preview | |
| 5 | Type code block with triple backticks | Syntax-highlighted code block | |
| 6 | Clear editor | Preview clears | |

### 4.8 Regex Tester (`#regex-tester`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Enter pattern `hello` | Pattern field active | |
| 2 | Enter test string "hello world" | "hello" highlighted as match | |
| 3 | Toggle flags (g, i, m) | Matches update accordingly | |
| 4 | Use capture groups: `(he)(llo)` | Groups displayed separately | |
| 5 | Invalid regex `[` | Error shown | |
| 6 | No matches | "No matches found" message | |

### 4.9 URL Encoder/Decoder (`#url-encoder`)

**Tabs:** Encode/Decode | Parse URL

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Enter `hello world` | Encoded: `hello%20world` | |
| 2 | Switch to Decode | Enter `hello%20world`, output: `hello world` | |
| 3 | Enter URL with query params | All parts parsed (protocol, host, path, params) | |
| 4 | Copy encoded/decoded result | Value copied | |

### 4.10 HTML Entity Encoder (`#html-entity-encoder`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Enter `<div>` | Encoded: `&lt;div&gt;` | |
| 2 | Switch to Decode | Enter `&lt;div&gt;`, output: `<div>` | |
| 3 | Enter `&` symbol | Encoded: `&amp;` | |
| 4 | Copy button | Result copied | |

### 4.11 JWT Decoder (`#jwt-decoder`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Paste a valid JWT token | Header, Payload, Signature sections shown | |
| 2 | Verify header decoded | Shows algorithm and type | |
| 3 | Verify payload decoded | Shows claims (iat, exp, sub, etc.) | |
| 4 | Check expiry indicator | Shows if expired or valid | |
| 5 | Paste invalid JWT | Error shown | |

### 4.12 SVG Optimizer (`#svg-optimizer`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Paste SVG markup: `<svg><rect width="100" height="100"/></svg>` | Original size shown | |
| 2 | Click "Minify" | Optimized SVG, smaller size shown | |
| 3 | Click "Pretty Print" | Formatted SVG with indentation | |
| 4 | Copy button | Optimized SVG copied | |
| 5 | Paste invalid SVG | Error shown | |

### 4.13 CSS Gradient Generator (`#css-gradient-generator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Tool opens | Gradient preview, color stops, direction control | |
| 2 | Change first color | Preview updates | |
| 3 | Change second color | Preview updates | |
| 4 | Change direction (to right, to bottom, etc.) | Preview rotates | |
| 5 | Add a third color stop | Three-color gradient | |
| 6 | Copy CSS code | CSS `background: linear-gradient(...)` copied | |

### 4.14 Color Palette from Image (`#color-palette-from-image`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Upload an image | Image preview shown | |
| 2 | Wait for processing | 5-8 dominant colors extracted as palette | |
| 3 | Click a color swatch | HEX value shown, can copy | |
| 4 | Copy all palette | All colors copied | |

### 4.15 CSV to JSON Converter (`#csv-json-converter`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Paste CSV: `name,age\nJohn,30\nJane,25` | JSON output shown | |
| 2 | Change delimiter to semicolon | Output re-parses | |
| 3 | Switch to JSON → CSV mode | JSON input, CSV output | |
| 4 | Paste invalid CSV | Error shown | |
| 5 | Copy button | Output copied | |

### 4.16 YAML to JSON Converter (`#yaml-json-converter`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Paste YAML: `name: John\nage: 30` | JSON output: `{"name":"John","age":30}` | |
| 2 | Switch to JSON → YAML | Paste JSON, get YAML output | |
| 3 | Paste invalid YAML | Error shown | |
| 4 | Copy button | Output copied | |

### 4.17 XML Formatter (`#xml-formatter`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Paste minified XML | Pretty-printed with indentation | |
| 2 | Click "Minify" | XML collapsed to single line | |
| 3 | Click "Validate" | Valid/Invalid status shown | |
| 4 | Paste invalid XML (unclosed tag) | Error with line number | |
| 5 | Copy button | Output copied | |

### 4.18 SQL Formatter (`#sql-formatter`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Paste SQL: `SELECT * FROM users WHERE id = 1` | Formatted with keywords on new lines, indentation | |
| 2 | Keywords highlighted | SELECT, FROM, WHERE styled differently | |
| 3 | Paste complex SQL (JOINs, subqueries) | Properly formatted | |
| 4 | Copy button | Formatted SQL copied | |

### 4.19 iCalendar Generator (`#ical-generator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Fill event title | Title appears in preview | |
| 2 | Set start and end date/time | Duration calculated | |
| 3 | Add location | Shown in preview | |
| 4 | Add description | Shown in preview | |
| 5 | Click "Download .ics" | .ics file downloads | |
| 6 | Open .ics file in calendar app | Event details match inputs | |

### 4.20 vCard Generator (`#vcard-generator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Fill name fields | Name in preview | |
| 2 | Fill phone, email | Contact info shown | |
| 3 | Fill organization, title | Professional details shown | |
| 4 | Click "Download .vcf" | .vcf file downloads | |
| 5 | Open .vcf file | Contact card with all fields | |

### 4.21 ROT13 / Caesar Cipher (`#rot13-cipher`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Type "hello" with shift 13 | Output: "uryyb" | |
| 2 | Switch to Decode | Paste "uryyb", output: "hello" | |
| 3 | Change shift to 3 | "hello" → "khoor" | |
| 4 | Type non-alphabetic characters | Passed through unchanged | |
| 5 | Copy button | Output copied | |

### 4.22 Morse Code Translator (`#morse-code-translator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Type "SOS" in text mode | Output: "... --- ..." | |
| 2 | Switch to Morse → Text | Type "... --- ...", output: "SOS" | |
| 3 | Click "Play Audio" | Beeps played for dots/dashes | |
| 4 | Type lowercase "sos" | Same output (case-insensitive) | |
| 5 | Type numbers | Numbers translated to Morse | |

### 4.23 HMAC Generator (`#hmac-generator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Enter message "hello" | HMAC input ready | |
| 2 | Enter secret key "secret" | Key set | |
| 3 | Select algorithm SHA-256 | HMAC-SHA256 generated | |
| 4 | Change algorithm to SHA-512 | Different HMAC generated | |
| 5 | Copy button | HMAC signature copied | |

### 4.24 UUID Generator (`#uuid-generator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Click "Generate" | Single UUID v4 displayed | |
| 2 | Change bulk count to 10 | Click generate, 10 UUIDs shown | |
| 3 | All UUIDs are unique | No duplicates | |
| 4 | Click Copy | UUID(s) copied | |
| 5 | Toggle uppercase format | UUIDs shown in uppercase | |

### 4.25 Box Shadow Generator (`#box-shadow-generator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Tool opens | Preview box with default shadow | |
| 2 | Adjust X offset slider | Shadow moves horizontally | |
| 3 | Adjust Y offset slider | Shadow moves vertically | |
| 4 | Adjust blur slider | Shadow softens/sharpens | |
| 5 | Adjust spread slider | Shadow grows/shrinks | |
| 6 | Change shadow color | Color updates | |
| 7 | Toggle inset | Shadow becomes inset | |
| 8 | Copy CSS | `box-shadow: ...` copied | |

### 4.26 Border Radius Generator (`#border-radius-generator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Tool opens | Preview box with rounded corners | |
| 2 | Adjust top-left radius | Corner rounds | |
| 3 | Adjust top-right radius | Corner rounds independently | |
| 4 | Link all corners | All corners change together | |
| 5 | Copy CSS | `border-radius: ...` copied | |

### 4.27 Text Shadow Generator (`#text-shadow-generator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Tool opens | Preview text with shadow | |
| 2 | Adjust X/Y offset | Shadow position changes | |
| 3 | Adjust blur | Shadow softens | |
| 4 | Change shadow color | Color updates | |
| 5 | Copy CSS | `text-shadow: ...` copied | |

### 4.28 Flexbox Playground (`#flexbox-playground`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Tool opens | Container with default flex items | |
| 2 | Change flex-direction to "column" | Items stack vertically | |
| 3 | Change justify-content to "space-between" | Items space out | |
| 4 | Change align-items to "center" | Items vertically centered | |
| 5 | Change flex-wrap to "wrap" | Items wrap to new line | |
| 6 | Adjust gap | Space between items changes | |
| 7 | Add/remove items | Item count changes | |
| 8 | Copy CSS | Flexbox styles copied | |

### 4.29 CSS Grid Generator (`#grid-generator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Tool opens | Grid preview with rows/columns | |
| 2 | Set columns to 3 | 3-column grid shown | |
| 3 | Set rows to 2 | 2-row grid shown | |
| 4 | Adjust gap | Spacing between cells changes | |
| 5 | Copy CSS | Grid template CSS copied | |

### 4.30 CSS Triangle Generator (`#triangle-generator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Tool opens | Triangle preview | |
| 2 | Change direction (up/down/left/right) | Triangle points that direction | |
| 3 | Adjust size | Triangle resizes | |
| 4 | Change color | Triangle color updates | |
| 5 | Copy CSS | CSS triangle code copied | |

### 4.31 HTTP Status Codes (`#http-status-codes`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Tool opens | Scrollable list of all HTTP status codes | |
| 2 | Search for "404" | 404 Not Found shown | |
| 3 | Filter by category (2xx, 4xx, etc.) | Only codes in that category shown | |
| 4 | Click a status code | Description expanded/shown | |
| 5 | Search for "Not Found" | 404 appears | |

### 4.32 MIME Type Lookup (`#mime-type-lookup`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Search by extension ".pdf" | MIME type: `application/pdf` | |
| 2 | Search by MIME "text/html" | Extension: `.html` shown | |
| 3 | Type unknown extension | "Not found" or empty | |
| 4 | Switch between extension/MIME mode | Search context changes | |

### 4.33 DNS Lookup (`#dns-lookup`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Enter domain "google.com" | DNS records shown (A, AAAA, MX, etc.) | |
| 2 | Click "Lookup" | Loading state, then results | |
| 3 | Enter invalid domain | Error or "No records found" | |
| 4 | Copy records | DNS info copied | |

### 4.34 Open Graph Preview (`#open-graph-preview`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Enter a URL (e.g., `https://github.com`) | OG tags fetched and displayed | |
| 2 | Preview card shown | Title, description, image from OG tags | |
| 3 | Missing OG tags | Fallback message shown | |
| 4 | Invalid URL | Error shown | |

### 4.35 Meta Tag Generator (`#meta-tag-generator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Fill title, description, keywords | Preview updates | |
| 2 | Add Open Graph fields | OG tags in output | |
| 3 | Add Twitter card fields | Twitter tags in output | |
| 4 | Copy HTML | Meta tag HTML copied | |
| 5 | Clear all | All fields reset | |

### 4.36 Text to Slug (`#text-to-slug`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Type "Hello World!" | Output: "hello-world" | |
| 2 | Change separator to "_" | Output: "hello_world" | |
| 3 | Type text with special chars | All non-alphanumeric removed | |
| 4 | Type "  multiple   spaces  " | Collapsed to single separator | |
| 5 | Copy button | Slug copied | |

### 4.37 Unicode Lookup (`#unicode-lookup`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Search for "heart" | Unicode heart characters shown (U+2764, etc.) | |
| 2 | Search by code point "0041" | Latin Capital A shown | |
| 3 | Click a character | Details (name, code point, category) shown | |
| 4 | Copy character | Character copied | |

### 4.38 ASCII Table (`#ascii-table`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Tool opens | Full ASCII table (0-127) with decimal, hex, octal, character | |
| 2 | Search for "A" | Row for A (65, 0x41, 0101) highlighted | |
| 3 | Filter by range | Subset shown | |
| 4 | Click a row | Details or copy | |

### 4.39 Fake Data Generator (`#fake-data-generator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Select data type: Name | Random name generated | |
| 2 | Select Email | Random email generated | |
| 3 | Generate multiple (5) | 5 items shown | |
| 4 | Click "Generate" again | Different data each time | |
| 5 | Copy button | Data copied | |

### 4.40 Gradient Border Generator (`#gradient-border-generator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Tool opens | Preview box with gradient border | |
| 2 | Change gradient colors | Border gradient updates | |
| 3 | Adjust border width | Border thickness changes | |
| 4 | Change border radius | Box rounds | |
| 5 | Copy CSS | Gradient border code copied | |

### 4.41 CSS Animation Generator (`#animation-css-generator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Select animation type (fade, slide, bounce, etc.) | Preview plays animation | |
| 2 | Adjust duration | Animation speed changes | |
| 3 | Adjust delay | Animation starts after delay | |
| 4 | Change iteration count | Animation repeats or infinite | |
| 5 | Change easing | Timing function changes | |
| 6 | Copy CSS | `@keyframes` + `animation:` CSS copied | |

### 4.42 Glassmorphism Generator (`#glassmorphism-generator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Tool opens | Frosted glass preview | |
| 2 | Adjust blur (backdrop-filter) | Glass effect softens/sharpens | |
| 3 | Adjust opacity | Glass more/less transparent | |
| 4 | Change background color | Tint changes | |
| 5 | Adjust border | Glass border changes | |
| 6 | Copy CSS | backdrop-filter + background CSS copied | |

### 4.43 Neumorphism Generator (`#neumorphism-generator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Tool opens | Soft UI element preview | |
| 2 | Adjust shadow distance | Depth changes | |
| 3 | Adjust shadow blur | Softness changes | |
| 4 | Change background color | Shadow contrast adjusts | |
| 5 | Toggle convex/concave | Shadow direction flips | |
| 6 | Copy CSS | Neumorphic box-shadow CSS copied | |

### 4.44 Chart Generator (`#chart-generator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Select chart type: Bar | Bar chart preview | |
| 2 | Select chart type: Pie | Pie chart preview | |
| 3 | Select chart type: Line | Line chart preview | |
| 4 | Edit data values | Chart updates in real time | |
| 5 | Change labels | Chart labels update | |
| 6 | Click "Export as PNG" | Chart image downloads | |

---

## 5. Text Utilities

### 5.1 Word Counter (`#word-counter`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Type or paste text | Stats update in real time | |
| 2 | Verify word count | Matches expected count | |
| 3 | Verify character count (with/without spaces) | Both shown | |
| 4 | Verify sentence count | Based on punctuation | |
| 5 | Verify paragraph count | Based on line breaks | |
| 6 | Verify reading time estimate | Approximate minutes shown | |
| 7 | Clear text | All stats reset to 0 | |

### 5.2 Case Converter (`#case-converter`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Type "hello world" | Input populated | |
| 2 | Click "UPPERCASE" | Output: "HELLO WORLD" | |
| 3 | Click "lowercase" | Output: "hello world" | |
| 4 | Click "Title Case" | Output: "Hello World" | |
| 5 | Click "camelCase" | Output: "helloWorld" | |
| 6 | Click "PascalCase" | Output: "HelloWorld" | |
| 7 | Click "snake_case" | Output: "hello_world" | |
| 8 | Click "kebab-case" | Output: "hello-world" | |
| 9 | Copy any result | Text copied | |

### 5.3 Text Diff (`#text-diff`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Paste "hello world" in left | Left panel populated | |
| 2 | Paste "hello earth" in right | Differences highlighted | |
| 3 | Added text highlighted | Green/highlighted additions | |
| 4 | Removed text highlighted | Red/highlighted removals | |
| 5 | Identical text | No highlights | |
| 6 | Clear both | Panels empty | |

### 5.4 Remove Duplicates (`#remove-duplicates`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Paste lines with duplicates | Input populated | |
| 2 | Click "Remove Duplicates" | Only unique lines in output | |
| 3 | Toggle "Sort output" | Output sorted alphabetically | |
| 4 | Toggle "Case sensitive" | Duplicates only removed for same case | |
| 5 | Copy output | Cleaned text copied | |

### 5.5 Character Counter (`#character-counter`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Type "Hello World" | Character count: 11 (with spaces), 10 (without) | |
| 2 | Verify letter/digit/space breakdown | Stats shown | |
| 3 | Empty input | All counts zero | |
| 4 | Paste long text | Counts update correctly | |

### 5.6 Emoji Picker (`#emoji-picker`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Tool opens | Emoji categories visible (Smileys, Animals, etc.) | |
| 2 | Click a category | Emojis in that category shown | |
| 3 | Search for "heart" | Heart emojis shown | |
| 4 | Click an emoji | Emoji copied to clipboard, "Copied!" feedback | |
| 5 | Browse all categories | Each category has emojis | |

### 5.7 Hash Diff (`#hash-diff`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Type "hello" in left field | Hash generated | |
| 2 | Type "hello" in right field | Hashes match — "Identical" indicator | |
| 3 | Change right to "world" | Hashes differ — "Different" indicator | |
| 4 | Compare different hash algorithms | All supported algorithms shown | |

### 5.8 Pomodoro Timer (`#pomodoro-timer`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Click "Start" | Timer starts counting down from 25:00 | |
| 2 | Timer reaches 0 | Notification/alert, switches to break | |
| 3 | Click "Pause" | Timer pauses | |
| 4 | Click "Resume" | Timer continues | |
| 5 | Click "Reset" | Timer resets to 25:00 | |
| 6 | Adjust work/break duration | Timer respects new durations | |
| 7 | Session counter increments | After each work+break cycle | |

### 5.9 Cron Expression Builder (`#cron-builder`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Select "Every minute" preset | Cron: `* * * * *` | |
| 2 | Select "Every hour" | Cron: `0 * * * *` | |
| 3 | Select "Daily at midnight" | Cron: `0 0 * * *` | |
| 4 | Manually adjust minute/hour/day fields | Cron expression updates | |
| 5 | Human-readable description shown | "Every minute", "At 00:00", etc. | |
| 6 | Copy cron expression | Copied | |

### 5.10 Find & Replace (`#find-replace`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Paste text in input | Text area populated | |
| 2 | Enter find pattern "hello" | Matches highlighted | |
| 3 | Enter replace "hi" | Preview shows "hi" replacing "hello" | |
| 4 | Toggle "Regex mode" | Pattern treated as regex | |
| 5 | Toggle "Case sensitive" | Match behavior changes | |
| 6 | Click "Replace All" | Output text with replacements | |
| 7 | Copy output | Replaced text copied | |

### 5.11 Reverse Text (`#reverse-text`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Type "hello" | Output updates | |
| 2 | Select "Characters" | Output: "olleh" | |
| 3 | Select "Words" | "hello world" → "world hello" | |
| 4 | Select "Lines" | Lines reversed | |
| 5 | Copy | Reversed text copied | |

### 5.12 Sort Lines (`#sort-lines`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Paste unsorted lines | Input populated | |
| 2 | Click "Alphabetical (A-Z)" | Lines sorted A-Z | |
| 3 | Click "Alphabetical (Z-A)" | Lines sorted Z-A | |
| 4 | Click "Numerical" | Lines sorted by number | |
| 5 | Click "Shuffle" | Lines randomly reordered | |
| 6 | Copy | Sorted text copied | |

### 5.13 Add Line Numbers (`#add-line-numbers`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Paste multi-line text | Input populated | |
| 2 | Click "Add Line Numbers" | Each line prefixed with number | |
| 3 | Change starting number (e.g., 5) | Numbers start at 5 | |
| 4 | Change separator (e.g., ". ") | Format: "1. line" | |
| 5 | Copy | Numbered text copied | |

### 5.14 Trim Whitespace (`#trim-whitespace`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Paste text with leading/trailing spaces | Input populated | |
| 2 | Click "Trim Leading" | Leading spaces removed | |
| 3 | Click "Trim Trailing" | Trailing spaces removed | |
| 4 | Click "Trim Both" | Both sides clean | |
| 5 | Click "Remove Extra Spaces" | Multiple spaces → single space | |
| 6 | Copy | Cleaned text copied | |

### 5.15 Invisible Character Detector (`#invisible-character-detector`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Paste clean text | "No invisible characters found" | |
| 2 | Paste text with zero-width spaces | Invisible chars highlighted/counted | |
| 3 | Paste text with non-breaking spaces | Detected and listed | |
| 4 | Paste text with BOM | BOM detected | |
| 5 | Click "Clean" | Invisible chars removed from output | |
| 6 | Copy cleaned text | Clean version copied | |

### 5.16 Notes / Scratchpad (`#notes-scratchpad`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Type notes in textarea | Text appears | |
| 2 | Wait 1-2 seconds | Auto-saves to localStorage | |
| 3 | Refresh page | Notes persist | |
| 4 | Clear notes | Textarea empties | |
| 5 | Refresh again | Empty on reload (cleared was saved) | |

### 5.17 Bookmark Manager (`#bookmark-manager`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Add bookmark: URL + title + tags | Bookmark appears in list | |
| 2 | Add another bookmark | Two bookmarks shown | |
| 3 | Search bookmarks by title | Filtered results | |
| 4 | Filter by tag | Only matching bookmarks | |
| 5 | Delete a bookmark | Removed from list | |
| 6 | Refresh page | Bookmarks persist (localStorage) | |
| 7 | Edit a bookmark | Changes saved | |

---

## 6. Media Tools

### 6.1 Audio Recorder (`#audio-recorder`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Click "Start Recording" | Browser asks for mic permission | |
| 2 | Allow microphone | Recording starts, waveform animation visible | |
| 3 | Speak for 3-5 seconds | Timer shows elapsed time | |
| 4 | Click "Stop Recording" | Recording stops, playback controls shown | |
| 5 | Click "Play" | Audio plays back | |
| 6 | Click "Download WAV" | WAV file downloads | |
| 7 | Click "Record Again" | Previous recording cleared, new recording starts | |
| 8 | Deny microphone permission | Error message shown gracefully | |

### 6.2 Video to GIF (`#video-to-gif`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Upload a short video (MP4, <10s) | Video preview shown | |
| 2 | Set start/end time | Clip range defined | |
| 3 | Set frame rate (e.g., 10 fps) | FPS set | |
| 4 | Set GIF size/quality | Parameters set | |
| 5 | Click "Convert to GIF" | Progress shown, then GIF preview | |
| 6 | Click "Download GIF" | GIF file downloads | |
| 7 | Upload non-video file | Error shown | |

### 6.3 File Hash Checker (`#file-hash-checker`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Drag a file into dropzone | File name and size shown | |
| 2 | Wait for hashing | SHA-256, SHA-1, MD5 checksums computed | |
| 3 | Copy any hash | Hash copied | |
| 4 | Upload another file | Different hashes generated | |
| 5 | Paste expected hash in compare field | Match/mismatch shown | |

---

## 7. Security Tools

### 7.1 Password Strength Checker (`#password-strength-checker`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Type "password" | Strength: Very Weak, crack time shown | |
| 2 | Type "P@ssw0rd123!" | Strength: Medium/Strong | |
| 3 | Type 20-char random string | Strength: Very Strong | |
| 4 | Strength meter color matches level | Red → Orange → Yellow → Green | |
| 5 | Checklist items update | Length, uppercase, lowercase, numbers, symbols checked/unchecked | |
| 6 | Crack time estimate shown | e.g., "3 seconds", "centuries" | |

### 7.2 Data Sanitizer (`#data-sanitizer`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Paste text with email: "Contact john@example.com" | Email detected | |
| 2 | Paste text with phone: "Call 555-1234" | Phone detected | |
| 3 | Paste text with IP: "Server at 192.168.1.1" | IP detected | |
| 4 | Toggle which PII types to strip | Only selected types removed | |
| 5 | Click "Sanitize" | PII replaced with [REDACTED] or similar | |
| 6 | Copy sanitized text | Clean text copied | |

### 7.3 CSP Generator (`#csp-generator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Tool opens | Directive categories listed (default-src, script-src, etc.) | |
| 2 | Add source to "default-src": 'self' | Added to policy | |
| 3 | Add source to "script-src": 'self', 'unsafe-inline' | Added | |
| 4 | Add source to "img-src": 'self', data: | Added | |
| 5 | Generated CSP header shown in output | Full Content-Security-Policy string | |
| 6 | Copy CSP header | Copied | |
| 7 | Reset | All directives cleared | |

### 7.4 CORS Header Builder (`#cors-header-builder`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Set allowed origin: "https://example.com" | Origin in output | |
| 2 | Set allowed methods: GET, POST | Methods in output | |
| 3 | Set allowed headers: Content-Type | Headers in output | |
| 4 | Toggle "Allow Credentials" | Access-Control-Allow-Credentials: true | |
| 5 | Set max-age: 3600 | Access-Control-Max-Age: 3600 | |
| 6 | Copy headers | CORS headers copied | |

### 7.5 Robots.txt Generator (`#robots-txt-generator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Add user-agent: "Googlebot" | Agent listed | |
| 2 | Add disallow: "/admin" | Rule shown | |
| 3 | Add allow: "/public" | Rule shown | |
| 4 | Add another user-agent: "*" | Second agent section | |
| 5 | Add sitemap URL | Sitemap line in output | |
| 6 | Preview robots.txt | Full text shown | |
| 7 | Copy or download | robots.txt content copied/downloaded | |

---

## 8. Math & Logic

### 8.1 Percentage Calculator (`#percentage-calculator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Enter 25% of 200 | Result: 50 | |
| 2 | Calculate % change: from 50 to 75 | Result: 50% increase | |
| 3 | What % is 30 of 150 | Result: 20% | |
| 4 | Enter 0 values | Handled gracefully (0 or error) | |

### 8.2 Age Calculator (`#age-calculator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Enter birth date (e.g., Jan 1, 2000) | Age shown: X years, Y months, Z days | |
| 2 | Verify total days/hours | Detailed breakdown | |
| 3 | Enter today's date | Age: 0 years, 0 months, 0 days | |
| 4 | Enter future date | Error or "Not born yet" | |

### 8.3 Tip Calculator (`#tip-calculator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Enter bill: $100 | Default tip % shown | |
| 2 | Set tip: 15% | Tip: $15, Total: $115 | |
| 3 | Set split: 2 people | Per person: $57.50 | |
| 4 | Change tip to 20% | Tip: $20, Total: $120, Per person: $60 | |
| 5 | Set split to 1 | No split shown | |

### 8.4 GCD/LCM Calculator (`#gcd-lcm-calculator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Enter 12 and 18 | GCD: 6, LCM: 36 | |
| 2 | Enter 7 and 13 | GCD: 1 (coprime), LCM: 91 | |
| 3 | Enter 0 and 5 | GCD: 5, LCM: 0 | |
| 4 | Enter negative numbers | Handled (absolute values or error) | |

### 8.5 Roman Numeral Converter (`#roman-numeral-converter`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Enter 1994 | Output: MCMXCIV | |
| 2 | Enter 3999 | Output: MMMCMXCIX | |
| 3 | Switch to Roman → Arabic | Enter "XLII", output: 42 | |
| 4 | Enter invalid Roman "IIII" | Error shown | |
| 5 | Enter 0 | Error (no Roman zero) | |
| 6 | Enter 4000+ | Error (out of range) or overline notation | |

### 8.6 Bitwise Calculator (`#bitwise-calculator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Enter A=10, B=6 | Binary shown: 1010, 0110 | |
| 2 | Select AND | Result: 2 (0010) | |
| 3 | Select OR | Result: 14 (1110) | |
| 4 | Select XOR | Result: 12 (1100) | |
| 5 | Select NOT A | Result shown | |
| 6 | Left shift A by 2 | Result: 40 | |
| 7 | Right shift A by 1 | Result: 5 | |

### 8.7 Color Blindness Simulator (`#color-blindness-simulator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Enter a color (e.g., #FF0000 red) | Original color shown | |
| 2 | Select "Protanopia" | Simulated color shown | |
| 3 | Select "Deuteranopia" | Different simulation | |
| 4 | Select "Tritanopia" | Different simulation | |
| 5 | Select "Achromatopsia" | Grayscale simulation | |
| 6 | Side-by-side comparison | Original vs simulated | |

### 8.8 Scientific Calculator (`#calculator`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Click 2 + 2 = | Result: 4 | |
| 2 | Click 10 / 3 = | Result: 3.333... | |
| 3 | Click C | Display clears | |
| 4 | Switch to Scientific mode | sin, cos, tan, log, sqrt buttons visible | |
| 5 | Click sin(0) = | Result: 0 | |
| 6 | Click sqrt(16) = | Result: 4 | |
| 7 | Perform multiple operations | History panel shows entries | |
| 8 | Click history entry | Result loaded into display | |

### 8.9 Stopwatch (`#stopwatch`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Click "Start" | Timer starts, milliseconds updating | |
| 2 | Click "Lap" | Lap time recorded and shown | |
| 3 | Click "Lap" again | Second lap recorded | |
| 4 | Click "Stop" | Timer stops | |
| 5 | Click "Resume" | Timer continues | |
| 6 | Click "Reset" | Timer resets to 00:00.00, laps cleared | |

### 8.10 Countdown Timer (`#countdown-timer`)

| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Set time: 0h 1m 0s | Display shows 01:00 | |
| 2 | Click "Start" | Countdown begins | |
| 3 | Timer reaches 0 | Alert/notification fires | |
| 4 | Click "Pause" during countdown | Timer pauses | |
| 5 | Click "Resume" | Countdown continues | |
| 6 | Click "Reset" | Timer resets to original time | |

---

## 9. Cross-Cutting Concerns

### 9.1 Shared Copy Button
| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Click Copy button on any tool | "Copied" feedback shown (icon changes for ~2s) | |
| 2 | Paste from clipboard | Copied content matches displayed text | |
| 3 | Copy with empty output | Copy button hidden or disabled | |

### 9.2 Shared Dropzone
| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Drag file over dropzone | Visual feedback (border color/scale) | |
| 2 | Drop valid file | File accepted | |
| 3 | Drop oversized file (>50MB) | Error: file too large | |
| 4 | Click dropzone area | File picker opens | |

### 9.3 Shared Tab Switcher
| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Click inactive tab | Active tab switches, content updates | |
| 2 | Active tab styled differently | Primary color background | |
| 3 | Tab state preserved within tool | Switching tabs and back shows correct content | |

### 9.4 Error Handling
| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Trigger error on any tool (invalid input) | Error banner in red: `bg-red-500/10 border-red-500/30 text-red-400` | |
| 2 | Fix the input | Error disappears | |
| 3 | No unhandled exceptions in console | Console clean of JS errors | |

### 9.5 Responsive Design
| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Resize to 320px (mobile) | Tools grid: 1 column, tool UIs adapt | |
| 2 | Resize to 768px (tablet) | Tools grid: 2 columns | |
| 3 | Resize to 1280px (desktop) | Tools grid: 3 columns | |
| 4 | Tool card hover on mobile (tap) | No hover effects broken on touch | |
| 5 | Navigation collapses on mobile | Hamburger menu visible | |

### 9.6 Navigation
| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Click "Tools" in nav from home page | Navigates to `/tools/` | |
| 2 | Click "About" from `/tools/` page | Navigates to `/#about` | |
| 3 | Click "Projects" from `/tools/` page | Navigates to `/#projects` | |
| 4 | Click "Get In Touch" from `/tools/` page | Navigates to `/#contact` | |
| 5 | Browser back from tool view | Returns to tools grid | |
| 6 | Direct URL `/tools/#json-formatter` | JSON Formatter loads | |

### 9.7 Dark Theme
| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Verify page uses dark theme | Dark background, light text | |
| 2 | All tool UIs readable in dark mode | No low-contrast text | |
| 3 | Cards and borders visible | Adequate contrast | |
| 4 | Error messages readable | Red text on dark background | |

### 9.8 Performance
| # | Test Step | Expected Result | Pass? |
|---|-----------|----------------|-------|
| 1 | Initial page load under 3s (local) | Page interactive quickly | |
| 2 | No excessive console warnings | Clean console | |
| 3 | Scroll through all 86 cards | Smooth scrolling, no jank | |
| 4 | Search while typing | Results filter responsively | |
| 5 | Tool lazy-loading works | Only loaded when clicked | |

---

## 10. Regression Checklist

After any code change, run through this abbreviated checklist:

- [ ] `/tools/` page loads (not blank)
- [ ] All 6 category filters work
- [ ] Search returns correct results
- [ ] Click a tool → tool renders → "Back to Tools" returns to grid
- [ ] Copy button works on at least one tool
- [ ] No console errors on page load or tool navigation
- [ ] Mobile viewport: grid collapses to 1 column
- [ ] PDF Converter: upload image → convert → download
- [ ] JSON Formatter: paste JSON → format → copy
- [ ] Calculator: 2+2=4
- [ ] localStorage tools (Notes, Bookmarks): data persists after refresh

---

## Appendix: Quick Test Sample

If time is limited, test these 10 tools which cover all major interaction patterns:

| Tool | Category | Key Pattern Tested |
|------|----------|-------------------|
| PDF Converter | Core | File upload, download, tabs |
| Currency Converter | Core | API call, live data |
| JSON Formatter | Dev | Text processing, format/minify/validate |
| Box Shadow Generator | Dev | Sliders, live preview, CSS copy |
| QR Code Generator | Dev | Image generation, download |
| Word Counter | Text | Real-time stats, textarea input |
| Find & Replace | Text | Regex, toggle options, preview |
| Audio Recorder | Media | Browser API, mic permission |
| Password Strength Checker | Security | Strength meter, checklist |
| Calculator | Math | Button grid, history |

---

**Document version:** 1.0
**Last updated:** 2026-04-19
**Total test cases:** ~500+