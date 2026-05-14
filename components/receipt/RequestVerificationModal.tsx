"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Copy, Check, Mail } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RequestVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptId: string;
  role: string;
  org: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildTemplate(verifierName: string, role: string, org: string, link: string) {
  const name = verifierName.trim() || "[Verifier Name]";
  return `Hi ${name},

I'm currently building my verified professional history on ChainVolio.

I'm requesting verification for my contribution as:
${role} at ${org}

Would you mind verifying this contribution through the link below?

${link}

Your verification helps create trusted, proof-based work history instead of self-claimed resumes.

Thank you.`;
}

// ─── Modal ───────────────────────────────────────────────────────────────────

export function RequestVerificationModal({
  isOpen,
  onClose,
  receiptId,
  role,
  org,
}: RequestVerificationModalProps) {
  const attestationUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/attest/${receiptId}`
      : `https://chainvolio.xyz/attest/${receiptId}`;

  const [verifierName, setVerifierName] = useState("");
  const [verifierEmail, setVerifierEmail] = useState("");
  const [body, setBody] = useState(() => buildTemplate("", role, org, attestationUrl));
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  // Re-sync template when name changes, but only if user hasn't manually edited
  const [userEditedBody, setUserEditedBody] = useState(false);

  useEffect(() => {
    if (!userEditedBody) {
      setBody(buildTemplate(verifierName, role, org, attestationUrl));
    }
  }, [verifierName, role, org, attestationUrl, userEditedBody]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setVerifierName("");
      setVerifierEmail("");
      setUserEditedBody(false);
      setBody(buildTemplate("", role, org, attestationUrl));
      setCopied(false);
      setSent(false);
    }
  }, [isOpen]);

  const subject = "Verification Request for Professional Contribution";

  const handleSend = () => {
    const mailto = `mailto:${encodeURIComponent(verifierEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, "_self");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const handleCopy = async () => {
    const full = `Subject: ${subject}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text so user can copy manually
      setCopied(false);
    }
  };

  const canSend = verifierEmail.includes("@");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Panel */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto w-full max-w-lg rounded-2xl border border-white/[0.09] shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col"
              style={{
                background: "rgba(9,9,9,0.97)",
                backdropFilter: "blur(28px)",
                maxHeight: "90vh",
              }}
            >
              {/* ── Header ─────────────────────────────────────────── */}
              <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-white/[0.06] flex-shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#14F195]/10 border border-[#14F195]/20 flex items-center justify-center">
                      <Mail className="w-3 h-3 text-[#14F195]/80" />
                    </div>
                    <h2 className="text-[13px] font-bold text-white tracking-tight">
                      Request Verification
                    </h2>
                  </div>
                  <p className="text-[11px] text-white/35 leading-relaxed pl-8">
                    Send a professional request to someone who can confirm your contribution.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-all ml-4 flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* ── Scrollable body ────────────────────────────────── */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

                {/* Context pill */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#14F195]/50 flex-shrink-0" />
                  <p className="text-[11px] text-white/40 truncate">
                    <span className="text-white/65 font-semibold">{role}</span>
                    <span className="mx-1.5 text-white/20">·</span>
                    <span>{org}</span>
                  </p>
                </div>

                {/* ── Form fields ──────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Verifier Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
                      Verifier Name
                    </label>
                    <input
                      type="text"
                      value={verifierName}
                      onChange={(e) => setVerifierName(e.target.value)}
                      placeholder="e.g. Sarah Kim"
                      className="w-full px-3 py-2.5 rounded-xl text-[12px] text-white/80 placeholder-white/20 border border-white/[0.08] bg-white/[0.03] outline-none transition-all duration-200 focus:border-[#14F195]/30 focus:bg-white/[0.04] focus:shadow-[0_0_0_3px_rgba(20,241,149,0.06)]"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={verifierEmail}
                      onChange={(e) => setVerifierEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full px-3 py-2.5 rounded-xl text-[12px] text-white/80 placeholder-white/20 border border-white/[0.08] bg-white/[0.03] outline-none transition-all duration-200 focus:border-[#14F195]/30 focus:bg-white/[0.04] focus:shadow-[0_0_0_3px_rgba(20,241,149,0.06)]"
                    />
                  </div>
                </div>

                {/* ── Email Template Editor ─────────────────────────── */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
                      Email Template
                    </label>
                    {userEditedBody && (
                      <button
                        onClick={() => {
                          setUserEditedBody(false);
                          setBody(buildTemplate(verifierName, role, org, attestationUrl));
                        }}
                        className="text-[9px] font-bold text-white/25 hover:text-[#14F195]/70 uppercase tracking-widest transition-colors"
                      >
                        Reset to default
                      </button>
                    )}
                  </div>

                  {/* Subject preview */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20 flex-shrink-0">Subject</span>
                    <span className="text-[11px] text-white/45 truncate">{subject}</span>
                  </div>

                  {/* Editable body */}
                  <textarea
                    value={body}
                    onChange={(e) => {
                      setBody(e.target.value);
                      setUserEditedBody(true);
                    }}
                    rows={11}
                    spellCheck={false}
                    className="w-full px-4 py-3.5 rounded-xl text-[11.5px] leading-relaxed text-white/60 placeholder-white/15 border border-white/[0.07] bg-white/[0.025] outline-none resize-none transition-all duration-200 focus:border-[#14F195]/25 focus:bg-white/[0.04] focus:shadow-[0_0_0_3px_rgba(20,241,149,0.05)] focus:text-white/75"
                    style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace" }}
                  />
                  <p className="text-[9px] text-white/20 leading-relaxed">
                    You can freely edit this message before sending. The attestation link is automatically included.
                  </p>
                </div>
              </div>

              {/* ── Footer actions ─────────────────────────────────── */}
              <div className="flex items-center gap-3 px-6 py-4 border-t border-white/[0.06] flex-shrink-0">
                {/* Copy Template */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12] text-[11px] font-semibold text-white/50 hover:text-white/80 transition-all duration-200"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#14F195]" />
                      <span className="text-[#14F195]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Template
                    </>
                  )}
                </motion.button>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Send Request */}
                <motion.button
                  whileHover={canSend ? { scale: 1.02 } : {}}
                  whileTap={canSend ? { scale: 0.97 } : {}}
                  onClick={canSend ? handleSend : undefined}
                  disabled={!canSend}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 ${
                    canSend
                      ? "bg-[#14F195]/10 border border-[#14F195]/30 text-[#14F195] hover:bg-[#14F195]/15 hover:border-[#14F195]/50 shadow-[0_0_0_0_rgba(20,241,149,0)] hover:shadow-[0_0_16px_rgba(20,241,149,0.15)] cursor-pointer"
                      : "bg-white/[0.02] border border-white/[0.05] text-white/20 cursor-not-allowed"
                  }`}
                >
                  {sent ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Sent!
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send Request
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
