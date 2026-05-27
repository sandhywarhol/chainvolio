"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, Transaction, TransactionInstruction, PublicKey } from "@solana/web3.js";
import {
    Loader2,
    Search,
    Filter,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    ShieldCheck,
    Clock,
    Building2,
    Briefcase,
    Users,
    MoreHorizontal,
    Download,
    CheckCircle2,
    XCircle,
    Trash2,
    AlertCircle,
    Lock,
    CalendarDays,
    Target,
    FileText,
    User
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import { CustomWalletModal } from "@/components/wallet/CustomWalletModal";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { supabaseAuth } from "@/lib/supabase/auth";
import { Navbar } from "@/components/layout/Navbar";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Toast } from "@/components/ui/Toast";
import { generateHiringReport } from "@/lib/report-generator";

export default function RecruiterDashboard({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const [data, setData] = useState<{ collection: any; candidates: any[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null);
    const [candidateToHire, setCandidateToHire] = useState<string | null>(null);
    const [hiringSuccess, setHiringSuccess] = useState<{ txSignature: string; candidateName: string } | null>(null);
    const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "warning" } | null>(null);
    const router = useRouter();

    // Filters & State
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [attestedOnly, setAttestedOnly] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState("recent");
    const [spamFilter, setSpamFilter] = useState(false); // Feature 4: Spam Filter
    const [focusMatchOnly, setFocusMatchOnly] = useState(false);
    const [needsAuth, setNeedsAuth] = useState(false);

    const { publicKey, connected, signMessage, sendTransaction, connecting } = useWallet();
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const { session: googleSession, loading: googleLoading, isGoogleSignedIn } = useGoogleAuth();
    const isGoogleUser = isGoogleSignedIn && !publicKey;

    const generateReviewHash = async (data: any) => {
        const encoder = new TextEncoder();
        const jsonData = JSON.stringify(data);
        const dataBytes = encoder.encode(jsonData);
        const hashBuffer = await crypto.subtle.digest("SHA-256", dataBytes);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    useEffect(() => {
        // Google auth path: no wallet needed
        if (isGoogleUser && googleSession?.access_token) {
            setLoading(true);
            fetchWithGoogleSession(googleSession.access_token);
            return;
        }

        async function initDashboard() {
            setLoading(true);
            try {
                let cachedWallet = publicKey?.toBase58();
                let cached = null;
                const prefix = "cv_sig_view_dashboard_";
                const suffix = `_${slug}`;

                if (cachedWallet) {
                    cached = sessionStorage.getItem(`${prefix}${cachedWallet}${suffix}`);
                } else {
                    // Find any existing signature for this slug
                    for (let i = 0; i < sessionStorage.length; i++) {
                        const key = sessionStorage.key(i);
                        if (key?.startsWith(prefix) && key?.endsWith(suffix)) {
                            cachedWallet = key.substring(prefix.length, key.length - suffix.length);
                            cached = sessionStorage.getItem(key);
                            break;
                        }
                    }
                }

                if (cached && cachedWallet) {
                    try {
                        const parsed = JSON.parse(cached);
                        const twoHours = 2 * 60 * 60 * 1000;
                        if (Date.now() - parsed.timestamp < twoHours - 30000) {
                            await fetchWithSignature(parsed, cachedWallet);
                            return;
                        }
                        sessionStorage.removeItem(`${prefix}${cachedWallet}${suffix}`);
                    } catch {
                        sessionStorage.removeItem(`${prefix}${cachedWallet}${suffix}`);
                    }
                }

                if (connecting) {
                    return; // Wait for auto-connect
                }

                if (!connected || !publicKey) {
                    // Prevent showing "Sign In" prematurely if SessionRestoreHandler is about to auto-connect
                    try {
                        const walletName = localStorage.getItem("cv_wallet_name");
                        const exp = localStorage.getItem("cv_session_exp");
                        if (walletName && exp && Date.now() < parseInt(exp)) {
                            // Wait for WalletProvider's SessionRestoreHandler to kick in
                            return;
                        }
                    } catch (e) {}

                    setLoading(false);
                    setNeedsAuth(false);
                    setData(null);
                    setError(null);
                    return;
                }

                setNeedsAuth(true);
                setLoading(false);
            } catch (err) {
                console.error("Dashboard init error:", err);
                setLoading(false);
            }
        }

        initDashboard();
    }, [slug, connected, publicKey, isGoogleUser, googleSession?.access_token]);

    const handleAuthorize = async () => {
        if (!publicKey || !signMessage) return;
        setLoading(true);
        setNeedsAuth(false);
        try {
            const { signChainVolioAction } = await import("@/lib/wallet-utils");
            // forceFresh=true so the user always consciously signs when they click "Authorize"
            const signedAction = await signChainVolioAction({ publicKey, signMessage } as any, "view_dashboard", slug, { forceFresh: true });

            if (signedAction) {
                await fetchWithSignature(signedAction);
            } else {
                setNeedsAuth(true);
            }
        } catch (err) {
            setError("Authorization failed.");
        } finally {
            setLoading(false);
        }
    };

    const fetchWithSignature = async (signedAction: any, fallbackWallet?: string) => {
        const walletToUse = publicKey?.toBase58() || fallbackWallet;
        if (!walletToUse) return;
        try {
            const searchParams = new URLSearchParams({
                t: Date.now().toString(),
                wallet: walletToUse,
                signature: signedAction.signature,
                nonce: signedAction.nonce,
                timestamp: signedAction.timestamp.toString()
            });

            const res = await fetch(`/api/hiring/collections/${slug}/candidates?${searchParams.toString()}`, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' }
            });

            const result = await res.json();
            if (res.ok) {
                setData(result);
                setNeedsAuth(false);
            } else {
                if (res.status === 401) {
                    const canonicalKey = `cv_sig_view_dashboard_${walletToUse}_${slug}`;
                    sessionStorage.removeItem(canonicalKey);
                    setError(result.error || "Signature verification failed.");
                    setNeedsAuth(true);
                } else {
                    setError(result.error || "Failed to load dashboard.");
                }
            }
        } catch (err) {
            setError("Network error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const fetchWithGoogleSession = async (accessToken: string) => {
        try {
            const res = await fetch(`/api/hiring/collections/${slug}/candidates?t=${Date.now()}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const result = await res.json();
            if (res.ok) {
                setData(result);
                setNeedsAuth(false);
            } else {
                setError(result.error || "Failed to load dashboard.");
            }
        } catch {
            setError("Network error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (isGoogleUser && googleSession?.access_token) {
            setIsDeleting(true);
            try {
                const res = await fetch(`/api/hiring/collections/${slug}`, {
                    method: "DELETE",
                    headers: { 'Authorization': `Bearer ${googleSession.access_token}` }
                });
                if (res.ok) {
                    router.push("/hiring/create");
                } else {
                    const result = await res.json();
                    setToast({ message: `Failed to delete: ${result.error}`, type: "error" });
                }
            } catch {
                setToast({ message: "An error occurred while deleting.", type: "error" });
            } finally {
                setIsDeleting(false);
                setShowDeleteModal(false);
            }
            return;
        }
        if (!publicKey || !signMessage) return;
        setIsDeleting(true);
        try {
            const { signChainVolioAction } = await import("@/lib/wallet-utils");
            const signedAction = await signChainVolioAction({ publicKey, signMessage } as any, "update_profile");

            if (!signedAction) {
                setIsDeleting(false);
                return;
            }

            const searchParams = new URLSearchParams({
                wallet: publicKey.toBase58(),
                signature: signedAction.signature,
                nonce: signedAction.nonce,
                timestamp: signedAction.timestamp.toString()
            });

            const res = await fetch(`/api/hiring/collections/${slug}?${searchParams.toString()}`, {
                method: "DELETE",
            });

            if (res.ok) {
                router.push("/hiring/create");
            } else {
                const result = await res.json();
                setToast({ message: `Failed to delete: ${result.error}`, type: "error" });
            }
        } catch (err) {
            console.error("Delete error:", err);
            setToast({ message: "An error occurred while deleting.", type: "error" });
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    // Feature: Manage Candidate Status & Notes
    const [noteDraft, setNoteDraft] = useState("");
    const [isSavingNote, setIsSavingNote] = useState(false);

    // Sync note draft when expanding a candidate
    useEffect(() => {
        if (expandedId && data) {
            const candidate = data.candidates.find(c => c.id === expandedId);
            setNoteDraft(candidate?.recruiterNotes || "");
        }
    }, [expandedId, data]);

    const handleUpdateStatus = async (candidateId: string, newStatus: string, skipConfirm = false) => {
        const candidate = data?.candidates.find(c => c.id === candidateId);
        const oldStatus = candidate?.recruiterStatus;

        // On-chain "hired" action requires a wallet — Google users can't do this
        if (newStatus === 'hired' && isGoogleUser) {
            setToast({ message: "On-chain hiring proof requires a connected Solana wallet.", type: "warning" });
            return;
        }

        if (!isGoogleUser && !connected) {
            setIsWalletModalOpen(true);
            return;
        }

        if (!isGoogleUser && (!publicKey || !signMessage)) return;

        // If it's a 'hired' action and not yet confirmed, trigger modal
        if (newStatus === 'hired' && !skipConfirm) {
            setCandidateToHire(candidateId);
            return;
        }

        // Google user path for workflow actions (shortlist/reject/pending)
        if (isGoogleUser && googleSession?.access_token) {
            const isWorkflowAction = ["shortlisted", "rejected", "pending"].includes(newStatus);
            if (!isWorkflowAction) {
                setToast({ message: "This action requires a connected wallet.", type: "warning" });
                return;
            }
            setProcessingId(candidateId);
            setData(prev => {
                if (!prev) return null;
                return { ...prev, candidates: prev.candidates.map(c => c.id === candidateId ? { ...c, recruiterStatus: newStatus } : c) };
            });
            try {
                const res = await fetch(`/api/hiring/submissions/${candidateId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${googleSession.access_token}` },
                    body: JSON.stringify({ status: newStatus }),
                });
                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error?.message || errData.message || "Status update failed");
                }
                if (newStatus === 'shortlisted') setToast({ message: "Candidate Shortlisted", type: "success" });
                else if (newStatus === 'rejected') setToast({ message: "Candidate Rejected", type: "success" });
            } catch (err: any) {
                setToast({ message: `Status update failed: ${err.message}`, type: "error" });
                setData(prev => {
                    if (!prev) return null;
                    return { ...prev, candidates: prev.candidates.map(c => c.id === candidateId ? { ...c, recruiterStatus: oldStatus } : c) };
                });
            } finally {
                setProcessingId(null);
                setCandidateToHire(null);
            }
            return;
        }

        setProcessingId(candidateId);

        // Optimistic update
        setData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                candidates: prev.candidates.map(c =>
                    c.id === candidateId ? { ...c, recruiterStatus: newStatus } : c
                )
            };
        });

        try {
            let txSignature = null;

            // Only trigger on-chain transaction for 'hired' status
            if (newStatus === 'hired') {
                if (!sendTransaction) throw new Error("Wallet not connected");

                // 1. Prepare data and generate hash
                const reviewData = {
                    submissionId: candidateId,
                    recruiterWallet: publicKey!.toBase58(),
                    candidateWallet: candidate?.wallet,
                    organization: data?.collection.title,
                    role: candidate?.role,
                    status: "HIRED",
                    timestamp: Date.now()
                };
                const dataHash = await generateReviewHash(reviewData);

                // 2. Create and Send On-Chain Transaction
                const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com");
                const transaction = new Transaction();
                const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

                transaction.add(
                    new TransactionInstruction({
                        keys: [],
                        programId: MEMO_PROGRAM_ID,
                        data: Buffer.from(JSON.stringify({
                            app: "ChainVolio",
                            type: "recruiter_review",
                            target: "hiring_decision",
                            hash: dataHash,
                            hashFields: reviewData, // Include the fields that were hashed for transparency
                            timestamp: reviewData.timestamp
                        })) as any,
                    })
                );

                const txSig = await sendTransaction(transaction, connection, { maxRetries: 5 });
                txSignature = txSig.replace(/\s/g, '');
                console.log("On-chain hiring proof created:", txSignature);

                // Wait for confirmation with resilience
                try {
                    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
                    await connection.confirmTransaction({
                        signature: txSignature,
                        blockhash,
                        lastValidBlockHeight
                    }, 'confirmed');
                } catch (confErr: any) {
                    console.warn("Standard confirmation failed or timed out. Checking network manually...", confErr);
                    let confirmed = false;
                    for (let i = 0; i < 30; i++) {
                        const status = await connection.getSignatureStatus(txSignature, { searchTransactionHistory: true });
                        if (status.value && (status.value.confirmationStatus === 'confirmed' || status.value.confirmationStatus === 'finalized')) {
                            confirmed = true;
                            break;
                        }
                        await new Promise(r => setTimeout(r, 2000));
                    }
                    if (!confirmed) {
                        const finalStatus = await connection.getSignatureStatus(txSignature, { searchTransactionHistory: true });
                        if (!finalStatus.value) {
                            throw new Error("Transaction expired or was dropped. Please try again.");
                        }
                    }
                }
            }

            // 3. Submit to API with TX Signature (if any)
            const res = await fetch(`/api/hiring/submissions/${candidateId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: newStatus,
                    wallet: publicKey!.toBase58(),
                    txSignature
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error?.message || errData.message || "Status update failed");
            }

            // Update local state with the final result including txSignature
            setData(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    candidates: prev.candidates.map(c =>
                        c.id === candidateId ? { 
                            ...c, 
                            recruiterStatus: newStatus,
                            recruiterTxSignature: txSignature || c.recruiterTxSignature 
                        } : c
                    )
                };
            });

            // Show success MODAL for hired
            if (newStatus === 'hired' && txSignature) {
                setHiringSuccess({ 
                    txSignature, 
                    candidateName: candidate?.displayName || candidate?.wallet?.slice(0, 8) || "Candidate" 
                });
            } else if (newStatus === 'shortlisted') {
                setToast({ message: "Candidate Shortlisted", type: "success" });
            } else if (newStatus === 'rejected') {
                setToast({ message: "Candidate Rejected", type: "success" });
            }
        } catch (err: any) {
            console.error("Failed to update status", err);
            setToast({ message: `Status update failed: ${err.message}`, type: "error" });
            // Revert on error
            setData(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    candidates: prev.candidates.map(c =>
                        c.id === candidateId ? { ...c, recruiterStatus: oldStatus } : c
                    )
                };
            });
        } finally {
            setProcessingId(null);
            setCandidateToHire(null); 
        }
    };

    const handleSaveNote = async () => {
        if (!expandedId) return;
        if (!isGoogleUser && !connected) {
            setIsWalletModalOpen(true);
            return;
        }
        if (!isGoogleUser && !publicKey) return;

        const oldNote = data?.candidates.find(c => c.id === expandedId)?.recruiterNotes;
        if (oldNote === noteDraft) return;

        setIsSavingNote(true);

        setData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                candidates: prev.candidates.map(c =>
                    c.id === expandedId ? { ...c, recruiterNotes: noteDraft } : c
                )
            };
        });

        const headers: Record<string, string> = { "Content-Type": "application/json" };
        const body: Record<string, any> = { notes: noteDraft };

        if (isGoogleUser && googleSession?.access_token) {
            headers["Authorization"] = `Bearer ${googleSession.access_token}`;
        } else {
            body.wallet = publicKey!.toBase58();
        }

        try {
            const res = await fetch(`/api/hiring/submissions/${expandedId}`, {
                method: "PATCH",
                headers,
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error?.message || errData.message || "Failed to save note");
            }
        } catch (err: any) {
            console.error("Failed to save note", err);
            setToast({ message: `Note save failed: ${err.message}`, type: "error" });
            // Revert
            setData(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    candidates: prev.candidates.map(c =>
                        c.id === expandedId ? { ...c, recruiterNotes: oldNote } : c
                    )
                };
            });
            setNoteDraft(oldNote || "");
        } finally {
            setIsSavingNote(false);
        }
    };

    // Derived filtered & sorted list
    const filteredCandidates = useMemo(() => {
        if (!data) return [];

        let list = [...data.candidates];

        // Search (Name or Org)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            list = list.filter(c =>
                (c.displayName?.toLowerCase().includes(term)) ||
                (c.attestedOrgs?.some((o: string) => o.toLowerCase().includes(term))) ||
                (c.wallet?.toLowerCase().includes(term))
            );
        }

        // Role Filter
        if (roleFilter !== "all") {
            list = list.filter(c => c.role?.toLowerCase().includes(roleFilter.toLowerCase()));
        }

        // Attested Only
        if (attestedOnly) {
            list = list.filter(c => c.attestedCount > 0);
        }

        // Feature 4: Spam Filter (Hide Low Signal)
        if (spamFilter) {
            list = list.filter(c => c.signalStrength !== 'Low');
        }

        // Focus Match Filter
        if (focusMatchOnly) {
            list = list.filter(c => c.signalMatch);
        }

        // Sorting — rejected candidates always sink to bottom regardless of sort mode
        list.sort((a, b) => {
            const aRejected = a.recruiterStatus === 'rejected' ? 1 : 0;
            const bRejected = b.recruiterStatus === 'rejected' ? 1 : 0;
            if (aRejected !== bRejected) return aRejected - bRejected;

            const dateA = a.lastActive ? new Date(a.lastActive).getTime() : 0;
            const dateB = b.lastActive ? new Date(b.lastActive).getTime() : 0;

            if (sortBy === "best_fit") return (b.fitScore || 0) - (a.fitScore || 0) || (b.signalScore || 0) - (a.signalScore || 0);
            if (sortBy === "recent") return dateB - dateA;
            if (sortBy === "attestations") return (b.attestedCount || 0) - (a.attestedCount || 0);
            if (sortBy === "total_proof") return (b.powCount || 0) - (a.powCount || 0);
            return 0;
        });

        return list;
    }, [data, searchTerm, roleFilter, attestedOnly, spamFilter, focusMatchOnly, sortBy]);

    const uniqueRoles = useMemo(() => {
        if (!data) return [];
        const roles = data.candidates.map(c => c.role).filter(Boolean);
        return Array.from(new Set(roles));
    }, [data]);

    const handleDownloadReport = async () => {
        if (!data || !data.candidates.length) return;
        
        setToast({ message: "Generating Hiring Intelligence Report...", type: "success" });
        
        try {
            // Generate PDF Intelligence Report
            await generateHiringReport(data);
            
            setToast({ message: "Report generated successfully", type: "success" });
        } catch (err) {
            console.error("Report generation failed:", err);
            setToast({ message: "Failed to generate report", type: "error" });
        }
    };



    // Feature: Candidate Actions Dropdown
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // Close dropdown when interacting outside (simple implementation)
    useEffect(() => {
        const closeDropdown = () => setActiveDropdown(null);
        if (activeDropdown) {
            window.addEventListener('click', closeDropdown);
        }
        return () => window.removeEventListener('click', closeDropdown);
    }, [activeDropdown]);

    const handleDeleteCandidate = async () => {
        if (!candidateToDelete) return;
        if (isGoogleUser) {
            setToast({ message: "Removing candidates requires a connected Solana wallet for on-chain proof.", type: "warning" });
            setCandidateToDelete(null);
            return;
        }
        if (!publicKey || !signMessage) return;

        const candidateId = candidateToDelete;
        const oldCandidates = [...(data?.candidates || [])];

        // Optimistic update
        setData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                candidates: prev.candidates.filter(c => c.id !== candidateId)
            };
        });

        try {
            // 1. Prepare data and generate hash
            const reviewData = {
                submissionId: candidateId,
                recruiterWallet: publicKey.toBase58(),
                action: "delete_candidate",
                timestamp: Date.now()
            };
            const dataHash = await generateReviewHash(reviewData);

            // 2. Create and Send On-Chain Transaction
            const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com");
            const transaction = new Transaction();
            const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

            transaction.add(
                new TransactionInstruction({
                    keys: [], // Memo V3/V2 doesn't require signer keys in the instruction unless for specific logic
                    programId: MEMO_PROGRAM_ID,
                    data: Buffer.from(JSON.stringify({
                        app: "ChainVolio",
                        type: "recruiter_review",
                        target: "delete_candidate",
                        hash: dataHash,
                        hashFields: reviewData, // Include the fields that were hashed for transparency
                        timestamp: reviewData.timestamp
                    })) as any,
                })
            );

            const txSig = await sendTransaction(transaction, connection, { maxRetries: 5 });
            const txSignature = txSig.replace(/\s/g, ''); // Clean any accidental whitespace
            console.log("On-chain delete record created:", txSignature);

            // Wait for confirmation with resilience
            try {
                const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
                await connection.confirmTransaction({
                    signature: txSignature,
                    blockhash,
                    lastValidBlockHeight
                }, 'confirmed');
            } catch (confErr: any) {
                console.warn("Standard confirmation failed or timed out. Checking network manually...", confErr);
                let confirmed = false;
                for (let i = 0; i < 30; i++) {
                    const status = await connection.getSignatureStatus(txSignature, { searchTransactionHistory: true });

                    if (status.value) {
                        if (status.value.err) {
                            throw new Error(`Transaction failed during execution: ${JSON.stringify(status.value.err)}`);
                        }
                        if (status.value.confirmationStatus === 'confirmed' || status.value.confirmationStatus === 'finalized') {
                            confirmed = true;
                            break;
                        }
                    }
                    await new Promise(r => setTimeout(r, 2000));
                }
                if (!confirmed) {
                    const finalStatus = await connection.getSignatureStatus(txSignature, { searchTransactionHistory: true });
                    if (finalStatus.value?.err) {
                        throw new Error(`Transaction landed but FAILED: ${JSON.stringify(finalStatus.value.err)}`);
                    }
                    if (!finalStatus.value || (finalStatus.value.confirmationStatus !== 'confirmed' && finalStatus.value.confirmationStatus !== 'finalized')) {
                        throw new Error("Transaction failed to confirm in time. (Network Timeout)");
                    }
                }
            }

            const searchParams = new URLSearchParams({
                wallet: publicKey.toBase58(),
                txSignature
            });

            const res = await fetch(`/api/hiring/submissions/${candidateId}?${searchParams.toString()}`, {
                method: "DELETE"
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to delete candidate");
            }

            setToast({ message: "Candidate archived successfully.", type: "success" });
        } catch (err: any) {
            console.error("Failed to delete candidate", err);
            setToast({ message: `Delete failed: ${err.message}`, type: "error" });
            // Revert
            setData(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    candidates: oldCandidates
                };
            });
        } finally {
            setCandidateToDelete(null);
        }
    };

    const DashboardNav = () => (
        <nav className="border-b border-white/5 bg-black/60 backdrop-blur-md sticky top-0 z-[100]">
            <div className="max-w-[1600px] mx-auto px-8 h-12 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <img src="/chainvolio%20logo.png" alt="ChainVolio" className="w-6 h-6 object-contain" />
                    <span className="text-sm font-bold text-white">ChainVolio</span>
                </Link>
                <WalletMultiButton />
            </div>
        </nav>
    );

    if (loading || googleLoading) {
        return (
            <div className="min-h-screen bg-black theme-bg-page theme-aware flex flex-col">
                <DashboardNav />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500/20" />
                </div>
            </div>
        );
    }

    if (!connected && !publicKey && !isGoogleSignedIn) return (
        <div className="min-h-screen flex flex-col bg-[#0a0a0b] text-white">
            <DashboardNav />
            <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="bg-[#121214] border border-white/5 rounded-2xl p-10 max-w-md w-full text-center shadow-2xl space-y-8">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto border border-indigo-500/20">
                        <Users className="w-10 h-10 text-indigo-500" />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-2xl font-bold">Sign In to Continue</h1>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Access your hiring dashboard with a wallet or Google account.
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <WalletMultiButton />
                        <p className="text-xs text-slate-600">or</p>
                        <button
                            onClick={() => supabaseAuth?.auth.signInWithOAuth({
                                provider: "google",
                                options: { redirectTo: typeof window !== "undefined" ? window.location.href : undefined }
                            })}
                            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-white transition-colors"
                        >
                            Sign in with Google
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (needsAuth) return (
        <div className="min-h-screen flex flex-col bg-[#0a0a0b] text-white">
            <DashboardNav />
            <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="bg-[#121214] border border-white/5 rounded-2xl p-10 max-w-md w-full text-center shadow-2xl space-y-8">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto border border-indigo-500/20">
                        <Lock className="w-10 h-10 text-indigo-500" />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-2xl font-bold">Secure Dashboard</h1>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            To protect sensitive candidate data, please authorize restricted access with your recruiter wallet signature.
                        </p>
                        {error && (
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold">
                                 {error}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleAuthorize}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/10 flex items-center justify-center gap-3"
                    >
                        <ShieldCheck className="w-4 h-4" /> Authorize Session
                    </button>
                    <div className="pt-2">
                        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Connected: {publicKey?.toBase58().slice(0,4)}...{publicKey?.toBase58().slice(-4)}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col bg-[#0a0a0b] text-white">
            <DashboardNav />
            <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="bg-[#121214] border border-white/5 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p className="text-slate-400 mb-8">{error}</p>
                    <Link href="/hiring/create" className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-bold transition-all w-full block">
                        Back to Hiring Center
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-screen overflow-hidden text-white pt-[96px]" style={{ background: "#000000" }}>
            <Navbar />
            {/* Noise texture */}
            <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            {/* ── 3-PANEL BODY ── */}
            <div className="flex-1 overflow-hidden min-h-0 px-4 md:px-12 pt-3 pb-3 flex flex-col">
                <div className="flex flex-1 overflow-hidden min-h-0 w-full max-w-[1380px] mx-auto rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>

                    {/* ── LEFT SIDEBAR ── */}
                    <aside className="hidden md:flex w-[240px] flex-shrink-0 flex-col overflow-y-auto" style={{ background: "#0d0d10", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                        {/* Logo / Brand */}
                        <div className="flex items-center px-4 h-[46px] flex-shrink-0 relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                <div className="animate-lightning-shine absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
                            </div>
                            <img src="/chainvolio%20logo.png" alt="chainvolio" style={{ height: 18, width: "auto", objectFit: "contain" }} />
                            <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.88)", marginLeft: 6, letterSpacing: "-0.01em" }}>chainvolio</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(99,102,241,0.65)", marginLeft: 4 }}>secure</span>
                        </div>

                        {/* Collection info */}
                        <div className="px-4 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.22)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>Active Collection</p>
                            <h1 style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.88)", lineHeight: 1.4 }}>{data?.collection.title}</h1>
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                {data?.collection.metadata?.roleType && (
                                    <span style={{ fontSize: 9, fontWeight: 800, color: "rgba(99,102,241,0.7)", background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.14)", padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                        {data.collection.metadata.roleType}
                                    </span>
                                )}
                                <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(52,211,153,0.7)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                    {data?.collection.metadata?.salary || "Competitive"}
                                </span>
                            </div>
                        </div>

                        {/* Pipeline stats */}
                        <div className="px-3 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.22)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10, paddingLeft: 12 }}>Pipeline Overview</p>
                            <div className="space-y-1.5">
                                {[
                                    { label: "Pipeline Depth", value: String(data?.candidates?.length || 0), Icon: Users, color: "rgba(96,165,250,0.75)", desc: "Total applications" },
                                    { label: "Authority Rate", value: `${data?.candidates?.length ? ((data.candidates.filter((c: any) => c.attestedCount > 0).length) / data.candidates.length * 100).toFixed(0) : 0}%`, Icon: ShieldCheck, color: "rgba(52,211,153,0.75)", desc: "Attested portfolios" },
                                    { label: "Signal Density", value: data?.candidates?.length ? (data.candidates.reduce((acc: number, c: any) => acc + (c.powCount || 0), 0) / data.candidates.length).toFixed(1) : "0.0", Icon: Briefcase, color: "rgba(129,140,248,0.75)", desc: "Avg. proof volume" },
                                    { label: "Network Breadth", value: String(new Set(data?.candidates.flatMap((c: any) => c.attestedOrgs)).size), Icon: Building2, color: "rgba(251,191,36,0.75)", desc: "Verified partners" },
                                ].map((stat, i) => (
                                    <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                                        <div className="flex items-center gap-2.5">
                                            <stat.Icon style={{ width: 12, height: 12, color: stat.color, flexShrink: 0 }} />
                                            <div>
                                                <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.38)", lineHeight: 1.2 }}>{stat.label}</p>
                                                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.18)", lineHeight: 1.3 }}>{stat.desc}</p>
                                            </div>
                                        </div>
                                        <span style={{ fontSize: 17, fontWeight: 700, color: "rgba(255,255,255,0.8)", fontVariantNumeric: "tabular-nums" }}>{stat.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Focus areas + deadline */}
                        {(data?.collection.metadata?.focusAreas?.length > 0 || data?.collection.metadata?.deadline) && (
                            <div className="px-4 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                {data?.collection.metadata?.focusAreas?.length > 0 && (
                                    <div className="mb-4">
                                        <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.22)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>Focus Areas</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {data?.collection.metadata?.focusAreas?.map((area: string) => {
                                                const focusLabel: Record<string, string> = { on_chain: "On-Chain", github: "GitHub", dao: "DAO", hackathon: "Hackathon", nft: "NFT" };
                                                return (
                                                    <span key={area} style={{ fontSize: 9, fontWeight: 800, color: "rgba(99,102,241,0.6)", background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.1)", padding: "2px 7px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                                        {focusLabel[area] || area}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {data?.collection.metadata?.deadline && (
                                    <div className="flex items-center gap-2">
                                        <CalendarDays style={{ width: 11, height: 11, color: "rgba(255,255,255,0.28)", flexShrink: 0 }} />
                                        <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                            Deadline: <span style={{ color: "rgba(255,255,255,0.5)" }}>{new Date(data.collection.metadata.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="px-3 py-4 flex-1">
                            <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.22)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8, paddingLeft: 12 }}>Actions</p>
                            <nav className="space-y-0.5">
                                <Link
                                    href={`/r/${slug}`}
                                    className="w-full flex items-center gap-2.5 px-3 py-[7px] rounded-md"
                                    style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.14)" }}
                                >
                                    <ExternalLink style={{ width: 12, height: 12, color: "rgba(99,102,241,0.8)", flexShrink: 0 }} />
                                    <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(99,102,241,0.8)" }}>View Public Link</span>
                                </Link>
                                <button
                                    onClick={handleDownloadReport}
                                    className="w-full flex items-center gap-2.5 px-3 py-[7px] rounded-md transition-all hover:bg-white/[0.03] text-left"
                                >
                                    <Download style={{ width: 12, height: 12, color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                                    <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.38)" }}>Download Report</span>
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    disabled={isDeleting}
                                    className="w-full flex items-center gap-2.5 px-3 py-[7px] rounded-md transition-all hover:bg-red-500/[0.04] text-left disabled:opacity-40"
                                >
                                    {isDeleting ? <Loader2 style={{ width: 12, height: 12, color: "rgba(239,68,68,0.5)", flexShrink: 0 }} className="animate-spin" /> : <Trash2 style={{ width: 12, height: 12, color: "rgba(239,68,68,0.5)", flexShrink: 0 }} />}
                                    <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(239,68,68,0.5)" }}>Terminate Collection</span>
                                </button>
                            </nav>
                        </div>

                        {/* Profile Area */}
                        {isGoogleUser ? (
                            <div className="px-3 pb-4 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                <WalletMultiButton />
                            </div>
                        ) : (
                            <div className="px-5 pb-5 pt-4 flex items-center gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 overflow-hidden flex items-center justify-center border border-indigo-500/30">
                                    {data?.profile?.avatar_url ? (
                                        <img src={data.profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-4 h-4 text-indigo-400" />
                                    )}
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-[11px] font-bold text-white truncate">{data?.profile?.display_name || "Recruiter"}</span>
                                    <span className="text-[9px] text-slate-500 truncate">{data?.profile?.wallet_address ? `${data.profile.wallet_address.slice(0,6)}...${data.profile.wallet_address.slice(-4)}` : "Wallet Connected"}</span>
                                </div>
                            </div>
                        )}
                    </aside>

                    {/* ── CENTER PANEL ── */}
                    <div className="flex-1 overflow-hidden min-h-0 flex flex-col" style={{ background: "#0a0b0e" }}>
                        {/* Top bar */}
                        <div className="flex items-center justify-between px-5 h-[46px] flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#0a0b0e" }}>
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.88)", lineHeight: 1 }}>Candidate Pipeline</p>
                                <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.28)", marginTop: 2 }}>{filteredCandidates.length} of {data?.candidates?.length || 0} candidates shown</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="md:hidden text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{data?.collection.title}</span>
                                <div className="md:hidden">
                                    {isGoogleUser && <WalletMultiButton />}
                                </div>
                            </div>
                        </div>

                        {/* Scrollable content */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">

                            {/* Filters Bar */}
                            <div className="rounded-xl p-4 mb-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    <div className="flex-1 relative group">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Search by name, wallet address, or organization..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-black/40 border border-white/[0.05] rounded-xl pl-11 pr-4 py-2 text-[13px] focus:border-indigo-400/30 transition-all text-slate-200 placeholder:text-slate-600 outline-none"
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="flex items-center gap-2 bg-black/20 border border-white/[0.05] rounded-xl px-3 py-1.5">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</span>
                                            <select
                                                value={roleFilter}
                                                onChange={(e) => setRoleFilter(e.target.value)}
                                                className="bg-[#121215] text-[11px] font-bold text-slate-300 outline-none cursor-pointer focus:text-white transition-colors"
                                            >
                                                <option value="all" className="bg-[#121215] text-white">ALL</option>
                                                {uniqueRoles.map((role: string) => (
                                                    <option key={role} value={role} className="bg-[#121215] text-white">
                                                        {role.toUpperCase()}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-2 bg-black/20 border border-white/[0.05] rounded-xl px-3 py-1.5">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sort</span>
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className="bg-[#121215] text-[11px] font-bold text-slate-300 outline-none cursor-pointer focus:text-white transition-colors"
                                            >
                                                <option value="best_fit" className="bg-[#121215] text-white">BEST FIT</option>
                                                <option value="recent" className="bg-[#121215] text-white">RECENCY</option>
                                                <option value="attestations" className="bg-[#121215] text-white">AUTHORITY</option>
                                                <option value="total_proof" className="bg-[#121215] text-white">VOLUME</option>
                                            </select>
                                        </div>

                                        <div className="h-6 w-[1px] bg-white/[0.05] mx-1" />

                                        <label className="flex items-center gap-2.5 cursor-pointer group px-2 py-1">
                                            <div className={`w-3.5 h-3.5 rounded border transition-all flex items-center justify-center ${attestedOnly ? 'bg-emerald-500 border-emerald-500' : 'border-white/[0.1] bg-black/40'}`}>
                                                {attestedOnly && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                            </div>
                                            <input type="checkbox" checked={attestedOnly} onChange={(e) => setAttestedOnly(e.target.checked)} className="hidden" />
                                            <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-200 uppercase tracking-widest transition-colors">Verified Only</span>
                                        </label>

                                        <label className="flex items-center gap-2.5 cursor-pointer group px-2 py-1 relative">
                                            <div className={`w-3.5 h-3.5 rounded border transition-all flex items-center justify-center ${spamFilter ? 'bg-red-500 border-red-500' : 'border-white/[0.1] bg-black/40'}`}>
                                                {spamFilter && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                            </div>
                                            <input type="checkbox" checked={spamFilter} onChange={(e) => setSpamFilter(e.target.checked)} className="hidden" />
                                            <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-200 uppercase tracking-widest transition-colors">High Signal Only</span>
                                        </label>

                                        <label className="flex items-center gap-2.5 cursor-pointer group px-2 py-1">
                                            <div className={`w-3.5 h-3.5 rounded border transition-all flex items-center justify-center ${focusMatchOnly ? 'bg-indigo-500 border-indigo-500' : 'border-white/[0.1] bg-black/40'}`}>
                                                {focusMatchOnly && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                            </div>
                                            <input type="checkbox" checked={focusMatchOnly} onChange={(e) => setFocusMatchOnly(e.target.checked)} className="hidden" />
                                            <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-200 uppercase tracking-widest transition-colors">Focus Match Only</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Candidates Table */}
                            <div className="rounded-xl overflow-hidden mb-4" style={{ background: "#000000", border: "1px solid rgba(255,255,255,0.04)" }}>
                                <table className="w-full text-left border-separate border-spacing-0">
                                    <thead>
                                        <tr className="bg-white/[0.01]">
                                            <th className="px-4 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-white/[0.03]">Candidate</th>
                                            <th className="px-4 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center border-b border-white/[0.03]">Confidence</th>
                                            <th className="px-4 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest hidden md:table-cell border-b border-white/[0.03]">Strategic Fit</th>
                                            <th className="px-4 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center border-b border-white/[0.03]">Authority</th>
                                            <th className="px-4 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest hidden lg:table-cell border-b border-white/[0.03]">Trust</th>
                                            <th className="px-4 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-white/[0.03]">Activity</th>
                                            <th className="px-4 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-right border-b border-white/[0.03]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.02]">
                            {filteredCandidates.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-2">
                                                <Search className="w-6 h-6 text-slate-700" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">No Profiles Found</p>
                                                <p className="text-slate-600 text-[11px]">Adjust your calibration to discover more candidates.</p>
                                            </div>
                                            <button onClick={() => { setSearchTerm(""); setRoleFilter("all"); setAttestedOnly(false); setSpamFilter(false); setFocusMatchOnly(false); }} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-indigo-400 uppercase tracking-widest transition-all mt-4">Clear All Filters</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCandidates.map((candidate) => (
                                    <React.Fragment key={candidate.id}>
                                        <tr
                                            key={candidate.id}
                                            onClick={() => setExpandedId(expandedId === candidate.id ? null : candidate.id)}
                                            className={`group hover:bg-white/[0.01] transition-all cursor-pointer border-b border-white/[0.02] relative ${expandedId === candidate.id ? 'bg-[#121214] border-indigo-500/30' : ''} ${candidate.recruiterStatus === 'rejected' ? 'opacity-40 grayscale-[0.8]' : ''}`}
                                        >
                                            <td className="px-4 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative flex-shrink-0">
                                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-white/[0.08] flex items-center justify-center overflow-hidden shadow-sm shadow-indigo-500/5 group-hover:border-indigo-500/20 transition-all duration-300">
                                                            {candidate.avatarUrl ? (
                                                                <img src={candidate.avatarUrl} alt="" className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all" />
                                                            ) : (
                                                                <span className="text-[10px] font-black text-indigo-400 font-mono italic opacity-60 uppercase">{candidate.wallet.slice(0, 2)}</span>
                                                            )}
                                                        </div>
                                                        {candidate.recruiterStatus === 'shortlisted' && (
                                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#121215] shadow-lg shadow-emerald-500/20"></div>
                                                        )}
                                                        {candidate.recruiterStatus === 'rejected' && (
                                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#121215] shadow-lg shadow-red-500/20"></div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-1.5 overflow-hidden">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[13px] font-bold tracking-tight transition-colors truncate max-w-[140px] md:max-w-[200px] ${candidate.recruiterStatus === 'rejected' ? 'text-slate-600' : 'text-white'}`}>
                                                                {candidate.displayName || "Anonymous Professional"}
                                                            </span>
                                                            {candidate.cardNumber && (
                                                                <span className="text-[9px] font-mono text-slate-500 font-bold bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                                                    #{String(candidate.cardNumber).padStart(5, '0')}
                                                                </span>
                                                            )}
                                                            {candidate.attestedCount > 0 && (
                                                                <div className="group/shield relative">
                                                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/80" />
                                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-24 bg-black border border-white/5 rounded px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-emerald-400 opacity-0 group-hover/shield:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                                                        Attested
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            <span className="text-[9px] font-mono text-slate-500 truncate max-w-[100px] hover:text-slate-300 transition-colors uppercase select-none">
                                                                {candidate.wallet.slice(0, 6)}...{candidate.wallet.slice(-4)}
                                                            </span>
                                                            {candidate.snapshotTags?.slice(0, 2).map((tag: string) => (
                                                                <span key={tag} className="px-1.5 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.04] text-[9px] font-black text-slate-500 uppercase tracking-wider">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-5 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className={`px-2.5 py-1 rounded-md text-[9px] font-black tracking-[0.15em] uppercase border ${candidate.signalStrength === 'Strong' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/5' : candidate.signalStrength === 'Medium' ? 'bg-amber-400/10 text-amber-400 border-amber-400/20 shadow-sm shadow-amber-400/5' : 'bg-slate-900 text-slate-600 border-white/[0.03]'}`}>
                                                        {candidate.signalStrength === 'Strong' && "HIGH CONFIDENCE"}
                                                        {candidate.signalStrength === 'Medium' && "CALIBRATED"}
                                                        {candidate.signalStrength === 'Low' && "LOW SIGNAL"}
                                                    </div>
                                                    <div className="w-16 h-1 bg-white/[0.02] rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all duration-700 ${candidate.signalStrength === 'Strong' ? 'bg-emerald-500/50' : candidate.signalStrength === 'Medium' ? 'bg-amber-400/50' : 'bg-red-500/30'}`} style={{ width: `${candidate.signalScore}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-5 hidden md:table-cell">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-bold text-slate-200 capitalize truncate max-w-[180px]">{candidate.role}</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">{candidate.primarySignal || "Standard Contribution"}</span>
                                                        {candidate.signalMatch && (
                                                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-400 uppercase tracking-widest">MATCH</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-5">
                                                <div className="flex items-center justify-center gap-6">
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <span className="text-sm font-black text-white font-mono">{candidate.powCount}</span>
                                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">PROOFS</span>
                                                    </div>
                                                    <div className="w-[1px] h-6 bg-white/[0.04]" />
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <span className={`text-sm font-black font-mono transition-colors ${candidate.attestedCount > 0 ? 'text-emerald-400' : 'text-slate-700'}`}>{candidate.attestedCount}</span>
                                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">ATTESTED</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-5 hidden lg:table-cell">
                                                <div className="flex flex-wrap gap-2 max-w-[280px]">
                                                    {candidate.attestedOrgs.slice(0, 2).map((org: string) => (
                                                        <div key={org} className="px-2.5 py-1 bg-white/[0.03] border border-white/[0.04] rounded-md flex items-center gap-1.5 shadow-sm">
                                                            <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest truncate max-w-[90px]">{org}</span>
                                                        </div>
                                                    ))}
                                                    {candidate.attestedOrgs.length > 2 && (
                                                        <div className="px-2 py-1 bg-white/[0.02] border border-white/[0.04] rounded-md">
                                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">+{candidate.attestedOrgs.length - 2}</span>
                                                        </div>
                                                    )}
                                                    {candidate.attestedOrgs.length === 0 && (
                                                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest italic select-none">No Verified Anchors</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-5">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Clock className="w-3 h-3 opacity-50" />
                                                    <span className="text-[11px] font-bold font-mono tracking-tight">{new Date(candidate.lastActive).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link
                                                        href={`/cv/${candidate.wallet}`}
                                                        target="_blank"
                                                        className="p-2 hover:bg-indigo-500/5 rounded-lg transition-all text-slate-600 hover:text-indigo-400 group/btn"
                                                        onClick={(e) => e.stopPropagation()}
                                                        title="Strategic Review"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <button
                                                        className="p-2 hover:bg-red-500/5 rounded-lg transition-all text-slate-600 hover:text-red-400 group/btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCandidateToDelete(candidate.id);
                                                        }}
                                                        title="Archive Decision"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {expandedId === candidate.id && (
                                            <tr className="bg-black/50 backdrop-blur-sm">
                                                <td colSpan={7} className="px-6 md:px-10 py-10 border-l-[3px] border-indigo-500/50 relative overflow-hidden">
                                                    {/* Background Pattern */}
                                                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6366f1 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>

                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative z-10">
                                                        {/* Separator Line with soft glow */}
                                                        <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 w-[1px] bg-white/[0.04] -translate-x-1/2 shadow-[0_0_15px_rgba(255,255,255,0.02)]"></div>

                                                        {/* Credentials Side */}
                                                        <div>
                                                            <div className="flex items-center justify-between mb-10">
                                                                <div className="flex flex-col gap-1">
                                                                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2.5">
                                                                        <Briefcase className="w-3.5 h-3.5 opacity-80" /> Candidate Intelligence
                                                                    </h4>
                                                                    <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest pl-6">Deep Signal Correlation</span>
                                                                </div>
                                                                <div className="flex flex-col items-end gap-1">
                                                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Member ID</span>
                                                                    <span className="text-[9px] font-mono text-indigo-500/50 uppercase">
                                                                        {candidate.cardNumber ? `#${String(candidate.cardNumber).padStart(5, '0')}` : `CV-${candidate.wallet.slice(0, 8)}`}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4">
                                                                {/* Bio & Skills from Snapshot */}
                                                                {(candidate.snapshotBio || candidate.snapshotSkills) && (
                                                                    <div className="p-5 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-3">
                                                                        {candidate.snapshotBio && (
                                                                            <div className="flex items-start gap-3">
                                                                                <FileText className="w-3 h-3 text-slate-600 mt-0.5 shrink-0" />
                                                                                <p className="text-[12px] text-slate-400 leading-relaxed font-medium">{candidate.snapshotBio}</p>
                                                                            </div>
                                                                        )}
                                                                        {candidate.snapshotSkills && (
                                                                            <div className="flex flex-wrap gap-1.5 pl-6">
                                                                                {String(candidate.snapshotSkills).split(',').map((skill: string) => skill.trim()).filter(Boolean).map((skill: string) => (
                                                                                    <span key={skill} className="px-2 py-0.5 bg-white/[0.03] border border-white/[0.05] rounded text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                                                                        {skill}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {candidate.attestedCount > 0 ? (
                                                                    <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl relative overflow-hidden group/card">
                                                                        <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover/card:opacity-[0.08] transition-all duration-700 group-hover/card:scale-110">
                                                                            <ShieldCheck className="w-24 h-24 text-indigo-500" />
                                                                        </div>
                                                                        <div className="relative z-10">
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="h-[1px] w-3 bg-indigo-500/50"></div>
                                                                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Protocol Verified</p>
                                                                                </div>
                                                                                <Link href={`/cv/${candidate.wallet}`} target="_blank" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[8px] font-black text-indigo-400 uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-indigo-500/5 group/btn">
                                                                                    Dossier <ExternalLink className="w-2 h-2 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                                                                </Link>
                                                                            </div>
                                                                            <p className="text-[11px] font-bold text-white mb-1.5 leading-snug font-serif italic opacity-90 pr-10">"Consolidated professional authority anchored by immutable on-chain evidence."</p>
                                                                            <p className="text-[10px] text-slate-500 leading-relaxed max-w-sm font-medium pr-10">This professional has successfully correlated multiple high-authority signals.</p>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="p-6 border border-dashed border-white/[0.05] rounded-xl flex flex-col items-center text-center bg-black/10">
                                                                        <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center mb-3 text-slate-700 shadow-inner">
                                                                            <AlertCircle className="w-4 h-4" />
                                                                        </div>
                                                                        <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Signal Attenuation</h5>
                                                                        <p className="text-[10px] text-slate-600 leading-relaxed max-w-[280px] font-medium italic">No verified on-chain anchors detected. Manual verification is recommended.</p>
                                                                    </div>
                                                                )}

                                                                <div className="flex items-center justify-between px-5 py-3 bg-white/[0.01] border border-white/[0.03] rounded-xl">
                                                                    <div className="flex items-center gap-3">
                                                                        <Users className="w-3.5 h-3.5 text-slate-600" />
                                                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Network Consensus</span>
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-slate-300">{candidate.attestedOrgs.length > 0 ? `${candidate.attestedOrgs.length} Verified Relays` : "Organic Growth"}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Calibration Side */}
                                                        <div className="flex flex-col h-full">
                                                            <div className="flex items-center justify-between mb-10">
                                                                <div className="flex flex-col gap-1">
                                                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Pipeline Calibration</h4>
                                                                    <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Strategic Placement</span>
                                                                </div>
                                                                <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border ${candidate.recruiterStatus === 'hired' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                                    candidate.recruiterStatus === 'shortlisted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                                        candidate.recruiterStatus === 'rejected' ? 'bg-slate-800 text-slate-500 border-white/5' :
                                                                            'bg-slate-900 text-slate-600 border-white/[0.03]'
                                                                    }`}>
                                                                    {candidate.recruiterStatus ? candidate.recruiterStatus.toUpperCase() : 'UNDER REVIEW'}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4 flex-1 flex flex-col">
                                                                {candidate.recruiterStatus === 'hired' && candidate.recruiterTxSignature ? (
                                                                    <div className="flex flex-col gap-3">
                                                                        <div className="flex gap-3">
                                                                            <button
                                                                                disabled={processingId === candidate.id}
                                                                                onClick={() => handleUpdateStatus(candidate.id, 'pending')}
                                                                                className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all border bg-slate-800/5 border-white/5 text-slate-500 hover:text-slate-300 ${processingId === candidate.id ? "opacity-50 grayscale transition-none" : ""}`}
                                                                            >
                                                                                {processingId === candidate.id ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'UNDO HIRING'}
                                                                            </button>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <div className="w-1/3 py-2 bg-indigo-600/10 border border-indigo-500/30 rounded-lg text-center flex items-center justify-center">
                                                                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">HIRED ON-CHAIN</span>
                                                                            </div>
                                                                            <a
                                                                                href={`https://solscan.io/tx/${candidate.recruiterTxSignature}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="flex-1 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-[8px] font-black text-slate-300 uppercase tracking-widest text-center transition-all flex items-center justify-center gap-1.5"
                                                                            >
                                                                                <ExternalLink className="w-2.5 h-2.5 text-indigo-400" /> Solscan Proof
                                                                            </a>
                                                                            <button
                                                                                onClick={() => setToast({ message: "Memo content anchored with SHA-256 fingerprint in the transaction instructions.", type: "warning" })}
                                                                                className="flex-1 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-[8px] font-black text-slate-300 uppercase tracking-widest text-center transition-all"
                                                                            >
                                                                                MEMO DETAILS
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="grid grid-cols-3 gap-3">
                                                                        <button
                                                                            disabled={processingId === candidate.id}
                                                                            onClick={() => handleUpdateStatus(candidate.id, candidate.recruiterStatus === 'shortlisted' ? 'pending' : 'shortlisted')}
                                                                            className={`py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all border ${candidate.recruiterStatus === 'shortlisted'
                                                                                ? "bg-emerald-500 text-white border-emerald-500 shadow-[0_5px_15px_rgba(16,185,129,0.3)]"
                                                                                : "bg-emerald-500/5 border-emerald-500/10 text-emerald-500/60 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10"
                                                                                } ${processingId === candidate.id ? "opacity-50 grayscale transition-none" : ""}`}
                                                                        >
                                                                            {processingId === candidate.id ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : (candidate.recruiterStatus === 'shortlisted' ? 'SHORTLISTED' : 'SHORTLIST')}
                                                                        </button>
                                                                        <button
                                                                            disabled={processingId === candidate.id}
                                                                            onClick={() => handleUpdateStatus(candidate.id, candidate.recruiterStatus === 'rejected' ? 'pending' : 'rejected')}
                                                                            className={`py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all border ${candidate.recruiterStatus === 'rejected'
                                                                                ? "bg-slate-700 text-white border-slate-600 shadow-[0_5px_15px_rgba(0,0,0,0.3)]"
                                                                                : "bg-slate-800/5 border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10 hover:bg-white/5"
                                                                                } ${processingId === candidate.id ? "opacity-50 grayscale transition-none" : ""}`}
                                                                        >
                                                                            {processingId === candidate.id ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : (candidate.recruiterStatus === 'rejected' ? 'REJECTED' : 'REJECT')}
                                                                        </button>
                                                                        <div className="relative group/hired">
                                                                            <button
                                                                                disabled={processingId === candidate.id}
                                                                                onClick={() => handleUpdateStatus(candidate.id, 'hired')}
                                                                                className={`w-full py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all border relative overflow-hidden bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 shadow-lg shadow-indigo-500/5 ${processingId === candidate.id ? "opacity-90 pointer-events-none" : ""}`}
                                                                            >
                                                                                {processingId === candidate.id ? (
                                                                                    <div className="flex items-center justify-center gap-1.5">
                                                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                                                        <span>PROCESSING...</span>
                                                                                    </div>
                                                                                ) : (
                                                                                    <span>MARK AS HIRED</span>
                                                                                )}
                                                                            </button>
                                                                            <div className="absolute right-0 bottom-full mb-2 px-2 py-1.5 bg-black border border-white/10 rounded-lg text-[8px] font-bold text-slate-400 uppercase tracking-widest opacity-0 group-hover/hired:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                                                                Creates an on-chain proof.
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <div className="relative flex-1 group/notes">
                                                                    <div className="absolute top-4 left-5 text-[9px] font-black text-slate-700 uppercase tracking-widest pointer-events-none group-focus-within/notes:text-indigo-400/70 transition-colors flex items-center gap-2">
                                                                        <div className="w-2 h-[1px] bg-current opacity-30"></div>
                                                                        Evaluation Synthesis
                                                                    </div>
                                                                    <textarea
                                                                        value={noteDraft}
                                                                        onChange={(e) => setNoteDraft(e.target.value)}
                                                                        onBlur={handleSaveNote}
                                                                        placeholder="Record strategic observations, verdict rationale, or next steps..."
                                                                        className="w-full h-full min-h-[100px] bg-black/40 border border-white/[0.04] rounded-xl p-4 pt-8 pb-12 text-[12px] outline-none focus:border-indigo-500/20 focus:bg-black/60 transition-all placeholder:text-slate-800 resize-none text-slate-300 leading-relaxed font-medium shadow-inner"
                                                                    />
                                                                    {isSavingNote ? (
                                                                        <div className="absolute bottom-4 right-4 flex items-center gap-2.5 px-3 py-1.5 bg-black/80 rounded-lg border border-white/5 shadow-2xl backdrop-blur-md">
                                                                            <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                                                                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Archiving</span>
                                                                        </div>
                                                                    ) : (
                                                                        <button 
                                                                            onClick={handleSaveNote} 
                                                                            className="absolute bottom-4 right-4 px-4 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg text-[9px] font-black text-indigo-400 uppercase tracking-widest transition-all"
                                                                        >
                                                                            SAVE NOTES
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modals */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Terminate Recruitment?"
                message={`Are you sure you want to delete "${data?.collection.title}"? This action cannot be undone and all candidate data will be lost.`}
                confirmLabel={isDeleting ? "Terminating..." : "Terminate"}
                confirmButtonColor="red"
                iconColor="red"
            />
            <CustomWalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />

            <ConfirmationModal
                isOpen={!!candidateToDelete}
                onClose={() => setCandidateToDelete(null)}
                onConfirm={handleDeleteCandidate}
                title="Archive Candidate?"
                message="Are you sure you want to remove this candidate from the pipeline? This action cannot be undone."
                confirmLabel="Archive"
                confirmButtonColor="red"
                iconColor="red"
            />

            <ConfirmationModal
                isOpen={!!candidateToHire}
                onClose={() => setCandidateToHire(null)}
                onConfirm={() => {
                    const id = candidateToHire;
                    setCandidateToHire(null);
                    handleUpdateStatus(id!, 'hired', true);
                }}
                title="Confirm Hiring Choice?"
                message="Marking this candidate as HIRED will trigger a blockchain transaction to anchor the proof. This record will be immutable and visible on their profile."
                confirmLabel="Execute Hiring Proof"
                confirmButtonColor="green"
                iconColor="green"
                note="This action requires your wallet signature to anchor the hiring proof on-chain. This creates a tamper-proof, verifiable record that both you and the candidate can reference permanently."
            />

            {/* Hiring Success Modal */}
            {hiringSuccess && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setHiringSuccess(null)} />
                    <div className="relative bg-[#0f0f11] border border-white/10 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                            
                            <h2 className="text-2xl font-bold text-white mb-2">Hiring Successfully Recorded</h2>
                            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                                The hiring decision for <span className="text-white font-bold">{hiringSuccess.candidateName}</span> has been permanently recorded on-chain and linked to your recruiter wallet.
                            </p>

                            <div className="flex flex-col w-full gap-3">
                                <a 
                                    href={`https://solscan.io/tx/${hiringSuccess.txSignature}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <ExternalLink className="w-4 h-4" /> View Hiring Proof
                                </a>
                                <button
                                    onClick={() => setHiringSuccess(null)}
                                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-400 font-bold text-xs uppercase tracking-widest rounded-xl transition-all border border-white/5"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
