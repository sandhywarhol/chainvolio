"use client";

import React, { useState } from "react";
import SimpleDiagram from "@/components/landing/SimpleDiagram";
import CompetitiveNetworkDiagram from "@/components/landing/CompetitiveNetworkDiagram";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
    Search, 
    Workflow, 
    Layers, 
    Briefcase, 
    Users, 
    ShieldCheck, 
    CheckCircle2, 
    UserPlus, 
    Link as LinkIcon, 
    Zap, 
    Activity, 
    Search as SearchIcon,
    Award,
    FileCheck,
    Cpu,
    MousePointer2,
    Lock,
    Target,
    Shield,
    Magnet,
    RefreshCw,
    Globe
} from "lucide-react";
import Link from "next/link";

export default function HowItWorksPage() {
  const [showFullDiagram, setShowFullDiagram] = useState(false);

  return (
    <main className="h-screen flex flex-col relative selection:bg-teal-500/30 selection:text-white overflow-x-hidden bg-black">

      {/* Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[160px] rounded-full" />
          <div className="absolute top-[30%] -right-[10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[160px] rounded-full" />
          <div className="absolute bottom-[5%] left-[20%] w-[40%] h-[40%] bg-blue-500/5 blur-[160px] rounded-full" />
      </div>

      <Navbar />
      
      <div className="flex-1 flex overflow-hidden relative z-10 pt-24">
        <div className="max-w-6xl mx-auto w-full flex overflow-hidden px-6">
          {/* Navigation Sidebar */}
          <aside className="hidden lg:block w-1/4 space-y-8 overflow-y-auto h-full py-12 pr-8 scrollbar-hide">
            <nav className="space-y-2">
              <p className="text-caption text-white/20 mb-6 flex items-center gap-2">
                  <Search className="w-3 h-3" /> Introduction
              </p>
              {[
                  { label: "Overview", href: "#overview" },
                  { label: "Architecture", href: "#architecture" },
                  { label: "Workflow", href: "#workflow" },
                  { label: "Features", href: "#features" }
              ].map((item, i) => (
                  <a key={i} href={item.href} className="block text-body text-sm opacity-40 hover:opacity-100 transition-all py-2.5 border-l border-white/5 pl-6 hover:border-emerald-500 font-medium tracking-tight">
                      {item.label}
                  </a>
              ))}
            </nav>

            <nav className="space-y-2">
              <p className="text-caption text-white/20 mb-6 flex items-center gap-2">
                  <Briefcase className="w-3 h-3" /> For Recruiters
              </p>
              {[
                  { label: "Hiring Flow", href: "#hiring-flow" },
                  { label: "Candidate Evaluation", href: "#candidate-evaluation" },
                  { label: "Attestation Advantage", href: "#attestation-advantage" },
                  { label: "Attestation Usage", href: "#attestation-usage" }
              ].map((item, i) => (
                  <a key={i} href={item.href} className="block text-body text-sm opacity-40 hover:opacity-100 transition-all py-2.5 border-l border-white/5 pl-6 hover:border-emerald-500 font-medium tracking-tight">
                      {item.label}
                  </a>
              ))}
            </nav>

            <nav className="space-y-2">
              <p className="text-caption text-white/20 mb-6 flex items-center gap-2">
                  <Users className="w-3 h-3" /> For Talent
              </p>
              {[
                  { label: "Build Profile", href: "#build-profile" },
                  { label: "Add Proof of Work", href: "#add-proof" },
                  { label: "Get Attested", href: "#get-attested" }
              ].map((item, i) => (
                  <a key={i} href={item.href} className="block text-body text-sm opacity-40 hover:opacity-100 transition-all py-2.5 border-l border-white/5 pl-6 hover:border-emerald-500 font-medium tracking-tight">
                      {item.label}
                  </a>
              ))}
            </nav>
          </aside>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto h-full px-8 lg:px-12 py-12 space-y-32 scrollbar-hide scroll-smooth pb-32">
            {/* Header */}
            <header id="overview" className="space-y-8 scroll-mt-[120px]">
              <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-full w-fit">
                <Workflow className="w-4 h-4 text-emerald-400" />
                <span className="text-caption text-emerald-400/80">System Documentation</span>
              </div>
              <h1 className="text-h1">
                  How It <span className="text-white/20">Works.</span>
              </h1>
              <div className="space-y-6 max-w-3xl">
                <p className="text-body text-xl italic border-l-2 border-emerald-500/20 pl-8 bg-emerald-500/[0.01] py-6 rounded-r-3xl">
                  "ChainVolio is a verifiable professional identity layer that turns work history into cryptographic reputation.<br />
                  We connect talent and recruiters through on-chain proof and attestations."
                </p>
                <p className="text-body opacity-60 leading-relaxed">
                  The recruitment industry suffers from high information asymmetry. Resumes are static, self-claimed, and hard to verify. ChainVolio solves this by creating a <strong>Crystalline Identity</strong>: a multifaceted professional record where every milestone is anchored to a blockchain transaction and backed by peer-issued attestations.
                </p>
              </div>
            </header>

            <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />

            {/* ARCHITECTURE DIAGRAMS */}
            <section id="architecture" className="space-y-16 scroll-mt-[120px]">
              <div className="flex items-center gap-4">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <h2 className="text-h2">System Architecture</h2>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white tracking-tight">Flow Overview</h3>
                <p className="text-body opacity-60 text-sm leading-relaxed max-w-2xl">
                  How your work signals travel from source through verification into a portable, trusted reputation.
                </p>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[640px]">
                  <SimpleDiagram />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setShowFullDiagram(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-white/40 hover:text-white/70 text-[11px] font-bold tracking-wider transition-all"
                >
                  View full architecture
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                  </svg>
                </button>
              </div>
            </section>

            {showFullDiagram && (
              <div
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-md"
                onClick={() => setShowFullDiagram(false)}
              >
                <div
                  className="relative w-full max-w-6xl bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[11px] font-black tracking-[0.15em] text-white/40">Full architecture</span>
                    </div>
                    <button
                      onClick={() => setShowFullDiagram(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/30 hover:text-white transition-all"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                  <div className="p-6 overflow-x-auto">
                    <div className="min-w-[800px]">
                      <CompetitiveNetworkDiagram />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />

            {/* WORKFLOW */}
            <section id="workflow" className="space-y-12 scroll-mt-[120px]">
              <div className="flex items-center gap-4">
                <Activity className="w-5 h-5 text-blue-400" />
                <h2 className="text-h2">The Workflow</h2>
              </div>
              
              <div className="space-y-12">
                {[
                  { step: "01", title: "Initialize Identity", desc: "Connect your Solana wallet to establish your non-custodial profile. There are no fees to initialize your identity, ensuring the platform remains accessible to all global talent." },
                  { step: "02", title: "Structure Your Proof", desc: "Document your career milestones, project roles, and technical achievements. Our 'Proof of Work' engine structures these claims into a machine-readable format ready for verification." },
                  { step: "03", title: "Secure Attestations", desc: "Request validation from collaborators, founders, or clients. These attestations are signed by the verifier's wallet, creating an immutable bond between your claim and their professional authority." },
                  { step: "04", title: "Crystallize Reputation", desc: "Our engine aggregates your work history and attestations into a unified Reputation Score. This score reflects your technical depth, social trust, and professional consistency over time." },
                  { step: "05", title: "Deploy Globally", desc: "Share your live, verifiable CV link with recruiters or DAOs. Unlike a PDF, your ChainVolio profile updates in real-time and provides one-click proof for every claim listed." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-emerald-400 font-mono font-bold group-hover:border-emerald-500/30 transition-all shadow-2xl">
                      {item.step}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{item.title}</h3>
                      <p className="text-body opacity-60 group-hover:opacity-100 transition-opacity max-w-2xl leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FEATURES */}
            <section id="features" className="space-y-12 scroll-mt-[120px]">
              <div className="flex items-center gap-4">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h2 className="text-h2">Technical Features</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                    { icon: <ShieldCheck className="w-5 h-5" />, title: "Zero-Knowledge Claims", desc: "Anchor your professional milestones without revealing sensitive project details. Our system supports private verification triggers for corporate confidentiality.", color: "emerald" },
                    { icon: <Zap className="w-5 h-5" />, title: "Instant Signal Screening", desc: "Recruiters use our API and dashboard to filter thousands of candidates based on verified skills, eliminating 90% of manual due diligence.", color: "blue" },
                    { icon: <Award className="w-5 h-5" />, title: "Institutional Trust Issuers", desc: "Top Web3 organizations act as 'Trust Issuers,' providing high-authority attestations that carry significant weight in the talent market.", color: "purple" },
                    { icon: <FileCheck className="w-5 h-5" />, title: "Portable Reputation", desc: "Your identity is stored on-chain. If ChainVolio ever disappears, your proofs and attestations remain accessible on the Solana network.", color: "cyan" }
                ].map((item, i) => (
                    <div key={i} className="p-10 bg-white/[0.01] border border-white/[0.03] rounded-2xl space-y-6 hover:border-white/10 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent group-hover:via-emerald-500/30 transition-all" />
                      <div className={`p-4 rounded-2xl bg-white/[0.03] text-white/40 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors w-fit shadow-xl`}>
                        {item.icon}
                      </div>
                      <h3 className="text-xl font-bold text-white tracking-tight">{item.title}</h3>
                      <p className="text-body opacity-60 group-hover:opacity-100 transition-opacity leading-relaxed">{item.desc}</p>
                    </div>
                ))}
              </div>
            </section>

            <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />

            {/* FOR RECRUITERS */}
            <section id="hiring-flow" className="space-y-12 scroll-mt-[120px]">
              <div className="flex items-center gap-4">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <h2 className="text-h2">For Recruiters</h2>
              </div>
              
              <div className="space-y-20">
                <div id="hiring-flow-detail" className="space-y-8">
                  <h3 className="text-2xl font-bold text-white tracking-tight">THE HIRING FLOW</h3>
                  <p className="text-body opacity-60 max-w-3xl leading-relaxed">
                    Recruiters use ChainVolio as a primary source of truth. By requiring candidates to provide a ChainVolio link, you shift the burden of proof back to the applicant and their network, ensuring that only high-integrity talent enters your pipeline.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { step: "1", title: "Source", desc: "Discover talent through our curated Talent Collections or by asking candidates for their verified link." },
                      { step: "2", title: "Evaluate", desc: "Review candidate Trust Scores, which synthesize their on-chain history and peer-backed attestations." },
                      { step: "3", title: "Hire", desc: "Close candidates with confidence, knowing their professional history has been cryptographically confirmed." }
                    ].map((s, idx) => (
                      <div key={idx} className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 hover:bg-emerald-500/[0.02] transition-colors group">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold group-hover:scale-110 transition-transform">{s.step}</div>
                        <h4 className="font-bold text-white uppercase tracking-wider text-sm">{s.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div id="candidate-evaluation" className="space-y-8">
                  <h3 className="text-2xl font-bold text-white tracking-tight">CANDIDATE SIGNALS</h3>
                  <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <h4 className="text-emerald-400 text-sm font-bold uppercase tracking-widest">Authority Score</h4>
                      <p className="text-body opacity-60 leading-relaxed">
                        Not all attestations are equal. ChainVolio weights verifications based on the authority of the signer. A founding team member's attestation carries more weight than a random peer, allowing you to weigh seniority and institutional trust.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-blue-400 text-sm font-bold uppercase tracking-widest">Signal Density</h4>
                      <p className="text-body opacity-60 leading-relaxed">
                        We analyze the frequency and consistency of a candidate's work records. High signal density-multiple proofs over several months-indicates a reliable professional with a proven track record of output.
                      </p>
                    </div>
                  </div>
                </div>

                <div id="attestation-advantage" className="space-y-12 border-t border-white/5 pt-12">
                  <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-white tracking-tight uppercase">Turn Every Endorsement into a Hiring Advantage</h3>
                      <p className="text-body opacity-60 max-w-3xl leading-relaxed">
                          On ChainVolio, giving an attestation is more than recognition - it’s a way to build trust, attract talent, and strengthen your hiring signal.
                      </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {[
                          {
                              icon: <Target className="w-5 h-5 text-emerald-400" />,
                              title: "Identify Talent with Proven Work",
                              items: ["Attestations are based on real contributions, not claims", "Validate actual work experience", "See who else trusts the candidate", "Hire with confidence"]
                          },
                          {
                              icon: <Shield className="w-5 h-5 text-blue-400" />,
                              title: "Strengthen Your Hiring Signal",
                              items: ["Every attestation becomes a public signal", "Shows what kind of talent you value", "Builds your reputation as a serious builder", "Increases candidate trust in your brand"]
                          },
                          {
                              icon: <Magnet className="w-5 h-5 text-indigo-400" />,
                              title: "Attract Better Candidates",
                              items: ["Top talent prefers recognition from credible sources", "Candidates want to be endorsed by you", "Your organization becomes a talent magnet", "Reduces reliance on cold outreach"]
                          },
                          {
                              icon: <RefreshCw className="w-5 h-5 text-cyan-400" />,
                              title: "Build a Compounding Trust Loop",
                              items: ["Each attestation: increases the candidate's trust", "Reinforces your credibility as an issuer", "Creates a network effect of trust"]
                          },
                          {
                              icon: <Globe className="w-5 h-5 text-amber-400" />,
                              title: "Verifiable Network",
                              items: ["Attestations are transparent, traceable, and verifiable", "Contribute to a trust layer, not just a hiring pipeline"]
                          }
                      ].map((block, i) => (
                          <div key={i} className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6 hover:bg-white/[0.04] transition-all group overflow-hidden relative">
                              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="p-3 bg-white/[0.03] rounded-2xl w-fit group-hover:scale-110 transition-transform">
                                  {block.icon}
                              </div>
                              <h4 className="font-bold text-white text-lg tracking-tight leading-snug">{block.title}</h4>
                              <ul className="space-y-3">
                                  {block.items.map((item, j) => (
                                      <li key={j} className="flex gap-3 text-xs text-slate-400 leading-relaxed font-medium">
                                          <span className="text-emerald-500 opacity-50">→</span>
                                          {item}
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      ))}
                  </div>

                  <div className="p-8 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10 text-center">
                      <p className="text-emerald-400 font-bold italic italic text-sm">
                          "Give fewer, better attestations - and let them speak for your brand."
                      </p>
                  </div>
                </div>

                <div id="attestation-usage" className="space-y-8 border-t border-white/5 pt-12">
                   <div className="flex flex-col md:flex-row gap-12 items-center">
                      <div className="flex-1 space-y-6">
                        <h3 className="text-2xl font-bold text-white tracking-tight">BECOME A TRUST ISSUER</h3>
                        <p className="text-body opacity-60 leading-relaxed">
                          Verified organizations can issue direct attestations to their employees and contractors. This builds your reputation as a primary talent incubator and helps secure the professional future of your best team members.
                        </p>
                      </div>
                      <div className="w-full md:w-1/3 p-8 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl text-center group">
                          <p className="text-emerald-400 font-bold text-sm mb-2 group-hover:scale-110 transition-transform">Verification Hub</p>
                          <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Scale Your Impact</p>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />

            {/* FOR TALENT */}
            <section id="build-profile" className="space-y-12 scroll-mt-[120px]">
              <div className="flex items-center gap-4">
                <Users className="w-5 h-5 text-blue-400" />
                <h2 className="text-h2">For Talent</h2>
              </div>
              
              <div className="space-y-20">
                <div id="build-profile-detail" className="space-y-8">
                  <h3 className="text-2xl font-bold text-white tracking-tight uppercase">Sovereign Identity persistence</h3>
                  <p className="text-body opacity-60 leading-relaxed max-w-3xl">
                    Your ChainVolio profile is your permanent professional home in Web3. It is wallet-driven, meaning you own your data and your reputation travels with you across the ecosystem. Unlike LinkedIn, your profile cannot be de-platformed or deleted by a centralized authority.
                  </p>
                </div>

                <div id="add-proof" className="space-y-12">
                   <div className="grid md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white tracking-tight uppercase">Proof of Work Engine</h3>
                        <p className="text-body opacity-60 leading-relaxed">
                          Our system allows you to link disparate professional fragments-GitHub contributions, on-chain commits, and project roles-into a single, cohesive narrative. Every entry is stamped as a candidate for cryptographic attestation.
                        </p>
                      </div>
                      <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white tracking-tight uppercase">Soul-Bound Verification</h3>
                        <p className="text-body opacity-60 leading-relaxed">
                          Attestations are essentially 'soul-bound' professional facts. They are tied to your identity and increase your market value by providing recruiters with instant, one-click confirmation of your skills and experience.
                        </p>
                      </div>
                   </div>
                </div>

                <div id="get-attested" className="space-y-8 border-t border-white/5 pt-12">
                  <div className="flex items-center gap-6 p-10 bg-blue-500/[0.03] border border-blue-500/10 rounded-2xl group">
                    <div className="hidden md:flex w-20 h-20 rounded-2xl bg-white/[0.03] items-center justify-center text-blue-400 group-hover:scale-110 transition-transform flex-shrink-0">
                        <Award className="w-10 h-10" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-white tracking-tight uppercase">The Currency of Trust</h3>
                      <p className="text-body opacity-60 leading-relaxed">
                        Don't just claim expertise: prove it. Attestations are the currency of trust in ChainVolio. Request them from colleagues, clients, or managers to turn your work history into an unshakeable cryptographic fact.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Final Call to Action */}
            <section className="relative z-40 md:py-24 md:px-8 pt-16 pb-20 px-4 border-t border-white/[0.03] h-auto">
                <div className="p-10 md:p-16 bg-white/[0.01] border border-white/[0.03] rounded-2xl text-center space-y-10 relative overflow-hidden group flex flex-col items-center justify-start h-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative z-10 flex flex-col items-center w-full space-y-8 md:space-y-10">
                        <div className="p-5 rounded-2xl bg-white/[0.03] w-fit mx-auto">
                          <UserPlus className="w-10 h-10 text-white/40" />
                        </div>
                        <div className="space-y-4 w-full">
                            <h3 className="text-3xl md:text-h2 md:!text-4xl text-white font-bold">Start Building Today.</h3>
                            <p className="text-body text-lg italic opacity-40 w-full max-w-sm mx-auto text-center">
                              "Be among the first professionals to secure your reputation on-chain."
                            </p>
                        </div>
                        <Link href="/create-profile" className="mt-8 px-12 py-5 bg-white text-slate-950 font-bold rounded-2xl hover:bg-slate-100 transition-all shadow-white/5 text-caption !text-slate-950 flex items-center justify-center gap-3 mx-auto w-fit">
                          Create Your Profile
                        </Link>
                    </div>
                </div>
            </section>
            
            <Footer />
          </div>
        </div>
      </div>
    </main>
  );
}
