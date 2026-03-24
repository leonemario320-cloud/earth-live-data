import { NextResponse } from "next/server";

export async function GET() {
    try {

        const username = process.env.OPENSKY_USERNAME;
        const password = process.env.OPENSKY_PASSWORD;

        const headers: HeadersInit = {};

        if (username && password) {
            const encoded = Buffer.from(`${username}:${password}`).toString("base64");
            headers["Authorization"] = `Basic ${encoded}`;
        }

        const res = await fetch("https://opensky-network.org/api/states/all", {
            headers,
            cache: "no-store"
        });

        if (!res.ok) {
            return NextResponse.json({
                count: -1,
                error: `OpenSky status ${res.status}`
            });
        }

        const data = await res.json();

        const count = Array.isArray(data.states) ? data.states.length : -1;

        return NextResponse.json({
            count,
            updatedAt: Date.now()
        });

    } catch (error) {

        return NextResponse.json({
            count: -1,
            error: "Flights fetch failed"
        });

    }
}