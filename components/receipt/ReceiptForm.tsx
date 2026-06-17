"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Upload, Lock } from "lucide-react";
import imageCompression from "browser-image-compression";
import { useWallet } from "@solana/wallet-adapter-react";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Toast } from "@/components/ui/Toast";

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
  googleAccessToken?: string;
};

export function ReceiptForm({ walletAddress, initialData, onSuccess, onCancel, googleAccessToken }: Props) {
  const router = useRouter();
  const { publicKey, signMessage } = useWallet();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "warning" } | null>(null);

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
      setToast({ message: "Maximum 5 images per receipt.", type: "error" });
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
      const storagePrefix = walletAddress.replace(":", "-");
      const fullFileName = `${storagePrefix}/${timestamp}_full.webp`;
      const thumbFileName = `${storagePrefix}/${timestamp}_thumb.webp`;

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
      setToast({ message: err.message || "Failed to upload image.", type: "error" });
    } finally {
      setUploadingImage(false);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auto-prefix URLs that don't have a protocol
    const formattedLinks = form.evidenceLinks.map((link: EvidenceLink) => {
        let url = link.url.trim();
        if (url && !/^https?:\/\//i.test(url)) {
            url = `https://${url}`;
        }
        return { ...link, url };
    });
    setForm(prev => ({ ...prev, evidenceLinks: formattedLinks }));
    setShowConfirm(true);
  };

  const processSubmission = async () => {
    setShowConfirm(false);

    if (isLocked) {
      setToast({ message: "This record is locked after attestation and cannot be modified.", type: "error" });
      return;
    }

    const isGoogleUser = walletAddress.startsWith("gauth:");

    if (!isGoogleUser && (!publicKey || !signMessage)) {
      setToast({ message: "Please connect your wallet to sign this action.", type: "error" });
      return;
    }
    setLoading(true);

    try {
      let signedFields: Record<string, unknown> = {};

      if (!isGoogleUser) {
        const { signChainVolioAction } = await import("@/lib/wallet-utils");
        const actionType = isEditing ? "update_work" : "submit_work";
        const signedAction = await signChainVolioAction({ publicKey, signMessage } as any, actionType);

        if (!signedAction) {
          setToast({ message: "Signing canceled. Please try again.", type: "error" });
          setLoading(false);
          return;
        }
        signedFields = signedAction;
      }

      const method = isEditing ? "PATCH" : "POST";
      const res = await fetch("/api/receipts", {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(isGoogleUser && googleAccessToken ? { "Authorization": `Bearer ${googleAccessToken}` } : {}),
        },
        body: JSON.stringify({
          id: initialData?.id,
          walletAddress,
          ...form,
          ...signedFields,
        }),
      });

      if (res.ok) {
        setToast({ message: isEditing ? "Receipt updated successfully!" : "Proof of work saved successfully!", type: "success" });
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
        if (!isEditing) setTimeout(() => router.refresh(), 800);
      } else {
        const errorData = await res.json();
        setToast({ message: errorData.error?.message || errorData.error || "Failed to save receipt.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Error saving receipt. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 rounded-xl mb-4 space-y-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
      {isLocked && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-400 mb-6">
          <Lock className="w-5 h-5 flex-shrink-0" aria-label="Locked" />
          <div className="text-xs">
            <p className="font-bold uppercase tracking-wider mb-0.5">Immutable Verification</p>
            <p className="opacity-80 text-white">This record is locked after attestation. No further edits can be cryptographically signed.</p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs text-white/40 mb-1.5 font-medium">Role / Job Title (optional)</label>
        <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} disabled={isLocked} className="w-full px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] focus:border-white/30 outline-none text-white disabled:opacity-40 transition-colors" placeholder="e.g. Smart Contract Developer, Independent Builder" />
      </div>
      <div>
        <label className="block text-xs text-white/40 mb-1.5 font-medium">Organization / Project (optional)</label>
        <input type="text" value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} disabled={isLocked} className="w-full px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] focus:border-white/30 outline-none text-white disabled:opacity-40 transition-colors" placeholder="e.g. Project or company name" />
      </div>
      <div>
        <label className="block text-xs text-white/40 mb-1.5 font-medium">Job description *</label>
        <textarea required value={form.description} maxLength={500} onChange={(e) => setForm({ ...form, description: e.target.value })} disabled={isLocked} className="w-full px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] focus:border-white/30 outline-none text-white resize-none h-20 disabled:opacity-40 transition-colors" placeholder="Summary of tasks and contributions" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-white/40 mb-1.5 font-medium">Start date *</label>
          <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} disabled={isLocked} className="w-full px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] focus:border-white/30 outline-none text-white disabled:opacity-40 transition-colors" />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5 font-medium">End date *</label>
          <input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} disabled={isLocked} className="w-full px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] focus:border-white/30 outline-none text-white disabled:opacity-40 transition-colors" />
        </div>
      </div>
      <div>
        <label className="block text-xs text-white/40 mb-1.5 font-medium">Work type *</label>
        <select value={form.workType} onChange={(e) => setForm({ ...form, workType: e.target.value })} disabled={isLocked} className="w-full px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] focus:border-white/30 outline-none text-white disabled:opacity-40 transition-colors">
          {WORK_TYPES.map((t) => <option key={t} value={t} className="bg-zinc-950 text-white">{t}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs text-white/40 mb-1.5 font-medium">Compensation (optional)</label>
        <select value={form.compensationType} onChange={(e) => setForm({ ...form, compensationType: e.target.value })} disabled={isLocked} className="w-full px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] focus:border-white/30 outline-none text-white disabled:opacity-40 transition-colors">
          <option value="" className="bg-zinc-950 text-white">None</option>
          {COMP_TYPES.map((t) => <option key={t} value={t} className="bg-zinc-950 text-white">{t}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs text-white/40 mb-1.5 font-medium">Impact / Outcomes (optional, max 5)</label>
        <div className="space-y-2">
          {form.impact.map((item: string, index: number) => (
            <div key={index} className="flex gap-2">
              <input type="text" value={item} maxLength={180} onChange={(e) => {
                const newImpact = [...form.impact];
                newImpact[index] = e.target.value;
                setForm({ ...form, impact: newImpact });
              }} disabled={isLocked} className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] outline-none text-sm text-white disabled:opacity-40 transition-colors" placeholder="e.g., Launched MVP with 1,000+ users" />
              {!isLocked && (
                <button type="button" onClick={() => {
                  const newImpact = form.impact.filter((_: string, i: number) => i !== index);
                  setForm({ ...form, impact: newImpact });
                }} className="px-3 py-2 text-red-400 hover:bg-red-400/10 rounded-lg text-sm">✕</button>
              )}
            </div>
          ))}
          {!isLocked && form.impact.length < 5 && (
            <button type="button" onClick={() => setForm({ ...form, impact: [...form.impact, ""] })} className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">+ Add Impact</button>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs text-white/40 mb-1.5 font-medium">Portfolio Images (optional, max 5)</label>
        {!isLocked && form.portfolioImages.length < 5 && (
          <div className="relative border border-dashed border-white/[0.12] hover:border-white/25 rounded-lg p-6 text-center transition-colors mb-3">
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
              <img src={img.thumbnailUrl} alt={`Portfolio ${index + 1}`} className="w-16 h-16 rounded object-cover border border-white/10" />
              {!isLocked && (
                <button type="button" onClick={() => setForm({ ...form, portfolioImages: form.portfolioImages.filter((_: any, i: number) => i !== index) })} className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-white/40 mb-1.5 font-medium">Evidence Links</label>
        <div className="space-y-3">
          {form.evidenceLinks.map((link: any, index: number) => (
            <div key={index} className="flex flex-col sm:flex-row gap-2">
              <select value={link.label} onChange={(e) => {
                const newLinks = [...form.evidenceLinks];
                newLinks[index].label = e.target.value;
                setForm({ ...form, evidenceLinks: newLinks });
              }} disabled={isLocked} className="w-full sm:w-1/3 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] outline-none text-sm text-white disabled:opacity-40 transition-colors">
                {LINK_LABELS.map((l) => <option key={l} value={l} className="bg-zinc-950 text-white">{l}</option>)}
              </select>
              <div className="flex gap-2 flex-1">
                <input type="url" value={link.url} onChange={(e) => {
                  const newLinks = [...form.evidenceLinks];
                  newLinks[index].url = e.target.value;
                  setForm({ ...form, evidenceLinks: newLinks });
                }} disabled={isLocked} className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] outline-none text-sm text-white disabled:opacity-40 transition-colors" placeholder="https://..." />
                {!isLocked && (
                  <button type="button" onClick={() => setForm({ ...form, evidenceLinks: form.evidenceLinks.filter((_: any, i: number) => i !== index) })} className="px-3 py-2 text-red-400 hover:bg-red-400/10 rounded-lg text-sm">✕</button>
                )}
              </div>
            </div>
          ))}
          {!isLocked && (
            <button type="button" onClick={() => setForm({ ...form, evidenceLinks: [...form.evidenceLinks, { label: "GitHub", url: "" }] })} className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">+ Add Link</button>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-lg font-medium transition-colors" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
            Cancel
          </button>
        )}
        {!isLocked && (
          <button type="submit" disabled={loading} className="flex-[2] py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 font-medium">
            {loading ? "Signing..." : isEditing ? "Save Changes" : "Save Receipt (Self-Declared)"}
          </button>
        )}
      </div>

      <ConfirmationModal isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={processSubmission} title={isEditing ? "Update Proof of Work?" : "Finalize Proof of Work?"} message={isEditing ? "This will update your record with a new cryptographic signature. Metadata like images and links will be updated." : "Once this receipt is minted, the core details (Role, Organization, Date) cannot be edited or deleted. This ensures trust and immutability."} confirmLabel={isEditing ? "Update Receipt" : "Yes, Mint Receipt"} cancelLabel="Review Again" iconColor="green" confirmButtonColor="green" note="Your wallet signature cryptographically binds this record to your identity, ensuring it cannot be forged or tampered with. This is what makes your resume verifiable on-chain." />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </form>
  );
}
