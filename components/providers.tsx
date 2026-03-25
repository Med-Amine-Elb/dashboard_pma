"use client"

import { UserProvider } from "@/contexts/UserContext"
import { NotificationsProvider } from "@/contexts/NotificationsContext"
import { SidebarProvider } from "@/contexts/SidebarContext"
import { ReactNode } from "react"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <UserProvider>
      <SidebarProvider>
        <NotificationsProvider>
          {children}
        </NotificationsProvider>
      </SidebarProvider>
    </UserProvider>
  )
}