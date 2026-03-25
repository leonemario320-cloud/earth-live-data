import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET() {
    try {
        const raw = process.env.STRIPE_SECRET_KEY ?? "";
        const key = raw.replace(/^['"]|['"]$/g, "").trim();

        if (!key) {
            return NextResponse.json(
                { ok: false, error: "Missing STRIPE_SECRET_KEY" },
                { status: 500 }
            );
        }

        const stripe = new Stripe(key);
        const account = await stripe.accounts.retrieve();

        return NextResponse.json({
            ok: true,
            accountId: account.id,
            mode: key.startsWith("sk_live_") ? "live" : "test",
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}