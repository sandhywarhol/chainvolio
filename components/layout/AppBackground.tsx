"use client";

import { usePathname } from "next/navigation";

export function AppBackground() {
    const pathname = usePathname();
    const isHomePage = pathname === "/";
    const isWhyPage = pathname === "/why";

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

            {/* Bottom black fade - subtle depth at the footer area */}
            <div className="fixed inset-0 z-20 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>

            {(isHomePage || isWhyPage) && (
                <>
                    {/* Global Vignette - Ultra-Soft Seamless Mist (Offset from top for clear navigation) */}
                    <div
                        className="fixed top-24 bottom-0 left-0 w-[20%] z-[70] pointer-events-none backdrop-blur-xl"
                        style={{
                            maskImage: 'linear-gradient(to right, black, transparent)',
                            WebkitMaskImage: 'linear-gradient(to right, black, transparent)',
                            background: 'linear-gradient(to right, rgba(0,0,0,1), rgba(0,0,0,0))'
                        }}
                    ></div>
                    <div
                        className="fixed top-24 bottom-0 right-0 w-[20%] z-[70] pointer-events-none backdrop-blur-xl"
                        style={{
                            maskImage: 'linear-gradient(to left, black, transparent)',
                            WebkitMaskImage: 'linear-gradient(to left, black, transparent)',
                            background: 'linear-gradient(to left, rgba(0,0,0,1), rgba(0,0,0,0))'
                        }}
                    ></div>

                    {/* Bottom Vignette - Blur for the footer area */}
                    <div
                        className="fixed bottom-0 left-0 right-0 h-32 z-[70] pointer-events-none backdrop-blur-xl"
                        style={{
                            maskImage: 'linear-gradient(to top, black, transparent)',
                            WebkitMaskImage: 'linear-gradient(to top, black, transparent)',
                            background: 'linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0))'
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
