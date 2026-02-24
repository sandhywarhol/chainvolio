"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import imageCompression from "browser-image-compression";
import { useWallet } from "@solana/wallet-adapter-react";

interface PortfolioItem {
    id: string;
    title: string;
    description?: string;
    imageUrl: string;
    thumbnailUrl: string;
}

interface PortfolioFormProps {
    walletAddress: string;
}

export function PortfolioForm({ walletAddress }: PortfolioFormProps) {
    const { publicKey, signMessage } = useWallet();
    const [form, setForm] = useState({
        title: "",
        description: "",
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [fetchLoading, setFetchLoading] = useState(true);

    // Fetch existing portfolio items
    useEffect(() => {
        fetchItems();
    }, [walletAddress]);

    const fetchItems = async () => {
        try {
            const res = await fetch(`/api/portfolio?wallet=${walletAddress}`);
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (err) {
            console.error("Error fetching portfolio:", err);
        } finally {
            setFetchLoading(false);
        }
    };

    const compressAndUploadImage = async (file: File) => {
        // Compress full-size image (max 1200px)
        const fullOptions = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1200,
            useWebWorker: true,
            fileType: "image/webp" as const,
        };

        // Compress thumbnail (64px)
        const thumbOptions = {
            maxSizeMB: 0.1,
            maxWidthOrHeight: 64,
            useWebWorker: true,
            fileType: "image/webp" as const,
        };

        const fullImage = await imageCompression(file, fullOptions);
        const thumbnail = await imageCompression(file, thumbOptions);

        // Generate unique filenames
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

        return {
            imageUrl: fullRes.url,
            thumbnailUrl: thumbRes.url,
        };
    };


    const handleFileSelect = async (file: File) => {
        setSelectedFile(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!publicKey || !signMessage) {
            alert("Please connect your wallet to sign this action.");
            return;
        }

        if (!form.title.trim()) {
            alert("Please enter a title");
            return;
        }

        if (!selectedFile) {
            alert("Please select an image");
            return;
        }

        if (form.description.length > 150) {
            alert("Description must be 150 characters or less");
            return;
        }

        setLoading(true);

        try {
            const { signChainVolioAction } = await import("@/lib/wallet-utils");
            const signedAction = await signChainVolioAction({ publicKey, signMessage } as any, "update_profile");

            if (!signedAction) {
                setLoading(false);
                return;
            }

            // Compress and upload images
            const { imageUrl, thumbnailUrl } = await compressAndUploadImage(selectedFile);

            // Save to database
            const res = await fetch("/api/portfolio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    walletAddress,
                    title: form.title.trim(),
                    description: form.description.trim() || undefined,
                    imageUrl,
                    thumbnailUrl,
                    ...signedAction
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to save portfolio item");
            }

            // Reset form
            setForm({ title: "", description: "" });
            setSelectedFile(null);

            // Refresh list
            await fetchItems();
        } catch (err: any) {
            console.error("Error saving portfolio:", err);
            alert(err.message || "Failed to save portfolio item");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!publicKey || !signMessage) return;
        if (!confirm("Delete this portfolio item?")) return;

        try {
            const { signChainVolioAction } = await import("@/lib/wallet-utils");
            const signedAction = await signChainVolioAction({ publicKey, signMessage } as any, "update_profile");

            if (!signedAction) return;

            const searchParams = new URLSearchParams({
                wallet: publicKey.toBase58(),
                signature: signedAction.signature,
                nonce: signedAction.nonce,
                timestamp: signedAction.timestamp.toString()
            });

            const res = await fetch(`/api/portfolio/${id}?${searchParams.toString()}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to delete");
            }

            await fetchItems();
        } catch (err: any) {
            console.error("Error deleting:", err);
            alert(err.message || "Failed to delete portfolio item");
        }
    };

    return (
        <div className="space-y-6">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 p-5 bg-slate-800/50 border border-slate-700 rounded-xl">
                <div>
                    <label className="block text-sm text-slate-400 mb-2">
                        Artwork Title <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 outline-none text-sm focus:border-emerald-500"
                        placeholder="e.g., Sunset Painting"
                        maxLength={100}
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm text-slate-400 mb-2">
                        Description (optional, max 150 chars)
                    </label>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 outline-none text-sm focus:border-emerald-500 resize-none"
                        placeholder="e.g., Oil on canvas, 2024"
                        maxLength={150}
                        rows={2}
                        disabled={loading}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        {150 - form.description.length} characters remaining
                    </p>
                </div>

                <div>
                    <label className="block text-sm text-slate-400 mb-2">
                        Image <span className="text-red-400">*</span>
                    </label>
                    <ImageUpload onUpload={handleFileSelect} loading={loading} />
                </div>

                <button
                    type="submit"
                    disabled={loading || !form.title.trim() || !selectedFile}
                    className="w-full px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium transition-colors"
                >
                    {loading ? "Saving..." : "Save Portfolio Item"}
                </button>
            </form>

            {/* List of existing items */}
            {fetchLoading ? (
                <p className="text-sm text-slate-500">Loading portfolio...</p>
            ) : items.length > 0 ? (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-400">Your Portfolio ({items.length})</h3>
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg"
                        >
                            <img
                                src={item.thumbnailUrl}
                                alt={item.title}
                                className="w-12 h-12 rounded object-cover border border-slate-700"
                            />
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-white truncate">{item.title}</h4>
                                {item.description && (
                                    <p className="text-xs text-slate-400 truncate">{item.description}</p>
                                )}
                            </div>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                aria-label="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-slate-500">No portfolio items yet. Add your first artwork above!</p>
            )}
        </div>
    );
}
