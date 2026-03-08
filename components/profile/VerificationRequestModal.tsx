import { useState } from "react";
import { Copy, X, CheckCircle, Clock, AlertCircle } from "lucide-react";

type VerificationRequestModalProps = {
    walletAddress: string;
    onClose: () => void;
    onSuccess: () => void;
    currentStatus: string | null;
    profileName: string;
    website?: string;
    socials?: string;
};

export function VerificationRequestModal({
    walletAddress,
    onClose,
    onSuccess,
    currentStatus,
    profileName,
    website,
    socials
}: VerificationRequestModalProps) {
    const [type, setType] = useState("Company");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Create flexible proof combining socials if needed
            const proofStr = `${website || ''} ${socials || ''}`.trim();

            const res = await fetch("/api/organizations/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: profileName,
                    type: type,
                    walletAddress: walletAddress,
                    website: website || "",
                    socialLink: socials || "",
                    proof: proofStr || "Profile Request",
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to submit verification request");
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (currentStatus === "pending") {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden relative p-8 text-center text-white">
                    <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>

                    <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Request Pending</h2>
                    <p className="text-slate-400 mb-6 font-medium">
                        Your verification request is currently under review by our team.
                    </p>

                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    if (currentStatus === "verified") {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden relative p-8 text-center text-white">
                    <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                    <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Already Verified</h2>
                    <p className="text-slate-400 font-medium">
                        Your profile is already fully verified!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
                    <h2 className="text-xl font-bold text-white">Verify Identity</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <p className="text-sm text-slate-400 mb-4 font-medium leading-relaxed">
                            Submit your profile for verified status. By verifying, your attestations carry more weight across the ecosystem.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Entity Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-medium"
                                required
                            >
                                <option value="Company">Company</option>
                                <option value="Organization">Organization</option>
                                <option value="DAO">DAO</option>
                                <option value="Figure">Figure</option>
                                <option value="Community">Community</option>
                            </select>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-400 font-medium">{error}</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 rounded-lg text-white font-bold transition-all duration-200 ${loading
                                    ? "bg-emerald-500/50 cursor-not-allowed opacity-70"
                                    : "bg-emerald-500 hover:bg-emerald-600 shadow-lg hover:shadow-emerald-500/25 outline outline-2 outline-transparent hover:outline-emerald-500/20"
                                }`}
                        >
                            {loading ? "Submitting..." : "Submit Verification Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
