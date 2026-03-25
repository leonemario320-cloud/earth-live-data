"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type AccessState = {
    supporter: boolean;
    pro: boolean;
    earthInsights: boolean;
    donator: boolean;
    donationAmount: number;
};

function CheckoutSuccessInner() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verifying payment...");

    useEffect(() => {
        const run = async () => {
            try {
                const session_id = searchParams.get("session_id");
                const grant = searchParams.get("grant");
                const amount = searchParams.get("amount");

                if (!session_id || !grant) {
                    setStatus("error");
                    setMessage("Missing payment session data.");
                    return;
                }

                const qs = new URLSearchParams({
                    session_id,
                    grant,
                });

                if (amount) {
                    qs.set("amount", amount);
                }

                const res = await fetch(`/api/stripe/verify-session?${qs.toString()}`);
                const data = await res.json();

                if (!res.ok || !data.ok) {
                    setStatus("error");
                    setMessage(data.error || "Payment verification failed.");
                    return;
                }

                const saved = window.localStorage.getItem("earth-access");

                let current: AccessState = {
                    supporter: false,
                    pro: false,
                    earthInsights: false,
                    donator: false,
                    donationAmount: 0,
                };

                if (saved) {
                    try {
                        current = JSON.parse(saved);
                    } catch {}
                }

                const nextState: AccessState = {
                    ...current,
                    earthInsights:
                        current.earthInsights || Boolean(data.result?.earthInsights),
                    donator: current.donator || Boolean(data.result?.donator),
                    donationAmount: Math.max(
                        Number(current.donationAmount ?? 0),
                        Number(data.result?.donationAmount ?? 0)
                    ),
                };

                window.localStorage.setItem("earth-access", JSON.stringify(nextState));

                setStatus("success");
                setMessage("Payment verified. Unlock applied.");

                setTimeout(() => {
                    router.replace("/");
                }, 1600);
            } catch (error) {
                console.error(error);
                setStatus("error");
                setMessage("Unexpected error during payment verification.");
            }
        };

        run();
    }, [searchParams, router]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#02040a] px-6 text-white">
            <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-black/30 p-8 text-center backdrop-blur-2xl">
                <div className="text-xs uppercase tracking-[0.24em] text-white/45">
                    Earth Live Data
                </div>

                <h1 className="mt-4 text-3xl font-semibold">
                    {status === "loading" && "Checking payment..."}
                    {status === "success" && "Unlock applied ✨"}
                    {status === "error" && "Payment check failed"}
                </h1>

                <p className="mt-4 text-sm leading-7 text-white/65">{message}</p>

                {status !== "loading" && (
                    <button
                        onClick={() => router.replace("/")}
                        className="mt-6 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black"
                    >
                        Back to app
                    </button>
                )}
            </div>
        </main>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-screen items-center justify-center bg-[#02040a] px-6 text-white">
                    <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-black/30 p-8 text-center backdrop-blur-2xl">
                        <div className="text-xs uppercase tracking-[0.24em] text-white/45">
                            Earth Live Data
                        </div>
                        <h1 className="mt-4 text-3xl font-semibold">Checking payment...</h1>
                        <p className="mt-4 text-sm leading-7 text-white/65">
                            Please wait a moment.
                        </p>
                    </div>
                </main>
            }
        >
            <CheckoutSuccessInner />
        </Suspense>
    );
}