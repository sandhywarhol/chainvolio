"use client";

import { useState, useRef, useEffect, useMemo } from "react";

import {
  ShieldCheck,
  Briefcase,
  Users,
  Globe,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  Building2,
  Clock,
  ChevronDown,
  Info,
  Wallet,
  Zap,
  ArrowRight,
  X,
  ExternalLink,
} from "lucide-react";
import { getVerificationLabel, getBadgeStyles } from "@/lib/paymentConfig";
import { Toast } from "@/components/ui/Toast";
import { ReceiptDetailModal } from "@/components/receipt/ReceiptDetailModal";

// ─── Types ────────────────────────────────────────────────────────────────────
type Profile = {
  displayName: string;
  bio: string;
  skills: string;
  twitter?: string;
  github?: string;
  website?: string;
  discord?: string;
  email?: string;
  country?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  verifierTier?: number;
  verificationType?: string;
  verificationTier?: string;
  role?: string;
  organization?: string;
  linkedin?: string;
  location?: string;
  cardNumber?: number;
  headline?: string;
};

type Receipt = {
  id: string;
  role: string;
  org: string;
  description: string;
  status: string;
  attesterWallet?: string;
  createdAt: string;
  profile?: {
    display_name: string;
    avatar_url: string | null;
  };
  wallet_address?: string;
};

type Props = {
  profile: Profile;
  receipts: Receipt[]; // For Organizations, these should be their *issued* endorsements
  scoreData: any;
  wallet: string;
  collections?: any[];
  isCommunity?: boolean;
};

// ─── Shared Components (Extracted from previous layouts) ────────────────────────

