"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return <div className="w-8 h-8" />;

    const isDark = resolvedTheme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`
                relative w-8 h-8 flex items-center justify-center rounded-lg
                transition-all duration-200
                ${isDark
                    ? "text-white/40 hover:text-white/80 hover:bg-white/[0.06]"
                    : "text-gray-500 hover:text-gray-800 hover:bg-black/[0.05]"
                }
            `}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDark ? (
                <Sun className="w-[15px] h-[15px]" />
            ) : (
                <Moon className="w-[15px] h-[15px]" />
            )}
        </button>
    );
}
