"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

const CATEGORY_COLORS = {
    purple: "#9945FF",
    green:  "#14F195",
    blue:   "#60a5fa",
    amber:  "#f59e0b",
    violet: "#a78bfa",
    teal:   "#2dd4bf",
};

export default function CompetitiveNetworkDiagram() {
    const [active, setActive] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const el = svgRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) setActive(true); },
            { threshold: 0.15 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    const SVW = 1100, SVH = 720;
    const CX = 550, CY = 375;

    const COL_XS = [248, 424, 600];
    const ROW_YS = [52, 112, 172];
    const N_W = 148;
    const COLLECTOR_Y = 224;
    const INGEST_X = 470, INGEST_Y = 240, INGEST_W = 160, INGEST_H = 26;

    const CHIP_X = 440, CHIP_Y = 330, CHIP_W = 220, CHIP_H = 90;

    const N_H = 26;
    const LN_X = 20, LN_W = 148, LN_H = 26;
    const LN_YS = [315, 375, 435];
    const L_BUS_X = 256;
    const VERIFY_X = 274, VERIFY_W = 116, VERIFY_H = 30;

    const RO_X = 920, RO_W = 168, RO_H = 26;
    const RO_YS = [195, 255, 315, 375];
    const R_BUS_X = 710;

    const BC_XS = [340, 480, 620, 760];
    const BC_Y = 574;
    const BC_W = 118, BC_H = 26;
    const MATCH_Y = 490;

    const TOP_SOURCES = [
        [
            { label: "Code Contributions",     color: CATEGORY_COLORS.purple, sub: "commit history" },
            { label: "Project Documentation", color: CATEGORY_COLORS.purple, sub: "docs & specs"    },
            { label: "Design Output",        color: CATEGORY_COLORS.purple, sub: "design work"     },
        ],
        [
            { label: "On-chain Activity",      color: CATEGORY_COLORS.green,  sub: "transaction data" },
            { label: "Ecosystem Contributions", color: CATEGORY_COLORS.green,  sub: "bounties"         },
            { label: "Hackathon Work",        color: CATEGORY_COLORS.green,  sub: "hackathons"       },
        ],
        [
            { label: "Public Signals",        color: CATEGORY_COLORS.blue,   sub: "threads"         },
            { label: "Community Activity",    color: CATEGORY_COLORS.blue,   sub: "community"       },
            { label: "Peer Interaction",      color: CATEGORY_COLORS.blue,   sub: "channels"        },
        ],
    ];
    const ROW_LABELS = ["Dev tools", "On-chain", "Social"];
    const ROW_COLORS = [CATEGORY_COLORS.purple, CATEGORY_COLORS.green, CATEGORY_COLORS.blue];

    const LEFT_NODES = [
        { label: "Smart contract", sub: "audit trace",      color: CATEGORY_COLORS.green },
        { label: "Work history",   sub: "structured record", color: CATEGORY_COLORS.green },
        { label: "Attestations",   sub: "signed validation", color: CATEGORY_COLORS.green },
    ];

    const RIGHT_OUTPUTS = [
        { label: "Verifiable CV",     sub: "permanent record",   color: CATEGORY_COLORS.teal },
        { label: "Reputation score",  sub: "credibility rating", color: CATEGORY_COLORS.teal },
        { label: "Skill proof",       sub: "verified skills",    color: CATEGORY_COLORS.teal },
        { label: "Public identity",   sub: "shareable link",     color: CATEGORY_COLORS.teal },
    ];

    const CONSUMERS = [
        { label: "DAO access",       sub: "Protocol admin",  color: CATEGORY_COLORS.amber },
        { label: "Talent discovery", sub: "Instant hire",    color: CATEGORY_COLORS.amber },
        { label: "Hiring",           sub: "HR verification", color: CATEGORY_COLORS.amber },
        { label: "Collaboration",    sub: "Team builder",    color: CATEGORY_COLORS.amber },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anim = (opts: any): any => active ? opts : {};

    return (
        <svg ref={svgRef} viewBox={`0 0 ${SVW} ${SVH}`} width="100%" height="auto"
            className="overflow-visible" xmlns="http://www.w3.org/2000/svg">

            <defs>
                <pattern id="dotGrid" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="0.8" fill="rgba(255,255,255,0.055)" />
                </pattern>
                <radialGradient id="hub-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="node-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#111111" />
                    <stop offset="100%" stopColor="#000000" />
                </linearGradient>
            </defs>

            <rect width="100%" height="100%" fill="url(#dotGrid)"
                opacity={active ? 1 : 0.4} style={{ transition: 'opacity 1.5s ease-in-out' }} />

            <g opacity={active ? 0.15 : 0} style={{ transition: 'opacity 2s' }}>
                <text x={CX} y={20} textAnchor="middle" fontSize={7} fontWeight={800} letterSpacing={6} fill="white">SIGNAL SOURCES</text>
                <text x={90} y={CY} textAnchor="middle" fontSize={7} fontWeight={800} letterSpacing={6} fill="white" transform={`rotate(-90, 90, ${CY})`}>VERIFICATION LAYER</text>
                <text x={SVW - 90} y={CY} textAnchor="middle" fontSize={7} fontWeight={800} letterSpacing={6} fill="white" transform={`rotate(90, ${SVW - 90}, ${CY})`}>OUTPUT LAYER</text>
                <text x={CX} y={SVH - 20} textAnchor="middle" fontSize={7} fontWeight={800} letterSpacing={6} fill="white">CONSUMPTION LAYER</text>
                <text x={CX} y={CY - 55} textAnchor="middle" fontSize={7} fontWeight={800} letterSpacing={6} fill="white">CORE INFRASTRUCTURE</text>
            </g>

            <text x={424} y={38} textAnchor="middle" fill="rgba(255,255,255,0.1)"
                fontSize={7} fontWeight={700} letterSpacing={3} fontFamily="Inter, sans-serif">Input sources</text>
            <text x={194} y={LN_YS[0] - 30} textAnchor="middle" fill="rgba(255,255,255,0.1)"
                fontSize={7} fontWeight={700} letterSpacing={3} fontFamily="Inter, sans-serif">Verification</text>
            <text x={772} y={RO_YS[0] - 30} textAnchor="middle"
                fill="rgba(255,255,255,0.1)" fontSize={7} fontWeight={700}
                letterSpacing={3} fontFamily="Inter, sans-serif">Verified output</text>
            <text x={CX} y={535} textAnchor="middle" fill="rgba(255,255,255,0.1)"
                fontSize={7} fontWeight={700} letterSpacing={3} fontFamily="Inter, sans-serif">Consumers</text>

            {ROW_LABELS.map((label, ri) => (
                <motion.text key={`rl${ri}`} x={174} y={ROW_YS[ri] + N_H / 2 + 1}
                    textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize={6.5}
                    fontWeight={700} letterSpacing={2.5} opacity={0}
                    animate={anim({ opacity: 0.65 })}
                    transition={{ delay: 0.1 + ri * 0.06 }}
                    fontFamily="Inter, sans-serif">{label}</motion.text>
            ))}

            {active && [
                { d: `M ${COL_XS[0]} ${ROW_YS[0] + N_H} L ${COL_XS[0]} ${COLLECTOR_Y} L ${CX} ${COLLECTOR_Y} L ${CX} ${INGEST_Y}`, dur: '4.8s', delay: '0s'   },
                { d: `M ${COL_XS[1]} ${ROW_YS[0] + N_H} L ${COL_XS[1]} ${COLLECTOR_Y} L ${CX} ${COLLECTOR_Y} L ${CX} ${INGEST_Y}`, dur: '5.0s', delay: '0.4s' },
                { d: `M ${COL_XS[2]} ${ROW_YS[0] + N_H} L ${COL_XS[2]} ${COLLECTOR_Y} L ${CX} ${COLLECTOR_Y} L ${CX} ${INGEST_Y}`, dur: '5.2s', delay: '0.8s' },
                { d: `M ${COL_XS[0]} ${ROW_YS[1] + N_H} L ${COL_XS[0]} ${COLLECTOR_Y} L ${CX} ${COLLECTOR_Y} L ${CX} ${INGEST_Y}`, dur: '4.9s', delay: '1.2s' },
                { d: `M ${COL_XS[1]} ${ROW_YS[1] + N_H} L ${COL_XS[1]} ${COLLECTOR_Y} L ${CX} ${COLLECTOR_Y} L ${CX} ${INGEST_Y}`, dur: '5.1s', delay: '0.3s' },
                { d: `M ${COL_XS[2]} ${ROW_YS[1] + N_H} L ${COL_XS[2]} ${COLLECTOR_Y} L ${CX} ${COLLECTOR_Y} L ${CX} ${INGEST_Y}`, dur: '5.3s', delay: '0.7s' },
                { d: `M ${COL_XS[0]} ${ROW_YS[2] + N_H} L ${COL_XS[0]} ${COLLECTOR_Y} L ${CX} ${COLLECTOR_Y} L ${CX} ${INGEST_Y}`, dur: '5.0s', delay: '1.5s' },
                { d: `M ${COL_XS[1]} ${ROW_YS[2] + N_H} L ${COL_XS[1]} ${COLLECTOR_Y} L ${CX} ${COLLECTOR_Y} L ${CX} ${INGEST_Y}`, dur: '5.4s', delay: '1.1s' },
                { d: `M ${COL_XS[2]} ${ROW_YS[2] + N_H} L ${COL_XS[2]} ${COLLECTOR_Y} L ${CX} ${COLLECTOR_Y} L ${CX} ${INGEST_Y}`, dur: '5.6s', delay: '0.9s' },
                { d: `M ${CX} ${INGEST_Y + INGEST_H} L ${CX} ${CHIP_Y}`, dur: '1.4s', delay: '1.3s' },
                { d: `M ${LN_X + LN_W} ${LN_YS[0]} L ${L_BUS_X} ${LN_YS[0]} L ${L_BUS_X} ${CY} L ${CHIP_X} ${CY}`, dur: '3.4s', delay: '0.6s' },
                { d: `M ${LN_X + LN_W} ${LN_YS[1]} L ${L_BUS_X} ${LN_YS[1]} L ${L_BUS_X} ${CY} L ${CHIP_X} ${CY}`, dur: '3.6s', delay: '1.0s' },
                { d: `M ${LN_X + LN_W} ${LN_YS[2]} L ${L_BUS_X} ${LN_YS[2]} L ${L_BUS_X} ${CY} L ${CHIP_X} ${CY}`, dur: '3.9s', delay: '1.4s' },
                { d: `M ${CHIP_X + CHIP_W} ${CY} L ${R_BUS_X} ${CY} L ${R_BUS_X} ${RO_YS[0]} L ${R_BUS_X + 12} ${RO_YS[0]}`, dur: '3.0s', delay: '1.6s' },
                { d: `M ${CHIP_X + CHIP_W} ${CY} L ${R_BUS_X} ${CY} L ${R_BUS_X} ${RO_YS[1]} L ${R_BUS_X + 12} ${RO_YS[1]}`, dur: '3.2s', delay: '1.9s' },
                { d: `M ${CHIP_X + CHIP_W} ${CY} L ${R_BUS_X} ${CY} L ${R_BUS_X} ${RO_YS[2]} L ${R_BUS_X + 12} ${RO_YS[2]}`, dur: '3.4s', delay: '2.2s' },
                { d: `M ${CHIP_X + CHIP_W} ${CY} L ${R_BUS_X} ${CY} L ${R_BUS_X} ${RO_YS[3]} L ${R_BUS_X + 12} ${RO_YS[3]}`, dur: '3.6s', delay: '2.5s' },
                { d: `M ${CX} ${CHIP_Y + CHIP_H} L ${CX} ${MATCH_Y - 18}`, dur: '1.4s', delay: '1.9s' },
                { d: `M ${CX} ${MATCH_Y + 18} L ${CX} ${BC_Y - 52} L ${BC_XS[0]} ${BC_Y - 52} L ${BC_XS[0]} ${BC_Y - BC_H/2}`, dur: '3.8s', delay: '2.3s' },
                { d: `M ${CX} ${MATCH_Y + 18} L ${CX} ${BC_Y - 52} L ${BC_XS[1]} ${BC_Y - 52} L ${BC_XS[1]} ${BC_Y - BC_H/2}`, dur: '4.0s', delay: '2.6s' },
                { d: `M ${CX} ${MATCH_Y + 18} L ${CX} ${BC_Y - 52} L ${BC_XS[2]} ${BC_Y - 52} L ${BC_XS[2]} ${BC_Y - BC_H/2}`, dur: '4.2s', delay: '2.9s' },
                { d: `M ${CX} ${MATCH_Y + 18} L ${CX} ${BC_Y - 52} L ${BC_XS[3]} ${BC_Y - 52} L ${BC_XS[3]} ${BC_Y - BC_H/2}`, dur: '4.4s', delay: '3.2s' },
            ].map((p, i) => (
                <rect key={`pkt-${i}`} x="-1.5" y="-1.5" width={3} height={3} rx={0.5}
                    fill="white" style={{ filter: `drop-shadow(0 0 3px white)` }}>
                    <animateMotion dur={p.dur} repeatCount="indefinite" begin={p.delay} path={p.d} />
                </rect>
            ))}

            {TOP_SOURCES.map((row, ri) => row.map((node, ci) => {
                const nw = Math.max(node.label.length * 6.2, node.sub.length * 4.6) + 10;
                const nx = COL_XS[ci] - nw / 2;
                const ny = ROW_YS[ri];
                return (
                    <motion.g key={`tn${ri}${ci}`}
                        initial={{ opacity: 0, y: -8 }}
                        animate={anim({ opacity: 1, y: 0 })}
                        transition={{ delay: 0.12 + ri * 0.07 + ci * 0.04 }}>
                        <rect x={nx} y={ny} width={nw} height={N_H} rx={3}
                            fill="url(#node-grad)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
                        <circle cx={COL_XS[ci]} cy={ny + N_H} r={1.5} fill="#000" stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
                        <text x={COL_XS[ci]} y={ny + N_H / 2 - 1.5} textAnchor="middle"
                            fill="rgba(255,255,255,0.8)" fontSize={8} fontWeight={600}
                            fontFamily="Inter, sans-serif">{node.label}</text>
                        <text x={COL_XS[ci]} y={ny + N_H / 2 + 7.5} textAnchor="middle"
                            fill="rgba(255,255,255,0.3)" fontSize={6}
                            fontFamily="Inter, sans-serif">{node.sub}</text>
                        <line x1={COL_XS[ci]} y1={ny + N_H} x2={COL_XS[ci]} y2={COLLECTOR_Y}
                            stroke="rgba(255,255,255,0.12)" strokeWidth={0.75} strokeDasharray="3 5" />
                        <g opacity={active ? 0.4 : 0}>
                            <circle cx={COL_XS[ci]} cy={COLLECTOR_Y} r={2.5} fill="#000" stroke="rgba(255,255,255,0.3)" strokeWidth={0.5} />
                            <circle cx={COL_XS[ci]} cy={COLLECTOR_Y} r={1} fill="rgba(255,255,255,0.5)" />
                        </g>
                    </motion.g>
                );
            }))}

            <motion.line x1={COL_XS[0]} y1={COLLECTOR_Y} x2={COL_XS[2]} y2={COLLECTOR_Y}
                stroke="rgba(255,255,255,0.10)" strokeWidth={1} strokeDasharray="4 6"
                opacity={0} animate={anim({ opacity: 1 })}
                transition={{ delay: 0.55 }} />
            <motion.line x1={CX} y1={COLLECTOR_Y} x2={CX} y2={INGEST_Y}
                stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} strokeDasharray="3 4"
                opacity={0} animate={anim({ opacity: 1 })}
                transition={{ delay: 0.65 }} />

            <motion.g initial={{ opacity: 0 }} animate={anim({ opacity: 1 })} transition={{ delay: 0.85 }}>
                <rect x={INGEST_X} y={INGEST_Y} width={INGEST_W} height={26} rx={3}
                    fill="url(#node-grad)" stroke="rgba(255,255,255,0.12)" strokeWidth={0.5} />
                <text x={CX} y={INGEST_Y + 11} textAnchor="middle"
                    fill="rgba(255,255,255,0.8)" fontSize={8.5} fontWeight={800} letterSpacing={1}
                    fontFamily="Inter, sans-serif">Data ingestion</text>
                <text x={CX} y={INGEST_Y + 20} textAnchor="middle"
                    fill="rgba(255,255,255,0.35)" fontSize={6.5} fontFamily="Inter, sans-serif">signal aggregation</text>
                <g opacity={0.8}>
                    <rect x={CX - 50} y={INGEST_Y - 35} width={100} height={20} rx={3} fill="url(#node-grad)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
                    <text x={CX} y={INGEST_Y - 22} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={7.5} fontWeight={700}>Wallet Authentication</text>
                    <line x1={CX} y1={INGEST_Y - 15} x2={CX} y2={INGEST_Y} stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="2 2" />
                </g>
                <rect x={CX - 3} y={INGEST_Y - 4} width={6} height={6} fill="none" />
                <rect x={CX - 3} y={INGEST_Y + INGEST_H - 2} width={6} height={6} fill="none" />
                <line x1={CX} y1={INGEST_Y + INGEST_H + 2} x2={CX} y2={CHIP_Y}
                    stroke="rgba(255,255,255,0.2)" strokeWidth={2} strokeDasharray="4 4" />
                <path d={`M ${CX-3} ${INGEST_Y + INGEST_H + 15} L ${CX} ${INGEST_Y + INGEST_H + 20} L ${CX+3} ${INGEST_Y + INGEST_H + 15}`} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
                <g opacity={active ? 0.5 : 0}>
                    <circle cx={CX} cy={CHIP_Y} r={3} fill="#000" stroke="rgba(255,255,255,0.4)" strokeWidth={0.5} />
                    <circle cx={CX} cy={CHIP_Y} r={1.2} fill="white" />
                </g>
            </motion.g>

            <motion.g initial={{ opacity: 0, x: -18 }} animate={anim({ opacity: 1, x: 0 })} transition={{ delay: 0.38 }}>
                {LEFT_NODES.map((node, i) => {
                    const lnw = Math.max(node.label.length * 6.2, node.sub.length * 4.6) + 10;
                    const center_x = L_BUS_X - 12 - lnw / 2;
                    return (
                        <g key={`ln${i}`}>
                            <rect x={L_BUS_X - 12 - lnw} y={LN_YS[i] - 13} width={lnw} height={26} rx={3}
                                fill="url(#node-grad)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
                            <text x={center_x} y={LN_YS[i] - 1.5} textAnchor="middle"
                                fill="rgba(255,255,255,0.85)" fontSize={8} fontWeight={600}
                                fontFamily="Inter, sans-serif">{node.label}</text>
                            <text x={center_x} y={LN_YS[i] + 7.5} textAnchor="middle"
                                fill="rgba(255,255,255,0.3)" fontSize={6}
                                fontFamily="Inter, sans-serif">{node.sub}</text>
                            <line x1={L_BUS_X - 12} y1={LN_YS[i]} x2={L_BUS_X} y2={LN_YS[i]}
                                stroke="rgba(255,255,255,0.15)" strokeWidth={0.75} strokeDasharray="3 5" />
                            <circle cx={L_BUS_X - 12} cy={LN_YS[i]} r={1.5} fill="#000" stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
                        </g>
                    );
                })}
                <line x1={L_BUS_X} y1={LN_YS[0]} x2={L_BUS_X} y2={LN_YS[LN_YS.length - 1]}
                    stroke="rgba(255,255,255,0.1)" strokeWidth={1.5} strokeDasharray="4 4" />
                <line x1={L_BUS_X} y1={CY} x2={CHIP_X} y2={CY}
                    stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} strokeDasharray="4 4" />
                <g opacity={0.6}>
                    <text x={CHIP_X - 25} y={CY - 12} textAnchor="middle" fill="white" fontSize={5} fontWeight={700} opacity={0.3}>DATA INTEGRITY LAYER</text>
                    <text x={CHIP_X - 25} y={CY + 16} textAnchor="middle" fill="white" fontSize={4} fontWeight={500} opacity={0.2}>hash constraint • tamper resistance</text>
                </g>
                <path d={`M ${VERIFY_X + VERIFY_W + 15} ${CY - 3} L ${VERIFY_X + VERIFY_W + 20} ${CY} L ${VERIFY_X + VERIFY_W + 15} ${CY + 3}`} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
                <rect x={VERIFY_X} y={CY - 13} width={VERIFY_W} height={26} rx={3}
                    fill="url(#node-grad)" stroke="rgba(255,255,255,0.12)" strokeWidth={0.5} />
                <text x={VERIFY_X + VERIFY_W / 2} y={CY - 1.5} textAnchor="middle"
                    fill="rgba(255,255,255,0.8)" fontSize={8.5} fontWeight={800} letterSpacing={1}
                    fontFamily="Inter, sans-serif">Verification</text>
                <text x={VERIFY_X + VERIFY_W / 2} y={CY + 7.5} textAnchor="middle"
                    fill="rgba(255,255,255,0.3)" fontSize={6} fontFamily="Inter, sans-serif">hash validation</text>
                <text x={VERIFY_X + VERIFY_W / 2} y={CY + 22} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize={5.5} fontWeight={700} letterSpacing={1}>SIGNATURE VERIFICATION • HASHING LAYER</text>
                <rect x={L_BUS_X - 4} y={CY - 4} width={8} height={8} fill="rgba(255,255,255,0.2)" rx={1} />
                <rect x={CHIP_X - 4} y={CY - 4} width={8} height={8} fill="rgba(255,255,255,0.2)" rx={1} />
                {active && LN_YS.map((y, i) => (
                    <g key={`lvia${i}`}>
                        <circle cx={L_BUS_X} cy={y} r={2.5} fill="#000" stroke="rgba(255,255,255,0.3)" strokeWidth={0.5} />
                        <circle cx={L_BUS_X} cy={y} r={1} fill="rgba(255,255,255,0.5)" />
                    </g>
                ))}
                {active && (
                    <g>
                        <circle cx={L_BUS_X} cy={CY} r={3.5} fill="#000" stroke="rgba(255,255,255,0.4)" strokeWidth={0.8} />
                        <circle cx={L_BUS_X} cy={CY} r={1.5} fill="white" />
                    </g>
                )}
            </motion.g>

            <motion.g
                initial={{ opacity: 0, scale: 0.9 }}
                animate={anim({ opacity: 1, scale: 1 })}
                style={{ transformOrigin: `${CX}px ${CY}px` }}
                transition={{ duration: 0.8, delay: 0.7 }}>
                <circle cx={CX} cy={CY} r={82} fill="url(#hub-glow)" />
                <rect x={CHIP_X} y={CHIP_Y} width={CHIP_W} height={CHIP_H} rx={8}
                    fill="url(#node-grad)" stroke="rgba(255,255,255,0.15)" strokeWidth={0.6} />
                <image href="/logo.png" x={CX - 22} y={CY - 34} width={44} height={44}
                    style={{ filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.2))' }} />
                <text x={CX} y={CY + 26} textAnchor="middle" fill="rgba(255,255,255,0.85)"
                    fontSize={11} fontWeight={800} letterSpacing={2.5} fontFamily="Inter, sans-serif">Chainvolio</text>
                <g opacity={0.3}>
                    <text x={CX - 50} y={CY + 52} textAnchor="middle" fontSize={6} fontWeight={700} fill="white" opacity={0.5}>Off-chain storage</text>
                    <text x={CX + 50} y={CY + 52} textAnchor="middle" fontSize={6} fontWeight={700} fill="white" opacity={0.5}>On-chain anchor (Solana)</text>
                    <text x={CX} y={CY + 62} textAnchor="middle" fontSize={5} fontWeight={700} fill="white" opacity={0.3} letterSpacing={1}>DATA AVAILABILITY LAYER</text>
                    <line x1={CX-20} y1={CY+42} x2={CX-40} y2={CY+46} stroke="white" strokeWidth={0.5} strokeDasharray="2 2" />
                    <line x1={CX+20} y1={CY+42} x2={CX+40} y2={CY+46} stroke="white" strokeWidth={0.5} strokeDasharray="2 2" />
                </g>
            </motion.g>

            <motion.g initial={{ opacity: 0, x: 18 }} animate={anim({ opacity: 1, x: 0 })} transition={{ delay: 0.5 }}>
                <line x1={CHIP_X + CHIP_W} y1={CY} x2={R_BUS_X} y2={CY}
                    stroke="rgba(255,255,255,0.15)" strokeWidth={2} strokeDasharray="4 4" />
                <g transform={`translate(${CHIP_X + CHIP_W + 8}, ${CY - 10})`}>
                    <rect width={42} height={20} rx={10} fill="url(#node-grad)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
                    <text x={21} y={9} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize={6.5} fontWeight={800}>Scoring</text>
                    <text x={21} y={16} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={4.5}>weighting</text>
                </g>
                <path d={`M ${R_BUS_X - 15} ${CY - 3} L ${R_BUS_X - 10} ${CY} L ${R_BUS_X - 15} ${CY + 3}`} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
                <rect x={CHIP_X + CHIP_W - 4} y={CY - 4} width={8} height={8} fill="rgba(255,255,255,0.18)" rx={1} />
                <rect x={R_BUS_X - 4} y={CY - 4} width={8} height={8} fill="rgba(255,255,255,0.18)" rx={1} />
                <line x1={R_BUS_X} y1={RO_YS[0]} x2={R_BUS_X} y2={RO_YS[RO_YS.length - 1]}
                    stroke="rgba(255,255,255,0.1)" strokeWidth={1.5} strokeDasharray="4 4" />
                {RIGHT_OUTPUTS.map((node, i) => {
                    const row = Math.max(node.label.length * 6.2, node.sub.length * 4.6) + 10;
                    const center_x = R_BUS_X + 12 + row / 2;
                    return (
                        <g key={`ro${i}`}>
                            <line x1={R_BUS_X} y1={RO_YS[i]} x2={R_BUS_X + 12} y2={RO_YS[i]}
                                stroke="rgba(255,255,255,0.1)" strokeWidth={0.75} strokeDasharray="3 5" />
                            <g opacity={active ? 1 : 0}>
                                <circle cx={R_BUS_X} cy={RO_YS[i]} r={1.5} fill="#000" stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
                            </g>
                            <rect x={R_BUS_X + 12} y={RO_YS[i] - 13} width={row} height={26} rx={3}
                                fill="url(#node-grad)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
                            <text x={center_x} y={RO_YS[i] - 1.5} textAnchor="middle"
                                fill="rgba(255,255,255,0.8)" fontSize={8} fontWeight={700}
                                fontFamily="Inter, sans-serif">{node.label}</text>
                            <text x={center_x} y={RO_YS[i] + 7.5} textAnchor="middle"
                                fill="rgba(255,255,255,0.35)" fontSize={6}
                                fontFamily="Inter, sans-serif">{node.sub}</text>
                        </g>
                    );
                })}
                <g transform={`translate(${R_BUS_X + 40}, ${CY + 50})`} opacity={0.6}>
                    <rect x={0} y={0} width={70} height={45} rx={4} fill="none" stroke="rgba(255,255,255,0.08)" strokeDasharray="2 2" />
                    <text x={35} y={10} textAnchor="middle" fill="white" fontSize={5} fontWeight={800} opacity={0.4}>API LAYER</text>
                    <text x={35} y={22} textAnchor="middle" fill="white" fontSize={6} opacity={0.6}>Public API</text>
                    <text x={35} y={32} textAnchor="middle" fill="white" fontSize={6} opacity={0.6}>Verification API</text>
                    <text x={35} y={42} textAnchor="middle" fill="white" fontSize={6} opacity={0.6}>Embed Layer</text>
                </g>
                <path d={`M ${SVW - 150} ${RO_YS[3]} Q ${SVW - 10} ${RO_YS[3]} ${SVW - 10} ${CY} Q ${SVW - 10} 50 ${CX} 50`} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={1} strokeDasharray="5 5" />
                <text x={SVW - 10} y={CY} textAnchor="middle" fill="rgba(255,255,255,0.1)" fontSize={6} transform={`rotate(90, ${SVW - 10}, ${CY})`}>reputation feedback loop</text>
                {active && (
                    <g>
                        <circle cx={R_BUS_X} cy={CY} r={3.5} fill="#000" stroke="rgba(255,255,255,0.4)" strokeWidth={0.8} />
                        <circle cx={R_BUS_X} cy={CY} r={1.5} fill="white" />
                    </g>
                )}
            </motion.g>

            <motion.g initial={{ opacity: 0, y: 18 }} animate={anim({ opacity: 1, y: 0 })} transition={{ delay: 0.6 }}>
                <line x1={CX} y1={CHIP_Y + CHIP_H} x2={CX} y2={MATCH_Y - 18}
                    stroke="rgba(255,255,255,0.15)" strokeWidth={2} strokeDasharray="4 4" />
                <path d={`M ${CX-3} ${MATCH_Y - 45} L ${CX} ${MATCH_Y - 40} L ${CX+3} ${MATCH_Y - 45}`} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
                <rect x={CX - 4} y={CHIP_Y + CHIP_H - 4} width={8} height={8} fill="rgba(255,255,255,0.18)" rx={1} />
                <rect x={CX - 82} y={MATCH_Y - 13} width={164} height={26} rx={3}
                    fill="url(#node-grad)" stroke="rgba(255,255,255,0.12)" strokeWidth={0.5} />
                <text x={CX} y={MATCH_Y} textAnchor="middle"
                    fill="rgba(255,255,255,0.8)" fontSize={8.5} fontWeight={800} letterSpacing={1}
                    fontFamily="Inter, sans-serif">Smart matching</text>
                <text x={CX} y={MATCH_Y + 9} textAnchor="middle"
                    fill="rgba(255,255,255,0.35)" fontSize={6.5} fontFamily="Inter, sans-serif">verified credentials, trusted anywhere</text>
                <line x1={BC_XS[0]} y1={BC_Y - 52} x2={BC_XS[BC_XS.length - 1]} y2={BC_Y - 52}
                    stroke="rgba(255,255,255,0.07)" strokeWidth={1} strokeDasharray="3 6" />
                {CONSUMERS.map((node, i) => {
                    const bcw = Math.max(node.label.length * 6.2, node.sub.length * 4.6) + 10;
                    const bcx = BC_XS[i];
                    return (
                        <g key={`bc${i}`}>
                            <path
                                d={`M ${CX} ${MATCH_Y + 16} L ${CX} ${BC_Y - 52} L ${bcx} ${BC_Y - 52} L ${bcx} ${BC_Y - 13}`}
                                fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1} strokeDasharray="3 6" />
                            <circle cx={bcx} cy={BC_Y - 52} r={1.5} fill="#000" stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
                            <rect x={bcx - bcw / 2} y={BC_Y - 13} width={bcw} height={26} rx={3}
                                fill="url(#node-grad)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
                            <text x={bcx} y={BC_Y - 1.5} textAnchor="middle"
                                fill="rgba(255,255,255,0.8)" fontSize={8.5} fontWeight={800}
                                letterSpacing={1} fontFamily="Inter, sans-serif">{node.label}</text>
                            <text x={bcx} y={BC_Y + 7.5} textAnchor="middle"
                                fill="rgba(255,255,255,0.3)" fontSize={6}
                                fontFamily="Inter, sans-serif">{node.sub}</text>
                        </g>
                    );
                })}
            </motion.g>

            <g opacity={active ? 0.12 : 0} style={{ transition: 'opacity 2.5s ease-in-out' }} pointerEvents="none">
                <text x={340} y={230} fontSize={6} fontWeight={400} letterSpacing={2} fill="white">SIGNAL PROCESSING</text>
                <text x={270} y={300} fontSize={6} fontWeight={400} letterSpacing={2} fill="white">VERIFICATION PIPELINE</text>
                <text x={CX} y={450} textAnchor="middle" fontSize={6} fontWeight={400} letterSpacing={2} fill="white">TRUST COMPUTATION</text>
                <text x={SVW - 30} y={180} textAnchor="end" fontSize={6} fontWeight={400} letterSpacing={2} fill="white">SYSTEM FLOW</text>
                <g fontSize={4.5} fill="white">
                    <text x={VERIFY_X} y={CY + 35}>cryptographic validation enforced</text>
                    <text x={VERIFY_X} y={CY + 42}>hash integrity constraint active</text>
                    <text x={CX + 90} y={INGEST_Y + 10}>multi-source signal aggregation</text>
                    <text x={CX + 90} y={INGEST_Y + 17}>normalized input stream</text>
                    <text x={CHIP_X - 15} y={CHIP_Y - 10} textAnchor="end">trust-minimized architecture</text>
                    <text x={CHIP_X + CHIP_W + 15} y={CHIP_Y - 10} textAnchor="start">non-custodial identity layer</text>
                    <text x={R_BUS_X + 15} y={RO_YS[0] - 15}>deterministic verification</text>
                    <text x={R_BUS_X + 15} y={RO_YS[3] + 25}>portable reputation signal</text>
                </g>
                <g fontSize={4} fill="white" opacity={0.6}>
                    <text x={COL_XS[0] + 5} y={COLLECTOR_Y - 5}>verified input</text>
                    <text x={CX - 25} y={INGEST_Y + INGEST_H + 10}>signed payload</text>
                    <text x={CHIP_X - 15} y={CY - 15} textAnchor="end">hash match</text>
                    <text x={CX} y={CY + 48} textAnchor="middle">anchor reference</text>
                </g>
                <g fontSize={5} fill="white" opacity={0.5} fontFamily="monospace" letterSpacing={0.5}>
                    <text x={50} y={SVH - 80}>[TECHNICAL NOTE 01-A]</text>
                    <text x={50} y={SVH - 70}>All attestations are cryptographically linked to their source.</text>
                    <text x={50} y={SVH - 62}>Any modification invalidates the integrity of the record.</text>
                    <text x={SVW - 50} y={SVH - 85} textAnchor="end">SYSTEM ARCHITECTURE OVERVIEW</text>
                    <text x={SVW - 50} y={SVH - 75} textAnchor="end">ChainVolio operates as a trust-minimized verification layer,</text>
                    <text x={SVW - 50} y={SVH - 67} textAnchor="end">where all professional signals are processed, validated,</text>
                    <text x={SVW - 50} y={SVH - 59} textAnchor="end">and transformed into portable reputation outputs.</text>
                    <text x={SVW - 120} y={CY + 80} textAnchor="end" fontSize={4.5} opacity={0.6}>Outputs are deterministic and verifiable,</text>
                    <text x={SVW - 120} y={CY + 88} textAnchor="end" fontSize={4.5} opacity={0.6}>allowing instant validation without manual checks.</text>
                </g>
                <g fontSize={3.5} fill="white" opacity={0.3} fontWeight={700} letterSpacing={1}>
                    <text x={CX - 40} y={COLLECTOR_Y - 10}>SIGNAL FLOW</text>
                    <text x={VERIFY_X + 20} y={CY - 20}>VERIFICATION PATH</text>
                    <text x={R_BUS_X + 40} y={CY - 20}>TRUSTED OUTPUT</text>
                </g>
                <g fontSize={5} fill="white" opacity={0.3} fontFamily="monospace">
                    <text x={50} y={SVH - 30}>// System guarantees consistency under partial trust conditions</text>
                </g>
            </g>

        </svg>
    );
}
