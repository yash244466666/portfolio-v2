"use client"

import type { ChangeEvent, FormEvent } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TurnstileWidget } from "@/components/contact-section/turnstile-widget"

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
    isVisible?: boolean
}

export function ContactFormCard({
    title,
    formData,
    labels,
    placeholders,
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
                        <a
                            href={mailtoHref}
                            className="inline-block rounded text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            {fallbackLabel}
                        </a>
                    )}
                </div>

                <p className="text-xs text-muted-foreground">{privacyNote}</p>
            </form>
        </Card>
    )
}

export default ContactFormCard
