import { useState, useRef, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { LogOut, Wallet, ChevronDown, Copy, Check, RefreshCw } from "lucide-react";
import { CustomWalletModal } from "./CustomWalletModal";

export function WalletMultiButton() {
  const { publicKey, wallet, disconnect, connected } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const currentWalletIcon = wallet?.adapter.name === 'Phantom' ? '/logos/phantom.svg' : 
                           wallet?.adapter.name === 'Solflare' ? '/logos/solflare.svg' : null;

  if (!connected) {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
        >
          <Wallet className="w-3.5 h-3.5" />
          Connect Wallet
        </button>
        <CustomWalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  return (
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
      <CustomWalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
