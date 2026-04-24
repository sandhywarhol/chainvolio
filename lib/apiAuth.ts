import { supabaseServer } from "@/lib/supabase/server";

export async function validateApiKey(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  // Allow internal requests from the same origin to bypass API key check.
  // Browsers reliably send Referer for same-origin fetch() GET requests even
  // when Origin is omitted (common for same-origin GETs per the Fetch spec).
  const isInternalOrigin = !!(origin && host && origin.includes(host));
  const isInternalReferer = !!(referer && host && referer.includes(host));

  if (!apiKey && (isInternalOrigin || isInternalReferer)) {
    return { valid: true, isInternal: true };
  }

  if (!apiKey) {
    return { valid: false, error: "Missing API Key", status: 401 };
  }

  if (!supabaseServer) {
    return { valid: false, error: "Database Connection Error", status: 500 };
  }

  const { data, error } = await supabaseServer
    .from("api_keys")
    .select("*")
    .eq("key", apiKey)
    .single();

  if (error || !data) {
    return { valid: false, error: "Invalid API Key", status: 401 };
  }

  // Check usage limit
  const count = data.usage_count || 0;
  const limit = data.usage_limit || 1000;

  if (count >= limit) {
    return { valid: false, error: "API usage limit exceeded", status: 429 };
  }

  // Increment usage count atomically
  await supabaseServer.rpc('increment_api_usage', { key_str: apiKey });
  
  return { valid: true, keyData: data };
}
