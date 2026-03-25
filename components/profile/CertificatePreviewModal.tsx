"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink, Download, Loader2 } from "lucide-react";

interface CertificatePreviewModalProps {
  cert: {
    title: string;
    file_url: string;
    file_type: "pdf" | "image";
    issuer_name?: string | null;
  } | null;
  onClose: () => void;
}

export function CertificatePreviewModal({ cert, onClose }: CertificatePreviewModalProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cert) return;

    // Fallback: hide loading after 2 seconds (for PDF viewer loaders)
    const timer = setTimeout(() => {
        setLoading(false);
    }, 2500);

    // Lock body scroll when modal is open
    document.body.style.overflow = "hidden";

    // Close on ESC key
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [cert, onClose]);

  if (!cert) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 md:p-8"
      onClick={onClose}
    >
      <div
        className="relative bg-slate-900 rounded-2xl border border-slate-700/50 max-w-4xl w-full h-[85vh] overflow-hidden shadow-2xl flex flex-col select-none"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm z-10">
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-bold text-white truncate">{cert.title}</h3>
            {cert.issuer_name && (
              <p className="text-xs text-slate-400 mt-0.5">{cert.issuer_name}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all shadow-lg"
              aria-label="Close"
            >
              <X className="w-4 h-4 md:w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className={`flex-1 overflow-hidden bg-slate-950/50 relative ${cert.file_type === "image" ? "flex items-center justify-center p-2" : ""}`}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-0">
              <Loader2 className="w-8 h-8 text-violet-500/50 animate-spin" />
            </div>
          )}

          {cert.file_type === "image" ? (
            <img
              src={cert.file_url}
              alt={cert.title}
              onLoad={() => setLoading(false)}
              onDragStart={(e) => e.preventDefault()}
              className={`max-w-full max-h-full object-contain mx-auto shadow-2xl rounded-sm transition-opacity duration-300 pointer-events-none ${loading ? 'opacity-0' : 'opacity-100'}`}
            />
          ) : (
            <div className="w-full h-full relative">
               <object
                data={`${cert.file_url}#toolbar=0&navpanes=0&scrollbar=0`}
                type="application/pdf"
                className={`w-full h-full transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setLoading(false)}
              >
                <iframe
                    src={`${cert.file_url}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-full border-0"
                    onLoad={() => setLoading(false)}
                    title={cert.title}
                />
              </object>
              
              {/* Protection Overlay */}
              <div className="absolute inset-0 bg-transparent z-10" />
              
              {/* Force loading to end if it takes too long (e.g. browser PDF viewer doesn't trigger onLoad predictably) */}
              <button 
                onClick={() => setLoading(false)}
                className="absolute bottom-4 right-4 text-[10px] text-slate-500 hover:text-white transition-colors"
                style={{ display: loading ? 'block' : 'none' }}
              >
                Click if stuck loading
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
