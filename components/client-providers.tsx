// components/client-providers.tsx
"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import AIAssistant from "@/components/ai-assistant";
import { Toaster } from "@/components/ui/toaster";
import React from "react"; // Explicitly import React

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
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
  );
}