"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
    Copy,
    Code2,
    ShieldCheck,
    Zap,
    Layers,
    Terminal,
    Briefcase,
    Users,
    Landmark,
    Search,
    Cpu,
    Workflow,
    ArrowUpRight,
    Activity,
    Lock,
    Key,
    MousePointer2,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Wallet,
} from "lucide-react";
import Link from "next/link";

export default function ApiDocsPage() {
  const { publicKey, signMessage, connected } = useWallet();

  const [copied, setCopied] = useState<string | null>(null);
  const [testAddress, setTestAddress] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [keyIsExisting, setKeyIsExisting] = useState(false);
  const [keyUsage, setKeyUsage] = useState<{ count: number; limit: number } | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const testApi = async () => {
    if (!testAddress) return;
    setTesting(true);
    setTestError(null);
    setTestResult(null);
    setResponseTime(null);
    
    const start = performance.now();
    try {
      const res = await fetch(`/api/v1/wallet/${testAddress}/score`);
      const end = performance.now();
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch");
      setResponseTime(Math.round(end - start));
      setTestResult(data);
    } catch (err: any) {
      setTestError(err.message);
    } finally {
      setTesting(false);
    }
  };

  const generateApiKey = async () => {
    if (!publicKey || !signMessage) return;
    setGeneratingKey(true);
    setKeyError(null);
    try {
      const { signChainVolioAction } = await import("@/lib/wallet-utils");
      const signedAction = await signChainVolioAction(
        { publicKey, signMessage } as any,
        "generate_api_key"
      );
      if (!signedAction) {
        setKeyError("Signing was cancelled.");
        return;
      }

      const res = await fetch("/api/v1/keys/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
          signature: signedAction.signature,
          nonce: signedAction.nonce,
          timestamp: signedAction.timestamp,
          name: "Developer Key",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setKeyError(data.error || "Failed to generate key.");
        return;
      }
      setGeneratedKey(data.key);
      setKeyIsExisting(data.existing ?? false);
      setKeyUsage({ count: data.usage_count ?? 0, limit: data.usage_limit ?? 1000 });
    } catch (err: any) {
      setKeyError(err.message || "Unexpected error.");
    } finally {
      setGeneratingKey(false);
    }
  };

  const getExample = `fetch("https://chainvolio.com/api/v1/wallet/9Xfs...tjn8/score", {
  headers: {
    "x-api-key": "YOUR_API_KEY"
  }
})
.then(res => res.json())
.then(data => console.log(data));`;

  const curlExample = `curl -X GET https://chainvolio.com/api/v1/wallet/{address}/score \\
  -H "x-api-key: YOUR_API_KEY"`;

  const jsonExample = `{
  "wallet": "9XfsmXfYvB7JxNqTcfdp2xMNhY1J1sDbSEX7Macdtjn8",
  "score": 85,
  "level": "Elite",
  "confidence": 0.92,
  "confidence_label": "High",
  "trust_score": 78.2,
  "reason": "Based on high verified contributions...",
  "last_updated": "2026-04-08T12:00:00Z",
  "breakdown": {
    "experience": 85,
    "verification": 95,
    "consistency": 70,
    "skill": 80,
    "activity": 60
  }
}`;

  const batchExample = `fetch("https://chainvolio.com/api/v1/scores/batch", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY"
  },
  body: JSON.stringify({
    wallets: ["9Xfs...tjn8", "0x..."]
  })
})`;

  const batchCurlExample = `curl -X POST https://chainvolio.com/api/v1/scores/batch \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{"wallets": ["9Xfs...tjn8", "0x..."]}'`;

  const usageExample = `const data = await fetchScore(wallet)

if (data.score > 75 && data.confidence > 0.8) {
  console.log("High quality candidate")
}`;

  return (
    <main className="h-screen flex flex-col relative selection:bg-indigo-500/30 selection:text-white overflow-x-hidden bg-transparent">

      <Navbar />

      {/* Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[10%] -left-[10%] w-[50%] h-[50%] bg-purple-500/5 blur-[160px] rounded-full" />
          <div className="absolute top-[30%] -right-[10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[160px] rounded-full" />
          <div className="absolute bottom-[5%] left-[20%] w-[40%] h-[40%] bg-blue-500/5 blur-[160px] rounded-full" />
      </div>
      
      <div className="flex-1 flex overflow-hidden relative z-10 pt-20">
        <div className="max-w-6xl mx-auto w-full flex overflow-hidden px-6">
          {/* Navigation Sidebar */}
          <aside className="hidden lg:block w-1/4 space-y-8 overflow-y-auto h-full py-12 pr-8 scrollbar-hide">
            <nav className="space-y-2">
              <p className="text-caption text-white/20 mb-6 flex items-center gap-2">
                  <Search className="w-3 h-3" /> Introduction
              </p>
              {[
                  { label: "Overview", href: "#introduction" },
                  { label: "Use Cases", href: "#use-cases" },
                  { label: "Example Usage", href: "#example-usage" },
                  { label: "Authentication", href: "#authentication" }
              ].map((item, i) => (
                  <a key={i} href={item.href} className="block text-body text-sm opacity-40 hover:opacity-100 transition-all py-2.5 border-l border-white/5 pl-6 hover:border-purple-500 font-medium tracking-tight">
                      {item.label}
                  </a>
              ))}
            </nav>

            <nav className="space-y-2">
              <p className="text-caption text-white/20 mb-6 flex items-center gap-2">
                  <Terminal className="w-3 h-3" /> Endpoints
              </p>
              {[
                  { label: "GET /v1/wallet/...", href: "#get-score", mono: true },
                  { label: "POST /v1/scores/batch", href: "#batch-score", mono: true },
                  { label: "Get API Key", href: "#get-key" },
                  { label: "Try the API", href: "#try-api" }
              ].map((item, i) => (
                  <a key={i} href={item.href} className={`block text-body text-sm opacity-40 hover:opacity-100 transition-all py-2.5 border-l border-white/5 pl-6 hover:border-blue-500 font-medium tracking-tight ${item.mono ? 'font-mono !text-xs' : ''}`}>
                      {item.label}
                  </a>
              ))}
            </nav>
          </aside>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto h-full px-8 lg:px-12 py-12 space-y-32 scrollbar-hide scroll-smooth">
          {/* Header */}
          <header id="introduction" className="space-y-8 scroll-mt-[120px]">
            <div className="flex items-center gap-3 px-4 py-1.5 bg-purple-500/[0.03] border border-purple-500/10 rounded-full w-fit">
              <Code2 className="w-4 h-4 text-purple-400" />
              <span className="text-caption text-purple-400/80">Documentation V1</span>
            </div>
            <h1 className="text-3xl md:text-h1 break-words overflow-hidden max-w-full">
                Reputation <span className="text-white/20">API.</span>
            </h1>
            <p className="text-body text-lg md:text-xl italic border-l-2 border-purple-500/20 pl-6 md:pl-8 bg-purple-500/[0.01] py-6 rounded-r-3xl break-words">
              "Integrate the ChainVolio reputation layer into your application. Authenticate professional identities and filter users by verified skill signals."
            </p>
          </header>

          <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />

          {/* USE CASES */}
          <section id="use-cases" className="space-y-12 scroll-mt-[120px]">
            <div className="flex items-center gap-4">
              <Layers className="w-5 h-5 text-blue-400" />
              <h2 className="text-2xl md:text-h2 break-words">Use Cases</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                  { icon: <Briefcase className="w-5 h-5" />, title: "Hiring Platform", desc: "Filter candidates by reputation score and verification confidence instantly.", color: "purple" },
                  { icon: <Users className="w-5 h-5" />, title: "DAO Gov", desc: "Assign voting power or council seats based on verified reputation.", color: "blue" },
                  { icon: <Landmark className="w-5 h-5" />, title: "DeFi Lending", desc: "Adjust collateral requirements based on a borrower's verified trust score.", color: "emerald" }
              ].map((item, i) => (
                  <div key={i} className="p-6 md:p-8 bg-white/[0.01] border border-white/[0.03] rounded-[32px] space-y-6 hover:border-white/10 transition-all group w-full max-w-full break-words overflow-hidden">
                    <div className={`p-4 rounded-xl bg-${item.color}-500/5 text-${item.color}-400 group-hover:bg-${item.color}-500/10 transition-colors w-fit`}>
                      {item.icon}
                    </div>
                    <h3 className="text-caption text-white font-bold">{item.title}</h3>
                    <p className="text-body group-hover:text-white/50">{item.desc}</p>
                  </div>
              ))}
            </div>
          </section>

          {/* EXAMPLE USAGE */}
          <section id="example-usage" className="space-y-12 scroll-mt-[120px]">
            <div className="flex items-center gap-4">
              <Cpu className="w-5 h-5 text-teal-400" />
              <h2 className="text-2xl md:text-h2 break-words">Example Usage</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-10">
                <p className="text-body text-lg italic opacity-60 break-words">
                  "Use ChainVolio as a decision-making signal. Gate access, prioritize talent, or automate workflows with high confidence."
                </p>
                <div className="space-y-4">
                    {[
                      "Gate high-value project features",
                      "Automate screening for hiring pools",
                      "Dynamically adjust platform permissions"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className="w-2 h-2 rounded-full bg-teal-500/20 group-hover:bg-teal-500 transition-all" />
                        <span className="text-body text-inherit font-medium break-words overflow-hidden max-w-full">{item}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-[#050505] rounded-[40px] overflow-hidden border border-white/[0.05] shadow-2xl relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="px-8 py-6 bg-white/[0.02] border-b border-white/[0.05] flex justify-between items-center">
                  <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-500/40" />
                      <span className="text-caption opacity-20">Application Logic</span>
                  </div>
                  <button onClick={() => copyToClipboard(usageExample, 'usage')} className="text-white/20 hover:text-white transition-colors">
                    {copied === 'usage' ? 'Copied' : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="p-6 md:p-10 font-mono text-sm md:text-base leading-relaxed text-teal-400/80 overflow-x-auto whitespace-pre italic break-all">
                  {usageExample}
                </div>
              </div>
            </div>
          </section>

          {/* GET API KEY */}
          <section id="get-key" className="space-y-10 scroll-mt-[120px]">
            <div className="flex items-center gap-4">
              <Zap className="w-5 h-5 text-purple-400" />
              <h2 className="text-2xl md:text-h2 break-words">Identity Auth</h2>
            </div>

            {/* How key generation works */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { step: "01", title: "Connect Wallet", desc: "Connect your Solana wallet — your key is tied to your wallet address for identity." },
                { step: "02", title: "Sign Once", desc: "Sign a one-time message to prove ownership. No funds are moved, no transaction is sent." },
                { step: "03", title: "Get Your Key", desc: "Your key is generated instantly. Use it in the x-api-key header on every request." },
              ].map((item) => (
                <div key={item.step} className="p-6 bg-white/[0.01] border border-white/[0.03] rounded-2xl space-y-3 hover:border-purple-500/20 transition-all">
                  <span className="text-[10px] font-black text-purple-400/40 uppercase tracking-[0.25em]">Step {item.step}</span>
                  <p className="text-caption text-white font-bold">{item.title}</p>
                  <p className="text-body text-xs">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-12 bg-white/[0.01] border border-white/[0.03] rounded-[48px] relative overflow-hidden group shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative z-10 flex flex-col md:flex-row gap-16 items-center">
                    <div className="md:w-1/2 space-y-6">
                        <h3 className="text-2xl md:text-h2 md:!text-3xl break-words">Get Your API Key</h3>
                        <p className="text-body text-lg opacity-40 break-words">
                          Connect your Solana wallet to generate a key tied to your identity. One key per wallet — free up to 1,000 requests.
                        </p>

                        {!connected ? (
                            <div className="space-y-4">
                                <p className="text-caption text-white/30 text-sm">Connect your wallet first to generate a key.</p>
                                <WalletMultiButton />
                            </div>
                        ) : !generatedKey ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[11px] text-emerald-400/70 font-mono">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    {publicKey?.toBase58().slice(0, 8)}…{publicKey?.toBase58().slice(-8)} connected
                                </div>
                                <button
                                    onClick={generateApiKey}
                                    disabled={generatingKey}
                                    className="px-10 py-5 bg-white text-slate-950 font-bold rounded-[20px] hover:bg-purple-50 transition-all shadow-2xl shadow-white/5 text-caption !text-slate-950 disabled:opacity-50"
                                >
                                    {generatingKey ? "Signing…" : "Generate API Key"}
                                </button>
                                {keyError && (
                                    <p className="text-xs text-red-400 font-medium">{keyError}</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                    <div>
                                        <span className="text-caption text-emerald-400 font-bold block">
                                            {keyIsExisting ? "Existing Key Retrieved" : "Key Provisioned"}
                                        </span>
                                        {keyUsage && (
                                            <span className="text-[10px] text-emerald-400/50">
                                                {keyUsage.count} / {keyUsage.limit} requests used
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setGeneratedKey(null); setKeyError(null); }}
                                    className="flex items-center gap-2 text-xs text-white/20 hover:text-white/50 transition-colors"
                                >
                                    <RefreshCw className="w-3 h-3" /> Regenerate key
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="md:w-1/2 w-full">
                        {generatedKey ? (
                           <div className="space-y-6">
                              <div className="p-8 bg-black border border-white/[0.05] rounded-3xl relative group/key">
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                                <div className="flex items-center justify-between gap-4">
                                    <code className="text-emerald-400 font-mono text-sm break-all">{generatedKey}</code>
                                    <button
                                      onClick={() => copyToClipboard(generatedKey, "gen-key")}
                                      className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/10 text-white/20 hover:text-white transition-all flex-shrink-0"
                                    >
                                      <Copy className={`w-4 h-4 ${copied === 'gen-key' ? 'text-emerald-400' : ''}`} />
                                    </button>
                                </div>
                              </div>
                              <div className="p-4 bg-amber-500/[0.03] border border-amber-500/10 rounded-xl flex items-center gap-3">
                                <ShieldCheck className="w-4 h-4 text-amber-500/40 flex-shrink-0" />
                                <p className="text-caption !text-[10px] text-amber-400/40">Store this key securely. Do not expose it in client-side code.</p>
                              </div>
                           </div>
                        ) : (
                            <div className="aspect-square rounded-[40px] border border-white/[0.03] bg-white/[0.01] flex items-center justify-center relative overflow-hidden">
                                <Wallet className="w-16 h-16 text-white/[0.03]" />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
          </section>

          {/* Authentication Header Section */}
          <section id="authentication" className="space-y-10 scroll-mt-[120px]">
             <div className="flex items-center gap-4">
              <Lock className="w-5 h-5 text-indigo-400" />
              <h2 className="text-2xl md:text-h2 break-words">Request Auth</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-start">
                <div className="space-y-6">
                    <p className="text-body text-lg italic opacity-40">
                        "Pass your API key via the <code className="not-italic text-indigo-400 text-sm">x-api-key</code> header to authenticate requests and track usage."
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-4 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-xl">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-caption text-emerald-400 font-bold text-xs mb-1">GET /v1/wallet/:address/score</p>
                                <p className="text-body text-xs opacity-40">Publicly accessible. API key optional — include it to track your usage quota.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-xl">
                            <Key className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-caption text-indigo-400 font-bold text-xs mb-1">POST /v1/scores/batch</p>
                                <p className="text-body text-xs opacity-40">Requires API key. Use for high-volume integrations.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-8 bg-white/[0.01] border border-white/[0.03] rounded-3xl group">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-caption opacity-20">Header (optional for GET, required for POST batch)</span>
                    </div>
                    <div className="p-5 md:p-6 bg-black border border-white/[0.05] rounded-2xl flex flex-col md:flex-row items-center justify-between group-hover:border-indigo-500/20 transition-all shadow-2xl gap-4">
                        <code className="text-indigo-400 text-xs md:text-sm font-mono break-all italic">x-api-key: YOUR_API_KEY</code>
                        <button
                          onClick={() => copyToClipboard("x-api-key: YOUR_API_KEY", "auth")}
                          className="p-2 text-white/20 hover:text-white transition-colors"
                        >
                          <Copy className={`w-4 h-4 ${copied === 'auth' ? 'text-indigo-400' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>
          </section>

          <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />

          {/* GET SCORE */}
          <section id="get-score" className="space-y-12 scroll-mt-[120px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full max-w-full">
              <div className="flex items-center gap-4">
                <Terminal className="w-5 h-5 text-purple-400" />
                <h2 className="text-2xl md:text-h2 break-words">Get Wallet Score</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                  <div className="px-3 py-1 bg-white/[0.03] border border-white/[0.05] rounded-full max-w-full overflow-hidden">
                    <span className="text-body text-[9px] md:text-[10px] font-mono opacity-40 break-all">GET /v1/wallet/:address/score</span>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <span className="text-caption text-emerald-400 font-bold text-[9px] md:text-xs">Cached (24h)</span>
                  </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Code Snippet */}
              <div className="bg-[#050505] rounded-[32px] overflow-hidden border border-white/[0.03] shadow-2xl flex flex-col h-full">
                <div className="px-8 py-5 bg-white/[0.02] border-b border-white/[0.05] flex justify-between items-center">
                  <span className="text-caption opacity-20">Fetch Signature</span>
                  <div className="flex items-center gap-6">
                    <button onClick={() => copyToClipboard(curlExample, 'curl-get')} className="text-white/20 hover:text-white flex items-center gap-2 transition-all group">
                        <Terminal className="w-3 h-3 group-hover:text-purple-400 transition-colors" />
                        <span className="text-caption font-bold">cURL</span>
                    </button>
                    <button onClick={() => copyToClipboard(getExample, 'js-get')} className="text-white/20 hover:text-white flex items-center gap-2 transition-all group">
                        <Copy className="w-3 h-3 group-hover:text-purple-400 transition-colors" />
                        <span className="text-caption font-bold">Fetch</span>
                    </button>
                  </div>
                </div>
                <div className="p-6 md:p-10 font-mono text-xs md:text-sm leading-relaxed text-white/40 overflow-x-auto whitespace-pre flex-1 italic break-all">
                  {getExample}
                </div>
              </div>

              {/* JSON Response */}
              <div className="bg-[#050505] rounded-[32px] overflow-hidden border border-white/[0.03] shadow-2xl flex flex-col h-full">
                <div className="px-8 py-5 bg-white/[0.02] border-b border-white/[0.05] flex justify-between items-center text-caption opacity-20">
                  <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
                      <span className="!tracking-[0.1em]">Expected Response</span>
                  </div>
                </div>
                <div className="p-6 md:p-10 font-mono text-[10px] md:text-xs leading-relaxed text-emerald-400/80 overflow-x-auto whitespace-pre flex-1 break-all">
                  {jsonExample}
                </div>
              </div>
            </div>
          </section>

          {/* BATCH SCORE */}
          <section id="batch-score" className="space-y-12 scroll-mt-[120px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full max-w-full">
              <div className="flex items-center gap-4">
                <Workflow className="w-5 h-5 text-blue-400" />
                <h2 className="text-2xl md:text-h2 break-words">Batch Score Fetch</h2>
              </div>
               <div className="flex flex-wrap items-center gap-3">
                  <div className="px-3 py-1 bg-white/[0.03] border border-white/[0.05] rounded-full max-w-full overflow-hidden">
                    <span className="text-body text-[9px] md:text-[10px] font-mono opacity-40 break-all">POST /v1/scores/batch</span>
                  </div>
                  <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                    <span className="text-caption text-blue-400 font-bold text-[9px] md:text-xs">Optimized</span>
                  </div>
              </div>
            </div>

            <div className="bg-[#050505] rounded-[40px] overflow-hidden border border-white/[0.03] shadow-2xl group">
              <div className="px-8 py-6 bg-white/[0.02] border-b border-white/[0.05] flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-blue-400/60" />
                    <span className="text-caption opacity-20">Batch Request Object</span>
                </div>
                <div className="flex items-center gap-6">
                  <button onClick={() => copyToClipboard(batchCurlExample, 'curl-batch')} className="text-white/20 hover:text-white flex items-center gap-2 transition-all">
                    <Terminal className="w-3 h-3 group-hover:text-blue-400" />
                    <span className="text-caption font-bold">cURL</span>
                  </button>
                  <button onClick={() => copyToClipboard(batchExample, 'js-batch')} className="text-white/20 hover:text-white flex items-center gap-2 transition-all">
                    <Copy className="w-3 h-3 group-hover:text-blue-400" />
                    <span className="text-caption font-bold">Fetch</span>
                  </button>
                </div>
              </div>
              <div className="p-6 md:p-12 font-mono text-xs md:text-base leading-relaxed text-white/30 overflow-x-auto whitespace-pre italic break-all">
                {batchExample}
              </div>
            </div>
          </section>

          {/* TRY THE API */}
          <section id="try-api" className="space-y-12 scroll-mt-[120px]">
            <div className="flex items-center gap-4">
              <Zap className="w-5 h-5 text-amber-500" />
              <h2 className="text-2xl md:text-h2 md:!text-3xl break-words">Live Sandbox</h2>
            </div>
            
            <div className="p-6 md:p-12 bg-white/[0.01] border border-white/[0.03] rounded-[48px] shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                <div className="relative z-10 space-y-12">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 relative group/input">
                             <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                <MousePointer2 className="w-4 h-4 text-white/20 group-focus-within/input:text-amber-500 transition-colors" />
                             </div>
                            <input 
                              type="text"
                              placeholder="Solana Wallet Address..."
                              value={testAddress}
                              onChange={(e) => setTestAddress(e.target.value)}
                              className="w-full bg-black border border-white/[0.05] rounded-2xl pl-14 pr-6 py-5 text-base md:text-lg text-white placeholder:text-white/10 focus:outline-none focus:border-amber-500/30 transition-all font-mono italic"
                            />
                        </div>
                        <button 
                          onClick={testApi}
                          disabled={testing}
                          className="px-6 md:px-10 py-4 md:py-5 bg-white text-slate-950 font-bold rounded-2xl hover:bg-amber-50 disabled:opacity-50 transition-all shadow-2xl shadow-white/5 text-caption !text-slate-950"
                        >
                          {testing ? "Executing..." : "Execute Query"}
                        </button>
                    </div>

                    {testError && (
                        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <span className="text-caption text-red-400 font-bold">Error: {testError}</span>
                        </div>
                    )}

                    {testResult && (
                        <div className="space-y-6 scale-in duration-500">
                             <div className="flex justify-between items-center border-b border-white/[0.05] pb-4">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-caption opacity-20">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
                                        Response Body
                                    </div>
                                    {responseTime !== null && (
                                        <div className="flex items-center gap-2 text-caption text-emerald-500/60 font-bold">
                                            <Zap className="w-3 h-3" />
                                            {responseTime}ms Latency
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => copyToClipboard(JSON.stringify(testResult, null, 2), 'test-res')} className="text-caption opacity-20 hover:opacity-100 transition-all font-bold">
                                    {copied === 'test-res' ? 'Copied' : 'Copy JSON'}
                                </button>
                             </div>
                             <div className="p-6 md:p-10 bg-black border border-white/[0.05] rounded-[32px] font-mono text-[10px] md:text-sm leading-relaxed text-emerald-400/80 overflow-x-auto whitespace-pre shadow-2xl max-h-[500px] break-all">
                                {JSON.stringify(testResult, null, 2)}
                             </div>
                        </div>
                    )}
                </div>
            </div>
          </section>

          {/* Final Call to Action */}
          <section className="relative z-40 md:py-24 md:px-8 pt-16 pb-28 px-4 border-t border-white/[0.03] h-auto overflow-hidden max-w-full">
              <div className="p-8 md:p-16 bg-white/[0.01] border border-white/[0.03] rounded-[48px] text-center space-y-10 relative group flex flex-col items-center justify-start h-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative z-10 flex flex-col items-center w-full space-y-8 md:space-y-10">
                      <div className="p-5 rounded-2xl bg-white/[0.03] w-fit mx-auto">
                        <Users className="w-10 h-10 text-white/40" />
                      </div>
                      <div className="space-y-4 w-full">
                          <h3 className="text-2xl md:text-h2 md:!text-4xl break-words font-bold">Scale Your Integration.</h3>
                          <p className="text-body text-lg italic opacity-40 w-full max-w-sm mx-auto break-words text-center">
                            "Custom partner tiers are available for high-volume technical integrators and institutional screening pools."
                          </p>
                      </div>
                      <button className="mt-8 px-8 md:px-12 py-5 bg-white text-slate-950 font-bold rounded-2xl hover:bg-slate-100 transition-all shadow-white/5 text-caption !text-slate-950 flex items-center justify-center gap-3 mx-auto w-full md:w-fit">
                        Contact Partnerships <ArrowUpRight className="w-4 h-4" />
                      </button>
                  </div>
              </div>
          </section>
          <Footer />
        </div>
      </div>
    </div>
  </main>
);
}
