type DemoStep = { action: string; output: string }
type Scenario = {
  name: string
  input: string
  steps: DemoStep[]
  setting?: { label: string; before: string; after: string }
}
type ProjectDemo = { title: string; summary: string; scenarios: Scenario[] }

const demos: Record<string, ProjectDemo> = {
  "vision-desktop-agent": {
    title: "Desktop task walkthrough",
    summary: "Follow a simulated assistant as it interprets a fictional settings screen, proposes an action, and checks the result inside the demo.",
    scenarios: [
      {
        name: "Turn on dark appearance",
        input: "Open appearance settings and switch to dark.",
        setting: { label: "Appearance", before: "Light", after: "Dark" },
        steps: [
          { action: "Read the screen", output: "Demo settings shows Appearance and Notifications. Appearance is the relevant control." },
          { action: "Review the proposed action", output: "Open Appearance and select Dark. The change is limited to this fictional app." },
          { action: "Apply inside the demo", output: "Demo app state changed. Appearance is now Dark." },
        ],
      },
      {
        name: "Pause notifications",
        input: "Pause alerts in the demo app.",
        setting: { label: "Notifications", before: "On", after: "Paused" },
        steps: [
          { action: "Read the screen", output: "Demo settings shows a Notifications panel with alerts enabled." },
          { action: "Review the proposed action", output: "Open Notifications and switch alerts off." },
          { action: "Apply inside the demo", output: "Demo app state changed. Notifications are now paused." },
        ],
      },
    ],
  },
  "provider-scheduling-marketplace": {
    title: "Voice booking walkthrough",
    summary: "Follow a scripted call transcript from a booking request to a preview of what the provider would receive.",
    scenarios: [
      {
        name: "Book an available slot",
        input: "Caller: Can I book a bike tune-up on Tuesday at two?",
        steps: [
          { action: "Read the request", output: "Service requested: bike tune-up. Preferred time: Tuesday at 2 pm." },
          { action: "Check the demo calendar", output: "Tuesday at 2 pm is open. The fictional caller accepts the proposed slot." },
          { action: "Preview the provider message", output: "Draft booking: bike tune-up, Tuesday at 2 pm, accepted by the fictional caller. No booking or notification was sent." },
        ],
      },
      {
        name: "Offer a different time",
        input: "Caller: Is Tuesday at two open for a brake check?",
        steps: [
          { action: "Read the request", output: "Service requested: brake check. Preferred time: Tuesday at 2 pm." },
          { action: "Check the demo calendar", output: "Tuesday at 2 pm is taken. The assistant offers 3:30 pm and the fictional caller accepts." },
          { action: "Preview the provider message", output: "Draft booking: brake check, Tuesday at 3:30 pm, accepted by the fictional caller. No booking or notification was sent." },
        ],
      },
    ],
  },
  "ai-social-media-automation": {
    title: "Social post review walkthrough",
    summary: "Start with a sample brief, preview a scripted draft, and try a human approval decision before any publishing step.",
    scenarios: [
      {
        name: "Announce a community event",
        input: "Brief: Announce a Saturday repair café at 10 am. Invite people to bring one item.",
        steps: [
          { action: "Read the brief", output: "Keep Saturday, 10 am, and the one-item invitation. Use a friendly tone." },
          { action: "Preview the draft", output: "Got something to fix? Bring one item to our repair café this Saturday at 10 am. Let’s see what we can repair together." },
          { action: "Approve in the demo", output: "Demo status changed to approved. Nothing was posted to a social platform." },
        ],
      },
      {
        name: "Hold a post for edits",
        input: "Brief: Announce a bike-safety workshop. We still need to confirm the venue.",
        steps: [
          { action: "Read the brief", output: "Keep the workshop topic. Flag the venue as missing and avoid inventing it." },
          { action: "Preview the draft", output: "A bike-safety workshop is in the works. We’ll share the time and place once they’re confirmed." },
          { action: "Return for edits", output: "Demo status changed to needs edits. Confirm the venue before approving the announcement." },
        ],
      },
    ],
  },
}

export function getProjectDemo(slug: string): ProjectDemo | undefined {
  return demos[slug]
}
