"use client";

import OrbitalMobileFeed from "../components/OrbitalMobileFeed";
import { useDeviceTier } from "../hooks/useDeviceTier";
import OrbitalSatelliteMini from "../components/OrbitalSatelliteMini";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Sphere, Stars } from "@react-three/drei";
import * as THREE from "three";
import {
    Activity,
    AlertTriangle,
    BadgeDollarSign,
    Car,
    Cigarette,
    CloudLightning,
    DollarSign,
    Flame,
    Globe2,
    HeartPulse,
    Plane,
    Sparkles,
    Users,
    Waves,
    Wine,
} from "lucide-react";

import { earthCopy, type AppLanguage } from "@/lib/earthCopy";
import { getEarthInsights } from "@/lib/earthInsights";
import InfoModal from "../components/InfoModal";
import GuardianStar from "../components/GuardianStar";
import Satellite from "../Satellite";
import { getEstimatedLiveData, getPolledLiveData } from "./earthLiveData";

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

type Layer = {
    id: LayerId;
    label: string;
    value: string;
    subtitle: string;
    glow: string;
    icon: React.ComponentType<{ className?: string }>;
};

type Point = {
    lat: number;
    lon: number;
    size?: number;
};

type ShootingStar = {
    id: number;
    left: number;
    top: number;
    duration: number;
    delay: number;
};

type UfoState = {
    visible: boolean;
    key: number;
};

type BottomModalType = "supporter" | "insights" | "donation" | null;
type ToastTone = "supporter" | "pro" | "earth" | "donation" | "locked";

type AppToast = {
    title: string;
    subtitle: string;
    tone: ToastTone;
    amountLabel?: string;
};

type UserAccess = {
    supporter: boolean;
    pro: boolean;
    earthInsights: boolean;
    donator: boolean;
    donationAmount: number;
};

const BASE_LAYER_META: Array<{
    id: LayerId;
    glow: string;
    icon: React.ComponentType<{ className?: string }>;
}> = [
    { id: "population", glow: "#38bdf8", icon: Users },
    { id: "births", glow: "#22c55e", icon: Activity },
    { id: "deaths", glow: "#f43f5e", icon: AlertTriangle },
    { id: "flights", glow: "#60a5fa", icon: Plane },
    { id: "earthquakes", glow: "#f59e0b", icon: Activity },
    { id: "fires", glow: "#fb923c", icon: Flame },
    { id: "suicides", glow: "#f472b6", icon: HeartPulse },
    { id: "roadDeaths", glow: "#fb7185", icon: Car },
    { id: "smokingDeaths", glow: "#c084fc", icon: Cigarette },
    { id: "alcoholDeaths", glow: "#f97316", icon: Wine },
    { id: "abortions", glow: "#14b8a6", icon: BadgeDollarSign },
    { id: "illegalDrugSpend", glow: "#eab308", icon: DollarSign },
    { id: "storms", glow: "#a78bfa", icon: CloudLightning },
    { id: "oceans", glow: "#06b6d4", icon: Waves },
    { id: "energy", glow: "#facc15", icon: Activity },
    { id: "water", glow: "#38bdf8", icon: Waves },
    { id: "food", glow: "#22c55e", icon: Users },
];

const POINTS: Record<LayerId, Point[]> = {
    population: [
        { lat: 40, lon: -74, size: 0.01 },
        { lat: 51.5, lon: -0.1, size: 0.009 },
        { lat: 28.6, lon: 77.2, size: 0.011 },
        { lat: 35.7, lon: 139.7, size: 0.01 },
    ],
    births: [
        { lat: 19.0, lon: 72.8 },
        { lat: 24.9, lon: 67.0 },
        { lat: 6.5, lon: 3.4 },
        { lat: 14.6, lon: 121.0 },
    ],
    deaths: [
        { lat: 52.5, lon: 13.4 },
        { lat: 41.9, lon: 12.5 },
        { lat: 55.7, lon: 37.6 },
        { lat: 39.9, lon: 116.4 },
    ],
    flights: [
        { lat: 33.9, lon: -118.4 },
        { lat: 25.2, lon: 55.3 },
        { lat: 50.0, lon: 8.6 },
        { lat: 1.3, lon: 103.8 },
    ],
    earthquakes: [
        { lat: 38.3, lon: 142.4 },
        { lat: -6.1, lon: 130.5 },
        { lat: -33.0, lon: -71.6 },
        { lat: 36.2, lon: 70.8 },
    ],
    fires: [
        { lat: -12.4, lon: 130.9 },
        { lat: -3.5, lon: -62.2 },
        { lat: 38.6, lon: -121.5 },
        { lat: -33.9, lon: 18.4 },
    ],
    suicides: [
        { lat: 35.6, lon: 139.6 },
        { lat: 48.8, lon: 2.3 },
        { lat: -23.5, lon: -46.6 },
        { lat: 40.7, lon: -74.0 },
    ],
    roadDeaths: [
        { lat: 28.6, lon: 77.2 },
        { lat: 19.4, lon: -99.1 },
        { lat: -1.2, lon: 36.8 },
        { lat: 30.0, lon: 31.2 },
    ],
    smokingDeaths: [
        { lat: 39.9, lon: 116.4 },
        { lat: 55.7, lon: 37.6 },
        { lat: 34.0, lon: -118.2 },
        { lat: 41.9, lon: 12.5 },
    ],
    alcoholDeaths: [
        { lat: 52.5, lon: 13.4 },
        { lat: 59.9, lon: 30.3 },
        { lat: -34.6, lon: -58.4 },
        { lat: 50.1, lon: 14.4 },
    ],
    abortions: [
        { lat: 40.4, lon: -3.7 },
        { lat: 19.1, lon: 72.9 },
        { lat: -34.9, lon: 138.6 },
        { lat: 51.5, lon: -0.1 },
    ],
    illegalDrugSpend: [
        { lat: 25.7, lon: -100.3 },
        { lat: 4.7, lon: -74.1 },
        { lat: 52.4, lon: 13.4 },
        { lat: 34.0, lon: -118.2 },
    ],
    storms: [
        { lat: 14.6, lon: -61.0 },
        { lat: 26.2, lon: -80.1 },
        { lat: 18.5, lon: 121.0 },
        { lat: -20.2, lon: 57.5 },
    ],
    oceans: [
        { lat: 0.0, lon: -140.0 },
        { lat: -35.0, lon: 20.0 },
        { lat: 15.0, lon: 150.0 },
        { lat: 48.0, lon: -30.0 },
    ],
    energy: [
        { lat: 31.2, lon: 121.5 },
        { lat: 40.7, lon: -74.0 },
        { lat: 48.8, lon: 2.3 },
        { lat: 28.6, lon: 77.2 },
    ],
    water: [
        { lat: -15.7, lon: -47.9 },
        { lat: 34.0, lon: -118.2 },
        { lat: 51.5, lon: -0.1 },
        { lat: 35.7, lon: 139.7 },
    ],
    food: [
        { lat: 19.0, lon: 72.8 },
        { lat: -23.5, lon: -46.6 },
        { lat: 41.9, lon: 12.5 },
        { lat: 39.9, lon: 116.4 },
    ],
};

const SLOW_LAYERS: LayerId[] = [
    "suicides",
    "roadDeaths",
    "smokingDeaths",
    "alcoholDeaths",
];

const POLLED_LAYERS: LayerId[] = [
    "flights",
    "earthquakes",
    "fires",
    "storms",
    "oceans",
];

function latLonToVector3(lat: number, lon: number, radius: number): [number, number, number] {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return [x, y, z];
}

