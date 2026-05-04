import { NextResponse } from "next/server";

const err = (code: string, message: string, status = 400) =>
    NextResponse.json({ ok: false, error: { code, message } }, { status });

export async function POST() {
    return err("ERR_MAINTENANCE", "Billing management is currently under maintenance. Please try again later.", 503);
}
