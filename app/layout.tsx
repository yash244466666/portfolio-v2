import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import "./globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://yashcodes.com"),
  title: {
    default: "MD. Mohi Minul Islam Yash – Full-Stack Software Engineer",
    template: "%s | YashCodes",
  },
  description:
    "MD. Mohi Minul Islam Yash is a full-stack software engineer. Explore his work in web apps, marketplace booking, integrations, and AI automation, and get in touch.",
  applicationName: "YashCodes",
  keywords: [
    "MD. Mohi Minul Islam Yash",
    "Mohi Minul Islam Yash",
    "Yash Sikdar",
    "YashCodes",
    "Full-Stack Software Engineer",
    "Web Application Developer",
    "AI Automation",
    "Custom AI Agents",
  ],
  authors: [{ name: "MD. Mohi Minul Islam Yash", url: "https://yashcodes.com/" }],
  creator: "MD. Mohi Minul Islam Yash",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
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
    <html lang="en" className={`${dmSans.variable} antialiased dark`} suppressHydrationWarning>
      <body className="font-sans bg-gray-950 text-white overflow-x-hidden" suppressHydrationWarning={true}>
        {/* Runs before the body paints. Content is visible without JS; the
            class lets entrance animations start hidden only when scripting is
            available. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
        {children}
      </body>
    </html>
  )
}
