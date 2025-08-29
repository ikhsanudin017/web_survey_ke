"use client"

import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("theme")) as
      | "light"
      | "dark"
      | null
    const prefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = saved || (prefersDark ? "dark" : "light")
    setTheme(initial)
    if (initial === "dark") document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
  }, [])

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    localStorage.setItem("theme", next)
    if (next === "dark") document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
  }

  return (
    <Button variant="outline" size="sm" onClick={toggle} aria-label="Toggle theme">
      {theme === "dark" ? (
        <div className="flex items-center gap-2">
          <Sun className="h-4 w-4" />
          <span>Light</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Moon className="h-4 w-4" />
          <span>Dark</span>
        </div>
      )}
    </Button>
  )
}

