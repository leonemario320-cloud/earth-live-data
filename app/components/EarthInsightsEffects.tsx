"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function InsightRing({
                         radius,
                         color,
                         speed,
                         tilt = 0,
                     }: {
    radius: number;
    color: string;
    speed: number;
    tilt?: number;
}) {
    const ringRef = useRef<THREE.Mesh | null>(null);

    useFrame(() => {
        if (ringRef.current) {
            ringRef.current.rotation.z += speed;
        }
    });

    return (
        <mesh ref={ringRef} rotation={[tilt, 0, 0]}>
            <torusGeometry args={[radius, 0.01, 16, 180]} />
            <meshBasicMaterial color={color} transparent opacity={0.55} />
        </mesh>
    );
}

function InsightNodes() {
    const points = useMemo(() => {
        return Array.from({ length: 16 }, (_, i) => {
            const angle = (i / 16) * Math.PI * 2;
            const radius = 1.7;
            return {
                x: Math.cos(angle) * radius,
                y: (Math.sin(angle * 2) * 0.12),
                z: Math.sin(angle) * radius,
                size: i % 2 === 0 ? 0.028 : 0.02,
            };
        });
    }, []);

    return (
        <group>
            {points.map((point, index) => (
                <mesh key={index} position={[point.x, point.y, point.z]}>
                    <sphereGeometry args={[point.size, 10, 10]} />
                    <meshBasicMaterial
                        color="#67e8f9"
                        transparent
                        opacity={0.85}
                    />
                </mesh>
            ))}
        </group>
    );
}

function InsightAura() {
    return (
        <mesh scale={1.12}>
            <sphereGeometry args={[1.62, 48, 48]} />
            <meshBasicMaterial
                color="#38bdf8"
                transparent
                opacity={0.06}
                side={THREE.BackSide}
            />
        </mesh>
    );
}

export default function EarthInsightsEffects() {
    return (
        <group>
            <InsightAura />
            <InsightRing radius={1.78} color="#67e8f9" speed={0.0035} tilt={0.25} />
            <InsightRing radius={1.95} color="#a78bfa" speed={-0.0024} tilt={-0.15} />
            <InsightNodes />
        </group>
    );
}