function formatLastUpdateTime(timestamp: number | null, locale: string, syncingLabel: string) {
    if (!timestamp) return syncingLabel;
    const d = new Date(timestamp);
    return d.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function EarthIntroLoader({
                              visible,
                              progress,
                              loadingTitle,
                              loadingSubtitle,
                              loadingDataLabel,
                          }: {
    visible: boolean;
    progress: number;
    loadingTitle: string;
    loadingSubtitle: string;
    loadingDataLabel: string;
}) {
    if (!visible) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                background:
                    "radial-gradient(circle at 20% 20%, rgba(56,189,248,0.14), transparent 22%), radial-gradient(circle at 80% 20%, rgba(168,85,247,0.10), transparent 20%), radial-gradient(circle at 50% 80%, rgba(34,211,238,0.08), transparent 24%), #02040a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
            }}
        >
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                <div className="loader-meteor loader-meteor-1" />
                <div className="loader-meteor loader-meteor-2" />
            </div>

            <div
                style={{
                    width: "100%",
                    maxWidth: 520,
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        position: "relative",
                        width: 180,
                        height: 180,
                        marginBottom: 28,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div className="planet-glow" />
                    <div className="planet-ring planet-ring-1" />
                    <div className="planet-ring planet-ring-2" />
                    <div className="planet-ring planet-ring-3" />
                    <div className="mini-planet">
                        <div className="mini-planet-shine" />
                        <div className="mini-continent mini-continent-1" />
                        <div className="mini-continent mini-continent-2" />
                        <div className="mini-continent mini-continent-3" />
                    </div>
                </div>

                <div
                    style={{
                        fontSize: 11,
                        letterSpacing: "0.38em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.45)",
                        marginBottom: 12,
                    }}
                >
                    EARTH // LIVE
                </div>

                <h1
                    style={{
                        margin: 0,
                        fontSize: 40,
                        lineHeight: 1,
                        fontWeight: 700,
                        color: "#ffffff",
                    }}
                >
                    {loadingTitle}
                </h1>

                <p
                    style={{
                        marginTop: 14,
                        marginBottom: 0,
                        fontSize: 15,
                        lineHeight: 1.7,
                        color: "rgba(255,255,255,0.58)",
                        maxWidth: 460,
                    }}
                >
                    {loadingSubtitle}
                </p>

                <div style={{ width: "100%", maxWidth: 360, marginTop: 32 }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 10,
                            fontSize: 11,
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,0.42)",
                        }}
                    >
                        <span>{loadingDataLabel}</span>
                        <span>{progress}%</span>
                    </div>

                    <div
                        style={{
                            height: 12,
                            width: "100%",
                            borderRadius: 999,
                            background: "rgba(255,255,255,0.10)",
                            overflow: "hidden",
                            boxShadow: "inset 0 0 16px rgba(255,255,255,0.05)",
                        }}
                    >
                        <div
                            style={{
                                height: "100%",
                                width: `${progress}%`,
                                borderRadius: 999,
                                background:
                                    "linear-gradient(90deg, #67e8f9 0%, #38bdf8 50%, #a5f3fc 100%)",
                                transition: "width 180ms ease-out",
                                boxShadow: "0 0 18px rgba(56,189,248,0.35)",
                            }}
                        />
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .planet-glow {
                    position: absolute;
                    inset: 18px;
                    border-radius: 999px;
                    background: rgba(34, 211, 238, 0.12);
                    filter: blur(28px);
                }
                .planet-ring {
                    position: absolute;
                    border-radius: 999px;
                    border: 1px solid rgba(125, 211, 252, 0.18);
                }
                .planet-ring-1 {
                    inset: 2px;
                    animation: spinSlow 16s linear infinite;
                }
                .planet-ring-2 {
                    inset: 14px;
                    border-color: rgba(255, 255, 255, 0.1);
                    animation: spinReverse 22s linear infinite;
                }
                .planet-ring-3 {
                    inset: 24px;
                    border: 2px solid transparent;
                    border-top-color: rgba(103, 232, 249, 0.75);
                    border-right-color: rgba(125, 211, 252, 0.65);
                    animation: spinMedium 4.2s linear infinite;
                }
                .mini-planet {
                    position: relative;
                    width: 110px;
                    height: 110px;
                    border-radius: 999px;
                    overflow: hidden;
                    background: radial-gradient(circle at 32% 28%, rgba(255,255,255,0.98) 0%, rgba(125,211,252,0.3) 22%, rgba(14,116,144,0.18) 56%, rgba(2,6,23,0.96) 100%);
                    box-shadow: 0 0 60px rgba(34, 211, 238, 0.16);
                }
                .mini-planet-shine {
                    position: absolute;
                    inset: 0;
                    border-radius: 999px;
                    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1);
                }
                .mini-continent {
                    position: absolute;
                    border-radius: 999px;
                    background: rgba(134,239,172,0.22);
                    filter: blur(1px);
                }
                .mini-continent-1 { width: 34px; height: 22px; left: 18px; top: 24px; transform: rotate(-16deg); }
                .mini-continent-2 { width: 24px; height: 16px; right: 16px; top: 28px; transform: rotate(12deg); }
                .mini-continent-3 { width: 28px; height: 18px; left: 34px; bottom: 20px; transform: rotate(18deg); }
                .loader-meteor {
                    position: absolute;
                    height: 2px;
                    border-radius: 999px;
                    transform: rotate(25deg);
                    background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0) 100%);
                    opacity: 0.75;
                }
                .loader-meteor-1 {
                    width: 110px;
                    left: 12%;
                    top: 18%;
                    animation: loaderMeteorOne 6s linear infinite;
                }
                .loader-meteor-2 {
                    width: 90px;
                    right: 14%;
                    top: 26%;
                    animation: loaderMeteorTwo 7s linear infinite;
                }
                @keyframes spinSlow {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes spinMedium {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes spinReverse {
                    0% { transform: rotate(360deg); }
                    100% { transform: rotate(0deg); }
                }
                @keyframes loaderMeteorOne {
                    0% { transform: translate3d(0,0,0) rotate(25deg); opacity: 0; }
                    12% { opacity: 0.75; }
                    100% { transform: translate3d(-220px,140px,0) rotate(25deg); opacity: 0; }
                }
                @keyframes loaderMeteorTwo {
                    0% { transform: translate3d(0,0,0) rotate(25deg); opacity: 0; }
                    10% { opacity: 0.7; }
                    100% { transform: translate3d(-180px,120px,0) rotate(25deg); opacity: 0; }
                }
                @keyframes livePulse {
                    0% { transform: scale(1); opacity: 0.55; }
                    50% { transform: scale(1.15); opacity: 1; }
                    100% { transform: scale(1); opacity: 0.55; }
                }
                @keyframes shimmerBar {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(220%); }
                }
            `}</style>
        </div>
    );
}

function DataPoints({
                        activeLayer,
                        isNight,
                    }: {
    activeLayer: LayerId;
    isNight: boolean;
}) {
    const points = POINTS[activeLayer];
    const glow =
        BASE_LAYER_META.find((layer) => layer.id === activeLayer)?.glow ?? "#38bdf8";

    return (
        <group>
            {points.map((point, index) => {
                const [x, y, z] = latLonToVector3(point.lat, point.lon, 1.45);
                const size = point.size ?? 0.009;

                return (
                    <group key={`${activeLayer}-${index}`} position={[x, y, z]}>
                        <mesh>
                            <sphereGeometry args={[size * 2, 10, 10]} />
                            <meshBasicMaterial
                                color={glow}
                                transparent
                                opacity={isNight ? 0.065 : 0.03}
                            />
                        </mesh>
                    </group>
                );
            })}
        </group>
    );
}

function Earth({
                   activeLayer,
                   isNight,
               }: {
    activeLayer: LayerId;
    isNight: boolean;
}) {
    const earthRef = useRef<THREE.Group | null>(null);
    const cloudRef = useRef<THREE.Mesh | null>(null);
    const atmosphereRef = useRef<THREE.Mesh | null>(null);

    const [dayMap, nightMap, cloudMap] = useLoader(THREE.TextureLoader, [
        "/textures/2k_earth_daymap.jpg",
        "/textures/2k_earth_nightmap.jpg",
        "/textures/2k_earth_clouds.jpg",
    ]);

    useMemo(() => {
        dayMap.colorSpace = THREE.SRGBColorSpace;
        nightMap.colorSpace = THREE.SRGBColorSpace;
        cloudMap.colorSpace = THREE.SRGBColorSpace;

        [dayMap, nightMap, cloudMap].forEach((texture) => {
            texture.anisotropy = 8;
        });
    }, [dayMap, nightMap, cloudMap]);

    useFrame((state) => {
        if (earthRef.current) earthRef.current.rotation.y += 0.00075;
        if (cloudRef.current) cloudRef.current.rotation.y += 0.001;

        if (atmosphereRef.current) {
            const pulse = 1.01 + Math.sin(state.clock.elapsedTime * 1.2) * 0.0015;
            atmosphereRef.current.scale.setScalar(pulse);
        }
    });

    return (
        <group rotation={[0, 0, THREE.MathUtils.degToRad(4.5)]}>
            <mesh ref={atmosphereRef} scale={1.012}>
                <sphereGeometry args={[1.49, 64, 64]} />
                <meshBasicMaterial
                    color="#7dd3fc"
                    transparent
                    opacity={isNight ? 0.11 : 0.038}
                    side={THREE.BackSide}
                />
            </mesh>

            <group ref={earthRef}>
                <Sphere args={[1.45, 128, 128]}>
                    <meshStandardMaterial
                        map={dayMap}
                        emissiveMap={nightMap}
                        emissive={new THREE.Color("#ffd27a")}
                        emissiveIntensity={isNight ? 1.6 : 0}
                        metalness={0.06}
                        roughness={0.88}
                    />
                </Sphere>

                <DataPoints activeLayer={activeLayer} isNight={isNight} />
            </group>

            <mesh ref={cloudRef}>
                <sphereGeometry args={[1.468, 96, 96]} />
                <meshStandardMaterial
                    map={cloudMap}
                    transparent
                    opacity={0.12}
                    depthWrite={false}
                />
            </mesh>
        </group>
    );
}

function AirTraffic() {
    const planeCount = 15;
    const planeRefs = useRef<THREE.Group[]>([]);
    const lineRefs = useRef<THREE.Line[]>([]);
    const trailPointsRef = useRef<THREE.Vector3[][]>([]);
    const flightsRef = useRef<any[]>([]);

    const airports = useMemo<[number, number][]>(() => [
        [40.7128, -74.006],
        [34.0522, -118.2437],
        [51.5074, -0.1278],
        [48.8566, 2.3522],
        [52.52, 13.405],
        [25.2048, 55.2708],
        [35.6895, 139.6917],
        [1.3521, 103.8198],
        [-33.8688, 151.2093],
        [28.6139, 77.209],
        [19.4326, -99.1332],
        [-23.5505, -46.6333],
        [30.0444, 31.2357],
        [37.5665, 126.978],
    ], []);

    function latLonToVec(lat: number, lon: number, radius: number) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);

        return new THREE.Vector3(x, y, z);
    }

    function createFlight(index: number) {
        let a = Math.floor(Math.random() * airports.length);
        let b = Math.floor(Math.random() * airports.length);

        while (b === a) {
            b = Math.floor(Math.random() * airports.length);
        }

        const start = latLonToVec(airports[a][0], airports[a][1], 1.455);
        const end = latLonToVec(airports[b][0], airports[b][1], 1.455);

        return {
            start,
            end,
            startNorm: start.clone().normalize(),
            endNorm: end.clone().normalize(),
            progress: Math.random(),
            speed: 0.012 + Math.random() * 0.008,
            altitude: 0.008 + Math.random() * 0.015,
            laneOffset: (index - planeCount / 2) * 0.02,
        };
    }

    useEffect(() => {
        flightsRef.current = Array.from({ length: planeCount }, (_, i) => createFlight(i));
        trailPointsRef.current = Array.from({ length: planeCount }).map(() => []);
    }, []);

    useFrame((_, delta) => {
        flightsRef.current.forEach((flight, i) => {
            const plane = planeRefs.current[i];
            const line = lineRefs.current[i];
            if (!plane || !line) return;

            flight.progress += flight.speed * delta;
            if (flight.progress >= 1) {
                flightsRef.current[i] = createFlight(i);
                trailPointsRef.current[i] = [];
                return;
            }

            const t = flight.progress;
            const nextT = Math.min(t + 0.01, 1);

            const dir = flight.startNorm.clone().lerp(flight.endNorm, t).normalize();
            const nextDir = flight.startNorm.clone().lerp(flight.endNorm, nextT).normalize();

            const arcLift = Math.sin(t * Math.PI) * flight.altitude;
            const nextArcLift = Math.sin(nextT * Math.PI) * flight.altitude;

            const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
            const nextSide = new THREE.Vector3().crossVectors(nextDir, new THREE.Vector3(0, 1, 0)).normalize();

            const pos = dir
                .clone()
                .multiplyScalar(1.455 + arcLift)
                .add(side.multiplyScalar(flight.laneOffset));

            const nextPos = nextDir
                .clone()
                .multiplyScalar(1.455 + nextArcLift)
                .add(nextSide.multiplyScalar(flight.laneOffset));

            plane.position.copy(pos);
            plane.lookAt(nextPos);

            const trail = trailPointsRef.current[i];
            trail.push(pos.clone());

            if (trail.length > 35) {
                trail.shift();
            }

            const geometry = line.geometry as THREE.BufferGeometry;
            geometry.setFromPoints(trail);
        });
    });

    return (
        <group>
            {Array.from({ length: planeCount }).map((_, i) => (
                <group key={i}>
                    <line
                        ref={(el) => {
                            if (el) lineRefs.current[i] = el as unknown as THREE.Line;
                        }}
                    >
                        <bufferGeometry />
                        <lineBasicMaterial color="#7dd3fc" transparent opacity={0.75} />
                    </line>

                    <group
                        ref={(el) => {
                            if (el) planeRefs.current[i] = el;
                        }}
                        scale={0.18}
                    >
                        <mesh rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.01, 0.01, 0.22, 8]} />
                            <meshBasicMaterial color="#ffffff" />
                        </mesh>

                        <mesh>
                            <boxGeometry args={[0.18, 0.01, 0.04]} />
                            <meshBasicMaterial color="#dbeafe" />
                        </mesh>

                        <mesh position={[0.07, 0.035, 0]}>
                            <boxGeometry args={[0.03, 0.06, 0.01]} />
                            <meshBasicMaterial color="#dbeafe" />
                        </mesh>

                        <mesh position={[0.075, 0, 0]}>
                            <boxGeometry args={[0.06, 0.01, 0.025]} />
                            <meshBasicMaterial color="#dbeafe" />
                        </mesh>

                        <mesh position={[-0.11, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                            <coneGeometry args={[0.012, 0.04, 8]} />
                            <meshBasicMaterial color="#ffffff" />
                        </mesh>
                    </group>
                </group>
            ))}
        </group>
    );
}

function EarthScene({
                        activeLayer,
                        isNight,
                        hasPlanetGuardian,
                    }: {
    activeLayer: LayerId;
    isNight: boolean;
    isLowPerf?: boolean;
    hasPlanetGuardian: boolean;
}) {
    return (
        <Canvas camera={{ position: [0, 0, 8.4], fov: 40 }}>
            <color attach="background" args={["#02040a"]} />
            <fog attach="fog" args={["#02040a", 8, 16]} />

            <ambientLight intensity={isNight ? 0.2 : 0.22} />
            <directionalLight
                position={[8, 2, 6]}
                intensity={isNight ? 1.55 : 2.8}
                color="#ffffff"
            />

            <pointLight
                position={[3.2, 1.4, 3.2]}
                intensity={isNight ? 0.22 : 0.08}
                color="#8ec5ff"
            />

            <Suspense fallback={null}>
                <Stars radius={45} depth={22} count={1200} factor={2} fade speed={0.2} />
                <Earth activeLayer={activeLayer} isNight={isNight} />
                <AirTraffic />
                <Satellite />
                <GuardianStar enabled={hasPlanetGuardian} />
            </Suspense>

            <OrbitControls
                enablePan={false}
                enableZoom
                minDistance={4.2}
                maxDistance={9}
                rotateSpeed={0.6}
                zoomSpeed={0.65}
                enableDamping
                dampingFactor={0.06}
            />
        </Canvas>
    );
}

function GlassCard({
                       children,
                       className = "",
                   }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`rounded-[28px] border border-white/10 bg-black/25 backdrop-blur-2xl shadow-2xl ${className}`}>
            {children}
        </div>
    );
}

function SpaceDecor({
                        shootingStars,
                        ufo,
                    }: {
    shootingStars: ShootingStar[];
    ufo: UfoState;
}) {
    return (
        <>
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.10),transparent_18%),radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.08),transparent_16%),radial-gradient(circle_at_60%_75%,rgba(34,211,238,0.07),transparent_18%)]" />

                {shootingStars.map((star) => (
                    <div
                        key={star.id}
                        className="absolute h-[2px] w-24 rotate-[25deg] rounded-full bg-gradient-to-r from-white/0 via-white/90 to-white/0 opacity-70"
                        style={{
                            left: `${star.left}%`,
                            top: `${star.top}%`,
                            animation: `shootingStar ${star.duration}s linear ${star.delay}s infinite`,
                        }}
                    />
                ))}

                {ufo.visible && (
                    <div
                        key={ufo.key}
                        className="absolute left-[110%] top-[18%] z-10"
                        style={{ animation: "ufoFly 10s linear forwards" }}
                    >
                        <div className="relative">
                            <div className="absolute left-1/2 top-7 h-8 w-16 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-xl" />
                            <div className="h-4 w-12 rounded-full bg-slate-300 shadow-[0_0_18px_rgba(255,255,255,0.35)]" />
                            <div className="absolute left-1/2 top-[-8px] h-4 w-6 -translate-x-1/2 rounded-full bg-cyan-200/80 shadow-[0_0_16px_rgba(103,232,249,0.8)]" />
                            <div className="absolute left-1/2 top-3 h-2 w-8 -translate-x-1/2 rounded-full bg-cyan-400/40 blur-sm" />
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @keyframes shootingStar {
                    0% { transform: translate3d(0, 0, 0) rotate(25deg); opacity: 0; }
                    8% { opacity: 1; }
                    45% { opacity: 1; }
                    100% { transform: translate3d(-220px, 140px, 0) rotate(25deg); opacity: 0; }
                }

                @keyframes ufoFly {
                    0% { transform: translate3d(0, 0, 0); opacity: 0; }
                    8% { opacity: 1; }
                    30% { transform: translate3d(-28vw, 4vh, 0); opacity: 1; }
                    55% { transform: translate3d(-55vw, -2vh, 0); opacity: 1; }
                    80% { transform: translate3d(-82vw, 3vh, 0); opacity: 1; }
                    100% { transform: translate3d(-110vw, -1vh, 0); opacity: 0; }
                }
            `}</style>
        </>
    );
}

