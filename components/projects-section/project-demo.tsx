"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getProjectDemo } from "@/lib/content/project-demos"

export function ProjectDemo({ slug }: { slug: string }) {
  const [selected, setSelected] = useState(0)
  const [progress, setProgress] = useState(0)
  const demo = getProjectDemo(slug)
  if (!demo) return null

  const scenario = demo.scenarios[selected]
  const nextStep = scenario.steps[progress]

  return (
    <section id="demo" aria-labelledby="project-demo-heading" className="scroll-mt-28 space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-7">
      <header className="space-y-2">
        <h2 id="project-demo-heading" className="text-2xl font-semibold">{demo.title}</h2>
        <p className="leading-relaxed text-muted-foreground">{demo.summary}</p>
        <p className="text-sm font-medium text-primary">
          Independent simulation using fictional data and scripted outputs.
        </p>
      </header>

      <div className="space-y-2">
        <label htmlFor="project-demo-scenario" className="block text-sm font-medium">Choose a scenario</label>
        <select
          id="project-demo-scenario"
          value={selected}
          onChange={(event) => {
            setSelected(Number(event.target.value))
            setProgress(0)
          }}
          className="min-h-11 max-w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {demo.scenarios.map((item, index) => <option key={item.name} value={index}>{item.name}</option>)}
        </select>
      </div>

      <p className="rounded-lg border border-border bg-background px-4 py-3 leading-relaxed">{scenario.input}</p>

      <div aria-live="polite" aria-relevant="additions text">
        {scenario.setting && (
          <dl className="mb-3 rounded-lg border border-border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="font-medium">{scenario.setting.label} in the demo app</dt>
              <dd className="rounded bg-muted px-2 py-1 text-sm">{nextStep ? scenario.setting.before : scenario.setting.after}</dd>
            </div>
          </dl>
        )}
        <ol className="space-y-2">
          {scenario.steps.slice(0, progress).map((step) => (
            <li key={step.action} className="rounded-lg bg-muted px-4 py-3">
              <span className="block text-sm font-semibold">{step.action}</span>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.output}</p>
            </li>
          ))}
        </ol>
        {!nextStep && <p className="mt-3 text-sm font-medium text-primary">Walkthrough complete</p>}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" className="min-h-11 whitespace-normal" disabled={!nextStep} onClick={() => setProgress(progress + 1)}>
          {nextStep?.action ?? "All steps complete"}
        </Button>
        <Button type="button" variant="outline" className="min-h-11" onClick={() => setProgress(0)}>
          Reset demo
        </Button>
      </div>
      <noscript><p className="text-sm text-muted-foreground">Enable JavaScript to interact with this walkthrough.</p></noscript>
    </section>
  )
}
