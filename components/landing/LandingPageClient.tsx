"use client";

// Force re-compile: v2-floating-card
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
    ArrowRight, 
    ArrowUpRight, 
    CheckCircle2, 
    Shield, 
    ShieldCheck,
    Users, 
    Zap, 
    Flame, 
    Wallet,
    FileText,
    Target,
    Building2,
    LayoutDashboard,
    FolderOpen,
    Lock,
    Award,
    Globe,
    Github,
    Terminal,
    ExternalLink
} from 'lucide-react';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import { CustomWalletModal } from "@/components/wallet/CustomWalletModal";
import { Toast } from "@/components/ui/Toast";
import { isRecruiterTier } from "@/lib/paymentConfig";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

// --- Static UI Mockup for Feature Card ---
function MockProfileUI() {
    return (
        <div className="w-full h-full bg-[#080808] flex border border-white/5 rounded-2xl overflow-hidden shadow-2xl font-sans text-sm">
            {/* 1. Sidebar (Linear Style) */}
            <div className="w-64 border-r border-white/5 bg-white/[0.01] p-6 flex flex-col gap-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 p-0.5">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Avatar" className="w-full h-full object-cover rounded-lg grayscale" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-white/90 tracking-tight">Alex Rivera</span>
                        <span className="text-[10px] text-white/30 uppercase tracking-widest font-black">Member</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    {[
                        { icon: LayoutDashboard, label: "Overview", active: true },
                        { icon: ShieldCheck, label: "Verifications" },
                        { icon: FolderOpen, label: "Collections" },
                        { icon: Terminal, label: "Activity" }
                    ].map((item, i) => (
                        <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${item.active ? 'bg-white/5 text-white' : 'text-white/40 hover:bg-white/[0.02] hover:text-white/60'}`}>
                            <item.icon className={`w-4 h-4 ${item.active ? 'text-amber-400' : ''}`} />
                            <span className="text-[11px] font-bold uppercase tracking-widest">{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div className="pt-6 border-t border-white/5">
                    <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Trust Signal</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-[11px] font-bold text-white/70">Score: 98</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Main Content Area */}
            <div className="flex-1 flex flex-col bg-[#0a0a0a] overflow-hidden">
                {/* Content Header */}
                <div className="h-14 border-b border-white/5 px-8 flex items-center justify-between bg-white/[0.01]">
                    <div className="flex items-center gap-4">
                        <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Active Grants</span>
                        <div className="w-[1px] h-4 bg-white/5"></div>
                        <span className="text-[11px] font-bold text-white/80">NX-2703</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 uppercase tracking-widest">In Progress</div>
                    </div>
                </div>

                {/* Main Body - Fixed Size, No Scroll */}
                <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                        <h4 className="text-2xl font-bold text-white tracking-tight leading-tight">Nexus Protocol Grant #882</h4>
                        <p className="text-white/40 text-sm leading-relaxed max-w-2xl">
                            Core systems development and parallel transaction processing optimization for the Nexus mainnet infrastructure.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Detailed Activity</span>
                        <div className="space-y-3">
                            {[
                                "Built staking contract module using Anchor framework",
                                "Integrated Core optimization for Lumina mainnet nodes",
                                "Reduced transaction latency by 30% through parallel processing"
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-colors">
                                    <div className="mt-0.5 flex-shrink-0">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
                                    </div>
                                    <span className="text-[12px] text-white/60 font-medium leading-none">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-4">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Verified Attestations</span>
                        <div className="flex flex-wrap gap-4">
                            {[
                                { name: "Lumina", color: "bg-blue-500" },
                                { name: "Apex Guild", color: "bg-orange-500" }
                            ].map((org, i) => (
                                <div key={i} className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                                    <div className={`w-2 h-2 rounded-full ${org.color}`}></div>
                                    <span className="text-[11px] font-bold text-white/80">{org.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Meta */}
                <div className="h-12 border-t border-white/5 px-8 flex items-center justify-between opacity-30 bg-white/[0.01]">
                    <div className="flex gap-6">
                        <code className="text-[10px] font-mono text-white/60 tracking-tighter">SIG: 5k2R...j8Wq</code>
                        <span className="text-[10px] text-white/40 font-mono tracking-tighter">2025-03-24 14:02 UTC</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-white/60">
                        View Proof <ExternalLink className="w-3 h-3" />
                    </div>
                </div>
            </div>

        </div>
    );
}

// --- Real-world Attestation Preview UI ---
function AttestationPreviewUI() {
    return (
        <div className="w-full h-full bg-[#080808] p-8 flex flex-col justify-center items-center relative overflow-hidden group">
            {/* Ambient Background Aura */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            
            {/* The Verification Card */}
            <div className="relative w-full max-w-[340px] aspect-[1.4/1] rounded-2xl bg-[#0c0c0d] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 flex flex-col justify-between overflow-hidden group/card hover:border-violet-500/30 transition-all duration-500">
                {/* Security Hologram Effect */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-500/10 blur-[60px] rounded-full pointer-events-none group-hover/card:bg-violet-500/20 transition-colors"></div>
                
                {/* Header */}
                <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center shadow-inner">
                            <Award className="w-5 h-5 text-violet-400" />
                        </div>
                        <div className="space-y-0.5">
                            <h4 className="text-sm font-bold text-white/90">Solana Foundation</h4>
                            <p className="text-[10px] text-white/30 font-medium">Official Issuer</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest">Verified</span>
                        <span className="text-[7px] font-mono text-white/20">#882-SF-CV</span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-3 relative z-10">
                    <div className="h-[1px] w-full bg-white/5"></div>
                    <div className="space-y-1">
                        <h5 className="text-base font-bold text-white tracking-tight leading-tight">Infrastructure Partnership Program Grant</h5>
                        <p className="text-[10px] text-white/40 font-medium italic">"Exceptional contribution to the Solana core ecosystem development and RPC infrastructure."</p>
                    </div>
                </div>

                {/* Footer / Meta */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="space-y-0.5">
                            <p className="text-[8px] text-white/20 uppercase tracking-widest font-bold">Issued Date</p>
                            <p className="text-[9px] text-white/60 font-mono">MAR 24, 2026</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 group-hover/card:bg-violet-500/10 transition-colors">
                        <ShieldCheck className="w-3 h-3 text-violet-400" />
                        <span className="text-[9px] font-bold text-violet-400/80">On-Chain Proof</span>
                    </div>
                </div>

                {/* Visual Polish: Scanning line animation */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent animate-[scan_3s_linear_infinite] pointer-events-none"></div>
            </div>

            {/* Background Details */}
            <div className="mt-12 flex items-center gap-8 opacity-20">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                        <Lock className="w-3 h-3" />
                    </div>
                    <span className="text-[8px] uppercase tracking-widest">Encrypted</span>
                </div>
                <div className="h-[1px] w-12 bg-white/10"></div>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                        <Globe className="w-3 h-3" />
                    </div>
                    <span className="text-[8px] uppercase tracking-widest">Immutable</span>
                </div>
            </div>
        </div>
    );
}

// --- Mobile UI Mockup for Feature Card ---
// --- Floating Feature Card (Overlay) ---
function FloatingVerificationCard() {
    return (
        <div className="w-[340px] bg-[#0c0c0c]/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col font-sans">
            {/* Card Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-emerald-500/5">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Verified Proof</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
            
            {/* Card Body */}
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 p-0.5">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Avatar" className="w-full h-full object-cover rounded grayscale" />
                    </div>
                    <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-white">Alex Rivera</h4>
                        <p className="text-[10px] text-white/30 font-medium">Nexus Protocol • Grant #882</p>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-white/20 uppercase">On-Chain Attestation</span>
                        <CheckCircle2 className="w-3 h-3 text-emerald-500/60" />
                    </div>
                    <p className="text-[11px] text-white/70 font-medium leading-relaxed">
                        Technical contribution verified by Lumina Systems core infrastructure audit team.
                    </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Hash ID</span>
                        <code className="text-[9px] text-emerald-400/60 font-mono">0x4f2d...9b1a</code>
                    </div>
                    <div className="w-12 h-12 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-dashed border-white/10 rounded"></div>
                    </div>
                </div>
            </div>

            {/* Bottom Glow */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-30"></div>
        </div>
    );
}

// --- Recruiter Dashboard Preview UI V2 ---
function RecruiterDashboardPreviewUI_V2() {
    return (
        <div className="w-full h-full bg-[#0a0b0f] p-6 flex flex-col gap-6 relative overflow-hidden group">
            {/* Ambient Background Aura (Matching OrgDashboard) */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, #10b98110 0%, transparent 60%)` }} />
            
            {/* Header Section */}
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white tracking-tight">Recruiter Dashboard</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Operations</p>
                    </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Verified Org</span>
                </div>
            </div>

            {/* Impact Pods (3-column mini version) */}
            <div className="grid grid-cols-3 gap-3 relative z-10">
                {[
                    { icon: LayoutDashboard, label: "Hiring", val: "12", col: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { icon: ShieldCheck, label: "Signals", val: "142", col: "text-blue-400", bg: "bg-blue-500/10" },
                    { icon: FolderOpen, label: "Active", val: "4", col: "text-purple-400", bg: "bg-purple-500/10" },
                ].map((pod, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                        <div className={`w-6 h-6 flex items-center justify-center rounded-lg ${pod.bg}`}>
                            <pod.icon className={`w-3 h-3 ${pod.col}`} />
                        </div>
                        <div>
                            <p className="text-lg font-black text-white leading-none">{pod.val}</p>
                            <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500">{pod.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Candidate List Preview */}
            <div className="flex-1 space-y-3 relative z-10">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Top Candidates with Proven Signals</p>
                <div className="space-y-2">
                    {[
                        { name: "Alex Rivera", role: "Infra @ Solana", signals: 8 },
                        { name: "Sarah Chen", role: "Smart Contract Dev", signals: 5 },
                    ].map((c, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white/[0.01] border border-white/5 flex items-center justify-between group/row hover:bg-white/[0.03] transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-white/40">
                                    {c.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h5 className="text-[11px] font-bold text-white/80">{c.name}</h5>
                                    <p className="text-[9px] text-slate-500">{c.role}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-violet-500/5 border border-violet-500/10">
                                <ShieldCheck className="w-2.5 h-2.5 text-violet-400" />
                                <span className="text-[9px] font-bold text-violet-400">{c.signals}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Glow */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#0a0b0f] to-transparent pointer-events-none"></div>
        </div>
    );
}

const SLIDES = [
    { src: "/homepage/image%20slide%202/cv%20view2.png?v=2", label: "Professional Profile" },
    { src: "/homepage/image%20slide%202/dashboard%202.png?v=2", label: "Recruiter dashboard" },
    { src: "/homepage/image%20slide%202/edit%20profile%202.png?v=2", label: "Profile customization" },
    { src: "/homepage/image%20slide%202/proof%20of%20work%202.png?v=2", label: "Verifiable work" },
    { src: "/homepage/image%20slide%202/apply.png?v=2", label: "Talent application" },
    { src: "/homepage/image%20slide%202/attestation.png?v=2", label: "On-chain attestations" },
    { src: "/homepage/image%20slide%202/status.png?v=2", label: "Verification status" },
];

// PARTNERS are now loaded dynamically from /api/logos


function CryptoLogo({ src, name }: { src: string; name: string }) {
    return (
        <div className="flex-shrink-0 flex items-center gap-2.5 group/logo cursor-default">
            <div className="h-4 flex items-center justify-center">
                <img
                    src={src}
                    alt={name}
                    className="max-h-full w-auto object-contain transition-all duration-700 opacity-50 grayscale brightness-[0.6] group-hover/logo:opacity-100 group-hover/logo:grayscale-0 group-hover/logo:brightness-110"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                    }}
                />
            </div>
            <span className="text-[9px] font-bold text-white/20 group-hover/logo:text-white/60 transition-all duration-500 tracking-[0.2em] whitespace-nowrap uppercase">
                {name}
            </span>
        </div>
    );
}

export function LandingPageClient() {
    const { publicKey, connected } = useWallet();
    const { orgAccount: googleOrgAccount, isGoogleSignedIn } = useGoogleAuth();
    const [profile, setProfile] = useState<any>(null);
    const [activeModal, setActiveModal] = useState<'how' | 'recruiters' | 'talent' | 'ask' | 'screening' | 'attestation' | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [partners, setPartners] = useState<{ src: string; name: string; scale?: number }[]>([]);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "warning" } | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const modal = searchParams.get('modal');
        if (modal === 'how') {
            router.push('/guides/how-it-works');
            return;
        }
        if (modal === 'recruiters' || modal === 'talent' || modal === 'ask' || modal === 'screening' || modal === 'attestation') {
            setActiveModal(modal as any);
        }
    }, [searchParams, router]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!connected || !publicKey) {
            setProfile(null);
            return;
        }
        const wallet = publicKey.toBase58();
        fetch(`/api/user/me?wallet=${wallet}`)
            .then((r) => r.json())
            .then((data) => setProfile(data))
            .catch(() => setProfile(null));
    }, [publicKey, connected]);

    useEffect(() => {
        fetch('/api/logos')
            .then(r => r.json())
            .then(data => setPartners(data))
            .catch(err => console.error('Error fetching logos:', err));
    }, []);

    return (
        <div className="min-h-screen flex flex-col relative selection:bg-teal-500/30 selection:text-white">
            <Navbar
                isVerified={!!profile?.isVerified}
                verifierTier={profile?.verifierTier}
                verificationTier={profile?.verificationTier}
                onHowItWorksClick={() => router.push('/guides/how-it-works')}
                onRecruitersClick={() => setActiveModal('recruiters')}
                onTalentClick={() => setActiveModal('talent')}
                onAskClick={() => setActiveModal('ask')}
                onScreeningClick={() => router.push('/guides/screening')}
                onAttestationClick={() => router.push('/guides/attestation')}
            />

            <main className="flex-1 flex flex-col relative overflow-hidden bg-black">
                {/* Background Video */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <video 
                        autoPlay 
                        muted 
                        loop 
                        playsInline 
                        className="w-full h-full object-cover opacity-30"
                    >
                        <source src="/video-background.mp4" type="video/mp4" />
                    </video>
                    {/* Dark Overlay for readability */}
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>

                {/* Background Glows */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-glow-purple opacity-20 blur-[120px] pointer-events-none"></div>
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-glow-teal opacity-10 blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-glow-purple opacity-10 blur-[120px] pointer-events-none"></div>

                {/* HERO SECTION */}
                <section className="relative pt-32 pb-20 px-6 z-10 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md mb-8 group transition-all hover:border-emerald-500/20 hover:bg-emerald-500/[0.02]">
                        <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] whitespace-nowrap bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent opacity-80">
                            Trust Layer for Web3
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-[88px] font-bold tracking-[-0.04em] leading-[1.05] mb-8 text-white max-w-5xl">
                        Verifiable identity<br />
                        <span className="bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">for Web3 careers.</span>
                    </h1>

                    <p className="text-white/40 text-lg md:text-xl font-medium max-w-2xl mb-12 leading-relaxed">
                        Build a work history that can’t be faked. <br className="hidden md:block" />
                        Backed by on-chain proof and attestations.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
                        <button
                            onClick={() => setIsWalletModalOpen(true)}
                            className="premium-shimmer-button w-full sm:w-auto px-10 py-4 bg-white text-black font-bold text-base rounded-2xl hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                        >
                            Build Your Reputation
                        </button>
                        <button
                            onClick={() => router.push('/hiring/create')}
                            className="w-full sm:w-auto px-10 py-4 bg-white/[0.05] hover:bg-white/[0.08] text-white font-bold text-base rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
                        >
                            Discover Talent <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* HERO VISUAL - Idealized Dashboard Mockup */}
                    <div className="relative w-full max-w-[1200px] mx-auto perspective-1000 group">
                        <div className="relative rounded-[32px] border border-white/10 bg-white/[0.02] backdrop-blur-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] transform transition-transform duration-1000 hover:scale-[1.01]">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
                            <div className="aspect-[16/9] relative">
                                {SLIDES.map((slide, index) => (
                                    <div 
                                        key={index}
                                        className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                                            index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
                                        }`}
                                    >
                                        <Image
                                            src={slide.src}
                                            alt={slide.label}
                                            fill
                                            className="object-cover object-top"
                                            priority={index === 0}
                                        />
                                    </div>
                                ))}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
                            </div>
                        </div>

                        {/* Slide Caption Below Image */}
                        <div className="mt-8 h-6 relative w-full flex justify-center">
                            {SLIDES.map((slide, index) => (
                                <p 
                                    key={index} 
                                    className={`absolute text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 transition-all duration-700 ${
                                        index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
                                    }`}
                                >
                                    {slide.label}
                                </p>
                            ))}
                        </div>

                        {/* Glow behind visual */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 to-emerald-500/10 blur-3xl -z-10 rounded-[40px] opacity-50"></div>
                    </div>

                    <div className="mt-32 w-full max-w-[1200px]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 mb-12">
                            Powering the Web3 career stack
                        </p>
                        <div className="w-full py-4 overflow-hidden relative" style={{ maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)' }}>
                            <div className="flex animate-marquee whitespace-nowrap items-center w-max">
                                {[...partners, ...partners].map((partner, i) => (
                                    <div key={`${partner.name}-${i}`} className="flex items-center mx-12 grayscale opacity-20 hover:grayscale-0 hover:opacity-80 transition-all duration-500 cursor-default group/partner">
                                        <img
                                            src={partner.src}
                                            alt={partner.name}
                                            className="h-6 w-auto object-contain transition-transform group-hover/partner:scale-110"
                                            style={{ transform: partner.scale ? `scale(${partner.scale})` : 'none' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* THE PROBLEM SECTION */}
                <section className="py-32 px-6 relative z-10 border-t border-white/[0.02] bg-black">
                    <div className="max-w-[1240px] mx-auto">
                        <div className="text-center mb-24 space-y-4">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                                Your work is real. Your proof isn’t.
                            </h2>
                            <p className="text-white/40 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                                Hiring runs on claims, not proof. There is no reliable way to verify real work.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3">
                            {/* Card 1 */}
                            <div className="space-y-12 group pr-16 pb-16 md:pb-0">
                                <div className="h-[300px] relative flex items-center justify-center">
                                     <Image
                                        src="/homepage/Broken%20Work%20History.png"
                                        alt="Broken Work History"
                                        fill
                                        className="object-contain transition-all duration-700 opacity-100 group-hover:scale-105"
                                     />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-white font-bold text-xl">Broken Work History</h3>
                                    <p className="text-white/40 text-base leading-relaxed">
                                        Your experience is scattered across PDFs, portfolios, and links — with no single source of truth.
                                    </p>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="space-y-12 group px-16 border-l border-white/[0.05] pb-16 md:pb-0">
                                <div className="h-[300px] relative flex items-center justify-center">
                                     <Image
                                        src="/homepage/Unverifiable%20Resumes.png"
                                        alt="Unverifiable Resumes"
                                        fill
                                        className="object-contain transition-all duration-700 opacity-100 group-hover:scale-105"
                                     />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-white font-bold text-xl">Unverifiable Resumes</h3>
                                    <p className="text-white/40 text-base leading-relaxed">
                                        Without verifiable data, resumes become claims — not proof.
                                    </p>
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="space-y-12 group pl-16 border-l border-white/[0.05]">
                                <div className="h-[300px] relative flex items-center justify-center">
                                     <Image
                                        src="/homepage/Signal%20Lost%20in%20Noise%20(2).png"
                                        alt="Signal Lost in Noise"
                                        fill
                                        className="object-contain transition-all duration-700 opacity-100 group-hover:scale-105"
                                     />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-white font-bold text-xl">Signal Lost in Noise</h3>
                                    <p className="text-white/40 text-base leading-relaxed">
                                        As a result, real talent gets buried — and hiring becomes guesswork.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-20 text-center">
                            <Link href="#solution" className="text-sm font-medium text-white/20 hover:text-white/60 transition-colors inline-flex items-center gap-2 group">
                                See how ChainVolio solves this <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </section>


                {/* THE SOLUTION SECTION */}
                <section className="py-32 px-6 relative z-10 bg-gradient-to-b from-black via-black to-[#030303] border-t border-white/[0.02] overflow-hidden">
                    {/* Large Section-level Bottom Fade */}
                    <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-black to-transparent pointer-events-none z-30"></div>
                    
                    <div className="max-w-[1200px] mx-auto relative">
                        <div className="text-center mb-20 space-y-6 max-w-3xl mx-auto">
                            <h2 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-4 block">THE SOLUTION</h2>
                            <h3 className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-tight mb-8">
                                Build a reputation <br className="hidden md:block" /> that travels.
                            </h3>
                            <div className="space-y-3">
                                <p className="text-white/80 text-xl md:text-2xl font-medium tracking-tight">
                                    Turn your work into verifiable proof that anyone can trust.
                                </p>
                                <p className="text-white/30 text-lg font-medium">
                                    Transparent, portable, and impossible to fake.
                                </p>
                            </div>
                        </div>

                        {/* Main Solution Card */}
                        <div className="relative z-10 space-y-12">
                            {/* 1. The Text Card - Now standalone */}
                            <div className="relative p-12 md:p-16 space-y-6 bg-[#030303] border border-white/5 rounded-[32px] overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-50"></div>
                                
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8">
                                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <h4 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-6">Verifiable Work History</h4>
                                    <p className="text-white/40 text-lg md:text-xl leading-relaxed font-medium max-w-3xl mb-8">
                                        Every contribution is backed by on-chain attestations — not PDFs or claims. <br className="hidden md:block" />
                                        Recruiters can verify your work instantly, without manual checks.
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-4">
                                        <div className="px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">On-Chain Proof</div>
                                        <div className="px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] text-[10px] font-bold uppercase tracking-widest text-blue-400/80">Instant Verification</div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. The UI Mockup - Desktop + Mobile Overlay */}
                            <div className="relative h-[650px] w-full flex items-center justify-center">
                                {/* Ambient Glow */}
                                <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] rounded-full opacity-30"></div>
                                
                                <div className="relative w-full h-full group">
                                    {/* Desktop Card */}
                                    <div className="w-full h-full rounded-[32px] border border-white/10 bg-[#050505] shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-700 group-hover:border-white/20">
                                        <MockProfileUI />
                                    </div>

                                    {/* Floating Verification Card - Tacked on the Right & Stacked */}
                                    <div className="absolute -right-4 md:-right-8 top-1/4 z-40 transition-all duration-1000 group-hover:translate-y-[-15px] group-hover:translate-x-6 group-hover:rotate-2">
                                        <div className="[perspective:1500px]">
                                            <div className="shadow-[0_40px_80px_rgba(0,0,0,0.7)] rounded-2xl [transform:rotateY(-8deg)rotateX(2deg)]">
                                                <FloatingVerificationCard />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PRODUCT SECTION */}
                <section className="py-32 px-6 relative z-10 bg-[#030303] overflow-hidden">
                    <div className="max-w-[1200px] mx-auto space-y-48">
                        
                        {/* BLOCK 1 — ATTESTATION */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center"
                        >
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Core Feature</span>
                                    <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                                        Proof of work, <br />not claims.
                                    </h3>
                                    <p className="text-white/40 text-lg leading-relaxed font-medium max-w-lg">
                                        Attestations turn real contributions into verifiable records. Every endorsement is cryptographically signed, creating a transparent and trusted work history.
                                    </p>
                                </div>
                                <ul className="space-y-4 text-white/60 text-sm font-medium">
                                    <li className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40"></div>
                                        Verifiable on-chain proof
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40"></div>
                                        Issued by real collaborators
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40"></div>
                                        Public and tamper-resistant
                                    </li>
                                </ul>
                                <Link href="/why" className="inline-flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors group">
                                    Explore attestations <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                            
                            <div className="relative group">
                                <div className="absolute inset-0 bg-emerald-500/5 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                                <div className="relative aspect-[4/3] rounded-3xl border border-white/5 bg-[#080808] overflow-hidden shadow-2xl">
                                    <AttestationPreviewUI />
                                </div>
                            </div>
                        </motion.div>

                        {/* Divider Text */}
                        <div className="flex items-center justify-center gap-8 opacity-20">
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white"></div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.5em] whitespace-nowrap">From proof to hiring decisions</span>
                            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white"></div>
                        </div>

                        {/* BLOCK 2 — HIRING */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center"
                        >
                            <div className="relative group order-2 lg:order-1">
                                <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                                <div className="relative aspect-[4/3] rounded-3xl border border-white/5 bg-[#0a0b0f] overflow-hidden shadow-2xl">
                                    <RecruiterDashboardPreviewUI_V2 />
                                </div>
                            </div>

                            <div className="space-y-8 order-1 lg:order-2">
                                <div className="space-y-4">
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Use Case</span>
                                    <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                                        Hire based on real proof, <br />not profiles.
                                    </h3>
                                    <p className="text-white/40 text-lg leading-relaxed font-medium max-w-lg">
                                        Discover talent through verified work history and trusted signals. Filter noise and identify candidates with real, proven contributions.
                                    </p>
                                </div>
                                <ul className="space-y-4 text-white/60 text-sm font-medium">
                                    <li className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40"></div>
                                        Filter by verified contributions
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40"></div>
                                        See who endorsed the candidate
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40"></div>
                                        Reduce hiring guesswork
                                    </li>
                                </ul>
                                <Link href="/hiring/create" className="inline-flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors group">
                                    Discover talent <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* 5. FINAL CTA */}
                <section className="py-48 px-4 md:px-8 border-t border-white/[0.02] bg-gradient-to-b from-transparent to-white/[0.01]">
                    <div className="max-w-[800px] mx-auto text-center">
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tighter leading-[1.1]">
                            Start building your <br />
                            <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">verifiable profile.</span>
                        </h2>
                        <p className="text-white/40 text-base mb-12 max-w-lg mx-auto leading-relaxed font-light">
                            Turn your work into proof — visible, trusted, and easy to share.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                             <button
                                onClick={() => setIsWalletModalOpen(true)}
                                className="premium-shimmer-button w-full sm:w-auto px-10 py-4 bg-white text-black font-bold text-base rounded-2xl hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                            >
                                Create Your Profile
                            </button>
                            <Link
                                href="/hiring/create"
                                className="w-full sm:w-auto px-10 py-4 bg-white/[0.05] hover:bg-white/[0.08] text-white font-bold text-base rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
                            >
                                Explore Talent <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>
                <Footer />
            </main>

            <CustomWalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {activeModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-3 sm:p-8" onClick={() => setActiveModal(null)}>
                    <div className="relative border border-white/20 rounded-sm max-w-3xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden group" onClick={(e) => e.stopPropagation()}>
                        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-70"><source src="/box%20navigation.mp4" type="video/mp4" /></video>
                        <div className="relative z-10 p-5 sm:p-8 md:p-12 bg-black/40 backdrop-blur-sm max-h-[90vh] sm:max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-white/40 hover:text-white/90 transition-colors text-2xl z-20">×</button>
                            {activeModal === 'recruiters' && (
                                <div className="space-y-16 py-4">
                                    <div className="space-y-4">
                                        <h2 className="text-xl md:text-3xl font-bold tracking-tight text-white uppercase">For Recruiters</h2>
                                        <p className="text-white/40 text-sm max-w-xl leading-relaxed">
                                            ChainVolio provides verifiable hiring infrastructure that reduces information asymmetry and enables transparent candidate evaluation through an accountable, on-chain recruitment trail.
                                        </p>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-12 pt-8">
                                        <div className="space-y-8">
                                            <h3 className="text-[10px] font-bold text-teal-400/60 uppercase tracking-[0.3em]">Strategic Value</h3>
                                            <div className="space-y-6">
                                                <div className="flex gap-4 items-start">
                                                    <span className="text-teal-400/40 font-bold mt-0.5">/</span>
                                                    <div className="space-y-1">
                                                        <h4 className="text-[10px] font-bold uppercase text-white/90">Web3 Talent</h4>
                                                        <p className="text-[11px] text-white/50 leading-relaxed">Access wallet-native professional records and review on-chain work history with proven output.</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 items-start">
                                                    <span className="text-teal-400/40 font-bold mt-0.5">/</span>
                                                    <div className="space-y-1">
                                                        <h4 className="text-[10px] font-bold uppercase text-white/90">Instant Review</h4>
                                                        <p className="text-[11px] text-white/50 leading-relaxed">Evaluate high-signal professional ledgers in a standardized, verifiable format to reduce due-diligence friction.</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 items-start">
                                                    <span className="text-teal-400/40 font-bold mt-0.5">/</span>
                                                    <div className="space-y-1">
                                                        <h4 className="text-[10px] font-bold uppercase text-white/90">Automated Integrity</h4>
                                                        <p className="text-[11px] text-white/50 leading-relaxed">Leverage gas-backed peer attestations to maintain a permanent, cryptographic hiring audit trail.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-8">
                                            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Key Benefits</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Verifiable decisions</p>
                                                </div>
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Transparent accountability</p>
                                                </div>
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Signal-dense data</p>
                                                </div>
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Institutional trust</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'talent' && (
                                <div className="space-y-16 py-4">
                                    <div className="space-y-4">
                                        <h2 className="text-xl md:text-3xl font-bold tracking-tight text-white uppercase">For Talent</h2>
                                        <p className="text-white/40 text-sm max-w-xl leading-relaxed">
                                            Establish a wallet-bound professional record and participate in a public trust infrastructure that ensures long-term career persistence outside of centralized platforms.
                                        </p>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-12 pt-8">
                                        <div className="space-y-8">
                                            <h3 className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.3em]">Advantage</h3>
                                            <div className="space-y-6">
                                                <div className="flex gap-4 items-start">
                                                    <span className="text-emerald-400/40 font-bold mt-0.5">/</span>
                                                    <div className="space-y-1">
                                                        <h4 className="text-[10px] font-bold uppercase text-white/90">Sovereign Identity</h4>
                                                        <p className="text-[11px] text-white/50 leading-relaxed">Self-custodied wallet authentication with no centralized account dependency. Interoperable and permissionless.</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 items-start">
                                                    <span className="text-emerald-400/40 font-bold mt-0.5">/</span>
                                                    <div className="space-y-1">
                                                        <h4 className="text-[10px] font-bold uppercase text-white/90">Showcase Output</h4>
                                                        <p className="text-[11px] text-white/50 leading-relaxed">Anchor contributions as verifiable records and prioritize provable output over narrative claims via timestamped proof.</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 items-start">
                                                    <span className="text-emerald-400/40 font-bold mt-0.5">/</span>
                                                    <div className="space-y-1">
                                                        <h4 className="text-[10px] font-bold uppercase text-white/90">Reputation Hub</h4>
                                                        <p className="text-[11px] text-white/50 leading-relaxed">Unified professional ledger providing a verifiable identity surface compatible with Web3 grants and DAOs.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-8">
                                            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Why it matters</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Wallet-Native Identity</p>
                                                </div>
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Cryptographic Proof</p>
                                                </div>
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Self-Sovereign Data</p>
                                                </div>
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Borderless Verifiability</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'ask' && (
                                <div className="space-y-16 py-4">
                                    <div className="space-y-4">
                                        <h2 className="text-xl md:text-3xl font-bold tracking-tight text-white uppercase">Sourcing</h2>
                                        <p className="text-white/40 text-sm max-w-md">Eliminate the friction of static files. Request live, verified links to capture higher signal talent.</p>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-12 pt-8">
                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.3em]">The Shift</h3>
                                            <div className="space-y-4">
                                                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-sm">
                                                    <p className="text-[10px] text-white/20 uppercase mb-3 text-[10px] tracking-[0.2em]">Traditional Query</p>
                                                    <p className="text-sm text-white/40 font-light">"Please attach your CV as a PDF."</p>
                                                </div>
                                                <div className="p-6 bg-emerald-400/[0.03] border border-emerald-400/10 rounded-sm">
                                                    <p className="text-[10px] text-emerald-400/40 uppercase mb-3 text-[10px] tracking-[0.2em]">Native Query</p>
                                                    <p className="text-sm text-emerald-400/90 font-medium">"Drop your ChainVolio link."</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Operational Value</h3>
                                            <div className="space-y-5 text-xs text-white/60">
                                                <div className="flex gap-4">
                                                    <span className="text-emerald-400/40 font-bold">/</span>
                                                    <p className="font-light leading-relaxed">Direct access to verified work history without logins.</p>
                                                </div>
                                                <div className="flex gap-4">
                                                    <span className="text-emerald-400/40 font-bold">/</span>
                                                    <p className="font-light leading-relaxed">Unified view of portfolio, code, and peer proof.</p>
                                                </div>
                                                <div className="flex gap-4">
                                                    <span className="text-emerald-400/40 font-bold">/</span>
                                                    <p className="font-light leading-relaxed">Signal-rich screening for global, remote pipelines.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* HOW TO SOURCE SECTION */}
                                    <div className="space-y-8 pt-12 border-t border-white/5">
                                        <h3 className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.3em]">HOW TO SOURCE WITH CHAINVOLIO</h3>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {/* Step 1 */}
                                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-sm space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Step 1</span>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[11px] font-bold uppercase text-white/90 mb-1">Define Signal, Not CV</h4>
                                                    <p className="text-[10px] text-white/40 leading-relaxed font-light">Shift from resumes to verifiable signals such as on-chain work, GitHub activity, and attestations.</p>
                                                </div>
                                            </div>

                                            {/* Step 2 */}
                                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-sm space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Step 2</span>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[11px] font-bold uppercase text-white/90 mb-1">Create Hiring Link</h4>
                                                    <p className="text-[10px] text-white/40 leading-relaxed font-light">Create a role-specific hiring link with defined requirements and signal expectations.</p>
                                                </div>
                                            </div>

                                            {/* Step 3 */}
                                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-sm space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Step 3</span>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[11px] font-bold uppercase text-white/90 mb-1">Ask for ChainVolio Link</h4>
                                                    <p className="text-[10px] text-white/40 leading-relaxed font-light">Replace "Send your CV" with "Drop your ChainVolio link".</p>
                                                </div>
                                            </div>

                                            {/* Step 4 */}
                                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Step 4</span>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[11px] font-bold uppercase text-white/90 mb-1">Evaluate Real Work</h4>
                                                    <p className="text-[10px] text-white/40 leading-relaxed font-light">Review verified history, contributions, and attestations instead of self-claimed experience.</p>
                                                </div>
                                            </div>

                                            {/* Step 5 */}
                                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Step 5</span>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[11px] font-bold uppercase text-white/90 mb-1">Hire with Confidence</h4>
                                                    <p className="text-[10px] text-white/40 leading-relaxed font-light">Make decisions based on transparent, verifiable data instead of assumptions.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-white/5 flex justify-end">
                                        <Link href="/guides/sourcing" className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/60 hover:text-emerald-400 flex items-center gap-2 group transition-colors">
                                            View full guide
                                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'screening' && (
                                <div className="space-y-16 py-4">
                                    <div className="space-y-4"><h2 className="text-xl md:text-3xl font-bold tracking-tight text-white uppercase">Screening Protocol</h2><p className="text-white/40 text-sm max-w-md">Efficient evaluation of Web3 talent requires a shift from credentials to contributions.</p></div>
                                    <div className="grid gap-12">
                                        <section className="grid md:grid-cols-[1fr,2fr] gap-8 items-start"><h3 className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.2em] pt-1">01 Authority</h3><div className="space-y-3"><p className="text-sm text-white/90 font-medium">Prioritize attested history.</p><p className="text-xs text-white/40 leading-relaxed font-light">Focus on records verified by founders or collaborators. These represent social capital anchored in real output.</p></div></section>
                                        <section className="grid md:grid-cols-[1fr,2fr] gap-8 items-start border-t border-white/5 pt-12"><h3 className="text-[10px] font-bold text-blue-400/60 uppercase tracking-[0.2em] pt-1">02 Substance</h3><div className="space-y-3"><p className="text-sm text-white/90 font-medium">Evaluate work, not titles.</p><p className="text-xs text-white/40 leading-relaxed font-light">Web3 roles are fluid. Look for high-frequency contributions and consistency across multiple milestones.</p></div></section>
                                    </div>

                                    {/* SIGNAL INTERPRETATION FRAMEWORK */}
                                    <div className="space-y-8 pt-12 border-t border-white/5">
                                        <h3 className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.3em]">SIGNAL INTERPRETATION FRAMEWORK</h3>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {/* 01 Authority Signal */}
                                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-sm space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-[10px] font-bold uppercase text-white/90 leading-tight">01, Authority Signal (Trust Layer)</h4>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-[10px] text-white/40 leading-relaxed font-light">Prioritize attested history. Focus on records verified by founders, organizations, or collaborators.</p>
                                                    <div className="pt-3 border-t border-white/5 space-y-2">
                                                        <p className="text-[8px] text-emerald-400/40 uppercase tracking-widest font-black">Map to:</p>
                                                        <ul className="space-y-1">
                                                            <li className="text-[9px] text-white/50 flex items-center gap-2"><span className="w-1 h-1 bg-white/10 rounded-full" /> Authority rate</li>
                                                            <li className="text-[9px] text-white/50 flex items-center gap-2"><span className="w-1 h-1 bg-white/10 rounded-full" /> Institutional trust</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 02 Signal Density */}
                                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-sm space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-[10px] font-bold uppercase text-white/90 leading-tight">02, Signal Density (Consistency)</h4>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-[10px] text-white/40 leading-relaxed font-light">Evaluate consistency of output. Look for multiple proofs and continuous activity over time.</p>
                                                    <div className="pt-3 border-t border-white/5 space-y-2">
                                                        <p className="text-[8px] text-emerald-400/40 uppercase tracking-widest font-black">Map to:</p>
                                                        <ul className="space-y-1">
                                                            <li className="text-[9px] text-white/50 flex items-center gap-2"><span className="w-1 h-1 bg-white/10 rounded-full" /> Signal density</li>
                                                            <li className="text-[9px] text-white/50 flex items-center gap-2"><span className="w-1 h-1 bg-white/10 rounded-full" /> Proof count</li>
                                                            <li className="text-[9px] text-white/50 flex items-center gap-2"><span className="w-1 h-1 bg-white/10 rounded-full" /> Timeline activity</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 03 Portfolio Authority */}
                                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-sm space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-[10px] font-bold uppercase text-white/90 leading-tight">03, Portfolio Authority (Depth)</h4>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-[10px] text-white/40 leading-relaxed font-light">Assess quality and credibility of work. Distinguish between attested and non-attested outputs.</p>
                                                    <div className="pt-3 border-t border-white/5 space-y-2">
                                                        <p className="text-[8px] text-emerald-400/40 uppercase tracking-widest font-black">Map to:</p>
                                                        <ul className="space-y-1">
                                                            <li className="text-[9px] text-white/50 flex items-center gap-2"><span className="w-1 h-1 bg-white/10 rounded-full" /> Portfolio authority</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 04 Strategic Fit */}
                                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-sm space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-[10px] font-bold uppercase text-white/90 leading-tight">04, Strategic Fit (Context Match)</h4>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-[10px] text-white/40 leading-relaxed font-light">Match candidate signals with role requirements and contribution relevance.</p>
                                                    <div className="pt-3 border-t border-white/5 space-y-2">
                                                        <p className="text-[8px] text-emerald-400/40 uppercase tracking-widest font-black">Map to:</p>
                                                        <ul className="space-y-1">
                                                            <li className="text-[9px] text-white/50 flex items-center gap-2"><span className="w-1 h-1 bg-white/10 rounded-full" /> Strategic fit</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 05 Confidence Score */}
                                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-sm space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-[10px] font-bold uppercase text-white/90 leading-tight">05, Confidence Score (Decision Layer)</h4>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-[10px] text-white/40 leading-relaxed font-light">Use combined signals to determine hiring confidence (High / Medium / Low).</p>
                                                    <div className="pt-3 border-t border-white/5 space-y-2">
                                                        <p className="text-[8px] text-emerald-400/40 uppercase tracking-widest font-black">Map to:</p>
                                                        <ul className="space-y-1">
                                                            <li className="text-[9px] text-white/50 flex items-center gap-2"><span className="w-1 h-1 bg-white/10 rounded-full" /> Signal confidence indicator</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-white/5 flex justify-end">
                                        <Link href="/guides/screening" className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/60 hover:text-emerald-400 flex items-center gap-2 group transition-colors">
                                            View full guide
                                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'attestation' && (
                                <div className="space-y-16 py-4">
                                    <div className="space-y-4"><h2 className="text-xl md:text-3xl font-bold tracking-tight text-white uppercase">Proof Standards</h2><p className="text-white/40 text-sm max-w-md">Cryptographic validation of professional experience in a decentralized market.</p></div>
                                    <div className="grid md:grid-cols-2 gap-16">
                                        <div className="space-y-8"><h3 className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.3em]">The Attestation Primitive</h3><p className="text-sm text-white/70 leading-relaxed font-light">An attestation is a work record confirmed by a secondary party.</p></div>
                                        <div className="space-y-8"><h3 className="text-[10px] font-bold text-blue-400/60 uppercase tracking-[0.3em]">Recruiter Insights</h3><div className="p-8 bg-white/[0.02] border border-white/5 rounded-sm space-y-8"><div className="flex justify-between items-end border-b border-white/5 pb-4"><div className="space-y-1"><span className="text-[8px] text-white/20 uppercase tracking-widest">Signal Type</span><p className="text-xs text-white/90">Attested Work</p></div></div><p className="text-xs text-white/40 leading-relaxed italic font-light">"Verification reduces screening noise."</p></div></div>
                                    </div>

                                    {/* HOW ATTESTATION WORKS */}
                                    <div className="space-y-8 pt-12 border-t border-white/5">
                                        <h3 className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.3em]">HOW ATTESTATION WORKS</h3>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                                            {/* Step 1 */}
                                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-sm space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Step 01</span>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[9px] font-black uppercase text-white/90 mb-1">Create Proof of Work</h4>
                                                    <p className="text-[9px] text-white/40 leading-relaxed font-light">Candidate creates a verifiable work record inside ChainVolio.</p>
                                                </div>
                                            </div>

                                            {/* Step 2 */}
                                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-sm space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Step 02</span>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[9px] font-black uppercase text-white/90 mb-1">Generate Link</h4>
                                                    <p className="text-[9px] text-white/40 leading-relaxed font-light">System generates a unique, shareable verification link.</p>
                                                </div>
                                            </div>

                                            {/* Step 3 */}
                                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-sm space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Step 03</span>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[9px] font-black uppercase text-white/90 mb-1">Send to Verifier</h4>
                                                    <p className="text-[9px] text-white/40 leading-relaxed font-light">Link sent to a founder, client, or manager.</p>
                                                </div>
                                            </div>

                                            {/* Step 4 */}
                                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-sm space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Step 04</span>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[9px] font-black uppercase text-white/90 mb-1">Attestation Issued</h4>
                                                    <p className="text-[9px] text-white/40 leading-relaxed font-light">Verifier reviews and confirms the work signal.</p>
                                                </div>
                                            </div>

                                            {/* Step 5 */}
                                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-sm space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Step 05</span>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[9px] font-black uppercase text-white/90 mb-1">Anchored On-Chain</h4>
                                                    <p className="text-[9px] text-white/40 leading-relaxed font-light">Permanently recorded on-chain as verifiable proof.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECONDARY SECTIONS */}
                                    <div className="grid md:grid-cols-2 gap-16 pt-12 border-t border-white/5">
                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-bold text-teal-400/60 uppercase tracking-[0.3em]">VERIFICATION ECONOMICS</h3>
                                            <div className="space-y-4">
                                                <div className="flex gap-4">
                                                    <span className="text-teal-400/40 font-bold text-[10px]">/</span>
                                                    <p className="text-[10px] text-white/50 leading-relaxed font-light">Attestations are paid by the verifier (not the candidate), creating a strong signal of trust and commitment.</p>
                                                </div>
                                                <div className="flex gap-4">
                                                    <span className="text-teal-400/40 font-bold text-[10px]">/</span>
                                                    <p className="text-[10px] text-white/50 leading-relaxed font-light">This economic model ensures attestations are meaningful and eliminates inflationary or spam endorsements.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">WHY IT MATTERS</h3>
                                            <div className="space-y-4">
                                                <div className="flex gap-4">
                                                    <span className="text-emerald-400/40 font-bold text-[10px]">/</span>
                                                    <p className="text-[10px] text-white/50 leading-relaxed font-light">Eliminates fake portfolios by anchoring outputs to a cryptographic professional audit trail.</p>
                                                </div>
                                                <div className="flex gap-4">
                                                    <span className="text-emerald-400/40 font-bold text-[10px]">/</span>
                                                    <p className="text-[10px] text-white/50 leading-relaxed font-light">Converts unverified claims into verifiable professional signals, enabling trust without narrative CV dependency.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-white/5 flex justify-end">
                                        <Link href="/guides/attestation" className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/60 hover:text-emerald-400 flex items-center gap-2 group transition-colors">
                                            View full guide
                                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
