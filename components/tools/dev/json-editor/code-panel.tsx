"use client"

import { useEffect, useRef } from "react"
import { EditorView, keymap, lineNumbers, highlightActiveLine } from "@codemirror/view"
import { EditorState } from "@codemirror/state"
import { json, jsonParseLinter } from "@codemirror/lang-json"
import { linter } from "@codemirror/lint"
import { defaultKeymap, indentWithTab, history, historyKeymap } from "@codemirror/commands"
import { syntaxHighlighting, defaultHighlightStyle, foldGutter, bracketMatching } from "@codemirror/language"
import { jsonEditorTheme } from "./codemirror-theme"

interface CodePanelProps {
  jsonString: string
  onChange: (value: string) => void
}

export function CodePanel({ jsonString, onChange }: CodePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const isExternalUpdate = useRef(false)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!containerRef.current) return

    const state = EditorState.create({
      doc: jsonString,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        bracketMatching(),
        foldGutter(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        json(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        linter(jsonParseLinter(), { delay: 300 }),
        jsonEditorTheme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !isExternalUpdate.current) {
            onChangeRef.current(update.state.doc.toString())
          }
        }),
        EditorView.theme({
          "&": { height: "100%" },
          ".cm-scroller": { overflow: "auto" },
        }),
        EditorState.tabSize.of(2),
      ],
    })

    const view = new EditorView({ state, parent: containerRef.current })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync external changes (from tree) into CodeMirror
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const currentDoc = view.state.doc.toString()
    if (currentDoc !== jsonString) {
      isExternalUpdate.current = true
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: jsonString },
        selection: { anchor: 0 },
      })
      isExternalUpdate.current = false
    }
  }, [jsonString])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-[350px] lg:min-h-0 rounded-lg border border-border bg-background/50 backdrop-blur-sm overflow-hidden">
        <div ref={containerRef} className="h-full" />
      </div>
    </div>
  )
}