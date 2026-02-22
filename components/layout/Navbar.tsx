"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { WalletMultiButton } from "@/components/wallet/WalletButton";

interface NavbarProps {
    onHowItWorksClick?: () => void;
    onRecruitersClick?: () => void;
    onTalentClick?: () => void;
    onAskClick?: () => void;
    onScreeningClick?: () => void;
    onAttestationClick?: () => void;
}

export function Navbar({ onHowItWorksClick, onRecruitersClick, onTalentClick, onAskClick, onScreeningClick, onAttestationClick }: NavbarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileWhyOpen, setIsMobileWhyOpen] = useState(false);
    const [isMobileHowOpen, setIsMobileHowOpen] = useState(false);
    const [isMobileGuidesOpen, setIsMobileGuidesOpen] = useState(false);

    const whyItems = [
        { label: "Why Chainvolio", href: "/why" },
        { label: "About Us", href: "/about" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy-policy" },
    ];

    const howItems = [
        { label: "Workflow & Features", href: "/?modal=how", onClick: onHowItWorksClick },
        { label: "For Recruiters", href: "/?modal=recruiters", onClick: onRecruitersClick },
        { label: "For Talent", href: "/?modal=talent", onClick: onTalentClick },
    ];

    const guidesItems = [
        { label: "Sourcing", href: "/?modal=ask", onClick: onAskClick },
        { label: "Screening", href: "/?modal=screening", onClick: onScreeningClick },
        { label: "Attestation", href: "/?modal=attestation", onClick: onAttestationClick },
    ];

    return (
        <nav className="relative z-[100] border-b border-white/5 bg-black/20 backdrop-blur-md">
            <div className="flex items-center justify-between px-8 py-3 max-w-[1600px] w-full mx-auto">
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
                            onClick={onHowItWorksClick}
                        />

                        <NavDropdown
                            label="Guides"
                            href="/guides"
                            items={guidesItems}
                        />


                        <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 transition-colors py-2">Dashboard</Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:block">
                        <WalletMultiButton />
                    </div>

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
            <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-white/5 bg-black/40 backdrop-blur-xl ${isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                <div className="px-8 py-6 space-y-4 text-sm font-bold">
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
                        onClick={onHowItWorksClick}
                    />

                    <MobileAccordion
                        label="Guides"
                        href="/guides"
                        items={guidesItems}
                        isOpen={isMobileGuidesOpen}
                        onToggle={() => setIsMobileGuidesOpen(!isMobileGuidesOpen)}
                        onCloseMenu={() => setIsMobileMenuOpen(false)}
                    />


                    <Link href="/dashboard" className="block text-emerald-400 hover:text-emerald-300 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>

                    <div className="pt-4 border-t border-white/5">
                        <WalletMultiButton />
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
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150); // 150ms grace period
    };

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
            className="relative flex items-center gap-0.5"
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {onClick ? (
                <button
                    onClick={onClick}
                    className="text-white/40 hover:text-white/90 transition-colors py-2"
                >
                    {label}
                </button>
            ) : (
                <Link
                    href={href}
                    className="text-white/40 hover:text-white/90 transition-colors py-2"
                >
                    {label}
                </Link>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-white/40 hover:text-white/90 transition-colors py-2 px-1"
                aria-label={`Toggle ${label} menu`}
            >
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
