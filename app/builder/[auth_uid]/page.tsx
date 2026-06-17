"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Github, Globe, MessageSquare, Mail, MapPin, Instagram, ChevronDown, ChevronUp, ExternalLink, Copy, Check, FileText, Play, Palette, Link as LinkIcon } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toast } from "@/components/ui/Toast";
import { ReceiptDetailModal } from "@/components/receipt/ReceiptDetailModal";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

type BuilderProfile = {
  org_name: string | null;
  bio: string | null;
  skills: string | null;
  avatar_url: string | null;
  website: string | null;
  twitter: string | null;
  linkedin: string | null;
  discord: string | null;
  telegram: string | null;
  email: string | null;
  country: string | null;
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
  evidenceLinks: { label: string; url: string }[];
  impact?: string[];
  portfolioImages?: { imageUrl: string; thumbnailUrl: string }[];
  status: string;
  attestationType?: string;
  attesterName?: string;
  attesterWallet?: string;
  attestations?: any[];
  createdAt?: string;
};

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  let dur = totalMonths >= 12
    ? `${Math.floor(totalMonths / 12)}y ${totalMonths % 12 > 0 ? totalMonths % 12 + "m" : ""}`.trim()
    : `${totalMonths}m`;
  return `${months[start.getMonth()]} ${start.getFullYear()} – ${months[end.getMonth()]} ${end.getFullYear()} · ${dur}`;
}

function getEvidenceIcon(label: string) {
  const map: Record<string, any> = { GitHub: Github, Website: Globe, Demo: Play, Doc: FileText, Docs: FileText, Figma: Palette };
  const Icon = map[label] || LinkIcon;
  return <Icon className="w-3 h-3" />;
}

function WorkCard({ r, onSelect }: { r: Receipt; onSelect: (r: any) => void }) {
  const [expanded, setExpanded] = useState(false);
  const attestations = r.attestations || [];
  const isAttested = r.status === "Attested" || attestations.length > 0;

  return (
    <div
      className="rounded-xl overflow-hidden transition-all cursor-pointer"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
      onClick={() => onSelect(r)}
    >
      <div className="px-4 py-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.88)" }}>{r.role || "Untitled"}</p>
            {r.workType && (
              <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "1px 5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {r.workType}
              </span>
            )}
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{r.org}</p>
          {r.startDate && (
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{formatDateRange(r.startDate, r.endDate || new Date().toISOString())}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span style={{
            fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.06em",
            ...(isAttested
              ? { color: "rgba(52,211,153,0.9)", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)" }
              : { color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" })
          }}>
            {isAttested ? "✓ Attested" : "Self-Declared"}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            style={{ color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer", padding: 4 }}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3" onClick={(e) => e.stopPropagation()}>
          {r.description && (
            <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{r.description}</p>
          )}
          {r.impact && r.impact.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {r.impact.map((tag, i) => (
                <span key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "1px 6px" }}>{tag}</span>
              ))}
            </div>
          )}
          {r.evidenceLinks && r.evidenceLinks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {r.evidenceLinks.filter(l => l.url).map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all hover:bg-white/[0.06]"
                  style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {getEvidenceIcon(link.label)}
                  {link.label}
                </a>
              ))}
            </div>
          )}
          {r.portfolioImages && r.portfolioImages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {r.portfolioImages.map((img, i) => (
                <div key={i} className="w-14 h-14 rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                  <img src={img.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BuilderPublicPage() {
  const params = useParams();
  const authUid = params?.auth_uid as string;

  const [profile, setProfile] = useState<BuilderProfile | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  useEffect(() => {
    if (!authUid) return;

    Promise.all([
      fetch(`/api/org-accounts?auth_uid=${authUid}&public=true`).then(r => r.json()),
      fetch(`/api/receipts?wallet=gauth:${authUid}`).then(r => r.json()),
    ]).then(([orgData, recsData]) => {
      if (orgData?.orgAccount) setProfile(orgData.orgAccount);
      const recs = Array.isArray(recsData) ? recsData : (recsData.receipts || []);
      setReceipts(recs.filter((r: any) =>
        r.attestationType !== "Hiring Proof" && !r.description?.includes("Official Verified Hiring Proof")
      ));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [authUid]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setToast("Failed to copy link");
    }
  };

  const displayName = profile?.org_name || "Builder";
  const contributionReceipts = receipts.filter(r =>
    (r as any).attestationType !== "Hiring Proof" && !r.description?.includes("Official Verified Hiring Proof")
  );
  const attestedCount = contributionReceipts.filter(r => r.status === "Attested").length;

  if (loading) return <LoadingScreen message="Loading profile..." />;

  if (!profile) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Profile not found</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen text-white" style={{ background: "linear-gradient(to bottom, #000000 0%, #111113 100%)" }}>
      <Navbar />
      <div style={{ height: 80 }} />

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header Card */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                : <span style={{ fontSize: 24, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>{displayName[0]?.toUpperCase()}</span>
              }
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <h1 style={{ fontSize: 20, fontWeight: 800, color: "rgba(255,255,255,0.92)", lineHeight: 1.2 }}>{displayName}</h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "2px 6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      BUILDER
                    </span>
                    {profile.country && (
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: 3 }}>
                        <MapPin className="w-3 h-3" /> {profile.country}
                      </span>
                    )}
                    {attestedCount > 0 && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(52,211,153,0.85)", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 4, padding: "2px 6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {attestedCount} Attested
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all hover:bg-white/[0.06]"
                  style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>

              {profile.bio && (
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginTop: 10 }}>{profile.bio}</p>
              )}

              {profile.skills && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {profile.skills.split(",").map((s, i) => (
                    <span key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "2px 7px" }}>
                      {s.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* Socials */}
              <div className="flex flex-wrap gap-2 mt-3">
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/[0.05] transition-all" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <Globe className="w-3 h-3" /> Website
                  </a>
                )}
                {profile.twitter && (
                  <a href={`https://twitter.com/${profile.twitter.replace("@","")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/[0.05] transition-all" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    Twitter
                  </a>
                )}
                {profile.linkedin && (
                  <a href={profile.linkedin.startsWith("http") ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/[0.05] transition-all" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <ExternalLink className="w-3 h-3" /> LinkedIn
                  </a>
                )}
                {profile.discord && (
                  <a href="#" className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/[0.05] transition-all" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <MessageSquare className="w-3 h-3" /> {profile.discord}
                  </a>
                )}
                {profile.telegram && (
                  <a href={`https://t.me/${profile.telegram.replace("@","")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/[0.05] transition-all" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                    Telegram
                  </a>
                )}
                {profile.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/[0.05] transition-all" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <Mail className="w-3 h-3" /> Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Proof of Work */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Proof of Work</h2>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 1 }}>Work history and contributions</p>
            </div>
            {contributionReceipts.length > 0 && (
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{contributionReceipts.length} {contributionReceipts.length === 1 ? "entry" : "entries"}</span>
            )}
          </div>

          {contributionReceipts.length === 0 ? (
            <div className="rounded-xl py-10 text-center" style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>No proof of work added yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {contributionReceipts.map(r => (
                <WorkCard key={r.id} r={r} onSelect={setSelectedReceipt} />
              ))}
            </div>
          )}
        </div>

        {/* Attestation CTA */}
        <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>Know this builder?</p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2, lineHeight: 1.5 }}>
            If you&apos;ve worked with {displayName}, you can attest to their proof of work on ChainVolio to verify their contributions on-chain.
          </p>
        </div>
      </div>

      <Footer />

      {selectedReceipt && (
        <ReceiptDetailModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </main>
  );
}
