"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    related_id: string;
    link: string;
    is_read: boolean;
    created_at: string;
}

export function NotificationBell() {
    const { publicKey } = useWallet();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        if (!publicKey || !supabase) return;

        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("wallet_address", publicKey.toBase58())
            .order("created_at", { ascending: false })
            .limit(10);

        if (!error && data) {
            setNotifications(data);
            setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
        }
    };

    const markAsRead = async (id: string) => {
        if (!supabase) return;
        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", id);

        if (!error) {
            setNotifications((prev: Notification[]) => 
                prev.map((n: Notification) => n.id === id ? { ...n, is_read: true } : n)
            );
            setUnreadCount((prev: number) => Math.max(0, prev - 1));
        }
    };

    const markAllAsRead = async () => {
        if (!publicKey || !supabase) return;

        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("wallet_address", publicKey.toBase58())
            .eq("is_read", false);

        if (!error) {
            setNotifications((prev: Notification[]) => prev.map((n: Notification) => ({ ...n, is_read: true })));
            setUnreadCount(0);
        }
    };

    // Auto-cleanup old notifications (7 days)
    useEffect(() => {
        if (!publicKey || !supabase) return;
        
        const cleanupOldNotifications = async () => {
            if (!supabase) return;
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            await supabase
                .from("notifications")
                .delete()
                .eq("wallet_address", publicKey.toBase58())
                .lt("created_at", sevenDaysAgo.toISOString());
        };

        cleanupOldNotifications();
    }, [publicKey]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [publicKey]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!publicKey) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-black">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100000]">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Notifications</h3>
                        <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Inbox</span>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                            <>
                                {notifications.map((notif) => (
                                    <div 
                                        key={notif.id}
                                        className={`p-4 border-b border-white/5 last:border-0 transition-all cursor-pointer hover:bg-white/[0.02] ${!notif.is_read ? 'bg-emerald-500/[0.03] opacity-100' : 'opacity-60'}`}
                                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[13px] font-bold ${!notif.is_read ? 'text-white' : 'text-slate-400'}`}>
                                                        {notif.title}
                                                    </span>
                                                    {!notif.is_read && (
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                                    )}
                                                </div>
                                                <p className={`text-xs leading-relaxed ${!notif.is_read ? 'text-white/80' : 'text-slate-500'}`}>
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center justify-between mt-3">
                                                    <span className="text-[10px] text-white/20">
                                                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="p-2 border-t border-white/5 bg-white/[0.01]">
                                    <button 
                                        onClick={markAllAsRead}
                                        className="w-full py-2 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors font-bold"
                                    >
                                        Mark all as read
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="p-8 text-center">
                                <Bell className="w-8 h-8 text-white/10 mx-auto mb-3" />
                                <p className="text-sm text-white/30">No notifications yet</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
