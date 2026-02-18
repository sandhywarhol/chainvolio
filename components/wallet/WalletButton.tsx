"use client";

import dynamic from "next/dynamic";

const WalletMultiButtonDynamic = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletMultiButton),
  {
    ssr: false,
    loading: () => (
      <button className="px-4 py-2 rounded-2xl bg-[#6d66e5] font-semibold animate-pulse text-xs h-9">
        Loading...
      </button>
    ),
  }
);

export function WalletMultiButton() {
  return (
    <div className="flex items-center">
      <WalletMultiButtonDynamic className="!bg-transparent !p-0 !h-auto !text-white/60 hover:!text-white !font-bold !text-[10px] !uppercase !tracking-widest transition-all !line-height-none" />
    </div>
  );
}
