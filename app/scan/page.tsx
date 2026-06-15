"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type ScanState = "idle" | "scanning" | "detected" | "unsupported" | "denied";

export default function ScanPage() {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const rafRef = useRef<number>(0);
    const [state, setState] = useState<ScanState>("idle");

    useEffect(() => {
        if (window.innerWidth >= 768) router.replace("/explore-talent");
    }, [router]);

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        cancelAnimationFrame(rafRef.current);
    }, []);

    useEffect(() => () => stopCamera(), [stopCamera]);

    const startScan = useCallback(async () => {
        if (!("BarcodeDetector" in window)) {
            setState("unsupported");
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setState("scanning");

            const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });

            const tick = async () => {
                if (!videoRef.current) return;
                try {
                    const codes = await detector.detect(videoRef.current);
                    if (codes.length > 0) {
                        const value: string = codes[0].rawValue;
                        stopCamera();
                        setState("detected");
                        setTimeout(() => {
                            try {
                                const url = new URL(value);
                                router.push(url.pathname + url.search);
                            } catch {
                                router.push(value);
                            }
                        }, 500);
                        return;
                    }
                } catch {/* detector not ready yet */}
                rafRef.current = requestAnimationFrame(tick);
            };
            rafRef.current = requestAnimationFrame(tick);
        } catch {
            setState("denied");
        }
    }, [router, stopCamera]);

    const BG = "#0a0a0a";

    return (
        <div style={{ position: "fixed", inset: 0, backgroundColor: BG, display: "flex", flexDirection: "column" }}>

            <style>{`
                @keyframes scanSwipe {
                    0%, 100% { top: 8%; }
                    50% { top: 88%; }
                }
            `}</style>

            {/* Header bar */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
                padding: "calc(env(safe-area-inset-top, 0px) + 14px) 20px 14px",
                display: "flex", alignItems: "center", gap: 12,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)",
            }}>
                <button
                    onClick={() => { stopCamera(); router.back(); }}
                    style={{
                        width: 38, height: 38, borderRadius: 19, cursor: "pointer",
                        background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                </button>
                <p style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>Scan QR Code</p>
            </div>

            {/* Idle: ask to start camera */}
            {state === "idle" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, gap: 24 }}>
                    <div style={{
                        width: 88, height: 88, borderRadius: 44,
                        background: "rgba(253,230,138,0.06)", border: "1px solid rgba(253,230,138,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(253,230,138,0.7)" strokeWidth="1.5" strokeLinecap="round">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                        </svg>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <p style={{ color: "#f9fafb", fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Scan ChainVolio QR</p>
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.6, maxWidth: 260 }}>
                            Point your camera at a ChainVolio profile QR code to instantly view their CV.
                        </p>
                    </div>
                    <button
                        onClick={startScan}
                        style={{
                            padding: "15px 40px", borderRadius: 18, cursor: "pointer",
                            background: "rgba(253,230,138,0.12)", border: "1px solid rgba(253,230,138,0.35)",
                            color: "rgba(253,230,138,0.85)", fontSize: 15, fontWeight: 700,
                        }}
                    >
                        Open Camera
                    </button>
                </div>
            )}

            {/* Scanning: live viewfinder */}
            {(state === "scanning" || state === "detected") && (
                <>
                    <video
                        ref={videoRef}
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                        playsInline
                        muted
                    />

                    {/* Dark overlay with transparent center cutout via box-shadow trick */}
                    <div style={{
                        position: "absolute", inset: 0, zIndex: 5,
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        pointerEvents: "none",
                    }}>
                        <div style={{ position: "relative", width: 220, height: 220 }}>
                            {/* 4 corner brackets */}
                            {([
                                { top: 0, left: 0, borderTop: "3px solid rgba(253,230,138,0.85)", borderLeft: "3px solid rgba(253,230,138,0.85)", borderRadius: "12px 0 0 0" },
                                { top: 0, right: 0, borderTop: "3px solid rgba(253,230,138,0.85)", borderRight: "3px solid rgba(253,230,138,0.85)", borderRadius: "0 12px 0 0" },
                                { bottom: 0, left: 0, borderBottom: "3px solid rgba(253,230,138,0.85)", borderLeft: "3px solid rgba(253,230,138,0.85)", borderRadius: "0 0 0 12px" },
                                { bottom: 0, right: 0, borderBottom: "3px solid rgba(253,230,138,0.85)", borderRight: "3px solid rgba(253,230,138,0.85)", borderRadius: "0 0 12px 0" },
                            ] as React.CSSProperties[]).map((style, i) => (
                                <div key={i} style={{ position: "absolute", width: 44, height: 44, ...style }} />
                            ))}

                            {/* Scan sweep line */}
                            {state === "scanning" && (
                                <div style={{
                                    position: "absolute", left: 8, right: 8, height: 2,
                                    background: "linear-gradient(to right, transparent, rgba(253,230,138,0.9), transparent)",
                                    animation: "scanSwipe 2s ease-in-out infinite",
                                    borderRadius: 1,
                                }} />
                            )}

                            {/* Detected checkmark */}
                            {state === "detected" && (
                                <div style={{
                                    position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                                    background: "rgba(16,185,129,0.15)", borderRadius: 8,
                                }}>
                                    <div style={{
                                        width: 52, height: 52, borderRadius: 26,
                                        background: "rgba(16,185,129,0.85)", display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>

                        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 20, letterSpacing: 0.3 }}>
                            {state === "scanning" ? "Position QR code in the frame" : "QR Code detected!"}
                        </p>
                    </div>
                </>
            )}

            {/* Unsupported browser */}
            {state === "unsupported" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, gap: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 40, marginBottom: 4 }}>📷</div>
                    <p style={{ color: "#f9fafb", fontSize: 18, fontWeight: 700 }}>Browser Not Supported</p>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.6, maxWidth: 260 }}>
                        Please use <strong style={{ color: "rgba(255,255,255,0.7)" }}>Chrome on Android</strong> or <strong style={{ color: "rgba(255,255,255,0.7)" }}>Safari iOS 17+</strong> for QR scanning.
                    </p>
                    <button
                        onClick={() => router.back()}
                        style={{ marginTop: 8, padding: "12px 28px", borderRadius: 14, cursor: "pointer", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "#f9fafb", fontSize: 14, fontWeight: 600 }}
                    >
                        Go Back
                    </button>
                </div>
            )}

            {/* Camera denied */}
            {state === "denied" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, gap: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 40, marginBottom: 4 }}>🚫</div>
                    <p style={{ color: "#f9fafb", fontSize: 18, fontWeight: 700 }}>Camera Access Denied</p>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.6, maxWidth: 260 }}>
                        Allow camera access in your browser settings, then try again.
                    </p>
                    <button
                        onClick={startScan}
                        style={{ marginTop: 8, padding: "12px 28px", borderRadius: 14, cursor: "pointer", background: "rgba(253,230,138,0.1)", border: "1px solid rgba(253,230,138,0.3)", color: "rgba(253,230,138,0.8)", fontSize: 14, fontWeight: 700 }}
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
}
