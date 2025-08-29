"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import ThemeToggle from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

export default function Topbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  // Hide topbar on the landing page
  if (pathname === "/") return null

  const isApproval = pathname?.startsWith("/employee/approval")
  const isDashboard = pathname?.startsWith("/employee/dashboard")

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-[var(--color-secondary)]/70 dark:bg-[#151310]/70 border-b border-[hsl(var(--color-border))]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Image src="/logo ksu ke.png" alt="KSU KE" width={32} height={32} className="rounded" />
          </Link>
          <div className="leading-tight">
            <div className="font-semibold text-sm sm:text-base text-[var(--color-primary-dark)]">KSU Kirap Entrepreneurship</div>
            <div className="text-xs text-muted-foreground hidden sm:block">Sistem Survey Pembiayaan</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {status === "authenticated" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  {(session?.user as any)?.name?.[0] || (session?.user as any)?.id?.[0] || 'U'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {(session?.user as any)?.name || (session?.user as any)?.id}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!isDashboard && (
                  <DropdownMenuItem onClick={() => router.push("/employee/dashboard")}>Dashboard</DropdownMenuItem>
                )}
                {((session?.user as any)?.id === 'toha') && (
                  <DropdownMenuItem onClick={() => router.push("/employee/approval")}>Persetujuan</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ redirect: true, callbackUrl: "/employee/login" })}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => router.push("/employee/login")}>Login Pegawai</Button>
          )}
        </div>
      </div>
    </header>
  )
}
