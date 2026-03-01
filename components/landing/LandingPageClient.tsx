"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const SLIDES = [
    { src: "/homepage/cv%20view.png?v=3", label: "Professional Profile" },
    { src: "/homepage/dashboard.png?v=3", label: "Recruiter Dashboard" },
    { src: "/homepage/edit%20profile.png?v=3", label: "Profile Customization" },
    { src: "/homepage/link%20recruit.png?v=3", label: "Hiring Links" },
    { src: "/homepage/proof%20of%20work.png?v=3", label: "Verifiable Work" },
];

const PARTNERS = [
    { src: "/logos/solana.png", name: "Solana", scale: 0.7 },
    { src: "/logos/bitcoin.png", name: "Bitcoin" },
    { src: "/logos/etherium.png", name: "Ethereum" },
    { src: "/logos/arbitrum.png", name: "Arbitrum" },
    { src: "/logos/optimism.png", name: "Optimism" },
    { src: "/logos/base.png", name: "Base", scale: 0.75 },
    { src: "/logos/polygon.png", name: "Polygon", scale: 0.75 },
    { src: "/logos/magic%20eden.png", name: "Magic Eden" },
    { src: "/logos/tensor.png", name: "Tensor", scale: 0.75 },
    { src: "/logos/pyth.png", name: "Pyth", scale: 1.2 },
    { src: "/logos/helius.png", name: "Helius", scale: 1.2 },
    { src: "/logos/superteam.png", name: "Superteam" },
    { src: "/logos/alchemy.png", name: "Alchemy" },
    { src: "/logos/infura.png", name: "Infura", scale: 0.7 },
    { src: "/logos/chainlink.png", name: "Chainlink" },
    { src: "/logos/the%20graph.png", name: "The Graph" },
    { src: "/logos/zora.png", name: "Zora" },
    { src: "/logos/open%20sea.png", name: "OpenSea", scale: 0.75 },
    { src: "/logos/discord.png", name: "Discord", scale: 0.7 },
    { src: "/logos/github.png", name: "GitHub" },
    { src: "/logos/notion.png", name: "Notion" },
];

function CryptoLogo({ src, name, scale = 1 }: { src: string; name: string; scale?: number }) {
    return (
        <div className="flex-shrink-0 flex items-center justify-center">
            <img
                src={src}
                alt={name}
                style={{ height: `${18 * scale}px` }}
                className="w-auto max-w-[120px] object-contain transition-all duration-300 opacity-40 hover:opacity-100 grayscale hover:grayscale-0 brightness-200"
                onError={(e) => {
                    console.error(`Failed to load logo: ${src}`);
                    e.currentTarget.style.display = 'none';
                }}
            />
        </div>
    );
}

