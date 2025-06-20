import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
// Import the new ClientProviders component
import { ClientProviders } from "@/components/client-providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Civiscore - Rate Public Services Worldwide",
  description: "A global platform for rating and reviewing public services across countries and sectors.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        {/* Wrap client-side components within ClientProviders */}
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}