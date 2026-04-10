"use client";

import { useState } from "react";
import { Award, ChevronDown, ChevronUp, ExternalLink, FileText, Image as ImageIcon, Trash2, Loader2, Plus, Lock } from "lucide-react";
import { formatLongDate } from "@/shared/utils/date";

export interface Certificate {
  id: string;
  wallet_address: string;
  title: string;
  issuer_name: string | null;
  date_issued: string | null;
  file_url: string;
  file_type: "pdf" | "image";
  created_at: string;
}

interface CertificateCardProps {
  cert: Certificate;
  isOwner?: boolean;
  onDelete?: (id: string) => void;
  onPreview?: (cert: Certificate) => void;
}

export function CertificateCard({ cert, isOwner, onDelete, onPreview }: CertificateCardProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete || !confirm("Delete this certificate?")) return;
    setDeleting(true);
    onDelete(cert.id);
  };

  const formattedDate = formatLongDate(cert.date_issued);

  return (
    <div 
        onClick={() => onPreview?.(cert)}
        className="group relative flex items-start gap-4 p-4 rounded-xl border border-slate-800/60 bg-slate-900/40 hover:bg-slate-800/60 hover:border-violet-500/30 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-transparent to-transparent opacity-0 group-hover:opacity-10 transition-opacity" />

      {/* Preview/Icon */}
      <div className="flex-shrink-0 w-11 h-11 rounded-lg border border-white/5 bg-slate-800/50 group-hover:border-violet-500/20 group-hover:bg-violet-500/10 flex items-center justify-center transition-all overflow-hidden relative shadow-inner">
        {cert.file_type === "image" ? (
          <img 
            src={cert.file_url} 
            alt={cert.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center relative bg-slate-900 group-hover:bg-slate-800 transition-colors">
            {/* Mini Doc Style */}
            <div className="absolute inset-0 flex flex-col">
              <div className="h-[25%] bg-red-500/20 border-b border-red-500/10 w-full" />
              <div className="flex-1 w-full bg-slate-900/40" />
            </div>
            <FileText className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform relative z-10" />
            <span className="text-[7px] font-bold text-red-500/60 uppercase mt-0.5 tracking-tighter relative z-10">PDF Doc</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors truncate">{cert.title}</h4>
        {cert.issuer_name && (
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{cert.issuer_name}</p>
        )}
        <div className="flex items-center gap-3 mt-2">
            {formattedDate && (
              <span className="text-[10px] text-slate-500 font-mono">{formattedDate}</span>
            )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0 self-center">
        {isOwner && onDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
          >
            {deleting
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Trash2 className="w-3.5 h-3.5" />
            }
          </button>
        )}
      </div>
    </div>
  );
}

interface CertificateSectionProps {
  certs: Certificate[];
  isOwner?: boolean;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
  onPreview?: (cert: Certificate) => void;
  onExpand?: () => void;
  isLoading?: boolean;
}

export function CertificateSection({ 
    certs, 
    isOwner, 
    onDelete, 
    onAdd, 
    onPreview, 
    onExpand,
    isLoading 
}: CertificateSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    if (next && onExpand) {
        onExpand();
    }
  };

  // If not owner and no certs, hide section entirely (though in CV we might show empty state if user wants)
  if (!isOwner && certs.length === 0 && !isExpanded) {
      // We still want to show the header so they can click "View Credentials" to see the "Empty" state
  }

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
            <Award className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              Verified Credentials
              {certs.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.1)] transition-all">
                  {certs.length}
                </span>
              )}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
            {isOwner && onAdd && (
                <button
                    onClick={onAdd}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 text-[11px] font-bold transition-all border border-violet-500/20"
                >
                    <Plus className="w-3 h-3" />
                    Add New
                </button>
            )}

            <button
                onClick={toggleExpand}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest ${
                    isExpanded 
                    ? "bg-slate-800 text-white border border-slate-700" 
                    : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5"
                }`}
            >
                {isExpanded ? "Hide Credentials" : "View Credentials"}
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
        </div>
      </div>

      {/* Expandable Content with smooth transition */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-[2000px] opacity-100 mt-4" : "max-h-0 opacity-0"
      }`}>
        {isLoading ? (
            <div className="flex items-center justify-center py-12 gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
                <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Securing data...</p>
            </div>
        ) : certs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {certs.map(cert => (
                <CertificateCard
                    key={cert.id}
                    cert={cert}
                    isOwner={isOwner}
                    onDelete={onDelete}
                    onPreview={onPreview}
                />
            ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-slate-800 rounded-2xl bg-white/[0.01]">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                    <Lock className="w-5 h-5 text-slate-700" />
                </div>
                <p className="text-sm text-slate-500 font-medium">No credentials added yet</p>
                <p className="text-[10px] text-slate-600 mt-1 text-center max-w-[200px]">Candidate has not uploaded any official certificates to this profile.</p>
                
                {isOwner && onAdd && (
                    <button
                        onClick={onAdd}
                        className="mt-6 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors shadow-lg shadow-violet-900/20"
                    >
                        Upload First Certificate
                    </button>
                )}
            </div>
        )}
      </div>
    </div>
  );
}
