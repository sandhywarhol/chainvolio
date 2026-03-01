import { ImageResponse } from 'next/og';
import { supabaseServer as supabase } from '@/lib/supabase/server';
import React from 'react';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = params;
        const cleanSlug = slug.replace(/\.png$/, '');

        let profile = null;
        let verifierTier = 1;
        let receipts: any[] = [];

        if (supabase) {
            const { data: prof } = await supabase
                .from('profiles')
                .select('display_name, bio, avatar_url, verifier_tier, card_number, skills, country, timezone, work_preference, looking_for, twitter, github, linkedin, instagram, discord, telegram, whatsapp, email')
                .eq('wallet_address', cleanSlug)
                .maybeSingle();
            profile = prof;

            const { data: orgData } = await supabase
                .from("organization_verifications")
                .select("verifier_tier, status")
                .eq("wallet_address", cleanSlug)
                .maybeSingle();

            if (orgData?.status === 'verified') {
                verifierTier = orgData.verifier_tier || 3;
            } else {
                verifierTier = profile?.verifier_tier || 1;
            }

            const { data: recs } = await supabase
                .from("receipts")
                .select("start_date, end_date")
                .eq("wallet_address", cleanSlug);
            receipts = recs || [];
        }

        // Calculate Experience
        const totalYearsExperience = (() => {
            if (!receipts || receipts.length === 0) return 0;
            const intervals = receipts
                .map(r => ({
                    start: new Date(r.start_date).getTime(),
                    end: r.end_date ? new Date(r.end_date).getTime() : new Date().getTime()
                }))
                .filter(i => !isNaN(i.start) && !isNaN(i.end))
                .sort((a, b) => a.start - b.start);

            if (intervals.length === 0) return 0;

            const merged: { start: number; end: number }[] = [];
            let current = intervals[0];
            for (let i = 1; i < intervals.length; i++) {
                const next = intervals[i];
                if (next.start <= current.end) {
                    current.end = Math.max(current.end, next.end);
                } else {
                    merged.push(current);
                    current = next;
                }
            }
            merged.push(current);

            let totalMonths = 0;
            merged.forEach(interval => {
                const start = new Date(interval.start);
                const end = new Date(interval.end);
                const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
                totalMonths += Math.max(1, months);
            });
            return Math.floor(totalMonths / 12);
        })();

        const name = profile?.display_name || 'Anonymous User';
        const bio = profile?.bio || 'Verified Web3 Professional';
        const avatar = profile?.avatar_url
            ? (profile.avatar_url.startsWith('http') ? profile.avatar_url : `https://www.chainvolio.xyz${profile.avatar_url}`)
            : 'https://www.chainvolio.xyz/chainvolio%20logo.png';
        const shortWallet = `${cleanSlug.slice(0, 7)}...${cleanSlug.slice(-6)}`;
        const cardNumber = String(profile?.card_number || 0).padStart(5, '0');
        const skills = profile?.skills ? profile.skills.split(',').slice(0, 6) : [];

        // Style Helpers
        const tierColor = verifierTier === 3 ? '#2dd4bf' : (verifierTier === 2 ? '#10b981' : '#94a3b8');

        const { origin } = new URL(request.url);
        const bgUrl = `${origin}/og%20image/background.png`;

        return new ImageResponse(
            (
                <div style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#07070B',
                    position: 'relative',
                    fontFamily: 'sans-serif',
                    color: 'white',
                    overflow: 'hidden',
                }}>
                    {/* Background Layer with Logo and Text already in PNG */}
                    <img
                        src={bgUrl}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '1200px',
                            height: '630px',
                            objectFit: 'cover',
                        }}
                    />

                    {/* Content Container - Flex row with gap */}
                    <div style={{
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        padding: '60px',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        position: 'relative',
                        zIndex: 1,
                    }}>
                        {/* Right: User Profile Card Overlay */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '480px',
                            backgroundColor: 'rgba(15, 23, 42, 0.85)',
                            borderRadius: '32px',
                            padding: '36px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), inset 0 0 40px rgba(255, 255, 255, 0.03)',
                            position: 'relative',
                        }}>
                            {/* Card Background Glow */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.08), transparent)',
                                borderRadius: '32px',
                                pointerEvents: 'none',
                            }} />

                            {/* Top row: Looking For Badge */}
                            {profile?.looking_for && (
                                <div style={{
                                    display: 'flex',
                                    marginBottom: '20px',
                                }}>
                                    <div style={{
                                        padding: '5px 14px',
                                        borderRadius: '100px',
                                        border: '1px solid rgba(16, 185, 129, 0.4)',
                                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                        color: '#10b981',
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        letterSpacing: '0.08em',
                                        textTransform: 'uppercase',
                                    }}>
                                        {profile.looking_for}
                                    </div>
                                </div>
                            )}

                            {/* Main Info Row: Avatar + Name + Tier */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px',
                                marginBottom: '24px',
                            }}>
                                <div style={{ position: 'relative', display: 'flex' }}>
                                    <div style={{
                                        width: '96px',
                                        height: '96px',
                                        borderRadius: '48px',
                                        display: 'flex',
                                        overflow: 'hidden',
                                        border: '3px solid rgba(255, 255, 255, 0.2)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                                    }}>
                                        <img
                                            src={avatar}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </div>

                                    {/* Years Experience Badge Overlay */}
                                    {totalYearsExperience > 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: -4,
                                            right: -50,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '24px',
                                                height: '24px',
                                                backgroundColor: '#10b981',
                                                borderRadius: '6px',
                                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                                                marginBottom: '4px'
                                            }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            </div>
                                            <div style={{ fontSize: '11px', fontWeight: 900, color: '#60a5fa', lineHeight: 1 }}>{totalYearsExperience}</div>
                                            <div style={{ fontSize: '8px', fontWeight: 900, color: '#60a5fa', letterSpacing: '0.05em' }}>YRS</div>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <h2 style={{
                                        fontSize: '32px',
                                        fontWeight: 900,
                                        margin: 0,
                                        color: 'white',
                                        lineHeight: 1.1,
                                    }}>{name}</h2>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                        {/* Verify Badge */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '3px 10px',
                                            borderRadius: '6px',
                                            border: `1px solid ${tierColor}55`,
                                            backgroundColor: `${tierColor}15`,
                                        }}>
                                            <span style={{
                                                fontSize: '9px',
                                                fontWeight: 900,
                                                color: tierColor,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.12em'
                                            }}>VERIFIED FIGURE</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Skills Row */}
                            {skills.length > 0 && (
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '8px',
                                    marginBottom: '20px',
                                }}>
                                    {skills.map((skill: string, i: number) => (
                                        <div key={i} style={{
                                            padding: '4px 12px',
                                            borderRadius: '100px',
                                            border: '1px solid rgba(255,255,255,0.15)',
                                            backgroundColor: 'rgba(255,255,255,0.08)',
                                            fontSize: '11px',
                                            color: 'rgba(255,255,255,0.9)',
                                            fontWeight: 600,
                                        }}>
                                            {skill.trim()}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Bio / Description */}
                            <p style={{
                                fontSize: '15px',
                                color: 'rgba(255,255,255,0.75)',
                                lineHeight: 1.5,
                                margin: '0 0 24px 0',
                                fontWeight: 400,
                                maxWidth: '100%',
                            }}>
                                {bio.length > 140 ? `${bio.substring(0, 140)}...` : bio}
                            </p>

                            {/* Stats/Details Row */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                borderTop: '1px solid rgba(255,255,255,0.1)',
                                paddingTop: '20px',
                                marginBottom: '20px',
                            }}>
                                {profile?.country && (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.05em' }}>Location</span>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginTop: '2px' }}>{profile?.country}</span>
                                    </div>
                                )}
                                {(profile?.work_preference?.length ?? 0) > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.05em' }}>Availability</span>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>{profile?.work_preference?.[0]}</span>
                                    </div>
                                )}
                            </div>

                            {/* Footer Row: Social Icons + CV ID */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} style={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '6px',
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                            display: 'flex'
                                        }} />
                                    ))}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <span style={{ fontSize: '8px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>CV ID</span>
                                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.9)' }}>#{cardNumber}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
            { width: 1200, height: 630 }
        );
    } catch (e: any) {
        return new Response(`Error: ${e.message}`, { status: 500 });
    }
}
