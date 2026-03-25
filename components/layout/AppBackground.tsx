"use client";

import { usePathname } from "next/navigation";

export function AppBackground() {
    const pathname = usePathname();
    const isHomePage = pathname === "/";
    const isCVPage = pathname?.startsWith("/cv/");

    // Homepage and CV view keep the original video background
    const useVideo = isHomePage || isCVPage;

    return (
        <>
            {/* ── BLACK BASE (all pages) ── */}
            <div className="fixed inset-0 z-0 bg-black" />

            {/* ════════════════════════════════════════
                VIDEO BACKGROUND — homepage & CV only
            ════════════════════════════════════════ */}
            {useVideo && (
                <>
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
                    {/* Black gradient overlays for video pages */}
                    <div className="fixed inset-0 z-20 bg-gradient-to-b from-black via-black/80 to-transparent" />
                    <div className="fixed inset-0 z-20 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                </>
            )}

            {/* ════════════════════════════════════════
                ORB BACKGROUND — all other pages
            ════════════════════════════════════════ */}
            {!useVideo && (
                <>
                    {/* PURPLE: dominant center bloom — top, slightly left */}
                    <div
                        className="fixed z-[1] why-orb-center pointer-events-none"
                        style={{
                            top: '-5%',
                            left: '30%',
                            width: '80vw',
                            height: '80vw',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle at center, rgba(139,92,246,0.52) 0%, rgba(109,40,217,0.22) 30%, rgba(76,29,149,0.06) 58%, transparent 74%)',
                            filter: 'blur(60px)',
                        }}
                    />

                    {/* GREEN: upper-right, high up */}
                    <div
                        className="fixed z-[1] why-orb-green pointer-events-none"
                        style={{
                            top: '5%',
                            right: '-8%',
                            width: '48vw',
                            height: '48vw',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle at center, rgba(16,185,129,0.38) 0%, rgba(5,150,105,0.13) 38%, transparent 65%)',
                            filter: 'blur(52px)',
                        }}
                    />

                    {/* PINK: mid-left, offset lower */}
                    <div
                        className="fixed z-[1] why-orb-purple pointer-events-none"
                        style={{
                            top: '48%',
                            left: '-8%',
                            width: '44vw',
                            height: '44vw',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle at center, rgba(236,72,153,0.36) 0%, rgba(219,39,119,0.12) 38%, transparent 65%)',
                            filter: 'blur(56px)',
                        }}
                    />

                    {/* PURPLE: mid-page, deep right */}
                    <div
                        className="fixed z-[1] why-orb-purple pointer-events-none"
                        style={{
                            top: '62%',
                            right: '-5%',
                            width: '42vw',
                            height: '42vw',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle at center, rgba(167,139,250,0.32) 0%, rgba(139,92,246,0.10) 42%, transparent 68%)',
                            filter: 'blur(65px)',
                        }}
                    />

                    {/* GREEN: lower-center, offset right */}
                    <div
                        className="fixed z-[1] why-orb-green pointer-events-none"
                        style={{
                            bottom: '8%',
                            left: '52%',
                            width: '46vw',
                            height: '46vw',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle at center, rgba(52,211,153,0.30) 0%, rgba(16,185,129,0.09) 40%, transparent 66%)',
                            filter: 'blur(58px)',
                        }}
                    />

                    {/* PINK: bottom-left corner */}
                    <div
                        className="fixed z-[1] why-orb-green pointer-events-none"
                        style={{
                            bottom: '-5%',
                            left: '-5%',
                            width: '38vw',
                            height: '38vw',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle at center, rgba(244,114,182,0.26) 0%, rgba(236,72,153,0.08) 42%, transparent 66%)',
                            filter: 'blur(62px)',
                        }}
                    />

                    {/* PURPLE: floating lower-mid, slightly left */}
                    <div
                        className="fixed z-[1] why-orb-center pointer-events-none"
                        style={{
                            top: '78%',
                            left: '20%',
                            width: '34vw',
                            height: '34vw',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle at center, rgba(124,58,237,0.28) 0%, rgba(109,40,217,0.08) 44%, transparent 68%)',
                            filter: 'blur(70px)',
                        }}
                    />

                    {/* Heavy black overlay — crush mid-tones, keep dark */}
                    <div
                        className="fixed inset-0 z-[2] pointer-events-none"
                        style={{ background: 'rgba(0,0,0,0.72)' }}
                    />

                    {/* Vignette: top & bottom */}
                    <div
                        className="fixed inset-0 z-[3] pointer-events-none"
                        style={{
                            background: 'linear-gradient(to bottom, #000000 0%, transparent 18%, transparent 72%, #000000 100%)',
                        }}
                    />

                    {/* Vignette: left & right edges */}
                    <div
                        className="fixed inset-0 z-[3] pointer-events-none"
                        style={{
                            background: 'linear-gradient(to right, #000000 0%, transparent 15%, transparent 85%, #000000 100%)',
                        }}
                    />
                </>
            )}

            {/* Carbon fiber mesh — very subtle, all pages */}
            <div className="fixed inset-0 z-[5] pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.012]"
                    style={{
                        backgroundImage: `
              repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px),
              repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)
            `,
                    }}
                />
            </div>
        </>
    );
}
