"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WalletMultiButton } from "@/components/wallet/WalletButton";

export default function LandingPage() {
  const [activeModal, setActiveModal] = useState<'features' | 'how' | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const SLIDES = [
    { src: "/homepage/cv view.png", label: "Professional Profile" },
    { src: "/homepage/dashboard.png", label: "Recruiter Dashboard" },
    { src: "/homepage/edit profile.png", label: "Profile Customization" },
    { src: "/homepage/link recruit.png", label: "Hiring Links" },
    { src: "/homepage/proof of work.png", label: "Verifiable Work" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between px-8 py-3 max-w-[1600px] w-full mx-auto relative z-[100] border-b border-white/5">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-1.5 group">
            <img src="/chainvolio logo.png" alt="ChainVolio Logo" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold text-white/90">chainvolio</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-xs font-bold uppercase">
            <button onClick={() => setActiveModal('features')} className="text-white/40 hover:text-white/90 transition-colors">Features</button>
            <button onClick={() => setActiveModal('how')} className="text-white/40 hover:text-white/90 transition-colors">How it Works</button>
            <Link href="/why" className="text-white/40 hover:text-white/90 transition-colors normal-case">Why chainvolio</Link>
            <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 transition-colors normal-case">Dashboard</Link>
          </div>
        </div>
        <WalletMultiButton />
      </nav>

      {/* Hero Section */}
      <section className="flex-1 max-w-[1240px] w-full mx-auto px-12 relative z-40 flex flex-col lg:flex-row items-center justify-between py-12 gap-16">
        <div className="text-left max-w-xl lg:w-1/2">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-[1.1] tracking-tighter mb-8 text-white">
            Verifiable portfolios<br />
            for Web3 careers.
          </h1>

          {/* Subheading */}
          <p className="text-white/60 text-lg md:text-xl font-display leading-relaxed mb-12 max-w-xl tracking-tight">
            Build a work history that can't be faked. Verifiable achievements.
            The most trusted way to grow your Web3 career.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-start gap-4">
            <Link
              href="/create-profile"
              className="w-full sm:w-auto px-8 py-3.5 solana-glossy-button text-white font-semibold text-base whitespace-nowrap"
            >
              Build your CV
            </Link>
            <Link
              href="/hiring/create"
              className="w-full sm:w-auto px-8 py-3.5 hiring-glossy-button text-white font-semibold text-base whitespace-nowrap"
            >
              Hire Talent
            </Link>
          </div>
        </div>

        {/* Image Slider Section */}
        <div className="lg:w-[48%] w-full relative group" style={{ perspective: '2000px' }}>
          <div
            className="relative aspect-[16/10] w-full overflow-hidden rounded-xl transition-transform duration-700 ease-out group-hover:rotate-y-[-15deg] group-hover:rotate-x-[5deg]"
            style={{
              transform: 'rotateY(-30deg) rotateX(12deg) scale(1.1)',
              transformStyle: 'preserve-3d',
              maskImage: 'linear-gradient(to bottom, black 80%, transparent), linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent), linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
              maskComposite: 'intersect',
              WebkitMaskComposite: 'source-in',
              boxShadow: '0 0 100px black'
            }}
          >
            {SLIDES.map((slide, index) => (
              <div
                key={slide.src}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
              >
                <img
                  src={slide.src}
                  alt={slide.label}
                  className="w-full h-full object-cover object-top opacity-80"
                />
              </div>
            ))}
          </div>


          {/* Manual Controls */}
          <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setCurrentSlide(prev => (prev - 1 + SLIDES.length) % SLIDES.length)}
              className="p-2 rounded-full bg-black/40 text-white/70 hover:bg-black/60 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentSlide(prev => (prev + 1) % SLIDES.length)}
              className="p-2 rounded-full bg-black/40 text-white/70 hover:bg-black/60 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex justify-center gap-2 mt-12 relative z-50">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-white w-6" : "bg-white/20 hover:bg-white/40"
                  }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer Area - Pinned to bottom */}
      <div className="w-full relative z-40 pb-12">
        {/* Logo Marquee Section */}
        <div className="w-full py-10 overflow-hidden relative bg-black/5 backdrop-blur-sm">
          <div className="flex animate-marquee whitespace-nowrap items-center w-max">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-32 items-center flex-shrink-0 pr-32">
                {PARTNERS.map((partner) => (
                  <CryptoLogo
                    key={`${i}-${partner.name}`}
                    src={partner.src}
                    name={partner.name}
                    scale={partner.scale}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Info */}
        <div className="w-full border-t border-white/5 pt-8 text-center bg-white/[0.02] backdrop-blur-md">
          <p className="text-xs text-white/20 uppercase tracking-[0.2em]">
            Powered by Solana · Free to use · No tokens required
          </p>
        </div>
      </div>

      {/* Modal Overlay */}
      {activeModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative border border-white/20 rounded-sm max-w-3xl w-full max-h-[80vh] overflow-hidden group"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video Background */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-70"
            >
              <source src="/box navigation.mp4" type="video/mp4" />
            </video>

            {/* Content Container with Scroll */}
            <div className="relative z-10 p-8 md:p-12 bg-black/40 backdrop-blur-sm max-h-[80vh] overflow-y-auto custom-scrollbar">
              {/* Close button */}
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-white/40 hover:text-white/90 transition-colors text-2xl z-20"
              >
                ×
              </button>

              {activeModal === 'features' && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-light tracking-tight border-b border-white/10 pb-4">Features</h2>

                  <div className="space-y-6">
                    <div className="border-l-2 border-white/20 pl-6">
                      <h3 className="text-sm font-bold tracking-wider uppercase text-white/90 mb-2">Blockchain Verification</h3>
                      <p className="text-xs text-white/60 leading-relaxed">
                        Every work entry is timestamped on the Solana blockchain, creating an immutable record that cannot be altered or faked.
                      </p>
                    </div>

                    <div className="border-l-2 border-white/20 pl-6">
                      <h3 className="text-sm font-bold tracking-wider uppercase text-white/90 mb-2">Cryptographic Signatures</h3>
                      <p className="text-xs text-white/60 leading-relaxed">
                        Work history can be attested by employers or colleagues using wallet signatures, providing cryptographic proof of authenticity.
                      </p>
                    </div>

                    <div className="border-l-2 border-white/20 pl-6">
                      <h3 className="text-sm font-bold tracking-wider uppercase text-white/90 mb-2">Public Sharing</h3>
                      <p className="text-xs text-white/60 leading-relaxed">
                        Share your CV with anyone via a simple link. No login required for viewers. Fully transparent and verifiable.
                      </p>
                    </div>

                    <div className="border-l-2 border-white/20 pl-6">
                      <h3 className="text-sm font-bold tracking-wider uppercase text-white/90 mb-2">Portfolio Integration</h3>
                      <p className="text-xs text-white/60 leading-relaxed">
                        Attach images, links, and evidence to each work entry. Showcase your actual work alongside your credentials.
                      </p>
                    </div>

                    <div className="border-l-2 border-white/20 pl-6">
                      <h3 className="text-sm font-bold tracking-wider uppercase text-white/90 mb-2">Zero Cost</h3>
                      <p className="text-xs text-white/60 leading-relaxed">
                        Completely free to use. No tokens, no NFTs, no hidden fees. Just pure infrastructure for career verification.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'how' && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-light tracking-tight border-b border-white/10 pb-4">How it Works</h2>

                  <div className="space-y-6">
                    <div className="flex gap-6">
                      <div className="text-4xl font-light text-white/20">01</div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold tracking-wider uppercase text-white/90 mb-2">Connect Wallet</h3>
                        <p className="text-xs text-white/60 leading-relaxed">
                          Securely log in using your Solana wallet. This creates your unique cryptographic identifier on the platform.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-6">
                      <div className="text-4xl font-light text-white/20">02</div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold tracking-wider uppercase text-white/90 mb-2">Build Profile</h3>
                        <p className="text-xs text-white/60 leading-relaxed">
                          Enter your display name, bio, and professional links. Upload an avatar and define your work preferences.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-6">
                      <div className="text-4xl font-light text-white/20">03</div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold tracking-wider uppercase text-white/90 mb-2">Add Work Proof</h3>
                        <p className="text-xs text-white/60 leading-relaxed">
                          Submit your past projects or roles. Each entry is recorded on-chain with evidence and timestamps.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-6">
                      <div className="text-4xl font-light text-white/20">04</div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold tracking-wider uppercase text-white/90 mb-2">Get Attestations</h3>
                        <p className="text-xs text-white/60 leading-relaxed">
                          Invite collaborators to verify your work. Their cryptographic signatures add a layer of peer-vetted trust to your profile.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-6">
                      <div className="text-4xl font-light text-white/20">05</div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold tracking-wider uppercase text-white/90 mb-2">Share Your CV</h3>
                        <p className="text-xs text-white/60 leading-relaxed mb-3">
                          Get a public link to your CV. Anyone can view it without logging in. All work history is verifiable on the blockchain.
                        </p>
                      </div>
                    </div>
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
