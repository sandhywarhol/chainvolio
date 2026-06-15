"use client";

import Image from "next/image";
import Link from "next/link";

const AMBER = "rgba(253,230,138,0.6)";

const SLIDES = [
    {
        img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop",
        title: "CV On-Chain",
        subtitle: "Tamper-proof forever",
        desc: "Your work history is permanently recorded on Solana. No one can fake it.",
        tag: "Feature",
    },
    {
        img: "https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=800&auto=format&fit=crop",
        title: "Attestation",
        subtitle: "Verified by peers",
        desc: "Colleagues and DAOs endorse your contributions on-chain. Real proof, not just claims.",
        tag: "Feature",
    },
    {
        img: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop",
        title: "Hiring Tool",
        subtitle: "Find & hire faster",
        desc: "Post jobs, verify applicants' on-chain credentials, and hire top Web3 talent instantly.",
        tag: "For Recruiters",
    },
    {
        img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
        title: "Instant Trust",
        subtitle: "Zero fake CVs",
        desc: "Every credential is verifiable on-chain. Recruiters trust your profile immediately.",
        tag: "Trust Layer",
    },
    {
        img: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop",
        title: "Work Anywhere",
        subtitle: "Global freedom",
        desc: "Get hired by top Web3 DAOs and companies, from anywhere in the world.",
        tag: "Opportunity",
    },
];

const LOGOS = [
    { src: "/logos/github.png", alt: "GitHub" },
    { src: "/logos/discord.png", alt: "Discord" },
    { src: "/logos/figma.png", alt: "Figma" },
    { src: "/logos/canva.png", alt: "Canva" },
    { src: "/logos/dropbox.png", alt: "Dropbox" },
    { src: "/logos/slack.png", alt: "Slack" },
    { src: "/logos/linkedin.png", alt: "LinkedIn" },
    { src: "/logos/google drive.png", alt: "Google Drive" },
    { src: "/logos/telegram.png", alt: "Telegram" },
    { src: "/logos/solana.png", alt: "Solana" },
    { src: "/logos/alchemy.png", alt: "Alchemy" },
    { src: "/logos/superteam.png", alt: "Superteam" },
];

