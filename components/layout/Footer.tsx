"use client";

import Link from "next/link";

export function Footer() {
    return (
        <div className="w-full border-t border-white/5 py-12 text-center relative z-40">
            <p className="text-[11px] text-white/40 uppercase tracking-[0.4em] font-medium">
                Built on Solana · Permissionless · No token required
            </p>
        </div>
    );
}
