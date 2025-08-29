"use client"

import React from "react"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      // Refetch session every 5 minutes
      refetchInterval={5 * 60}
      // Re-fetch session if window is focused
      refetchOnWindowFocus={true}
    >
      {children}
      {/* Global toast notifications (success/error/loading) */}
      <Toaster position="top-right" richColors closeButton expand={false} />
    </SessionProvider>
  )
}
