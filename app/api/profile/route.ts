import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const {
      walletAddress,
      displayName,
      bio,
      skills,
      twitter,
      github,
      website,
      discord,
      whatsapp,
      email,
      country,
      avatarUrl,
      lookingFor,
      timezone,
      workPreference,
      lens,
      farcaster,
      tags,
      telegram
    } = body;

    if (!walletAddress || !displayName) {
      return NextResponse.json(
        { error: "walletAddress and displayName are required" },
        { status: 400 }
      );
    }

    // 1. Upsert wallet first
    const { error: walletError } = await supabase.from("wallets").upsert(
      {
        wallet_address: walletAddress,
        last_connected_at: new Date().toISOString(),
      },
      { onConflict: "wallet_address" }
    );

    if (walletError) {
      console.error("Supabase wallet error:", walletError);
      return NextResponse.json({ error: `Wallet error: ${walletError.message}` }, { status: 500 });
    }

    // 2. Upsert profile
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        wallet_address: walletAddress,
        display_name: displayName,
        bio: bio || "",
        skills: skills || "",
        twitter: twitter || "",
        github: github || "",
        website: website || "",
        discord: discord || "",
        whatsapp: whatsapp || "",
        email: email || "",
        country: country || "",
        avatar_url: avatarUrl || "",
        looking_for: lookingFor || "",
        timezone: timezone || "",
        work_preference: workPreference || [],
        lens: lens || "",
        farcaster: farcaster || "",
        tags: tags || [],
        telegram: telegram || "",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "wallet_address" }
    );

    if (profileError) {
      console.error("Supabase profile error:", profileError);
      return NextResponse.json({ error: `Profile error: ${profileError.message}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json({ error: "wallet required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, bio, skills, twitter, github, website, discord, whatsapp, email, country, avatar_url, looking_for, timezone, work_preference, lens, farcaster, tags, telegram")
    .eq("wallet_address", wallet)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) return NextResponse.json(null);

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
  });
}
