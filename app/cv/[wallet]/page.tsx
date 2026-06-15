"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { Github, Globe, MessageSquare, Copy, Wallet, Mail, MapPin, FileText, Play, Palette, Link as LinkIcon, User, Clock, Briefcase, CheckCircle2, BadgeCheck, Star, Award, ShieldCheck, Instagram, Check, ExternalLink, ChevronDown, ChevronUp, Info } from "lucide-react";
import { getVerificationLabel, isRecruiterTier, getBadgeStyles, normalizeTier } from "@/lib/paymentConfig";

import { PortfolioModal } from "@/components/portfolio/PortfolioModal";
import { ReceiptDetailModal } from "@/components/receipt/ReceiptDetailModal";
import { ReceiptUpdates } from "@/components/receipt/ReceiptUpdates";
import { WorkTimeline } from "@/components/profile/WorkTimeline";
import { Toast } from "@/components/ui/Toast";
import { ExpandableText } from "@/components/ui/ExpandableText";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { CommunityBadge } from "@/components/profile/CommunityBadge";
import { RoleBadge } from "@/components/profile/RoleBadge";
import { CompanyMemberBadge } from "@/components/members/CompanyMemberBadge";
import { CertificateSection, type Certificate } from "@/components/profile/CertificateSection";
import { CertificatePreviewModal } from "@/components/profile/CertificatePreviewModal";
import { TrustIssuerCV } from "@/components/cv/TrustIssuerCV";
import { RecruiterSoftPrompt } from "@/components/cv/RecruiterSoftPrompt";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { RecruiterContactModal } from "@/components/messaging/RecruiterContactModal";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

type Profile = {
  displayName: string;
  bio: string;
  skills: string;
  twitter?: string;
  github?: string;
  website?: string;
  discord?: string;
  whatsapp?: string;
  email?: string;
  country?: string;
  avatarUrl?: string;
  lookingFor?: string;
  timezone?: string;
  workPreference?: string[];
  telegram?: string;
  linkedin?: string;
  instagram?: string;
  cardNumber?: number;
  isVerified?: boolean;
  verifierTier?: number;
  verificationType?: string;
  verificationTier?: string;
  role?: string;
  organization?: string;
};

type Receipt = {
  id: string;
  role: string;
  org: string;
  description: string;
  startDate: string;
  endDate: string;
  workType: string;
  compensationType: string;
  evidenceHash: string;
  evidenceLinks: { label: string; url: string }[];
  impact?: string[];
  portfolioImages?: { imageUrl: string; thumbnailUrl: string }[];
  attestedBy?: string;
  attestedAt?: string;
  status: string;
  attesterWallet?: string;
  attesterName?: string;
  attesterRole?: string;
  attesterAvatar?: string;
  attesterAt?: string;
  attesterSignature?: string;
  attesterOrg?: string;
  isAttesterVerified?: boolean;
  isOfficial?: boolean;
  verificationTier?: string;
  attesterTier?: number;
  attesterVerificationType?: string;
  attestationId?: string;
  attestationType?: string;
  isExternal?: boolean;
  txSignature?: string;
  createdAt: string;
};

type PortfolioItem = {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl: string;
};

// Utility function to format dates and calculate duration
function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const startMonth = monthNames[start.getMonth()];
  const startYear = start.getFullYear();
  const endMonth = monthNames[end.getMonth()];
  const endYear = end.getFullYear();

  // Calculate duration in months
  const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  let durationText = "";

  if (totalMonths >= 12) {
    const years = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;
    durationText = `${years} ${years === 1 ? "year" : "years"}`;
    if (remainingMonths > 0) {
      durationText += ` ${remainingMonths} ${remainingMonths === 1 ? "month" : "months"}`;
    }
  } else {
    durationText = `${totalMonths} ${totalMonths === 1 ? "month" : "months"}`;
  }

  return `${startMonth} ${startYear} - ${endMonth} ${endYear} · ${durationText}`;
}

// Tooltip text for evidence links
function getEvidenceTooltip(label: string): string {
  const tooltips: Record<string, string> = {
    "GitHub": "View source code",
    "Website": "View live project",
    "Demo": "View demo",
    "Doc": "View documentation",
    "Docs": "View documentation",
    "Figma": "View design",
  };
  return tooltips[label] || "View evidence";
}

// Get icon for evidence link type
function getEvidenceIcon(label: string) {
  const icons: Record<string, any> = {
    "GitHub": Github,
    "Website": Globe,
    "Demo": Play,
    "Doc": FileText,
    "Docs": FileText,
    "Figma": Palette,
  };
  const Icon = icons[label] || LinkIcon;
  return <Icon className="w-3 h-3" />;
}

function ProfileCompleteBadge({ 
  isComplete,
  onClick,
  className = "" 
}: { 
  isComplete: boolean;
  isVerified?: boolean;
  verificationType?: string;
  onClick?: () => void;
  className?: string; 
}) {
  if (!isComplete) return null;

  const usedStyle = getBadgeStyles("builder");
  const labelText = "Ready";

  return (
    <div
      className={`relative group/complete inline-flex ${className}`}
      onClick={onClick}
    >
      <div className={`inline-flex items-center justify-center gap-1.5 px-2.5 h-6 rounded border text-[10px] font-black uppercase tracking-widest ${usedStyle.color} transition-all duration-300 hover:scale-105 cursor-pointer shadow-sm`}>
        <BadgeCheck className={`w-3.5 h-3.5 ${usedStyle.iconText}`} strokeWidth={3} />
        <span>{labelText}</span>
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 group-hover/complete:opacity-100 transition-all duration-300 delay-150 pointer-events-none z-[100] translate-y-1 group-hover/complete:translate-y-0">
        <div className="bg-slate-900 border border-white/10 p-2.5 rounded-xl shadow-2xl backdrop-blur-xl text-center">
          <p className="text-[10px] font-black text-white mb-1 uppercase tracking-widest leading-none">Ready</p>
          <p className="text-[9px] text-slate-400 leading-relaxed font-medium">
            Candidate has fulfilled all requirements: Bio, Skills, Experience, and Contact details.
          </p>
        </div>
        <div className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 border-x-[6px] border-x-transparent border-t-[6px] border-t-slate-900"></div>
      </div>
    </div>
  );
}

// ── ExperienceBadge: total years of exp with tooltip ──
function ExperienceBadge({ years, className = "" }: { years: number; className?: string }) {
  if (years <= 0) return null;

  return (
    <div className={`relative group/exp inline-flex ${className}`}>
      <div className="inline-flex items-center justify-center gap-1.5 px-2.5 h-6 rounded border text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 border-blue-500/30 shadow-sm cursor-default transition-all duration-300 hover:scale-105">
        <Clock size={12} strokeWidth={3} />
        <span>{years}Y Exp</span>
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 group-hover/exp:opacity-100 transition-all duration-300 delay-150 pointer-events-none z-[100] translate-y-1 group-hover/exp:translate-y-0">
        <div className="bg-slate-900 border border-white/10 p-2.5 rounded-xl shadow-2xl backdrop-blur-xl text-center">
          <p className="text-[10px] font-black text-white mb-1 uppercase tracking-widest leading-none">Experience</p>
          <p className="text-[9px] text-slate-400 leading-relaxed font-medium">
            Total years of professional experience based on verified work.
          </p>
        </div>
        <div className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 border-x-[6px] border-x-transparent border-t-[6px] border-t-slate-900"></div>
      </div>
    </div>
  );
}

