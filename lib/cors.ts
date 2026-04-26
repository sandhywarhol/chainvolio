import { NextResponse } from "next/server";

export const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
};

/** Respond to CORS preflight requests */
export function handleOptions() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/** Wrap a NextResponse with CORS headers */
export function withCors(res: NextResponse): NextResponse {
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
    return res;
}

/** Shorthand: json response with CORS headers */
export function corsJson(body: unknown, init?: ResponseInit): NextResponse {
    const res = NextResponse.json(body, init);
    return withCors(res);
}
