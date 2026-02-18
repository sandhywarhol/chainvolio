"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
    onUpload: (file: File) => Promise<void>;
    loading: boolean;
}

export function ImageUpload({ onUpload, loading }: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        // Check file type
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
            return "Please upload a JPG, PNG, or WebP image";
        }

        // Check file size (1MB = 1048576 bytes)
        if (file.size > 1048576) {
            return "Image must be less than 1MB";
        }

        return null;
    };

    const handleFile = async (file: File) => {
        setError(null);

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        try {
            await onUpload(file);
            setPreview(null);
        } catch (err: any) {
            setError(err.message || "Upload failed");
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const clearPreview = () => {
        setPreview(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-3">
            {preview ? (
                <div className="relative">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-slate-700"
                    />
                    <button
                        onClick={clearPreview}
                        disabled={loading}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    {loading && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                            <div className="text-white text-sm">Uploading...</div>
                        </div>
                    )}
                </div>
            ) : (
                <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-slate-700 hover:border-slate-600"
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleChange}
                        disabled={loading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <Upload className="w-10 h-10 mx-auto mb-3 text-slate-500" />
                    <p className="text-sm text-slate-400 mb-1">
                        Drag and drop or click to upload
                    </p>
                    <p className="text-xs text-slate-500">
                        JPG, PNG, or WebP • Max 1MB
                    </p>
                </div>
            )}

            {error && (
                <p className="text-xs text-red-400">{error}</p>
            )}
        </div>
    );
}
