"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { getSectionContent, getContactInfo, getFormContent, getButtonTexts } from "@/lib/content/utils"
import { useSectionVisibility } from "@/hooks/use-section-visibility"
import { ContactSectionHeader } from "@/components/contact-section/contact-section-header"
import { ContactFormCard } from "@/components/contact-section/contact-form-card"
import { ContactInfoList } from "@/components/contact-section/contact-info-list"

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

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
            placeholders={formContent.placeholders}
            submitLabel={buttonTexts.sendMessage}
            onChange={handleChange}
            onSubmit={handleSubmit}
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
