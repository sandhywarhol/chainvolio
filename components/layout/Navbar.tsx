"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X, ShieldCheck } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import { NotificationBell } from "./NotificationBell";
import { usePathname } from "next/navigation";
import { getVerificationLabel } from "@/lib/paymentConfig";


interface NavbarProps {
    onHowItWorksClick?: () => void;
    onRecruitersClick?: () => void;
    onTalentClick?: () => void;
    onAskClick?: () => void;
    onScreeningClick?: () => void;
    onAttestationClick?: () => void;
    isVerified?: boolean;
    verifierTier?: number;
    verificationTier?: string;
}


export function Navbar({ onHowItWorksClick, onRecruitersClick, onTalentClick, onAskClick, onScreeningClick, onAttestationClick, isVerified, verifierTier, verificationTier }: NavbarProps) {

    const { publicKey } = useWallet();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileWhyOpen, setIsMobileWhyOpen] = useState(false);
    const [isMobileHowOpen, setIsMobileHowOpen] = useState(false);
    const [isMobileGuidesOpen, setIsMobileGuidesOpen] = useState(false);
    const [isMobileDeveloperOpen, setIsMobileDeveloperOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isActive = (path: string) => pathname === path;

    const whyItems = [
        { label: "Why Chainvolio", href: "/why" },
        { label: "Trust Model", href: "/trust" },
        { label: "System Status", href: "/status" },
        { label: "About Us", href: "/about" },
    ];

    const howItems = [
        { label: "Workflow & Features", href: "/?modal=how", onClick: onHowItWorksClick },
        { label: "For Recruiters", href: "/?modal=recruiters", onClick: onRecruitersClick },
        { label: "For Talent", href: "/?modal=talent", onClick: onTalentClick },
    ];

    const guidesItems = [
        { label: "Sourcing Guide", href: "/guides/sourcing" },
        { label: "Screening Protocol", href: "/guides/screening" },
        { label: "Proof Standards", href: "/guides/attestation" },
    ];
    
    const devItems = [
        { label: "Overview", href: "/developers" },
        { label: "API Docs", href: "/api-docs" },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[99999] transition-all duration-500 border-b ${scrolled
                ? "border-white/10 bg-black/80 backdrop-blur-2xl py-2 shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
                : "border-white/0 bg-transparent py-5"
            }`}>
            <div className="flex items-center justify-between px-4 md:px-8 py-3 max-w-[1600px] w-full mx-auto">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-1.5 group">
                        <img src="/chainvolio%20logo.png" alt="ChainVolio Logo" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold text-white/90">ChainVolio</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6 text-xs font-bold">
                        <NavDropdown
                            label="Products"
                            href="/why"
                            items={whyItems}
                        />

                        <NavDropdown
                            label="How It Works"
                            href="/?modal=how"
                            items={howItems}
                        />

                        <NavDropdown
                            label="Guides"
                            href="/guides"
                            items={guidesItems}
                        />

                        <Link
                            href="/security"
                            className={`transition-colors py-2 ${isActive('/security') ? 'text-white' : 'text-white/40 hover:text-white/90'}`}
                        >
                            Security
                        </Link>

                        <NavDropdown
                            label="Developer"
                            href="/api-docs"
                            items={devItems}
                        />

                        <Link
                            href="/dashboard"
                            className={`transition-colors py-2 ${isActive('/dashboard') ? 'text-emerald-400 font-extrabold' : 'text-emerald-400/60 hover:text-emerald-400'}`}
                        >
                            Dashboard
                        </Link>

                        {publicKey?.toBase58() === "FwHtKFZY6jRqhtczE7Nkwq7pkR7fb3vWq6YqYSYtGcMv" && (
                            <Link
                                href="/admin/organization-verification"
                                className={`transition-colors py-2 ${isActive('/admin/organization-verification') ? 'text-purple-400 font-extrabold' : 'text-purple-400/60 hover:text-purple-300'}`}
                            >
                                Admin
                            </Link>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href="/verified-organization"
                        className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${isVerified
                            ? verifierTier === 3
                                ? "bg-teal-500/10 border-teal-400/20 text-teal-400"
                                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                            }`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>
                            {isVerified
                                ? getVerificationLabel(verificationTier)
                                : "Verified Organization"
                            }
                        </span>

                    </Link>

                    {/* Removed redundant verified badge for CV view consistency */}

                    {/* Desktop Wallet & Global Notification Bell */}
                    <div className="hidden md:block">
                        <WalletMultiButton />
                    </div>
                    
                    <NotificationBell />

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-white/60 hover:text-white transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-white/5 bg-black/40 backdrop-blur-xl ${isMobileMenuOpen ? 'max-h-[80vh] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0'
                }`}>
                <div className="px-6 md:px-8 py-6 space-y-4 text-sm font-bold">
                    <MobileAccordion
                        label="Products"
                        href="/why"
                        items={whyItems}
                        isOpen={isMobileWhyOpen}
                        onToggle={() => setIsMobileWhyOpen(!isMobileWhyOpen)}
                        onCloseMenu={() => setIsMobileMenuOpen(false)}
                    />

                    <MobileAccordion
                        label="How It Works"
                        href="/?modal=how"
                        items={howItems}
                        isOpen={isMobileHowOpen}
                        onToggle={() => setIsMobileHowOpen(!isMobileHowOpen)}
                        onCloseMenu={() => setIsMobileMenuOpen(false)}
                    />

                    <MobileAccordion
                        label="Guides"
                        href="/guides"
                        items={guidesItems}
                        isOpen={isMobileGuidesOpen}
                        onToggle={() => setIsMobileGuidesOpen(!isMobileGuidesOpen)}
                        onCloseMenu={() => setIsMobileMenuOpen(false)}
                    />

                    <Link href="/security" className="block text-white/40 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Security</Link>

                    <MobileAccordion
                        label="Developer"
                        href="/api-docs"
                        items={devItems}
                        isOpen={isMobileDeveloperOpen}
                        onToggle={() => setIsMobileDeveloperOpen(!isMobileDeveloperOpen)}
                        onCloseMenu={() => setIsMobileMenuOpen(false)}
                    />




                    <Link href="/dashboard" className="block text-emerald-400 hover:text-emerald-300 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>

                    <Link
                        href="/verified-organization"
                        className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <ShieldCheck className="w-4 h-4" />
                        <span>
                            {isVerified
                                ? getVerificationLabel(verificationTier)
                                : "Organization"
                            }
                        </span>

                    </Link>

                    <div className="pt-6 pb-4 border-t border-white/5 flex flex-col gap-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account</span>
                        <div className="w-full scale-100 origin-left">
                            <WalletMultiButton />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

function NavDropdown({ label, href, items, onClick }: {
    label: string,
    href: string,
    items: { label: string, href: string, onClick?: () => void }[],
    onClick?: () => void
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div
            className="relative flex items-center group/dropdown"
            ref={dropdownRef}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button
                onClick={(e) => {
                    e.preventDefault();
                    if (onClick) onClick();
                    setIsOpen(!isOpen);
                }}
                className="flex items-center gap-1 text-white/40 hover:text-white/90 transition-colors py-2"
                type="button"
                aria-expanded={isOpen}
            >
                {label}
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <div
                className={`absolute top-full left-0 w-48 pt-1 transition-all duration-200 origin-top-left ${isOpen
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                    }`}
            >
                <div className="bg-black/90 border border-white/10 backdrop-blur-xl shadow-2xl py-2">
                    {items.map((item) => (
                        item.onClick ? (
                            <button
                                key={item.label}
                                onClick={() => { item.onClick!(); setIsOpen(false); }}
                                className="block w-full text-left px-4 py-2 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                {item.label}
                            </button>
                        ) : (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="block px-4 py-2 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                {item.label}
                            </Link>
                        )
                    ))}
                </div>
            </div>
        </div>
    );
}

function MobileAccordion({ label, href, items, isOpen, onToggle, onCloseMenu, onClick }: {
    label: string,
    href: string,
    items: { label: string, href: string, onClick?: () => void }[],
    isOpen: boolean,
    onToggle: () => void,
    onCloseMenu: () => void,
    onClick?: () => void
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between w-full">
                {onClick ? (
                    <button
                        onClick={() => { onClick(); onCloseMenu(); }}
                        className="text-white/40 hover:text-white transition-colors"
                    >
                        {label}
                    </button>
                ) : (
                    <Link
                        href={href}
                        className="text-white/40 hover:text-white transition-colors"
                        onClick={onCloseMenu}
                    >
                        {label}
                    </Link>
                )}
                <button
                    onClick={onToggle}
                    className="text-white/40 p-2"
                    aria-label={`Toggle ${label} menu`}
                >
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>
            <div className={`pl-4 space-y-3 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-56 opacity-100' : 'max-h-0 opacity-0'}`}>
                {items.map((item) => (
                    item.onClick ? (
                        <button
                            key={item.label}
                            onClick={() => { item.onClick!(); onCloseMenu(); }}
                            className="block w-full text-left text-white/20 hover:text-white transition-colors py-1"
                        >
                            {item.label}
                        </button>
                    ) : (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="block text-white/20 hover:text-white transition-colors py-1"
                            onClick={onCloseMenu}
                        >
                            {item.label}
                        </Link>
                    )
                ))}
            </div>
        </div>
    );
}
