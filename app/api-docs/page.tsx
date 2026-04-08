"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

console.log("Navbar:", Navbar);
console.log("Footer:", Footer);
import { Copy, Code2, ShieldCheck, Zap, Layers, Terminal, Briefcase, Users, Landmark } from "lucide-react";

export default function ApiDocsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [testAddress, setTestAddress] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [generatingKey, setGeneratingKey] = useState(false);
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
    setGeneratingKey(true);
    try {
      const res = await fetch("/api/v1/keys/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Docs Key" })
      });
      const data = await res.json();
      if (data.key) setGeneratedKey(data.key);
    } catch (err) {
      console.error(err);
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
  "reason": "Based on high verified contributions and consistent activity",
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
    <main className="min-h-screen flex flex-col relative selection:bg-teal-500/30 selection:text-white overflow-visible">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-24 grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Navigation Sidebar */}
        <aside className="hidden lg:block space-y-8 sticky top-[100px] self-start h-fit">
          <nav className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Introduction</p>
            <a href="#introduction" className="block text-sm text-slate-400 hover:text-white transition-colors py-1.5 border-l border-white/5 pl-4 hover:border-purple-500/50">Overview</a>
            <a href="#use-cases" className="block text-sm text-slate-400 hover:text-white transition-colors py-1.5 border-l border-white/5 pl-4 hover:border-purple-500/50">Use Cases</a>
            <a href="#example-usage" className="block text-sm text-white/50 hover:text-white transition-colors py-1.5 border-l border-white/5 pl-4 hover:border-purple-500/50">Example Usage</a>
            <a href="#suggested-ui" className="block text-sm text-white/50 hover:text-white transition-colors py-1.5 border-l border-white/5 pl-4 hover:border-purple-500/50">Suggested UI</a>
            <a href="#authentication" className="block text-sm text-slate-400 hover:text-white transition-colors py-1.5 border-l border-white/5 pl-4 hover:border-purple-500/50">Authentication</a>
          </nav>

          <nav className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Endpoints</p>
            <a href="#get-score" className="block text-sm text-slate-400 hover:text-white transition-colors py-1.5 font-mono border-l border-white/5 pl-4 hover:border-purple-500/50">GET /v1/wallet/...</a>
            <a href="#batch-score" className="block text-sm text-slate-400 hover:text-white transition-colors py-1.5 font-mono border-l border-white/5 pl-4 hover:border-purple-500/50">POST /v1/scores/batch</a>
            <a href="#get-key" className="block text-sm text-slate-400 hover:text-white transition-colors py-1.5 border-l border-white/5 pl-4 hover:border-purple-500/50">Get API Key</a>
            <a href="#try-api" className="block text-sm text-slate-400 hover:text-white transition-colors py-1.5 border-l border-white/5 pl-4 hover:border-purple-500/50">Try the API</a>
          </nav>
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-20">
          {/* Header */}
          <header id="introduction" className="space-y-4 border-b border-white/5 pb-12 scroll-mt-[120px]">
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full w-fit">
              <Code2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300">Developer Portal</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display text-white tracking-tighter">Reputation API</h1>
            <p className="text-lg font-light tracking-tight text-white/50 max-w-2xl leading-relaxed">
              Integrate the ChainVolio reputation layer into your application. Authenticate professional identities and filter users by verified skill signals.
            </p>
          </header>

          {/* USE CASES */}
          <section id="use-cases" className="space-y-8 scroll-mt-[120px]">
            <div className="flex items-center gap-3">
              <Layers className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold font-display text-white tracking-tight">Use Cases</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Hiring */}
              <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl space-y-4 hover:border-purple-500/20 transition-colors group">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="font-bold font-display text-white uppercase text-[11px] tracking-widest">Hiring Platform</h3>
                <p className="text-sm font-light tracking-tight text-white/40 leading-relaxed">Filter candidates by reputation score and verification confidence to surface elite talent instantly.</p>
              </div>

              {/* DAO */}
              <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl space-y-4 hover:border-blue-500/20 transition-colors group">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold font-display text-white uppercase text-[11px] tracking-widest">DAO Governance</h3>
                <p className="text-sm font-light tracking-tight text-white/40 leading-relaxed">Assign project voting power or council seats based on a member's domain-specific reputation score.</p>
              </div>

              {/* DeFi */}
              <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl space-y-4 hover:border-emerald-500/20 transition-colors group">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Landmark className="w-5 h-5" />
                </div>
                <h3 className="font-bold font-display text-white uppercase text-[11px] tracking-widest">Lending Protocols</h3>
                <p className="text-sm font-light tracking-tight text-white/40 leading-relaxed">Adjust collateral requirements or interest rates based on a borrower's verified trust score.</p>
              </div>
            </div>
          </section>

          {/* EXAMPLE USAGE */}
          <section id="example-usage" className="space-y-8 scroll-mt-[120px]">
            <div className="flex items-center gap-3">
              <Code2 className="w-6 h-6 text-emerald-500" />
              <h2 className="text-2xl font-bold font-display text-white tracking-tight">Example Usage</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <p className="text-white/50 font-light tracking-tight leading-relaxed">
                  Use ChainVolio score as a decision-making signal. Implement simple logic to gate access, prioritize talent, or automate workflows with high confidence.
                </p>
                <ul className="space-y-3">
                  {[
                    "Gate high-value project features",
                    "Automate screening for hiring pools",
                    "Dynamically adjust platform permissions"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#0f172a] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="px-4 py-3 bg-slate-800/50 border-b border-white/5 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  <span>Usage Preview</span>
                  <button onClick={() => copyToClipboard(usageExample, 'usage')} className="hover:text-white transition-colors">
                    {copied === 'usage' ? 'Copied' : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div className="p-8 font-mono text-base leading-relaxed text-emerald-400/90 overflow-x-auto whitespace-pre">
                  {usageExample}
                </div>
              </div>
            </div>
          </section>



          {/* SUGGESTED UI */}
          <section id="suggested-ui" className="space-y-8 scroll-mt-[120px]">
            <div className="flex items-center gap-3">
              <Code2 className="w-6 h-6 text-purple-500" />
              <h2 className="text-2xl font-bold font-display text-white tracking-tight">Suggested UI</h2>
            </div>
            
            <p className="text-white/50 font-light tracking-tight leading-relaxed max-w-2xl">
              Developers can fully customize how reputation is displayed in their application. Here are common patterns used by ChainVolio partners for clear talent signaling.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Pattern 1 */}
              <div className="p-8 bg-slate-900/40 border border-white/5 rounded-3xl space-y-6">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Minimalist Record</span>
                <div className="space-y-2">
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                    <span className="text-sm font-light text-white/40">Score</span>
                    <span className="text-xl font-bold font-display text-white">81</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                    <span className="text-sm font-light text-white/40">Confidence</span>
                    <span className="text-sm font-medium text-emerald-400">High</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                    <span className="text-sm font-light text-white/40">Level</span>
                    <span className="text-sm font-bold font-display text-purple-400 uppercase tracking-widest">Elite</span>
                  </div>
                </div>
              </div>

              {/* Pattern 2 */}
              <div className="p-8 bg-slate-900/40 border border-white/5 rounded-3xl flex flex-col items-center justify-center space-y-4 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Badge Signature</span>
                <div className="px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full">
                  <span className="text-xs font-black font-display text-purple-400 uppercase tracking-[0.3em]">Elite</span>
                </div>
                <div className="text-5xl font-bold font-display text-white tracking-tighter">
                  81
                </div>
                <p className="text-[11px] font-medium text-emerald-400/80 uppercase tracking-widest">High Confidence</p>
              </div>
            </div>
          </section>

          {/* GET API KEY */}
          <section id="get-key" className="space-y-6 scroll-mt-[120px]">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-purple-500" />
              <h2 className="text-2xl font-bold font-display text-white tracking-tight">Get Your API Key</h2>
            </div>
            <p className="text-white/50 font-light tracking-tight leading-relaxed max-w-2xl">
              Start building immediately. Generate a secure API key to authenticate your requests. No credit card or registration required for the trial tier.
            </p>

            <div className="bg-gradient-to-br from-purple-600/10 to-transparent border border-purple-500/20 rounded-2xl p-6 md:p-8 space-y-6">
              {!generatedKey ? (
                <button 
                  onClick={generateApiKey}
                  disabled={generatingKey}
                  className="px-8 py-3 bg-white text-slate-950 font-black rounded-xl hover:bg-slate-200 transition-all shadow-xl shadow-white/5"
                >
                  {generatingKey ? "Generating..." : "Generate API Key"}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/10 group">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your Private API Key</p>
                      <code className="text-emerald-400 font-mono text-sm">{generatedKey}</code>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(generatedKey, "gen-key")} 
                      className="p-2 hover:bg-white/5 rounded-lg text-slate-500 transition-colors"
                    >
                      <Copy className={`w-4 h-4 ${copied === 'gen-key' ? 'text-emerald-500' : ''}`} />
                    </button>
                  </div>
                  <div className="flex items-start gap-2 text-amber-500/80">
                    <ShieldCheck className="w-4 h-4 mt-0.5" />
                    <p className="text-[11px] font-bold uppercase tracking-wide">Warning: Keep this key secure. It will not be shown again.</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Authentication */}
          <section id="authentication" className="space-y-6 scroll-mt-[120px]">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
              <h2 className="text-2xl font-bold font-display text-white tracking-tight">Authentication</h2>
            </div>
            <p className="text-white/50 font-light tracking-tight leading-relaxed max-w-2xl">
              All API requests must be authenticated using an API Key. This key allows ChainVolio to associate requests with your platform and track usage limits.
            </p>
            <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4 md:p-6 space-y-4">
              <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Required Header</p>
              <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-white/5">
                <code className="text-purple-400 text-sm font-mono tracking-tight">x-api-key: YOUR_API_KEY</code>
                <button 
                  onClick={() => copyToClipboard("x-api-key: YOUR_API_KEY", "auth")} 
                  className="p-1.5 hover:bg-white/5 rounded text-slate-500 transition-colors"
                >
                  <Copy className={`w-4 h-4 ${copied === 'auth' ? 'text-emerald-500' : ''}`} />
                </button>
              </div>
            </div>
          </section>

          {/* GET SCORE */}
          <section id="get-score" className="space-y-6 scroll-mt-[120px]">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Terminal className="w-6 h-6 text-purple-500" />
                  <h2 className="text-2xl font-bold font-display text-white tracking-tight">Get Wallet Score</h2>
                </div>
                <p className="text-sm text-slate-400 font-mono">GET /api/v1/wallet/:address/score</p>
              </div>
              <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Cached (24h)</span>
            </div>

            <p className="text-white/50 font-light tracking-tight leading-relaxed max-w-2xl">
              Retrieve the complete reputation profile for a specific wallet address. Returns the latest computed score, verification confidence, and ranking metrics.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Code Snippet */}
              <div className="bg-[#0f172a] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="px-4 py-2 bg-slate-800/50 border-b border-white/5 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  <span>JavaScript / Fetch</span>
                  <div className="flex items-center gap-4">
                    <button onClick={() => copyToClipboard(curlExample, 'curl-get')} className="hover:text-white flex items-center gap-1.5 transition-colors">
                      {copied === 'curl-get' ? 'Copied!' : <><Terminal className="w-3 h-3" /> Copy cURL</>}
                    </button>
                    <button onClick={() => copyToClipboard(getExample, 'js-get')} className="hover:text-white flex items-center gap-1.5 transition-colors">
                      {copied === 'js-get' ? 'Copied!' : <><Copy className="w-3 h-3" /> Copy Fetch</>}
                    </button>
                  </div>
                </div>
                <div className="p-4 font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto whitespace-pre">
                  {getExample}
                </div>
              </div>

              {/* JSON Response */}
              <div className="bg-[#0f172a] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="px-4 py-2 bg-slate-800/50 border-b border-white/5 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  <span>Example Response</span>
                </div>
                <div className="p-4 font-mono text-[11px] leading-relaxed text-emerald-400/90 overflow-x-auto whitespace-pre">
                  {jsonExample}
                </div>
              </div>
            </div>
          </section>

          {/* BATCH SCORE */}
          <section id="batch-score" className="space-y-6 scroll-mt-[120px]">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Layers className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold font-display text-white tracking-tight">Batch Score Fetch</h2>
                </div>
                <p className="text-sm text-slate-400 font-mono">POST /api/v1/scores/batch</p>
              </div>
              <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] font-bold text-blue-400 uppercase tracking-widest">Optimized</span>
            </div>

            <p className="text-white/50 font-light tracking-tight leading-relaxed max-w-2xl">
              Fetch reputation data for multiple wallets in a single request. Perfect for leaderboard generation or screening candidate pools.
            </p>

            <div className="bg-[#0f172a] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
              <div className="px-4 py-2 bg-slate-800/50 border-b border-white/5 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-slate-500">
                <span>Batch Fetch Request</span>
                <div className="flex items-center gap-4">
                  <button onClick={() => copyToClipboard(batchCurlExample, 'curl-batch')} className="hover:text-white flex items-center gap-1.5 transition-colors">
                    {copied === 'curl-batch' ? 'Copied!' : <><Terminal className="w-3 h-3" /> Copy cURL</>}
                  </button>
                  <button onClick={() => copyToClipboard(batchExample, 'js-batch')} className="hover:text-white flex items-center gap-1.5 transition-colors">
                    {copied === 'js-batch' ? 'Copied!' : <><Copy className="w-3 h-3" /> Copy Fetch</>}
                  </button>
                </div>
              </div>
              <div className="p-4 font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto whitespace-pre">
                {batchExample}
              </div>
            </div>
          </section>

          {/* TRY THE API */}
          <section id="try-api" className="space-y-6 scroll-mt-[120px]">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-bold font-display text-white tracking-tight">Try the API</h2>
            </div>
            <p className="text-white/50 font-light tracking-tight leading-relaxed max-w-2xl">
              Test the reputation engine in real-time. Enter a Solana wallet address below to fetch its live reputation data directly from our production API.
            </p>

            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <input 
                  type="text"
                  placeholder="Enter wallet address..."
                  value={testAddress}
                  onChange={(e) => setTestAddress(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
                <button 
                  onClick={testApi}
                  disabled={testing}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20"
                >
                  {testing ? "Fetching..." : "Fetch Score"}
                </button>
              </div>

              {testError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-bold uppercase tracking-widest">
                  Error: {testError}
                </div>
              )}

              {testResult && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-slate-500 px-1">
                    <div className="flex items-center gap-3">
                      <span>API Response</span>
                      {responseTime !== null && (
                        <span className="text-emerald-500/80 flex items-center gap-1 group">
                          <Zap className="w-2.5 h-2.5" />
                          <span className="lowercase font-medium tracking-normal">Response time: {responseTime}ms</span>
                        </span>
                      )}
                    </div>
                    <button onClick={() => copyToClipboard(JSON.stringify(testResult, null, 2), 'test-res')} className="hover:text-white transition-colors">
                      {copied === 'test-res' ? 'Copied' : 'Copy JSON'}
                    </button>
                  </div>
                  <div className="bg-[#0f172a] rounded-xl border border-white/5 p-4 font-mono text-[11px] leading-relaxed text-emerald-400/90 overflow-x-auto whitespace-pre max-h-[400px]">
                    {JSON.stringify(testResult, null, 2)}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Final Call to Action */}
          <div className="p-10 bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-white/5 rounded-3xl space-y-6 text-center">
            <Zap className="w-10 h-10 text-purple-400 mx-auto" />
            <h3 className="text-2xl font-bold text-white">Need higher usage limits?</h3>
            <p className="text-slate-400 max-w-sm mx-auto">
              Custom partner tiers are available for high-volume integrators and enterprise screening pools.
            </p>
            <button className="px-8 py-3 bg-white text-slate-950 font-bold rounded-full hover:bg-slate-200 transition-all">
              Contact Partnerships
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
