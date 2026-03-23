"use client";

import { usePathname } from "next/navigation";

export function AppBackground() {
    const pathname = usePathname();
    const isHomePage = pathname === "/";
    const isWhyPage = pathname === "/why";
    const isSecurityPage = pathname === "/security";
    const isGuidePage = pathname?.startsWith("/guides/");

    return (
        <>
            {/* Black background layer - behind everything */}
            <div className="fixed inset-0 z-0 bg-black"></div>

            {/* Video background */}
            <div className="fixed inset-0 z-10">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-70"
                >
                    <source src="/video-background.mp4" type="video/mp4" />
                </video>
            </div>

            {/* Black gradient overlay - video only visible at bottom */}
            <div className="fixed inset-0 z-20 bg-gradient-to-b from-black via-black/80 to-transparent"></div>

            {/* Bottom black fade - stronger depth at the footer area */}
            <div className="fixed inset-0 z-20 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>

            {(isHomePage || isWhyPage || isSecurityPage || isGuidePage) && (
                <>
                    {/* Bottom Vignette - Deeper and taller for the footer area */}
                    <div
                        className="fixed bottom-0 left-0 right-0 h-48 z-[50] pointer-events-none"
                        style={{
                            maskImage: 'linear-gradient(to top, black 20%, transparent)',
                            WebkitMaskImage: 'linear-gradient(to top, black 20%, transparent)',
                            background: 'linear-gradient(to top, rgba(0,0,0,1) 10%, rgba(0,0,0,0))'
                        }}
                    ></div>
                </>
            )}

            {/* Carbon fiber / mesh texture overlay moved to lower z-index */}
            <div className="fixed inset-0 z-15">
                <div
                    className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage: `
              repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px),
              repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)
            `,
                    }}
                ></div>
            </div>
        </>
    );
}
