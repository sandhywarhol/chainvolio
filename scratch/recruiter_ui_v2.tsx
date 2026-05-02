function RecruiterDashboardPreviewUI_V2() {
    return (
        <div className="w-full h-full bg-[#0a0b0f] p-6 flex flex-col gap-6 relative overflow-hidden group">
            {/* Ambient Background Aura (Matching OrgDashboard) */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, #10b98110 0%, transparent 60%)` }} />
            
            {/* Header Section */}
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white tracking-tight">Recruiter Dashboard</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Operations</p>
                    </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Verified Org</span>
                </div>
            </div>

            {/* Impact Pods (3-column mini version) */}
            <div className="grid grid-cols-3 gap-3 relative z-10">
                {[
                    { icon: LayoutDashboard, label: "Hiring", val: "12", col: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { icon: ShieldCheck, label: "Signals", val: "142", col: "text-blue-400", bg: "bg-blue-500/10" },
                    { icon: FolderOpen, label: "Active", val: "4", col: "text-purple-400", bg: "bg-purple-500/10" },
                ].map((pod, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                        <div className={`w-6 h-6 flex items-center justify-center rounded-lg ${pod.bg}`}>
                            <pod.icon className={`w-3 h-3 ${pod.col}`} />
                        </div>
                        <div>
                            <p className="text-lg font-black text-white leading-none">{pod.val}</p>
                            <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500">{pod.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Candidate List Preview */}
            <div className="flex-1 space-y-3 relative z-10">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Top Candidates with Proven Signals</p>
                <div className="space-y-2">
                    {[
                        { name: "Alex Rivera", role: "Infra @ Solana", signals: 8 },
                        { name: "Sarah Chen", role: "Smart Contract Dev", signals: 5 },
                    ].map((c, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white/[0.01] border border-white/5 flex items-center justify-between group/row hover:bg-white/[0.03] transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-white/40">
                                    {c.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h5 className="text-[11px] font-bold text-white/80">{c.name}</h5>
                                    <p className="text-[9px] text-slate-500">{c.role}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-violet-500/5 border border-violet-500/10">
                                <ShieldCheck className="w-2.5 h-2.5 text-violet-400" />
                                <span className="text-[9px] font-bold text-violet-400">{c.signals}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Glow */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#0a0b0f] to-transparent pointer-events-none"></div>
        </div>
    );
}
