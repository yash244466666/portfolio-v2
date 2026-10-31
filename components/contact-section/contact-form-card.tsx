"use client"

import type { ChangeEvent, FormEvent } from "react"
import { Paperclip, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TurnstileWidget } from "@/components/contact-section/turnstile-widget"
import { ATTACHMENT_ACCEPT, formatFileSize } from "@/lib/contact/attachment"

export type ContactFormStatus = "idle" | "sending" | "success" | "error"

const TURNSTILE_ATTRIBUTION_URL = "https://www.cloudflare.com/products/turnstile/"

interface ContactFormCardProps {
    title: string
    formData: {
        name: string
        email: string
        message: string
        website: string
    }
    labels: {
        name: string
        email: string
        message: string
    }
    placeholders: {
        name: string
        email: string
        message: string
    }
    attachmentLabels: {
        label: string
        optional: string
        choose: string
        hint: string
        remove: string
        privacy: string
    }
    /** Selected file, or `null` when the visitor attached nothing. */
    attachment: { name: string; size: number } | null
    /** Validation message for a rejected pick, empty when there is none. */
    attachmentError: string
    /** Bumped by the parent to clear the native file input after a send. */
    attachmentInputKey: number
    onAttachmentSelect: (event: ChangeEvent<HTMLInputElement>) => void
    onAttachmentClear: () => void
    submitLabel: string
    sendingLabel: string
    status: ContactFormStatus
    feedback: string
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    onSubmit: (event: FormEvent<HTMLFormElement>) => void
    contactEmail: string
    siteKey: string
    onTurnstileTokenChange: (token: string) => void
    turnstileResetKey: number
    privacyNote: string
    verificationUnavailable: string
    fallbackLabel: string
    honeypotLabel: string
    protectedByLabel: string
    /** Shown next to the fallback link when a file was selected but failed. */
    fileNotSentNote: string
    /** False when the feedback already explains what happened to the file. */
    showFileNotSentNote: boolean
    isVisible?: boolean
}

