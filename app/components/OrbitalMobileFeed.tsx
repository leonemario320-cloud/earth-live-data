"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type LayerId =
    | "population"
    | "births"
    | "deaths"
    | "flights"
    | "earthquakes"
    | "fires"
    | "suicides"
    | "roadDeaths"
    | "smokingDeaths"
    | "alcoholDeaths"
    | "abortions"
    | "illegalDrugSpend"
    | "storms"
    | "oceans"
    | "energy"
    | "food"
    | "water";

type Props = {
    activeLayer: LayerId;
    liveValues: Partial<Record<LayerId, string>>;
    liveStats?: Partial<Record<LayerId, number>>;
    previousLiveData?: Partial<Record<LayerId, number>>;
};

const SCAN_ORDER: LayerId[] = [
    "population",
    "flights",
    "fires",
    "earthquakes",
    "storms",
    "births",
    "deaths",
    "oceans",
    "energy",
    "water",
    "food",
    "roadDeaths",
    "smokingDeaths",
    "alcoholDeaths",
    "abortions",
    "illegalDrugSpend",
    "suicides",
];

function layerName(layer: LayerId): string {
    switch (layer) {
        case "population":
            return "Population";
        case "births":
            return "Births";
        case "deaths":
            return "Deaths";
        case "flights":
            return "Flights";
        case "earthquakes":
            return "Earthquakes";
        case "fires":
            return "Wildfires";
        case "storms":
            return "Storms";
        case "suicides":
            return "Suicides";
        case "roadDeaths":
            return "Road deaths";
        case "smokingDeaths":
            return "Smoking deaths";
        case "alcoholDeaths":
            return "Alcohol deaths";
        case "abortions":
            return "Abortions";
        case "illegalDrugSpend":
            return "Drug spend";
        case "oceans":
            return "Oceans";
        case "energy":
            return "Energy";
        case "food":
            return "Food";
        case "water":
            return "Water";
        default:
            return "Live data";
    }
}

function formatCompact(value?: number): string {
    if (value === undefined || Number.isNaN(value)) return "--";
    return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);
}

function buildMessage(
    layer: LayerId,
    displayValue?: string,
    liveValue?: number,
    previousValue?: number
) {
    const label = layerName(layer);
    const shown = displayValue?.trim() || (liveValue !== undefined ? formatCompact(liveValue) : "--");

    const hasCurrent = typeof liveValue === "number" && !Number.isNaN(liveValue);
    const hasPrevious = typeof previousValue === "number" && !Number.isNaN(previousValue);

    if (hasCurrent && hasPrevious) {
        const diff = liveValue - previousValue;
        if (Math.abs(diff) > 0) {
            const sign = diff > 0 ? "+" : "-";
            return `${label} scan • ${sign}${formatCompact(Math.abs(diff))} • now ${shown}`;
        }
    }

    switch (layer) {
        case "population":
            return `Population estimate • ${shown}`;
        case "births":
            return `Birth count live • ${shown}`;
        case "deaths":
            return `Mortality estimate • ${shown}`;
        case "flights":
            return `Flights tracked • ${shown}`;
        case "earthquakes":
            return `Seismic events • ${shown}`;
        case "fires":
            return `Fire signals • ${shown}`;
        case "storms":
            return `Storm systems • ${shown}`;
        case "oceans":
            return `Ocean feed • ${shown}`;
        case "energy":
            return `Energy feed • ${shown}`;
        case "food":
            return `Food feed • ${shown}`;
        case "water":
            return `Water feed • ${shown}`;
        default:
            return `${label} • ${shown}`;
    }
}

