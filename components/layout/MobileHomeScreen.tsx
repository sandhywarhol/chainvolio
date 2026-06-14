"use client";

import Image from "next/image";

const AMBER = "rgba(253,230,138,0.6)";

const SLIDES = [
    {
        img: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop",
        title: "Work Anywhere",
        subtitle: "Global freedom",
        desc: "Find a role that respects your family time and boundaries.",
    },
    {
        img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop",
        title: "Dream Web3 Job",
        subtitle: "Top tier roles",
        desc: "Limitless career opportunities in the global Web3 ecosystem.",
    },
    {
        img: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=800&auto=format&fit=crop",
        title: "More Income",
        subtitle: "Crypto payouts",
        desc: "Get paid borderlessly with stable cryptocurrencies anywhere.",
    },
    {
        img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop",
        title: "Global Network",
        subtitle: "Build together",
        desc: "Build connections with elite professionals worldwide.",
    },
    {
        img: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop",
        title: "New Adventures",
        subtitle: "Explore life",
        desc: "Explore a new lifestyle and freedom as a digital nomad.",
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
                <p style={{ fontSize: 18, fontWeight: 600, color: "#f9fafb" }}>Get Remote Hired Today</p>
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
                                background: "rgba(0,0,0,0.28)",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                padding: 14,
                            }}>
                                <div style={{ alignSelf: "flex-end", fontSize: 20, color: AMBER }}>♥</div>
                                <div>
                                    <p style={{ color: "#fff", fontSize: 17, fontWeight: 600, marginBottom: 4, textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}>
                                        {slide.title}
                                    </p>
                                    <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 11 }}>
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
