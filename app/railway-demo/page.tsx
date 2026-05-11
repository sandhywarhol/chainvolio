"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Terminal, Zap, Shield, Globe, Cpu, ChevronRight, Menu, X } from "lucide-react";

export default function RailwayDemoPage() {
    const [scrolled, setScrolled] = useState(false);
    const [activeTab, setActiveTab] = useState("deploy");

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const features = {
        deploy: {
            title: "Instant Deployment",
            desc: "Ship code directly from GitHub. No complex YAML, no cluster management. Just push and we'll handle the rest.",
            label: "Auto-Scaling Included"
        },
        network: {
            title: "Private Networking",
            desc: "Secure, zero-config internal communication between your services. No public internet needed for database connections.",
            label: "Encrypted by Default"
        },
        scale: {
            title: "Global Infrastructure",
            desc: "Run your applications on a world-class network with multi-region availability and intelligent traffic routing.",
            label: "99.9% Uptime SLA"
        }
    };

    return (
        <div className="bg-black theme-bg-page theme-aware min-h-screen text-white font-sans selection:bg-indigo-500/30">
            {/* Grid Background Effect */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" 
                 style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }}>
            </div>

            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b ${
                scrolled ? "bg-black/80 backdrop-blur-xl border-white/10 py-3" : "bg-transparent border-transparent py-6"
            }`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <Zap className="w-5 h-5 fill-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">Railway</span>
                        </Link>
                        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/50">
                            <Link href="#" className="hover:text-white transition-colors">Products</Link>
                            <Link href="#" className="hover:text-white transition-colors">Templates</Link>
                            <Link href="#" className="hover:text-white transition-colors">Docs</Link>
                            <Link href="#" className="hover:text-white transition-colors">Pricing</Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="hidden sm:block text-sm font-medium text-white/70 hover:text-white px-4">Login</button>
                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all active:scale-95">
                            Start Building
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 animate-fade-in">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        Next Gen Cloud Platform
                    </div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 leading-[0.9] lg:max-w-5xl mx-auto">
                        Bring your code. <br />
                        <span className="text-white/20">We'll handle the rest.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                        Deploy, manage, and scale your applications without the infrastructure headache. Built for developers who move fast.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold text-lg shadow-[0_20px_40px_rgba(124,58,237,0.2)] transition-all">
                            Deploy Now
                        </button>
                        <button className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2">
                            View Templates <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Floating Glow Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-600/20 blur-[150px] rounded-full z-0 opacity-50"></div>
                <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-full h-[600px] bg-black z-10" style={{ clipPath: 'ellipse(100% 50% at 50% 100%)' }}></div>
            </section>

            {/* Dashboard Preview (The "Railway Look") */}
            <section className="px-6 -mt-20 mb-40 relative z-20">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white/[0.02] border border-white/10 rounded-[32px] p-2 shadow-2xl overflow-hidden group">
                        <div className="bg-[#0b0e14] rounded-[24px] overflow-hidden border border-white/5">
                            {/* Window Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">railway-prod-01.dash</div>
                                <div className="w-12"></div>
                            </div>
                            {/* Window Content */}
                            <div className="aspect-[16/9] bg-gradient-to-br from-indigo-900/10 to-transparent flex items-center justify-center p-12">
                                <div className="w-full max-w-3xl space-y-8 animate-pulse-slow">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-indigo-400">
                                                <Globe className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">main-api-service</h4>
                                                <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Running • us-east-1</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="h-8 w-24 bg-white/5 rounded-lg border border-white/5"></div>
                                            <div className="h-8 w-8 bg-indigo-600/20 rounded-lg border border-indigo-500/30"></div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">CPU Usage</span>
                                                <span className="text-[9px] font-black text-indigo-400">12.4%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full w-[12.4%] bg-indigo-500 rounded-full"></div>
                                            </div>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Memory</span>
                                                <span className="text-[9px] font-black text-indigo-400">256MB</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full w-[45%] bg-indigo-500 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-black rounded-xl p-4 border border-white/5 font-mono text-[10px] text-white/40 space-y-1">
                                        <p><span className="text-emerald-500">INFO</span> [2024-05-01 12:00:01] Server listening on port 3000</p>
                                        <p><span className="text-emerald-500">INFO</span> [2024-05-01 12:00:05] Database connected (PostgreSQL)</p>
                                        <p><span className="text-indigo-500">LOG</span> [2024-05-01 12:05:22] GET /api/v1/health - 200 OK</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Tabs Section (Interactive Railway Aesthetic) */}
            <section className="py-20 px-6 border-t border-white/[0.02]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        <div>
                            <h2 className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.4em] mb-8">Infrastructure</h2>
                            <h3 className="text-4xl md:text-5xl font-bold mb-10 tracking-tight leading-tight">
                                Built for scale. <br />
                                <span className="text-white/20">Designed for developers.</span>
                            </h3>
                            
                            <div className="space-y-4">
                                {Object.keys(features).map((key) => (
                                    <button 
                                        key={key}
                                        onClick={() => setActiveTab(key)}
                                        className={`w-full text-left p-6 rounded-3xl transition-all border ${
                                            activeTab === key 
                                            ? "bg-indigo-600/10 border-indigo-500/20 translate-x-2" 
                                            : "hover:bg-white/[0.02] border-transparent text-white/40"
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                                                activeTab === key ? "bg-indigo-600 text-white border-indigo-500" : "bg-white/5 border-white/10"
                                            }`}>
                                                {key === 'deploy' && <Zap className="w-5 h-5" />}
                                                {key === 'network' && <Shield className="w-5 h-5" />}
                                                {key === 'scale' && <Globe className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <h4 className={`font-bold transition-colors ${activeTab === key ? "text-white" : ""}`}>
                                                    {(features as any)[key].title}
                                                </h4>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500/50 mt-0.5">
                                                    {(features as any)[key].label}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-center">
                            <div className="relative w-full aspect-square max-w-md">
                                <div className="absolute inset-0 bg-indigo-600/10 blur-[80px] rounded-full"></div>
                                <div className="relative h-full w-full rounded-[48px] border-2 border-dashed border-white/10 bg-white/[0.01] flex items-center justify-center group overflow-hidden">
                                    <div className="text-center p-12 transition-all group-hover:scale-105 duration-700">
                                        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(124,58,237,0.3)]">
                                            {activeTab === 'deploy' && <Terminal className="w-10 h-10" />}
                                            {activeTab === 'network' && <Shield className="w-10 h-10" />}
                                            {activeTab === 'scale' && <Globe className="w-10 h-10" />}
                                        </div>
                                        <h4 className="text-2xl font-bold mb-4">{(features as any)[activeTab].title}</h4>
                                        <p className="text-white/40 text-sm leading-relaxed">{(features as any)[activeTab].desc}</p>
                                    </div>
                                    {/* Decorative Code Fragments */}
                                    <div className="absolute top-8 left-8 text-[10px] font-mono text-emerald-500/20">deploy --prod</div>
                                    <div className="absolute bottom-8 right-8 text-[10px] font-mono text-indigo-500/20">railway.json</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-40 px-6 border-t border-white/[0.02]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-bold mb-12 tracking-tight">
                        Ready to ship? <br />
                        <span className="text-indigo-500">Build with Railway.</span>
                    </h2>
                    <button className="px-12 py-5 bg-white text-black hover:bg-white/90 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl">
                        Get Started for Free
                    </button>
                    <p className="mt-8 text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">No Credit Card Required</p>
                </div>
            </section>

            <footer className="py-20 px-6 border-t border-white/[0.02] bg-black/40">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
                    <div className="col-span-2 lg:col-span-1">
                         <div className="flex items-center gap-2 mb-6">
                            <Zap className="w-5 h-5 text-indigo-500 fill-indigo-500" />
                            <span className="text-lg font-bold">Railway</span>
                        </div>
                        <p className="text-white/30 text-xs leading-relaxed max-w-[200px]">
                            Making infrastructure invisible for developers worldwide.
                        </p>
                    </div>
                    <div>
                        <h5 className="text-[10px] font-black uppercase text-white/50 tracking-widest mb-6">Product</h5>
                        <ul className="space-y-4 text-sm text-white/30 font-medium">
                            <li><Link href="#" className="hover:text-white">Features</Link></li>
                            <li><Link href="#" className="hover:text-white">CLI</Link></li>
                            <li><Link href="#" className="hover:text-white">Pricing</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-[10px] font-black uppercase text-white/50 tracking-widest mb-6">Resources</h5>
                        <ul className="space-y-4 text-sm text-white/30 font-medium">
                            <li><Link href="#" className="hover:text-white">Documentation</Link></li>
                            <li><Link href="#" className="hover:text-white">Help Center</Link></li>
                            <li><Link href="#" className="hover:text-white">Community</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-[10px] font-black uppercase text-white/50 tracking-widest mb-6">Company</h5>
                        <ul className="space-y-4 text-sm text-white/30 font-medium">
                            <li><Link href="#" className="hover:text-white">About</Link></li>
                            <li><Link href="#" className="hover:text-white">Changelog</Link></li>
                            <li><Link href="#" className="hover:text-white">Blog</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">© 2024 Railway Corp.</p>
                    <div className="flex gap-8">
                        <Link href="#" className="text-[10px] font-bold text-white/20 hover:text-white/40 uppercase tracking-widest transition-colors">Privacy Policy</Link>
                        <Link href="#" className="text-[10px] font-bold text-white/20 hover:text-white/40 uppercase tracking-widest transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </footer>

            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 4s ease-in-out infinite;
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
