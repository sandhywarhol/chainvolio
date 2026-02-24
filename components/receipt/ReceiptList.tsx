"use client";

import { useEffect, useState } from "react";
import { Toast } from "@/components/ui/Toast";

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
  createdAt: string;
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
      .then((data) => setReceipts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [walletAddress]);

  if (loading) return <p className="text-slate-400">Loading receipts...</p>;
  if (receipts.length === 0) return <p className="text-slate-500">No receipts yet.</p>;

  return (
    <div className="space-y-4">
      {receipts.map((r, i) => (
        <div
          key={i}
          className="p-4 rounded-lg bg-slate-800/50 border border-slate-700"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{r.role}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded border ${r.status === "Attested"
                    ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                    : "border-slate-600 text-slate-400 bg-slate-800"
                    }`}
                  title={r.status === "Attested" ? `Verified by ${r.attesterWallet}` : "Self-reported by candidate"}
                >
                  {r.status === "Attested" ? "✓ Attested" : "Candidate Claim"}
                </span>
              </div>

              <p className="text-slate-400 text-sm">{r.org}</p>

              {r.status === "Attested" && r.attesterWallet && (
                <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                  <span>🛡 Verified by </span>
                  <span className="font-mono bg-emerald-900/30 px-1 rounded">
                    {r.attesterWallet.slice(0, 6)}...{r.attesterWallet.slice(-4)}
                  </span>
                </p>
              )}

              <p className="text-slate-300 mt-2 text-sm">{r.description}</p>
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
                📋 Copy Verification Link
              </button>
            </div>

            <div className="flex items-center gap-3">
              {r.status === "Attested" || r.status === "Locked" || r.status === "Submitted" ? (
                <span className="text-[10px] text-slate-500 flex items-center gap-1 italic">
                  <span className="text-emerald-500/50">🔒</span> This record is locked for editing after submission/attestation
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
        </div>
      ))}

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
