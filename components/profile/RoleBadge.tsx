"use client";

import { ShieldCheck } from "lucide-react";
import { getBadgeStyles } from "@/lib/paymentConfig";

interface RoleBadgeProps {
  type?: string;
  isVerified?: boolean;
  className?: string;
  showTooltip?: boolean;
}

export function RoleBadge({ type, isVerified = true, className = "", showTooltip = true }: RoleBadgeProps) {
  // We now allow "unverified" users to show a "Regular" badge
  const s = getBadgeStyles(isVerified ? type : "unverified");

  const TIER_TOOLTIPS: Record<string, { title: string; desc: string }> = {
    "Regular":               { title: "Regular Attestation",           desc: "Community member with an unverified profile. Low attestation power." },
    "Builder":               { title: "Verified Builder",              desc: "Individual with verified on-chain career records and proof of work." },
    "Public":                { title: "Verified Public Figure",         desc: "Recognized individual with verified identity and proven contribution record." },
    "Community / DAO":       { title: "Verified Community / DAO",       desc: "Official community representative with established governance history." },
    "Company / Org":         { title: "Verified Company / Organization", desc: "Institutional entity with verified registration and professional standing." },
  };

  const tooltip = TIER_TOOLTIPS[s.tierLabel] || TIER_TOOLTIPS["Builder"];
  return (
    <div className={`relative group/trust inline-flex flex-col items-center ${className}`}>
      {/* Tier label badge */}
      <span className={`inline-flex items-center justify-center gap-1.5 px-2.5 h-6 rounded border text-[10px] font-black uppercase tracking-widest ${s.color} transition-all duration-300 hover:scale-105 cursor-default shadow-sm`}>
        <ShieldCheck size={12} strokeWidth={3} />
        {s.tierLabel}
      </span>

      {/* Attestation power strips - positioned absolutely so they don't shift the label's center */}
      {s.bars > 0 && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 flex gap-[3.5px] mt-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-[2px] w-3.5 rounded-full transition-all"
              style={{ 
                backgroundColor: i < s.bars ? s.hex : 'rgba(255,255,255,0.08)',
                opacity: i < s.bars ? 0.8 : 0.3
              }}
            />
          ))}
        </div>
      )}

      {/* Hover tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 opacity-0 group-hover/trust:opacity-100 transition-all duration-300 delay-150 pointer-events-none z-[100] translate-y-1 group-hover/trust:translate-y-0">
          <div className="bg-slate-900 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-xl">
            <p className={`text-[10px] font-black mb-1.5 uppercase tracking-widest leading-none ${s.iconText}`}>{tooltip.title}</p>
            <p className="text-[9px] text-slate-400 leading-relaxed text-left">{tooltip.desc}</p>
            <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between gap-3">
              <span className="text-[8px] text-slate-500 uppercase font-black tracking-tight whitespace-nowrap">Attestation Power</span>
              <div className="flex gap-[3px]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`h-[3px] w-3 rounded-full ${i < s.bars ? `${s.bgBase} opacity-90` : 'bg-white/10'}`} />
                ))}
              </div>
            </div>
          </div>
          <div className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 border-x-[6px] border-x-transparent border-t-[6px] border-t-slate-900" />
        </div>
      )}
    </div>
  );
}