export function ContactFormCard({
    title,
    formData,
    labels,
    placeholders,
    attachmentLabels,
    attachment,
    attachmentError,
    attachmentInputKey,
    onAttachmentSelect,
    onAttachmentClear,
    submitLabel,
    sendingLabel,
    status,
    feedback,
    onChange,
    onSubmit,
    contactEmail,
    siteKey,
    onTurnstileTokenChange,
    turnstileResetKey,
    privacyNote,
    verificationUnavailable,
    fallbackLabel,
    honeypotLabel,
    protectedByLabel,
    fileNotSentNote,
    showFileNotSentNote,
    isVisible = false,
}: ContactFormCardProps) {
    const isSending = status === "sending"
    const mailtoBody = `${formData.message}\n\nSender: ${formData.name}\nEmail: ${formData.email}`
    const mailtoHref = `mailto:${contactEmail}?subject=${encodeURIComponent(
        `New message from ${formData.name || "the portfolio contact form"}`
    )}&body=${encodeURIComponent(mailtoBody)}`

    return (
        <Card className={`p-6 sm:p-8 transition-all duration-1000 ${isVisible ? "animate-slide-in-left" : "opacity-0"}`}>
            <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6">{title}</h3>

            <form onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label htmlFor="contact-name" className="text-sm font-medium text-foreground">
                        {labels.name}
                    </label>
                    <Input
                        id="contact-name"
                        type="text"
                        name="name"
                        autoComplete="name"
                        placeholder={placeholders.name}
                        value={formData.name}
                        onChange={onChange}
                        required
                        className="w-full"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="contact-email" className="text-sm font-medium text-foreground">
                        {labels.email}
                    </label>
                    <Input
                        id="contact-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder={placeholders.email}
                        value={formData.email}
                        onChange={onChange}
                        required
                        className="w-full"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="contact-message" className="text-sm font-medium text-foreground">
                        {labels.message}
                    </label>
                    <Textarea
                        id="contact-message"
                        name="message"
                        placeholder={placeholders.message}
                        value={formData.message}
                        onChange={onChange}
                        required
                        rows={5}
                        className="w-full resize-none"
                    />
                </div>

                {/* Optional attachment. The native input is hidden; the label
                    acts as the button so the control keeps its 44px target. */}
                <div className="space-y-2">
                    <div className="flex items-baseline justify-between gap-3">
                        <span className="text-sm font-medium text-foreground">
                            {attachmentLabels.label}
                            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                {attachmentLabels.optional}
                            </span>
                        </span>
                        {attachment && (
                            <button
                                type="button"
                                onClick={onAttachmentClear}
                                className="inline-flex min-h-[44px] items-center gap-1 rounded-md px-1 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                <X className="h-3.5 w-3.5" aria-hidden="true" />
                                {attachmentLabels.remove}
                            </button>
                        )}
                    </div>

                    <input
                        key={attachmentInputKey}
                        id="contact-attachment"
                        name="attachment"
                        type="file"
                        accept={ATTACHMENT_ACCEPT}
                        onChange={onAttachmentSelect}
                        aria-describedby="contact-attachment-hint"
                        className="sr-only"
                    />

                    {attachment ? (
                        <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-background/40 px-3 py-2.5 text-sm text-foreground sm:px-4">
                            <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                            <span className="min-w-0 flex-1 truncate">{attachment.name}</span>
                            <span className="shrink-0 text-xs text-muted-foreground">
                                {formatFileSize(attachment.size)}
                            </span>
                        </div>
                    ) : (
                        <label
                            htmlFor="contact-attachment"
                            className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-background/30 px-3 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground focus-within:ring-2 focus-within:ring-primary"
                        >
                            <Paperclip className="h-4 w-4" aria-hidden="true" />
                            {attachmentLabels.choose}
                        </label>
                    )}

                    <p id="contact-attachment-hint" className="text-xs text-muted-foreground">
                        {attachmentLabels.hint}
                    </p>

                    {attachmentError && (
                        <p role="status" className="text-xs text-amber-400">
                            {attachmentError}
                        </p>
                    )}

                    {attachment && (
                        <p className="text-xs text-muted-foreground">{attachmentLabels.privacy}</p>
                    )}
                </div>

                {/* Honeypot: bots fill this; real visitors never see or tab to it. */}
                <div className="sr-only" aria-hidden="true">
                    <label htmlFor="contact-website">{honeypotLabel}</label>
                    <input
                        id="contact-website"
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={formData.website}
                        onChange={onChange}
                    />
                </div>

                {siteKey ? (
                    <div className="space-y-1.5">
                        <TurnstileWidget
                            siteKey={siteKey}
                            onTokenChange={onTurnstileTokenChange}
                            resetKey={turnstileResetKey}
                            errorMessage={verificationUnavailable}
                        />
                        {/* The widget stays hidden unless a challenge is needed,
                            so Cloudflare's attribution is carried here. */}
                        <a
                            href={TURNSTILE_ATTRIBUTION_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block rounded text-[11px] leading-relaxed text-muted-foreground/70 underline-offset-2 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            {protectedByLabel}
                        </a>
                    </div>
                ) : (
                    <p className="text-xs text-amber-400">{verificationUnavailable}</p>
                )}

                <Button
                    type="submit"
                    disabled={isSending}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSending ? sendingLabel : submitLabel}
                </Button>

                <div aria-live="polite" role="status" className="min-h-5 space-y-1 text-sm">
                    {feedback && (
                        <p className={status === "success" ? "text-emerald-400" : "text-amber-400"}>
                            {feedback}
                        </p>
                    )}
                    {status === "error" && (
                        <>
                            {/* A mailto link cannot carry the file, so say so
                                rather than implying the attachment travels. */}
                            {showFileNotSentNote && (
                                <p className="text-amber-400">{fileNotSentNote}</p>
                            )}
                            <a
                                href={mailtoHref}
                                className="inline-block rounded text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                {fallbackLabel}
                            </a>
                        </>
                    )}
                </div>

                <p className="text-xs text-muted-foreground">{privacyNote}</p>
            </form>
        </Card>
    )
}

export default ContactFormCard
