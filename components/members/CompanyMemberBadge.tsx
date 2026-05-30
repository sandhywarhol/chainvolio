"use client";

import { Building2 } from "lucide-react";

type Membership = {
    id: string;
    company_name: string;
    role: "member" | "admin";
    recruiter_avatar_url?: string | null;
};

interface CompanyMemberBadgeProps {
    membership: Membership;
    className?: string;
}

export function CompanyMemberBadge({ membership, className = "" }: CompanyMemberBadgeProps) {
    const isAdmin = membership.role === "admin";

    return (
        <div className={`relative group/badge inline-flex ${className}`}>
            <div className="inline-flex items-center justify-center gap-1.5 px-2.5 h-6 rounded border text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 border-indigo-500/20 text-indigo-400 transition-all duration-300 hover:scale-105 cursor-default shadow-sm">
                {membership.recruiter_avatar_url ? (
                    <img
                        src={membership.recruiter_avatar_url}
                        alt=""
                        className="w-3 h-3 rounded-full object-cover"
                    />
                ) : (
                    <Building2 className="w-3 h-3" strokeWidth={3} />
                )}
                <span>Member {membership.company_name}</span>
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 opacity-0 group-hover/badge:opacity-100 transition-all duration-300 delay-150 pointer-events-none z-[100] translate-y-1 group-hover/badge:translate-y-0">
                <div className="bg-slate-900 border border-white/10 p-2.5 rounded-xl shadow-2xl backdrop-blur-xl">
                    <p className="text-[10px] font-black text-indigo-400 mb-1 uppercase tracking-widest leading-none">
                        {isAdmin ? "Admin Member" : "Team Member"}
                    </p>
                    <p className="text-[9px] text-slate-400 leading-relaxed font-medium">
                        {isAdmin
                            ? `Admin of ${membership.company_name}. Can manage hiring and add applicant notes.`
                            : `Verified member of ${membership.company_name}.`
                        }
                    </p>
                </div>
                <div className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 border-x-[6px] border-x-transparent border-t-[6px] border-t-slate-900" />
            </div>
        </div>
    );
}
