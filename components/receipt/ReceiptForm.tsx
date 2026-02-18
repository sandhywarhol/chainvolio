"use client";

import { useState } from "react";
import { X, Upload } from "lucide-react";
import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabase/client";

const WORK_TYPES = ["Full-time", "Part-time", "Contract", "Freelance", "Other"];
const COMP_TYPES = ["Paid", "Unpaid", "Token", "Equity", "Other"];
const LINK_LABELS = ["GitHub", "Figma", "Website", "Doc", "Demo", "Other"];

type EvidenceLink = {
  label: string;
  url: string;
};

type Props = {
  walletAddress: string;
  onSuccess?: () => void;
};

import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

export function ReceiptForm({ walletAddress, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  const [form, setForm] = useState({
    role: "",
    org: "",
    description: "",
    startDate: "",
    endDate: "",
    workType: "Full-time",
    compensationType: "",
    evidenceHash: "",
    evidenceLinks: [] as EvidenceLink[],
    impact: [] as string[],
    portfolioImages: [] as { imageUrl: string; thumbnailUrl: string }[],
  });

  const handleImageUpload = async (file: File) => {
    if (!supabase) {
      alert("Supabase not configured");
      return;
    }

    if (form.portfolioImages.length >= 5) {
      alert("Maximum 5 images per receipt");
      return;
    }

    setUploadingImage(true);

    try {
      // Compress full-size image
      const fullOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: "image/webp" as const,
      };

      // Compress thumbnail
      const thumbOptions = {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 64,
        useWebWorker: true,
        fileType: "image/webp" as const,
      };

      const fullImage = await imageCompression(file, fullOptions);
      const thumbnail = await imageCompression(file, thumbOptions);

      // Upload to Supabase storage
      const timestamp = Date.now();
      const fullFileName = `${walletAddress}/${timestamp}_full.webp`;
      const thumbFileName = `${walletAddress}/${timestamp}_thumb.webp`;

      const { error: fullError } = await supabase.storage
        .from("portfolio")
        .upload(fullFileName, fullImage, {
          contentType: "image/webp",
          upsert: false,
        });

      if (fullError) throw fullError;

      const { error: thumbError } = await supabase.storage
        .from("portfolio")
        .upload(thumbFileName, thumbnail, {
          contentType: "image/webp",
          upsert: false,
        });

      if (thumbError) throw thumbError;

      // Get public URLs
      const { data: fullData } = supabase.storage
        .from("portfolio")
        .getPublicUrl(fullFileName);

      const { data: thumbData } = supabase.storage
        .from("portfolio")
        .getPublicUrl(thumbFileName);

      // Add to form state
      setForm({
        ...form,
        portfolioImages: [
          ...form.portfolioImages,
          {
            imageUrl: fullData.publicUrl,
            thumbnailUrl: thumbData.publicUrl,
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
    setLoading(true);

    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          ...form,
        }),
      });
      if (res.ok) {
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
        onSuccess?.();
        // Slightly better reload experience or state update would be preferred, but keeping reload for now
        window.location.reload();
      } else {
        alert("Failed to save receipt");
      }
    } catch (err) {
      console.error(err);
      alert("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 rounded-lg bg-slate-800/50 border border-slate-700 mb-8 space-y-4"
    >
      <div>
        <label className="block text-sm text-slate-400 mb-1">Role / Title *</label>
        <input
          type="text"
          required
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
          placeholder="Smart Contract Developer"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">Organization / Project *</label>
        <input
          type="text"
          required
          value={form.org}
          onChange={(e) => setForm({ ...form, org: e.target.value })}
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
          placeholder="Project or company name"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">Job description *</label>
        <textarea
          required
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none resize-none h-20"
          placeholder="Summary of tasks and contributions"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Start date *</label>
          <input
            type="date"
            required
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">End date *</label>
          <input
            type="date"
            required
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">Work type *</label>
        <select
          value={form.workType}
          onChange={(e) => setForm({ ...form, workType: e.target.value })}
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
        >
          {WORK_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">Compensation (optional)</label>
        <select
          value={form.compensationType}
          onChange={(e) => setForm({ ...form, compensationType: e.target.value })}
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
        >
          <option value="">—</option>
          {COMP_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-2">Impact / Outcomes (optional, max 2)</label>
        <div className="space-y-2">
          {form.impact.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                maxLength={80}
                onChange={(e) => {
                  const newImpact = [...form.impact];
                  newImpact[index] = e.target.value;
                  setForm({ ...form, impact: newImpact });
                }}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 outline-none text-sm"
                placeholder="e.g., Launched MVP with 1,000+ users"
              />
              <button
                type="button"
                onClick={() => {
                  const newImpact = form.impact.filter((_, i) => i !== index);
                  setForm({ ...form, impact: newImpact });
                }}
                className="px-3 py-2 text-red-400 hover:bg-red-400/10 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>
          ))}
          {form.impact.length < 2 && (
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  impact: [...form.impact, ""],
                })
              }
              className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
            >
              + Add Impact
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-1">Short, factual outcomes. Max 80 characters each.</p>
      </div>

      {/* Portfolio Images */}
      <div>
        <label className="block text-sm text-slate-400 mb-2">Portfolio Images (optional, max 5)</label>

        {/* Upload area */}
        {form.portfolioImages.length < 5 && (
          <div className="relative border-2 border-dashed border-slate-700 hover:border-slate-600 rounded-lg p-6 text-center transition-colors mb-3">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleImageUpload(e.target.files[0]);
                  e.target.value = "";
                }
              }}
              disabled={uploadingImage}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <Upload className="w-8 h-8 mx-auto mb-2 text-slate-500" />
            <p className="text-sm text-slate-400">
              {uploadingImage ? "Uploading..." : "Click or drag to upload"}
            </p>
            <p className="text-xs text-slate-500 mt-1">JPG, PNG, or WebP • Max 1MB</p>
          </div>
        )}

        {/* Thumbnails */}
        {form.portfolioImages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.portfolioImages.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img.thumbnailUrl}
                  alt={`Portfolio ${index + 1}`}
                  className="w-16 h-16 rounded object-cover border border-slate-700"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newImages = form.portfolioImages.filter((_, i) => i !== index);
                    setForm({ ...form, portfolioImages: newImages });
                  }}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-500 mt-2">Visual evidence of your work (designs, screenshots, etc.)</p>
      </div>


      <div>
        <label className="block text-sm text-slate-400 mb-2">Evidence Links</label>
        <div className="space-y-3">
          {form.evidenceLinks.map((link, index) => (
            <div key={index} className="flex gap-2">
              <select
                value={link.label}
                onChange={(e) => {
                  const newLinks = [...form.evidenceLinks];
                  newLinks[index].label = e.target.value;
                  setForm({ ...form, evidenceLinks: newLinks });
                }}
                className="w-1/3 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 outline-none text-sm"
              >
                {LINK_LABELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <input
                type="url"
                value={link.url}
                onChange={(e) => {
                  const newLinks = [...form.evidenceLinks];
                  newLinks[index].url = e.target.value;
                  setForm({ ...form, evidenceLinks: newLinks });
                }}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 outline-none text-sm"
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={() => {
                  const newLinks = form.evidenceLinks.filter((_, i) => i !== index);
                  setForm({ ...form, evidenceLinks: newLinks });
                }}
                className="px-3 py-2 text-red-400 hover:bg-red-400/10 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setForm({
                ...form,
                evidenceLinks: [...form.evidenceLinks, { label: "GitHub", url: "" }],
              })
            }
            className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
          >
            + Add Link
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">Evidence hash (optional)</label>
        <input
          type="text"
          value={form.evidenceHash}
          onChange={(e) => setForm({ ...form, evidenceHash: e.target.value })}
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none font-mono text-sm"
          placeholder="Text or manual hash input"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 font-medium"
      >
        {loading ? "Saving..." : "Save Receipt (Self-Declared)"}
      </button>

      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={processSubmission}
        title="Finalize Proof of Work?"
        message="Once this receipt is minted, the core details (Role, Organization, Date) cannot be edited or deleted. This ensures trust and immutability."
        confirmLabel="Yes, Mint Receipt"
        cancelLabel="Review Again"
        iconColor="green"
        confirmButtonColor="green"
      />
    </form >
  );
}
