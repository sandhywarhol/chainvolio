"use client";

import { useState, useRef } from "react";
import { X, Upload, FileText, Image as ImageIcon, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { signChainVolioAction } from "@/lib/wallet-utils";

interface CertificateUploadModalProps {
  walletAddress?: string;
  authUid?: string;
  accessToken?: string;
  onClose: () => void;
  onSuccess: () => void;
}

type UploadStatus = "idle" | "processing" | "uploading" | "success" | "error";

const MAX_IMAGE_DIM = 1600;
const MAX_IMAGE_BYTES = 1 * 1024 * 1024; // 1 MB

async function processImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > MAX_IMAGE_DIM || height > MAX_IMAGE_DIM) {
        if (width >= height) {
          height = Math.round((height / width) * MAX_IMAGE_DIM);
          width = MAX_IMAGE_DIM;
        } else {
          width = Math.round((width / height) * MAX_IMAGE_DIM);
          height = MAX_IMAGE_DIM;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      // Progressive quality reduction to get under 1 MB
      const tryQuality = (quality: number) => {
        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error("Canvas toBlob failed")); return; }
          if (blob.size <= MAX_IMAGE_BYTES || quality <= 0.3) {
            resolve(blob);
          } else {
            tryQuality(quality - 0.1);
          }
        }, "image/webp", quality);
      };
      tryQuality(0.85);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

export function CertificateUploadModal({ walletAddress, authUid, accessToken, onClose, onSuccess }: CertificateUploadModalProps) {
  const { publicKey, signMessage } = useWallet();
  const isGoogleUser = !!authUid && !!accessToken;
  const [title, setTitle]       = useState("");
  const [issuer, setIssuer]     = useState("");
  const [dateIssued, setDate]   = useState("");
  const [file, setFile]         = useState<File | null>(null);
  const [status, setStatus]     = useState<UploadStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setErrorMsg("");
    const ALLOWED = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED.includes(f.type)) {
      setErrorMsg("Unsupported format. Use PDF, JPEG, PNG, or WebP.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setErrorMsg("File too large. Maximum is 10 MB.");
      return;
    }
    if (f.type === "application/pdf" && f.size > 5 * 1024 * 1024) {
      setErrorMsg("PDF files must be under 5 MB.");
      return;
    }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;
    setErrorMsg("");

    try {
      setStatus("processing");
      setProgress(20);

      let processedBlob: Blob;
      let processedName: string;

      if (file.type.startsWith("image/")) {
        processedBlob = await processImage(file);
        processedName = `certificate.webp`;
      } else {
        processedBlob = file;
        processedName = `certificate.pdf`;
      }

      setProgress(60);
      setStatus("uploading");

      const form = new FormData();
      form.append("title", title.trim());
      form.append("issuer", issuer.trim());
      form.append("dateIssued", dateIssued);
      form.append("file", new File([processedBlob], processedName, { type: processedBlob.type }));

      let headers: HeadersInit = {};

      if (isGoogleUser) {
        form.append("auth_uid", authUid!);
        headers = { "Authorization": `Bearer ${accessToken}` };
      } else {
        if (!publicKey || !signMessage) throw new Error("Wallet not connected");
        const signedAction = await signChainVolioAction({ publicKey, signMessage } as any, "update_profile");
        if (!signedAction) { setStatus("idle"); setProgress(0); return; }
        form.append("wallet", walletAddress!);
        form.append("signature", signedAction.signature);
        form.append("nonce", signedAction.nonce);
        form.append("timestamp", signedAction.timestamp.toString());
      }

      setProgress(80);
      const res = await fetch("/api/certificates", { method: "POST", body: form, headers });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setProgress(100);
      setStatus("success");
      setTimeout(() => { onSuccess(); onClose(); }, 1200);

    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    }
  };

  const statusLabel: Record<UploadStatus, string> = {
    idle: "Upload Certificate",
    processing: "Optimizing file...",
    uploading: "Uploading...",
    success: "Uploaded!",
    error: "Upload Failed",
  };

  const isLoading = status === "processing" || status === "uploading";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-[#0f0f11] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-lg font-bold text-white">Add Certificate</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Upload a credential to your profile</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        {isLoading && (
          <div className="h-0.5 bg-white/5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Certificate Title <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. AWS Certified Solutions Architect"
              required
              disabled={isLoading}
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.1] focus:border-white/30 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-all disabled:opacity-50"
            />
          </div>

          {/* Issuer */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Issuer Name <span className="text-slate-600">(optional)</span>
            </label>
            <input
              type="text"
              value={issuer}
              onChange={e => setIssuer(e.target.value)}
              placeholder="e.g. Amazon Web Services"
              disabled={isLoading}
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.1] focus:border-white/30 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-all disabled:opacity-50"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Date Issued <span className="text-slate-600">(optional)</span>
            </label>
            <input
              type="date"
              value={dateIssued}
              onChange={e => setDate(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.1] focus:border-white/30 rounded-xl text-sm text-white focus:outline-none transition-all disabled:opacity-50 [color-scheme:dark]"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Certificate File <span className="text-amber-400">*</span>
            </label>
            <div
              className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer ${
                file
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-white/[0.1] bg-white/[0.02] hover:border-amber-500/40 hover:bg-amber-500/5"
              }`}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                disabled={isLoading}
              />
              <div className="p-6 text-center">
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    {file.type === "application/pdf"
                      ? <FileText className="w-6 h-6 text-emerald-400" />
                      : <ImageIcon className="w-6 h-6 text-emerald-400" />
                    }
                    <div className="text-left">
                      <p className="text-sm font-medium text-white truncate max-w-[260px]">{file.name}</p>
                      <p className="text-[11px] text-slate-500">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400 font-medium">Drop file here or click to browse</p>
                    <p className="text-[11px] text-slate-600 mt-1">PDF, JPEG, PNG, WebP · max 10 MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-400">{errorMsg}</p>
            </div>
          )}

          {/* Status message */}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
              {statusLabel[status]}
            </div>
          )}
          {status === "success" && (
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              Certificate uploaded successfully!
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-sm text-slate-300 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !file || !title.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" />{statusLabel[status]}</>
              ) : (
                <><Upload className="w-3.5 h-3.5" />Upload</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
