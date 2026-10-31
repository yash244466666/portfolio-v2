"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { getSectionContent, getContactInfo, getFormContent, getButtonTexts } from "@/lib/content/utils"
import { useSectionVisibility } from "@/hooks/use-section-visibility"
import { ContactSectionHeader } from "@/components/contact-section/contact-section-header"
import { ContactFormCard, type ContactFormStatus } from "@/components/contact-section/contact-form-card"
import { ContactInfoList } from "@/components/contact-section/contact-info-list"
import { useComponentInstrumentation } from "@/hooks/use-instrumentation"
import { logComponentEvent } from "@/lib/instrumentation"
import { sendContactMessage } from "@/lib/contact/send-contact"

const EMPTY_FORM = {
  name: "",
  email: "",
  message: "",
  website: "",
}

export default function ContactSection() {
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [status, setStatus] = useState<ContactFormStatus>("idle")
  const [feedback, setFeedback] = useState("")
  const [turnstileToken, setTurnstileToken] = useState("")
  const [turnstileResetKey, setTurnstileResetKey] = useState(0)

  const shouldSkipAnimation = useCallback(() => {
    if (typeof window === "undefined") {
      return false
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  const { sectionRef, isVisible } = useSectionVisibility<HTMLElement>({
    threshold: 0.3,
    shouldSkip: shouldSkipAnimation,
  })

  // Get content from centralized content module
  const sectionContent = getSectionContent("contact") as {
    heading: string
    description: string
    formTitle: string
    infoTitle: string
  }
  const contactInfo = getContactInfo()
  const formContent = getFormContent()
  const buttonTexts = getButtonTexts()

  const contactEndpoint = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""
  const isContactConfigured = Boolean(contactEndpoint?.trim() && turnstileSiteKey.trim())
  const contactEmail =
    contactInfo.find((info) => info.type === "email")?.value ?? "info@yashcodes.com"

  useComponentInstrumentation("ContactSection", {
    // Never include form values here: only lengths and booleans.
    stateSnapshot: () => ({
      isVisible,
      status,
      nameLength: formData.name.length,
      messageLength: formData.message.length,
      hasEmail: Boolean(formData.email),
    }),
    trackValues: () => ({
      isVisible,
      status,
      messageLength: formData.message.length,
    }),
    throttleMs: 1500,
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (status === "sending") return

    // Metadata only: never log the message body or the visitor's email.
    logComponentEvent("ContactSection", {
      event: "form-submit",
      detail: {
        nameLength: formData.name.length,
        messageLength: formData.message.length,
        hasEmail: Boolean(formData.email),
      },
      throttleMs: 1500,
    })

    if (!isContactConfigured) {
      setStatus("error")
      setFeedback(formContent.status.notConfigured)
      return
    }

    if (!turnstileToken) {
      setStatus("error")
      setFeedback(formContent.status.verificationRequired)
      return
    }

    setStatus("sending")
    setFeedback("")

    const result = await sendContactMessage(
      {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        turnstileToken,
        website: formData.website,
      },
      contactEndpoint
    )

    if (result.ok) {
      setStatus("success")
      setFeedback(
        result.confirmationSent === false
          ? formContent.status.successNoConfirmation
          : formContent.status.success
      )
      setFormData(EMPTY_FORM)
      setTurnstileToken("")
      setTurnstileResetKey((key) => key + 1)
      logComponentEvent("ContactSection", {
        event: "form-success",
        detail: { confirmationSent: result.confirmationSent !== false },
        throttleMs: 1500,
      })
      return
    }

    setStatus("error")
    setFeedback(formContent.status.error)
    setTurnstileToken("")
    setTurnstileResetKey((key) => key + 1)
    logComponentEvent("ContactSection", {
      event: "form-error",
      detail: { reason: result.error ?? "unknown" },
      throttleMs: 1500,
    })
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }))

    if (status === "success" || status === "error") {
      setStatus("idle")
      setFeedback("")
    }

    logComponentEvent("ContactSection", {
      event: "form-change",
      detail: { field: event.target.name, length: event.target.value.length },
      throttleMs: 800,
    })
  }

  const handleTurnstileTokenChange = useCallback((token: string) => {
    setTurnstileToken(token)
  }, [])

  const contactItems = contactInfo.map((info) => ({
    type: info.type,
    label: info.label,
    value: info.value,
    link: info.link ?? undefined,
  }))

  return (
    <section id="contact" ref={sectionRef} className="py-16 sm:py-20 px-4 sm:px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <ContactSectionHeader
          heading={sectionContent.heading}
          description={sectionContent.description}
          isVisible={isVisible}
        />

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
          <ContactFormCard
            title={sectionContent.formTitle}
            formData={formData}
            labels={formContent.labels}
            placeholders={formContent.placeholders}
            submitLabel={buttonTexts.sendMessage}
            sendingLabel={formContent.status.sending}
            status={status}
            feedback={feedback}
            onChange={handleChange}
            onSubmit={handleSubmit}
            contactEmail={contactEmail}
            siteKey={turnstileSiteKey}
            onTurnstileTokenChange={handleTurnstileTokenChange}
            turnstileResetKey={turnstileResetKey}
            privacyNote={formContent.status.privacy}
            verificationUnavailable={
              turnstileSiteKey
                ? formContent.status.verificationUnavailable
                : formContent.status.notConfigured
            }
            fallbackLabel={formContent.status.fallback}
            honeypotLabel={formContent.honeypotLabel}
            protectedByLabel={formContent.status.protectedBy}
            isVisible={isVisible}
          />

          <ContactInfoList
            title={sectionContent.infoTitle}
            description={sectionContent.description}
            items={contactItems}
            isVisible={isVisible}
          />
        </div>
      </div>
    </section>
  )
}
