import { useMemo } from "react";
import { TrendingUp, Briefcase } from "lucide-react";

export function WorkTimeline({ receipts, onSelectReceipt }: { receipts: any[], onSelectReceipt: (r: any) => void }) {
    const sortedReceipts = useMemo(() => {
        if (!receipts || receipts.length === 0) return [];
        // Sort chronologically ascending for a left-to-right timeline
        return receipts.filter(r => r.startDate).map(r => {
            const date = new Date(r.endDate || r.startDate);
            return {
                ...r,
                sortDate: date.getTime(),
                year: date.getFullYear()
            };
        }).sort((a, b) => a.sortDate - b.sortDate);
    }, [receipts]);

    if (!sortedReceipts || sortedReceipts.length === 0) return null;

    return (
        <div className="w-full mb-12 border-t border-slate-800/50 pt-8 mt-8">
            <h2 className="text-xl font-bold mb-16 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" /> Career Timeline
            </h2>

            <div className="relative w-full px-1 py-12 cursor-pointer mt-4">
                <div className="flex items-center w-full">
                    {sortedReceipts.map((r, i) => {
                        const isTop = i % 2 !== 0;
                        const isFirst = i === 0;

                        const chevronClip = isFirst
                            ? 'polygon(0% 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 0% 100%)'
                            : 'polygon(0% 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 0% 100%, 8px 50%)';

                        return (
                            <div
                                key={r.id || i}
                                className={`relative flex flex-col items-center justify-center flex-1 min-w-0 group cursor-pointer ${!isFirst ? '-ml-[8px]' : ''}`}
                                onClick={() => onSelectReceipt(r)}
                            >

                                {/* TOP ITEM */}
                                {isTop && (
                                    <div className="absolute bottom-[calc(100%+2px)] w-full flex flex-col items-center">
                                        <div className="flex flex-col items-center text-center px-1 mb-1">
                                            <h4 className="text-[9px] md:text-[10px] font-bold text-emerald-400 line-clamp-1 leading-tight">{r.org}</h4>
                                            <p className="text-[6px] md:text-[7px] text-slate-500 group-hover:text-emerald-400/70 line-clamp-1 leading-tight">{r.role}</p>
                                        </div>

                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 z-10 shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:scale-125 transition-transform duration-300" />

                                        {/* Connector line */}
                                        <div className="w-px h-8 bg-slate-800 group-hover:bg-emerald-500/50 transition-colors" />
                                    </div>
                                )}

                                {/* THE CHEVRON */}
                                <div
                                    className="w-full h-6 bg-slate-800 group-hover:bg-emerald-500 flex items-center justify-center transition-all shadow-lg z-10 duration-300"
                                    style={{ clipPath: chevronClip }}
                                >
                                    <span className="text-[7px] md:text-[8px] font-medium text-slate-400 group-hover:text-black transition-colors pl-2">
                                        {r.year}
                                    </span>
                                </div>

                                {/* BOTTOM ITEM */}
                                {!isTop && (
                                    <div className="absolute top-[calc(100%+2px)] w-full flex flex-col items-center">
                                        {/* Connector line */}
                                        <div className="w-px h-8 bg-slate-800 group-hover:bg-emerald-500/50 transition-colors" />

                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 z-10 shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:scale-125 transition-transform duration-300" />

                                        <div className="flex flex-col items-center text-center px-1 mt-1">
                                            <h4 className="text-[7px] md:text-[8px] font-bold text-emerald-400 line-clamp-1 leading-tight">{r.org}</h4>
                                            <p className="text-[6px] md:text-[7px] text-slate-500 group-hover:text-emerald-400/70 line-clamp-1 leading-tight">{r.role}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