export function LandingPageClient() {
    const [activeModal, setActiveModal] = useState<'how' | 'recruiters' | 'talent' | 'ask' | 'screening' | 'attestation' | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const searchParams = useSearchParams();

    useEffect(() => {
        const modal = searchParams.get('modal');
        if (modal === 'how' || modal === 'recruiters' || modal === 'talent' || modal === 'ask' || modal === 'screening' || modal === 'attestation') {
            setActiveModal(modal as any);
        }
    }, [searchParams]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <main className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-teal-500/30 selection:text-white">
            <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            <Navbar
                onHowItWorksClick={() => setActiveModal('how')}
                onRecruitersClick={() => setActiveModal('recruiters')}
                onTalentClick={() => setActiveModal('talent')}
                onAskClick={() => setActiveModal('ask')}
                onScreeningClick={() => setActiveModal('screening')}
                onAttestationClick={() => setActiveModal('attestation')}
            />

            <section className="flex-1 max-w-[1240px] w-full mx-auto px-12 relative z-40 flex flex-col lg:flex-row items-center justify-between py-12 gap-16">
                <div className="text-left max-w-xl lg:w-[55%]">
                    <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold font-display leading-[1.1] tracking-tight mb-10 text-white">
                        Verifiable<br />
                        professional identity<br />
                        for Web3 careers.
                    </h1>
                    <div className="mb-16 space-y-8">
                        <p className="text-white/80 text-lg md:text-xl font-medium font-display leading-relaxed max-w-xl tracking-normal">
                            Build a work history that can't be faked.<br />
                            Verifiable achievements & attestations secured on-chain.
                        </p>
                        <p className="text-white/30 text-[11px] font-display tracking-[0.4em] uppercase font-bold">
                            The trust layer for Web3 careers.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-start gap-6">
                        <Link href="/create-profile" className="w-full sm:w-auto px-8 py-3.5 solana-glossy-button text-white font-semibold text-base whitespace-nowrap">Build your CV</Link>
                        <Link href="/hiring/create" className="w-full sm:w-auto px-8 py-3.5 hiring-glossy-button text-white font-semibold text-base whitespace-nowrap">Hire Talent</Link>
                    </div>
                </div>

                <div className="lg:w-[48%] w-full relative group" style={{ perspective: '2000px' }}>
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl transition-transform duration-700 ease-out group-hover:rotate-y-[-15deg] group-hover:rotate-x-[5deg]" style={{ transform: 'rotateY(-30deg) rotateX(12deg) scale(1.1)', transformStyle: 'preserve-3d', maskImage: 'linear-gradient(to bottom, black 80%, transparent), linear-gradient(to right, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent), linear-gradient(to right, transparent, black 15%, black 85%, transparent)', maskComposite: 'intersect', WebkitMaskComposite: 'source-in', boxShadow: '0 0 100px black' }}>
                        {SLIDES.map((slide, index) => (
                            <div key={slide.src} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0"}`}>
                                <img src={slide.src} alt={slide.label} className="w-full h-full object-cover object-top opacity-80" />
                            </div>
                        ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setCurrentSlide(prev => (prev - 1 + SLIDES.length) % SLIDES.length)} className="p-2 rounded-full bg-black/40 text-white/70 hover:bg-black/60 transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                        <button onClick={() => setCurrentSlide(prev => (prev + 1) % SLIDES.length)} className="p-2 rounded-full bg-black/40 text-white/70 hover:bg-black/60 transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                    </div>
                    <div className="flex justify-center gap-2 mt-12 relative z-50">
                        {SLIDES.map((_, index) => (
                            <button key={index} onClick={() => setCurrentSlide(index)} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-white w-6" : "bg-white/20 hover:bg-white/40"}`} />
                        ))}
                    </div>
                </div>
            </section>

            <div className="w-full py-10 overflow-hidden relative group/marquee">
                <div className="absolute left-0 top-0 bottom-0 w-80 z-10 pointer-events-none bg-gradient-to-r from-black via-black/95 to-transparent backdrop-blur-xl" style={{ maskImage: 'linear-gradient(to right, black, transparent)', WebkitMaskImage: 'linear-gradient(to right, black, transparent)' }}></div>
                <div className="absolute right-0 top-0 bottom-0 w-80 z-10 pointer-events-none bg-gradient-to-l from-black via-black/95 to-transparent backdrop-blur-xl" style={{ maskImage: 'linear-gradient(to left, black, transparent)', WebkitMaskImage: 'linear-gradient(to left, black, transparent)' }}></div>
                <div className="flex animate-marquee whitespace-nowrap items-center w-max">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex gap-32 items-center flex-shrink-0 pr-32">
                            {PARTNERS.map((partner) => (
                                <CryptoLogo key={`${i}-${partner.name}`} src={partner.src} name={partner.name} scale={partner.scale} />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <Footer />

            {activeModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-8" onClick={() => setActiveModal(null)}>
                    <div className="relative border border-white/20 rounded-sm max-w-3xl w-full max-h-[80vh] overflow-hidden group" onClick={(e) => e.stopPropagation()}>
                        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-70"><source src="/box%20navigation.mp4" type="video/mp4" /></video>
                        <div className="relative z-10 p-8 md:p-12 bg-black/40 backdrop-blur-sm max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-white/40 hover:text-white/90 transition-colors text-2xl z-20">×</button>
                            {activeModal === 'how' && (
                                <div className="space-y-16 py-4">
                                    <div className="space-y-4"><h2 className="text-3xl font-bold tracking-tight text-white uppercase">How It Works</h2><p className="text-white/40 text-sm max-w-xl leading-relaxed">ChainVolio is a Web3-native CV and reputation platform designed to turn professional experience into verifiable proof, not just claims.</p></div>
                                    <div className="grid md:grid-cols-2 gap-12 pt-8">
                                        <div className="space-y-8"><h3 className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.3em]">The Workflow</h3><div className="space-y-6"><div className="flex gap-6 border-l border-white/10 pl-6 py-1"><span className="text-lg font-light text-white/20">01</span><div><h4 className="text-[10px] font-bold uppercase text-white/90 mb-1">Identity</h4><p className="text-[11px] text-white/50 leading-relaxed">Connect your wallet to establish a secure, cryptographically-backed professional identity.</p></div></div><div className="flex gap-6 border-l border-white/10 pl-6 py-1"><span className="text-lg font-light text-white/20">02</span><div><h4 className="text-[10px] font-bold uppercase text-white/90 mb-1">Build</h4><p className="text-[11px] text-white/50 leading-relaxed">Curate your CV, work history, portfolio, and key milestones in a streamlined interface.</p></div></div><div className="flex gap-6 border-l border-white/10 pl-6 py-1"><span className="text-lg font-light text-white/20">03</span><div><h4 className="text-[10px] font-bold uppercase text-white/90 mb-1">Verify</h4><p className="text-[11px] text-white/50 leading-relaxed">Anchor your achievements with direct evidence via projects, attestations, and on-chain activity.</p></div></div><div className="flex gap-6 border-l border-white/10 pl-6 py-1"><span className="text-lg font-light text-white/20">04</span><div><h4 className="text-[10px] font-bold uppercase text-white/90 mb-1">Share</h4><p className="text-[11px] text-white/50 leading-relaxed">Share your public profile with a single link. Your reputation is portable and transparent.</p></div></div></div></div>
                                        <div className="space-y-8"><h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Core Features</h3><div className="grid grid-cols-1 gap-4"><div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm"><h4 className="text-[10px] font-bold uppercase text-white/70 mb-2">Solana Verification</h4><p className="text-[11px] text-white/40 leading-relaxed">Entries are timestamped on-chain, creating an immutable record.</p></div><div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm"><h4 className="text-[10px] font-bold uppercase text-white/70 mb-2">Public Hub</h4><p className="text-[11px] text-white/40 leading-relaxed">One destination for your CV, proof-of-work, and portfolio. No gatekeepers.</p></div><div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm"><h4 className="text-[10px] font-bold uppercase text-white/70 mb-2">Zero Cost</h4><p className="text-[11px] text-white/40 leading-relaxed">Completely free to use. Built for the ecosystem.</p></div></div></div>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'recruiters' && (
                                <div className="space-y-16 py-4">
                                    <div className="space-y-4"><h2 className="text-3xl font-bold tracking-tight text-white uppercase">For Recruiters</h2><p className="text-white/40 text-sm max-w-xl leading-relaxed">ChainVolio helps recruiters hire faster, smarter, and with lower risk by providing access to transparent and verifiable professional profiles.</p></div>
                                    <div className="grid md:grid-cols-2 gap-12 pt-8">
                                        <div className="space-y-8"><h3 className="text-[10px] font-bold text-teal-400/60 uppercase tracking-[0.3em]">Strategic Value</h3><div className="space-y-6"><div className="flex gap-4 items-start"><span className="text-teal-400/40 font-bold mt-0.5">/</span><div className="space-y-1"><h4 className="text-[10px] font-bold uppercase text-white/90">Web3 Talent</h4><p className="text-[11px] text-white/50 leading-relaxed">Discover candidates with real work history and proven output in the ecosystem.</p></div></div><div className="flex gap-4 items-start"><span className="text-teal-400/40 font-bold mt-0.5">/</span><div className="space-y-1"><h4 className="text-[10px] font-bold uppercase text-white/90">Instant Review</h4><p className="text-[11px] text-white/50 leading-relaxed">Review portfolios and verified milestones in a single, standardized view.</p></div></div><div className="flex gap-4 items-start"><span className="text-teal-400/40 font-bold mt-0.5">/</span><div className="space-y-1"><h4 className="text-[10px] font-bold uppercase text-white/90">Automated Integrity</h4><p className="text-[11px] text-white/50 leading-relaxed">Reduce check times with cryptographic proof of work and peer attestations.</p></div></div></div></div>
                                        <div className="space-y-8"><h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Key Benefits</h3><div className="grid grid-cols-2 gap-4"><div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm"><p className="text-[10px] text-white/40 uppercase tracking-widest">Faster decisions</p></div><div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm"><p className="text-[10px] text-white/40 uppercase tracking-widest">Reduced risk</p></div><div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm"><p className="text-[10px] text-white/40 uppercase tracking-widest">High signal</p></div><div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm"><p className="text-[10px] text-white/40 uppercase tracking-widest">Global reach</p></div></div></div>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'talent' && (
                                <div className="space-y-16 py-4">
                                    <div className="space-y-4"><h2 className="text-3xl font-bold tracking-tight text-white uppercase">For Talent</h2><p className="text-white/40 text-sm max-w-xl leading-relaxed">Build a professional identity that grows over time and is not tied to a single employer or platform.</p></div>
                                    <div className="grid md:grid-cols-2 gap-12 pt-8">
                                        <div className="space-y-8"><h3 className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.3em]">Advantage</h3><div className="space-y-6"><div className="flex gap-4 items-start"><span className="text-emerald-400/40 font-bold mt-0.5">/</span><div className="space-y-1"><h4 className="text-[10px] font-bold uppercase text-white/90">Sovereign Identity</h4><p className="text-[11px] text-white/50 leading-relaxed">Own your professional identity through your wallet. No platform lock-in.</p></div></div><div className="flex gap-4 items-start"><span className="text-emerald-400/40 font-bold mt-0.5">/</span><div className="space-y-1"><h4 className="text-[10px] font-bold uppercase text-white/90">Showcase Output</h4><p className="text-[11px] text-white/50 leading-relaxed">Focus on actual contributions rather than just company titles.</p></div></div><div className="flex gap-4 items-start"><span className="text-emerald-400/40 font-bold mt-0.5">/</span><div className="space-y-1"><h4 className="text-[10px] font-bold uppercase text-white/90">Reputation Hub</h4><p className="text-[11px] text-white/50 leading-relaxed">One professional destination for jobs, grants, and collaborations.</p></div></div></div></div>
                                        <div className="space-y-8"><h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Why it matters</h3><div className="grid grid-cols-2 gap-4"><div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm"><p className="text-[10px] text-white/40 uppercase tracking-widest">Web3-Native</p></div><div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm"><p className="text-[10px] text-white/40 uppercase tracking-widest">Proof Over Hype</p></div><div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm"><p className="text-[10px] text-white/40 uppercase tracking-widest">Data Sovereignty</p></div><div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm"><p className="text-[10px] text-white/40 uppercase tracking-widest">Global Reach</p></div></div></div>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'ask' && (
                                <div className="space-y-16 py-4">
                                    <div className="space-y-4"><h2 className="text-3xl font-bold tracking-tight text-white uppercase">Sourcing</h2><p className="text-white/40 text-sm max-w-md">Eliminate the friction of static files. Request live, verified links to capture higher signal talent.</p></div>
                                    <div className="grid md:grid-cols-2 gap-12 pt-8">
                                        <div className="space-y-6"><h3 className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.3em]">The Shift</h3><div className="space-y-4"><div className="p-6 bg-white/[0.02] border border-white/5 rounded-sm"><p className="text-[10px] text-white/20 uppercase mb-3 text-[8px] tracking-[0.2em]">Traditional Query</p><p className="text-sm text-white/40 font-light">"Please attach your CV as a PDF."</p></div><div className="p-6 bg-emerald-400/[0.03] border border-emerald-400/10 rounded-sm"><p className="text-[10px] text-emerald-400/40 uppercase mb-3 text-[8px] tracking-[0.2em]">Native Query</p><p className="text-sm text-emerald-400/90 font-medium">"Drop your ChainVolio link."</p></div></div></div>
                                        <div className="space-y-6"><h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Operational Value</h3><div className="space-y-5 text-xs text-white/60"><div className="flex gap-4"><span className="text-emerald-400/40 font-bold">/</span><p className="font-light leading-relaxed">Direct access to verified work history without logins.</p></div><div className="flex gap-4"><span className="text-emerald-400/40 font-bold">/</span><p className="font-light leading-relaxed">Unified view of portfolio, code, and peer proof.</p></div><div className="flex gap-4"><span className="text-emerald-400/40 font-bold">/</span><p className="font-light leading-relaxed">Signal-rich screening for global, remote pipelines.</p></div></div></div>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'screening' && (
                                <div className="space-y-16 py-4">
                                    <div className="space-y-4"><h2 className="text-3xl font-bold tracking-tight text-white uppercase">Screening Protocol</h2><p className="text-white/40 text-sm max-w-md">Efficient evaluation of Web3 talent requires a shift from credentials to contributions.</p></div>
                                    <div className="grid gap-12">
                                        <section className="grid md:grid-cols-[1fr,2fr] gap-8 items-start"><h3 className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.2em] pt-1">01 Authority</h3><div className="space-y-3"><p className="text-sm text-white/90 font-medium">Prioritize attested history.</p><p className="text-xs text-white/40 leading-relaxed font-light">Focus on records verified by founders or collaborators. These represent social capital anchored in real output.</p></div></section>
                                        <section className="grid md:grid-cols-[1fr,2fr] gap-8 items-start border-t border-white/5 pt-12"><h3 className="text-[10px] font-bold text-blue-400/60 uppercase tracking-[0.2em] pt-1">02 Substance</h3><div className="space-y-3"><p className="text-sm text-white/90 font-medium">Evaluate work, not titles.</p><p className="text-xs text-white/40 leading-relaxed font-light">Web3 roles are fluid. Look for high-frequency contributions and consistency across multiple milestones.</p></div></section>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'attestation' && (
                                <div className="space-y-16 py-4">
                                    <div className="space-y-4"><h2 className="text-3xl font-bold tracking-tight text-white uppercase">Proof Standards</h2><p className="text-white/40 text-sm max-w-md">Cryptographic validation of professional experience in a decentralized market.</p></div>
                                    <div className="grid md:grid-cols-2 gap-16">
                                        <div className="space-y-8"><h3 className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.3em]">The Attestation Primitive</h3><p className="text-sm text-white/70 leading-relaxed font-light">An attestation is a work record confirmed by a secondary party.</p></div>
                                        <div className="space-y-8"><h3 className="text-[10px] font-bold text-blue-400/60 uppercase tracking-[0.3em]">Recruiter Insights</h3><div className="p-8 bg-white/[0.02] border border-white/5 rounded-sm space-y-8"><div className="flex justify-between items-end border-b border-white/5 pb-4"><div className="space-y-1"><span className="text-[8px] text-white/20 uppercase tracking-widest">Signal Type</span><p className="text-xs text-white/90">Attested Work</p></div></div><p className="text-xs text-white/40 leading-relaxed italic font-light">"Verification reduces screening noise."</p></div></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
