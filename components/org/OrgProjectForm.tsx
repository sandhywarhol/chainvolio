"use client";

import { useState } from "react";
import { X, Loader2, Plus, FolderOpen } from "lucide-react";

export type OrgProject = {
    id: string;
    title: string;
    description: string | null;
    project_type: string | null;
    project_url: string | null;
    start_date: string | null;
    end_date: string | null;
    is_ongoing: boolean;
    tags: string[];
    status: string;
    created_at: string;
};

type Props = {
    ownerWallet?: string | null;
    ownerAuthUid?: string | null;
    accessToken?: string | null;
    onSuccess: (project: OrgProject) => void;
    onClose: () => void;
};

const PROJECT_TYPES = [
    "Grant Program", "Hackathon", "Product", "Community Initiative",
    "Research", "Event", "Partnership", "Open Source", "Education", "Other",
];

export function OrgProjectForm({ ownerWallet, ownerAuthUid, accessToken, onSuccess, onClose }: Props) {
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [tagsInput, setTagsInput] = useState("");
    const [form, setForm] = useState({
        title: "",
        description: "",
        project_type: "",
        project_url: "",
        start_date: "",
        end_date: "",
        is_ongoing: false,
    });

    const set = (k: keyof typeof form) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
            setForm(prev => ({ ...prev, [k]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) { setFormError("Title is required."); return; }

        setSaving(true);
        setFormError(null);

        const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

        try {
            const res = await fetch("/api/org/projects", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    ownerWallet: ownerWallet || undefined,
                    ownerAuthUid: ownerAuthUid || undefined,
                    title: form.title,
                    description: form.description || null,
                    projectType: form.project_type || null,
                    projectUrl: form.project_url || null,
                    startDate: form.start_date || null,
                    endDate: form.is_ongoing ? null : (form.end_date || null),
                    isOngoing: form.is_ongoing,
                    tags,
                }),
            });
            const data = await res.json();
            if (!data.ok) throw new Error(data.error?.message || "Failed to save");
            onSuccess(data.data);
        } catch (err: any) {
            setFormError(err.message || "Failed to save project");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="relative w-full sm:max-w-lg bg-[#0c0d12] border border-slate-700/50 rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-5 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/10">
                            <FolderOpen className="w-4 h-4 text-emerald-400" />
                        </div>
                        <h2 className="text-sm font-black text-white uppercase tracking-widest">Add Project / Program</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[72vh] overflow-y-auto">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5">
                            Project / Program Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text" required value={form.title} onChange={set("title")}
                            placeholder="e.g. Solana Hackathon 2025, Grant Program, DAO Initiative"
                            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5">Type</label>
                        <select
                            value={form.project_type} onChange={set("project_type")}
                            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm transition-colors appearance-none"
                        >
                            <option value="">Select type...</option>
                            {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5">Description</label>
                        <textarea
                            value={form.description} onChange={set("description")}
                            placeholder="What is this project or program about? Goals, outcomes, who can participate..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm transition-colors resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5">Project URL</label>
                        <input
                            type="text" value={form.project_url} onChange={set("project_url")}
                            placeholder="https://..."
                            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Start Date</label>
                            <input
                                type="date" value={form.start_date} onChange={set("start_date")}
                                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5">End Date</label>
                            <input
                                type="date" value={form.end_date} onChange={set("end_date")}
                                disabled={form.is_ongoing}
                                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm transition-colors disabled:opacity-30"
                            />
                        </div>
                    </div>
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                            type="checkbox" checked={form.is_ongoing}
                            onChange={e => setForm(prev => ({ ...prev, is_ongoing: e.target.checked }))}
                            className="w-4 h-4 rounded accent-emerald-500"
                        />
                        <span className="text-xs text-slate-400 font-medium">Ongoing / Still active</span>
                    </label>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5">Tags</label>
                        <input
                            type="text" value={tagsInput} onChange={e => setTagsInput(e.target.value)}
                            placeholder="DeFi, Education, Community (comma-separated)"
                            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
                        />
                    </div>

                    {formError && <p className="text-xs text-red-400 font-medium px-1">{formError}</p>}

                    <div className="flex items-center gap-3 pt-1">
                        <button
                            type="submit"
                            disabled={saving || !form.title.trim()}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black text-sm transition-all"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            {saving ? "Saving..." : "Add Project"}
                        </button>
                        <button
                            type="button" onClick={onClose}
                            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors border border-slate-700"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
