"use client";

import Link from "next/link";
import Image from "next/image";
import superteamLogo from "@/public/superteam indonesia logo.png";

export function Footer({ className = "bg-transparent" }: { className?: string }) {
    return (
        <footer className={`w-full border-t border-white/5 relative z-[100] font-sans mt-auto ${className}`}>
            <div className="max-w-[1600px] w-full mx-auto px-8 py-4">
                {/* MOBILE/TABLET FOOTER (≤1023px) */}
                <div className="lg:hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
                    {/* Supported By (Left on Desktop, 3rd on Mobile) */}
                    <div className="flex flex-col items-center md:items-start gap-4 w-full md:w-1/3 order-3 md:order-1">
                        <div className="flex items-center gap-2 text-[10px] text-white/40 tracking-wide">
                            <span>Supported by</span>
                            <a
                                href="https://x.com/SuperteamINDO"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transition-all hover:scale-110 active:scale-95 flex items-center"
                            >
                                <Image
                                    src={superteamLogo}
                                    alt="Superteam Indonesia"
                                    className="h-4 w-auto opacity-70 hover:opacity-100 transition-opacity object-contain"
                                />
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-1 w-full md:w-1/3 text-center order-1 md:order-2">
                    </div>

                    {/* Terms & Privacy (Right on Desktop, 2nd on Mobile) */}
                    <div className="flex flex-col items-center md:items-end w-full md:w-1/3 order-2 md:order-3">
                        <div className="flex flex-wrap items-center gap-3 text-[9px] font-semibold text-white/40">
                            <Link href="/terms" className="hover:text-white/80 transition-colors">Terms of Service</Link>
                            <span className="text-white/40">•</span>
                            <Link href="/privacy-policy" className="hover:text-white/80 transition-colors">Privacy Policy</Link>
                            <span className="text-white/40">•</span>
                            <Link href="/whitepaper" className="hover:text-white/80 transition-colors">Whitepaper</Link>
                            <span className="text-white/40">•</span>
                            <Link href="/developers" className="hover:text-white/80 transition-colors">Developer</Link>
                            <span className="text-white/40">•</span>
                            <Link href="/api-docs" className="hover:text-white/80 transition-colors">API Docs</Link>
                        </div>
                    </div>

                    {/* Socials (Very bottom on Mobile) */}
                    <div className="flex items-center justify-center md:justify-start gap-3 w-full md:w-1/3 order-4">
                        <Link href="https://x.com/chainvolio" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white/90 transition-colors">
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </Link>
                        <a href="https://discord.gg/Y6rgDyjMgK" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white/90 transition-colors">
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.118.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                            </svg>
                        </a>

                        <a href="https://www.instagram.com/chainvolio/" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white/90 transition-colors">
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.919-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                        </a>
                    </div>
                </div>

                {/* DESKTOP FOOTER (Clean 3-column layout ≥1024px) */}
                <div className="hidden lg:flex flex-row justify-between items-center w-full">
                    {/* LEFT Column: Social Icons */}
                    <div className="flex items-center gap-4 w-1/3 justify-start">
                        <Link href="https://x.com/chainvolio" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white/90 transition-colors">
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </Link>
                        <a href="https://discord.gg/Y6rgDyjMgK" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white/90 transition-colors">
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.118.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                            </svg>
                        </a>

                        <a href="https://www.instagram.com/chainvolio/" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white/90 transition-colors">
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.919-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                        </a>
                    </div>

                    <div className="flex flex-col items-center gap-2 w-1/3 text-center">
                        {/* Legal Links */}
                        <div className="flex items-center gap-4 text-[9px] font-semibold text-white/30">
                            <Link href="/terms" className="hover:text-white/80 transition-colors">Terms of Service</Link>
                            <Link href="/privacy-policy" className="hover:text-white/80 transition-colors">Privacy Policy</Link>
                            <Link href="/whitepaper" className="hover:text-white/80 transition-colors">Whitepaper</Link>
                            <span className="text-white/10">•</span>
                            <Link href="/developers" className="hover:text-white/80 transition-colors">Developer</Link>
                            <Link href="/api-docs" className="hover:text-white/80 transition-colors">API Docs</Link>
                        </div>
                    </div>

                    {/* RIGHT Column: Supported By */}
                    <div className="flex flex-col items-end w-1/3">
                        {/* Endorsement */}
                        <div className="flex items-center gap-2 text-[9px] text-white/30 tracking-wide">
                            <span>Supported by</span>
                            <a
                                href="https://x.com/SuperteamINDO"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transition-all hover:scale-110 active:scale-95 flex items-center"
                            >
                                <Image
                                    src={superteamLogo}
                                    alt="Superteam Indonesia"
                                    className="h-4 w-auto opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all object-contain"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
