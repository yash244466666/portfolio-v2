import { EditorView } from "@codemirror/view"

export const jsonEditorTheme = EditorView.theme({
  "&": {
    backgroundColor: "transparent",
    color: "var(--foreground)",
    fontSize: "13px",
    height: "100%",
  },
  ".cm-scroller": {
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace",
    overflow: "auto",
  },
  ".cm-content": {
    caretColor: "var(--primary)",
    padding: "8px 0",
  },
  ".cm-cursor": {
    borderLeftColor: "var(--primary)",
    borderLeftWidth: "2px",
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
    backgroundColor: "color-mix(in oklch, var(--primary) 30%, transparent) !important",
  },
  ".cm-gutters": {
    backgroundColor: "transparent",
    color: "var(--muted-foreground)",
    border: "none",
    borderRight: "1px solid var(--border)",
    minWidth: "2.5em",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 8px 0 12px",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent",
    color: "var(--foreground)",
  },
  ".cm-activeLine": {
    backgroundColor: "color-mix(in oklch, var(--muted) 30%, transparent)",
  },
  ".cm-matchingBracket": {
    backgroundColor: "color-mix(in oklch, var(--primary) 30%, transparent)",
    outline: "1px solid var(--primary)",
  },
  ".cm-lintRange-error": {
    backgroundImage: "none",
    textDecoration: "wavy underline var(--destructive)",
  },
  ".cm-lintMarker-error": {
    color: "var(--destructive)",
  },
  ".cm-foldGutter": {
    width: "1em",
  },
  ".cm-foldPlaceholder": {
    backgroundColor: "var(--muted)",
    color: "var(--muted-foreground)",
    border: "none",
    padding: "0 4px",
  },
  ".cm-tooltip": {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
  },
  ".cm-tooltip-autocomplete > ul > li": {
    padding: "4px 8px",
  },
  ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
    backgroundColor: "var(--accent)",
  },
  ".cm-search": {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
  },
  ".cm-search input": {
    backgroundColor: "var(--background)",
    color: "var(--foreground)",
    border: "1px solid var(--border)",
  },
})