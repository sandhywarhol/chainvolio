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

            <div className="relative w-full px-1 py-8 cursor-pointer mt-4">
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
                                            <h4 className="text-[7px] md:text-[8px] font-medium text-white group-hover:text-emerald-400 line-clamp-2 leading-tight">{r.org}</h4>
                                        </div>

                                        <div className="w-5 h-5 rounded-full border border-slate-700 bg-slate-900 flex shrink-0 items-center justify-center group-hover:border-emerald-500 group-hover:bg-emerald-500/10 transition-colors z-10 shadow-lg">
                                            <Briefcase className="w-2.5 h-2.5 text-emerald-400" />
                                        </div>

                                        {/* Connector line */}
                                        <div className="w-px h-3 bg-slate-700 group-hover:bg-emerald-500 transition-colors -mt-0.5" />
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
                                        <div className="w-px h-3 bg-slate-700 group-hover:bg-emerald-500 transition-colors -mb-0.5" />

                                        <div className="w-5 h-5 rounded-full border border-slate-700 bg-slate-900 flex shrink-0 items-center justify-center group-hover:border-emerald-500 group-hover:bg-emerald-500/10 transition-colors z-10 shadow-lg">
                                            <Briefcase className="w-2.5 h-2.5 text-emerald-400" />
                                        </div>

                                        <div className="flex flex-col items-center text-center px-1 mt-1">
                                            <h4 className="text-[7px] md:text-[8px] font-medium text-white group-hover:text-emerald-400 line-clamp-2 leading-tight">{r.org}</h4>
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
