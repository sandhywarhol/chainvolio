"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function WhitepaperPage() {
    return (
        <main className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-teal-500/30 selection:text-white">
            {/* Very subtle noise texture */}
            <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            <Navbar />

            {/* Hero Section */}
            <section className="relative z-40 pt-24 pb-20 px-8 max-w-[900px] mx-auto w-full text-center">
                <div className="inline-block px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] mb-8">
                    <span className="text-[9px] uppercase tracking-[0.4em] font-medium text-teal-400/60">Whitepaper</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tighter text-white leading-[0.85] mb-8">
                    ChainVolio
                </h1>

                <p className="text-lg md:text-2xl text-white/50 leading-relaxed mx-auto font-light tracking-tight pb-8 border-b border-white/10">
                    A Hybrid On-Chain Attestation Infrastructure for Professional Identity in Web3
                </p>
            </section>

            {/* Content Section */}
            <section className="relative z-40 py-12 px-8 max-w-[800px] mx-auto w-full space-y-16">

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Executive Summary</h2>
                    <div className="space-y-4 text-white/60 font-light leading-relaxed text-sm md:text-base">
                        <p>ChainVolio is a professional identity infrastructure designed for the Web3 economy.</p>
                        <p>It enables verifiable career records and structured attestations anchored on Solana while maintaining flexible off-chain data storage. The system combines cryptographic integrity, wallet-based authorship, and immutable timestamping to create a trust-minimized layer for career validation.</p>
                        <p>ChainVolio is not a token project. It is not a speculative protocol. It is a foundational identity layer built to support global, remote, wallet-native professional ecosystems.</p>
                        <p>The long-term vision is to become the standard infrastructure for portable, verifiable career identity across platforms through API integration.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Problem Statement</h2>
                    <div className="space-y-4 text-white/60 font-light leading-relaxed text-sm md:text-base">
                        <p>Professional identity today is fragmented, static, and easily manipulated.</p>
                        <p>Traditional hiring systems rely on PDFs, self-declared resumes, and closed reference checks. Verification is manual and inconsistent. Digital portfolios lack cryptographic authorship. Web3 contributors operate globally but lack a standardized identity layer native to wallets.</p>
                        <p>The market lacks:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Immutable authorship of career attestations</li>
                            <li>Verifiable timestamped work validations</li>
                            <li>Wallet-native professional identity</li>
                            <li>Infrastructure designed for remote, borderless talent</li>
                        </ul>
                        <p>Web3 created financial infrastructure without creating professional identity infrastructure. ChainVolio addresses this gap.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Core Architecture Overview</h2>
                    <div className="space-y-4 text-white/60 font-light leading-relaxed text-sm md:text-base">
                        <p>ChainVolio implements a hybrid attestation model. The system separates data availability from data integrity while anchoring trust on-chain.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white tracking-tight text-teal-400">On-Chain Layer</h2>
                    <div className="space-y-4 text-white/60 font-light leading-relaxed text-sm md:text-base">
                        <p>ChainVolio uses the Solana SPL Memo Program. It does not deploy a custom smart contract and does not allocate program-derived accounts for storage.</p>
                        <p>When an attestation is submitted:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>The issuer signs with their wallet</li>
                            <li>A Solana transaction is created</li>
                            <li>A compact JSON payload is attached to the Memo instruction</li>
                            <li>Gas fees are paid</li>
                            <li>The transaction is permanently recorded on Solana</li>
                        </ul>
                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-md my-4 font-mono text-xs">
                            The payload contains:<br />
                            <span className="text-white/40">protocol identifier | attestation type | description | cv_id | memo_id | issuer wallet | issued timestamp | content_hash (SHA-256 hash of the full off-chain attestation data)</span>
                        </div>
                        <p>Maximum enforced payload size is 566 bytes. What is stored on-chain is not the full attestation. It is a content hash and contextual reference identifiers.</p>
                        <p>Solana acts as: A verification anchor, A timestamp layer, An immutable authorship log. It is not used as a general-purpose data storage layer.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white tracking-tight text-teal-400">Off-Chain Layer</h2>
                    <div className="space-y-4 text-white/60 font-light leading-relaxed text-sm md:text-base">
                        <p>The full structured attestation payload is stored in the ChainVolio database. This includes: Ratings, Performance metrics, Text comments, Role descriptions, and Contributor names.</p>
                        <p>The canonical attestation data exists off-chain. However, the off-chain data is cryptographically bound to the on-chain hash.</p>
                        <p className="border-l-2 border-teal-500/50 pl-4 py-1 italic">
                            If any character in the stored data is altered, the SHA-256 hash will no longer match the on-chain record. This renders the attestation cryptographically invalid.
                        </p>
                        <p>This creates strong integrity guarantees without incurring high on-chain storage costs.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Verification Model</h2>
                    <div className="space-y-4 text-white/60 font-light leading-relaxed text-sm md:text-base">
                        <p>ChainVolio provides two levels of verification:</p>
                        <div className="space-y-6 mt-4">
                            <div>
                                <h3 className="font-bold text-white mb-2">Level 1: On-Chain Proof</h3>
                                <p>Anyone can verify that:</p>
                                <ul className="list-disc pl-5 space-y-1 mt-2">
                                    <li>A specific wallet signed an attestation</li>
                                    <li>The action occurred at an exact timestamp</li>
                                    <li>The attestation references a specific CV snapshot</li>
                                    <li>The transaction exists on Solana</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-2">Level 2: Content Integrity Validation</h3>
                                <p>Given the full attestation payload:</p>
                                <ul className="list-disc pl-5 space-y-1 mt-2">
                                    <li>A third party can recompute the SHA-256 hash</li>
                                    <li>Compare it against the on-chain content_hash</li>
                                    <li>Confirm the payload has not been altered</li>
                                </ul>
                            </div>
                        </div>
                        <p className="mt-6">Without access to the off-chain payload, the blockchain provides proof of existence and authorship, but not full content reconstruction. This is a deliberate architectural choice balancing cost, scalability, and integrity.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Current Decentralization Model</h2>
                    <div className="space-y-4 text-white/60 font-light leading-relaxed text-sm md:text-base">
                        <p>ChainVolio is hybrid, not fully decentralized.</p>
                        <div className="grid md:grid-cols-2 gap-8 my-6">
                            <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-md">
                                <h3 className="font-bold text-emerald-400 mb-2">What survives if infrastructure is shut down:</h3>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    <li>Immutable proof that Wallet X issued an attestation</li>
                                    <li>Timestamp</li>
                                    <li>Transaction record</li>
                                    <li>Content hash</li>
                                </ul>
                            </div>
                            <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-md">
                                <h3 className="font-bold text-red-400 mb-2">What does not survive:</h3>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    <li>Full attestation content</li>
                                    <li>CV snapshot text</li>
                                    <li>Structured rating data</li>
                                </ul>
                            </div>
                        </div>
                        <p>Data availability currently depends on the centralized server. However, data integrity does not. This distinction is critical.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Why Not Fully On-Chain Storage</h2>
                    <div className="space-y-4 text-white/60 font-light leading-relaxed text-sm md:text-base">
                        <p>Storing structured career records directly on-chain would introduce: High transaction costs, Data size limitations, Privacy constraints, and Poor user experience.</p>
                        <p>ChainVolio instead prioritizes: High throughput, Low cost, Practical scalability, and Cryptographic integrity. This architecture is optimized for real-world adoption.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Governance and Authenticity Controls</h2>
                    <div className="space-y-4 text-white/60 font-light leading-relaxed text-sm md:text-base">
                        <p>ChainVolio does not implement token governance. Governance refers to operational integrity and platform trust.</p>
                        <p>Administrative controls are implemented to: Prevent fraudulent corporate impersonation, Validate organizational accounts, Reduce fake attestations, and Enforce verification policies.</p>
                        <p>The goal is to prevent a malicious actor from claiming to represent a large organization without validation. Future governance layers may introduce decentralized verification mechanisms, but current focus is operational integrity.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white tracking-tight">API Vision and Platform Standardization</h2>
                    <div className="space-y-4 text-white/60 font-light leading-relaxed text-sm md:text-base">
                        <p>The long-term objective is interoperability. ChainVolio is designed to become: An identity verification API, A career attestation infrastructure layer, A portable professional reputation system.</p>
                        <p>Future API capabilities may allow:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Hiring platforms to query verified attestations</li>
                            <li>DAOs to verify contributor history</li>
                            <li>Talent marketplaces to integrate wallet-native profiles</li>
                            <li>Protocols to request identity validation via attestation proofs</li>
                        </ul>
                        <p>The vision is to create a universal professional identity anchor that can be embedded across platforms.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Roadmap</h2>
                    <div className="space-y-6 text-white/60 font-light leading-relaxed text-sm md:text-base">

                        <div className="border-l border-white/10 pl-6 relative">
                            <div className="absolute w-2 h-2 bg-teal-500 rounded-full -left-[4.5px] top-1.5 shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div>
                            <h3 className="font-bold text-white mb-2 uppercase tracking-widest text-xs">Phase 1</h3>
                            <p>Hybrid attestation infrastructure live on Solana. Wallet-signed attestations. Hash anchoring via SPL Memo. Off-chain structured data.</p>
                        </div>

                        <div className="border-l border-white/10 pl-6 relative">
                            <div className="absolute w-2 h-2 bg-white/20 rounded-full -left-[4.5px] top-1.5"></div>
                            <h3 className="font-bold text-white mb-2 uppercase tracking-widest text-xs">Phase 2</h3>
                            <p>Optional decentralized storage integration. IPFS or Arweave mirroring of attestation payloads. Improved data permanence.</p>
                        </div>

                        <div className="border-l border-white/10 pl-6 relative">
                            <div className="absolute w-2 h-2 bg-white/20 rounded-full -left-[4.5px] top-1.5"></div>
                            <h3 className="font-bold text-white mb-2 uppercase tracking-widest text-xs">Phase 3</h3>
                            <p>Public verification API. Cross-platform integrations. Identity query endpoints. Third-party developer documentation.</p>
                        </div>

                        <div className="border-l border-white/10 pl-6 relative">
                            <div className="absolute w-2 h-2 bg-white/20 rounded-full -left-[4.5px] top-1.5"></div>
                            <h3 className="font-bold text-white mb-2 uppercase tracking-widest text-xs">Phase 4</h3>
                            <p>Standardization initiative. Industry partnerships. Open attestation schema publication.</p>
                        </div>

                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Security Model</h2>
                    <div className="space-y-4 text-white/60 font-light leading-relaxed text-sm md:text-base">
                        <p>Security is enforced at multiple layers: Wallet signature verification, Immutable blockchain timestamp, SHA-256 content hashing, Strict payload size enforcement, Structured schema validation.</p>
                        <p>The system ensures that: Attestations cannot be forged without wallet access, Data cannot be altered without hash invalidation, Transaction history remains publicly auditable.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Market Positioning</h2>
                    <div className="space-y-4 text-white/60 font-light leading-relaxed text-sm md:text-base">
                        <p>ChainVolio is positioned as infrastructure, not a consumer social platform. It operates at the identity layer of Web3 employment.</p>
                        <p>Target segments include: Remote-first Web3 teams, DAOs, Crypto-native startups, Global contributors, Hiring marketplaces, Professional communities.</p>
                        <p>The opportunity is to define the trust layer for decentralized work.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Conclusion</h2>
                    <div className="space-y-4 text-white/60 font-light leading-relaxed text-sm md:text-base">
                        <p>ChainVolio introduces a practical model for professional identity in Web3.</p>
                        <p>It combines: Off-chain data flexibility, On-chain integrity anchoring, Wallet-based authorship, Immutable timestamping.</p>
                        <p>The result is a trust-minimized, scalable system for verifiable career identity. The long-term goal is to become the standard infrastructure layer for portable, API-accessible professional identity across Web3 and beyond.</p>
                    </div>
                </div>

                <div className="pt-12 text-center py-12">
                    <p className="text-[12px] text-white/40 font-bold uppercase tracking-[0.6em] mb-2">Not speculative.</p>
                    <p className="text-[12px] text-white/40 font-bold uppercase tracking-[0.6em] mb-2">Not hype-driven.</p>
                    <p className="text-[12px] text-teal-400 font-bold uppercase tracking-[0.6em]">Infrastructure first.</p>
                </div>

            </section>

            <Footer />
        </main>
    );
}
