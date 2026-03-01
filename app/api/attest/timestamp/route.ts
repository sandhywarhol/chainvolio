import { NextResponse } from "next/server";

/**
 * GET /api/attest/timestamp
 *
 * Returns a server-generated ISO 8601 UTC timestamp for use in the
 * ChainVolio attestation memo instruction.
 *
 * This ensures `issued_at` in the on-chain memo is server-authoritative
 * and cannot be spoofed by the client.
 */
export async function GET() {
    const issued_at = new Date().toISOString(); // UTC, ISO 8601 format
    return NextResponse.json({ issued_at });
}
