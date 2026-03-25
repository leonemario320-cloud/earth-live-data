import { NextResponse } from "next/server";

export async function GET() {
    const mapKey = process.env.FIRMS_MAP_KEY;

    if (!mapKey) {
        return NextResponse.json({
            count: 0,
            source: "VIIRS_SNPP_NRT",
            area: "world",
            updatedAt: Date.now(),
            fallback: true,
            error: "Missing FIRMS_MAP_KEY",
        });
    }

    try {
        const source = "VIIRS_SNPP_NRT";
        const area = "world";
        const dayRange = "1";

        const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/${source}/${area}/${dayRange}`;

        const res = await fetch(url, {
            cache: "no-store",
        });

        if (!res.ok) {
            return NextResponse.json({
                count: 0,
                source,
                area,
                updatedAt: Date.now(),
                fallback: true,
                error: `FIRMS request failed: ${res.status}`,
            });
        }

        const csvText = await res.text();

        const lines = csvText
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

        const count = lines.length > 1 ? lines.length - 1 : 0;

        return NextResponse.json({
            count,
            source,
            area,
            updatedAt: Date.now(),
            fallback: false,
        });
    } catch (error) {
        return NextResponse.json({
            count: 0,
            source: "VIIRS_SNPP_NRT",
            area: "world",
            updatedAt: Date.now(),
            fallback: true,
            error: "Failed to fetch FIRMS data",
        });
    }
}