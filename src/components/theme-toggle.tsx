"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="h-9 w-9"
            title={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
        >
            {isDark ? (
                <Sun className="h-4 w-4 transition-all" />
            ) : (
                <Moon className="h-4 w-4 transition-all" />
            )}
            <span className="sr-only">Alternar tema</span>
        </Button>
    )
}
