"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function AppBackground() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    // Before mount, render dark base to avoid flash
    if (!mounted) {
        return <div className="fixed inset-0 z-0 bg-black" />;
    }

    if (resolvedTheme === "light") {
        return (
            <>
                <div className="fixed inset-0 z-0 bg-white" />
                {/* Teal ambient glow — very subtle */}
                <div className="fixed inset-0 z-10 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-[radial-gradient(ellipse_at_top,rgba(13,148,136,0.05)_0%,transparent_65%)]" />
                </div>
                {/* Very subtle noise */}
                <div className="fixed inset-0 z-20 pointer-events-none opacity-[0.018]">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* ── GLOBAL BASE ── */}
            <div className="fixed inset-0 z-0 bg-black" />

            {/* ── CINEMATIC BACKGROUND VIDEO (All Pages) ── */}
            <div className="fixed inset-0 z-10 overflow-hidden pointer-events-none">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="none"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto object-cover opacity-[0.12] scale-150 blur-sm transition-opacity duration-1000"
                >
                    <source src="https://mintlify.s3-us-west-1.amazonaws.com/mintlify/video/hero-video.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black/60" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
            </div>

            {/* Subtle Texture Overlay (Noise) */}
            <div className="fixed inset-0 z-20 pointer-events-none opacity-[0.03]">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>
        </>
    );
}
