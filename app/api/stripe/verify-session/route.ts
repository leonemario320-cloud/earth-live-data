import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

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

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.status !== "complete" || session.payment_status !== "paid") {
            return NextResponse.json(
                { ok: false, error: "Payment not completed" },
                { status: 400 }
            );
        }

        let result = {
            earthInsights: false,
            donator: false,
            donationAmount: 0,
        };

        if (grant === "earthInsights") {
            result.earthInsights = true;
        }

        if (grant === "donation") {
            const amount = Number(amountParam ?? 0);

            if (!Number.isFinite(amount) || amount <= 0) {
                return NextResponse.json(
                    { ok: false, error: "Invalid donation amount" },
                    { status: 400 }
                );
            }

            const paidAmount = (session.amount_total ?? 0) / 100;

            if (paidAmount < amount) {
                return NextResponse.json(
                    { ok: false, error: "Paid amount does not match requested unlock" },
                    { status: 400 }
                );
            }

            result.donator = true;
            result.donationAmount = amount;
        }

        return NextResponse.json({
            ok: true,
            sessionId: session.id,
            result,
        });
    } catch (error) {
        console.error("verify-session error", error);

        return NextResponse.json(
            { ok: false, error: "Server error" },
            { status: 500 }
        );
    }
}