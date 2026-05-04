"use client";

import { useState, useRef, useEffect } from "react";

export default function SimpleDiagram() {
    const [active, setActive] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const el = svgRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) setActive(true); },
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    const W = 920, H = 600;
    const f = (d: number) => ({ opacity: active ? 1 : 0, transition: `opacity 0.5s ease ${d}s` });

    return (
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" height="auto"
            className="overflow-visible" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="s-node-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#111111" />
                    <stop offset="100%" stopColor="#000000" />
                </linearGradient>
            </defs>

            {active && [
                { d: "M 155 134 L 155 145 L 460 145 L 460 185", dur: '4s', delay: '0s' },
                { d: "M 460 134 L 460 145 L 460 185", dur: '3s', delay: '0.5s' },
                { d: "M 765 134 L 765 145 L 460 145 L 460 185", dur: '4s', delay: '1s' },
                { d: "M 460 225 L 460 270", dur: '2s', delay: '0.2s' },
                { d: "M 144 281 L 174 281 L 174 320 L 204 320", dur: '3s', delay: '0.4s' },
                { d: "M 144 321 L 174 321 L 174 320 L 204 320", dur: '2.5s', delay: '0.6s' },
                { d: "M 144 361 L 174 361 L 174 320 L 204 320", dur: '3s', delay: '0.8s' },
                { d: "M 314 320 L 375 320", dur: '1s', delay: '1.2s' },
                { d: "M 545 320 L 746 320 L 746 251 L 776 251", dur: '3.5s', delay: '1.5s' },
                { d: "M 545 320 L 746 320 L 746 296 L 776 296", dur: '3s', delay: '1.7s' },
                { d: "M 545 320 L 746 320 L 746 341 L 776 341", dur: '3s', delay: '1.9s' },
                { d: "M 545 320 L 746 320 L 746 386 L 776 386", dur: '3.5s', delay: '2.1s' },
                { d: "M 460 370 L 460 415", dur: '2s', delay: '1.2s' },
                { d: "M 460 455 L 460 475 L 127 475 L 127 495", dur: '4s', delay: '2.2s' },
                { d: "M 460 455 L 460 475 L 349 475 L 349 495", dur: '4s', delay: '2.4s' },
                { d: "M 460 455 L 460 475 L 571 475 L 571 495", dur: '4s', delay: '2.6s' },
                { d: "M 460 455 L 460 475 L 793 475 L 793 495", dur: '4s', delay: '2.8s' },
            ].map((p, i) => (
                <rect key={`spkt-${i}`} x="-1" y="-1" width={2} height={2} rx={0.5}
                    fill="white" style={{ filter: `drop-shadow(0 0 2px white)` }}>
                    <animateMotion dur={p.dur} repeatCount="indefinite" begin={p.delay} path={p.d} />
                </rect>
            ))}

            {/* ─── INPUT SOURCES ── */}
            <g style={f(0.05)}>
                <text x={W / 2} y={12} textAnchor="middle" fill="rgba(255,255,255,0.3)"
                    fontSize="8" fontWeight="800" letterSpacing="4" fontFamily="Inter, sans-serif">Input source</text>

                {[
                    { cx: 155, w: 140, title: "Code Contributions", sub: "repos, documentation, design output" },
                    { cx: 460, w: 175, title: "On-chain Activity",  sub: "transactions, ecosystem work, hackathons" },
                    { cx: 765, title: "Public Signals",    sub: "social activity, community, peer interaction", w: 195 }
                ].map((box, i) => (
                    <g key={i}>
                        <rect x={box.cx - box.w / 2} y={24} width={box.w} height={110} rx={12} fill="url(#s-node-grad)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                        <g>
                            <text x={box.cx} y={54} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="9.5" fontWeight="800">{box.title}</text>
                            <text x={box.cx} y={68} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="7" fontFamily="Inter, sans-serif">{box.sub}</text>
                        </g>
                        <g transform={`translate(${box.cx}, 98) scale(0.85)`} opacity="0.8">
                            {i === 0 && (
                                <g>
                                    <g transform="translate(-40,0)">
                                        <path d="M-4,0 L-8,4 L-4,8" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                        <path d="M1,-2 L-2,10" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                        <path d="M4,0 L8,4 L4,8" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                    </g>
                                    <g transform="translate(0,-4)">
                                        <path d="M-6,0 H2 L6,4 V12 H-6 Z" fill="none" stroke="white" strokeWidth="1.2" />
                                        <path d="M2,0 V4 H6" fill="none" stroke="white" strokeWidth="1" />
                                    </g>
                                    <g transform="translate(40,-2)">
                                        <circle cx="0" cy="4" r="7" fill="none" stroke="white" strokeWidth="1.2" />
                                        <circle cx="-3" cy="2" r="1" fill="white" />
                                        <circle cx="1" cy="1" r="1" fill="white" />
                                        <circle cx="4" cy="4" r="1" fill="white" />
                                        <path d="M4,1 L9,-4" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                                    </g>
                                </g>
                            )}
                            {i === 1 && (
                                <g>
                                    <g transform="translate(-40,0)">
                                        <path d="M4,-8 A8,8 0 0,1 4,8" fill="none" stroke="white" strokeWidth="1.5" />
                                        <circle cx="-6" cy="0" r="0.8" fill="white" />
                                        <circle cx="-4" cy="-4" r="0.8" fill="white" />
                                        <circle cx="-4" cy="4" r="0.8" fill="white" />
                                        <path d="M4,0 V-4 M4,0 L1,3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                    </g>
                                    <g transform="translate(0,-4)">
                                        <circle cx="0" cy="4" r="8" fill="none" stroke="white" strokeWidth="1.2" />
                                        <path d="M-3,-1 A4,4 0 0,1 3,-1" fill="none" stroke="white" strokeWidth="1" />
                                        <path d="M-4,4 A5,5 0 0,0 4,4" fill="none" stroke="white" strokeWidth="1" />
                                        <line x1="0" y1="-4" x2="0" y2="12" stroke="white" strokeWidth="1" />
                                    </g>
                                    <g transform="translate(40,-4)">
                                        <rect x="-8" y="0" width="16" height="11" rx="1.5" fill="none" stroke="white" strokeWidth="1.2" />
                                        <path d="M-3,0 V-2 H3 V0" fill="none" stroke="white" strokeWidth="1.2" />
                                        <rect x="-2" y="4" width="4" height="2.5" rx="0.5" fill="none" stroke="white" strokeWidth="0.8" />
                                    </g>
                                </g>
                            )}
                            {i === 2 && (
                                <g>
                                    <g transform="translate(-40,0)">
                                        <circle cx="0" cy="0" r="1.5" fill="white" />
                                        <path d="M-4,-4 A6,6 0 0,0 -4,4 M4,-4 A6,6 0 0,1 4,4" fill="none" stroke="white" strokeWidth="1.2" />
                                        <path d="M-8,-8 A12,12 0 0,0 -8,8 M8,-8 A12,12 0 0,1 8,8" fill="none" stroke="white" strokeWidth="1.2" />
                                    </g>
                                    <g transform="translate(0,0)">
                                        <circle cx="-5" cy="-3" r="2.5" fill="white" />
                                        <circle cx="5" cy="-3" r="2.5" fill="white" />
                                        <circle cx="0" cy="0" r="3.5" fill="white" stroke="black" strokeWidth="0.5" />
                                        <path d="M-7,6 A4,4 0 0,1 7,6 Z" fill="white" stroke="black" strokeWidth="0.5" transform="translate(0,2)" />
                                    </g>
                                    <g transform="translate(40,-2)">
                                        <path d="M-8,2 V8 H-5 L2,12 V-2 L-5,2 Z" fill="white" />
                                        <path d="M5,1 A6,6 0 0,1 5,9 M8,-2 A10,10 0 0,1 8,12" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                                    </g>
                                </g>
                            )}
                        </g>
                    </g>
                ))}
            </g>

            {/* ─── CONNECTORS ── */}
            <g style={f(0.2)}>
                <path d="M 155 134 L 155 145 L 765 145 M 460 134 L 460 185 M 765 134 L 765 145" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="4 4" />
                <line x1="460" y1="145" x2="460" y2="185" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="4 4" />
            </g>

            {/* ─── CENTER COLUMN ── */}
            <g style={f(0.12)}>
                <rect x={355} y={185} width={210} height={40} rx={20} fill="url(#s-node-grad)" stroke="rgba(255,255,255,0.1)" />
                <text x={460} y={203} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10" fontWeight="800">Data ingestion</text>
                <text x={460} y={218} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7.5">collecting all signals</text>
                <line x1="460" y1="225" x2="460" y2="270" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="3 3" />

                <rect x={375} y={270} width={170} height={100} rx={16} fill="url(#s-node-grad)" stroke="rgba(255,255,255,0.1)" />
                <image href="/logo.png" x={438} y={288} width={44} height={44} style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.25))' }} />
                <text x={460} y={348} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="13" fontWeight="900" letterSpacing="1">Chainvolio</text>

                <line x1="460" y1="370" x2="460" y2="415" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="3 3" />
                <rect x={355} y={415} width={210} height={40} rx={20} fill="url(#s-node-grad)" stroke="rgba(255,255,255,0.1)" />
                <text x={460} y={433} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10" fontWeight="800">Smart matching</text>
                <text x={460} y={448} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7.5">verified credentials, trusted anywhere</text>
            </g>

            {/* ─── SIDE PANELS ── */}
            <g style={f(0.25)}>
                <text x={79} y={236} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontWeight="800" letterSpacing="4" fontFamily="Inter, sans-serif">Verification</text>
                <rect x={14} y={245} width={130} height={150} rx={16} fill="url(#s-node-grad)" stroke="rgba(255,255,255,0.08)" />
                <g transform="translate(14, 261)">
                    <g transform="translate(12, 10)">
                        <g transform="scale(0.85) rotate(-45, 6, 6)" opacity="0.9">
                            <rect x="0" y="3" width="9" height="5" rx="2" fill="none" stroke="white" strokeWidth="1.5" />
                            <rect x="5" y="3" width="9" height="5" rx="2" fill="none" stroke="white" strokeWidth="1.5" />
                        </g>
                        <g transform="translate(20, 5)">
                            <text fill="rgba(255,255,255,0.85)" fontSize="9" fontWeight="800">Smart contract</text>
                            <text y={10} fill="rgba(255,255,255,0.4)" fontSize="7">audit trace</text>
                        </g>
                    </g>
                    <line x1="10" y1="30" x2="120" y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
                    <g transform="translate(12, 50)">
                        <g transform="scale(0.7) translate(-2, -2)" opacity="0.9">
                            <path d="M10,0 L12.5,2 L15.5,1.5 L16,4.5 L19,6 L17.5,9 L19,12 L16,13.5 L15.5,16.5 L12.5,16 L10,18 L7.5,16 L4.5,16.5 L4,13.5 L1,12 L2.5,9 L1,6 L4,4.5 L4.5,1.5 L7.5,2 Z" fill="white" opacity="0.2" />
                            <path d="M10,0 L12.5,2 L15.5,1.5 L16,4.5 L19,6 L17.5,9 L19,12 L16,13.5 L15.5,16.5 L12.5,16 L10,18 L7.5,16 L4.5,16.5 L4,13.5 L1,12 L2.5,9 L1,6 L4,4.5 L4.5,1.5 L7.5,2 Z" fill="none" stroke="white" strokeWidth="1.5" />
                            <path d="M6,9 L9,12 L14,7" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                        </g>
                        <g transform="translate(20, 5)">
                            <text fill="rgba(255,255,255,0.85)" fontSize="9" fontWeight="800">Work history</text>
                            <text y={10} fill="rgba(255,255,255,0.4)" fontSize="7">on-chain proof</text>
                        </g>
                    </g>
                    <line x1="10" y1="70" x2="120" y2="70" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
                    <g transform="translate(12, 90)">
                        <g transform="scale(0.85) translate(0, 0)" opacity="0.9">
                            <circle cx="6" cy="6" r="3" fill="none" stroke="white" strokeWidth="1.5" />
                            <path d="M6,0 V2 M6,10 V12 M0,6 H2 M10,6 H12 M2,2 L3.5,3.5 M8.5,8.5 L10,10 M2,10 L3.5,8.5 M8.5,3.5 L10,2" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                        </g>
                        <g transform="translate(20, 5)">
                            <text fill="rgba(255,255,255,0.85)" fontSize="9" fontWeight="800">Attestations</text>
                            <text y={10} fill="rgba(255,255,255,0.4)" fontSize="7">verified by DAOs</text>
                        </g>
                    </g>
                </g>

                <rect x={204} y={300} width={110} height={40} rx={20} fill="url(#s-node-grad)" stroke="rgba(255,255,255,0.1)" />
                <text x={259} y={318} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="9" fontWeight="800">Verification</text>
                <text x={259} y={330} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">Engine</text>
                <path d="M 144 281 L 174 281 L 174 320 L 204 320" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" strokeDasharray="4 4" />
                <path d="M 144 321 L 174 321 L 174 320 L 204 320" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" strokeDasharray="4 4" />
                <path d="M 144 361 L 174 361 L 174 320 L 204 320" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" strokeDasharray="4 4" />
                <line x1="314" y1="320" x2="375" y2="320" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="4 4" />

                <text x={841} y={211} textAnchor="middle" fill="rgba(255,255,255,0.3)"
                    fontSize="8" fontWeight="800" letterSpacing="4" fontFamily="Inter, sans-serif">Verified output</text>
                <rect x={776} y={220} width={130} height={200} rx={16} fill="url(#s-node-grad)" stroke="rgba(255,255,255,0.08)" />
                <g transform="translate(841, 251)" textAnchor="middle">
                    {["Verifiable CV", "Reputation score", "Skill proof", "Public identity"].map((t, i) => (
                        <g key={i} transform={`translate(0, ${i * 45})`}>
                            <text fill="rgba(255,255,255,0.85)" fontSize="10" fontWeight="800">{t}</text>
                            <text y={10} fill="rgba(255,255,255,0.4)" fontSize="7">{["permanent record", "credibility rating", "verified skills", "shareable link"][i]}</text>
                            {i < 3 && <line x1="-50" y1="20" x2="50" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />}
                        </g>
                    ))}
                </g>
                <path d="M 545 320 L 746 320 L 746 251 L 776 251" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" strokeDasharray="4 4" />
                <path d="M 545 320 L 746 320 L 746 296 L 776 296" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" strokeDasharray="4 4" />
                <path d="M 545 320 L 746 320 L 746 341 L 776 341" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" strokeDasharray="4 4" />
                <path d="M 545 320 L 746 320 L 746 386 L 776 386" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" strokeDasharray="4 4" />
            </g>

            {/* ─── CONSUMERS ── */}
            <g style={f(0.35)}>
                <path d="M 460 455 L 460 475 L 127 475 L 127 495 M 460 475 L 349 475 L 349 495 M 460 475 L 571 475 L 571 495 M 460 475 L 793 475 L 793 495"
                      fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="4 4" />
                {[
                    { cx: 127, label: "DAO access", sub: "Protocol admin" },
                    { cx: 349, label: "Talent discovery", sub: "Instant hire" },
                    { cx: 571, label: "Hiring", sub: "HR verification" },
                    { cx: 793, label: "Collaboration", sub: "Team builder" }
                ].map((box, i) => (
                    <g key={i}>
                        <rect x={box.cx - 60} y={495} width={120} height={50} rx={12} fill="url(#s-node-grad)" stroke="rgba(255,255,255,0.08)" />
                        <text x={box.cx} y={520} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10" fontWeight="700">{box.label}</text>
                        <text x={box.cx} y={535} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8">{box.sub}</text>
                    </g>
                ))}
                <text x={W / 2} y={H - 5} textAnchor="middle" fill="rgba(255,255,255,0.3)"
                    fontSize="8" fontWeight="800" letterSpacing="4" fontFamily="Inter, sans-serif">Consumers</text>
            </g>
        </svg>
    );
}