export default function OrbitalMobileFeed({
                                              activeLayer,
                                              liveValues,
                                              liveStats = {},
                                              previousLiveData = {},
                                          }: Props) {
    const [scanLayer, setScanLayer] = useState<LayerId>(activeLayer);
    const [message, setMessage] = useState("");
    const [pulseKey, setPulseKey] = useState(0);
    const scanIndexRef = useRef(0);
    const lastManualLayerRef = useRef<LayerId>(activeLayer);

    const liveValuesRef = useRef(liveValues);
    const liveStatsRef = useRef(liveStats);
    const previousLiveDataRef = useRef(previousLiveData);

    useEffect(() => {
        liveValuesRef.current = liveValues;
    }, [liveValues]);

    useEffect(() => {
        liveStatsRef.current = liveStats;
    }, [liveStats]);

    useEffect(() => {
        previousLiveDataRef.current = previousLiveData;
    }, [previousLiveData]);

    useEffect(() => {
        if (lastManualLayerRef.current === activeLayer) return;

        lastManualLayerRef.current = activeLayer;
        setScanLayer(activeLayer);
        setMessage(
            buildMessage(
                activeLayer,
                liveValues[activeLayer],
                liveStats[activeLayer],
                previousLiveData[activeLayer]
            )
        );
        setPulseKey((prev) => prev + 1);
    }, [activeLayer, liveValues, liveStats, previousLiveData]);

    useEffect(() => {
        setMessage(
            buildMessage(
                activeLayer,
                liveValues[activeLayer],
                liveStats[activeLayer],
                previousLiveData[activeLayer]
            )
        );
    }, []);

    useEffect(() => {
        const interval = window.setInterval(() => {
            scanIndexRef.current = (scanIndexRef.current + 1) % SCAN_ORDER.length;
            const nextLayer = SCAN_ORDER[scanIndexRef.current];

            setScanLayer(nextLayer);
            setMessage(
                buildMessage(
                    nextLayer,
                    liveValuesRef.current[nextLayer],
                    liveStatsRef.current[nextLayer],
                    previousLiveDataRef.current[nextLayer]
                )
            );
            setPulseKey((prev) => prev + 1);
        }, 6500);

        return () => window.clearInterval(interval);
    }, []);

    const tone = useMemo(() => {
        switch (scanLayer) {
            case "fires":
                return {
                    ring: "border-orange-400/20",
                    bg: "bg-orange-400/10",
                    text: "text-orange-100/85",
                    dot: "bg-orange-300",
                };
            case "earthquakes":
            case "storms":
                return {
                    ring: "border-violet-400/20",
                    bg: "bg-violet-400/10",
                    text: "text-violet-100/85",
                    dot: "bg-violet-300",
                };
            case "births":
            case "food":
                return {
                    ring: "border-emerald-400/20",
                    bg: "bg-emerald-400/10",
                    text: "text-emerald-100/85",
                    dot: "bg-emerald-300",
                };
            case "deaths":
            case "energy":
            case "alcoholDeaths":
                return {
                    ring: "border-amber-400/20",
                    bg: "bg-amber-400/10",
                    text: "text-amber-100/85",
                    dot: "bg-amber-300",
                };
            default:
                return {
                    ring: "border-sky-400/20",
                    bg: "bg-sky-400/10",
                    text: "text-sky-100/85",
                    dot: "bg-sky-300",
                };
        }
    }, [scanLayer]);

    return (
        <div className="pointer-events-none flex justify-center">
            <div
                className={`relative w-full max-w-[280px] overflow-hidden rounded-[22px] border ${tone.ring} ${tone.bg} px-4 py-3 backdrop-blur-xl shadow-[0_0_35px_rgba(56,189,248,0.08)]`}
            >
                <div className="flex items-center justify-center gap-2">
                    <span
                        key={pulseKey}
                        className={`h-2 w-2 rounded-full ${tone.dot} animate-pulse`}
                    />
                    <div className={`text-[10px] font-medium uppercase tracking-[0.28em] ${tone.text}`}>
                        Orbital Feed
                    </div>
                </div>

                <div
                    key={`${scanLayer}-${pulseKey}`}
                    className={`mt-2 text-center text-[10px] uppercase tracking-[0.14em] ${tone.text} opacity-90`}
                >
                    {message}
                </div>

                <div className="mt-3 h-px w-full bg-white/10" />

                <div className="mt-2 text-center text-[9px] uppercase tracking-[0.22em] text-white/35">
                    Adaptive mobile scan layer
                </div>
            </div>
        </div>
    );
}