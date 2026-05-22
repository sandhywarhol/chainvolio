"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
    Github,
    Linkedin,
    Slack,
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
const GoogleDriveIcon = () => (
    <img src="/logos/google drive.svg" width={ICON_SIZE} height={ICON_SIZE} alt="Google Drive" className="brightness-0" />
);
const DiscordIcon = MessageSquare;
const BehanceIcon = () => (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.969 16.927a2.561 2.561 0 0 0 1.901.677 2.501 2.501 0 0 0 1.531-.475c.362-.235.636-.584.779-.99h2.585a5.091 5.091 0 0 1-1.9 2.896 5.292 5.292 0 0 1-3.091.88 5.839 5.839 0 0 1-2.284-.433 4.871 4.871 0 0 1-1.723-1.211 5.657 5.657 0 0 1-1.08-1.874 7.057 7.057 0 0 1-.383-2.393c-.005-.8.129-1.595.396-2.349a5.313 5.313 0 0 1 5.088-3.604 4.87 4.87 0 0 1 2.376.563c.661.362 1.231.87 1.668 1.485a6.2 6.2 0 0 1 .943 2.133c.194.821.263 1.666.205 2.508h-7.699c-.063.79.184 1.574.688 2.187ZM6.947 4.084a8.065 8.065 0 0 1 1.928.198 4.29 4.29 0 0 1 1.49.638c.418.303.748.711.958 1.182.241.579.357 1.203.341 1.83a3.506 3.506 0 0 1-.506 1.961 3.726 3.726 0 0 1-1.503 1.287 3.588 3.588 0 0 1 2.027 1.437c.464.747.697 1.615.67 2.494a4.593 4.593 0 0 1-.423 2.032 3.945 3.945 0 0 1-1.163 1.413 5.114 5.114 0 0 1-1.683.807 7.135 7.135 0 0 1-1.928.259H0V4.084h6.947Zm-.235 12.9c.308.004.616-.029.916-.099a2.18 2.18 0 0 0 .766-.332c.228-.158.411-.371.534-.619.142-.317.208-.663.191-1.009a2.08 2.08 0 0 0-.642-1.715 2.618 2.618 0 0 0-1.696-.505h-3.54v4.279h3.471Zm13.635-5.967a2.13 2.13 0 0 0-1.654-.619 2.336 2.336 0 0 0-1.163.259 2.474 2.474 0 0 0-.738.62 2.359 2.359 0 0 0-.396.792c-.074.239-.12.485-.137.734h4.769a3.239 3.239 0 0 0-.679-1.785l-.002-.001Zm-13.813-.648a2.254 2.254 0 0 0 1.423-.433c.399-.355.607-.88.56-1.413a1.916 1.916 0 0 0-.178-.891 1.298 1.298 0 0 0-.495-.533 1.851 1.851 0 0 0-.711-.274 3.966 3.966 0 0 0-.835-.073H3.241v3.631h3.293v-.014ZM21.62 5.122h-5.976v1.527h5.976V5.122Z"/>
    </svg>
);
const CanvaIcon = () => (
    <img src="/logos/canva.svg" width={ICON_SIZE} height={ICON_SIZE} alt="Canva" className="brightness-0" />
);
const GmailIcon = Mail;
const DropboxIcon = () => (
    <img src="/logos/dropbox.svg" width={ICON_SIZE} height={ICON_SIZE} alt="Dropbox" className="brightness-0" />
);
const NotionIcon = () => (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
    </svg>
);

const SOURCE_ICONS = [
    { icon: Linkedin, x: 126, y: 165 },
    { icon: Github, x: 177, y: 178 },
    { icon: PDFIcon, x: 118, y: 216 },
    { icon: Slack, x: 164, y: 225 },
    { icon: Figma, x: 211, y: 216 },
    { icon: GoogleDriveIcon, x: 109, y: 271 },
    { icon: NotionIcon, x: 156, y: 280 },
    { icon: BehanceIcon, x: 203, y: 271 },
    { icon: CanvaIcon, x: 143, y: 331 },
    { icon: DropboxIcon, x: 194, y: 331 },
];

