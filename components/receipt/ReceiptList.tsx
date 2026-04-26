"use client";

import { useEffect, useState } from "react";
import { Clipboard, Lock } from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import { ExpandableText } from "@/components/ui/ExpandableText";
import { ReceiptUpdates } from "@/components/receipt/ReceiptUpdates";
import { WorkTimeline } from "@/components/profile/WorkTimeline";
import { getBadgeStyles } from "@/lib/paymentConfig";
import { RoleBadge } from "@/components/profile/RoleBadge";

type Receipt = {
  id: string;
  role: string;
  org: string;
  description: string;
  startDate: string;
  endDate: string;
  workType: string;
  compensationType?: string;
  evidenceHash?: string;
  evidenceLinks?: { label: string; url: string }[];
  status: string;
  attesterWallet?: string;
  attesterName?: string;
  attesterAvatar?: string;
  attesterVerificationType?: string;
  verificationTier?: string;
  isOfficial?: boolean;
  isAttesterVerified?: boolean;
  createdAt: string;
  updates?: any[];
};

type Props = {
  walletAddress: string;
  onEdit?: (receipt: Receipt) => void;
};

export function ReceiptList({ walletAddress, onEdit }: Props) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/receipts?wallet=${walletAddress}`)
      .then((r) => r.json())
      .then((data) => {
        // API returns { receipts: [...] }
        const list = Array.isArray(data) ? data : (data.receipts || []);
        setReceipts(list);
        // Check for hash link and scroll
        setTimeout(() => {
          const hash = window.location.hash;
          if (hash && hash.startsWith('#receipt-')) {
            const el = document.getElementById(hash.slice(1));
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.classList.add('animate-highlight');
              setTimeout(() => el.classList.remove('animate-highlight'), 5000);
            }
          }
        }, 500);
      })
      .finally(() => setLoading(false));
  }, [walletAddress]);

  if (loading) return <p className="text-slate-400">Loading receipts...</p>;
  if (receipts.length === 0) return <p className="text-slate-500">No receipts yet.</p>;

  return (
    <>
      {receipts.length > 0 && (
        <WorkTimeline
          receipts={receipts}
          onSelectReceipt={(r) => onEdit && onEdit(r)}
        />
      )}
      <div className="space-y-4">
        {receipts.map((r, i) => (
          <div
            key={i}
            id={`receipt-${r.id}`}
            className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 scroll-mt-24 transition-all duration-500"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{r.role}</h3>
                </div>

                <p className="text-emerald-400 text-base font-bold">{r.org}</p>

                {r.status === "Attested" && r.attesterWallet && (() => {
                  const badge = getBadgeStyles(r.attesterVerificationType);
                  return (
                    <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3">
                      {r.attesterAvatar ? (
                        <img src={r.attesterAvatar} className="w-8 h-8 rounded-full border border-emerald-500/20 object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px]">👤</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate max-w-[120px]">
                            {r.attesterName || "Verified Attester"}
                          </span>
                          <RoleBadge 
                            isVerified={!!r.isOfficial} 
                            type={r.verificationTier || r.attesterVerificationType} 
                            showTooltip={true}
                            className="scale-75 origin-left -ml-1"
                          />
                        </div>
                        <p className="text-[9px] text-slate-500 font-mono truncate">
                          {r.attesterWallet.slice(0, 6)}...{r.attesterWallet.slice(-4)}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                <ExpandableText
                  text={r.description}
                  maxLength={240}
                  className="text-slate-300 mt-2 text-sm leading-relaxed"
                />
                <p className="text-slate-500 text-xs mt-2">
                  {r.startDate} – {r.endDate} · {r.workType}
                  {r.compensationType && ` · ${r.compensationType}`}
                </p>
                {r.evidenceLinks && r.evidenceLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {r.evidenceLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs text-emerald-400 hover:text-emerald-300 transition-colors border border-slate-600"
                      >
                        🔗 {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <span
                className={`text-[10px] md:text-xs px-2 py-0.5 rounded border flex-shrink-0 self-start transition-all ${r.status === "Attested"
                  ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                  : "border-slate-700/50 text-slate-500 bg-slate-800/30"
                  }`}
                title={r.status === "Attested" ? `Verified by ${r.attesterWallet}` : "Self-reported by candidate"}
              >
                {r.status === "Attested" ? "✓ Attested" : "Self-Declared"}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/attest/${r.id}`;
                    navigator.clipboard.writeText(url);
                    setToastMessage("Verification link copied!");
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Clipboard className="w-3.5 h-3.5" aria-hidden="true" /> Copy Verification Link
                </button>
              </div>

              <div className="flex items-center gap-3">
                {r.status === "Attested" || r.status === "Locked" || r.status === "Submitted" ? (
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 italic">
                    <Lock className="w-3 h-3 text-emerald-500/50 flex-shrink-0" aria-hidden="true" /> This record is locked for editing after submission/attestation
                  </span>
                ) : (
                  <button
                    onClick={() => onEdit?.(r)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium px-2 py-1 rounded hover:bg-emerald-400/5 transition-colors"
                  >
                    Edit Record
                  </button>
                )}
              </div>
            </div>

            <ReceiptUpdates receipt={r} isOwner={true} />
          </div>
        ))}

        {toastMessage && (
          <Toast
            message={toastMessage}
            onClose={() => setToastMessage(null)}
          />
        )}
      </div>
    </>
  );
}
