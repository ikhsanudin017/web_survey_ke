"use client"

import { ReactNode } from "react"

export default function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <header className="bg-[var(--color-secondary)]/80 dark:bg-[#151310]/80 backdrop-blur border-b border-[hsl(var(--color-border))]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-primary-dark)] dark:text-[var(--color-primary-light)]">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
