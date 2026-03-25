import { NextResponse } from "next/server";

export async function GET() {
    const raw = process.env.STRIPE_SECRET_KEY ?? "";
    const key = raw.replace(/^['"]|['"]$/g, "").trim();

    return NextResponse.json({
        exists: Boolean(key),
        prefix: key.slice(0, 12),
        length: key.length,
    });
}