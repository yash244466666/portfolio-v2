"use client"

import type React from "react"

import { useCallback, useRef, useState } from "react"
import { getSectionContent, getContactInfo, getFormContent, getButtonTexts } from "@/lib/content/utils"
import { useSectionVisibility } from "@/hooks/use-section-visibility"
import { ContactSectionHeader } from "@/components/contact-section/contact-section-header"
import { ContactFormCard, type ContactFormStatus } from "@/components/contact-section/contact-form-card"
import { ContactInfoList } from "@/components/contact-section/contact-info-list"
import { useComponentInstrumentation } from "@/hooks/use-instrumentation"
import { logComponentEvent } from "@/lib/instrumentation"
import {
  requestUploadUrl,
  sendContactMessage,
  uploadFileToStorage,
} from "@/lib/contact/send-contact"
import {
  MAX_ATTACHMENT_COUNT,
  readFileAsBase64,
  validateAttachmentFile,
} from "@/lib/contact/attachment"

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
  const [attachments, setAttachments] = useState<File[]>([])
  const [attachmentError, setAttachmentError] = useState("")
  const [attachmentInputKey, setAttachmentInputKey] = useState(0)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const turnstileController = useRef<{ execute: () => void } | null>(null)
  const tokenWaiterRef = useRef<((token: string) => void) | null>(null)
  const [errorCode, setErrorCode] = useState("")

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
      hasAttachment: attachments.length > 0,
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
        hasAttachment: attachments.length > 0,
      },
      throttleMs: 1500,
    })

    if (!isContactConfigured) {
      setStatus("error")
      setFeedback(formContent.status.notConfigured)
      return
    }

    let token = turnstileToken
    if (!token) {
      // Ask Cloudflare to run the challenge, then give it a moment.
      turnstileController.current?.execute()
      setFeedback(formContent.status.verifying)
      token = await waitForTurnstileToken(12000)
    }
    if (!token) {
      setStatus("error")
      setErrorCode("verification-required")
      setFeedback(formContent.status.verificationRequired)
      return
    }

    setStatus("sending")
    setFeedback("")

    // Preferred path: upload every file straight to object storage, then send
    // the keys. Falls back to one inline attachment when storage is absent.
    let attachmentPayload
    const storedFiles: { key: string; name: string; size: number; ticket: string }[] = []

    if (attachments.length > 0) {
      setUploadProgress(0)

      for (let index = 0; index < attachments.length; index += 1) {
        const file = attachments[index]
        const upload = await requestUploadUrl(
          {
            name: file.name,
            size: file.size,
            type: file.type || "application/octet-stream",
            turnstileToken: token,
          },
          contactEndpoint
        )

        if (!upload) {
          // Storage is not configured; only one small file can ride along.
          if (attachments.length === 1) {
            try {
              attachmentPayload = {
                name: file.name,
                type: file.type || "application/octet-stream",
                content: await readFileAsBase64(file),
                size: file.size,
              }
            } catch {
              setUploadProgress(null)
              setStatus("error")
              setErrorCode("upload-failed")
              setFeedback(formContent.status.error)
              return
            }
            break
          }
          setUploadProgress(null)
          setStatus("error")
          setErrorCode("upload-failed")
          setFeedback(formContent.status.fileUploadFailed)
          setTurnstileToken("")
          setTurnstileResetKey((key) => key + 1)
          return
        }

        const uploaded = await uploadFileToStorage(upload, file, (fraction) => {
          setUploadProgress((index + fraction) / attachments.length)
        })

        if (!uploaded) {
          setUploadProgress(null)
          setStatus("error")
          setErrorCode("upload-failed")
          setFeedback(formContent.status.fileUploadFailed)
          setTurnstileToken("")
          setTurnstileResetKey((key) => key + 1)
          return
        }

        storedFiles.push({
          key: upload.key,
          name: file.name,
          size: file.size,
          ticket: upload.ticket,
        })
        setUploadProgress((index + 1) / attachments.length)
      }

      setUploadProgress(null)
    }

    const result = await sendContactMessage(
      {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        turnstileToken: token,
        website: formData.website,
        attachment: attachmentPayload,
        ...(storedFiles.length ? { files: storedFiles } : {}),
      },
      contactEndpoint
    )

    if (result.ok) {
      setStatus("success")
      setFeedback(
        result.fileMode === "link"
          ? formContent.status.attachmentAsLink
          : result.confirmationSent === false
            ? formContent.status.successNoConfirmation
            : formContent.status.success
      )
      setFormData(EMPTY_FORM)
      setTurnstileToken("")
      setTurnstileResetKey((key) => key + 1)
      setAttachments([])
      setAttachmentError("")
      setAttachmentInputKey((key) => key + 1)
      setErrorCode("")
      logComponentEvent("ContactSection", {
        event: "form-success",
        detail: {
          confirmationSent: result.confirmationSent !== false,
          hasAttachment: Boolean(attachmentPayload) || storedFiles.length > 0,
          attachmentSent: result.attachmentSent === true,
          reference: result.reference ?? "",
        },
        throttleMs: 1500,
      })
      return
    }

    setStatus("error")
    setErrorCode(result.error ?? "unknown")
    setFeedback(
      result.error === "attachment-rejected"
        ? formContent.status.attachmentRejected
        : formContent.status.error
    )
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
      setErrorCode("")
    }

    logComponentEvent("ContactSection", {
      event: "form-change",
      detail: { field: event.target.name, length: event.target.value.length },
      throttleMs: 800,
    })
  }

  const handleAttachmentSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? [])
    if (picked.length === 0) return

    setAttachmentError("")

    const accepted: File[] = []
    let rejection = ""

    for (const file of picked) {
      if (attachments.length + accepted.length >= MAX_ATTACHMENT_COUNT) {
        rejection = formContent.status.tooManyFiles
        break
      }
      const validation = validateAttachmentFile(file)
      if (!validation.ok) {
        rejection =
          validation.reason === "too-large"
            ? formContent.status.fileTooLarge
            : formContent.status.fileTypeUnsupported
        continue
      }
      accepted.push(file)
    }

    if (accepted.length > 0) {
      setAttachments((previous) => [...previous, ...accepted])
      if (status === "success" || status === "error") {
        setStatus("idle")
        setFeedback("")
        setErrorCode("")
      }
    }
    if (rejection) setAttachmentError(rejection)

    // Remount the input so picking the same file again still fires change.
    setAttachmentInputKey((key) => key + 1)

    // Metadata only: never log file names or contents.
    logComponentEvent("ContactSection", {
      event: "attachment-selected",
      detail: { count: accepted.length, rejected: Boolean(rejection) },
      throttleMs: 800,
    })
  }

  const handleAttachmentRemove = useCallback((index: number) => {
    setAttachments((previous) => previous.filter((_, position) => position !== index))
    setAttachmentError("")
  }, [])

  const handleTurnstileTokenChange = useCallback((token: string) => {
    setTurnstileToken(token)
    if (token && tokenWaiterRef.current) {
      const resolve = tokenWaiterRef.current
      tokenWaiterRef.current = null
      resolve(token)
    }
  }, [])

  /**
   * Wait for a token that is still on its way. The widget is
   * `interaction-only`, so on a fresh page it may not have issued one by the
   * time the visitor hits send.
   */
  const waitForTurnstileToken = (timeoutMs: number) =>
    new Promise<string>((resolve) => {
      const timer = setTimeout(() => {
        tokenWaiterRef.current = null
        resolve("")
      }, timeoutMs)
      tokenWaiterRef.current = (token) => {
        clearTimeout(timer)
        resolve(token)
      }
    })

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
            attachmentLabels={formContent.attachment}
            attachments={attachments.map((file) => ({ name: file.name, size: file.size }))}
            attachmentError={attachmentError}
            attachmentInputKey={attachmentInputKey}
            onAttachmentSelect={handleAttachmentSelect}
            onAttachmentRemove={handleAttachmentRemove}
            uploadProgress={uploadProgress}
            uploadingLabel={
              uploadProgress === null
                ? ""
                : `${formContent.status.uploading} ${Math.round(uploadProgress * 100)}%`
            }
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
            turnstileController={turnstileController}
            privacyNote={formContent.status.privacy}
            verificationUnavailable={
              turnstileSiteKey
                ? formContent.status.verificationUnavailable
                : formContent.status.notConfigured
            }
            fallbackLabel={formContent.status.fallback}
            honeypotLabel={formContent.honeypotLabel}
            protectedByLabel={formContent.status.protectedBy}
            fileNotSentNote={formContent.status.fileNotSent}
            showFileNotSentNote={
              status === "error" &&
              attachments.length > 0 &&
              errorCode !== "attachment-rejected"
            }
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
