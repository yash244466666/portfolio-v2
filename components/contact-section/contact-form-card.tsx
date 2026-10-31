"use client"

import type { ChangeEvent, FormEvent } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface ContactFormCardProps {
    title: string
    formData: {
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
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    onSubmit: (event: FormEvent<HTMLFormElement>) => void
    isVisible?: boolean
}

export function ContactFormCard({
    title,
    formData,
    placeholders,
    submitLabel,
    onChange,
    onSubmit,
    isVisible = false,
}: ContactFormCardProps) {
    return (
        <Card className={`p-6 sm:p-8 transition-all duration-1000 ${isVisible ? "animate-slide-in-left" : "opacity-0"}`}>
            <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6">{title}</h3>

            <form onSubmit={onSubmit} className="space-y-6">
                <Input
                    type="text"
                    name="name"
                    placeholder={placeholders.name}
                    value={formData.name}
                    onChange={onChange}
                    required
                    className="w-full"
                />

                <Input
                    type="email"
                    name="email"
                    placeholder={placeholders.email}
                    value={formData.email}
                    onChange={onChange}
                    required
                    className="w-full"
                />

                <Textarea
                    name="message"
                    placeholder={placeholders.message}
                    value={formData.message}
                    onChange={onChange}
                    required
                    rows={5}
                    className="w-full resize-none"
                />

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3">
                    {submitLabel}
                </Button>
            </form>
        </Card>
    )
}

export default ContactFormCard
