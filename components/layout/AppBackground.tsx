"use client";

import { usePathname } from "next/navigation";

export function AppBackground() {
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
                
                {/* Dark Overlays for depth and readability */}
                <div className="absolute inset-0 bg-black/70" />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black/70" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
            </div>

            {/* Subtle Texture Overlay (Noise) */}
            <div className="fixed inset-0 z-20 pointer-events-none opacity-[0.03]">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>
        </>
    );
}
