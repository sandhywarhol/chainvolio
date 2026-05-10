"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, ExternalLink } from "lucide-react";

// ─── Inline SVG Icons ────────────────────────────────────────────────────────

function XTwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface ShareProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileUrl: string;
  displayName?: string;
  role?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  verificationTier?: string;
}

// ─── Platform card data ───────────────────────────────────────────────────────

interface Platform {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  iconColor: string;
  hoverBg: string;
  hoverBorder: string;
}

const PLATFORMS: Platform[] = [
  {
    id: "twitter",
    label: "X / Twitter",
    icon: XTwitterIcon,
    iconColor: "#ffffff",
    hoverBg: "rgba(255,255,255,0.06)",
    hoverBorder: "rgba(255,255,255,0.15)",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: LinkedInIcon,
    iconColor: "#0A66C2",
    hoverBg: "rgba(10,102,194,0.10)",
    hoverBorder: "rgba(10,102,194,0.30)",
  },
  {
    id: "telegram",
    label: "Telegram",
    icon: TelegramIcon,
    iconColor: "#26A5E4",
    hoverBg: "rgba(38,165,228,0.10)",
    hoverBorder: "rgba(38,165,228,0.30)",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: WhatsAppIcon,
    iconColor: "#25D366",
    hoverBg: "rgba(37,211,102,0.10)",
    hoverBorder: "rgba(37,211,102,0.30)",
  },
];

// ─── Modal ───────────────────────────────────────────────────────────────────

export function ShareProfileModal({
  isOpen,
  onClose,
  profileUrl,
  displayName,
  role,
  avatarUrl,
  isVerified,
  verificationTier,
}: ShareProfileModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const twitterText = encodeURIComponent(
    `Building my verifiable professional history on ChainVolio.\n\nA proof-based profile for Web3 work, contributions, and attestations.\n\n${profileUrl}`
  );

  // Plain string for clipboard — LinkedIn ignores injected text in share URLs
  const linkedInCaption =
    `I've started building my verifiable professional profile on ChainVolio — combining work history, attestations, and proof-based reputation into one portable identity.\n\n${profileUrl}`;

  const telegramText = encodeURIComponent(
    `Check out my ChainVolio profile:\n${profileUrl}`
  );

  const whatsappText = encodeURIComponent(
    `Here's my ChainVolio profile:\n${profileUrl}`
  );

  const handlePlatformClick = (id: string) => {
    switch (id) {
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${twitterText}`, "_blank");
        break;
      case "linkedin":
        // Copy caption to clipboard first, then open the share composer
        navigator.clipboard.writeText(linkedInCaption).finally(() => {
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`,
            "_blank"
          );
          showToast("LinkedIn caption copied. Paste it into your post.");
        });
        break;
      case "telegram":
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(profileUrl)}&text=${telegramText}`,
          "_blank"
        );
        break;
      case "whatsapp":
        window.open(`https://wa.me/?text=${whatsappText}`, "_blank");
        break;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="share-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
          />

          {/* Panel */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="share-panel"
              initial={{ opacity: 0, scale: 0.96, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 14 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto w-full max-w-sm rounded-2xl border border-white/[0.09] shadow-[0_32px_80px_rgba(0,0,0,0.8)] overflow-hidden"
              style={{ background: "rgba(9,9,9,0.97)", backdropFilter: "blur(28px)" }}
            >
              {/* ── Header ─────────────────────────────────────── */}
              <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/[0.06]">
                <div className="space-y-0.5">
                  <h2 className="text-[13px] font-bold text-white tracking-tight">
                    Share Your Profile
                  </h2>
                  <p className="text-[11px] text-white/35 leading-relaxed">
                    Share your public ChainVolio profile across platforms.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-all ml-3 flex-shrink-0 mt-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* ── Profile Preview Card ─────────────────────── */}
              {displayName && (
                <div className="mx-5 mt-4 flex items-center gap-3 px-3.5 py-3 rounded-xl border border-white/[0.07] bg-white/[0.025]">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-9 h-9 rounded-full object-cover border border-white/[0.08] flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-sm font-bold text-white/40 flex-shrink-0">
                      {displayName[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12px] font-bold text-white/85 truncate">{displayName}</p>
                      {isVerified && (
                        <div className="w-3.5 h-3.5 rounded-full bg-[#14F195]/15 border border-[#14F195]/30 flex items-center justify-center flex-shrink-0">
                          <svg className="w-2 h-2 text-[#14F195]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {role && (
                      <p className="text-[10px] text-white/35 truncate mt-0.5">{role}</p>
                    )}
                  </div>
                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/20 hover:text-white/60 transition-colors flex-shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* ── Platform grid ──────────────────────────────── */}
              <div className="px-5 pt-4 pb-1">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-3">
                  Share on
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {PLATFORMS.map((p) => {
                    const Icon = p.icon;
                    const isHovered = hoveredPlatform === p.id;
                    return (
                      <motion.button
                        key={p.id}
                        whileHover={{ y: -2, scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ duration: 0.13 }}
                        onHoverStart={() => setHoveredPlatform(p.id)}
                        onHoverEnd={() => setHoveredPlatform(null)}
                        onClick={() => handlePlatformClick(p.id)}
                        className="flex flex-col items-center gap-2.5 py-3 px-2 rounded-xl border border-white/[0.07] transition-all duration-200 cursor-pointer"
                        style={{
                          background: isHovered ? p.hoverBg : "rgba(255,255,255,0.02)",
                          borderColor: isHovered ? p.hoverBorder : "rgba(255,255,255,0.07)",
                        }}
                      >
                        <Icon
                          className="w-4 h-4 transition-all duration-200"
                          style={{ color: isHovered ? p.iconColor : "rgba(255,255,255,0.35)" }}
                        />
                        <span className="text-[9px] font-semibold text-white/35 group-hover:text-white/70 transition-colors leading-none text-center">
                          {p.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* ── Copy Link ──────────────────────────────────── */}
              <div className="px-5 py-4 mt-1">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCopy}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all duration-200 group"
                  style={{
                    background: copiedLink ? "rgba(20,241,149,0.05)" : "rgba(255,255,255,0.02)",
                    borderColor: copiedLink ? "rgba(20,241,149,0.22)" : "rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
                      style={{ background: copiedLink ? "rgba(20,241,149,0.12)" : "rgba(255,255,255,0.04)" }}
                    >
                      {copiedLink
                        ? <Check className="w-3 h-3 text-[#14F195]" />
                        : <Copy className="w-3 h-3 text-white/30 group-hover:text-white/60 transition-colors" />
                      }
                    </div>
                    <span className="text-[11px] font-mono text-white/30 truncate">{profileUrl}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold flex-shrink-0 transition-colors ${
                      copiedLink ? "text-[#14F195]" : "text-white/30 group-hover:text-white/60"
                    }`}
                  >
                    {copiedLink ? "Copied!" : "Copy"}
                  </span>
                </motion.button>
              </div>

              {/* ── In-modal toast ──────────────────────────────── */}
              <AnimatePresence>
                {toast && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18 }}
                    className="mx-5 mb-4 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-[#0A66C2]/25 bg-[#0A66C2]/10"
                  >
                    <LinkedInIcon className="w-3.5 h-3.5 text-[#0A66C2] flex-shrink-0" />
                    <p className="text-[11px] text-white/70 leading-snug">{toast}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
