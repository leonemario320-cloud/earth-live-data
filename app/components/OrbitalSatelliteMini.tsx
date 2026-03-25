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

type ThemeConfig = {
    main: string;
    soft: string;
    ring: string;
    core: string;
    panelTop: string;
    panelBottom: string;
};

const DEFAULT_THEME: ThemeConfig = {
    main: "rgba(103, 232, 249, 0.92)",
    soft: "rgba(34, 211, 238, 0.16)",
    ring: "rgba(103, 232, 249, 0.26)",
    core: "rgba(207, 250, 254, 0.96)",
    panelTop: "rgba(103, 232, 249, 0.95)",
    panelBottom: "rgba(14, 165, 233, 0.42)",
};

const LAYER_THEMES: Partial<Record<LayerId, ThemeConfig>> = {
    population: {
        main: "rgba(103, 232, 249, 0.92)",
        soft: "rgba(34, 211, 238, 0.16)",
        ring: "rgba(103, 232, 249, 0.28)",
        core: "rgba(236, 254, 255, 0.96)",
        panelTop: "rgba(125, 211, 252, 0.94)",
        panelBottom: "rgba(14, 165, 233, 0.42)",
    },
    births: {
        main: "rgba(94, 234, 212, 0.92)",
        soft: "rgba(20, 184, 166, 0.16)",
        ring: "rgba(94, 234, 212, 0.28)",
        core: "rgba(240, 253, 250, 0.96)",
        panelTop: "rgba(94, 234, 212, 0.94)",
        panelBottom: "rgba(13, 148, 136, 0.42)",
    },
    deaths: {
        main: "rgba(251, 191, 36, 0.88)",
        soft: "rgba(217, 119, 6, 0.16)",
        ring: "rgba(251, 191, 36, 0.24)",
        core: "rgba(255, 251, 235, 0.96)",
        panelTop: "rgba(252, 211, 77, 0.92)",
        panelBottom: "rgba(180, 83, 9, 0.4)",
    },
    flights: {
        main: "rgba(125, 211, 252, 0.94)",
        soft: "rgba(14, 165, 233, 0.16)",
        ring: "rgba(125, 211, 252, 0.28)",
        core: "rgba(240, 249, 255, 0.96)",
        panelTop: "rgba(125, 211, 252, 0.95)",
        panelBottom: "rgba(2, 132, 199, 0.44)",
    },
    earthquakes: {
        main: "rgba(232, 121, 249, 0.92)",
        soft: "rgba(192, 38, 211, 0.16)",
        ring: "rgba(232, 121, 249, 0.26)",
        core: "rgba(253, 244, 255, 0.96)",
        panelTop: "rgba(240, 171, 252, 0.92)",
        panelBottom: "rgba(162, 28, 175, 0.42)",
    },
    fires: {
        main: "rgba(251, 146, 60, 0.94)",
        soft: "rgba(249, 115, 22, 0.16)",
        ring: "rgba(251, 146, 60, 0.26)",
        core: "rgba(255, 247, 237, 0.96)",
        panelTop: "rgba(253, 186, 116, 0.94)",
        panelBottom: "rgba(194, 65, 12, 0.44)",
    },
    storms: {
        main: "rgba(167, 139, 250, 0.92)",
        soft: "rgba(139, 92, 246, 0.16)",
        ring: "rgba(167, 139, 250, 0.26)",
        core: "rgba(245, 243, 255, 0.96)",
        panelTop: "rgba(196, 181, 253, 0.94)",
        panelBottom: "rgba(109, 40, 217, 0.42)",
    },
    suicides: {
        main: "rgba(244, 114, 182, 0.88)",
        soft: "rgba(236, 72, 153, 0.16)",
        ring: "rgba(244, 114, 182, 0.24)",
        core: "rgba(253, 242, 248, 0.96)",
        panelTop: "rgba(249, 168, 212, 0.92)",
        panelBottom: "rgba(190, 24, 93, 0.38)",
    },
    roadDeaths: {
        main: "rgba(248, 113, 113, 0.9)",
        soft: "rgba(239, 68, 68, 0.16)",
        ring: "rgba(248, 113, 113, 0.24)",
        core: "rgba(254, 242, 242, 0.96)",
        panelTop: "rgba(252, 165, 165, 0.92)",
        panelBottom: "rgba(185, 28, 28, 0.4)",
    },
    smokingDeaths: {
        main: "rgba(148, 163, 184, 0.88)",
        soft: "rgba(100, 116, 139, 0.16)",
        ring: "rgba(148, 163, 184, 0.22)",
        core: "rgba(248, 250, 252, 0.95)",
        panelTop: "rgba(203, 213, 225, 0.92)",
        panelBottom: "rgba(71, 85, 105, 0.4)",
    },
    alcoholDeaths: {
        main: "rgba(250, 204, 21, 0.88)",
        soft: "rgba(202, 138, 4, 0.16)",
        ring: "rgba(250, 204, 21, 0.22)",
        core: "rgba(254, 252, 232, 0.96)",
        panelTop: "rgba(253, 224, 71, 0.92)",
        panelBottom: "rgba(161, 98, 7, 0.4)",
    },
    abortions: {
        main: "rgba(129, 140, 248, 0.88)",
        soft: "rgba(99, 102, 241, 0.16)",
        ring: "rgba(129, 140, 248, 0.24)",
        core: "rgba(238, 242, 255, 0.96)",
        panelTop: "rgba(165, 180, 252, 0.92)",
        panelBottom: "rgba(67, 56, 202, 0.4)",
    },
    illegalDrugSpend: {
        main: "rgba(52, 211, 153, 0.88)",
        soft: "rgba(16, 185, 129, 0.16)",
        ring: "rgba(52, 211, 153, 0.24)",
        core: "rgba(236, 253, 245, 0.96)",
        panelTop: "rgba(110, 231, 183, 0.92)",
        panelBottom: "rgba(4, 120, 87, 0.4)",
    },
    oceans: {
        main: "rgba(34, 211, 238, 0.92)",
        soft: "rgba(6, 182, 212, 0.16)",
        ring: "rgba(34, 211, 238, 0.26)",
        core: "rgba(236, 254, 255, 0.96)",
        panelTop: "rgba(103, 232, 249, 0.92)",
        panelBottom: "rgba(8, 145, 178, 0.42)",
    },
    energy: {
        main: "rgba(250, 204, 21, 0.92)",
        soft: "rgba(234, 179, 8, 0.16)",
        ring: "rgba(250, 204, 21, 0.26)",
        core: "rgba(254, 252, 232, 0.96)",
        panelTop: "rgba(253, 224, 71, 0.92)",
        panelBottom: "rgba(161, 98, 7, 0.42)",
    },
    food: {
        main: "rgba(34, 197, 94, 0.92)",
        soft: "rgba(22, 163, 74, 0.16)",
        ring: "rgba(34, 197, 94, 0.26)",
        core: "rgba(240, 253, 244, 0.96)",
        panelTop: "rgba(134, 239, 172, 0.92)",
        panelBottom: "rgba(21, 128, 61, 0.42)",
    },
    water: {
        main: "rgba(56, 189, 248, 0.92)",
        soft: "rgba(14, 165, 233, 0.16)",
        ring: "rgba(56, 189, 248, 0.26)",
        core: "rgba(240, 249, 255, 0.96)",
        panelTop: "rgba(125, 211, 252, 0.92)",
        panelBottom: "rgba(3, 105, 161, 0.42)",
    },
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

export default function OrbitalSatelliteMini({
                                                 activeLayer,
                                                 liveValues,
                                                 liveStats = {},
                                                 previousLiveData = {},
                                             }: Props) {
    const [scanLayer, setScanLayer] = useState<LayerId>(activeLayer);
    const [message, setMessage] = useState("");
    const [pingKey, setPingKey] = useState(0);
    const scanIndexRef = useRef(0);

    const theme = useMemo(
        () => LAYER_THEMES[scanLayer] ?? DEFAULT_THEME,
        [scanLayer]
    );

    const lastManualLayerRef = useRef<LayerId>(activeLayer);

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
        setPingKey((prev) => prev + 1);
    }, [activeLayer]);

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
            setPingKey((prev) => prev + 1);
        }, 6500);

        return () => window.clearInterval(interval);
    }, []);

    return (
        <div className="pointer-events-none relative h-[180px] w-full overflow-visible" aria-hidden="true">
            <div className="absolute inset-0">

                <div className="satellite-anchor">
                    <div
                        key={pingKey}
                        className="satellite-ping"
                        style={{
                            borderColor: theme.ring,
                            boxShadow: `0 0 18px ${theme.soft}`,
                        }}
                    />

                    <div className="satellite-body">
                        <div
                            className="satellite-panel satellite-panel-left"
                            style={{
                                background: `linear-gradient(180deg, ${theme.panelTop}, ${theme.panelBottom})`,
                                borderColor: theme.ring,
                                boxShadow: `0 0 16px ${theme.soft}`,
                            }}
                        >
                            <span className="panel-grid" />
                        </div>

                        <div
                            className="satellite-core-shell"
                            style={{
                                boxShadow: `0 0 18px ${theme.soft}, inset 0 0 10px rgba(255,255,255,0.12)`,
                            }}
                        >
                            <div
                                className="satellite-core"
                                style={{
                                    background: `radial-gradient(circle at 30% 30%, ${theme.core}, ${theme.main})`,
                                    boxShadow: `0 0 20px ${theme.soft}, inset 0 0 10px rgba(255,255,255,0.24)`,
                                }}
                            >
                                <span className="core-lens" />
                                <span className="core-dot" />
                            </div>
                        </div>

                        <div
                            className="satellite-panel satellite-panel-right"
                            style={{
                                background: `linear-gradient(180deg, ${theme.panelTop}, ${theme.panelBottom})`,
                                borderColor: theme.ring,
                                boxShadow: `0 0 16px ${theme.soft}`,
                            }}
                        >
                            <span className="panel-grid" />
                        </div>

                        <div
                            className="satellite-antenna"
                            style={{
                                background: theme.main,
                                boxShadow: `0 0 10px ${theme.soft}`,
                            }}
                        >
                            <span className="antenna-tip" style={{ boxShadow: `0 0 8px ${theme.soft}` }} />
                        </div>

                        <div
                            className="satellite-dish"
                            style={{
                                background: `linear-gradient(180deg, rgba(255,255,255,0.22), ${theme.soft})`,
                                boxShadow: `0 0 10px ${theme.soft}`,
                            }}
                        />

                        <div className="satellite-glow" style={{ background: theme.soft }} />
                    </div>
                    <div
                        className="satellite-heading"
                        style={{
                            color: theme.main,
                            textShadow: `0 0 10px ${theme.soft}`,
                        }}
                    >
                        ORBITAL FEED
                    </div>
                    <div
                        key={`${scanLayer}-${pingKey}`}
                        className="satellite-label live-message-enter"
                        style={{
                            color: theme.main,
                            textShadow: `0 0 12px ${theme.soft}`,
                        }}
                    >
                        {message}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .satellite-anchor {
                    position: absolute;
                    left: 50%;
                    top: 190%;
                    transform: translate(-50%, -16px);
                    
                }
                

                .satellite-body {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 104px;
                    height: 38px;
                    animation:
                        selfSpin 8.5s linear infinite,
                        floatBob 3.4s ease-in-out infinite;
                    transform-origin: center center;
                }

                .satellite-core-shell {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    border-radius: 10px;
                    background: linear-gradient(
                        180deg,
                        rgba(255, 255, 255, 0.18),
                        rgba(255, 255, 255, 0.04)
                    );
                    border: 1px solid rgba(255, 255, 255, 0.18);
                    backdrop-filter: blur(4px);
                }

                .satellite-core {
                    position: relative;
                    width: 18px;
                    height: 18px;
                    border-radius: 999px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .core-lens {
                    position: absolute;
                    inset: 3px;
                    border-radius: 999px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    opacity: 0.9;
                }

                .core-dot {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    width: 4px;
                    height: 4px;
                    border-radius: 999px;
                    transform: translate(-50%, -50%);
                    background: white;
                    box-shadow: 0 0 8px rgba(255, 255, 255, 0.85);
                }

                .satellite-panel {
                    position: relative;
                    overflow: hidden;
                    width: 31px;
                    height: 13px;
                    border-radius: 4px;
                    border: 1px solid;
                    box-shadow: inset 0 0 8px rgba(255, 255, 255, 0.08);
                }

                .satellite-panel::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        115deg,
                        transparent 0%,
                        rgba(255, 255, 255, 0.28) 48%,
                        transparent 70%
                    );
                    opacity: 0.55;
                    transform: translateX(-20%);
                }

                .panel-grid {
                    position: absolute;
                    inset: 2px;
                    border-radius: 3px;
                    background-image:
                        linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px);
                    background-size: 6px 100%, 100% 5px;
                    opacity: 0.65;
                }

                .satellite-panel-left {
                    margin-right: 8px;
                }

                .satellite-panel-right {
                    margin-left: 8px;
                }

                .satellite-antenna {
                    position: absolute;
                    top: -8px;
                    left: 50%;
                    width: 2px;
                    height: 14px;
                    transform: translateX(-50%);
                    border-radius: 999px;
                    z-index: 3;
                }

                .antenna-tip {
                    position: absolute;
                    top: -3px;
                    left: 50%;
                    width: 6px;
                    height: 6px;
                    border-radius: 999px;
                    transform: translateX(-50%);
                    background: white;
                }

                .satellite-dish {
                    position: absolute;
                    top: -4px;
                    left: calc(50% + 12px);
                    width: 10px;
                    height: 7px;
                    border-radius: 50% 50% 45% 45%;
                    border: 1px solid rgba(255, 255, 255, 0.22);
                    transform: rotate(18deg);
                    z-index: 2;
                }

                .satellite-glow {
                    position: absolute;
                    inset: -12px;
                    border-radius: 999px;
                    filter: blur(14px);
                    z-index: 0;
                }

                .satellite-ping {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    width: 30px;
                    height: 30px;
                    border-radius: 999px;
                    border: 1px solid;
                    transform: translate(-50%, -50%);
                    opacity: 0;
                    animation: dataPing 1.5s ease-out forwards;
                    pointer-events: none;
                }

                .satellite-heading {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -70px);
                    white-space: nowrap;
                    font-size: 10px;
                    letter-spacing: 0.26em;
                    text-transform: uppercase;
                    opacity: 0.68;
                    font-weight: 600;
                    text-align: center;
                }

                .satellite-label {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, 50px);
                    white-space: nowrap;
                    font-size: 9px;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    opacity: 0.82;
                    max-width: 380px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    text-align: center;
                }

                .live-message-enter {
                    animation: messageFade 0.45s ease-out forwards;
                }

                @keyframes selfSpin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes floatBob {
                    0% { margin-top: 0px; }
                    50% { margin-top: -5px; }
                    100% { margin-top: 0px; }
                }

                @keyframes dataPing {
                    0% {
                        opacity: 0.92;
                        transform: translate(-50%, -50%) scale(0.8);
                    }
                    70% { opacity: 0.36; }
                    100% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(5.2);
                    }
                }

                @keyframes messageFade {
                    0% {
                        opacity: 0;
                        transform: translate(-50%, 56px);
                    }
                    100% {
                        opacity: 0.82;
                        transform: translate(-50%, 50px);
                    }
                }
            `}</style>
        </div>
    );
}