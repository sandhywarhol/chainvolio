import { NextRequest, NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";
import { verifySignature } from "@/lib/crypto";

export async function GET(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");
  if (!wallet) return NextResponse.json({ error: "wallet required" }, { status: 400 });

  const { data, error } = await supabase
    .from("user_certificates")
    .select("id, title, issuer_name, date_issued, file_url, file_type, created_at")
    .eq("wallet_address", wallet)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  try {
    const formData = (await request.formData()) as any;
    const wallet   = formData.get("wallet")   as string;
    const title    = formData.get("title")    as string;
    const issuer   = formData.get("issuer")   as string | null;
    const dateIssued = formData.get("dateIssued") as string | null;
    const file     = formData.get("file")     as File | null;

    // Auth parameters
    const signature = formData.get("signature") as string | null;
    const nonce = formData.get("nonce") as string | null;
    const timestamp = formData.get("timestamp") as string | null;

    if (!wallet || !title || !file) {
      return NextResponse.json({ error: "wallet, title, and file are required" }, { status: 400 });
    }

    if (!signature || !nonce || !timestamp) {
      return NextResponse.json({ error: "Unauthorized: Missing signature parameters" }, { status: 401 });
    }

    const { isValid, error: sigError } = await verifySignature(
      wallet,
      "update_profile",
      nonce,
      parseInt(timestamp, 10),
      signature
    );

    if (!isValid) {
      return NextResponse.json({ error: `Unauthorized: ${sigError}` }, { status: 401 });
    }

    const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file format. Use PDF, JPEG, PNG or WebP." }, { status: 400 });
    }

    const MAX_RAW = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_RAW) {
      return NextResponse.json({ error: "File too large. Maximum upload size is 10 MB." }, { status: 400 });
    }

    // For PDFs reject if > 5 MB (no server-side compression possible without native libs)
    const MAX_PDF = 5 * 1024 * 1024;
    if (file.type === "application/pdf" && file.size > MAX_PDF) {
      return NextResponse.json({ error: "PDF files must be under 5 MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileTimestamp = Date.now();
    // Path format: certificates/{wallet_address}/{fileTimestamp}_certificate
    const filePath = `${wallet}/${fileTimestamp}_certificate`;
    const fileType = file.type === "application/pdf" ? "pdf" : "image";

    const { error: uploadError } = await supabase.storage
      .from("certificates")
      .upload(filePath, buffer, {
        contentType: file.type === "application/pdf" ? "application/pdf" : "image/webp",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from("certificates")
      .getPublicUrl(filePath);

    const { data: record, error: dbError } = await supabase
      .from("user_certificates")
      .insert({
        wallet_address: wallet,
        title,
        issuer_name: issuer || null,
        date_issued: dateIssued || null,
        file_url: urlData.publicUrl,
        file_type: fileType,
      })
      .select()
      .single();

    if (dbError) {
      // Clean up storage if DB insert fails
      await supabase.storage.from("certificates").remove([filePath]);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, certificate: record });
  } catch (err: any) {
    console.error("Certificate upload error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  try {
    const { searchParams } = new URL(request.url);
    const id     = searchParams.get("id");
    const wallet = searchParams.get("wallet");
    const signature = searchParams.get("signature");
    const nonce = searchParams.get("nonce");
    const timestamp = searchParams.get("timestamp");

    if (!id || !wallet) return NextResponse.json({ error: "id and wallet required" }, { status: 400 });

    if (!signature || !nonce || !timestamp) {
      return NextResponse.json({ error: "Unauthorized: Missing signature parameters" }, { status: 401 });
    }

    const { isValid, error: sigError } = await verifySignature(
      wallet,
      "update_profile",
      nonce,
      parseInt(timestamp, 10),
      signature
    );

    if (!isValid) {
      return NextResponse.json({ error: `Unauthorized: ${sigError}` }, { status: 401 });
    }

    const { data: cert, error: fetchErr } = await supabase
      .from("user_certificates")
      .select("file_url, wallet_address")
      .eq("id", id)
      .single();

    if (fetchErr || !cert) return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    if (cert.wallet_address !== wallet) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // Extract storage path from URL and remove file
    const url = new URL(cert.file_url);
    const pathParts = url.pathname.split("/certificates/");
    if (pathParts[1]) {
      await supabase.storage.from("certificates").remove([pathParts[1]]);
    }

    const { error: delErr } = await supabase
      .from("user_certificates")
      .delete()
      .eq("id", id);

    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
