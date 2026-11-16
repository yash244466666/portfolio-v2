"use client"

import { Facebook, Github, Linkedin, Mail, Twitter, type LucideIcon } from "lucide-react"
import { getPersonalInfo, getSocialLinks, getFooterContent } from "@/lib/content/utils"
import { useComponentInstrumentation } from "@/hooks/use-instrumentation"
import { logComponentEvent } from "@/lib/instrumentation"

const iconMap: Record<string, LucideIcon> = {
  Github,
  Linkedin,
  Twitter,
  Facebook,
  Mail,
}

export default function Footer() {
  const personalInfo = getPersonalInfo()
  const socialLinks = getSocialLinks()
  const footerContent = getFooterContent()

  useComponentInstrumentation("Footer", {
    metricsSnapshot: () => ({
      socialLinkCount: socialLinks.length,
    }),
    throttleMs: 3000,
  })

  logComponentEvent("Footer", {
    event: "render",
    detail: { hasSocialLinks: socialLinks.length > 0 },
    throttleMs: 3000,
  })

  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-xl font-bold text-foreground mb-1">{personalInfo.fullName}</p>
            <p className="text-muted-foreground">{personalInfo.title}</p>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {socialLinks.map((link) => {
              const IconComponent = iconMap[link.icon] ?? Github
              const isMail = link.url.startsWith("mailto:")

              return (
                <a
                  key={link.name}
                  href={link.url}
                  aria-label={link.label}
                  {...(isMail
                    ? {}
                    : { target: "_blank", rel: "noopener noreferrer" })}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <IconComponent size={20} aria-hidden="true" />
                </a>
              )
            })}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm">
            {footerContent.copyrightText}
          </p>
        </div>
      </div>
    </footer>
  )
}