function LiveChip({
                      glow,
                      text,
                  }: {
    glow: string;
    text: string;
}) {
    return (
        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/55">
            <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{
                    background: glow,
                    boxShadow: `0 0 12px ${glow}`,
                    animation: "livePulse 1.8s ease-in-out infinite",
                }}
            />
            <span className="truncate">{text}</span>
        </div>
    );
}

function usePerformanceMode() {
    const [isLowPerf, setIsLowPerf] = useState(false);

    useEffect(() => {
        let frameCount = 0;
        let lastTime = performance.now();
        let mounted = true;

        const checkPerformance = (now: number) => {
            if (!mounted) return;

            frameCount++;

            if (now - lastTime >= 1000) {
                const fps = frameCount;
                frameCount = 0;
                lastTime = now;
                setIsLowPerf(fps < 45);
            }

            requestAnimationFrame(checkPerformance);
        };

        requestAnimationFrame(checkPerformance);

        return () => {
            mounted = false;
        };
    }, []);

    return isLowPerf;
}

function CenterToastModal({
                              appToast,
                              onClose,
                              closeLabel,
                              toneLabels,
                          }: {
    appToast: AppToast | null;
    onClose: () => void;
    closeLabel: string;
    toneLabels: Record<ToastTone, string>;
}) {
    if (typeof document === "undefined" || !appToast) return null;

    return createPortal(
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 999999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px",
            }}
        >
            <div
                onClick={onClose}
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.60)",
                    backdropFilter: "blur(6px)",
                }}
            />

            <div
                style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "380px",
                    borderRadius: "28px",
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "#02040a",
                    padding: "28px",
                    textAlign: "center",
                    boxShadow:
                        appToast.tone === "supporter"
                            ? "0 0 70px rgba(34,211,238,0.15)"
                            : appToast.tone === "pro"
                                ? "0 0 70px rgba(16,185,129,0.15)"
                                : appToast.tone === "earth"
                                    ? "0 0 70px rgba(56,189,248,0.15)"
                                    : appToast.tone === "donation"
                                        ? "0 0 70px rgba(250,204,21,0.15)"
                                        : "0 0 40px rgba(255,255,255,0.08)",
                }}
            >
                {appToast.amountLabel && (
                    <div
                        style={{
                            fontSize: "11px",
                            textTransform: "uppercase",
                            letterSpacing: "0.22em",
                            color: "rgba(255,255,255,0.5)",
                        }}
                    >
                        {appToast.amountLabel}
                    </div>
                )}

                <div
                    style={{
                        marginTop: "10px",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.22em",
                        color: "rgba(255,255,255,0.45)",
                    }}
                >
                    {toneLabels[appToast.tone]}
                </div>

                <div
                    style={{
                        marginTop: "14px",
                        fontSize: "28px",
                        fontWeight: 700,
                        color: "white",
                    }}
                >
                    {appToast.title}
                </div>

                <p
                    style={{
                        marginTop: "12px",
                        fontSize: "14px",
                        lineHeight: 1.7,
                        color: "rgba(255,255,255,0.68)",
                    }}
                >
                    {appToast.subtitle}
                </p>

                <button
                    onClick={onClose}
                    style={{
                        marginTop: "22px",
                        borderRadius: "14px",
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "rgba(255,255,255,0.05)",
                        color: "white",
                        padding: "10px 18px",
                        cursor: "pointer",
                    }}
                >
                    {closeLabel}
                </button>
            </div>
        </div>,
        document.body
    );
}
function parseLiveNumber(value?: string): number | undefined {
    if (!value) return undefined;

    let raw = value.trim();

    if (!raw) return undefined;

    raw = raw
        .replace(/\$/g, "")
        .replace(/\+/g, "")
        .replace(/\s/g, "")
        .replace(/,/g, "")
        .replace(/\.(?=\d{3}\b)/g, "");

    const suffix = raw.slice(-1).toUpperCase();
    let multiplier = 1;

    if (suffix === "K") multiplier = 1_000;
    if (suffix === "M") multiplier = 1_000_000;
    if (suffix === "B") multiplier = 1_000_000_000;
    if (suffix === "T") multiplier = 1_000_000_000_000;

    if (["K", "M", "B", "T"].includes(suffix)) {
        raw = raw.slice(0, -1);
    }

    raw = raw.replace(",", ".");

    const parsed = Number(raw);

    if (Number.isNaN(parsed)) return undefined;

    return parsed * multiplier;
}