function ScoreFactorRow({
  label,
  weight,
  value,
  tooltip,
  accentHex,
  badgeText,
  hintText,
}: {
  label: string;
  weight: number;
  value: number;
  tooltip: string;
  accentHex: string;
  badgeText?: string;
  hintText?: React.ReactNode;
}) {
  const [showTip, setShowTip] = useState(false);
  const contribution = Math.round(value * (weight / 100));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 relative">
          <button
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
            className="flex items-center gap-1.5 cursor-default focus:outline-none"
          >
            <span className="text-[11px] font-semibold text-slate-300">{label}</span>
            <span className="text-[9px] text-slate-600 font-bold">({weight}%)</span>
          </button>
          {showTip && (
            <div
              className="absolute left-0 bottom-full mb-1.5 z-[100] px-2.5 py-1.5 rounded-lg text-[10px] text-slate-200 font-medium whitespace-nowrap pointer-events-none"
              style={{ background: "#1e2130", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
            >
              {tooltip}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {badgeText && (
            <span className="text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest text-slate-400 bg-slate-800 border-slate-700">
              {badgeText}
            </span>
          )}
          <span
            className="text-[11px] font-black tabular-nums"
            style={{ color: accentHex }}
          >
            {contribution > 0 ? `${contribution}pts` : "—"}
          </span>
        </div>
      </div>
      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${accentHex}90, ${accentHex})`,
          }}
        />
      </div>
      {hintText && <div className="pt-0.5">{hintText}</div>}
    </div>
  );
}



// ─── Main Unified Layout ──────────────────────────────────────────────────────

export function TrustIssuerCV({ profile, receipts: rawAttestations, scoreData, wallet, collections = [], isCommunity = false }: Props) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [activeModal, setActiveModal] = useState<"hiring" | "talents" | "roles" | "score" | null>(null);
  const badge = getBadgeStyles(profile.verificationType);
  const accentHex = badge.hex;

  // Verify Attester Mapping (Normalize toLowerCase)
  const filtered = rawAttestations.filter(r => {
    const attester = (r.attesterWallet || (r as any).attester_wallet || "").toLowerCase();
    const current = (wallet || "").toLowerCase();
    return attester === current;
  });

  // Console Debug (MANDATORY)
  console.log("Current Wallet:", wallet);
  console.log("All attestations:", rawAttestations);
  console.log("Filtered attestations:", filtered);

  // Fallback Test Complete: Filter re-enabled
  const attestationsToUse = filtered;

  const sortedEndorsements = useMemo(() => {
    return [...attestationsToUse].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [attestationsToUse]);

  const totalEndorsements = attestationsToUse.length;
  
  const uniqueTalents = useMemo(() => {
    return Array.from(new Set(attestationsToUse.map(r => r.wallet_address || r.profile?.display_name).filter(Boolean))).length;
  }, [attestationsToUse]);

  const roleOccurrences = useMemo(() => {
    return attestationsToUse.reduce((acc, r) => {
      if (r.role) acc[r.role] = (acc[r.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [attestationsToUse]);
  const sortedRoles = Object.entries(roleOccurrences).sort((a, b) => b[1] - a[1]);
  const rolesCoveredLength = sortedRoles.length;

  const distinctRecipients = useMemo(() => {
    const seen = new Set();
    return sortedEndorsements.filter(r => {
      const id = r.wallet_address || r.profile?.display_name;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [sortedEndorsements]);

  // Unify display score logic
  const scoreValue = scoreData?.score ?? 0;
  const displayScore = profile.isVerified ? Math.min(100, Math.max(50, scoreValue + 5)) : scoreValue;
  const reputationLabel = displayScore >= 80 ? "Elite Trust Authority" : "Verified Organization";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      
      {/* ── 1. Hero Module ────────────────────────────────────────────────────── */}
      <div className="relative p-6 md:p-8 rounded-3xl overflow-hidden border border-white/5 bg-[#0a0b0f]">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, ${accentHex}10 0%, transparent 60%)` }} />
        
        {profile.isVerified && (
          <div className="absolute top-6 right-6 md:top-8 md:right-8 z-30">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${isCommunity ? 'bg-blue-500/10 border-blue-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
              <ShieldCheck className={`w-3.5 h-3.5 ${isCommunity ? 'text-blue-500' : 'text-amber-500'}`} />
              <span className={`text-[9px] font-black uppercase tracking-[0.1em] ${isCommunity ? 'text-blue-400' : 'text-amber-400'}`}>
                {isCommunity ? "Verified Community" : "Verified Company"}
              </span>
            </div>
          </div>
        )}

        <div className="relative z-10 flex flex-col md:flex-row items-start gap-6 md:gap-8">
          <div className="flex flex-col items-center flex-shrink-0">
             {profile.avatarUrl ? (
               <img src={profile.avatarUrl} alt={profile.displayName} className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-2" style={{ borderColor: `${accentHex}40` }} />
             ) : (
               <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center border-2" style={{ background: `${accentHex}10`, borderColor: `${accentHex}30` }}>
                 <Building2 className="w-8 h-8" style={{ color: accentHex, opacity: 0.7 }} />
               </div>
             )}
             {(profile.country || profile.location) && (
               <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border border-white/5 bg-white/[0.03] text-slate-500">
                 📍 {profile.country || profile.location}
               </div>
             )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-3">{profile.displayName}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] uppercase font-black tracking-widest text-slate-400">{reputationLabel}</span>
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] uppercase font-black tracking-widest text-slate-400">{totalEndorsements} Endorsements</span>
            </div>
            {profile.bio && <p className="text-base text-slate-300 leading-relaxed max-w-2xl">{profile.bio}</p>}
            
            <div className="flex flex-wrap items-center gap-6 mt-6">
              {profile.website && (
                <a href={profile.website} target="_blank" className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  <Globe className="w-3.5 h-3.5" /> Website
                </a>
              )}
              {profile.twitter && (
                <a href={`https://twitter.com/${profile.twitter.replace("@", "")}`} target="_blank" className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  𝕏 Twitter
                </a>
              )}
              <div className="flex-1" />
              <button 
                onClick={() => { navigator.clipboard.writeText(wallet); setToastMessage("Copied!"); }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-[10px] text-slate-400 hover:border-emerald-500/40 transition-all font-mono"
              >
                <Wallet className="w-3 h-3 text-emerald-500" />
                {wallet.slice(0, 4)}...{wallet.slice(-4)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Trust Impact Pods ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: UserCheck, label: "Talents Endorsed", val: uniqueTalents, col: "text-emerald-400", bg: "bg-emerald-500/10", onClick: () => setActiveModal("talents") },
          { icon: Briefcase, label: "Roles Verified", val: rolesCoveredLength, col: "text-blue-400", bg: "bg-blue-500/10", onClick: () => setActiveModal("roles") },
          { icon: Zap, label: "Trust Score", val: displayScore, col: "text-amber-400", bg: "bg-amber-500/10", onClick: () => setActiveModal("score") },
          { icon: Briefcase, label: "Hiring Activity", val: collections.length, col: "text-purple-400", bg: "bg-purple-500/10", onClick: () => setActiveModal("hiring") },
        ].map((pod, i) => (
          <div 
            key={i} 
            onClick={pod.onClick}
            className={`p-4 rounded-2xl bg-[#0a0b0f] border border-white/5 space-y-2 cursor-pointer hover:border-white/10 hover:bg-white/[0.04] transition-all`}
          >
            <div className={`w-8 h-8 flex items-center justify-center rounded-xl ${pod.bg}`}>
              <pod.icon className={`w-4 h-4 ${pod.col}`} />
            </div>
            <div>
              <p className="text-[20px] font-black text-white">{pod.val}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{pod.label}</p>
            </div>
          </div>
        ))}
      </div>



      {/* ── 4. Talent Impact (Expertise) ───────────────────────────────────────── */}
      {sortedRoles.length > 0 && (
        <div className="p-6 rounded-2xl bg-[#0a0b0f] border border-white/5">
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Talent Impact
          </h2>
          <div className="flex flex-wrap gap-2">
             {sortedRoles.slice(0, 10).map(([role, count], i) => (
               <div key={i} className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-bold text-white flex items-center gap-2">
                 <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                 {role} <span className="text-slate-500">({count})</span>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* ── 5. Recent Endorsements (List View) ────────────────────────────────── */}
      {sortedEndorsements.length > 0 && (
        <div className="p-6 rounded-3xl bg-[#0a0b0f] border border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
               <UserCheck className="w-4 h-4 text-emerald-500" />
               <h2 className="text-sm font-black text-white uppercase tracking-widest">Recent Endorsements</h2>
            </div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md">Real-Time Proof</span>
          </div>
          
          <div className="space-y-3">
            {(showAllRecent ? sortedEndorsements : sortedEndorsements.slice(0, 3)).map((r) => (
              <button 
                key={r.id}
                onClick={() => setSelectedReceipt(r)}
                className="w-full group flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {r.profile?.avatar_url ? (
                      <img src={r.profile.avatar_url} className="w-10 h-10 rounded-xl object-cover border border-white/10" alt={r.profile.display_name} />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-black text-slate-500">
                        {r.profile?.display_name?.[0] || "?"}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-slate-950 rounded-md p-0.5 border border-emerald-500/20 shadow-xl">
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-white leading-none mb-1 group-hover:text-emerald-400 transition-colors">
                      {r.role}
                    </h4>
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] font-bold text-slate-400">
                        {r.profile?.display_name || "Anonymous Builder"}
                      </p>
                      <span className="text-[11px] text-slate-600">•</span>
                      <p className="text-[11px] font-medium text-slate-500">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>
            ))}
            
            {sortedEndorsements.length > 3 && (
              <div className="pt-2 text-center">
                <button onClick={() => setShowAllRecent(!showAllRecent)} className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest flex items-center justify-center gap-1 mx-auto py-2 px-4 rounded-xl hover:bg-white/5 transition-all">
                  {showAllRecent ? "Show Less" : `Show More (${sortedEndorsements.length - 3})`}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showAllRecent ? "rotate-180" : ""}`} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 6. Community Specific Sections ────────────────────────────────────── */}
      {isCommunity && (distinctRecipients.length > 0 || sortedRoles.length > 0) && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {distinctRecipients.length > 0 && (
               <div className="p-6 rounded-3xl bg-[#0a0b0f] border border-white/5 flex flex-col items-start">
                 <div className="flex items-center justify-between mb-6 w-full">
                   <h2 className="text-sm font-black text-white uppercase tracking-widest">Active Members</h2>
                   <Users className="w-4 h-4 text-blue-500" />
                 </div>
                 
                 <div className="grid grid-cols-4 gap-3 w-full">
                   {distinctRecipients.slice(0, 8).map((r) => (
                     <div key={r.id} className="group relative flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => setSelectedReceipt(r)}>
                        <div className="w-full aspect-square rounded-2xl bg-slate-900 border border-white/5 overflow-hidden group-hover:border-blue-500/40 transition-colors">
                           {r.profile?.avatar_url ? (
                             <img src={r.profile.avatar_url} className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-slate-600 font-black">
                               {r.profile?.display_name?.[0] || "?"}
                             </div>
                           )}
                        </div>
                     </div>
                   ))}
                   {distinctRecipients.length > 8 && (
                     <div className="aspect-square rounded-2xl border-2 border-dashed border-white/5 flex items-center justify-center">
                        <span className="text-[10px] font-black text-slate-700">+{distinctRecipients.length - 8}</span>
                     </div>
                   )}
                 </div>
                 <p className="mt-auto pt-6 text-[11px] font-bold text-slate-500 leading-relaxed italic">
                   Showing verified contributors who have received attestations from this community.
                 </p>
               </div>
             )}
             
             {sortedRoles.length > 0 && (
               <div className="p-6 rounded-3xl bg-[#0a0b0f] border border-white/5">
                 <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center justify-between">
                   Breakdown
                   <TrendingUp className="w-4 h-4 text-amber-500" />
                 </h2>
                 <div className="space-y-4">
                   {sortedRoles.slice(0, 5).map(([role, count]) => {
                     const pct = Math.round((count / attestationsToUse.length) * 100);
                     return (
                       <div key={role} className="space-y-1.5">
                         <div className="flex items-center justify-between text-[11px] font-black uppercase">
                            <span className="text-slate-400 truncate max-w-[70%]">{role} <span className="text-slate-600 ml-1">({count})</span></span>
                            <span className="text-slate-500">{pct}%</span>
                         </div>
                         <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${pct}%`, background: accentHex }} />
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
             )}
          </div>
        </div>
      )}

      {/* Hiring Module has been consolidated into the top stats grid */}

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200" onPointerDown={() => setActiveModal(null)}>
          <div className="relative w-full max-w-md bg-[#0a0b0f] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200" onPointerDown={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                {activeModal === "hiring" && <><Briefcase className="w-5 h-5 text-purple-400" /> Hiring Activity</>}
                {activeModal === "talents" && <><UserCheck className="w-5 h-5 text-emerald-400" /> Talents Endorsed</>}
                {activeModal === "roles" && <><Briefcase className="w-5 h-5 text-blue-400" /> Roles Verified</>}
                {activeModal === "score" && <><Zap className="w-5 h-5 text-amber-400" /> Trust Score Breakdown</>}
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-2 aspect-square rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {activeModal === "hiring" && (
                collections.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10 text-slate-500">
                      <Briefcase className="w-8 h-8" />
                    </div>
                    <p className="text-slate-400 font-bold text-sm">No hiring records found.</p>
                  </div>
                ) : (
                  collections.map((c: any) => {
                     const status = c.metadata?.status || "Active";
                     const isActive = status.toLowerCase() === "active";
                     const isHired = status.toLowerCase() === "hired";
                     
                     let statusColor = "text-slate-400 bg-slate-500/10 border-slate-500/20";
                     if (isActive) statusColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                     if (isHired) statusColor = "text-purple-400 bg-purple-500/10 border-purple-500/20";
                     
                     return (
                       <div key={c.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
                         <div className="flex items-start justify-between">
                           <div>
                             <h4 className="text-sm font-black text-white">{c.title}</h4>
                             <div className="flex items-center gap-2 mt-2">
                               <span className={`text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md border ${statusColor}`}>
                                 {status}
                               </span>
                               <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                 <Clock className="w-3 h-3" />
                                 {new Date(c.created_at || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                               </span>
                             </div>
                           </div>
                         </div>
                         <a href={`/hiring/${c.slug}`} className="w-full mt-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all text-center">
                           View Details <ExternalLink className="w-3 h-3" />
                         </a>
                       </div>
                     );
                  })
                )
              )}

              {activeModal === "talents" && (
                distinctRecipients.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400 font-bold text-sm">No talents endorsed yet.</p>
                  </div>
                ) : (
                  distinctRecipients.map((r) => (
                    <button 
                      key={r.id}
                      onClick={() => { setActiveModal(null); setSelectedReceipt(r); }}
                      className="w-full group flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all text-left"
                    >
                      <div className="flex items-center gap-4">
                        {r.profile?.avatar_url ? (
                          <img src={r.profile.avatar_url} className="w-10 h-10 rounded-xl object-cover border border-white/10" alt={r.profile.display_name} />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-black text-slate-500">
                            {r.profile?.display_name?.[0] || "?"}
                          </div>
                        )}
                        <div>
                          <h4 className="text-[13px] font-black text-white group-hover:text-emerald-400 transition-colors mb-0.5">
                            {r.profile?.display_name || "Anonymous Builder"}
                          </h4>
                          <p className="text-[11px] font-bold text-slate-400">{r.role}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </button>
                  ))
                )
              )}

              {activeModal === "roles" && (
                sortedRoles.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400 font-bold text-sm">No roles verified yet.</p>
                  </div>
                ) : (
                  sortedRoles.map(([role, count]) => {
                    const pct = Math.round((count / attestationsToUse.length) * 100);
                    return (
                      <div key={role} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-black text-white truncate max-w-[70%]">{role}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-md">{count} Verified</span>
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
                )
              )}

              {activeModal === "score" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center py-4 border-b border-white/5 mb-4">
                    <span className="text-5xl font-black text-white">{displayScore}</span>
                    <span className="text-sm font-bold text-slate-500 mt-3 ml-1">/100</span>
                  </div>
                  {(() => {
                    const totalAttest = attestationsToUse.length || 1;
                    const attestedCount = attestationsToUse.filter(r => r.status === "Attested").length;
                    const talentQuality = Math.min(100, Math.round((attestedCount / totalAttest) * 100));
                    const volume = Math.min(100, Math.round((totalAttest / 20) * 100));
                    
                    const scoreFactors = [
                      { label: "Talent Quality", weight: 40, value: talentQuality, tooltip: "Verification density of endorsed talent" },
                      { label: "Trust Volume", weight: 40, value: volume, tooltip: "Total on-chain attestations issued" },
                      { label: "Activity", weight: 20, value: totalAttest > 0 ? 100 : 0, tooltip: "Current engagement level", badgeText: totalAttest > 0 ? "Active" : "Inactive" },
                    ];

                    return scoreFactors.map(f => (
                      <ScoreFactorRow key={f.label} accentHex={accentHex} {...f} />
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedReceipt && (
        <ReceiptDetailModal 
          receipt={{
            ...selectedReceipt,
            attesterName: profile.displayName || "Unknown",
            attesterAvatar: profile.avatarUrl || null,
            attesterRole: profile.role || profile.headline || "Trust Issuer",
            attesterOrg: profile.organization || null,
            isOfficial: profile.isVerified,
            isAttesterVerified: profile.isVerified,
            verificationTier: profile.isVerified ? profile.verificationType : null,
            attesterVerificationType: profile.isVerified ? profile.verificationType : null,
          } as any} 
          onClose={() => setSelectedReceipt(null)} 
        />
      )}

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
