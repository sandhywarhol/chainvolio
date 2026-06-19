import { NextRequest, NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";
import { verifySignature } from "@/lib/crypto";

const MAX_PDF_BYTES = 5 * 1024 * 1024; // 5 MB

// ── Auth helpers ──────────────────────────────────────────────────────────────

async function verifyWalletAuth(wallet: string, formData: FormData) {
  const signature = formData.get("signature") as string | null;
  const nonce     = formData.get("nonce")     as string | null;
  const timestamp = formData.get("timestamp") as string | null;
  if (!signature || !nonce || !timestamp) return { ok: false };
  const { isValid } = await verifySignature(wallet, "update_profile", nonce, parseInt(timestamp, 10), signature);
  return { ok: isValid };
}

async function verifyGoogleAuth(authUid: string, request: NextRequest) {
  if (!supabase) return { ok: false };
  const token = request.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return { ok: false };
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user || user.id !== authUid) return { ok: false };
  return { ok: true };
}

// ── GET: return cv_pdf_url for a wallet ───────────────────────────────────────

export async function GET(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const wallet  = searchParams.get("wallet");
  const authUid = searchParams.get("auth_uid");
  const effectiveWallet = authUid ? `gauth:${authUid}` : wallet;
  if (!effectiveWallet) return NextResponse.json({ error: "wallet or auth_uid required" }, { status: 400 });

  // Try profiles table first (wallet users), then org_accounts (Google users)
  const isGoogle = effectiveWallet.startsWith("gauth:");

  if (isGoogle && authUid) {
    const { data } = await supabase
      .from("org_accounts")
      .select("cv_pdf_url")
      .eq("auth_uid", authUid)
      .single();
    return NextResponse.json({ cv_pdf_url: data?.cv_pdf_url || null });
  }

  const { data } = await supabase
    .from("profiles")
    .select("cv_pdf_url")
    .eq("wallet_address", effectiveWallet)
    .single();
  return NextResponse.json({ cv_pdf_url: data?.cv_pdf_url || null });
}

// ── POST: upload PDF, store in certificates bucket, save URL to profile ───────

export async function POST(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  try {
    const formData   = await request.formData() as any;
    const wallet     = formData.get("wallet")   as string | null;
    const authUid    = formData.get("auth_uid") as string | null;
    const file       = formData.get("file")     as File | null;
    const isGoogle   = !wallet && !!authUid;
    const effectiveWallet = wallet || (authUid ? `gauth:${authUid}` : null);

    if (!effectiveWallet || !file) {
      return NextResponse.json({ error: "wallet or auth_uid, and file are required" }, { status: 400 });
    }

    // Auth
    if (isGoogle) {
      const { ok } = await verifyGoogleAuth(authUid!, request);
      if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } else {
      const { ok } = await verifyWalletAuth(wallet!, formData);
      if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are accepted." }, { status: 400 });
    }
    if (file.size > MAX_PDF_BYTES) {
      return NextResponse.json({ error: "PDF must be under 5 MB." }, { status: 400 });
    }

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const storageKey = effectiveWallet.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filePath   = `${storageKey}/cv_resume_${Date.now()}.pdf`;

    // Remove old file if exists (best-effort)
    const oldUrl = isGoogle
      ? (await supabase.from("org_accounts").select("cv_pdf_url").eq("auth_uid", authUid!).single()).data?.cv_pdf_url
      : (await supabase.from("profiles").select("cv_pdf_url").eq("wallet_address", wallet!).single()).data?.cv_pdf_url;

    if (oldUrl) {
      try {
        const oldPath = new URL(oldUrl).pathname.split("/certificates/")[1];
        if (oldPath) await supabase.storage.from("certificates").remove([oldPath]);
      } catch {}
    }

    const { error: uploadError } = await supabase.storage
      .from("certificates")
      .upload(filePath, buffer, { contentType: "application/pdf", upsert: false });

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const { data: urlData } = supabase.storage.from("certificates").getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    // Save URL to the right table
    if (isGoogle) {
      await supabase.from("org_accounts").update({ cv_pdf_url: publicUrl }).eq("auth_uid", authUid!);
    } else {
      await supabase.from("profiles").update({ cv_pdf_url: publicUrl }).eq("wallet_address", wallet!);
    }

    return NextResponse.json({ ok: true, cv_pdf_url: publicUrl });
  } catch (err: any) {
    console.error("CV PDF upload error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ── DELETE: remove PDF from storage and clear cv_pdf_url ─────────────────────

export async function DELETE(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  try {
    const { searchParams } = new URL(request.url);
    const wallet  = searchParams.get("wallet");
    const authUid = searchParams.get("auth_uid");
    const isGoogle = !wallet && !!authUid;
    const effectiveWallet = wallet || (authUid ? `gauth:${authUid}` : null);
    if (!effectiveWallet) return NextResponse.json({ error: "wallet or auth_uid required" }, { status: 400 });

    // Auth for wallet users (Google auth uses header token via URL for DELETE)
    if (isGoogle) {
      const token = request.headers.get("authorization")?.replace("Bearer ", "").trim();
      if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user || user.id !== authUid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } else {
      const signature = searchParams.get("signature");
      const nonce     = searchParams.get("nonce");
      const timestamp = searchParams.get("timestamp");
      if (!signature || !nonce || !timestamp) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const { isValid } = await verifySignature(wallet!, "update_profile", nonce, parseInt(timestamp, 10), signature);
      if (!isValid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch current URL
    const currentUrl = isGoogle
      ? (await supabase.from("org_accounts").select("cv_pdf_url").eq("auth_uid", authUid!).single()).data?.cv_pdf_url
      : (await supabase.from("profiles").select("cv_pdf_url").eq("wallet_address", wallet!).single()).data?.cv_pdf_url;

    if (currentUrl) {
      try {
        const oldPath = new URL(currentUrl).pathname.split("/certificates/")[1];
        if (oldPath) await supabase.storage.from("certificates").remove([oldPath]);
      } catch {}
    }

    if (isGoogle) {
      await supabase.from("org_accounts").update({ cv_pdf_url: null }).eq("auth_uid", authUid!);
    } else {
      await supabase.from("profiles").update({ cv_pdf_url: null }).eq("wallet_address", wallet!);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