const EARTH_INSIGHTS_URL = "https://buy.stripe.com/bJedR98GO21r9r8aej7Re0a";
const DONATION_LINKS: Record<number, string> = {
    1: "https://buy.stripe.com/7sY4gz1emgWlfPw4TZ7Re09",
    3: "https://buy.stripe.com/7sYaEX8GO0XnfPw0DJ7Re08",
    5: "https://buy.stripe.com/6oUbJ16yG6hH1YG86b7Re07",
    10: "https://buy.stripe.com/6oU28r8GOaxX5aSeuz7Re06",
    15: "https://buy.stripe.com/aFaeVdf5c5dDcDkaej7Re05",
    20: "https://buy.stripe.com/5kQ9AT0aicG5bzg4TZ7Re04",
    30: "https://buy.stripe.com/aFaaEX4qycG5cDk7277Re03",
    50: "https://buy.stripe.com/00w9ATf5caxX5aS5Y37Re02",
    75: "https://buy.stripe.com/6oU8wPaOWdK90UC86b7Re01",
    100: "https://buy.stripe.com/7sY4gz9KScG55aSdqv7Re00",
};

export default function EarthClient() {
    const { isPhone, isTablet, isDesktop } = useDeviceTier();
    const [lang, setLang] = useState<AppLanguage>("en");
    const copy = earthCopy[lang];
    const locale = lang === "it" ? "it-IT" : "en-US";
    const timeLocale = lang === "it" ? "it-IT" : "en-GB";

    const [activeLayer, setActiveLayer] = useState<LayerId>("population");
    const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
    const [ufo, setUfo] = useState<UfoState>({ visible: false, key: 0 });
    const [isNight, setIsNight] = useState(false);
    const [showIntroLoader, setShowIntroLoader] = useState(true);
    const [pageVisible, setPageVisible] = useState(false);
    const [loaderProgress, setLoaderProgress] = useState(0);
    const [lastPolledUpdate, setLastPolledUpdate] = useState<number | null>(null);
    const [appToast, setAppToast] = useState<AppToast | null>(null);
    const [activeModal, setActiveModal] = useState<BottomModalType>(null);

    const isLowPerf = usePerformanceMode();

    const liveLayersRef = useRef<HTMLDivElement | null>(null);
    const donationRef = useRef<HTMLDivElement | null>(null);
    const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const toneLabels: Record<ToastTone, string> = {
        supporter: copy.access.communityProject,
        pro: "Pro",
        earth: copy.access.earthInsights,
        donation: copy.access.planetGuardian,
        locked: copy.common.access,
    };

    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current);
            }
        };
    }, []);

    const showToast = (
        title: string,
        subtitle: string,
        tone: ToastTone,
        amountLabel?: string
    ) => {
        setAppToast({ title, subtitle, tone, amountLabel });

        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }

        toastTimeoutRef.current = setTimeout(() => {
            setAppToast(null);
        }, 3000);
    };

    const [userAccess, setUserAccess] = useState<UserAccess>(() => {
        if (typeof window === "undefined") {
            return {
                supporter: false,
                pro: false,
                earthInsights: false,
                donator: false,
                donationAmount: 0,
            };
        }

        const saved = window.localStorage.getItem("earth-access");

        if (saved) {
            try {
                const parsed = JSON.parse(saved);

                return {
                    supporter: Boolean(parsed?.supporter),
                    pro: Boolean(parsed?.pro),
                    earthInsights: Boolean(parsed?.earthInsights),
                    donator: Boolean(parsed?.donator),
                    donationAmount: Number(parsed?.donationAmount ?? 0),
                };
            } catch {
                return {
                    supporter: false,
                    pro: false,
                    earthInsights: false,
                    donator: false,
                    donationAmount: 0,
                };
            }
        }

        return {
            supporter: false,
            pro: false,
            earthInsights: false,
            donator: false,
            donationAmount: 0,
        };
    });

    useEffect(() => {
        const refreshAccessFromStorage = () => {
            const saved = window.localStorage.getItem("earth-access");
            if (!saved) return;

            try {
                const parsed = JSON.parse(saved);
                setUserAccess({
                    supporter: Boolean(parsed?.supporter),
                    pro: Boolean(parsed?.pro),
                    earthInsights: Boolean(parsed?.earthInsights),
                    donator: Boolean(parsed?.donator),
                    donationAmount: Number(parsed?.donationAmount ?? 0),
                });
            } catch {}
        };

        refreshAccessFromStorage();
        window.addEventListener("focus", refreshAccessFromStorage);

        return () => {
            window.removeEventListener("focus", refreshAccessFromStorage);
        };
    }, []);

    useEffect(() => {
        const raw = window.localStorage.getItem("earth-last-unlock");
        if (!raw) return;

        try {
            const parsed = JSON.parse(raw);

            if (parsed?.type === "earth") {
                showToast(
                    lang === "it" ? "Earth Insights sbloccato ✨" : "Earth Insights unlocked ✨",
                    lang === "it"
                        ? "Le analisi premium della Terra sono ora attive."
                        : "Premium Earth insights are now active.",
                    "earth"
                );
            }

            if (parsed?.type === "donation") {
                const amount = Number(parsed?.amount ?? 0);

                showToast(
                    lang === "it" ? "Grazie per il supporto 💛" : "Thank you for the support 💛",
                    lang === "it"
                        ? "Planet Guardian è ora attivo sulla tua esperienza."
                        : "Planet Guardian is now active on your experience.",
                    "donation",
                    amount > 0 ? `${amount}€` : undefined
                );
            }
        } catch {}

        window.localStorage.removeItem("earth-last-unlock");
    }, [lang]);

    const isDonator = userAccess.donator || userAccess.donationAmount > 0;
    const hasEarthInsights = userAccess.earthInsights;

    const unlocks = {
        donator: {
            guardianBadge: isDonator,
            particles: isDonator,
            aura: isDonator,
            glow: isDonator,
        },
        earth: {
            active: hasEarthInsights,
        },
    };

    const planetGuardianLabel =
        isDonator && userAccess.donationAmount > 0
            ? `${copy.access.planetGuardian} • ${userAccess.donationAmount}€`
            : null;

    const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
        ref.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    const startCheckout = (tier: "supporter" | "pro" | "earth") => {
        if (tier === "supporter" || tier === "pro") {
            showToast(
                lang === "it" ? "Accesso aperto ✨" : "Open access ✨",
                lang === "it"
                    ? "Earth Live Data è ora supportato dalla community. Questi piani sono disattivati per ora."
                    : "Earth Live Data is now community-supported. These plans are disabled for now.",
                "locked"
            );
            setActiveModal(null);
            return;
        }

        if (tier === "earth") {
            if (hasEarthInsights) {
                showToast(
                    lang === "it" ? "Già sbloccato ✨" : "Already unlocked ✨",
                    lang === "it"
                        ? "Earth Insights è già attivo sul tuo profilo."
                        : "Earth Insights is already active on your profile.",
                    "earth"
                );
                setActiveModal(null);
                return;
            }

            window.open(EARTH_INSIGHTS_URL, "_blank", "noopener,noreferrer");
            setActiveModal(null);
        }
    };

    const donate = (amount: number) => {
        const url = DONATION_LINKS[amount];

        if (!url) {
            showToast(
                lang === "it" ? "Importo non disponibile" : "Amount not available",
                lang === "it"
                    ? "Questo importo non è ancora collegato a Stripe."
                    : "This amount is not connected to Stripe yet.",
                "locked"
            );
            return;
        }

        window.open(url, "_blank", "noopener,noreferrer");
        setActiveModal(null);
    };

    useEffect(() => {
        window.localStorage.setItem("earth-access", JSON.stringify(userAccess));
    }, [userAccess]);

    const [liveValues, setLiveValues] = useState<Record<LayerId, string>>(() => {
        const estimated = getEstimatedLiveData(locale);

        return {
            population: estimated.population?.value ?? "8.200.000.000",
            births: estimated.births?.value ?? "+0",
            deaths: estimated.deaths?.value ?? "+0",
            flights: lang === "it" ? "Aggiornamento..." : "Updating...",
            earthquakes: lang === "it" ? "Aggiornamento..." : "Updating...",
            fires: lang === "it" ? "Aggiornamento..." : "Updating...",
            suicides: estimated.suicides?.value ?? "+0",
            roadDeaths: estimated.roadDeaths?.value ?? "+0",
            smokingDeaths: estimated.smokingDeaths?.value ?? "+0",
            alcoholDeaths: estimated.alcoholDeaths?.value ?? "+0",
            abortions: estimated.abortions?.value ?? "+0",
            illegalDrugSpend: estimated.illegalDrugSpend?.value ?? "$0",
            storms: lang === "it" ? "Aggiornamento..." : "Updating...",
            oceans: lang === "it" ? "Aggiornamento..." : "Updating...",
            water: estimated.water?.value ?? "0",
            food: estimated.food?.value ?? "0",
            energy: estimated.energy?.value ?? "0",
        };
    });

    const [liveStats, setLiveStats] = useState<Partial<Record<LayerId, number>>>(() => {
        const estimated = getEstimatedLiveData(locale);

        return {
            population:
                typeof estimated.population?.rawValue === "number"
                    ? estimated.population.rawValue
                    : undefined,
            births:
                typeof estimated.births?.rawValue === "number"
                    ? estimated.births.rawValue
                    : undefined,
            deaths:
                typeof estimated.deaths?.rawValue === "number"
                    ? estimated.deaths.rawValue
                    : undefined,
            flights: undefined,
            earthquakes: undefined,
            fires: undefined,
            suicides:
                typeof estimated.suicides?.rawValue === "number"
                    ? estimated.suicides.rawValue
                    : undefined,
            roadDeaths:
                typeof estimated.roadDeaths?.rawValue === "number"
                    ? estimated.roadDeaths.rawValue
                    : undefined,
            smokingDeaths:
                typeof estimated.smokingDeaths?.rawValue === "number"
                    ? estimated.smokingDeaths.rawValue
                    : undefined,
            alcoholDeaths:
                typeof estimated.alcoholDeaths?.rawValue === "number"
                    ? estimated.alcoholDeaths.rawValue
                    : undefined,
            abortions:
                typeof estimated.abortions?.rawValue === "number"
                    ? estimated.abortions.rawValue
                    : undefined,
            illegalDrugSpend:
                typeof estimated.illegalDrugSpend?.rawValue === "number"
                    ? estimated.illegalDrugSpend.rawValue
                    : undefined,
            storms: undefined,
            oceans: undefined,
            energy:
                typeof estimated.energy?.rawValue === "number"
                    ? estimated.energy.rawValue
                    : undefined,
            food:
                typeof estimated.food?.rawValue === "number"
                    ? estimated.food.rawValue
                    : undefined,
            water:
                typeof estimated.water?.rawValue === "number"
                    ? estimated.water.rawValue
                    : undefined,
        };
    });

    const [previousLiveData, setPreviousLiveData] =
        useState<Partial<Record<LayerId, number>>>({});

    const [satelliteLiveValues, setSatelliteLiveValues] =
        useState<Partial<Record<LayerId, string>>>(liveValues);
    const [satelliteLiveStats, setSatelliteLiveStats] =
        useState<Partial<Record<LayerId, number>>>(liveStats);
    const [satellitePreviousStats, setSatellitePreviousStats] =
        useState<Partial<Record<LayerId, number>>>(previousLiveData);

    const liveValuesRef = useRef<Partial<Record<LayerId, string>>>(liveValues);
    const liveStatsRef = useRef<Partial<Record<LayerId, number>>>(liveStats);
    const satelliteStatsRef = useRef<Partial<Record<LayerId, number>>>(satelliteLiveStats);

    useEffect(() => {
        liveValuesRef.current = liveValues;
    }, [liveValues]);

    useEffect(() => {
        liveStatsRef.current = liveStats;
    }, [liveStats]);

    useEffect(() => {
        satelliteStatsRef.current = satelliteLiveStats;
    }, [satelliteLiveStats]);

    const layers = useMemo<Layer[]>(
        () =>
            BASE_LAYER_META.map((layer) => ({
                ...layer,
                label: copy.labels[layer.id],
                subtitle: copy.subtitles[layer.id],
                value: liveValues[layer.id] ?? "0",
            })),
        [copy, liveValues]
    );

    const current = layers.find((layer) => layer.id === activeLayer) ?? layers[0];
    const earthInsights = getEarthInsights(liveValues, lang);
    const worldMood = earthInsights.worldMood;
    const activePressure = earthInsights.activePressure;
    const dominantSignal = earthInsights.dominantSignal;

    useEffect(() => {
        const showPageTimer = setTimeout(() => {
            setPageVisible(true);
        }, 120);

        let currentProgress = 0;

        const progressInterval = setInterval(() => {
            currentProgress += Math.floor(Math.random() * 8) + 3;

            if (currentProgress >= 100) {
                currentProgress = 100;
                setLoaderProgress(100);
                clearInterval(progressInterval);

                setTimeout(() => {
                    setShowIntroLoader(false);
                }, 350);
            } else {
                setLoaderProgress(currentProgress);
            }
        }, 120);

        return () => {
            clearTimeout(showPageTimer);
            clearInterval(progressInterval);
        };
    }, []);

    useEffect(() => {
        const updateTimeMode = () => {
            const hour = new Date().getHours();
            setIsNight(hour >= 19 || hour < 6);
        };

        updateTimeMode();
        const interval = setInterval(updateTimeMode, 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const generated = Array.from({ length: 2 }, (_, i) => ({
            id: i,
            left: 62 + i * 12,
            top: 16 + i * 10,
            duration: 2.8 + i * 0.5,
            delay: i * 90,
        }));
        setShootingStars(generated);
    }, []);

    useEffect(() => {
        const triggerUfo = () => {
            setUfo((prev) => ({
                visible: false,
                key: prev.key + 1,
            }));

            setTimeout(() => {
                setUfo((prev) => ({
                    visible: true,
                    key: prev.key,
                }));
            }, 80);

            setTimeout(() => {
                setUfo((prev) => ({
                    visible: false,
                    key: prev.key,
                }));
            }, 10500);
        };

        const firstTimeout = setTimeout(triggerUfo, 25000);
        const interval = setInterval(triggerUfo, 180000);

        return () => {
            clearTimeout(firstTimeout);
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        const updateEstimated = () => {
            const estimated = getEstimatedLiveData(locale);

            setPreviousLiveData(liveStatsRef.current);

            setLiveValues((prev) => ({
                ...prev,
                population: estimated.population?.value ?? prev.population,
                births: estimated.births?.value ?? prev.births,
                deaths: estimated.deaths?.value ?? prev.deaths,
                suicides: estimated.suicides?.value ?? prev.suicides,
                roadDeaths: estimated.roadDeaths?.value ?? prev.roadDeaths,
                smokingDeaths: estimated.smokingDeaths?.value ?? prev.smokingDeaths,
                alcoholDeaths: estimated.alcoholDeaths?.value ?? prev.alcoholDeaths,
                abortions: estimated.abortions?.value ?? prev.abortions,
                illegalDrugSpend: estimated.illegalDrugSpend?.value ?? prev.illegalDrugSpend,
                energy: estimated.energy?.value ?? prev.energy,
                water: estimated.water?.value ?? prev.water,
                food: estimated.food?.value ?? prev.food,
            }));

            setLiveStats((prev) => ({
                ...prev,
                population:
                    typeof estimated.population?.rawValue === "number"
                        ? estimated.population.rawValue
                        : prev.population,
                births:
                    typeof estimated.births?.rawValue === "number"
                        ? estimated.births.rawValue
                        : prev.births,
                deaths:
                    typeof estimated.deaths?.rawValue === "number"
                        ? estimated.deaths.rawValue
                        : prev.deaths,
                suicides:
                    typeof estimated.suicides?.rawValue === "number"
                        ? estimated.suicides.rawValue
                        : prev.suicides,
                roadDeaths:
                    typeof estimated.roadDeaths?.rawValue === "number"
                        ? estimated.roadDeaths.rawValue
                        : prev.roadDeaths,
                smokingDeaths:
                    typeof estimated.smokingDeaths?.rawValue === "number"
                        ? estimated.smokingDeaths.rawValue
                        : prev.smokingDeaths,
                alcoholDeaths:
                    typeof estimated.alcoholDeaths?.rawValue === "number"
                        ? estimated.alcoholDeaths.rawValue
                        : prev.alcoholDeaths,
                abortions:
                    typeof estimated.abortions?.rawValue === "number"
                        ? estimated.abortions.rawValue
                        : prev.abortions,
                illegalDrugSpend:
                    typeof estimated.illegalDrugSpend?.rawValue === "number"
                        ? estimated.illegalDrugSpend.rawValue
                        : prev.illegalDrugSpend,
                energy:
                    typeof estimated.energy?.rawValue === "number"
                        ? estimated.energy.rawValue
                        : prev.energy,
                water:
                    typeof estimated.water?.rawValue === "number"
                        ? estimated.water.rawValue
                        : prev.water,
                food:
                    typeof estimated.food?.rawValue === "number"
                        ? estimated.food.rawValue
                        : prev.food,
            }));
        };

        updateEstimated();
        const estimatedInterval = setInterval(updateEstimated, 1000);

        return () => clearInterval(estimatedInterval);
    }, [locale]);

    useEffect(() => {
        let mounted = true;

        const updatePolled = async () => {
            const polled = await getPolledLiveData(locale);

            if (!mounted) return;

            setPreviousLiveData(liveStatsRef.current);

            setLiveValues((prev) => ({
                ...prev,
                flights: polled.flights?.value ?? prev.flights,
                earthquakes: polled.earthquakes?.value ?? prev.earthquakes,
                fires: polled.fires?.value ?? prev.fires,
                storms: polled.storms?.value ?? prev.storms,
                oceans: polled.oceans?.value ?? prev.oceans,
            }));

            setLiveStats((prev) => ({
                ...prev,
                flights:
                    typeof polled.flights?.rawValue === "number"
                        ? polled.flights.rawValue
                        : prev.flights,
                earthquakes:
                    typeof polled.earthquakes?.rawValue === "number"
                        ? polled.earthquakes.rawValue
                        : prev.earthquakes,
                fires:
                    typeof polled.fires?.rawValue === "number"
                        ? polled.fires.rawValue
                        : prev.fires,
                storms:
                    typeof polled.storms?.rawValue === "number"
                        ? polled.storms.rawValue
                        : prev.storms,
                oceans:
                    typeof polled.oceans?.rawValue === "number"
                        ? polled.oceans.rawValue
                        : prev.oceans,
            }));

            setLastPolledUpdate(Date.now());
        };

        updatePolled();
        const polledInterval = setInterval(updatePolled, 20000);

        return () => {
            mounted = false;
            clearInterval(polledInterval);
        };
    }, [locale]);

    useEffect(() => {
        setSatellitePreviousStats(satelliteStatsRef.current);
        setSatelliteLiveValues(liveValuesRef.current);
        setSatelliteLiveStats(liveStatsRef.current);

        const interval = window.setInterval(() => {
            setSatellitePreviousStats(satelliteStatsRef.current);
            setSatelliteLiveValues(liveValuesRef.current);
            setSatelliteLiveStats(liveStatsRef.current);
        }, 6500);

        return () => window.clearInterval(interval);
    }, []);

    const [viewportSize, setViewportSize] = useState({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        const updateViewport = () => {
            setViewportSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        updateViewport();

        let timeout: ReturnType<typeof setTimeout> | null = null;

        const handleResize = () => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                updateViewport();
            }, 120);
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("orientationchange", handleResize);

        return () => {
            if (timeout) clearTimeout(timeout);
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("orientationchange", handleResize);
        };
    }, []);

    const sceneKey = `${viewportSize.width}x${viewportSize.height}-${isPhone}-${isTablet}`;

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#02040a] text-white">
            <CenterToastModal
                appToast={appToast}
                onClose={() => setAppToast(null)}
                closeLabel={copy.common.close}
                toneLabels={toneLabels}
            />

            <EarthIntroLoader
                visible={showIntroLoader}
                progress={loaderProgress}
                loadingTitle={lang === "it" ? "Caricamento pianeta..." : "Loading planet..."}
                loadingSubtitle={
                    lang === "it"
                        ? "Rendering di texture, atmosfera e metriche live"
                        : "Rendering textures, atmosphere, and live metrics"
                }
                loadingDataLabel={copy.common.loadingData}
            />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(56,189,248,0.12),transparent_22%),radial-gradient(circle_at_74%_28%,rgba(167,139,250,0.08),transparent_22%)]" />
            <SpaceDecor shootingStars={shootingStars} ufo={ufo} />

            <section
                className={`relative z-10 min-h-screen px-4 py-4 md:px-8 transition-opacity duration-700 ${
                    pageVisible ? "opacity-100" : "opacity-0"
                }`}
            >
                <div className="mx-auto grid min-h-[88vh] max-w-[1800px] items-start gap-8 xl:items-center xl:gap-6 xl:grid-cols-[0.42fr_1.58fr]">
                    <div className="order-1 xl:order-1">
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/55 backdrop-blur-xl sm:text-xs">
                                <Globe2 className="h-3.5 w-3.5" />
                                {copy.hero.badge}
                            </div>

                            <div className="mt-4 flex items-center gap-2">
                                <button
                                    onClick={() => setLang("en")}
                                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                        lang === "en"
                                            ? "bg-white text-black"
                                            : "border border-white/10 bg-white/5 text-white/75"
                                    }`}
                                >
                                    EN
                                </button>

                                <button
                                    onClick={() => setLang("it")}
                                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                        lang === "it"
                                            ? "bg-white text-black"
                                            : "border border-white/10 bg-white/5 text-white/75"
                                    }`}
                                >
                                    IT
                                </button>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {!planetGuardianLabel && !hasEarthInsights && (
                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/60 sm:text-xs">
                                        {copy.common.access}:
                                        <span className="text-white">{copy.common.freeForEveryone}</span>
                                    </div>
                                )}

                                {hasEarthInsights && (
                                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-sky-100 sm:text-xs">
                                        {copy.access.earthInsights}
                                    </div>
                                )}

                                {planetGuardianLabel && (
                                    <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-yellow-100 sm:text-xs">
                                        {planetGuardianLabel}
                                    </div>
                                )}
                            </div>

                            <h1
                                className="mt-6 text-4xl font-semibold leading-[0.92] tracking-tight sm:text-5xl md:text-6xl xl:text-7xl"
                                style={{ transform: "translateX(10px)" }}
                            >
                                {lang === "it" ? (
                                    <>
                                        statistiche globali
                                        <br />
                                        in tempo reale
                                    </>
                                ) : (
                                    <>
                                        Watch the world
                                        <br />
                                        happening now.
                                    </>
                                )}
                            </h1>

                            <p
                                className="mt-5 max-w-lg text-sm leading-7 text-white/65 md:text-base"
                                style={{ transform: "translateX(10px)" }}
                            >
                                {copy.hero.subtitle}
                            </p>

                            <div
                                className="mt-7 rounded-[24px] border border-white/10 bg-black/25 p-5 backdrop-blur-2xl sm:rounded-[28px] sm:p-6"
                                style={{
                                    boxShadow: unlocks.donator.glow
                                        ? `0 0 140px rgba(250,204,21,0.18), 0 0 40px ${current.glow}28`
                                        : hasEarthInsights
                                            ? `0 0 140px rgba(56,189,248,0.14), 0 0 40px ${current.glow}24`
                                            : `0 0 90px ${current.glow}16`,
                                }}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="text-[11px] uppercase tracking-[0.24em] text-white/42 sm:text-xs">
                                        {copy.common.liveNow}
                                    </div>
                                    <LiveChip
                                        glow={current.glow}
                                        text={
                                            POLLED_LAYERS.includes(current.id)
                                                ? `${copy.common.feedSync} ${formatLastUpdateTime(
                                                    lastPolledUpdate,
                                                    timeLocale,
                                                    copy.common.syncing
                                                )}`
                                                : copy.common.liveStream
                                        }
                                    />
                                </div>

                                <div className="mt-3 break-words text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
                                    {current.value}
                                </div>

                                <div className="mt-2 text-base font-medium text-white sm:text-lg">
                                    {current.label}
                                </div>

                                <p className="mt-3 text-sm leading-6 text-white/58">
                                    {current.subtitle}
                                </p>

                                <div className="relative mt-5 h-[3px] overflow-hidden rounded-full bg-white/8">
                                    <div
                                        className="absolute inset-y-0 left-0 w-1/3 rounded-full"
                                        style={{
                                            background: `linear-gradient(90deg, transparent 0%, ${current.glow} 50%, transparent 100%)`,
                                            animation: `shimmerBar ${
                                                unlocks.donator.glow
                                                    ? "1.8s"
                                                    : hasEarthInsights
                                                        ? "1.9s"
                                                        : "2.4s"
                                            } linear infinite`,
                                        }}
                                    />
                                </div>
                            </div>

                            {hasEarthInsights ? (
                                <section className="mt-5">
                                    <div
                                        className="mb-4"
                                        style={{ transform: "translateX(10px)" }}
                                    >
                                        <div className="text-[11px] uppercase tracking-[0.24em] text-white/42 sm:text-xs">
                                            {copy.access.earthInsights}
                                        </div>
                                        <h2 className="mt-3 max-w-[16ch] text-2xl font-semibold leading-tight text-white sm:text-3xl">
                                            {copy.insights.cardsTitle}
                                        </h2>
                                        <p className="mt-3 max-w-[560px] text-sm leading-6 text-white/58">
                                            {copy.insights.cardsSubtitle}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <div
                                            className="relative overflow-hidden rounded-[24px] border bg-black/25 p-4 backdrop-blur-2xl sm:rounded-[28px] sm:p-5"
                                            style={{
                                                borderColor: worldMood.border,
                                                boxShadow: worldMood.glow,
                                                animation: worldMood.pulse
                                                    ? "livePulse 1.8s ease-in-out infinite"
                                                    : "none",
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_40%)]" />
                                            <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">
                                                        {worldMood.label}
                                                    </div>
                                                    <p className="mt-3 max-w-[62ch] text-sm leading-6 text-white/58">
                                                        {worldMood.description}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-3 md:shrink-0">
                                                    <div
                                                        className="h-2.5 w-2.5 rounded-full"
                                                        style={{
                                                            background: worldMood.border,
                                                            boxShadow: `0 0 16px ${worldMood.border}`,
                                                        }}
                                                    />
                                                    <div className="text-left md:text-right">
                                                        <div className="text-xl font-semibold leading-tight text-white sm:text-2xl md:text-[30px]">
                                                            {worldMood.value}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            className="relative overflow-hidden rounded-[24px] border bg-black/25 p-4 backdrop-blur-2xl sm:rounded-[28px] sm:p-5"
                                            style={{
                                                borderColor: activePressure.border,
                                                boxShadow: activePressure.glow,
                                                animation: activePressure.pulse
                                                    ? "livePulse 1.8s ease-in-out infinite"
                                                    : "none",
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_40%)]" />
                                            <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">
                                                        {activePressure.label}
                                                    </div>
                                                    <p className="mt-3 max-w-[62ch] text-sm leading-6 text-white/58">
                                                        {activePressure.description}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-3 md:shrink-0">
                                                    <div
                                                        className="h-2.5 w-2.5 rounded-full"
                                                        style={{
                                                            background: activePressure.border,
                                                            boxShadow: `0 0 16px ${activePressure.border}`,
                                                        }}
                                                    />
                                                    <div className="text-left md:text-right">
                                                        <div className="text-xl font-semibold leading-tight text-white sm:text-2xl md:text-[30px]">
                                                            {activePressure.value}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            className="relative overflow-hidden rounded-[24px] border bg-black/25 p-4 backdrop-blur-2xl sm:rounded-[28px] sm:p-5"
                                            style={{
                                                borderColor: dominantSignal.border,
                                                boxShadow: dominantSignal.glow,
                                                animation: dominantSignal.pulse
                                                    ? "livePulse 1.8s ease-in-out infinite"
                                                    : "none",
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_40%)]" />
                                            <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">
                                                        {dominantSignal.label}
                                                    </div>
                                                    <p className="mt-3 max-w-[62ch] text-sm leading-6 text-white/58">
                                                        {dominantSignal.description}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-3 md:shrink-0">
                                                    <div
                                                        className="h-2.5 w-2.5 rounded-full"
                                                        style={{
                                                            background: dominantSignal.border,
                                                            boxShadow: `0 0 16px ${dominantSignal.border}`,
                                                        }}
                                                    />
                                                    <div className="text-left md:text-right">
                                                        <div className="text-xl font-semibold leading-tight text-white sm:text-2xl md:text-[30px]">
                                                            {dominantSignal.value}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            ) : (
                                <div className="mt-4">
                                    <GlassCard className="p-5 sm:p-6">
                                        <div className="text-[11px] uppercase tracking-[0.24em] text-white/42 sm:text-xs">
                                            {copy.access.earthInsights}
                                        </div>
                                        <h3 className="mt-3 text-xl font-semibold text-white sm:text-2xl">
                                            {copy.insights.unlock}
                                        </h3>
                                        <p className="mt-3 text-sm leading-6 text-white/58">
                                            {copy.insights.cardsSubtitle}
                                        </p>
                                        <button
                                            onClick={() => setActiveModal("insights")}
                                            className="mt-5 rounded-2xl border border-sky-400/20 bg-sky-400/10 px-5 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/15"
                                        >
                                            {copy.insights.unlock}
                                        </button>
                                    </GlassCard>
                                </div>
                            )}

                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <button
                                    onClick={() => scrollToSection(liveLayersRef)}
                                    className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
                                >
                                    {copy.common.exploreLive}
                                </button>

                                <button
                                    onClick={() => setActiveModal("insights")}
                                    className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-5 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/15"
                                >
                                    {copy.access.earthInsights}
                                </button>

                                <button
                                    onClick={() => scrollToSection(donationRef)}
                                    className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-5 py-3 text-sm font-semibold text-yellow-100 transition hover:bg-yellow-400/15"
                                >
                                    {copy.common.support}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="order-2 xl:order-2">
                        <div
                            className={`relative w-full overflow-visible ${
                                isPhone
                                    ? "h-[30svh] min-h-[230px] rounded-[24px]"
                                    : isTablet
                                        ? "h-[44svh] min-h-[340px] rounded-[32px]"
                                        : "h-[66svh] min-h-[520px] rounded-[40px] md:h-[82svh] xl:h-[92svh]"
                            }`}
                        >
                            <div className="absolute inset-0 bg-[#02040a]" />
                            <div className="absolute inset-0 rounded-full bg-cyan-400/5 blur-3xl" />
                            <div className="absolute inset-[-10%] rounded-full bg-violet-500/5 blur-[120px]" />

                            {unlocks.donator.particles && !isPhone && (
                                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                                    {Array.from({ length: isTablet ? 10 : 18 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute h-1.5 w-1.5 rounded-full bg-yellow-300"
                                            style={{
                                                left: `${(i * 17) % 100}%`,
                                                top: `${(i * 11) % 100}%`,
                                                opacity: 0.6,
                                                boxShadow: "0 0 12px rgba(250,204,21,0.7)",
                                                animation: `livePulse ${2 + (i % 4)}s ease-in-out infinite`,
                                            }}
                                        />
                                    ))}
                                </div>
                            )}

                            <EarthScene
                                key={sceneKey}
                                activeLayer={activeLayer}
                                isNight={isNight}
                                isLowPerf={isLowPerf || isPhone}
                                hasPlanetGuardian={unlocks.donator.aura}
                            />

                            <div
                                className={`absolute inset-x-0 flex justify-center ${
                                    isPhone
                                        ? "-bottom-12"
                                        : isTablet
                                            ? "-bottom-12"
                                            : "-bottom-14 xl:-bottom-16"
                                }`}
                            >
                                {!isPhone && !isTablet ? (
                                    <div className="w-full max-w-[420px]">
                                        <OrbitalSatelliteMini
                                            activeLayer={activeLayer}
                                            liveValues={satelliteLiveValues}
                                            liveStats={satelliteLiveStats}
                                            previousLiveData={satellitePreviousStats}
                                        />
                                    </div>
                                ) : (
                                    <div className={`w-full ${isPhone ? "max-w-[280px]" : "max-w-[320px]"}`}>
                                        <OrbitalMobileFeed
                                            activeLayer={activeLayer}
                                            liveValues={satelliteLiveValues}
                                            liveStats={satelliteLiveStats}
                                            previousLiveData={satellitePreviousStats}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section
                ref={liveLayersRef}
                className="relative z-10 mx-auto max-w-7xl px-4 pb-10 md:px-8"
            >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {layers.slice(0, 15).map((layer) => {
                        const Icon = layer.icon;
                        const selected = activeLayer === layer.id;
                        const isPolled = POLLED_LAYERS.includes(layer.id);
                        const isSlow = SLOW_LAYERS.includes(layer.id);

                        return (
                            <button
                                key={layer.id}
                                onClick={() => setActiveLayer(layer.id)}
                                className="group relative overflow-hidden rounded-[22px] border p-4 text-left backdrop-blur-2xl transition duration-300 sm:rounded-[24px] sm:p-5"
                                style={{
                                    borderColor: selected
                                        ? `${layer.glow}55`
                                        : "rgba(255,255,255,0.08)",
                                    background: selected
                                        ? `linear-gradient(180deg, ${layer.glow}18 0%, rgba(255,255,255,0.06) 100%)`
                                        : `linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.22) 100%)`,
                                    boxShadow: selected
                                        ? unlocks.donator.glow
                                            ? `0 0 75px rgba(250,204,21,0.16), inset 0 0 0 1px ${layer.glow}18`
                                            : hasEarthInsights
                                                ? `0 0 75px rgba(56,189,248,0.14), inset 0 0 0 1px ${layer.glow}18`
                                                : `0 0 60px ${layer.glow}22, inset 0 0 0 1px ${layer.glow}18`
                                        : `0 0 0 rgba(0,0,0,0)`,
                                }}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 text-sm text-white/50">
                                            <span>{lang === "it" ? "Livello live" : "Live layer"}</span>
                                            <span
                                                className="h-1.5 w-1.5 rounded-full"
                                                style={{
                                                    background: layer.glow,
                                                    boxShadow: `0 0 10px ${layer.glow}`,
                                                    animation: "livePulse 1.8s ease-in-out infinite",
                                                }}
                                            />
                                        </div>

                                        <div className="mt-1 text-lg font-semibold text-white sm:text-xl">
                                            {layer.label}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl bg-white/10 p-3">
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                </div>

                                <div className="mt-5 break-words text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                                    {layer.value}
                                </div>

                                <p className="mt-3 text-sm leading-6 text-white/58">
                                    {layer.subtitle}
                                </p>

                                <div className="mt-4 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.18em] text-white/38 sm:text-[11px]">
                                <span>
                                    {isPolled
                                        ? copy.common.feedSync
                                        : isSlow
                                            ? copy.common.slowLiveRate
                                            : copy.common.continuousLive}
                                </span>

                                    <span className="inline-flex items-center gap-1">
                                    <Sparkles className="h-3.5 w-3.5" />
                                        {isPolled
                                            ? formatLastUpdateTime(
                                                lastPolledUpdate,
                                                timeLocale,
                                                copy.common.syncing
                                            )
                                            : copy.common.active}
                                </span>
                                </div>

                                <div className="relative mt-4 h-[2px] overflow-hidden rounded-full bg-white/8">
                                    <div
                                        className="absolute inset-y-0 left-0 w-1/3 rounded-full"
                                        style={{
                                            background: `linear-gradient(90deg, transparent 0%, ${layer.glow} 50%, transparent 100%)`,
                                            animation: `shimmerBar ${
                                                unlocks.donator.glow
                                                    ? isSlow
                                                        ? "3s"
                                                        : "1.8s"
                                                    : hasEarthInsights
                                                        ? isSlow
                                                            ? "3.1s"
                                                            : "1.95s"
                                                        : isSlow
                                                            ? "3.4s"
                                                            : "2.2s"
                                            } linear infinite`,
                                        }}
                                    />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="relative z-10 mx-auto max-w-7xl px-4 pb-24 md:px-8">
                <div className="grid gap-4 xl:grid-cols-2">
                    <button
                        onClick={() => setActiveModal("insights")}
                        className="w-full text-left"
                    >
                        <GlassCard className="p-5 transition duration-300 hover:-translate-y-1 hover:border-sky-400/20 hover:bg-sky-400/[0.03] sm:p-6">
                            <div className="text-[11px] uppercase tracking-[0.24em] text-white/42 sm:text-xs">
                                {copy.access.earthInsights}
                            </div>
                            <h3 className="mt-3 text-xl font-semibold sm:text-2xl">
                                {copy.insights.title}
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-white/58">
                                {copy.insights.extra}
                            </p>
                        </GlassCard>
                    </button>

                    <div ref={donationRef}>
                        <button
                            onClick={() => setActiveModal("donation")}
                            className="w-full text-left"
                        >
                            <GlassCard className="p-5 transition duration-300 hover:-translate-y-1 hover:border-yellow-400/20 hover:bg-yellow-400/[0.03] sm:p-6">
                                <div className="text-[11px] uppercase tracking-[0.24em] text-white/42 sm:text-xs">
                                    {copy.donation.eyebrow}
                                </div>
                                <h3 className="mt-3 text-xl font-semibold sm:text-2xl">
                                    {copy.donation.title}
                                </h3>
                                <p className="mt-3 text-sm leading-6 text-white/58">
                                    {copy.donation.subtitle}
                                </p>
                            </GlassCard>
                        </button>
                    </div>
                </div>
            </section>

            <section className="relative z-10 mx-auto max-w-7xl px-4 pb-24 md:px-8">
                <div className="mx-auto max-w-5xl text-center">
                    <div className="text-[10px] uppercase tracking-[0.28em] text-white/38">
                        {copy.finalSection.eyebrow}
                    </div>

                    <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                        {copy.finalSection.title}
                    </h2>

                    <p className="mx-auto mt-5 max-w-3xl text-sm leading-8 text-white/60 md:text-[15px]">
                        {copy.finalSection.description}
                    </p>

                    <div className="mt-[18px] flex justify-center">
                        <div className="inline-flex flex-wrap items-center justify-center gap-2">
                        <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/62">
                            {copy.finalSection.chips[0]}
                        </span>
                            <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/62">
                            {copy.finalSection.chips[1]}
                        </span>
                            <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/62">
                            {copy.finalSection.chips[2]}
                        </span>
                        </div>
                    </div>
                </div>

                <div className="mx-auto mt-[30px] grid max-w-5xl gap-10 md:grid-cols-3 md:gap-12">
                    <div className="text-center">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/38">
                            {copy.finalSection.project.title}
                        </div>

                        <p className="mt-5 text-sm leading-8 text-white/58">
                            {copy.finalSection.project.body}
                        </p>
                    </div>

                    <div className="text-center md:mt-[18px]">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/38">
                            {copy.finalSection.support.title}
                        </div>

                        <p className="mt-5 text-sm leading-8 text-white/58">
                            {copy.finalSection.support.body}
                        </p>
                    </div>

                    <div className="text-center md:mt-[18px]">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/38">
                            {copy.finalSection.credits.title}
                        </div>

                        <p className="mt-5 text-sm leading-8 text-white/58">
                        <span className="font-medium text-white">
                            {copy.finalSection.credits.bodyTop}
                        </span>
                        </p>

                        <p className="mt-3 text-sm leading-8 text-white/58">
                            {copy.finalSection.credits.bodyBottom}
                        </p>
                    </div>
                </div>

                <div className="mx-auto mt-[-10px] h-px max-w-5xl bg-gradient-to-r from-transparent via-white/10 to-transparent md:mt-[-30px]" />

                <div className="mx-auto mt-[40px] flex max-w-5xl flex-wrap items-center justify-center gap-3 md:mt-[54px]">
                    <a
                        href="https://x.com/NexoraLab01"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white/68 transition hover:border-white/20 hover:text-white"
                    >
                        {copy.finalSection.social.x}
                    </a>
                    <a
                        href="https://www.instagram.com/nexoralab01?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white/68 transition hover:border-white/20 hover:text-white"
                    >
                        {copy.finalSection.social.instagram}
                    </a>
                    <a
                        href="https://www.tiktok.com/@nexoralab2?is_from_webapp=1&sender_device=pc"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white/68 transition hover:border-white/20 hover:text-white"
                    >
                        {copy.finalSection.social.tiktok}
                    </a>
                    <a
                        href="https://www.youtube.com/@NexoraLab_1"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white/68 transition hover:border-white/20 hover:text-white"
                    >
                        {copy.finalSection.social.youtube}
                    </a>
                </div>

                <div className="mx-auto mt-[40px] max-w-5xl text-center text-xs uppercase tracking-[0.22em] text-white/30">
                    {copy.finalSection.copyright}
                </div>
            </section>

            <InfoModal
                lang={lang}
                activeModal={activeModal}
                onClose={() => setActiveModal(null)}
                onStartCheckout={startCheckout}
                onDonate={donate}
            />
        </main>
    );
}