"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronDown, Menu, X, ShieldCheck, Layers, HelpCircle, BookOpen, Shield, LayoutGrid, User, Briefcase, LogOut, Wallet, ChevronRight, ChevronLeft } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import { NotificationBell } from "./NotificationBell";
import { usePathname } from "next/navigation";
import { getVerificationLabel } from "@/lib/paymentConfig";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";


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
    const { isGoogleSignedIn } = useGoogleAuth();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeMobilePanel, setActiveMobilePanel] = useState<'main' | 'products' | 'how' | 'guides'>('main');
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        if (!isMobileMenuOpen) {
            // Reset to main panel when closed
            setTimeout(() => setActiveMobilePanel('main'), 500);
        }
    }, [isMobileMenuOpen]);

    const isActive = (path: string) => pathname === path;

    const whyItems = [
        { label: "Why ChainVolio", href: "/why" },
        { label: "Trust Model", href: "/trust" },
        { label: "System Status", href: "/status" },
        { label: "About Us", href: "/about" },
    ];

    const guidesItems = [
        { label: "How It Works", href: "/guides/how-it-works", onClick: onHowItWorksClick },
        { label: "Web3 Resume", href: "/web3-resume" },
        { label: "Sourcing Guide", href: "/guides/sourcing" },
        { label: "Screening Protocol", href: "/guides/screening", onClick: onScreeningClick },
        { label: "Attestation / Proof Standards", href: "/guides/attestation", onClick: onAttestationClick },
    ];
    

    return (
        <nav className={`theme-preserve fixed top-0 left-0 right-0 z-[100000] pointer-events-auto transition-all duration-500 border-b ${scrolled
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

                        <Link
                            href="/explore-talent"
                            className={`transition-colors py-2 ${isActive('/explore-talent') ? 'text-white' : 'text-white/40 hover:text-white/90'}`}
                        >
                            Explore Talent
                        </Link>

                        <Link
                            href="/blog"
                            className={`transition-colors py-2 ${isActive('/blog') ? 'text-white' : 'text-white/40 hover:text-white/90'}`}
                        >
                            Blog
                        </Link>

                        <NavDropdown
                            label="Guides"
                            href="/guides"
                            items={guidesItems}
                        />

                        {(publicKey || isGoogleSignedIn) && (
                            <Link
                                href="/dashboard"
                                className={`transition-colors py-2 ${isActive('/dashboard') ? 'text-emerald-400 font-extrabold' : 'text-emerald-400/60 hover:text-emerald-400'}`}
                            >
                                Dashboard
                            </Link>
                        )}

                        {publicKey?.toBase58() === "FwHtKFZY6jRqhtczE7Nkwq7pkR7fb3vWq6YqYSYtGcMv" && (
                            <Link
                                href="/admin/organization-verification"
                                className={`transition-colors py-2 ${isActive('/admin/organization-verification') ? 'text-indigo-400 font-extrabold' : 'text-indigo-400/60 hover:text-indigo-300'}`}
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
                    <div className="hidden md:flex items-center gap-2">
                        {/* <ThemeToggle /> */}
                        <WalletMultiButton />
                    </div>
                    
                    <NotificationBell />

                    {/* Mobile Wallet & Menu Toggle */}
                    <div className="flex md:hidden items-center gap-3">
                        <div className="scale-90">
                            <WalletMultiButton />
                        </div>
                        {!isMobileMenuOpen && (
                            <button
                                className="text-white/60 hover:text-white transition-colors relative z-[100002]"
                                onClick={() => {
                                    const newState = !isMobileMenuOpen;
                                    setIsMobileMenuOpen(newState);
                                    if (newState) setActiveMobilePanel('main');
                                }}
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Modal */}
            {mounted && createPortal(
                <div className={`fixed inset-0 z-[100001] md:hidden transition-all duration-500 w-full max-w-full overflow-x-hidden ${
                    isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}>
                    {/* Backdrop */}
                    <div 
                        className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500 z-[100001] ${
                            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Menu Content */}
                    <div className={`fixed inset-0 w-full max-w-full h-[100dvh] bg-[#050505] shadow-2xl transition-transform duration-500 ease-out z-[100002] overflow-x-hidden overflow-y-auto touch-pan-y ${
                        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}>
                        {/* Noise texture overlay */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

                        <div className="relative flex flex-col h-full overflow-x-hidden overflow-y-auto z-10 max-w-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/[0.05] bg-black/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center border border-white/10">
                                        <img src="/chainvolio%20logo.png" alt="ChainVolio" className="w-5 h-5 object-contain" />
                                    </div>
                                    <span className="font-black text-white tracking-tight uppercase text-xs">Navigation</span>
                                </div>
                                <button 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 rounded-xl bg-white/[0.05] text-white/50 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 relative overflow-y-auto overflow-x-hidden -webkit-overflow-scrolling-touch">
                                {/* Main Panel */}
                                <div className={`absolute inset-0 px-6 py-10 transition-all duration-300 w-full max-w-full overflow-x-hidden touch-pan-y ${
                                    activeMobilePanel === 'main' ? 'translate-x-0 opacity-100 visible' : 'translate-x-0 opacity-100 visible'
                                } ${activeMobilePanel !== 'main' ? 'translate-x-[-20%] opacity-0 invisible' : ''}`}>
                                    <div className="space-y-10">
                                        {/* SECTION 1: MAIN NAVIGATION */}
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Explore Platform</p>
                                            <div className="flex flex-col gap-2">
                                                <MobileNavLink
                                                    icon={<Layers className="w-5 h-5 text-emerald-400" />}
                                                    label="Products"
                                                    hasSubmenu
                                                    onClick={() => setActiveMobilePanel('products')}
                                                />
                                                <MobileNavLink
                                                    href="/explore-talent"
                                                    icon={<LayoutGrid className="w-5 h-5 text-amber-200/60" />}
                                                    label="Explore Talent"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                />
                                                <MobileNavLink
                                                    href="/blog"
                                                    icon={<HelpCircle className="w-5 h-5 text-amber-400" />}
                                                    label="Blog"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                />
                                                <MobileNavLink
                                                    icon={<BookOpen className="w-5 h-5 text-indigo-400" />}
                                                    label="Guides"
                                                    hasSubmenu
                                                    onClick={() => setActiveMobilePanel('guides')}
                                                />
                                            </div>
                                        </div>

                                        {/* SECTION 2: USER ACTIONS */}
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">User Hub</p>
                                            <div className="flex flex-col gap-2">
                                                {(publicKey || isGoogleSignedIn) && (
                                                    <MobileNavLink 
                                                        href="/dashboard" 
                                                        icon={<LayoutGrid className="w-5 h-5" />} 
                                                        label="Dashboard" 
                                                        color="text-emerald-400"
                                                        onClick={() => setIsMobileMenuOpen(false)} 
                                                    />
                                                )}
                                                {publicKey && (
                                                    <MobileNavLink 
                                                        href={`/cv/${publicKey.toBase58()}`} 
                                                        icon={<User className="w-5 h-5" />} 
                                                        label="View Your CV" 
                                                        onClick={() => setIsMobileMenuOpen(false)} 
                                                    />
                                                )}
                                                <MobileNavLink 
                                                    href="/verified-organization" 
                                                    icon={<Briefcase className="w-5 h-5" />} 
                                                    label={isVerified ? getVerificationLabel(verificationTier) : "Hiring Center"} 
                                                    onClick={() => setIsMobileMenuOpen(false)} 
                                                />
                                            </div>
                                        </div>


                                    </div>
                                </div>

                                {/* Sub-Panels */}
                                <MobileSubPanel 
                                    title="Products" 
                                    isOpen={activeMobilePanel === 'products'}
                                    items={whyItems}
                                    onBack={() => setActiveMobilePanel('main')}
                                    onClose={() => setIsMobileMenuOpen(false)}
                                />
                                <MobileSubPanel 
                                    title="Guides" 
                                    isOpen={activeMobilePanel === 'guides'}
                                    items={guidesItems}
                                    onBack={() => setActiveMobilePanel('main')}
                                    onClose={() => setIsMobileMenuOpen(false)}
                                />
                            </div>

                            {/* Footer Info */}
                            <div className="p-6 mt-auto border-t border-white/5 bg-black/20">
                                <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] text-center">ChainVolio v2.4.0 • Mainnet</p>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
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

function MobileSubPanel({ 
    title, 
    isOpen, 
    items, 
    onBack, 
    onClose,
    onSpecialClick 
}: { 
    title: string;
    isOpen: boolean;
    items: { label: string, href: string, onClick?: () => void }[];
    onBack: () => void;
    onClose: () => void;
    onSpecialClick?: () => void;
}) {
    return (
        <div className={`absolute inset-0 bg-[#050505] z-50 transition-all duration-300 ease-in-out w-full max-w-full overflow-x-hidden overflow-y-auto touch-pan-y ${
            isOpen ? 'translate-x-0 opacity-100 visible' : 'translate-x-full opacity-0 invisible'
        }`}>
            {/* Noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            <div className="relative flex flex-col h-full z-10">
                {/* Panel Header */}
                <div className="flex items-center gap-4 p-6 border-b border-white/[0.05] bg-black/20">
                    <button 
                        onClick={onBack}
                        className="p-2 rounded-xl bg-white/[0.05] text-white/50 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Explore {title}</span>
                </div>

                {/* List Area */}
                <div className="flex-1 overflow-y-auto px-6 py-8 space-y-3 custom-scrollbar max-w-full overflow-x-hidden">
                    {items.map((item) => (
                        <Link 
                            key={item.label}
                            href={item.href}
                            onClick={() => {
                                if (item.onClick) item.onClick();
                                if (item.label.includes('Workflow') && onSpecialClick) onSpecialClick();
                                onClose();
                            }}
                            className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] active:bg-white/[0.08] active:scale-[0.98] transition-all duration-200"
                        >
                            <span className="text-sm font-bold text-white/80 tracking-wide">{item.label}</span>
                            <ChevronRight className="w-4 h-4 text-slate-700" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

function MobileNavLink({ href, icon, label, onClick, color = "text-white/60", hasSubmenu = false }: {
    href?: string;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    color?: string;
    hasSubmenu?: boolean;
}) {
    const content = (
        <div className="flex items-center justify-between p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] active:bg-white/[0.08] active:scale-[0.98] transition-all duration-200 max-w-full break-words">
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-2xl bg-white/[0.05] transition-colors group-active:bg-white/10 ${color}`}>
                    {icon}
                </div>
                <span className={`text-sm font-black tracking-wide transition-colors ${color === 'text-white/60' ? 'text-white/80 group-active:text-white' : color}`}>
                    {label}
                </span>
            </div>
            <ChevronRight className={`w-4 h-4 transition-colors ${hasSubmenu ? 'text-emerald-500' : 'text-slate-700'}`} />
        </div>
    );

    if (hasSubmenu) {
        return (
            <button onClick={onClick} className="w-full text-left group">
                {content}
            </button>
        );
    }

    return (
        <Link href={href || "#"} onClick={onClick} className="group">
            {content}
        </Link>
    );
}
