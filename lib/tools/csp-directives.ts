export interface CSPDirective {
  name: string
  description: string
  defaultValue: string
  options: string[]
}

export const cspDirectives: CSPDirective[] = [
  {
    name: "default-src",
    description: "Fallback for other resource types when their own directives are not specified",
    defaultValue: "'self'",
    options: ["'self'", "'none'", "'*'", "'self' data:", "'self' https:"],
  },
  {
    name: "script-src",
    description: "Controls which scripts can be executed on the page",
    defaultValue: "'self'",
    options: ["'self'", "'none'", "'unsafe-inline'", "'unsafe-eval'", "'strict-dynamic'", "'nonce-<base64>'", "'self' 'unsafe-inline'"],
  },
  {
    name: "style-src",
    description: "Controls which stylesheets can be applied to the page",
    defaultValue: "'self' 'unsafe-inline'",
    options: ["'self'", "'none'", "'unsafe-inline'", "'self' 'unsafe-inline'"],
  },
  {
    name: "img-src",
    description: "Controls which images and favicons can be loaded",
    defaultValue: "'self' data: https:",
    options: ["'self'", "'none'", "'*'", "'self' data:", "'self' data: https:", "https:"],
  },
  {
    name: "connect-src",
    description: "Controls which URLs can be loaded via script (XHR, Fetch, WebSocket, EventSource)",
    defaultValue: "'self'",
    options: ["'self'", "'none'", "'*'", "'self' https:", "'self' wss:"],
  },
  {
    name: "font-src",
    description: "Controls which fonts can be loaded via @font-face",
    defaultValue: "'self'",
    options: ["'self'", "'none'", "'*'", "'self' https://fonts.gstatic.com", "'self' data:"],
  },
  {
    name: "object-src",
    description: "Controls which plugins (object, embed, applet) can be embedded",
    defaultValue: "'none'",
    options: ["'self'", "'none'", "'*'", "data:"],
  },
  {
    name: "media-src",
    description: "Controls which audio and video resources can be loaded",
    defaultValue: "'self'",
    options: ["'self'", "'none'", "'*'", "'self' https:", "'self' blob:", "media-stream:"],
  },
  {
    name: "frame-src",
    description: "Controls which frames and iframes can be embedded",
    defaultValue: "'self'",
    options: ["'self'", "'none'", "'*'", "'self' https:", "https:"],
  },
  {
    name: "frame-ancestors",
    description: "Controls which pages can embed this page in frames (replaces X-Frame-Options)",
    defaultValue: "'self'",
    options: ["'self'", "'none'", "'*'", "https:", "http:"],
  },
  {
    name: "base-uri",
    description: "Controls which URLs can be used in the <base> element",
    defaultValue: "'self'",
    options: ["'self'", "'none'", "'*'", "'self' https:"],
  },
  {
    name: "form-action",
    description: "Controls which URLs can be used as form submission targets",
    defaultValue: "'self'",
    options: ["'self'", "'none'", "'*'", "'self' https:"],
  },
]