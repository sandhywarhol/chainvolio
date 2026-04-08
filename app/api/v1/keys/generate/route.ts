import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(request: Request) {
  console.log("Generating API key...");
  
  try {
    if (!supabaseServer) {
      console.error("Supabase server connection failed");
      return NextResponse.json({ error: "Database connection error" }, { status: 500 });
    }

    let name = "Developer Key";
    try {
      const body = await request.json();
      if (body.name) name = body.name;
    } catch (e) {
      // Body might be empty or not JSON, use default
    }

    // Generate a secure random key cv_ + random bytes
    const generated_key = `cv_${crypto.randomBytes(24).toString("hex")}`;
    console.log("Generated:", generated_key);

    const { error } = await supabaseServer
      .from("api_keys")
      .insert({
        key: generated_key,
        name: name,
        usage_limit: 1000,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error("Database insert error:", error);
      return NextResponse.json({ 
        error: "Failed to save API key to database",
        details: error.message 
      }, { status: 500 });
    }

    return Response.json({
      success: true,
      api_key: generated_key,
      key: generated_key // Compatibility with frontend
    });
  } catch (error: any) {
    console.error("General API Key generation error:", error);
    return Response.json({ 
      error: "Failed to generate API key",
      details: error.message 
    }, { status: 500 });
  }
}
