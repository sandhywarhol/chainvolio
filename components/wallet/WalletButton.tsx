import { useState, useRef, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { LogOut, Wallet, ChevronDown, Copy, Check, RefreshCw, Building2 } from "lucide-react";
import { CustomWalletModal } from "./CustomWalletModal";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

export function WalletMultiButton() {
  const { publicKey, wallet, disconnect, connected } = useWallet();
  const { session: googleSession, orgAccount: googleOrg, signOut: googleSignOut } = useGoogleAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [googleMenuOpen, setGoogleMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const googleMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (googleMenuRef.current && !googleMenuRef.current.contains(e.target as Node)) {
        setGoogleMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const baseAddress = publicKey?.toBase58();
  const truncatedAddress = baseAddress ? `${baseAddress.slice(0, 4)}..${baseAddress.slice(-4)}` : "";

  const handleCopy = async () => {
    if (baseAddress) {
      await navigator.clipboard.writeText(baseAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentWalletIcon =
    wallet?.adapter.name === "Phantom" ? "/logos/phantom.svg" :
    wallet?.adapter.name === "Solflare" ? "/logos/solflare.svg" : null;

  if (!connected) {
    return (
      <>
        <div className="flex items-center gap-2">
          {/* Google session status badge */}
          {googleSession && (
            <div className="relative" ref={googleMenuRef}>
              <button
                onClick={() => setGoogleMenuOpen(!googleMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-2 bg-teal-500/10 hover:bg-teal-500/15 border border-teal-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-teal-400"
              >
                {googleOrg?.avatar_url ? (
                  <img src={googleOrg.avatar_url} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                ) : (
                  <Building2 className="w-3.5 h-3.5" />
                )}
                <span className="max-w-[80px] truncate">
                  {googleOrg?.org_name ?? googleSession.user.email?.split("@")[0] ?? "Org"}
                </span>
              </button>

              {googleMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-[#0d0d0f]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-1.5 z-[1000]">
                  <div className="px-4 py-2 border-b border-white/5 mb-1">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Signed in as</p>
                    <p className="text-[11px] text-white/70 truncate mt-0.5">{googleSession.user.email}</p>
                  </div>
                  <button
                    onClick={() => { googleSignOut(); setGoogleMenuOpen(false); }}
                    className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-black hover:bg-neutral-900 text-white border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm"
          >
            <Wallet className="w-3.5 h-3.5" />
            {googleSession ? "Link Wallet" : "Sign In"}
          </button>
        </div>
        <CustomWalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {googleSession && (
          <div className="relative" ref={googleMenuRef}>
            <button
              onClick={() => setGoogleMenuOpen(!googleMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-2 bg-teal-500/10 hover:bg-teal-500/15 border border-teal-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-teal-400"
            >
              {googleOrg?.avatar_url ? (
                <img src={googleOrg.avatar_url} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
              ) : (
                <Building2 className="w-3.5 h-3.5" />
              )}
              <span className="max-w-[80px] truncate">
                {googleOrg?.org_name ?? googleSession.user.email?.split("@")[0] ?? "Org"}
              </span>
            </button>

            {googleMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-[#0d0d0f]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-1.5 z-[1000]">
                <div className="px-4 py-2 border-b border-white/5 mb-1">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Signed in as</p>
                  <p className="text-[11px] text-white/70 truncate mt-0.5">{googleSession.user.email}</p>
                </div>
                <button
                  onClick={() => { googleSignOut(); setGoogleMenuOpen(false); }}
                  className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2.5"
          >
            {currentWalletIcon ? (
              <img src={currentWalletIcon} alt="Wallet" className="w-3.5 h-3.5 object-contain rounded-md" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
            {truncatedAddress}
            <ChevronDown className={`w-3 h-3 transition-transform ${isMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-[#0d0d0f]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-2 z-[1000] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-white/5 mb-1">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Connected via {wallet?.adapter.name}</p>
              </div>

              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-between px-4 py-2.5 text-slate-300 hover:bg-white/5 text-xs font-bold transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Copy className="w-4 h-4 text-slate-500" />
                  Copy Address
                </div>
                {copied && <Check className="w-3.5 h-3.5 text-emerald-500" />}
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-white/5 text-xs font-bold transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-slate-500" />
                Change Wallet
              </button>

              <div className="h-px bg-white/5 my-1" />

              <button
                onClick={() => {
                  disconnect();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400/80 hover:bg-red-500/5 text-xs font-bold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
      <CustomWalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
