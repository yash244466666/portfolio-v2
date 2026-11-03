import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import "./globals.css"
import { siteMetadata } from "@/lib/content"

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: siteMetadata.title,
  description: siteMetadata.description,
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} antialiased dark`}>
      <body className="font-sans bg-gray-950 text-white overflow-x-hidden" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}