const QUESTIONS = [
    { text: "Who shipped this?", x: 430, y: 160, anchorY: 220, duration: 5, delay: 0 },
    { text: "Who can verify this?", x: 550, y: 110, anchorY: 220, duration: 6.5, delay: 1.5 },
    { text: "Is this authentic?", x: 670, y: 160, anchorY: 220, duration: 7, delay: 2 },
    { text: "Real contributor?", x: 400, y: 340, anchorY: 280, duration: 6, delay: 1 },
    { text: "Trusted by who?", x: 550, y: 390, anchorY: 280, duration: 7.5, delay: 2.5 },
    { text: "Where is the proof?", x: 700, y: 330, anchorY: 280, duration: 5.5, delay: 0.5 },
    { text: "Trust disappears", x: 930, y: 330, anchorY: 250, duration: 8, delay: 0 },
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

            let d = `M ${src.x + 15} ${src.y}`;

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

                    {/* Icon card: multi-layer drop shadow */}
                    <filter id="iconDrop" x="-80%" y="-80%" width="260%" height="260%">
                        <feFlood floodColor="rgba(0,0,0,0.75)" result="f1" />
                        <feComposite in="f1" in2="SourceAlpha" operator="in" result="s1" />
                        <feOffset dx="0" dy="6" in="s1" result="o1" />
                        <feGaussianBlur stdDeviation="5" in="o1" result="b1" />
                        <feFlood floodColor="rgba(0,0,0,0.45)" result="f2" />
                        <feComposite in="f2" in2="SourceAlpha" operator="in" result="s2" />
                        <feOffset dx="0" dy="2" in="s2" result="o2" />
                        <feGaussianBlur stdDeviation="2" in="o2" result="b2" />
                        <feMerge>
                            <feMergeNode in="b1" />
                            <feMergeNode in="b2" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    {/* Soft ambient glow blur */}
                    <filter id="softBlur" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation="5" />
                    </filter>
                    {/* Icon face: radial gradient — top-left light source */}
                    <radialGradient id="iconFace" cx="35%" cy="22%" r="75%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="55%" stopColor="#f0f0f8" />
                        <stop offset="100%" stopColor="#d4d4e4" />
                    </radialGradient>
                    {/* Question bubble: subtle warm tint */}
                    <radialGradient id="bubbleFace" cx="50%" cy="10%" r="80%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#ebebf5" />
                    </radialGradient>
                    {/* Bubble drop shadow */}
                    <filter id="bubbleDrop" x="-60%" y="-60%" width="220%" height="220%">
                        <feFlood floodColor="rgba(0,0,0,0.55)" result="f1" />
                        <feComposite in="f1" in2="SourceAlpha" operator="in" result="s1" />
                        <feOffset dx="0" dy="4" in="s1" result="o1" />
                        <feGaussianBlur stdDeviation="4" in="o1" result="b1" />
                        <feMerge>
                            <feMergeNode in="b1" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    {/* Icon area spotlight */}
                    <radialGradient id="iconAreaLight" cx="50%" cy="40%" r="55%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.055)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </radialGradient>

                    <linearGradient id="cloudAbsorption" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="white" />
                        <stop offset="60%" stopColor="white" />
                        <stop offset="85%" stopColor="white" stopOpacity="0.3" />
                        <stop offset="95%" stopColor="black" />
                    </linearGradient>
                    <mask id="signalMask" maskUnits="userSpaceOnUse">
                        <rect x="0" y="0" width={W} height={H} fill="url(#cloudAbsorption)" />
                    </mask>
                    <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
                        <stop offset="80%" stopColor="#94a3b8" stopOpacity="0.02" />
                        <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
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
                        <text fill="white" fontSize="13" fontWeight="700">Self Claimed</text>
                        <text y="18" fill="white" fontSize="10" opacity="0.4" fontWeight="400">No verifiable proof</text>
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
                            {/* Bubble shadow layer */}
                            <rect
                                x={q.x - 55} y={q.y - 9} width="110" height="22" rx="6"
                                fill="rgba(0,0,0,0.5)" filter="url(#softBlur)" opacity="0.6"
                            />
                            {/* Bubble body */}
                            <rect
                                x={q.x - 55} y={q.y - 11} width="110" height="22" rx="6"
                                fill="url(#bubbleFace)"
                                stroke="rgba(255,255,255,0.35)" strokeWidth="0.6"
                            />
                            {/* Top specular highlight */}
                            <rect
                                x={q.x - 48} y={q.y - 10} width="96" height="7" rx="5"
                                fill="rgba(255,255,255,0.55)"
                            />
                            <text
                                x={q.x} y={q.y + 4} textAnchor="middle"
                                fill="rgba(10,10,18,0.9)" fontSize="8.5" fontWeight="600"
                                letterSpacing="0.02em"
                            >
                                {q.text}
                            </text>
                        </motion.g>
                    ))}
                </g>

                {SOURCE_ICONS.map((src, i) => (
                    <g key={`src-wrapper-${i}`} transform={`translate(${src.x - 15}, ${src.y - 15})`}>
                        <motion.g
                            initial={{ opacity: 0.9, scale: 1 }}
                            animate={{
                                scale: [1, 1.04, 1],
                                opacity: [0.75, 1, 0.75]
                            }}
                            whileHover={{ scale: 1.18 }}
                            transition={{
                                repeat: Infinity,
                                duration: 4 + i * 0.3,
                                delay: i * 0.45,
                                ease: "easeInOut"
                            }}
                            className="cursor-pointer"
                        >
                            {/* Soft ambient glow behind card */}
                            <ellipse cx="15" cy="26" rx="13" ry="5"
                                fill="rgba(255,255,255,0.22)" filter="url(#softBlur)" />
                            {/* Card body — gradient face */}
                            <rect width="30" height="30" rx="9"
                                fill="url(#iconFace)"
                                filter="url(#iconDrop)"
                            />
                            {/* Top specular highlight — simulates directional light from above */}
                            <rect x="2" y="2" width="26" height="9" rx="7"
                                fill="rgba(255,255,255,0.5)" />
                            {/* Subtle border */}
                            <rect width="30" height="30" rx="9"
                                fill="none"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="0.7"
                            />
                            <foreignObject x="3" y="3" width="24" height="24">
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
