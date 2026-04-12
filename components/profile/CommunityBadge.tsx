"use client";

import { Star, Diamond, Circle } from "lucide-react";

interface CommunityBadgeProps {
  cvId: number;
  className?: string;
}

export function CommunityBadge({ cvId, className = "" }: CommunityBadgeProps) {
  if (!cvId || cvId <= 0 || cvId > 1000) return null;

  let tierData = {
    label: "",
    tooltip: "",
    icon: Circle,
    containerClass: "",
    iconClass: "",
    badgeLabel: ""
  };

  if (cvId <= 100) {
    tierData = {
      label: "Genesis 100",
      tooltip: "One of the first 100 professionals to establish an on-chain identity on ChainVolio.",
      icon: Star,
      containerClass: "bg-amber-500/10 border-amber-500/20 text-amber-500",
      iconClass: "text-amber-500 fill-amber-500/20",
      badgeLabel: "Genesis"
    };
  } else if (cvId <= 500) {
    tierData = {
      label: "Early Adopter",
      tooltip: "Among the first 500 professionals who joined ChainVolio.",
      icon: Diamond,
      containerClass: "bg-slate-400/10 border-slate-400/20 text-slate-400",
      iconClass: "text-slate-400",
      badgeLabel: "Early Adopter"
    };
  } else {
    tierData = {
      label: "Founding User",
      tooltip: "Among the first 1000 professionals establishing on-chain professional identity.",
      icon: Circle,
      containerClass: "bg-teal-500/10 border-teal-500/20 text-teal-400",
      iconClass: "text-teal-400",
      badgeLabel: "Founding User"
    };
  }

  const Icon = tierData.icon;

  return (
    <div className={`relative group/badge flex items-start ${className}`}>
      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest ${tierData.containerClass} transition-all duration-300 hover:scale-105 cursor-default`}>
        <Icon className={`w-[10px] h-[10px] ${tierData.iconClass}`} strokeWidth={3} />
        <span>{tierData.badgeLabel}</span>
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 group-hover/badge:opacity-100 transition-opacity duration-300 pointer-events-none z-[100]">
        <div className="bg-slate-900 border border-white/10 p-2.5 rounded-xl shadow-2xl backdrop-blur-xl">
          <p className="text-[10px] font-black text-white mb-1 uppercase tracking-widest leading-none">{tierData.label}</p>
          <p className="text-[9px] text-slate-400 leading-relaxed font-medium">
            {tierData.tooltip}
          </p>
        </div>
        {/* Arrow pointer */}
        <div className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 border-x-[6px] border-x-transparent border-t-[6px] border-t-slate-900"></div>
      </div>
    </div>
  );
}
