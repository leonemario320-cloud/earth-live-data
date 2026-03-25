import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
}

const stripe = new Stripe(stripeSecretKey);

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const sessionId = searchParams.get("session_id");
        const grant = searchParams.get("grant");
        const amountParam = searchParams.get("amount");

        if (!sessionId) {
            return NextResponse.json(
                { ok: false, error: "Missing session_id" },
                { status: 400 }
            );
        }

        if (!grant) {
            return NextResponse.json(
                { ok: false, error: "Missing grant" },
                { status: 400 }
            );
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session) {
            return NextResponse.json(
                { ok: false, error: "Session not found" },
                { status: 404 }
            );
        }

        const isPaid =
            session.payment_status === "paid" ||
            session.status === "complete";

        if (!isPaid) {
            return NextResponse.json(
                {
                    ok: false,
                    error: `Session not paid (${session.status ?? "unknown"} / ${session.payment_status ?? "unknown"})`,
                },
                { status: 400 }
            );
        }

        if (grant === "earthInsights") {
            return NextResponse.json({
                ok: true,
                result: {
                    earthInsights: true,
                    donator: false,
                    donationAmount: 0,
                },
            });
        }

        if (grant === "donation") {
            const amount = Number(amountParam ?? 0);

            return NextResponse.json({
                ok: true,
                result: {
                    earthInsights: false,
                    donator: true,
                    donationAmount: Number.isFinite(amount) ? amount : 0,
                },
            });
        }

        return NextResponse.json(
            { ok: false, error: "Invalid grant" },
            { status: 400 }
        );
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unknown server error";

        console.error("verify-session error:", error);

        return NextResponse.json(
            { ok: false, error: message },
            { status: 500 }
        );
    }
}