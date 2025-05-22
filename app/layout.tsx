import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import AIAssistant from "@/components/ai-assistant"
import { Toaster } from "@/components/ui/toaster"

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
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
          {/* Fixed Theme Toggle Button with improved styling */}
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle className="bg-black/20 backdrop-blur-md dark:bg-white/10 hover:bg-black/30 dark:hover:bg-white/20" />
          </div>

          {/* AI Assistant */}
          <AIAssistant />

          {children}

          {/* Toast notifications */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