export function MobileHomeScreen() {
    return (
        <div style={{ backgroundColor: "#111111" }}>

            <style>{`
                @keyframes imgShine {
                    0%   { transform: translateX(-160%) skewX(-12deg); }
                    100% { transform: translateX(260%) skewX(-12deg); }
                }
            `}</style>

            {/* Greeting */}
            <div style={{ paddingLeft: 25, paddingRight: 25, paddingTop: 20, marginBottom: 20 }}>
                <p style={{ fontSize: 26, fontWeight: 700, color: "#f9fafb", lineHeight: 1.35 }}>
                    <span style={{ color: AMBER }}>GM Builders!</span>{" "}
                    What are we building today?
                </p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginTop: 10 }}>
                    The verifiable Web3 CV. Build your on-chain work history, get hired by top DAOs and crypto companies.
                </p>
                <Link
                    href="/create-profile"
                    style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        marginTop: 18,
                        padding: "12px 22px", borderRadius: 16,
                        background: "rgba(253,230,138,0.1)",
                        border: "1px solid rgba(253,230,138,0.3)",
                        color: "rgba(253,230,138,0.85)",
                        fontSize: 14, fontWeight: 700,
                        textDecoration: "none",
                    }}
                >
                    Create My Profile
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>

            {/* Section Header */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingLeft: 25,
                paddingRight: 25,
                marginBottom: 14,
            }}>
                <p style={{ fontSize: 18, fontWeight: 600, color: "#f9fafb" }}>What ChainVolio Does</p>
                <span style={{ color: AMBER, fontSize: 20, lineHeight: 1 }}>•••</span>
            </div>

            {/* Image Cards — manual scroll, each with a shine sweep */}
            <div
                className="no-scrollbar"
                style={{
                    display: "flex",
                    overflowX: "auto",
                    gap: 16,
                    paddingLeft: 25,
                    paddingRight: 25,
                    paddingBottom: 4,
                    marginBottom: 12,
                    WebkitOverflowScrolling: "touch",
                }}
            >
                {SLIDES.map((slide, i) => (
                    <div key={i} style={{ width: "60vw", flexShrink: 0 }}>
                        <div style={{
                            width: "100%",
                            aspectRatio: "3/4",
                            borderRadius: 20,
                            overflow: "hidden",
                            position: "relative",
                            marginBottom: 8,
                            backgroundColor: "#1f2937",
                        }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={slide.img}
                                alt={slide.title}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />

                            {/* Dark overlay + content */}
                            <div style={{
                                position: "absolute",
                                inset: 0,
                                background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.82) 100%)",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                padding: 14,
                            }}>
                                {/* Tag badge top-right */}
                                <div style={{ alignSelf: "flex-end" }}>
                                    <span style={{
                                        fontSize: 8, fontWeight: 700, letterSpacing: 1,
                                        textTransform: "uppercase",
                                        padding: "3px 8px", borderRadius: 20,
                                        backgroundColor: "rgba(253,230,138,0.15)",
                                        border: "1px solid rgba(253,230,138,0.35)",
                                        color: AMBER,
                                    }}>
                                        {slide.tag}
                                    </span>
                                </div>
                                <div>
                                    <p style={{ color: "#fff", fontSize: 17, fontWeight: 700, marginBottom: 3, textShadow: "0 1px 8px rgba(0,0,0,0.9)", lineHeight: 1.25 }}>
                                        {slide.title}
                                    </p>
                                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 500 }}>
                                        {slide.subtitle}
                                    </p>
                                </div>
                            </div>

                            {/* Top edge highlight */}
                            <div style={{
                                position: "absolute",
                                top: 0,
                                left: "10%",
                                right: "10%",
                                height: 1,
                                background: "linear-gradient(to right, transparent, rgba(255,255,255,0.25), transparent)",
                                pointerEvents: "none",
                                zIndex: 10,
                            }} />

                            {/* Lightning shine sweep */}
                            <div style={{
                                position: "absolute",
                                inset: 0,
                                background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.13) 50%, transparent 65%)",
                                animation: `imgShine 4s ease-in-out infinite`,
                                animationDelay: `${i * 0.9}s`,
                                pointerEvents: "none",
                                zIndex: 10,
                            }} />
                        </div>
                        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, lineHeight: 1.5, paddingLeft: 2 }}>
                            {slide.desc}
                        </p>
                    </div>
                ))}
            </div>

            {/* How It Works — vertical with image thumbnail */}
            <div style={{ paddingLeft: 25, paddingRight: 25, paddingTop: 32, paddingBottom: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20 }}>
                    HOW IT WORKS
                </p>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {[
                        {
                            num: "01",
                            title: "Create Profile",
                            desc: "Your basic identity on-chain. Name, role, and wallet. Your Web3 passport.",
                            img: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=200&auto=format&fit=crop",
                        },
                        {
                            num: "02",
                            title: "Add Proof of Work",
                            desc: "Upload projects, work history, and contributions. Recorded forever on Solana.",
                            img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=200&auto=format&fit=crop",
                        },
                        {
                            num: "03",
                            title: "Ask Attestation",
                            desc: "Request your ex-boss or teammates to verify your work on-chain. Real proof, not just claims.",
                            img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=200&auto=format&fit=crop",
                        },
                        {
                            num: "04",
                            title: "Share & Apply",
                            desc: "Post your CV on LinkedIn, X, or other socials, or apply directly to Web3 jobs.",
                            img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=200&auto=format&fit=crop",
                        },
                    ].map((step, i, arr) => (
                        <div key={step.num} style={{ display: "flex", gap: 14, position: "relative" }}>
                            {/* Left col: image + connector line */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                                <div style={{
                                    width: 68, height: 68, borderRadius: 16, overflow: "hidden", flexShrink: 0,
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    position: "relative",
                                }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={step.img}
                                        alt={step.title}
                                        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.75) saturate(0.8)" }}
                                    />
                                    {/* amber tint overlay */}
                                    <div style={{
                                        position: "absolute", inset: 0,
                                        background: "rgba(253,230,138,0.06)",
                                    }} />
                                </div>
                                {i < arr.length - 1 && (
                                    <div style={{
                                        width: 1, flex: 1, minHeight: 20,
                                        background: "linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.03))",
                                        margin: "8px 0",
                                    }} />
                                )}
                            </div>

                            {/* Right col: text */}
                            <div style={{ paddingTop: 6, paddingBottom: i < arr.length - 1 ? 8 : 0 }}>
                                <p style={{
                                    fontSize: 9, fontWeight: 700, letterSpacing: 1.3,
                                    color: "rgba(253,230,138,0.5)",
                                    textTransform: "uppercase", marginBottom: 4,
                                }}>
                                    STEP {step.num}
                                </p>
                                <p style={{ fontSize: 15, fontWeight: 700, color: "#f9fafb", marginBottom: 5, lineHeight: 1.3 }}>
                                    {step.title}
                                </p>
                                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.6 }}>
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Divider */}
            <div style={{ marginLeft: 25, marginRight: 25, marginTop: 28, height: 1, background: "linear-gradient(to right, transparent, rgba(255,255,255,0.07), transparent)" }} />

            {/* Tech Stack Logos Grid */}
            <div style={{ paddingLeft: 25, paddingRight: 25, paddingTop: 24, paddingBottom: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <p style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.3)",
                    letterSpacing: 1.5,
                    marginBottom: 14,
                    textTransform: "uppercase",
                    textAlign: "center",
                }}>
                    POWERING YOUR WEB3 CAREER STACK
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, maxWidth: 340 }}>
                    {LOGOS.map((logo, i) => (
                        <div
                            key={i}
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                backgroundColor: "rgba(255,255,255,0.04)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1px solid rgba(255,255,255,0.08)",
                            }}
                        >
                            <Image
                                src={logo.src}
                                alt={logo.alt}
                                width={18}
                                height={18}
                                style={{ objectFit: "contain", opacity: 0.55, filter: "brightness(10)" }}
                                unoptimized
                            />
                        </div>
                    ))}
                </div>
                <p style={{
                    marginTop: 18,
                    fontSize: 11,
                    color: "rgba(255,255,255,0.2)",
                    textAlign: "center",
                    lineHeight: 1.6,
                    paddingLeft: 20,
                    paddingRight: 20,
                }}>
                    For the best experience in hiring and building your CV, we recommend using a desktop browser.
                </p>
            </div>

        </div>
    );
}