// ── VerifiedCheckBadge: rosette icon top-right of CV card, color-coded by tier ──
function VerifiedCheckBadge({ verificationType }: { verificationType?: string }) {
  const s = getBadgeStyles(verificationType);
  const color = s.hex;

  return (
    <div className="relative group/vcheck cursor-default">
      {/* Outer ring */}
      <div
        className="relative w-11 h-11 flex items-center justify-center rounded-full bg-slate-900/90 backdrop-blur-xl transition-all duration-300"
        style={{ border: `1px solid ${color}40`, boxShadow: `0 0 18px ${color}22` }}
      >
        {/* Rosette SVG */}
        <div className="relative w-6 h-6 flex items-center justify-center">
          <svg viewBox="0 0 24 24" aria-label="Verified" className="w-full h-full" style={{ fill: "none", stroke: color, strokeWidth: "1.5" }}>
            <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z" />
          </svg>
          <Check className="absolute w-2.5 h-2.5" style={{ color }} strokeWidth={3.5} />
        </div>
      </div>

      {/* Hover tooltip */}
      <div className="absolute top-full right-0 mt-2 w-44 opacity-0 group-hover/vcheck:opacity-100 transition-opacity duration-300 pointer-events-none z-[100]">
        <div className="bg-slate-900 border border-white/10 p-2.5 rounded-xl shadow-2xl backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-widest leading-tight" style={{ color }}>
            {getVerificationLabel(verificationType)}
          </p>

          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-[8px] text-slate-500 uppercase font-black tracking-tight">Attestation Power</span>
            <div className="flex gap-[3px]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`h-[3px] w-2.5 rounded-full ${i < s.bars ? `${s.bgBase} opacity-90` : 'bg-white/10'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── WorkRecordCard: A collapsible card for each work history entry ──
function WorkRecordCard({ 
  r, 
  onSelect, 
  onPortfolioSelect,
  isDesktop = false
}: { 
  r: Receipt; 
  onSelect: (r: Receipt) => void; 
  onPortfolioSelect: (p: PortfolioItem) => void;
  isDesktop?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  return (
    <div
      onClick={() => onSelect(r)}
      className="p-4 md:p-5 rounded-lg hover:border-white/20 transition-all cursor-pointer group/work relative overflow-hidden shadow-[0_12px_20px_-8px_rgba(0,0,0,0.8)]"
      style={{ background: "#0a0a0c", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Lightning shine sweep */}
      <div className="animate-lightning-shine absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none z-10" />
      {/* Top spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-16 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.04)_0%,transparent_70%)] pointer-events-none z-10" />

      {/* 3D Rim Light (Inner Edge Highlight) */}
      <div className="absolute inset-0 rounded-lg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),inset_1px_0_0_0_rgba(255,255,255,0.02)] pointer-events-none z-10" />

      {/* Specular corner highlights */}
      <div className="absolute top-0 left-0 w-16 h-16 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none z-10" />
      <div className="absolute top-0 right-0 w-16 h-16 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none z-10" />

      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0 max-w-full">
          {/* Primary: Role + Organization */}
          <div className="space-y-1 break-words whitespace-normal">
            {r.role && <h3 className="text-base font-semibold text-white break-words">{r.role}</h3>}
            {r.org && <p className={`text-base text-white/80 font-bold break-words ${!r.role ? "text-white" : ""}`}>{r.org}</p>}
          </div>

          {/* Secondary: Date, Duration, Work Type */}
          <p className="text-xs text-slate-500 mt-1 break-words whitespace-normal max-w-full">
            {formatDateRange(r.startDate, r.endDate)} · {r.workType}
            {r.compensationType && ` · ${r.compensationType}`}
          </p>

          {/* Collapsible Content Wrapper (Mobile) */}
          <div className={`mt-3 ${!isExpanded ? "hidden md:block" : "block"}`}>
            {/* Attester info (if attested) */}
            {r.status === "Attested" && r.attesterWallet && (
              <div className="mb-4 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-emerald-300/70 uppercase tracking-widest">
                    {r.attestationId ? "On-chain Recruiter Proof" : "Verification Signature"}
                  </p>
                  {r.attestationType === "Hiring Proof" ? (
                    <span className="text-[8px] font-black bg-emerald-500/5 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20 tracking-tighter uppercase flex items-center gap-1">
                      <ShieldCheck className="w-2.5 h-2.5" /> Institutional Verified
                    </span>
                  ) : r.isExternal && (
                    <span className="text-[8px] font-black bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded border border-slate-700 tracking-tighter uppercase">
                      External Attestation
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center items-start gap-4">
                  <div className="flex-shrink-0 relative">
                    {r.attesterAvatar ? (
                      <img
                        src={r.attesterAvatar}
                        alt={r.attesterName}
                        className="w-12 h-12 rounded-full object-cover border border-emerald-500/10 shadow-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-500 text-sm font-bold shadow-lg">
                        {r.attesterName?.[0] || '?'}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5 border border-emerald-500/10 shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 max-w-full">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-3 w-full">
                        <p className="text-sm font-bold text-white leading-none flex-1 truncate">
                          {r.attesterName || "Community Attester"}
                        </p>
                        <RoleBadge
                          isVerified={!!r.isOfficial || !!r.isAttesterVerified}
                          type={r.verificationTier || r.attesterVerificationType}
                          className="scale-90 origin-right"
                        />
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-1.5 text-[11px] text-slate-400 font-medium">
                        {r.attesterRole && <span>{r.attesterRole}</span>}
                        {r.attesterOrg && <span>• {r.attesterOrg}</span>}
                        <span className="text-slate-600 ml-1 font-mono">
                          ({typeof r.attesterWallet === 'string' ? `${r.attesterWallet.slice(0, 6)}...${r.attesterWallet.slice(-4)}` : '0x...'})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mt-3">
             <div className={`text-sm text-slate-300 leading-relaxed break-words whitespace-normal max-w-full 
               ${isExpanded ? "line-clamp-none" : "line-clamp-3"}
               ${isDescExpanded ? "md:line-clamp-none" : "md:line-clamp-3"}
             `}>
                {r.description}
             </div>
             
             {/* Toggle Button - Mobile (Expands entire card) */}
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 setIsExpanded(!isExpanded);
               }}
               className="md:hidden mt-2 text-white/60 hover:text-white text-xs font-bold flex items-center gap-1 group"
             >
               {isExpanded ? "Show less" : "Read more"}
               <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
             </button>

             {/* Toggle Button - Desktop (Expands description only) */}
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 setIsDescExpanded(!isDescExpanded);
               }}
               className="hidden md:flex mt-2 text-white/40 hover:text-white/70 text-[10px] font-bold items-center gap-1 group uppercase tracking-widest transition-colors"
             >
               {isDescExpanded ? "Show less" : "Show more"}
               <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isDescExpanded ? "rotate-180" : ""}`} />
             </button>
          </div>

          {/* Deep Content - Collapsible on Mobile, Always Visible on Desktop */}
          <div className={`space-y-4 ${!isExpanded ? "hidden md:block" : "block mt-4 animate-in slide-in-from-top-2 duration-300"} md:mt-4`}>
            {/* Career Timeline Updates */}
            <div className="pt-2 border-t border-white/5">
               <ReceiptUpdates receipt={r} isOwner={false} />
            </div>

            {/* Impact (if present) */}
            {r.impact && r.impact.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-2">Impact</p>
                <ul className="space-y-1.5">
                  {r.impact.map((item, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2 max-w-full">
                      <span className="text-white/40 mt-0.5">•</span>
                      <span className="break-words whitespace-normal">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Evidence Links */}
            {r.evidenceLinks && r.evidenceLinks.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Evidence</p>
                <div className="flex flex-wrap gap-2">
                  {r.evidenceLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title={getEvidenceTooltip(link.label)}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.08] text-xs text-white/60 hover:text-white transition-colors border border-white/[0.08] shadow-sm"
                    >
                      {getEvidenceIcon(link.label)} {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio Images */}
            {r.portfolioImages && r.portfolioImages.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">Portfolio</p>
                <div className="flex flex-wrap gap-2">
                  {r.portfolioImages.map((img: any, idx: number) => (
                    <div 
                      key={idx} 
                      className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/5 hover:border-white/20 transition-all cursor-zoom-in"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPortfolioSelect({ title: r.role, description: r.org, imageUrl: img.imageUrl, id: `${r.id}-${idx}`, thumbnailUrl: img.thumbnailUrl });
                      }}
                    >
                      <img
                        src={img.thumbnailUrl}
                        alt={`Portfolio ${idx + 1}`}
                        className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View Transaction Button for Hiring Proofs */}
            {r.attestationType === "Hiring Proof" && r.txSignature && (
              <div className="pt-2">
                 <a
                   href={`https://solscan.io/tx/${r.txSignature}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   onClick={(e) => e.stopPropagation()}
                   className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/10 text-[11px] font-black uppercase tracking-widest w-full sm:w-auto"
                 >
                   <ExternalLink className="w-3.5 h-3.5" /> View Transaction
                 </a>
              </div>
            )}
          </div>
        </div>

        {/* Tertiary: Status Badge (top-right) */}
        <div className="flex-shrink-0 flex items-start">
           <span
             className={`text-[9px] px-2 py-0.5 rounded border whitespace-nowrap font-black uppercase tracking-widest ${r.status === "Attested"
                ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/5"
               : "border-slate-600 text-slate-400 bg-slate-800"
               }`}
             title={
               r.status === "Attested"
                 ? "Verified by wallet signature"
                 : "Reported by candidate"
             }
           >
             {r.status === "Attested" ? "✓ Attested" : "Self-Declared"}
           </span>
        </div>
      </div>
    </div>
  );
}

type Endorsement = {
    id: string;
    attester_wallet: string;
    receipt: {
        id: string;
        role: string;
        org: string;
        wallet_address: string;
        profile: {
            display_name: string;
            avatar_url: string;
        };
    };
    created_at: string;
};

export default function CVPage(props: any) {
  const params = useParams();
  const { publicKey } = useWallet();
  const wallet = props?.walletAddressOverride || (params?.wallet as string);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [viewerProfile, setViewerProfile] = useState<any>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [scoreData, setScoreData] = useState<any>(null);
  const [showAllHiring, setShowAllHiring] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [hasFetchedCerts, setHasFetchedCerts] = useState(false);
  const [isCertsLoading, setIsCertsLoading] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactedConversationId, setContactedConversationId] = useState<string | null>(null);
  const [cvMemberships, setCvMemberships] = useState<{ id: string; company_name: string; role: "member" | "admin"; recruiter_avatar_url?: string | null }[]>([]);
  const { isGoogleSignedIn } = useGoogleAuth();

  const verifiedHiringRecords = useMemo(() => {
    return receipts.filter(r => 
      (r as any).attestationType === "Hiring Proof" || 
      r.description?.includes("Official Verified Hiring Proof")
    );
  }, [receipts]);

  const contributionReceipts = useMemo(() => {
    return receipts.filter(r => 
      (r as any).attestationType !== "Hiring Proof" && 
      !r.description?.includes("Official Verified Hiring Proof")
    );
  }, [receipts]);

  const isProfileComplete = useMemo(() => {
    if (!profile) return false;
    const hasSocial = !!(
      profile.twitter ||
      profile.github ||
      profile.discord ||
      profile.telegram ||
      profile.whatsapp ||
      profile.email ||
      profile.website ||
      profile.linkedin ||
      profile.instagram
    );
    const hasExperience = contributionReceipts && contributionReceipts.length > 0;

    return !!(
      profile.bio &&
      profile.skills &&
      hasExperience &&
      hasSocial
    );
  }, [profile, contributionReceipts]);

  const totalYearsExperience = useMemo(() => {
    if (!contributionReceipts || contributionReceipts.length === 0) return 0;

    // 1. Convert all contribution receipts into date intervals [start, end]
    const intervals = contributionReceipts
      .map(r => ({
        start: new Date(r.startDate).getTime(),
        end: r.endDate ? new Date(r.endDate).getTime() : new Date().getTime()
      }))
      .filter(i => !isNaN(i.start) && !isNaN(i.end))
      .sort((a, b) => a.start - b.start);

    if (intervals.length === 0) return 0;

    // 2. Merge overlapping intervals
    const merged: { start: number; end: number }[] = [];
    let current = intervals[0];

    for (let i = 1; i < intervals.length; i++) {
      const next = intervals[i];
      if (next.start <= current.end) {
        // Overlap: extend current interval
        current.end = Math.max(current.end, next.end);
      } else {
        // No overlap: push current and move to next
        merged.push(current);
        current = next;
      }
    }
    merged.push(current);

    // 3. sum up durations in months
    let totalMonths = 0;
    merged.forEach(interval => {
      const start = new Date(interval.start);
      const end = new Date(interval.end);
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      totalMonths += Math.max(1, months); // at least 1 month per interval
    });

    return Math.floor(totalMonths / 12);
  }, [contributionReceipts]);



  useEffect(() => {
    if (publicKey) {
      fetch(`/api/user/me?wallet=${publicKey.toBase58()}`)
        .then(r => r.json())
        .then(data => setViewerProfile(data))
        .catch(() => setViewerProfile(null));
    } else {
      setViewerProfile(null);
    }
  }, [publicKey]);

  // --- Profile View Exposure Notification ---
  useEffect(() => {
    // Only trigger if we have a target (wallet), a viewer (publicKey), and we know the viewer's profile type
    if (!wallet || !publicKey || !viewerProfile) return;
    
    // Don't notify if the user is viewing their own profile
    if (publicKey.toBase58() === wallet) return;

    const isRecruiter = !!(viewerProfile.isVerified && isRecruiterTier(viewerProfile.verificationType));
    
    // Call the dedicated view notification API
    fetch('/api/profile/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetWallet: wallet,
        viewerWallet: publicKey.toBase58(),
        isRecruiter: isRecruiter
      })
    }).catch(err => console.error("Failed to sync profile view notification:", err));
    
  }, [wallet, publicKey, viewerProfile]);

  const [collections, setCollections] = useState<any[]>([]);
  const [endorsements, setEndorsements] = useState<any[]>([]);
  const [orgProjects, setOrgProjects] = useState<any[]>([]);

  useEffect(() => {
    if (!wallet) return;

    // --- CRITICAL DATA: Profile (blocks loading screen) ---
    fetch(`/api/profile?wallet=${wallet}`)
      .then((r) => r.json())
      .then((prof) => {
        setProfile(prof);
        // Page becomes visible as soon as identity is resolved
        setLoading(false);
      })
      .catch((err) => {
        console.error("Critical fetch failed (profile):", err);
        setLoading(false); 
      });

    // --- NON-CRITICAL DATA: Receipts & Portfolio (fetched in background) ---
    fetch(`/api/members/memberships?builderWallet=${wallet}`)
      .then((r) => r.json())
      .then((d) => { if (d.ok) setCvMemberships(d.data); })
      .catch(() => {});

    Promise.all([
      fetch(`/api/receipts?wallet=${wallet}`).then((r) => r.json()),
      fetch(`/api/portfolio?wallet=${wallet}`).then((r) => r.json()),
      fetch(`/api/hiring/collections?wallet=${wallet}`).then((r) => r.json()),
      fetch(`/api/organizations/attestations?wallet=${wallet}`).then((r) => r.json()),
      fetch(`/api/org/projects?wallet=${wallet}`).then((r) => r.ok ? r.json() : { data: [] }).catch(() => ({ data: [] })),
    ]).then(([recsData, port, collectionsData, endorsementsData, projectsData]) => {
      const recs = Array.isArray(recsData) ? recsData : (recsData.receipts || []);
      const sortedRecs = [...recs].sort((a: any, b: any) => 
        (b.status === "Attested" ? 1 : 0) - (a.status === "Attested" ? 1 : 0)
      );
      setReceipts(sortedRecs);
      setPortfolio(Array.isArray(port) ? port : []);
      
      if (collectionsData?.ok && Array.isArray(collectionsData.data)) {
        setCollections(collectionsData.data);
      }

      if (endorsementsData?.ok && Array.isArray(endorsementsData.data)) {
        const mappedEndorsements = endorsementsData.data.map((e: any) => ({
             ...e.receipt,
             startDate: e.receipt?.start_date,
             endDate: e.receipt?.end_date,
             workType: e.receipt?.work_type,
             compensationType: e.receipt?.compensation_type,
             evidenceLinks: e.receipt?.evidence_links || [],
             portfolioImages: e.receipt?.portfolio_images || [],
             impact: e.receipt?.impact || [],
             status: "Attested",
             attesterWallet: e.attester_wallet,
             createdAt: e.created_at,
             profile: e.receipt?.profile || { display_name: "Anonymous Builder", avatar_url: null }
        }));
        setEndorsements(mappedEndorsements);
      }

      if (Array.isArray(projectsData?.data)) {
        setOrgProjects(projectsData.data);
      }
    }).catch(err => console.error("Non-critical fetches failed:", err));

    // --- NON-CRITICAL DATA: Score (fetched in background) ---
    fetch(`/api/v1/wallet/${wallet}/score`)
      .then((r) => r.json())
      .then((score) => {
        if (score && !score.error) {
          setScoreData(score);
        }
      })
      .catch((err) => console.error("Score fetch failed:", err));
  }, [wallet]);

  const fetchCertificates = async () => {
    if (hasFetchedCerts || !wallet) return;
    setIsCertsLoading(true);
    try {
      const res = await fetch(`/api/certificates?wallet=${wallet}`);
      const data = await res.json();
      if (Array.isArray(data)) setCertificates(data);
      setHasFetchedCerts(true);
    } catch (err) {
      console.error("Failed to load certificates:", err);
    } finally {
      setIsCertsLoading(false);
    }
  };

  useEffect(() => {
    if (wallet && !hasFetchedCerts) {
        fetchCertificates();
    }
  }, [wallet]);

  const handleExpandCerts = () => {
    // Logic handled by useEffect now, but kept for interface compatibility
  };

  if (loading) {
    return <LoadingScreen message="Fetching verified identity..." />;
  }

  // ── Role-based CV routing ──────────────────────────────────────────────────
  // Delegates tier detection to normalizeTier() - the shared SSOT from paymentConfig.
  // IndividualCV (the existing render below) is left completely untouched.
  if (profile) {
    const tier = normalizeTier(profile.verificationType || profile.verificationTier);
    const isCompany  = tier.includes("company")  || tier.includes("org");
    const isCommunity = tier.includes("community") || tier.includes("dao");

    if (isCompany || isCommunity) {
      return (
        <main className="min-h-screen flex flex-col text-white relative overflow-x-hidden selection:bg-teal-500/30 selection:text-white theme-bg-page theme-aware">
          <div className="fixed inset-0 -z-10" style={{ background: "linear-gradient(to bottom, #000000 0%, #2c2c30 100%)" }} />
          <div className="hidden md:block"><Navbar isVerified={!!profile?.isVerified} verifierTier={profile?.verifierTier} verificationTier={profile?.verificationTier} /></div>
          <section className="w-full max-w-full md:max-w-3xl mx-auto px-4 md:px-0 pt-6 md:pt-32 pb-28 md:pb-12">
            <TrustIssuerCV
               profile={profile}
               receipts={endorsements}
               scoreData={scoreData}
               wallet={wallet}
               collections={collections}
               isCommunity={isCommunity}
               projects={orgProjects}
            />
            <footer className="mt-auto text-center border-t border-slate-800 pt-8 pb-4 mt-12">
              <p className="text-slate-600 text-xs max-w-md mx-auto">
                ChainVolio provides infrastructure for career history. Verification is performed by cryptographic signatures, not by ChainVolio itself.
              </p>
            </footer>
          </section>
          <Footer className="bg-[#030303]/90 backdrop-blur-md" />
        </main>
      );
    }
  }
  // ── End role routing - IndividualCV renders below ──────────────────────────

  return (
    <main className="min-h-screen flex flex-col text-white relative overflow-x-hidden selection:bg-teal-500/30 selection:text-white theme-aware">
      {/* Fixed background — desktop dark gradient, mobile very dark grey */}
      <div className="hidden md:block fixed inset-0 -z-10" style={{ background: "linear-gradient(to bottom, #000000 0%, #2c2c30 100%)" }} />
      <div className="block md:hidden fixed inset-0 -z-10" style={{ background: "#111111" }} />
      <div className="hidden md:block"><Navbar isVerified={!!profile?.isVerified} verifierTier={profile?.verifierTier} verificationTier={profile?.verificationTier} /></div>
      <section className="w-full max-w-full md:max-w-3xl mx-auto px-4 md:px-0 pt-6 md:pt-32 pb-28">
        {(!profile && !loading) ? (
          <p className="text-slate-500">Profile not found.</p>
        ) : (
          <>
            {/* MAIN CV CARD COMPONENT */}
            <div className="relative flex flex-col justify-between md:min-h-[360px] mb-8 p-5 md:p-8 rounded-2xl md:rounded-3xl overflow-hidden group w-full shadow-[0_12px_24px_-8px_rgba(0,0,0,0.9)] border border-white/[0.08] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01]">
              {/* Animated silver gradient border */}
              <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-r from-slate-400/20 via-white/30 to-slate-400/20 opacity-60 animate-pulse pointer-events-none"></div>

              {/* Main Card Background: Deeper Dark */}
              <div className="absolute inset-0 rounded-2xl md:rounded-3xl border border-white/[0.04] pointer-events-none" style={{ background: "#0a0a0c" }}></div>

              {/* Top-Center Spotlight Effect (Conical Spread) */}
              <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-2xl md:rounded-3xl">
                <div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[120%] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08)_0%,transparent_60%)]"
                />
                <div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
                {/* Diagonal lightning shine back again */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-lightning-shine"></div>
              </div>

              {/* 3D Rim Light (Inner Edge Highlight) */}
              <div className="absolute inset-0 rounded-2xl md:rounded-3xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),inset_0_-2px_4px_rgba(0,0,0,0.8),inset_1.5px_0_2px_rgba(255,255,255,0.06),inset_-1.5px_0_2px_rgba(0,0,0,0.6)] pointer-events-none z-30" />

              {/* Outer glow with silver accent */}
              <div className="absolute -inset-[2px] rounded-2xl md:rounded-3xl bg-gradient-to-br from-slate-400/20 via-white/10 to-slate-500/20 opacity-50 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl pointer-events-none"></div>

              {/* Specular corner highlights */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none z-30" />
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none z-30" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none z-30" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-[radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.04)_0%,transparent_70%)] pointer-events-none z-30" />


              <div className="absolute top-6 right-6 z-50 hidden md:flex flex-col gap-4 items-center pointer-events-auto">
                {profile?.isVerified && (
                  <div className="hidden md:block">
                    <VerifiedCheckBadge verificationType={profile?.verificationType} />
                  </div>
                )}
                {scoreData && (
                  <button 
                    onClick={() => setIsScoreModalOpen(true)}
                    className="relative z-50 pointer-events-auto cursor-pointer group/scorebtn flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 hover:scale-110 hover:bg-[#a855f7]/10 hover:brightness-110 border border-transparent hover:border-[#a855f7]/40 shadow-[0_0_0_rgba(168,85,247,0)] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                  >
                    <span className="text-3xl font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-[#a855f7] via-fuchsia-400 to-blue-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)] group-hover/scorebtn:drop-shadow-[0_0_25px_rgba(168,85,247,0.6)]">
                      {scoreData.score}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#a855f7]/80 mt-1">CV Score</span>
                  </button>
                )}
              </div>

              {/* Content wrapper */}
              <div className="relative flex flex-col md:flex-row items-start gap-3 md:gap-8 w-full z-40 flex-1">

                {/* ── MOBILE HEADER (replaces avatar col + top identity on mobile) ── */}
                <div className="md:hidden w-full space-y-4 mb-1">

                  {/* Row 1: lookingFor pill + CV score */}
                  <div className="flex items-start justify-between gap-3">
                    {profile?.lookingFor ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/55 text-[13px]">
                        <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="font-medium leading-snug">{profile.lookingFor}</span>
                      </div>
                    ) : <div />}
                    {scoreData && (
                      <button onClick={() => setIsScoreModalOpen(true)} className="flex flex-col items-end cursor-pointer flex-shrink-0">
                        <span className="text-[28px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-[#a855f7] via-fuchsia-400 to-blue-500">
                          {scoreData.score}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#a855f7]/70 mt-0.5">CV Score</span>
                      </button>
                    )}
                  </div>

                  {/* Row 2: Avatar + Identity */}
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0 pb-2 pr-2">
                      {profile?.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={profile.displayName}
                          className="w-[88px] h-[88px] rounded-full object-cover border-4 border-slate-800 shadow-xl" />
                      ) : (
                        <div className="w-[88px] h-[88px] rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-3xl border-4 border-slate-800 shadow-xl">👤</div>
                      )}
                      {profile?.isVerified && (
                        <div className="absolute bottom-0 right-0 scale-75 origin-bottom-right">
                          <VerifiedCheckBadge verificationType={profile?.verificationType} />
                        </div>
                      )}
                    </div>

                    {/* Identity */}
                    <div className="flex-1 min-w-0">
                      <h1 className="text-xl font-bold text-white leading-tight truncate">
                        {profile?.displayName}
                      </h1>
                      {(profile?.role || profile?.organization) && (
                        <p className="text-sm text-slate-400 mt-0.5 leading-snug">
                          {profile.role}{profile.role && profile.organization ? " at " : ""}{profile.organization}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-500">
                        {profile?.country && (
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.country}</span>
                        )}
                        {profile?.timezone && (
                          <span className="flex items-center gap-1 font-mono"><Clock className="w-3 h-3" />{profile.timezone}</span>
                        )}
                      </div>
                      {profile?.workPreference && profile.workPreference.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {profile.workPreference.map((pref) => (
                            <span key={pref} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/50">
                              {pref}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Avatar Column — desktop only */}
                <div className="hidden md:flex flex-shrink-0 flex-col items-start w-auto">
                  {/* Mobile: row (avatar left | meta right), Desktop: column (avatar above, meta below) */}
                  <div className="flex flex-row md:flex-col items-start gap-4 md:gap-0">
                    {/* Avatar */}
                    <div className="relative group/avatar flex-shrink-0 pb-3 pr-3">
                      {profile?.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt={profile.displayName}
                          className="w-[112px] h-[112px] md:w-32 md:h-32 rounded-full object-cover border-4 border-slate-800 shadow-xl"
                        />
                      ) : (
                        <div className="w-[112px] h-[112px] md:w-32 md:h-32 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-3xl md:text-4xl border-4 border-slate-800 shadow-xl">
                          👤
                        </div>
                      )}
                      {/* Trust Badge Overlay — scaled down on mobile */}
                      <div className="absolute bottom-0 right-0 scale-75 md:scale-100 origin-bottom-right">
                        {profile?.isVerified && <VerifiedCheckBadge verificationType={profile?.verificationType} />}
                      </div>
                    </div>

                    {/* Meta: mobile = right of avatar, desktop = below avatar */}
                    <div className="flex flex-col items-start gap-2 pt-1 md:pt-0 md:mt-4 text-slate-400">
                      {profile?.country && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm font-medium">{profile.country}</span>
                        </div>
                      )}
                      {profile?.timezone && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="font-mono">{profile.timezone}</span>
                        </div>
                      )}
                      {/* Availability — desktop only here; mobile shows below name */}
                      {profile?.workPreference && profile.workPreference.length > 0 && (
                        <div className="hidden md:flex flex-col items-start gap-1.5 mt-1">
                          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Availability</span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {profile.workPreference.map((pref) => (
                              <span key={pref} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/50">
                                {pref}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Brand Logo & Text — desktop only */}
                  <div className="hidden md:flex items-center gap-2 mt-6 pt-4 border-t border-white/5 w-full justify-start">
                    <div className="w-7 h-7 rounded-lg bg-black/60 border border-white/[0.06] flex items-center justify-center">
                      <img src="/logo.png" alt="ChainVolio" className="h-4 w-auto opacity-70" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">ChainVolio</span>
                  </div>
                </div>


                {/* Info Column */}
                <div className="flex-1 flex flex-col text-left space-y-4 w-full h-full">



                  {/* Looking For Badge — desktop only (mobile version is above avatar) */}
                  {profile?.lookingFor && (
                    <div className="hidden md:flex items-center justify-start gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span className="font-medium">{profile.lookingFor}</span>
                      </div>
                    </div>
                  )}

                  {/* Name — desktop only (mobile: in mobile header above) */}
                  <div className="hidden md:flex flex-col md:flex-row md:items-center gap-3 w-full">
                    <div className="flex items-center gap-3 flex-wrap justify-start flex-1 min-w-0">
                      <h1 className="text-2xl md:text-4xl font-bold text-white truncate max-w-full">
                        {profile?.displayName}
                      </h1>
                    </div>
                  </div>

                  {/* Profile Identity — desktop only */}
                  {profile?.role ? (
                    <p className="hidden md:block text-sm font-medium text-slate-400 leading-snug">
                      {profile.role}
                      {profile.organization && <span> at {profile.organization}</span>}
                    </p>
                  ) : profile?.organization ? (
                    <p className="hidden md:block text-sm font-medium text-slate-400 leading-snug">
                      {profile.organization}
                    </p>
                  ) : null}

                  {/* Badges & Trust Hierarchy */}
                  <div className="flex flex-wrap items-center justify-start gap-3 mt-4">
                    <RoleBadge 
                      isVerified={!!profile?.isVerified} 
                      type={profile?.verificationTier} 
                    />
                    
                    <ProfileCompleteBadge
                      isComplete={isProfileComplete}
                      onClick={() => {
                        setToastMessage("This candidate has fulfilled all profile requirements, including professional background, skills, work evidence, and contact information.");
                      }}
                    />
                    
                    <CommunityBadge cvId={profile?.cardNumber || 0} />
                    {cvMemberships.map((m) => (
                      <CompanyMemberBadge key={m.id} membership={m} />
                    ))}
                    <ExperienceBadge years={totalYearsExperience} />
                  </div>

                  {/* Skills Pills */}
                  {profile?.skills ? (
                    <div className="flex flex-wrap items-center justify-start gap-1.5 md:gap-2 mt-3">
                      {profile.skills.split(',').map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-black/60 border border-white/[0.06] text-[10px] md:text-xs text-slate-300 hover:border-white/[0.12] transition-colors">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  ) : publicKey?.toBase58() === wallet ? (
                    <div className="pt-2">
                      <span className="text-xs text-slate-500/50 italic border border-dashed border-white/10 rounded-lg px-3 py-1.5">Add skills to show recruiters</span>
                    </div>
                  ) : null}

                  <div className="pt-2">
                    {profile?.bio ? (
                      <ExpandableText
                        text={profile.bio}
                        maxLength={350}
                        className="text-slate-300 text-sm leading-relaxed max-w-2xl"
                      />
                    ) : publicKey?.toBase58() === wallet ? (
                      <span className="text-xs text-slate-500/50 italic border border-dashed border-white/10 rounded-lg px-3 py-2 block w-max max-w-full">Add a brief bio about your career</span>
                    ) : null}
                  </div>

                  {/* Social Row */}
                  {(profile?.twitter || profile?.github || profile?.linkedin || profile?.instagram || profile?.website || profile?.discord || profile?.telegram || profile?.whatsapp || profile?.email) ? (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 relative z-50 border-t border-white/5 mt-2">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      {profile?.twitter && (
                        <a
                          href={`https://x.com/${profile.twitter.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-black/60 border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                          title="Twitter / X"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        </a>
                      )}

                      {profile?.github && (
                        <a
                          href={`https://github.com/${profile.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-black/60 border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                          title="GitHub"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                          </svg>
                        </a>
                      )}

                      {profile?.linkedin && (
                        <a
                          href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin.replace(/^(www\.)?linkedin\.com\/in\//, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-black/60 border border-white/[0.06] text-slate-400 hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/20 transition-all"
                          title="LinkedIn"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                          </svg>
                        </a>
                      )}

                      {profile?.instagram && (
                        <a
                          href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-black/60 border border-white/[0.06] text-slate-400 hover:text-[#E4405F] hover:bg-[#E4405F]/10 hover:border-[#E4405F]/20 transition-all font-bold"
                          title="Instagram"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.166.054 1.8.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.427.359 1.061.413 2.227.057 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.166-.249 1.8-.415 2.227-.217.562-.477.96-.896 1.382-.42.419-.819.679-1.381.896-.427.164-1.061.359-2.227.413-1.266.057-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.166-.054-1.8-.249-2.227-.415-.562-.217-.96-.477-1.382-.896-.419-.42-.679-.819-.896-1.381-.164-.427-.359-1.061-.413-2.227-.057-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.166.249-1.8.415-2.227.217-.562.477-.96.896-1.382.42-.419.819-.679 1.381-.896.427-.164 1.061-.359 2.227-.413 1.266-.057 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.277.057-2.149.261-2.911.558-.788.306-1.457.715-2.122 1.381-.666.665-1.075 1.334-1.381 2.122-.297.762-.501 1.634-.558 2.911-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.057 1.277.261 2.149.558 2.911.306.788.715 1.457 1.381 2.122.665.666 1.334 1.075 2.122 1.381.762.297 1.634.501 2.911.558 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.277-.057 2.149-.261 2.911-.558.788-.306 1.457-.715 2.122-1.381.666-.665 1.075-1.334 1.381-2.122.297-.762.501-1.634.558-2.911.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.057-1.277-.261-2.149-.558-2.911-.306-.788-.715-1.457-1.381-2.122-.665-.666-1.334-1.075-2.122-1.381-.762-.297-1.634-.501-2.911-.558-1.28-.058-1.688-.072-4.947-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        </a>
                      )}


                      {profile?.website && (
                        <a
                          href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-black/60 border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                          title="Website"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {profile?.discord && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(profile.discord!);
                            setToastMessage(`Discord handle copied: ${profile.discord}`);
                          }}
                          className="p-1.5 rounded-lg bg-black/60 border border-white/[0.06] text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all cursor-pointer"
                          title="Copy Discord Handle"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 11.721 11.721 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.862-1.295 1.192-1.996a.076.076 0 0 0-.041-.106 13.046 13.046 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                          </svg>
                        </button>
                      )}

                      {profile?.telegram && (
                        <a
                          href={`https://t.me/${profile.telegram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-black/60 border border-white/[0.06] text-slate-400 hover:text-[#26A5E4] hover:bg-[#26A5E4]/10 hover:border-[#26A5E4]/20 transition-all"
                          title="Telegram"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.944 0C5.347 0 0 5.347 0 11.944c0 6.597 5.347 11.944 11.944 11.944 6.597 0 11.944-5.347 11.944-11.944C23.888 5.347 18.541 0 11.944 0zm5.204 8.525c-.179 1.884-.962 5.925-1.359 8.041-.168.9-.499 1.203-.82 1.232-.698.064-1.226-.462-1.902-.905-1.057-.695-1.655-1.127-2.682-1.803-1.187-.781-.417-1.21.258-1.912.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212-.071-.064-.175-.041-.249-.024-.106.024-1.793 1.141-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.098.154.228.163.319.009.091.011.201.009.324z" />
                          </svg>
                        </a>
                      )}

                      {profile?.whatsapp && (
                        <a
                          href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-black/60 border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all font-bold"
                          title="WhatsApp"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                        </a>
                      )}

                      {profile?.email && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(profile.email!);
                            setToastMessage(`Email address copied: ${profile.email}`);
                          }}
                          className="p-1.5 rounded-lg bg-black/60 border border-white/[0.06] text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20 transition-all cursor-pointer"
                          title="Copy Email Address"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                      )}
                      </div>

                      {/* Right Side: Wallet & ID */}
                      <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 opacity-60 hover:opacity-100 transition-opacity">
                        {/* Wallet Section */}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(wallet);
                            setToastMessage("Wallet address copied!");
                          }}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-950/40 border border-slate-700/30 hover:border-indigo-500/40 transition-all cursor-pointer backdrop-blur-sm"
                        >
                          <Wallet className="w-2.5 h-2.5 text-indigo-400" />
                          <span className="font-mono text-[10px] text-slate-400">
                            {typeof wallet === 'string' ? `${wallet.slice(0, 4)}...${wallet.slice(-4)}` : '0x...'}
                          </span>
                        </button>

                        {/* CV ID */}
                        {profile?.cardNumber && (
                          <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-tight text-slate-400">
                            <span className="text-[8px] uppercase font-bold text-slate-600">ID</span>
                            <span className="font-black text-slate-300">#{String(profile?.cardNumber || 0).padStart(5, '0')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : publicKey?.toBase58() === wallet ? (
                    <div className="pt-2">
                      <span className="text-xs text-slate-500/50 italic border border-dashed border-white/10 rounded-lg px-3 py-1.5">Add social links & contacts</span>
                    </div>
                  ) : null}
                </div>
              </div>


            </div>


            {/* Recruiter Trust Disclaimer */}
            <div className="mt-8 p-4 rounded-xl flex items-start gap-3 shadow-[0_12px_20px_-8px_rgba(0,0,0,0.8)] relative overflow-hidden" style={{ background: "#0a0a0c", border: "1px solid rgba(255,255,255,0.08)" }}>
              {/* Lightning shine */}
              <div className="animate-lightning-shine absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none" style={{ animationDelay: "2s" }} />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Recruiter Note: Verified Integrity</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Attestations marked with <span className="text-emerald-400 font-bold">✓ Attested</span> are cryptographically signed by third-party verifiers. These claims are publicly verifiable and cannot be altered by the candidate.
                </p>
              </div>
            </div>

            {contributionReceipts.length > 0 && (
              <WorkTimeline
                receipts={contributionReceipts}
                onSelectReceipt={setSelectedReceipt}
              />
            )}

            {/* Profile Incomplete Prompt */}
            {publicKey?.toBase58() === wallet && !isProfileComplete && (
               <div className="mt-8 mb-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-center justify-between gap-4 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.7)]">
                 <div className="flex items-center gap-3">
                   <Info className="w-5 h-5 text-amber-500 shrink-0" />
                   <p className="text-xs text-slate-400 leading-relaxed">
                     Complete your profile to increase visibility to recruiters.
                   </p>
                 </div>
                 <Link href="/create-profile" className="text-[10px] font-black text-amber-500 hover:text-amber-400 transition-colors uppercase tracking-widest whitespace-nowrap px-3 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5">
                   Improve CV
                 </Link>
               </div>
            )}

            {/* Verified Credentials Section */}
            <div className="mt-6 mb-8 pt-4 border-t border-slate-800/50">
              <CertificateSection 
                certs={certificates} 
                isOwner={false} 
                onExpand={handleExpandCerts}
                isLoading={isCertsLoading}
                onPreview={setSelectedCert}
              />
            </div>

            <h2 className="text-xl font-semibold mt-6 mb-4">Proof of Work</h2>
            {contributionReceipts.length === 0 ? (
              <div className="p-12 border border-dashed border-slate-700/50 rounded-2xl text-center bg-slate-900/20">
                <FileText className="w-8 h-8 text-slate-600 mx-auto mb-3 opacity-50" />
                <p className="text-slate-400 mb-4 font-medium">No proof of work added yet</p>
                {publicKey?.toBase58() === wallet && (
                  <Link 
                    href="/create-profile" 
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 font-bold rounded-xl border border-white/10 transition-all text-sm"
                  >
                    + Add Proof
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {contributionReceipts.map((r, i) => (
                  <WorkRecordCard 
                    key={r.id || i}
                    r={r}
                    onSelect={setSelectedReceipt}
                    onPortfolioSelect={setSelectedPortfolio}
                  />
                ))}
              </div>
            )}

            {/* Verified Hiring Section - Redesigned to match Career Timeline style */}
            {verifiedHiringRecords.length > 0 && (
              <div className="w-full mb-3 border-t border-slate-800/50 pt-4 mt-6">
                <button
                  onClick={() => setShowAllHiring(!showAllHiring)}
                  className="w-full text-left py-2 hover:opacity-80 transition-opacity group flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-2 flex-shrink-0 bg-blue-500/10 text-blue-400 flex items-center justify-center rounded-lg">
                      <ShieldCheck className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors mb-0.5">Verified Hiring</h2>
                      <p className="text-xs text-slate-400 font-medium tracking-wide">On-chain recruiter proofs and institutional hires.</p>
                    </div>
                  </div>
                  <div className="p-2 flex items-center justify-center text-slate-400">
                    {showAllHiring ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {showAllHiring && (
                  <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    {verifiedHiringRecords.map((record, i) => (
                      <div 
                        key={i} 
                        onClick={() => setSelectedReceipt(record)}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-blue-500/40 hover:bg-blue-500/[0.02] transition-all cursor-pointer group/hiring relative overflow-hidden"
                      >
                        {/* Subtle background glow for hiring cards */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] to-transparent opacity-0 group-hover/hiring:opacity-100 transition-opacity" />
                        
                        <div className="relative z-10 space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                             <p className="text-base font-bold text-white group-hover/hiring:text-blue-400 transition-colors">
                               {record.role} at {record.org}
                             </p>
                          </div>
                          
                          <div className="flex flex-col gap-1.5 ml-3.5 text-[11px] text-slate-400 font-medium tracking-wide">
                             <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-slate-500 px-1.5 py-0.5 rounded bg-slate-800/50 border border-slate-700/50 uppercase text-[9px]">Recruiter Proof</span>
                                <span className="w-1 h-1 rounded-full bg-slate-700" />
                                <span className="text-blue-400/80">Verified by {record.attesterName || record.attesterWallet?.slice(0, 6)}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-700" />
                                <span>{record.startDate ? new Date(record.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Mar 2026'}</span>
                             </div>
                          </div>
                          
                          {record.description && (
                             <div className="ml-3.5 border-l-2 border-blue-500/10 pl-4 py-1 mt-2 max-w-full">
                               <p className="text-[11px] text-slate-400/90 leading-relaxed font-medium line-clamp-2 italic break-words whitespace-normal">
                                 "{record.description}"
                               </p>
                             </div>
                          )}
                        </div>
                        
                        <div className="relative z-10 flex items-center gap-3">
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[8px] font-black text-blue-500/60 uppercase tracking-[0.2em]">Institutional</span>
                            <span className="text-[10px] px-3 py-1 rounded-full border border-blue-500/50 text-blue-400 bg-blue-500/10 whitespace-nowrap font-black uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                              ✓ Attested
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <PortfolioModal
          item={selectedPortfolio}
          onClose={() => setSelectedPortfolio(null)}
        />

        <ReceiptDetailModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />

        <CertificatePreviewModal
          cert={selectedCert}
          onClose={() => setSelectedCert(null)}
        />

        {isScoreModalOpen && scoreData && (
          <div className="fixed inset-0 z-[100001] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsScoreModalOpen(false)}></div>
            <div className="relative w-full max-w-sm bg-[#0a0a0f] border border-[#a855f7]/30 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="p-6 border-b border-white/5 relative flex flex-col items-center justify-center text-center">
                <button 
                  onClick={() => setIsScoreModalOpen(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
                <Star className="w-8 h-8 text-[#a855f7] mb-2 saturate-150 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                <h3 className="text-xl font-black text-white mb-1">
                  ChainVolio Score: {scoreData.score} ({scoreData.level})
                </h3>
                
                {/* Modal main progress */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-3 mb-2">
                   <div className="h-full bg-gradient-to-r from-[#a855f7] to-fuchsia-400" style={{ width: `${scoreData.score}%` }}></div>
                </div>


                 {/* Confidence Level Display */}
                 <div className="flex flex-col items-center gap-2 mt-4">
                    <div className="flex flex-col items-center">
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                        scoreData.confidence_label === 'High' ? 'text-emerald-400' : 
                        scoreData.confidence_label === 'Medium' ? 'text-amber-400' : 'text-rose-500'
                      }`}>
                        Confidence: {scoreData.confidence_label || "Low"} ({Math.round((scoreData.confidence || 0) * 100)}%)
                      </span>
                      <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">Data Reliability Indicator</p>
                    </div>

                    {/* Trust Score Display */}
                    {scoreData.trust_score !== undefined && (
                      <div className="flex flex-col items-center mt-1 pt-3 border-t border-white/5 w-full">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className={`w-3.5 h-3.5 ${
                            scoreData.trust_score >= 40 ? 'text-emerald-400' : 
                            scoreData.trust_score >= 20 ? 'text-amber-400' : 'text-rose-500'
                          }`} />
                          <span className="text-xs font-black text-white tracking-widest uppercase">
                            Trust Score: <span className={
                              scoreData.trust_score >= 40 ? 'text-emerald-400' : 
                              scoreData.trust_score >= 20 ? 'text-amber-400' : 'text-rose-400'
                            }>{scoreData.trust_score}</span>
                          </span>
                        </div>
                        <span className={`text-[9px] uppercase font-bold tracking-[0.15em] mt-0.5 ${
                           scoreData.trust_score >= 40 ? 'text-emerald-500/60' : 
                           scoreData.trust_score >= 20 ? 'text-amber-500/60' : 'text-rose-500/60'
                        }`}>
                          {scoreData.trust_score >= 40 ? 'High-Trust Candidate' : 
                           scoreData.trust_score >= 20 ? 'Balanced Profile' : 'Emerging Reputation'}
                        </span>
                      </div>
                    )}

                    {/* Primary Expertise Display */}
                    {scoreData.domains && Object.keys(scoreData.domains).length > 0 && (
                      <div className="flex flex-col items-center mt-3 pt-3 border-t border-white/5 w-full">
                         <div className="flex flex-col items-center space-y-1">
                            <span className="text-[9px] font-black text-cyan-400/60 uppercase tracking-[0.2em]">Primary Expertise</span>
                            <div className="flex items-center gap-2">
                               <Award className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
                               <span className="text-sm font-black text-white uppercase tracking-wider">
                                 {scoreData.top_domain?.charAt(0).toUpperCase() + scoreData.top_domain?.slice(1)} - {String(scoreData.domains[scoreData.top_domain || ""])}
                               </span>
                            </div>
                            <p className="text-[8px] text-slate-500/60 uppercase font-bold tracking-widest">
                               Based on verified work and contributions
                            </p>
                         </div>
                         
                         {/* Other Domains List */}
                         <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-3">
                            {Object.entries(scoreData.domains).map(([name, score]: [string, any]) => (
                               name !== scoreData.top_domain && (
                                 <div key={name} className="flex items-center gap-2">
                                    <span className="text-[9px] uppercase font-bold text-slate-600 tracking-tight">{name}</span>
                                    <span className="text-[10px] font-black text-slate-400">{String(score)}</span>
                                 </div>
                               )
                            ))}
                         </div>
                      </div>
                    )}
                 </div>
              </div>

              {/* Breakdown */}
              <div className="p-6 space-y-4 relative bg-gradient-to-b from-transparent to-slate-900/50">
                {(() => {
                  const getLabel = (val: number) => val >= 80 ? 'Excellent' : val >= 60 ? 'Strong' : val >= 40 ? 'Moderate' : 'Basic';
                  const metrics = [
                    { name: 'Experience', val: scoreData.breakdown.experience },
                    { name: 'Verification', val: scoreData.breakdown.verification, help: 'Attestations are weighted by attester authority. A Company or Community-verified attestor carries up to 2.5x more weight than a standard attestation.' },
                    { name: 'Consistency', val: scoreData.breakdown.consistency },
                    { name: 'Skills', val: scoreData.breakdown.skill },
                    { name: 'On-Chain Activity', val: scoreData.breakdown.activity, help: 'Based on the number of work records anchored on-chain. Each verified transaction increases your score (max at 4 records).' }
                  ];
                  const tierBreakdown = scoreData.attestation_tier_breakdown;
                  const hasTierData = tierBreakdown && (
                    (tierBreakdown.company || 0) + (tierBreakdown.community || 0) +
                    (tierBreakdown.figure || 0) + (tierBreakdown.builder || 0) +
                    (tierBreakdown.unverified || 0)
                  ) > 0;

                  return (
                    <>
                      {metrics.map((m) => (
                        <div key={m.name} className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest leading-none">
                            <div className="flex items-center gap-1.5 group/m relative">
                              <span className="text-slate-400">{m.name}</span>
                              {m.help && <Info className="w-3 h-3 text-slate-500 cursor-help" />}
                              {m.help && (
                                <div className="absolute left-0 bottom-full mb-2 w-48 p-2 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-medium normal-case tracking-tight text-slate-300 opacity-0 group-hover/m:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                                  {m.help}
                                </div>
                              )}
                            </div>
                            <span className="text-white">{getLabel(m.val)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-[#a855f7]" style={{ width: `${m.val}%` }}></div>
                          </div>
                          {m.name === 'Verification' && hasTierData && (() => {
                            const tiers = [
                              { key: 'company',   label: 'Company',   color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20',   count: tierBreakdown.company   || 0 },
                              { key: 'community', label: 'Community', color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20',     count: tierBreakdown.community || 0 },
                              { key: 'figure',    label: 'Public',    color: 'text-pink-400',   bg: 'bg-pink-500/10 border-pink-500/20',     count: tierBreakdown.figure    || 0 },
                              { key: 'builder',   label: 'Builder',   color: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/20',count: tierBreakdown.builder   || 0 },
                              { key: 'unverified',label: 'Standard',  color: 'text-slate-400',  bg: 'bg-slate-500/10 border-slate-500/20',   count: tierBreakdown.unverified|| 0 },
                            ].filter(t => t.count > 0);
                            return (
                              <div className="mt-1 p-2.5 rounded-lg bg-slate-900/60 border border-white/5 space-y-1.5">
                                <div className="flex flex-wrap gap-1.5">
                                  {tiers.map(t => (
                                    <span key={t.key} className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wide ${t.bg} ${t.color}`}>
                                      {t.count}x {t.label}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-[9px] text-slate-500 leading-relaxed">
                                  Attestor authority affects this score. Company and Community-verified attestors carry up to 2.5x more weight, rewarding verified peer recognition.
                                </p>
                              </div>
                            );
                          })()}
                          {m.name === 'On-Chain Activity' && m.val < 40 && (
                            <p className="text-[9px] text-slate-500 font-medium italic">Increase your score by anchoring your work records on-chain.</p>
                          )}
                        </div>
                      ))}
                    </>
                  );
                })()}

                {/* Trust Signals */}
                <div className="mt-6 pt-6 border-t border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Verified Contributions
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> On-chain Reputation
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Tamper-proof Profile
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {toastMessage && (
          <Toast
            message={toastMessage}
            onClose={() => setToastMessage(null)}
          />
        )}

        <footer className="hidden md:block mt-auto text-center border-t border-slate-800 pt-8 pb-4">
          <p className="text-slate-600 text-xs max-w-md mx-auto">
            ChainVolio provides infrastructure for career history. Verification is performed by cryptographic signatures, not by ChainVolio itself. Please verify critical claims independently.
          </p>
        </footer>
      </section>
      <RecruiterSoftPrompt />

      {/* ── Sticky Recruiter CTA Bar ── */}
      {(() => {
        const viewerIsRecruiter = isGoogleSignedIn || (
          !!viewerProfile?.isVerified && isRecruiterTier(viewerProfile?.verificationType)
        );
        const candidateIsOrg = isRecruiterTier(profile?.verificationType);
        if (!viewerIsRecruiter || candidateIsOrg || publicKey?.toBase58() === wallet || !profile) return null;

        return (
          <div className="fixed bottom-0 inset-x-0 z-[9000] px-4 pb-[95px] md:pb-6 pointer-events-none">
            <div className="max-w-3xl mx-auto pointer-events-auto">
              <div className="flex items-center justify-between gap-4 px-4 md:px-5 py-3 md:py-3.5 rounded-2xl border border-white/[0.10] bg-black/40 backdrop-blur-2xl shadow-[0_-1px_0_0_rgba(255,255,255,0.04),0_8px_40px_rgba(0,0,0,0.5)]">

                {/* Candidate brief */}
                <div className="flex items-center gap-3 min-w-0">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={profile.displayName} className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-white/10" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-white flex-shrink-0">
                      {profile.displayName?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{profile.displayName}</p>
                    <p className="text-[10px] text-white/35 truncate">
                      {profile.role || (profile.isVerified ? "Verified Builder" : "Web3 Builder")}
                    </p>
                  </div>
                </div>

                {/* CTA */}
                {contactedConversationId ? (
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                      <Check className="w-3 h-3" /> Sent
                    </span>
                    <a
                      href="/dashboard/inbox"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-bold uppercase tracking-widest transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>View Conversation</span>
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={() => setContactModalOpen(true)}
                    className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_32px_rgba(52,211,153,0.5)] flex-shrink-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Contact Candidate</span>
                    <span className="sm:hidden">Contact</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {profile && (
        <RecruiterContactModal
          isOpen={contactModalOpen}
          onClose={() => setContactModalOpen(false)}
          candidateWallet={wallet as string}
          candidateName={profile.displayName}
          onSuccess={(conversationId, isExisting) => {
            setContactModalOpen(false);
            setContactedConversationId(conversationId);
          }}
        />
      )}

      <div className="hidden md:block">
        <Footer className="bg-[#030303]/90 backdrop-blur-md" />
      </div>
    </main>
  );
}
