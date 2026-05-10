"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
    Github,
    Linkedin,
    Slack,
    Trello,
    Figma,
    Triangle,
    Database,
    MessageSquare,
    Mail,
    FileText,
    Palette,
    ArrowDown
} from "lucide-react";

const ICON_SIZE = 18;

// Accurate symbols using Lucide
const PDFIcon = () => (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2h11l5 5v15H4z" />
        <text x="6" y="16" fontSize="7" fontWeight="900" fill="currentColor" stroke="none">PDF</text>
    </svg>
);
const GoogleDriveIcon = Triangle;
const DiscordIcon = MessageSquare;
const CanvaIcon = Palette;
const GmailIcon = Mail;

const SOURCE_ICONS = [
    { icon: Linkedin, x: 120, y: 150 },
    { icon: Github, x: 180, y: 165 },
    { icon: PDFIcon, x: 110, y: 210 },
    { icon: Slack, x: 165, y: 220 },
    { icon: Figma, x: 220, y: 210 },
    { icon: GoogleDriveIcon, x: 100, y: 275 },
    { icon: Trello, x: 155, y: 285 },
    { icon: DiscordIcon, x: 210, y: 275 },
    { icon: CanvaIcon, x: 140, y: 345 },
    { icon: GmailIcon, x: 200, y: 345 },
];

const QUESTIONS = [
    { text: "Who shipped this?", x: 450, y: 160, anchorY: 220, duration: 5, delay: 0 },
    { text: "Can this be verified?", x: 650, y: 150, anchorY: 220, duration: 7, delay: 2 },
    { text: "Real contributor?", x: 420, y: 340, anchorY: 280, duration: 6, delay: 1 },
    { text: "Self claimed", x: 550, y: 380, anchorY: 280, duration: 8, delay: 3 },
    { text: "Where is the proof?", x: 680, y: 330, anchorY: 280, duration: 5.5, delay: 0.5 },
];

