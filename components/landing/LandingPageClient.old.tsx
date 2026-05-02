"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Flame } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import { Wallet } from "lucide-react";
import { CustomWalletModal } from "@/components/wallet/CustomWalletModal";
import { Toast } from "@/components/ui/Toast";
import { isRecruiterTier } from "@/lib/paymentConfig";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

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

            <main className="flex-1 flex flex-col relative">

                {/* DESKTOP LAYOUT (HIDDEN ON MOBILE) */}
                <div className="hidden md:flex flex-col flex-1 relative">

                <section className="flex-1 max-w-[1240px] w-full mx-auto px-12 relative z-40 flex flex-col lg:flex-row items-center justify-between pt-32 pb-12 gap-16">
                    <div className="text-left max-w-4xl lg:w-[70%]">
                        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md mb-8 group transition-all hover:border-emerald-500/20 hover:bg-emerald-500/[0.02]">
                            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] whitespace-nowrap bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent opacity-50">Trust Layer for Web3 Career</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-[72px] font-extrabold font-display leading-[1.05] tracking-tight mb-8 text-white">
                            Verifiable identity<br />
                            for Web3.
                        </h1>
                        <div className="mb-16">
                            <p className="text-white/80 text-lg md:text-xl font-medium font-display leading-relaxed max-w-xl tracking-normal">
                                Build a work history that canΓÇÖt be faked.<br />
                                Backed by on-chain proof and attestations.
                            </p>
                        </div>
                        {/* Detect recruiter context */}
                        {(() => {
                            // Google recruiter: signed in with Google
                            const isGoogleRecruiter = isGoogleSignedIn;
                            // Wallet recruiter: connected wallet and org-tier profile
                            const isWalletRecruiter = connected && !!publicKey && !!profile && isRecruiterTier(profile.verificationTier);
                            const isRecruiter = isGoogleRecruiter || isWalletRecruiter;

                            const orgType = googleOrgAccount?.org_type
                                ?? (profile?.verificationTier?.toLowerCase().includes("company") ? "company" : "community");
                            const isCommunityOrg = orgType === "community";

                            // Public page URL for recruiter
                            const orgPageUrl = isGoogleRecruiter
                                ? `/dashboard`
                                : publicKey ? `/cv/${publicKey.toBase58()}` : `/dashboard`;

                            return (
                                <div className="flex flex-col sm:flex-row items-center justify-start gap-4">
                                    {/* Left button */}
                                    {isRecruiter ? (
                                        <Link
                                            href={orgPageUrl}
                                            className="premium-shimmer-button w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white font-bold text-base whitespace-nowrap rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(20,241,149,0.15)]"
                                        >
                                            {isCommunityOrg ? "View Your Community" : "View Your Company"}
                                        </Link>
                                    ) : connected && publicKey ? (
                                        <Link
                                            href={`/cv/${publicKey.toBase58()}`}
                                            className="premium-shimmer-button w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white font-bold text-base whitespace-nowrap rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(20,241,149,0.15)]"
                                        >
                                            View Your CV
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => setIsWalletModalOpen(true)}
                                            className="premium-shimmer-button w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white font-bold text-base whitespace-nowrap rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(20,241,149,0.15)]"
                                        >
                                            Build Your Reputation
                                        </button>
                                    )}

                                    {/* Right button */}
                                    {isRecruiter ? (
                                        <Link
                                            href="/hiring/create"
                                            className="w-full sm:w-auto px-8 py-3.5 bg-[#121214]/50 hover:bg-[#1a1a1f] text-white font-bold text-base whitespace-nowrap rounded-2xl border border-white/5 transition-all flex items-center justify-center gap-2"
                                        >
                                            Discover Talent <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                if (!connected) {
                                                    setIsWalletModalOpen(true);
                                                    return;
                                                }
                                                router.push("/hiring/create");
                                            }}
                                            className="w-full sm:w-auto px-8 py-3.5 bg-[#121214]/50 hover:bg-[#1a1a1f] text-white font-bold text-base whitespace-nowrap rounded-2xl border border-white/5 transition-all flex items-center justify-center gap-2"
                                        >
                                            Discover Talent <ArrowRight className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            );
                        })()}
                        
                        <div className="mt-24">
                            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20">
                                Powering the Web3 career stack
                            </p>
                        </div>
                    </div>

                    <div className="lg:w-[45%] w-full relative group lg:-mt-24" style={{ perspective: '2000px' }}>
                        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl transition-transform duration-700 ease-out group-hover:rotate-y-[-15deg] group-hover:rotate-x-[5deg]" style={{ transform: 'rotateY(-30deg) rotateX(12deg) scale(1.1)', transformStyle: 'preserve-3d', maskImage: 'linear-gradient(to bottom, black 95%, transparent), linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, black 95%, transparent), linear-gradient(to right, transparent, black 10%, black 90%, transparent)', maskComposite: 'intersect', WebkitMaskComposite: 'source-in', boxShadow: '0 0 100px black' }}>
                            {SLIDES.map((slide, index) => (
                                <div key={slide.src} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0"}`}>
                                    <Image
                                        src={slide.src}
                                        alt={slide.label}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 45vw"
                                        className="object-cover object-top"
                                        quality={100}
                                        priority={index === 0}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setCurrentSlide(prev => (prev - 1 + SLIDES.length) % SLIDES.length)} className="p-2 rounded-full bg-black/40 text-white/70 hover:bg-black/60 transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                            <button onClick={() => setCurrentSlide(prev => (prev + 1) % SLIDES.length)} className="p-2 rounded-full bg-black/40 text-white/70 hover:bg-black/60 transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                        </div>
                        <div className="flex flex-col items-center mt-8 space-y-4">
                            <div className="h-6 relative w-full flex justify-center">
                                {SLIDES.map((slide, index) => (
                                    <p key={index} className={`absolute text-white/90 text-[11px] font-bold font-display tracking-[0.4em] transition-all duration-700 transform ${index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"}`}>
                                        {slide.label}
                                    </p>
                                ))}
                            </div>
                            <div className="flex justify-center gap-2 relative z-50">
                                {SLIDES.map((_, index) => (
                                    <button key={index} onClick={() => setCurrentSlide(index)} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-white w-6" : "bg-white/20 hover:bg-white/40"}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
                <div className="w-full pt-4 pb-12 overflow-hidden relative group/marquee" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)' }}>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 bottom-0 w-80 z-10 pointer-events-none bg-gradient-to-r from-black via-black/95 to-transparent backdrop-blur-xl h-full" style={{ maskImage: 'linear-gradient(to right, black, transparent)', WebkitMaskImage: 'linear-gradient(to right, black, transparent)' }}></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 bottom-0 w-80 z-10 pointer-events-none bg-gradient-to-l from-black via-black/95 to-transparent backdrop-blur-xl h-full" style={{ maskImage: 'linear-gradient(to left, black, transparent)', WebkitMaskImage: 'linear-gradient(to left, black, transparent)' }}></div>
                    <div className="flex animate-marquee whitespace-nowrap items-center w-max">
                        {[...partners, ...partners].map((partner, i) => (
                            <div key={`${partner.name}-${i}`} className="flex items-center mx-12 grayscale opacity-20 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default">
                                <img
                                    src={partner.src}
                                    alt={partner.name}
                                    className="h-6 w-auto object-contain"
                                    style={{ transform: partner.scale ? `scale(${partner.scale})` : 'none' }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- NEW SECTIONS START HERE --- */}

                {/* 1. PROBLEM SECTION */}
                <section className="py-32 px-4 md:px-8 border-t border-white/[0.02]">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <div>
                                <h2 className="text-[11px] font-black uppercase text-rose-500 tracking-[0.4em] mb-6">The Problem</h2>
                                <h3 className="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">
                                    Traditional CVs are <br />
                                    <span className="text-white/40">unreliable and easy to fake.</span>
                                </h3>
                                <div className="space-y-6">
                                    <p className="text-white/50 text-sm leading-relaxed max-w-md font-light">
                                        Recruiters spend months filtering through unverified portfolios, while talented individuals struggle to stand out amongst a sea of inflated claims and AI-generated resumes.
                                    </p>
                                    <ul className="space-y-4">
                                        {["Endless screening cycles", "No proof of actual contribution", "Difficulty verifying soft skills"].map(item => (
                                            <li key={item} className="flex items-center gap-3 text-white/30 text-[10px] font-black uppercase tracking-widest">
                                                <div className="w-1.5 h-1.5 bg-rose-500/40 rounded-full" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="aspect-video w-full rounded-[32px] border-2 border-dashed border-white/5 flex items-center justify-center bg-white/[0.01] relative overflow-hidden group/box">
                                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover/box:opacity-100 transition-opacity duration-700"></div>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 relative z-10">Problem Visualization Diagram</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. SOLUTION SECTION */}
                <section className="py-32 px-4 md:px-8 bg-white/[0.01]">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <div className="order-2 lg:order-1 aspect-video w-full rounded-[32px] border-2 border-dashed border-white/5 flex items-center justify-center bg-white/[0.01] relative overflow-hidden group/box">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover/box:opacity-100 transition-opacity duration-700"></div>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 relative z-10">On-Chain Proof Animation</p>
                            </div>
                            <div className="order-1 lg:order-2">
                                <h2 className="text-[11px] font-black uppercase text-emerald-400 tracking-[0.4em] mb-6">The Solution</h2>
                                <h3 className="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">
                                    Verifiable identity <br />
                                    <span className="text-white/40">anchored to on-chain proof.</span>
                                </h3>
                                <p className="text-white/50 text-sm leading-relaxed mb-10 max-w-md font-light">
                                    ChainVolio converts professional contributions into cryptographic signals. Every skill claimed is backed by a verifier, ensuring trust without the need for manual background checks.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                        <p className="text-emerald-400 text-2xl font-bold mb-1 tracking-tight">100%</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Verifiable Output</p>
                                    </div>
                                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                        <p className="text-emerald-400 text-2xl font-bold mb-1 tracking-tight">Instant</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Trust Layer</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. HOW IT WORKS SECTION */}
                <section className="py-32 px-4 md:px-8 border-t border-white/[0.02]">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="text-center mb-24">
                            <h2 className="text-[11px] font-black uppercase text-indigo-500 tracking-[0.4em] mb-6">Workflow</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">How ChainVolio works</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { step: "01", title: "Build Profile", desc: "Connect your wallet and import your professional contributions to your secure ledger." },
                                { step: "02", title: "Request Proof", desc: "Send verification requests to your project leads, founders or managers directly via Link." },
                                { step: "03", title: "Earn Reputation", desc: "Your CV updates with on-chain attestations, creating an immutable proof of work." }
                            ].map((item, idx) => (
                                <div key={idx} className="relative p-10 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 group">
                                    <div className="w-12 h-12 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center text-[11px] font-black text-indigo-400 mb-8 group-hover:scale-110 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all">
                                        {item.step}
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-4 tracking-tight">{item.title}</h4>
                                    <p className="text-white/40 text-xs leading-relaxed font-light">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. VALUE SNAPSHOT */}
                <section className="py-32 px-4 md:px-8 border-t border-white/[0.02]">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="w-full h-[400px] rounded-[40px] border-2 border-dashed border-white/5 flex items-center justify-center bg-white/[0.01] relative overflow-hidden group/snapshot">
                            <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/[0.03] to-transparent opacity-0 group-hover/snapshot:opacity-100 transition-opacity duration-1000"></div>
                            <div className="text-center relative z-10 px-6">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-6">Value Proposition Snapshot</p>
                                <p className="text-[11px] text-white/10 max-w-sm mx-auto leading-relaxed font-medium">Interactive ecosystem module showing the cryptographic relationship between Builders, Verifiers, and Organizations.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. FINAL CTA */}
                <section className="py-48 px-4 md:px-8 border-t border-white/[0.02] bg-gradient-to-b from-transparent to-white/[0.01]">
                    <div className="max-w-[800px] mx-auto text-center">
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tighter leading-[1.1]">
                            Build your <br />
                            <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">on-chain reputation.</span>
                        </h2>
                        <p className="text-white/40 text-base mb-12 max-w-lg mx-auto leading-relaxed font-light">
                            Join thousands of builders and organizations creating a more transparent, verifiable future for Web3 careers.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                             <button
                                onClick={() => setIsWalletModalOpen(true)}
                                className="premium-shimmer-button w-full sm:w-auto px-12 py-4.5 bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white font-bold text-base whitespace-nowrap rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(20,241,149,0.25)]"
                            >
                                Get Started Now
                            </button>
                            <Link
                                href="/why"
                                className="w-full sm:w-auto px-12 py-4.5 bg-white/[0.02] hover:bg-white/[0.05] text-white/70 font-bold text-base whitespace-nowrap rounded-2xl border border-white/5 transition-all flex items-center justify-center gap-2"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>
                </section>
                <Footer />
            </div>

            {/* MOBILE LAYOUT (HIDDEN ON DESKTOP) */}
            <div className="block md:hidden">
                <section className="px-6 pt-24 pb-12 flex flex-col gap-12 text-center">
                    <div className="flex flex-col items-center">
                        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md mb-6">
                            <span className="text-[9px] font-bold uppercase tracking-[0.15em] bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent opacity-50">Trust Layer for Web3 Career</span>
                        </div>
                        <h1 className="text-4xl sm:text-[42px] font-black leading-[1.1] tracking-tight text-white px-2">
                            Verifiable identity<br />
                            for Web3.
                        </h1>
                        <p className="text-white/70 text-base font-medium leading-relaxed px-4 mt-8">
                            Build a work history that canΓÇÖt be faked. Backed by on-chain proof and attestations.
                        </p>
                    </div>

                    {/* Simple Mobile Slide */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] -mt-12">
                        <Image
                            src={SLIDES[currentSlide].src}
                            alt={SLIDES[currentSlide].label}
                            fill
                            className="object-cover object-top transition-opacity duration-500"
                            quality={100}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    </div>

                    <div className="h-4 relative w-full flex justify-center -mt-2">
                        {SLIDES.map((slide, index) => (
                            <p key={index} className={`absolute text-white/90 text-[10px] font-bold font-display tracking-[0.3em] transition-all duration-500 transform ${index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0 pointer-events-none"}`}>
                                {slide.label}
                            </p>
                        ))}
                    </div>

                    <div className="flex flex-col gap-4 px-2">
                        {(() => {
                            const isGoogleRecruiter = isGoogleSignedIn;
                            const isWalletRecruiter = connected && !!publicKey && !!profile && isRecruiterTier(profile.verificationTier);
                            const isRecruiter = isGoogleRecruiter || isWalletRecruiter;
                            const orgType = googleOrgAccount?.org_type
                                ?? (profile?.verificationTier?.toLowerCase().includes("company") ? "company" : "community");
                            const isCommunityOrg = orgType === "community";
                            const orgPageUrl = isGoogleRecruiter ? `/dashboard` : publicKey ? `/cv/${publicKey.toBase58()}` : `/dashboard`;

                            return (
                                <>
                                    {isRecruiter ? (
                                        <Link
                                            href={orgPageUrl}
                                            className="premium-shimmer-button w-full py-4 bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white font-bold text-base text-center rounded-2xl shadow-[0_0_20px_rgba(20,241,149,0.15)] flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                                        >
                                            {isCommunityOrg ? "View Your Community" : "View Your Company"}
                                        </Link>
                                    ) : connected && publicKey ? (
                                        <Link
                                            href={`/cv/${publicKey.toBase58()}`}
                                            className="premium-shimmer-button w-full py-4 bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white font-bold text-base text-center rounded-2xl shadow-[0_0_20px_rgba(20,241,149,0.15)] flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                                        >
                                            View Your CV
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => setIsWalletModalOpen(true)}
                                            className="premium-shimmer-button w-full py-4 bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white font-bold text-base text-center rounded-2xl shadow-[0_0_20px_rgba(20,241,149,0.15)] flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                                        >
                                            Build Your Reputation
                                        </button>
                                    )}
                                    {isRecruiter ? (
                                        <Link
                                            href="/hiring/create"
                                            className="w-full py-4 bg-[#121214]/50 hover:bg-[#1a1a1f] text-white font-bold text-base rounded-2xl border border-white/5 transition-all flex items-center justify-center gap-2"
                                        >
                                            Discover Talent <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                if (!connected) {
                                                    setIsWalletModalOpen(true);
                                                    return;
                                                }
                                                router.push("/hiring/create");
                                            }}
                                            className="w-full py-4 bg-[#121214]/50 hover:bg-[#1a1a1f] text-white font-bold text-base rounded-2xl border border-white/5 transition-all flex items-center justify-center gap-2"
                                        >
                                            Discover Talent <ArrowRight className="w-4 h-4" />
                                        </button>
                                    )}
                                </>
                            );
                        })()}

                        <div className="mt-12 text-left">
                            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">
                                Powering the Web3 career stack
                            </p>
                        </div>
                    </div>

                </section>

                <div className="w-full pt-2 pb-10 overflow-hidden relative" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)' }}>
                    <div className="flex animate-marquee whitespace-nowrap items-center w-max">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="flex gap-16 items-center flex-shrink-0 pr-16">
                                {partners.map((partner) => (
                                    <CryptoLogo key={`${i}-${partner.name}`} src={partner.src} name={partner.name} />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- MOBILE SECTIONS --- */}

                <div className="px-6 py-20 space-y-32">
                    {/* Problem */}
                    <div>
                        <h2 className="text-[10px] font-black uppercase text-rose-500 tracking-[0.4em] mb-4">The Problem</h2>
                        <h3 className="text-2xl font-bold text-white mb-6">Traditional CVs are easy to fake.</h3>
                        <p className="text-white/40 text-sm leading-relaxed font-light mb-8">Recruiters waste time on unverified claims. Talent gets lost in the noise.</p>
                        <div className="aspect-video w-full rounded-2xl border border-dashed border-white/10 flex items-center justify-center bg-white/[0.01]">
                            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 text-center px-4">Problem Visualization</p>
                        </div>
                    </div>

                    {/* Solution */}
                    <div>
                        <h2 className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.4em] mb-4">The Solution</h2>
                        <h3 className="text-2xl font-bold text-white mb-6">On-chain professional proof.</h3>
                        <p className="text-white/40 text-sm leading-relaxed font-light mb-8">ChainVolio anchors Every skill to a verifier, creating instant trust.</p>
                        <div className="aspect-video w-full rounded-2xl border border-dashed border-white/10 flex items-center justify-center bg-white/[0.01]">
                            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 text-center px-4">Solution Animation</p>
                        </div>
                    </div>

                    {/* Final CTA Mobile */}
                    <div className="text-center py-20">
                        <h2 className="text-3xl font-bold text-white mb-6">Build your legacy.</h2>
                        <button
                            onClick={() => setIsWalletModalOpen(true)}
                            className="w-full py-4 bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white font-bold text-sm rounded-xl shadow-lg"
                        >
                            Get Started
                        </button>
                    </div>
                </div>

                <Footer />
            </div>

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
                            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-white/40 hover:text-white/90 transition-colors text-2xl z-20">├ù</button>
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
            </main>
        </div>
    );
}
