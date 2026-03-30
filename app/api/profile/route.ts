import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";
import { ALL_SKILLS } from "@/constants/skills";

// Helper function to handle skill pool registration
async function syncSkillPool(skillsStr: string) {
  if (!skillsStr || !supabase) return;
  const skills = Array.from(new Set(skillsStr.split(",").map(s => s.trim()).filter(Boolean)));
  
  for (const skill of skills) {
    const isCustom = !ALL_SKILLS.includes(skill);
    // Upsert into skill_pool: if exists, increment usage_count (handled by function or separate call)
    // For simplicity with Supabase v1/v2:
    const { error } = await supabase.rpc('increment_skill_usage', { 
        s_name: skill, 
        s_custom: isCustom 
    });
    
    // Fallback if RPC doesn't exist yet (for first run/MVP)
    if (error) {
       await supabase.from("skill_pool").upsert({ 
         name: skill, 
         is_custom: isCustom 
       }, { onConflict: 'name' });
    }
  }
}

const errorResponse = (code: string, message: string, status: number = 400) => {
  return NextResponse.json({
    ok: false,
    error: { code, message }
  }, { status });
};

// Field Classifications
const COSMETIC_FIELDS: Record<string, string> = {
  displayName: 'display_name',
  bio: 'bio',
  skills: 'skills',
  twitter: 'twitter',
  github: 'github',
  website: 'website',
  discord: 'discord',
  whatsapp: 'whatsapp',
  email: 'email',
  country: 'country',
  avatarUrl: 'avatar_url',
  lookingFor: 'looking_for',
  timezone: 'timezone',
  workPreference: 'work_preference',
  lens: 'lens',
  farcaster: 'farcaster',
  tags: 'tags',
  telegram: 'telegram',
  linkedin: 'linkedin',
  instagram: 'instagram',
  role: 'professional_role',
  organization: 'organization'
};

const IDENTITY_FIELDS = ['wallet_address', 'card_number', 'created_at'];

