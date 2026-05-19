"use client";

import { createContext, useContext, useEffect } from "react";

type Theme = "dark" | "light";

const ThemeContext = createContext<{
    theme: Theme;
    toggle: () => void;
}>({ theme: "dark", toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Always enforce dark mode — light mode has been removed.
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("cv-theme", "dark");
    }, []);

    return (
        <ThemeContext.Provider value={{ theme: "dark", toggle: () => {} }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
