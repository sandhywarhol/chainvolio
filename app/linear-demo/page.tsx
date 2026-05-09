"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Layers, Cpu, Globe, Zap, MousePointer2, Briefcase, UserCheck } from "lucide-react";

export default function LinearStyleHomepage() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="bg-black min-h-screen text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
            {/* Linear Style Background: Ambient Glows */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>
            </div>

            {/* Navbar (Linear Style) */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
                scrolled ? "bg-black/80 backdrop-blur-md border-b border-white/[0.08] py-3" : "bg-transparent py-5"
            }`}>
                <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center group-hover:scale-105 transition-transform">
                                <ShieldCheck className="w-4 h-4 text-black" />
                            </div>
                            <span className="text-sm font-bold tracking-tight">ChainVolio</span>
                        </Link>
                        <div className="hidden md:flex items-center gap-6 text-[13px] font-medium text-white/50">
                            <Link href="#" className="hover:text-white transition-colors">Methodology</Link>
                            <Link href="#" className="hover:text-white transition-colors">Trust Model</Link>
                            <Link href="#" className="hover:text-white transition-colors">Ecosystem</Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="#" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors px-4">Sign In</Link>
                        <Link href="#" className="bg-white/10 hover:bg-white/15 border border-white/10 text-white px-5 py-1.5 rounded-full text-[13px] font-bold transition-all backdrop-blur-sm">
                            Get Access
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 px-6">
                <div className="max-w-[1000px] mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-white/50 text-[11px] font-medium mb-8 animate-fade-in translate-y-[-10px]">
                        <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[9px] font-bold">NEW</span>
                        Introduced Attestation Protocols v2.0
                        <ArrowRight className="w-3 h-3" />
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight mb-8 leading-[1] animate-fade-in delay-100">
                        The world’s professional <br />
                        <span className="text-white/30">ledger of truth.</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-12 font-light leading-relaxed animate-fade-in delay-200">
                        ChainVolio is the trust infrastructure for the next generation of careers. Build a verifiable work history anchored on-chain.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in delay-300">
                        <button className="w-full sm:w-auto px-8 py-3 bg-white text-black hover:bg-white/90 rounded-full font-bold text-sm shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all flex items-center justify-center gap-2">
                            Build Your Profile <ArrowRight className="w-4 h-4" />
                        </button>
                        <button className="w-full sm:w-auto px-8 py-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 rounded-full font-bold text-sm transition-all text-white/80">
                            Explore Talent
                        </button>
                    </div>
                </div>

                {/* Hero Visual (Linear Style Dashboard Mockup) */}
                <div className="max-w-[1200px] mx-auto mt-24 relative px-4 group">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#000212] via-transparent to-transparent z-10 h-full"></div>
                    <div className="relative bg-black border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/5 group-hover:border-white/20 transition-all duration-700">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05] bg-white/[0.02]">
                            <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                            <div className="ml-4 h-4 w-40 bg-white/5 rounded-full"></div>
                        </div>
                        <div className="aspect-[16/9] w-full bg-gradient-to-br from-indigo-500/5 to-transparent p-8 md:p-16">
                            <div className="grid grid-cols-12 gap-8 h-full">
                                <div className="col-span-3 space-y-4">
                                    <div className="h-4 w-full bg-white/10 rounded-md"></div>
                                    <div className="h-4 w-2/3 bg-white/5 rounded-md"></div>
                                    <div className="pt-8 space-y-3">
                                        <div className="h-2 w-full bg-white/5 rounded-full"></div>
                                        <div className="h-2 w-full bg-white/5 rounded-full"></div>
                                        <div className="h-2 w-4/5 bg-white/5 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="col-span-9 bg-white/[0.02] border border-white/5 rounded-xl p-8 relative overflow-hidden">
                                    <div className="flex justify-between mb-12">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                                <UserCheck className="w-8 h-8 text-indigo-400" />
                                            </div>
                                            <div className="space-y-2 pt-2">
                                                <div className="h-4 w-48 bg-white/20 rounded-md"></div>
                                                <div className="h-3 w-32 bg-white/5 rounded-md"></div>
                                            </div>
                                        </div>
                                        <div className="h-8 w-24 bg-indigo-500/10 border border-indigo-500/20 rounded-lg"></div>
                                    </div>
                                    <div className="space-y-6">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                                                <div className="flex gap-4 items-center">
                                                    <div className="w-8 h-8 rounded-lg bg-white/5"></div>
                                                    <div className="h-3 w-40 bg-white/10 rounded-md"></div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                                                    <div className="h-3 w-16 bg-white/5 rounded-md"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Bento Grid (Linear Classic) */}
            <section className="py-32 px-6 max-w-[1200px] mx-auto">
                <div className="mb-24 max-w-2xl">
                    <h2 className="text-[13px] font-black uppercase text-indigo-400 tracking-[0.3em] mb-6">Capabilities</h2>
                    <h3 className="text-4xl md:text-5xl font-medium tracking-tight leading-tight">
                        Built for the next era <br />
                        <span className="text-white/40">of professional trust.</span>
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Feature 1: Large Bento */}
                    <div className="md:col-span-8 group relative p-10 rounded-[32px] bg-white/[0.01] border border-white/[0.06] overflow-hidden transition-all hover:bg-white/[0.03] hover:border-white/[0.12]">
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Zap className="w-32 h-32 text-indigo-400" />
                        </div>
                        <div className="relative z-10 max-w-sm">
                            <h4 className="text-2xl font-bold mb-4">Real-time Attestations</h4>
                            <p className="text-white/40 text-sm leading-relaxed mb-8">
                                Connect project leads and verifiers instantly. Create immutable work logs that update your reputation automatically.
                            </p>
                            <Link href="#" className="inline-flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white transition-colors">
                                Explore Methodology <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="mt-20 aspect-video w-full rounded-2xl border border-white/10 bg-black/40 flex items-center justify-center border-dashed">
                             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Protocol Animation Placeholder</p>
                        </div>
                    </div>

                    {/* Feature 2: Small Bento */}
                    <div className="md:col-span-4 p-10 rounded-[32px] bg-white/[0.01] border border-white/[0.06] transition-all hover:bg-white/[0.03] hover:border-white/[0.12]">
                        <Layers className="w-10 h-10 text-indigo-400 mb-8" />
                        <h4 className="text-2xl font-bold mb-4">Multi-Chain Identity</h4>
                        <p className="text-white/40 text-sm leading-relaxed">
                            Your reputation isn't siloed. Anchor your professional identity across the Web3 ecosystem.
                        </p>
                    </div>

                    {/* Feature 3: Small Bento */}
                    <div className="md:col-span-4 p-10 rounded-[32px] bg-white/[0.01] border border-white/[0.06] transition-all hover:bg-white/[0.03] hover:border-white/[0.12]">
                        <Briefcase className="w-10 h-10 text-emerald-400 mb-8" />
                        <h4 className="text-2xl font-bold mb-4">Recruiter Center</h4>
                        <p className="text-white/40 text-sm leading-relaxed">
                            Discover high-signal talent through verifiable work history rather than narrative CVs.
                        </p>
                    </div>

                    {/* Feature 4: Large Bento */}
                    <div className="md:col-span-8 p-10 rounded-[32px] bg-white/[0.01] border border-white/[0.06] transition-all hover:bg-white/[0.03] hover:border-white/[0.12] flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1">
                            <h4 className="text-2xl font-bold mb-4">Cryptographic Privacy</h4>
                            <p className="text-white/40 text-sm leading-relaxed">
                                Share only what's necessary. Our ZK-integration allows you to prove your skills without revealing sensitive project details.
                            </p>
                        </div>
                        <div className="w-48 h-48 rounded-full border-4 border-dashed border-white/5 flex items-center justify-center">
                             <ShieldCheck className="w-16 h-16 text-white/10" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA Section */}
            <section className="py-48 px-6 text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-medium tracking-tight mb-8">
                        Ready to join the <br />
                        <span className="text-white/30">ledger of truth?</span>
                    </h2>
                    <p className="text-white/40 mb-12 text-lg font-light leading-relaxed">
                        Start building your verifiable professional history today. Join the next generation of Web3 talent.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="w-full sm:w-auto px-10 py-4 bg-white text-black rounded-full font-bold text-base shadow-xl transition-all active:scale-95">
                            Get Started
                        </button>
                        <button className="w-full sm:w-auto px-10 py-4 bg-white/[0.05] text-white rounded-full font-bold text-base border border-white/10 hover:bg-white/10 transition-all">
                            Talk to Sales
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer (Linear Style) */}
            <footer className="py-20 px-6 border-t border-white/[0.04]">
                <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                                <ShieldCheck className="w-3.5 h-3.5 text-black" />
                            </div>
                            <span className="text-sm font-bold tracking-tight">ChainVolio</span>
                        </div>
                        <p className="text-[12px] text-white/30 leading-relaxed max-w-[240px]">
                            Built for developers, builders, and organizations. The trust layer of the new economy.
                        </p>
                    </div>
                    <div>
                        <h5 className="text-[11px] font-bold text-white mb-6 uppercase tracking-widest">Product</h5>
                        <ul className="space-y-4 text-[13px] text-white/40">
                            <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Integrations</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-[11px] font-bold text-white mb-6 uppercase tracking-widest">Company</h5>
                        <ul className="space-y-4 text-[13px] text-white/40">
                            <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-[11px] font-bold text-white mb-6 uppercase tracking-widest">Social</h5>
                        <ul className="space-y-4 text-[13px] text-white/40">
                            <li><Link href="#" className="hover:text-white transition-colors">Twitter</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">GitHub</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Discord</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-[11px] font-bold text-white mb-6 uppercase tracking-widest">Resources</h5>
                        <ul className="space-y-4 text-[13px] text-white/40">
                            <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">API Reference</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-[1200px] mx-auto mt-20 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[11px] text-white/20 font-medium tracking-tight">© 2024 ChainVolio Inc. Built with passion for Web3.</p>
                    <div className="flex gap-8">
                        <Link href="#" className="text-[11px] text-white/20 hover:text-white/40 transition-colors">Privacy Policy</Link>
                        <Link href="#" className="text-[11px] text-white/20 hover:text-white/40 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </footer>

            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .delay-100 { animation-delay: 100ms; }
                .delay-200 { animation-delay: 200ms; }
                .delay-300 { animation-delay: 300ms; }
            `}</style>
        </div>
    );
}
