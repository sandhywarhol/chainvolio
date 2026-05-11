"use client";

import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
    const { theme, toggle } = useTheme();

    return (
        <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white transition-all"
        >
            {theme === "dark"
                ? <Sun className="w-3.5 h-3.5" />
                : <Moon className="w-3.5 h-3.5" />
            }
        </button>
    );
}
