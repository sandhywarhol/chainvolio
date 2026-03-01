"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, CheckCircle, TrendingUp, Lock, Award, Building, Users, Globe, Briefcase } from "lucide-react";

export default function VerifiedOrganizationPage() {
    const { publicKey, connected } = useWallet();
    const [isApplying, setIsApplying] = useState(false);
    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        type: "Company",
        website: "",
        socialLink: "",
        proof: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!publicKey) return;

        setFormStatus('submitting');
        try {
            const res = await fetch("/api/organizations/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    walletAddress: publicKey.toBase58()
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to submit application");
            }

            setFormStatus('success');
        } catch (err: any) {
            setFormStatus('error');
            setErrorMessage(err.message);
        }
    };

    return (
        <main className="min-h-screen bg-black text-white selection:bg-emerald-500/30 relative overflow-x-hidden">
            {/* Video Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-20"
                >
                    <source src="/video-background.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
            </div>
            <Navbar />

            {/* HERO SECTION */}
            <section className="relative z-10 pt-32 pb-20 px-8 max-w-[1240px] mx-auto w-full">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-emerald-500/5 blur-[120px] pointer-events-none" />

                <div className="relative z-10 space-y-8 max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                        <Shield className="w-3 h-3" />
                        Trust Gateway
                    </div>

                    <h1 className="text-6xl md:text-7xl font-bold tracking-tighter leading-[0.95]">
                        Verified <span className="text-emerald-400">Organization</span>
                    </h1>

                    <p className="text-xl text-white/50 leading-relaxed font-light tracking-tight">
                        Issue high-trust attestations and strengthen your organization’s credibility on-chain. Verified organizations issue credentials with higher weight, making candidate profiles more credible and evaluated faster.
                    </p>

                    <div className="pt-4">
                        {!connected && (
                            <WalletMultiButton />
                        )}
                    </div>
                </div>
            </section>

            {/* BENEFITS SECTION */}
            <section className="relative z-10 py-24 px-8 max-w-[1240px] mx-auto w-full border-t border-white/5">
                <div className="mb-16">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Why Become Verified?</h2>
                    <p className="text-white/40 font-light">Elevate your organization's role in the global trust network.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <Award className="w-6 h-6 text-emerald-400" />,
                            title: "Higher Trust Attestations",
                            desc: "Attestations issued by verified organizations carry higher trust weight and are displayed more prominently on candidate cards."
                        },
                        {
                            icon: <CheckCircle className="w-6 h-6 text-emerald-400" />,
                            title: "Official Organizational Identity",
                            desc: "Your wallet is recognized as an official entity, clearly differentiated from personal wallets on all ChainVolio dashboards."
                        },
                        {
                            icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
                            title: "Stronger Hiring Signal",
                            desc: "Candidates endorsed by your organization gain stronger credibility, reducing friction in their hiring and partnership journeys."
                        },
                        {
                            icon: <Lock className="w-6 h-6 text-emerald-400" />,
                            title: "Anti-Impersonation",
                            desc: "Only verified organizations can issue organization-level attestations, preventing fake company claims on candidate profiles."
                        },
                        {
                            icon: <Briefcase className="w-6 h-6 text-emerald-400" />,
                            title: "Early Portal Access",
                            desc: "Get early access to future enterprise features, including organization-wide dashboards, analytics, and bulk attestations."
                        },
                        {
                            icon: <Users className="w-6 h-6 text-emerald-400" />,
                            title: "Governance Privileges",
                            desc: "Participate in staking-based trust systems or future governance models that shape the ChainVolio ecosystem standard."
                        }
                    ].map((benefit, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-all group">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                {benefit.icon}
                            </div>
                            <h3 className="text-lg font-bold mb-3">{benefit.title}</h3>
                            <p className="text-sm text-white/40 leading-relaxed font-light">{benefit.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* WHO IS THIS FOR */}
            <section className="relative z-10 py-24 px-8 max-w-[1240px] mx-auto w-full border-t border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <h2 className="text-4xl font-bold tracking-tighter mb-8">Who is this for?</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: <Building className="w-4 h-4" />, label: "Companies & Startups" },
                                { icon: <Globe className="w-4 h-4" />, label: "DAOs & Web3 Teams" },
                                { icon: <Users className="w-4 h-4" />, label: "Agencies & Studios" },
                                { icon: <Users className="w-4 h-4" />, label: "Communities" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="text-emerald-400">{item.icon}</div>
                                    <span className="text-sm font-medium">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-10 rounded-[40px] bg-emerald-500/5 border border-emerald-500/10 relative overflow-hidden group">
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/20 blur-[100px] group-hover:bg-emerald-500/40 transition-all duration-700" />
                        <h3 className="text-2xl font-bold mb-6">How Verification Works</h3>
                        <div className="space-y-8 relative z-10">
                            {[
                                "Connect & Register your organization wallet",
                                "Submit basic verification proof (Website/GitHub/Social)",
                                "Manual review by ChainVolio team",
                                "Start issuing high-trust attestations"
                            ].map((step, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-400">
                                        {i + 1}
                                    </div>
                                    <p className="text-white/60 font-light pt-1">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* REGISTRATION FORM SECTION / FOOTER CTA */}
            <section id="apply" className="relative z-10 py-32 px-8 max-w-[800px] mx-auto w-full text-center">
                {!isApplying ? (
                    <div className="space-y-8">
                        <h2 className="text-5xl font-bold tracking-tighter">Ready to join the network?</h2>
                        <p className="text-xl text-white/40 font-light">Join the leading organizations securing the future of work.</p>
                        <button
                            onClick={() => {
                                if (!connected) {
                                    alert("Please connect your wallet first.");
                                    return;
                                }
                                setIsApplying(true);
                            }}
                            className="px-12 py-5 rounded-2xl bg-emerald-500 text-black font-extrabold text-xl hover:bg-emerald-400 transition-all hover:scale-105 shadow-2xl shadow-emerald-500/20"
                        >
                            Apply for Verification
                        </button>
                    </div>
                ) : (
                    <div className="p-8 md:p-12 rounded-[40px] bg-white/[0.03] border border-white/10 text-left">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold">Apply for Verification</h2>
                            <button onClick={() => setIsApplying(false)} className="text-white/40 hover:text-white transition-colors">Cancel</button>
                        </div>

                        {formStatus === 'success' ? (
                            <div className="py-12 text-center space-y-4">
                                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h3 className="text-2xl font-bold">Application Submitted</h3>
                                <p className="text-white/50">We have received your request. Applications are typically reviewed within 48-72 hours. Your current status is <span className="text-emerald-400 font-bold">Pending</span>.</p>
                                <button
                                    onClick={() => setIsApplying(false)}
                                    className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all mt-8"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">Connected Wallet</label>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-white/30 truncate text-sm">
                                        {publicKey?.toBase58()}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">Organization Name *</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Acme Corp"
                                            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500/50 outline-none transition-all"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">Org Type *</label>
                                        <select
                                            className="w-full p-4 rounded-xl bg-[#111111] border border-white/10 focus:border-emerald-500/50 outline-none transition-all text-white appearance-none cursor-pointer"
                                            style={{ colorScheme: 'dark' }}
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="Company" className="bg-[#111111] text-white">Company</option>
                                            <option value="DAO" className="bg-[#111111] text-white">DAO</option>
                                            <option value="Community" className="bg-[#111111] text-white">Community</option>
                                            <option value="Agency" className="bg-[#111111] text-white">Agency</option>
                                            <option value="Figure" className="bg-[#111111] text-white">Figure</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">Website / Social Link *</label>
                                    <input
                                        required
                                        type="url"
                                        placeholder="https://..."
                                        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500/50 outline-none transition-all"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">Verification Proof (Optional)</label>
                                    <textarea
                                        placeholder="Link to a tweet, GitHub org, or any evidence that you own this brand/entity."
                                        rows={4}
                                        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500/50 outline-none transition-all resize-none"
                                        value={formData.proof}
                                        onChange={(e) => setFormData({ ...formData, proof: e.target.value })}
                                    />
                                </div>

                                {formStatus === 'error' && (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                        {errorMessage}
                                    </div>
                                )}

                                <button
                                    disabled={formStatus === 'submitting'}
                                    className="w-full py-5 rounded-2xl bg-emerald-500 text-black font-bold text-xl hover:bg-emerald-400 transition-all disabled:opacity-50"
                                >
                                    {formStatus === 'submitting' ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </section>

            <div className="relative z-10">
                <Footer />
            </div>
        </main>
    );
}
