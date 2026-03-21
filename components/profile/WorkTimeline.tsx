import { useMemo, useState } from "react";
import { TrendingUp, Briefcase, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";

export function WorkTimeline({ receipts, onSelectReceipt }: { receipts: any[], onSelectReceipt: (r: any) => void }) {
    const sortedReceipts = useMemo(() => {
        if (!receipts || receipts.length === 0) return [];
        // Sort chronologically ascending for a left-to-right timeline (oldest to newest based on start date)
        return receipts.filter(r => r.startDate).map(r => {
            const date = new Date(r.startDate);
            return {
                ...r,
                sortDate: date.getTime(),
                year: date.getFullYear()
            };
        }).sort((a, b) => a.sortDate - b.sortDate);
    }, [receipts]);

    const [isExpanded, setIsExpanded] = useState(false);

    if (!sortedReceipts || sortedReceipts.length === 0) return null;

    const earliestStartDate = Math.min(...sortedReceipts.map(r => new Date(r.startDate).getTime()));
    const latestEndDate = Math.max(...sortedReceipts.map(r => r.endDate ? new Date(r.endDate).getTime() : new Date().getTime()));

    return (
        <div className="w-full mb-6 border-t border-slate-800/50 pt-6 mt-6">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-left py-2 hover:opacity-80 transition-opacity group flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 flex-shrink-0 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded-lg">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors mb-0.5">Career Timeline</h2>
                        <p className="text-xs text-slate-400 font-medium tracking-wide">Verified professional history.</p>
                    </div>
                </div>
                <div className="p-2 flex items-center justify-center text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </button>

            {isExpanded && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-8" onClick={() => setIsExpanded(false)}>
                    <div className="relative border border-white/20 rounded-sm max-w-5xl w-full max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-70">
                            <source src="/box%20navigation.mp4" type="video/mp4" />
                        </video>
                        <div className="relative z-10 p-8 md:p-12 bg-black/40 backdrop-blur-sm max-h-[85vh] overflow-y-auto custom-scrollbar">
                            <button onClick={() => setIsExpanded(false)} className="absolute top-4 right-4 text-white/40 hover:text-white/90 transition-colors text-2xl z-20">×</button>
                            
                            <div className="space-y-16 py-4">
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-bold tracking-tight text-white uppercase flex items-center gap-3">
                                        <div className="p-2 flex-shrink-0 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded-lg">
                                            <TrendingUp className="w-6 h-6" />
                                        </div>
                                        Career Timeline
                                    </h2>
                                    <p className="text-white/40 text-sm max-w-xl leading-relaxed">
                                        Verified professional history.
                                    </p>
                                </div>
                                <div className="hidden md:block relative w-full px-4 md:px-12 py-12 cursor-pointer pt-20 pb-40">
                                    <div className="flex items-center w-full h-8">
                                        {sortedReceipts.map((r, i) => {
                                            const isFirst = i === 0;
                                            const isLast = i === sortedReceipts.length - 1;
                                            const isTop = i % 2 === 0;
                                            const isCurrent = i === sortedReceipts.length - 1;
                                            const year = new Date(r.startDate).getFullYear();

                                            const chevronClip = isFirst
                                                ? 'polygon(0% 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 0% 100%)'
                                                : isLast 
                                                ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 8px 50%)'
                                                : 'polygon(0% 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 0% 100%, 8px 50%)';

                                            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                            const getShortDate = (d: string) => {
                                                if (!d) return "Present";
                                                const date = new Date(d);
                                                return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
                                            };
                                            const startStr = getShortDate(r.startDate);
                                            const endStr = r.endDate ? getShortDate(r.endDate) : "Present";
                                            
                                            const start = new Date(r.startDate);
                                            const end = r.endDate ? new Date(r.endDate) : new Date();
                                            const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
                                            let durationStr = "";
                                            if (totalMonths >= 12) {
                                                const years = Math.floor(totalMonths / 12);
                                                const remainingMonths = totalMonths % 12;
                                                durationStr = `${years} yr${years !== 1 ? 's' : ''}`;
                                                if (remainingMonths > 0) durationStr += ` ${remainingMonths} mo${remainingMonths !== 1 ? 's' : ''}`;
                                            } else {
                                                durationStr = `${totalMonths} mo${totalMonths !== 1 ? 's' : ''}`;
                                            }

                                            return (
                                                <div key={r.id || i} className={`flex-1 h-full relative z-0 group cursor-pointer ${!isFirst ? '-ml-[8px]' : ''}`} onClick={() => onSelectReceipt(r)}>
                                                    <div className="absolute inset-0 bg-slate-800 transition-colors duration-300 group-hover:bg-emerald-500 flex items-center justify-center shadow-lg" style={{ clipPath: chevronClip }}>
                                                        <span className="text-[10px] md:text-[11px] font-bold text-slate-500 group-hover:text-black pl-2 tracking-wider">{year}</span>
                                                    </div>
                                                    <div className="absolute top-0 h-full flex flex-col items-center justify-center pointer-events-none" style={{ left: '50%', transform: 'translateX(-50%)', zIndex: isCurrent ? 50 : 10 }}>
                                                        {isTop && (
                                                            <div className="absolute bottom-[calc(100%+2px)] w-48 flex flex-col items-center pointer-events-auto">
                                                                <div className="flex flex-col items-center text-center px-1 mb-2">
                                                                    <h4 className="text-xs md:text-sm font-bold text-emerald-400 line-clamp-2 leading-tight flex items-center justify-center gap-1 w-full text-center">
                                                                        {r.org} {r.status === "Attested" && <span title="Attested"><ShieldCheck className="w-3 h-3 text-emerald-500" /></span>}
                                                                    </h4>
                                                                    <p className="text-[10px] md:text-xs text-white group-hover:text-emerald-400/90 line-clamp-2 leading-tight mb-1 text-center w-full">{r.role}</p>
                                                                    <p className="text-[8px] md:text-[9px] text-white/70 group-hover:text-emerald-400/80 font-mono tracking-tight leading-none flex flex-col items-center gap-0.5 whitespace-nowrap">
                                                                        <span>{startStr} - {endStr} {r.workType ? `· ${r.workType}` : ''}</span>
                                                                        <span className="text-[7px] md:text-[8px] text-white/40">({durationStr})</span>
                                                                    </p>
                                                                </div>
                                                                <div className={`rounded-full z-10 transition-transform duration-300 ${isCurrent ? "w-2 h-2 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] group-hover:scale-110" : "w-1.5 h-1.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:scale-125"}`} />
                                                                <div className={`w-px h-8 transition-colors ${isCurrent ? "bg-emerald-500/50" : "bg-slate-800 group-hover:bg-emerald-500/50"}`} />
                                                            </div>
                                                        )}
                                                        {!isTop && (
                                                            <div className="absolute top-[calc(100%+2px)] w-48 flex flex-col items-center pointer-events-auto">
                                                                <div className={`w-px h-8 transition-colors ${isCurrent ? "bg-emerald-500/50" : "bg-slate-800 group-hover:bg-emerald-500/50"}`} />
                                                                <div className={`rounded-full z-10 transition-transform duration-300 ${isCurrent ? "w-2 h-2 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] group-hover:scale-110" : "w-1.5 h-1.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:scale-125"}`} />
                                                                <div className="flex flex-col items-center text-center px-1 mt-2">
                                                                    <h4 className="text-xs md:text-sm font-bold text-emerald-400 line-clamp-2 leading-tight flex items-center justify-center gap-1 w-full text-center">
                                                                        {r.org} {r.status === "Attested" && <span title="Attested"><ShieldCheck className="w-3 h-3 text-emerald-500" /></span>}
                                                                    </h4>
                                                                    <p className="text-[10px] md:text-xs text-white group-hover:text-emerald-400/90 line-clamp-2 leading-tight mb-1 w-full text-center">{r.role}</p>
                                                                    <p className="text-[8px] md:text-[9px] text-white/70 group-hover:text-emerald-400/80 font-mono tracking-tight leading-none flex flex-col items-center gap-0.5 whitespace-nowrap">
                                                                        <span>{startStr} - {endStr} {r.workType ? `· ${r.workType}` : ''}</span>
                                                                        <span className="text-[7px] md:text-[8px] text-white/40">({durationStr})</span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                
                                {/* MOBILE VERTICAL LAYOUT */}
                                <div className="block md:hidden pb-20">
                                    <div className="space-y-8 relative">
                                        <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-800/50" />
                                        {sortedReceipts.slice().reverse().map((r, i) => {
                                            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                            const getShortDate = (d: string) => {
                                                if (!d) return "Present";
                                                const date = new Date(d);
                                                return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
                                            };
                                            return (
                                                <div key={r.id || i} className="relative pl-12" onClick={() => onSelectReceipt(r)}>
                                                    <div className="absolute left-[11px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{getShortDate(r.startDate)}</span>
                                                        <h4 className="text-base font-bold text-emerald-400 leading-tight flex items-center gap-2">
                                                            {r.org} {r.status === "Attested" && <ShieldCheck className="w-3.5 h-3.5" />}
                                                        </h4>
                                                        <p className="text-sm text-white font-medium">{r.role}</p>
                                                        <p className="text-[10px] text-slate-500 italic">{r.workType || 'Project'}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
               </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
