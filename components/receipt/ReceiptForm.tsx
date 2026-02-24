"use client";

import { useState } from "react";
import { X, Upload } from "lucide-react";
import imageCompression from "browser-image-compression";
import { useWallet } from "@solana/wallet-adapter-react";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

const WORK_TYPES = ["Full-time", "Part-time", "Contract", "Freelance", "Other"];
const COMP_TYPES = ["Paid", "Unpaid", "Token", "Equity", "Other"];
const LINK_LABELS = ["GitHub", "Figma", "Website", "Doc", "Demo", "Other"];

type EvidenceLink = {
  label: string;
  url: string;
};

type Props = {
  walletAddress: string;
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function ReceiptForm({ walletAddress, initialData, onSuccess, onCancel }: Props) {
  const { publicKey, signMessage } = useWallet();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isEditing = !!initialData?.id;
  const isLocked = initialData?.status === "Attested" || initialData?.status === "Locked";

  const [form, setForm] = useState({
    role: initialData?.role || "",
    org: initialData?.org || "",
    description: initialData?.description || "",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    workType: initialData?.workType || "Full-time",
    compensationType: initialData?.compensationType || "",
    evidenceHash: initialData?.evidenceHash || "",
    evidenceLinks: initialData?.evidenceLinks || [] as EvidenceLink[],
    impact: initialData?.impact || [] as string[],
    portfolioImages: initialData?.portfolioImages || [] as { imageUrl: string; thumbnailUrl: string }[],
  });

  const handleImageUpload = async (file: File) => {
    if (form.portfolioImages.length >= 5) {
      alert("Maximum 5 images per receipt");
      return;
    }

    setUploadingImage(true);

    try {
      const fullOptions = {
        maxSizeMB: 1.5, // Fulfills user request of < 2MB while keeping high quality
        maxWidthOrHeight: 1600, // Increased resolution slightly for better portfolio display
        useWebWorker: true,
        fileType: "image/webp" as const,
      };

      const thumbOptions = {
        maxSizeMB: 0.05,
        maxWidthOrHeight: 200, // Better thumbnail quality
        useWebWorker: true,
        fileType: "image/webp" as const,
      };

      // Auto-compress large files to save storage
      console.log(`Compressing ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)...`);
      const fullImage = await imageCompression(file, fullOptions);
      const thumbnail = await imageCompression(file, thumbOptions);
      console.log(`Compressed to ${(fullImage.size / 1024 / 1024).toFixed(2)} MB`);

      const timestamp = Date.now();
      const fullFileName = `${walletAddress}/${timestamp}_full.webp`;
      const thumbFileName = `${walletAddress}/${timestamp}_thumb.webp`;

      // Helper for uploading via API
      const uploadFile = async (blob: Blob, path: string) => {
        const formData = new FormData();
        formData.append("file", blob, path);
        formData.append("bucket", "portfolio");
        formData.append("path", path);

        const res = await fetch("/api/storage/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Upload failed");
        }
        return await res.json();
      };

      const [fullRes, thumbRes] = await Promise.all([
        uploadFile(fullImage, fullFileName),
        uploadFile(thumbnail, thumbFileName),
      ]);

      setForm({
        ...form,
        portfolioImages: [
          ...form.portfolioImages,
          {
            imageUrl: fullRes.url,
            thumbnailUrl: thumbRes.url,
          },
        ],
      });
    } catch (err: any) {
      console.error("Error uploading image:", err);
      alert(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const processSubmission = async () => {
    setShowConfirm(false);

    if (isLocked) {
      alert("This record is locked and cannot be modified.");
      return;
    }

    if (!publicKey || !signMessage) {
      alert("Please connect your wallet to sign this action.");
      return;
    }
    setLoading(true);

    try {
      const { signChainVolioAction } = await import("@/lib/wallet-utils");
      const actionType = isEditing ? "update_work" : "submit_work";
      const signedAction = await signChainVolioAction({ publicKey, signMessage } as any, actionType);

      if (!signedAction) {
        setLoading(false);
        return;
      }

      const method = isEditing ? "PATCH" : "POST";
      const res = await fetch("/api/receipts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: initialData?.id,
          walletAddress,
          ...form,
          ...signedAction
        }),
      });

      if (res.ok) {
        if (!isEditing) {
          setForm({
            role: "",
            org: "",
            description: "",
            startDate: "",
            endDate: "",
            workType: "Full-time",
            compensationType: "",
            evidenceHash: "",
            evidenceLinks: [],
            impact: [],
            portfolioImages: [],
          });
        }
        onSuccess?.();
        if (!isEditing) window.location.reload();
      } else {
        const errorData = await res.json();
        alert(errorData.error?.message || errorData.error || "Failed to save receipt");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving receipt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-lg bg-slate-800/50 border border-slate-700 mb-8 space-y-4">
      {isLocked && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-400 mb-6">
          <span className="text-xl">🔒</span>
          <div className="text-xs">
            <p className="font-bold uppercase tracking-wider mb-0.5">Immutable Verification</p>
            <p className="opacity-80 text-white">This record is locked after attestation. No further edits can be cryptographically signed.</p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm text-slate-400 mb-1">Role / Title *</label>
        <input type="text" required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} disabled={isLocked} className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none disabled:opacity-50" placeholder="Smart Contract Developer" />
      </div>
      <div>
        <label className="block text-sm text-slate-400 mb-1">Organization / Project *</label>
        <input type="text" required value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} disabled={isLocked} className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none disabled:opacity-50" placeholder="Project or company name" />
      </div>
      <div>
        <label className="block text-sm text-slate-400 mb-1">Job description *</label>
        <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} disabled={isLocked} className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none resize-none h-20 disabled:opacity-50" placeholder="Summary of tasks and contributions" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Start date *</label>
          <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} disabled={isLocked} className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none disabled:opacity-50" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">End date *</label>
          <input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} disabled={isLocked} className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none disabled:opacity-50" />
        </div>
      </div>
      <div>
        <label className="block text-sm text-slate-400 mb-1">Work type *</label>
        <select value={form.workType} onChange={(e) => setForm({ ...form, workType: e.target.value })} disabled={isLocked} className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none disabled:opacity-50">
          {WORK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm text-slate-400 mb-1">Compensation (optional)</label>
        <select value={form.compensationType} onChange={(e) => setForm({ ...form, compensationType: e.target.value })} disabled={isLocked} className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none disabled:opacity-50">
          <option value="">None</option>
          {COMP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-2">Impact / Outcomes (optional, max 2)</label>
        <div className="space-y-2">
          {form.impact.map((item: string, index: number) => (
            <div key={index} className="flex gap-2">
              <input type="text" value={item} maxLength={80} onChange={(e) => {
                const newImpact = [...form.impact];
                newImpact[index] = e.target.value;
                setForm({ ...form, impact: newImpact });
              }} disabled={isLocked} className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 outline-none text-sm disabled:opacity-50" placeholder="e.g., Launched MVP with 1,000+ users" />
              {!isLocked && (
                <button type="button" onClick={() => {
                  const newImpact = form.impact.filter((_: string, i: number) => i !== index);
                  setForm({ ...form, impact: newImpact });
                }} className="px-3 py-2 text-red-400 hover:bg-red-400/10 rounded-lg text-sm">✕</button>
              )}
            </div>
          ))}
          {!isLocked && form.impact.length < 2 && (
            <button type="button" onClick={() => setForm({ ...form, impact: [...form.impact, ""] })} className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">+ Add Impact</button>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-2">Portfolio Images (optional, max 5)</label>
        {!isLocked && form.portfolioImages.length < 5 && (
          <div className="relative border-2 border-dashed border-slate-700 hover:border-slate-600 rounded-lg p-6 text-center transition-colors mb-3">
            <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleImageUpload(e.target.files[0]);
                e.target.value = "";
              }
            }} disabled={uploadingImage || isLocked} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
            <Upload className="w-8 h-8 mx-auto mb-2 text-slate-500" />
            <p className="text-sm text-slate-400">{uploadingImage ? "Uploading..." : "Click or drag to upload"}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {form.portfolioImages.map((img: any, index: number) => (
            <div key={index} className="relative group">
              <img src={img.thumbnailUrl} alt={`Portfolio ${index + 1}`} className="w-16 h-16 rounded object-cover border border-slate-700" />
              {!isLocked && (
                <button type="button" onClick={() => setForm({ ...form, portfolioImages: form.portfolioImages.filter((_: any, i: number) => i !== index) })} className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-2">Evidence Links</label>
        <div className="space-y-3">
          {form.evidenceLinks.map((link: any, index: number) => (
            <div key={index} className="flex gap-2">
              <select value={link.label} onChange={(e) => {
                const newLinks = [...form.evidenceLinks];
                newLinks[index].label = e.target.value;
                setForm({ ...form, evidenceLinks: newLinks });
              }} disabled={isLocked} className="w-1/3 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 outline-none text-sm disabled:opacity-50">
                {LINK_LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <input type="url" value={link.url} onChange={(e) => {
                const newLinks = [...form.evidenceLinks];
                newLinks[index].url = e.target.value;
                setForm({ ...form, evidenceLinks: newLinks });
              }} disabled={isLocked} className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 outline-none text-sm disabled:opacity-50" placeholder="https://..." />
              {!isLocked && (
                <button type="button" onClick={() => setForm({ ...form, evidenceLinks: form.evidenceLinks.filter((_: any, i: number) => i !== index) })} className="px-3 py-2 text-red-400 hover:bg-red-400/10 rounded-lg text-sm">✕</button>
              )}
            </div>
          ))}
          {!isLocked && (
            <button type="button" onClick={() => setForm({ ...form, evidenceLinks: [...form.evidenceLinks, { label: "GitHub", url: "" }] })} className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">+ Add Link</button>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 font-medium">
            Cancel
          </button>
        )}
        {!isLocked && (
          <button type="submit" disabled={loading} className="flex-[2] py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 font-medium">
            {loading ? "Signing..." : isEditing ? "Save Changes" : "Save Receipt (Self-Declared)"}
          </button>
        )}
      </div>

      <ConfirmationModal isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={processSubmission} title={isEditing ? "Update Proof of Work?" : "Finalize Proof of Work?"} message={isEditing ? "This will update your record with a new cryptographic signature. Metadata like images and links will be updated." : "Once this receipt is minted, the core details (Role, Organization, Date) cannot be edited or deleted. This ensures trust and immutability."} confirmLabel={isEditing ? "Update Receipt" : "Yes, Mint Receipt"} cancelLabel="Review Again" iconColor="green" confirmButtonColor="green" />
    </form>
  );
}
