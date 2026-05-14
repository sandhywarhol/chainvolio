"use client";

import { useEffect, useState } from "react";
import { Clipboard, Lock, Send, ExternalLink, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Toast } from "@/components/ui/Toast";
import { ExpandableText } from "@/components/ui/ExpandableText";
import { ReceiptUpdates } from "@/components/receipt/ReceiptUpdates";
import { WorkTimeline } from "@/components/profile/WorkTimeline";
import { getBadgeStyles } from "@/lib/paymentConfig";
import { RoleBadge } from "@/components/profile/RoleBadge";
import { RequestVerificationModal } from "@/components/receipt/RequestVerificationModal";

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
  attestationId?: string;
  txSignature?: string;
  attesterAt?: string;
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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Request Verification modal state
  const [verifyModal, setVerifyModal] = useState<{
    open: boolean;
    receiptId: string;
    role: string;
    org: string;
  }>({ open: false, receiptId: "", role: "", org: "" });

  useEffect(() => {
    fetch(`/api/receipts?wallet=${walletAddress}`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.receipts || []);
        setReceipts(list);
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

  const handleCopyVerificationLink = async (receiptId: string) => {
    const url = `${window.location.origin}/attest/${receiptId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(receiptId);
      setToastMessage("Verification link copied!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setToastMessage("Failed to copy link. Please copy manually.");
    }
  };

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
            className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06] scroll-mt-24 transition-all duration-500"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{r.role}</h3>
                </div>

                <p className="text-white/80 text-base font-bold">{r.org}</p>

                {r.status === "Attested" && r.attesterWallet && (() => {
                  const badge = getBadgeStyles(r.attesterVerificationType);
                  return (
                    <div className="mt-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
                      {r.attesterAvatar ? (
                        <img src={r.attesterAvatar} className="w-8 h-8 rounded-full border border-emerald-500/20 object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[10px]">👤</div>
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
                      {/* On-chain proof links */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {r.txSignature && (
                          <a
                            href={`https://solscan.io/tx/${r.txSignature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View transaction on Solscan"
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-[9px] font-bold text-emerald-400 transition-colors"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            Solscan
                          </a>
                        )}
                        {r.attestationId && (
                          <a
                            href={`/memo/${r.attestationId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View verification memo"
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] text-[9px] font-bold text-slate-400 hover:text-white transition-colors"
                          >
                            <FileText className="w-2.5 h-2.5" />
                            Memo
                          </a>
                        )}
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
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.08] text-xs text-white/60 hover:text-white transition-colors border border-white/[0.08]"
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
                  : "border-white/[0.06] text-white/30 bg-white/[0.02]"
                  }`}
                title={r.status === "Attested" ? `Verified by ${r.attesterWallet}` : "Self-reported by candidate"}
              >
                {r.status === "Attested" ? "✓ Attested" : "Self-Declared"}
              </span>
            </div>

            {/* ── Action Row ────────────────────────────────────────── */}
            <div className="mt-4 pt-4 border-t border-white/[0.05] flex justify-between items-center">
              <div className="flex items-center gap-3">
                {/* Copy Verification Link */}
                <button
                  onClick={() => handleCopyVerificationLink(r.id)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  {copiedId === r.id ? (
                    <svg className="w-3.5 h-3.5 text-[#14F195]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <Clipboard className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span className={copiedId === r.id ? "text-[#14F195]" : ""}>
                    {copiedId === r.id ? "Copied!" : "Copy Verification Link"}
                  </span>
                </button>

                {/* Divider */}
                <div className="w-px h-3.5 bg-white/[0.08]" />

                {/* Request Verification — new premium button */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    setVerifyModal({ open: true, receiptId: r.id, role: r.role, org: r.org })
                  }
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3 h-3" />
                  Request Verification
                </motion.button>
              </div>

              <div className="flex items-center gap-3">
                {r.status === "Attested" || r.status === "Locked" || r.status === "Submitted" ? (
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 italic">
                    <Lock className="w-3 h-3 text-white/30 flex-shrink-0" aria-hidden="true" /> This record is locked for editing after submission/attestation
                  </span>
                ) : (
                  <button
                    onClick={() => onEdit?.(r)}
                    className="text-xs text-white/60 hover:text-white font-medium px-2 py-1 rounded hover:bg-white/5 transition-colors"
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

      {/* Request Verification Modal */}
      <RequestVerificationModal
        isOpen={verifyModal.open}
        onClose={() => setVerifyModal((v) => ({ ...v, open: false }))}
        receiptId={verifyModal.receiptId}
        role={verifyModal.role}
        org={verifyModal.org}
      />
    </>
  );
}
