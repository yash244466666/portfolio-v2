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
    /** Files picked for this message; the order is the order shown. */
    attachments: { name: string; size: number }[]
    /** Validation message for a rejected pick, empty when there is none. */
    attachmentError: string
    /** Bumped by the parent to clear the native file input after a send. */
    attachmentInputKey: number
    onAttachmentSelect: (event: ChangeEvent<HTMLInputElement>) => void
    onAttachmentRemove: (index: number) => void
    /** 0–1 while files upload, `null` when nothing is in flight. */
    uploadProgress: number | null
    /** Label shown while files upload, e.g. "Uploading… 42%". */
    uploadingLabel: string
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
    attachments,
    attachmentError,
    attachmentInputKey,
    onAttachmentSelect,
    onAttachmentRemove,
    uploadProgress,
    uploadingLabel,
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

                {/* Optional attachments. The native input is hidden; the label
                    acts as the button so the control keeps its 44px target. */}
                <div className="space-y-2">
                    <span className="text-sm font-medium text-foreground">
                        {attachmentLabels.label}
                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                            {attachmentLabels.optional}
                        </span>
                    </span>

                    <input
                        key={attachmentInputKey}
                        id="contact-attachment"
                        name="attachment"
                        type="file"
                        multiple
                        accept={ATTACHMENT_ACCEPT}
                        onChange={onAttachmentSelect}
                        aria-describedby="contact-attachment-hint"
                        className="sr-only"
                    />

                    {attachments.length === 0 ? (
                        <label
                            htmlFor="contact-attachment"
                            className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-background/30 px-3 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground focus-within:ring-2 focus-within:ring-primary"
                        >
                            <Paperclip className="h-4 w-4" aria-hidden="true" />
                            {attachmentLabels.choose}
                        </label>
                    ) : (
                        <ul className="space-y-2">
                            {attachments.map((file, index) => (
                                <li
                                    key={`${file.name}-${index}`}
                                    className="flex items-center gap-2 rounded-xl border border-border/50 bg-background/40 px-3 py-2.5 text-sm text-foreground sm:px-4"
                                >
                                    <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                                    <span className="min-w-0 flex-1 truncate">{file.name}</span>
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                        {formatFileSize(file.size)}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onAttachmentRemove(index)}
                                        aria-label={`${attachmentLabels.remove} ${file.name}`}
                                        className="inline-flex h-11 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    >
                                        <X className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </li>
                            ))}
                            <li>
                                <label
                                    htmlFor="contact-attachment"
                                    className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md px-1 text-sm text-primary underline-offset-4 hover:underline focus-within:outline-none focus-within:ring-2 focus-within:ring-primary"
                                >
                                    <Paperclip className="h-4 w-4" aria-hidden="true" />
                                    {attachmentLabels.choose}
                                </label>
                            </li>
                        </ul>
                    )}

                    {uploadProgress !== null && (
                        <div className="space-y-1.5">
                            <div
                                role="progressbar"
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={Math.round(uploadProgress * 100)}
                                aria-label={uploadingLabel}
                                className="h-2 w-full overflow-hidden rounded-full bg-muted"
                            >
                                <div
                                    className="h-full rounded-full bg-primary transition-[width] duration-200"
                                    style={{ width: `${Math.round(uploadProgress * 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground" aria-live="polite">
                                {uploadingLabel}
                            </p>
                        </div>
                    )}

                    <p id="contact-attachment-hint" className="text-xs text-muted-foreground">
                        {attachmentLabels.hint}
                    </p>

                    {attachmentError && (
                        <p role="status" className="text-xs text-amber-400">
                            {attachmentError}
                        </p>
                    )}

                    {attachments.length > 0 && (
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
