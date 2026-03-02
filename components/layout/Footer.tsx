"use client";

import Link from "next/link";

export function Footer() {
    return (
        <div className="w-full border-t border-white/5 py-12 text-center relative z-40 flex flex-col items-center justify-center gap-4">
            <p className="text-[11px] text-white/40 uppercase tracking-[0.4em] font-medium">
                Built on Solana · Permissionless · No token required
            </p>
            <div className="flex items-center gap-6">
                <Link href="/terms" className="text-[11px] text-white/30 hover:text-white/60 transition-colors uppercase tracking-[0.2em]">
                    Terms of Service
                </Link>
                <Link href="/privacy-policy" className="text-[11px] text-white/30 hover:text-white/60 transition-colors uppercase tracking-[0.2em]">
                    Privacy Policy
                </Link>
                <Link href="/whitepaper" className="text-[11px] text-white/30 hover:text-white/60 transition-colors uppercase tracking-[0.2em]">
                    Whitepaper
                </Link>
            </div>
        </div>
    );
}