export async function POST(request: Request) {
  if (!supabase) {
    return errorResponse("ERR_CONFIG_ERROR", "Supabase not configured", 503);
  }

  try {
    const body = await request.json();
    const { walletAddress, displayName, signature, nonce, timestamp } = body;

    if (!walletAddress || !displayName) {
      return errorResponse("ERR_INVALID_REQUEST", "walletAddress and displayName are required", 400);
    }

    // --- Signature Verification ---
    const skipVerify = process.env.SKIP_SIG_VERIFY === "true" && process.env.NODE_ENV !== "production";
    if (!skipVerify && (!signature || !nonce || !timestamp)) {
      return errorResponse("ERR_SIGNATURE_REQUIRED", "Cryptographic signature is required for identity setup", 401);
    }

    const { verifySignature } = await import("@/lib/crypto");
    const { isValid, error: sigError } = await verifySignature(
      walletAddress,
      "update_profile_identity",
      nonce || "",
      timestamp || 0,
      signature || ""
    );

    if (!isValid) {
      return errorResponse("ERR_SIGNATURE_CONTEXT", sigError || "Signature verification failed", 401);
    }

    // Set transaction context for RLS
    await supabase.rpc('set_app_wallet', { wallet_addr: walletAddress });

    // 1. Ensure Wallet exists
    const { error: walletError } = await supabase.from("wallets").upsert(
      { wallet_address: walletAddress, last_connected_at: new Date().toISOString() },
      { onConflict: "wallet_address" }
    );

    if (walletError) return errorResponse("ERR_DATABASE_ERROR", `Wallet error: ${walletError.message}`, 500);

    // 2. Prepare Profile Setup
    const profileData: any = {
      wallet_address: walletAddress,
      display_name: displayName,
      updated_at: new Date().toISOString()
    };

    // Map allowed cosmetic fields if provided during initial setup
    Object.entries(COSMETIC_FIELDS).forEach(([bodyKey, dbKey]) => {
      if (body[bodyKey] !== undefined) {
        profileData[dbKey] = body[bodyKey];
      }
    });

    const { error: profileError } = await supabase.from("profiles").upsert(
      profileData,
      { onConflict: "wallet_address" }
    );

    if (profileError) return errorResponse("ERR_DATABASE_ERROR", `Profile error: ${profileError.message}`, 500);

    // Sync skill pool asynchronously
    if (body.skills) {
      await syncSkillPool(body.skills);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("POST Profile Error:", err);
    return errorResponse("ERR_SERVER_ERROR", err.message || "An unexpected error occurred", 500);
  }
}

export async function PATCH(request: Request) {
  if (!supabase) return errorResponse("ERR_CONFIG_ERROR", "Supabase not configured", 503);

  try {
    const body = await request.json();
    const { walletAddress, signature, nonce, timestamp } = body;

    if (!walletAddress) return errorResponse("ERR_INVALID_REQUEST", "Wallet address is required", 400);

    // --- Signature Verification ---
    const skipVerify = process.env.SKIP_SIG_VERIFY === "true" && process.env.NODE_ENV !== "production";
    if (!skipVerify && (!signature || !nonce || !timestamp)) {
      return errorResponse("ERR_SIGNATURE_REQUIRED", "Signature required for profile updates", 401);
    }

    const { verifySignature } = await import("@/lib/crypto");
    const { isValid, error: sigError } = await verifySignature(
      walletAddress,
      "update_profile",
      nonce || "",
      timestamp || 0,
      signature || ""
    );

    if (!isValid) return errorResponse("ERR_SIGNATURE_CONTEXT", sigError || "Signature verification failed", 401);

    // 1. Ownership & RLS
    await supabase.rpc('set_app_wallet', { wallet_addr: walletAddress });

    // 2. Prepare Partial Update (Safe Cosmetic Only)
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    let hasUpdates = false;
    Object.entries(COSMETIC_FIELDS).forEach(([bodyKey, dbKey]) => {
      if (body[bodyKey] !== undefined) {
        updateData[dbKey] = body[bodyKey];
        hasUpdates = true;
      }
    });

    if (!hasUpdates) return errorResponse("ERR_INVALID_REQUEST", "No updateable fields provided", 400);

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("wallet_address", walletAddress);

    if (updateError) return errorResponse("ERR_DATABASE_ERROR", updateError.message, 500);

    // Sync skill pool asynchronously
    if (body.skills) {
      await syncSkillPool(body.skills);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("PATCH Profile Error:", err);
    return errorResponse("ERR_SERVER_ERROR", err.message || "An unexpected error occurred", 500);
  }
}

export async function DELETE(request: Request) {
  if (!supabase) return errorResponse("ERR_CONFIG_ERROR", "Supabase not configured", 503);

  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("wallet");
    const signature = searchParams.get("signature");
    const nonce = searchParams.get("nonce");
    const timestamp = searchParams.get("timestamp");

    if (!walletAddress) return errorResponse("ERR_INVALID_REQUEST", "Wallet address required", 400);

    // --- Signature Verification ---
    const skipVerify = process.env.SKIP_SIG_VERIFY === "true" && process.env.NODE_ENV !== "production";
    if (!skipVerify && (!signature || !nonce || !timestamp)) {
      return errorResponse("ERR_SIGNATURE_REQUIRED", "Signature required to delete profile", 401);
    }

    const { verifySignature } = await import("@/lib/crypto");
    const { isValid, error: sigError } = await verifySignature(
      walletAddress,
      "delete_profile",
      nonce || "",
      Number(timestamp) || 0,
      signature || ""
    );

    if (!isValid) return errorResponse("ERR_SIGNATURE_CONTEXT", sigError || "Signature verification failed", 401);

    // RLS Enforcement
    await supabase.rpc('set_app_wallet', { wallet_addr: walletAddress });

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("wallet_address", walletAddress);

    if (error) return errorResponse("ERR_DATABASE_ERROR", error.message, 500);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return errorResponse("ERR_SERVER_ERROR", err.message, 500);
  }
}

export async function GET(request: Request) {
  if (!supabase) return errorResponse("ERR_CONFIG_ERROR", "Supabase not configured", 503);

  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");

  if (!wallet) return errorResponse("ERR_INVALID_REQUEST", "wallet required", 400);

  // 1. Fetch profile
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("wallet_address", wallet)
    .single();

  if (error && error.code !== "PGRST116") {
    return errorResponse("ERR_DATABASE_ERROR", error.message, 500);
  }

  if (!data) return NextResponse.json(null);

  // 2. Fetch verification status
  let { data: orgData } = await supabase
    .from("organization_verifications")
    .select("status, verifier_tier, type, rejection_reason, expires_at, id")
    .eq("wallet_address", wallet)
    .maybeSingle();

  // --- Merit-based Builder Auto-Verification ---
  const { count: powCount } = await supabase
    .from("receipts")
    .select("*", { count: 'exact', head: true })
    .eq("wallet_address", wallet)
    .not("title", "is", null)
    .neq("title", "");

  const hasRequiredProfile = !!data?.display_name;
  const meetsBuilderCriteria = hasRequiredProfile && (powCount || 0) >= 1;

  if (meetsBuilderCriteria) {
      const canAutoVerify = !orgData || (orgData.status !== 'verified' && orgData.type === 'Builder') || (!orgData.type && orgData.status !== 'verified');
      if (canAutoVerify) {
          const upsertData = {
              wallet_address: wallet,
              type: 'Builder',
              status: 'verified',
              name: data?.display_name || wallet,
          };
          if (orgData?.id) {
              await supabase.from("organization_verifications").update(upsertData).eq("id", orgData.id);
          } else {
              await supabase.from("organization_verifications").insert(upsertData);
          }
          // Re-fetch
          const { data: newOrgData } = await supabase
              .from("organization_verifications")
              .select("status, verifier_tier, type, rejection_reason, expires_at, id")
              .eq("wallet_address", wallet)
              .maybeSingle();
          orgData = newOrgData;
      }
  }
  // ---------------------------------------------

  const now = new Date();
  const expiresAtDate = orgData?.expires_at ? new Date(orgData.expires_at) : null;
  const isExpired = expiresAtDate ? now > expiresAtDate : false;
  const isExpiringSoon = expiresAtDate && !isExpired 
    ? (expiresAtDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) 
    : false;

  // 3. Compute Source of Truth for Verification & Tier
  const verificationTier = (orgData?.status === 'verified' && !isExpired) 
    ? orgData.type 
    : "unverified";

  // 4. Quota Info (Benefit System)
  const { getAttestationQuota } = await import("@/lib/paymentConfig");
  const attestationQuota = getAttestationQuota(verificationTier);

  return NextResponse.json({
    displayName: data.display_name,
    bio: data.bio,
    skills: data.skills,
    twitter: data.twitter,
    github: data.github,
    website: data.website,
    discord: data.discord,
    whatsapp: data.whatsapp,
    email: data.email,
    country: data.country,
    avatarUrl: data.avatar_url,
    lookingFor: data.looking_for,
    timezone: data.timezone,
    workPreference: data.work_preference || [],
    lens: data.lens,
    farcaster: data.farcaster,
    tags: data.tags || [],
    telegram: data.telegram,
    linkedin: data.linkedin,
    instagram: data.instagram,
    cardNumber: data.card_number,
    walletAddress: data.wallet_address,
    createdAt: data.created_at,
    role: data.professional_role,
    organization: data.organization,
    // Source of Truth computed fields
    isVerified: orgData?.status === 'verified' && !isExpired,
    verificationTier,
    verificationType: verificationTier,
    isExpired,
    isExpiringSoon,
    expiresAt: orgData?.expires_at || null,
    verifierTier: orgData?.verifier_tier || 1,
    verificationStatus: orgData?.status || null,
    rejectionReason: orgData?.rejection_reason || null,
    // Attestation Quota (Benefit System)
    attestationQuota,
    attestationUsed: data.attestation_used || 0,
    attestationResetDate: data.attestation_reset_date || null,
    canAttest: (data.attestation_used || 0) < attestationQuota,
  });
}