export default function ProblemDiagram() {
    const W = 1100;
    const H = 400; // Reduced height to crop empty space
    const col1X = 170;
    const col2X = 550;
    const col3X = 930;

    const waveCount = 18;
    const chaosEndX = 820;

    const resultDots = useMemo(() => {
        const dots = [];
        // Increase total dots for much higher density
        for (let i = 0; i < 2200; i++) {
            const angle = Math.random() * Math.PI * 2;

            // Higher power (3.0) concentrates much more dots near the center for a "core" effect
            const rFactor = Math.pow(Math.random(), 3.0);

            // Core density adjustment: inner 20px are much more packed
            const rBase = 5 + rFactor * 75;

            dots.push({
                x: Math.cos(angle) * rBase,
                y: Math.sin(angle) * rBase,
                // Central dots are slightly more varied in size
                size: (rFactor < 0.1 ? 0.3 : 0.1) + Math.random() * 0.8,
                // Opacity also higher in center
                opacity: (0.15 + Math.random() * 0.4) * (1 - rFactor * 0.8)
            });
        }
        return dots;
    }, []);

    const chaosDots = useMemo(() => {
        const dots = [];
        for (let i = 0; i < 60; i++) {
            dots.push({
                id: i,
                x: 350 + Math.random() * 450,
                y: 100 + Math.random() * 300,
                size: 0.5 + Math.random() * 1.5,
                duration: 2 + Math.random() * 4,
                delay: Math.random() * 5
            });
        }
        return dots;
    }, []);

    const paths = useMemo(() => {
        const results = [];
        for (let i = 0; i < waveCount; i++) {
            const src = SOURCE_ICONS[i % SOURCE_ICONS.length];
            const amplitudeBase = 70 + (i % 4) * 15 + Math.random() * 20;
            const frequency = 1.0 + (i % 3) * 0.4;
            const phase = i * (Math.PI / 4);

            // 1. DYNAMIC CROSSING START (Tightened)
            // Each path enters at a staggered X to avoid the "gate" look
            const chaosStartX = 290 + Math.random() * 60;
            const chaosWidth = chaosEndX - chaosStartX;

            // Tightened spread: cross closer to the center without merging
            let targetY;
            if (src.y < 250) {
                targetY = 245 + Math.random() * 40; // Dip slightly below center
            } else {
                targetY = 215 + Math.random() * 40; // Rise slightly above center
            }

            let d = `M ${src.x + 10} ${src.y}`;

            // Controlled organic curves for the crossing phase
            const cp1x = src.x + 60 + Math.random() * 30;
            const cp2x = chaosStartX - 60 - Math.random() * 30;
            d += ` C ${cp1x} ${src.y}, ${cp2x} ${targetY}, ${chaosStartX} ${targetY}`;

            const steps = 12;
            const stepSize = chaosWidth / steps;
            for (let j = 0; j < steps; j++) {
                const x1 = chaosStartX + j * stepSize;
                const x2 = chaosStartX + (j + 1) * stepSize;
                const envelope = Math.sin((j / steps) * Math.PI);
                const currentAmp = amplitudeBase * envelope;
                const angle1 = (j / steps) * Math.PI * 2 * frequency + phase;
                const angle2 = ((j + 1) / steps) * Math.PI * 2 * frequency + phase;
                const y1 = 250 + Math.sin(angle1) * currentAmp;
                const y2 = 250 + Math.sin(angle2) * currentAmp;
                const cp1_x = x1 + stepSize * 0.5;
                const cp2_x = x2 - stepSize * 0.5;
                d += ` C ${cp1_x} ${y1}, ${cp2_x} ${y2}, ${x2} ${y2}`;
            }

            // 3. SPIRAL ABSORPTION (Circle around the galaxy core)
            const ringAngle = (i / waveCount) * Math.PI * 2;
            const radius = 60 + Math.random() * 20; // Tightened radius to match new galaxy size
            const targetEndX = col3X + Math.cos(ringAngle) * radius;
            const targetEndY = 250 + Math.sin(ringAngle) * radius;

            // Add a spiral segment that circles around the core
            const spiralRotation = Math.PI * (0.6 + Math.random() * 0.4); // 100-180 degree wrap
            const spiralEndX = col3X + Math.cos(ringAngle + spiralRotation) * (radius * 0.5);
            const spiralEndY = 250 + Math.sin(ringAngle + spiralRotation) * (radius * 0.5);

            // Connect chaos wave to the spiral start
            d += ` C ${chaosEndX + 100} ${250}, ${col3X - 80} ${targetEndY}, ${targetEndX} ${targetEndY}`;

            // Add the wrapping arc (using a quadratic curve as a simple spiral approximation)
            const midAngle = ringAngle + spiralRotation * 0.5;
            const cpX = col3X + Math.cos(midAngle) * radius * 1.3;
            const cpY = 250 + Math.sin(midAngle) * radius * 1.3;
            d += ` Q ${cpX} ${cpY}, ${spiralEndX} ${spiralEndY}`;

            const tracers = [];
            for (let t = 0; t < 5; t++) {
                tracers.push({
                    id: t,
                    length: 350 + Math.random() * 450,
                    duration: 14 + Math.random() * 10,
                    delay: t * 3 + Math.random() * 2.5,
                    strokeWidth: 0.4 + Math.random() * 0.6,
                    opacity: 0.1 + Math.random() * 0.15
                });
            }

            const dotsOnPath = [];
            for (let d = 0; d < 2; d++) {
                const progress = 0.2 + Math.random() * 0.6; // Stay in the wave area
                const dotX = chaosStartX + progress * chaosWidth;
                const envelope = Math.sin(progress * Math.PI);
                const currentAmp = amplitudeBase * envelope;
                const angle = progress * Math.PI * 2 * frequency + phase;
                const dotY = 250 + Math.sin(angle) * currentAmp;

                // Avoid collision with floating questions
                const isTooClose = QUESTIONS.some(q => {
                    const dx = dotX - q.x;
                    const dy = dotY - q.y;
                    return Math.sqrt(dx * dx + dy * dy) < 60; // 60px safe zone
                });

                if (!isTooClose) {
                    dotsOnPath.push({
                        id: d,
                        x: dotX,
                        y: dotY,
                        size: 0.5 + Math.random() * 1.5,
                        duration: 2 + Math.random() * 4,
                        delay: Math.random() * 5
                    });
                }
            }

            results.push({ id: i, d, tracers, dotsOnPath });
        }
        return results;
    }, []);

    return (
        <div className="w-full relative pt-0 pb-0 overflow-hidden bg-transparent select-none">
            <svg
                viewBox="0 30 1100 370"
                className="w-full h-auto overflow-visible"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    <filter id="cinematicGlow">
                        <feGaussianBlur stdDeviation="1.2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="bloomEffect">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>

                    <filter id="tracerGlow">
                        <feGaussianBlur stdDeviation="1.2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>

                    <linearGradient id="cloudAbsorption" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="white" />
                        <stop offset="60%" stopColor="white" />
                        <stop offset="85%" stopColor="white" stopOpacity="0.3" />
                        <stop offset="95%" stopColor="black" />
                    </linearGradient>
                    <mask id="signalMask" maskUnits="userSpaceOnUse">
                        <rect x="0" y="0" width={W} height={H} fill="url(#cloudAbsorption)" />
                    </mask>
                </defs>

                {/* --- Narrative Stage Labels --- */}
                <g style={{ opacity: 0.8 }}>
                    <g transform={`translate(${col1X}, 40)`} textAnchor="middle">
                        <text fill="white" fontSize="13" fontWeight="700">Your work</text>
                        <text y="18" fill="white" fontSize="10" opacity="0.4" fontWeight="400">Everywhere</text>
                        <foreignObject x="-6" y="24" width="12" height="12">
                            <ArrowDown size={12} className="text-white/20" />
                        </foreignObject>
                    </g>

                    <g transform={`translate(${col2X}, 40)`} textAnchor="middle">
                        <text fill="white" fontSize="13" fontWeight="700">Proof gets lost</text>
                        <text y="18" fill="white" fontSize="10" opacity="0.4" fontWeight="400">In the noise</text>
                        <foreignObject x="-6" y="24" width="12" height="12">
                            <ArrowDown size={12} className="text-white/20" />
                        </foreignObject>
                    </g>

                    <g transform={`translate(${col3X}, 40)`} textAnchor="middle">
                        <text fill="white" fontSize="13" fontWeight="700">Result</text>
                        <text y="18" fill="white" fontSize="10" opacity="0.4" fontWeight="400">No reliable way to trust</text>
                        <foreignObject x="-6" y="24" width="12" height="12">
                            <ArrowDown size={12} className="text-white/20" />
                        </foreignObject>
                    </g>
                </g>

                {/* --- Static Guide Lines --- */}
                <g opacity="0.08">
                    {paths.map((p) => (
                        <path key={`g-${p.id}`} d={p.d} fill="none" stroke="white" strokeWidth="0.5" />
                    ))}
                </g>

                {/* --- Animated Signal Trails (Smooth Glowing) --- */}
                <g filter="url(#tracerGlow)" mask="url(#signalMask)">
                    {paths.map((path) => (
                        <g key={`s-${path.id}`}>
                            {path.tracers.map((tracer) => (
                                <motion.path
                                    key={`tr-${path.id}-${tracer.id}`}
                                    d={path.d}
                                    fill="none"
                                    stroke="white"
                                    strokeWidth={tracer.strokeWidth * 1.5}
                                    strokeLinecap="round"
                                    initial={{
                                        strokeDasharray: `${tracer.length} 3500`,
                                        strokeDashoffset: tracer.length,
                                        opacity: 0
                                    }}
                                    animate={{
                                        strokeDashoffset: -3500,
                                        opacity: [0, tracer.opacity * 1.2, tracer.opacity * 1.2, 0]
                                    }}
                                    transition={{
                                        duration: tracer.duration * 0.8,
                                        repeat: Infinity,
                                        delay: tracer.delay,
                                        ease: "linear"
                                    }}
                                />
                            ))}

                            {/* Dots anchored to this specific path */}
                            {path.dotsOnPath.map((dot) => (
                                <motion.circle
                                    key={`dot-${path.id}-${dot.id}`}
                                    cx={dot.x}
                                    cy={dot.y}
                                    r={dot.size * 1.2}
                                    fill="white"
                                    initial={{ opacity: 0 }}
                                    animate={{
                                        opacity: [0, 0.6, 0],
                                        scale: [0.7, 1.4, 0.7]
                                    }}
                                    transition={{
                                        duration: dot.duration,
                                        repeat: Infinity,
                                        delay: dot.delay,
                                        ease: "easeInOut"
                                    }}
                                />
                            ))}
                        </g>
                    ))}
                </g>

                {/* --- Result Target (Hollow Ring Zone) --- */}
                <g transform={`translate(${col3X}, 250)`}>
                    {/* Atmospheric Glow in the empty center */}
                    <motion.circle
                        r="25"
                        fill="rgba(255,255,255,0.03)"
                        filter="url(#bloomEffect)"
                        animate={{
                            opacity: [0.05, 0.2, 0.05],
                            scale: [0.9, 1.2, 0.9]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />

                    <motion.g
                        animate={{ rotate: 360 }}
                        transition={{ duration: 160, repeat: Infinity, ease: "linear" }}
                    >
                        {resultDots.map((dot, i) => (
                            <motion.circle
                                key={`d-${i}`}
                                cx={dot.x}
                                cy={dot.y}
                                r={dot.size}
                                fill="white"
                                initial={{ opacity: dot.opacity * 1.5 }}
                                animate={i % 5 === 0 ? {
                                    opacity: [dot.opacity * 1.2, dot.opacity * 2.5, dot.opacity * 1.2],
                                    scale: [1, 1.5, 1]
                                } : {}}
                                transition={{
                                    duration: 3 + (i % 4),
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: (i % 10) * 0.2
                                }}
                            />
                        ))}
                    </motion.g>
                </g>

                {/* --- Floating Question Labels --- */}
                <g>
                    {QUESTIONS.map((q, i) => (
                        <motion.g
                            key={`l-${i}`}
                            initial={{ opacity: 0, y: 0 }}
                            animate={{
                                opacity: [0.4, 0.9, 0.4],
                                y: [0, -6, 0]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: q.duration,
                                delay: 0.8 + i * 0.1 + q.delay,
                                ease: "easeInOut"
                            }}
                        >
                            <line
                                x1={q.x} y1={q.y + 12} x2={q.x} y2={q.anchorY}
                                stroke="white" strokeWidth="0.5" strokeDasharray="1 3" opacity="0.1"
                            />
                            <rect
                                x={q.x - 55} y={q.y - 11} width="110" height="22" rx="6"
                                fill="white" stroke="rgba(0,0,0,0.1)" strokeWidth="1"
                                className="shadow-sm"
                            />
                            <text
                                x={q.x} y={q.y + 4} textAnchor="middle"
                                fill="black" fontSize="8.5" fontWeight="500" opacity="1"
                                letterSpacing="0.02em"
                            >
                                {q.text}
                            </text>
                        </motion.g>
                    ))}
                </g>

                {/* --- Source Icons with Pulse --- */}
                {SOURCE_ICONS.map((src, i) => (
                    <g key={`src-wrapper-${i}`} transform={`translate(${src.x - 20}, ${src.y - 20})`}>
                        <motion.g
                            initial={{ opacity: 0.9, scale: 1 }}
                            animate={{
                                scale: [1, 1.03, 1],
                                opacity: [0.7, 1, 0.7]
                            }}
                            whileHover={{ scale: 1.15 }}
                            transition={{
                                repeat: Infinity,
                                duration: 4.5,
                                delay: i * 0.5,
                                ease: "easeInOut"
                            }}
                            className="cursor-pointer group/icon"
                        >
                            <rect
                                width="40" height="40" rx="12"
                                fill="white"
                                stroke="rgba(0,0,0,0.1)"
                                strokeWidth="1"
                            />
                            <foreignObject x="11" y="11" width={ICON_SIZE} height={ICON_SIZE}>
                                <div className="flex items-center justify-center h-full text-black pointer-events-none">
                                    <src.icon size={ICON_SIZE} strokeWidth={1.5} />
                                </div>
                            </foreignObject>
                        </motion.g>
                    </g>
                ))}
            </svg>
        </div>
    );
}
