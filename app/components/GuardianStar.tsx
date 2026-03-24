"use client";

import React, { useMemo, useRef } from "react";
import { Billboard, Text } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

export default function GuardianStar({
                                         enabled,
                                     }: {
    enabled: boolean;
}) {
    const groupRef = useRef<THREE.Group | null>(null);
    const planetRef = useRef<THREE.Mesh | null>(null);
    const glowRef = useRef<THREE.Mesh | null>(null);
    const atmosphereRef = useRef<THREE.Mesh | null>(null);

    const guardianMap = useLoader(
        THREE.TextureLoader,
        "/textures/2k_moon.jpg"
    );

    const glowColor = useMemo(() => new THREE.Color("#67e8f9"), []);

    useMemo(() => {
        guardianMap.colorSpace = THREE.SRGBColorSpace;
        guardianMap.anisotropy = 8;
    }, [guardianMap]);

    useFrame((state) => {
        if (!enabled) return;
        if (
            !groupRef.current ||
            !planetRef.current ||
            !glowRef.current ||
            !atmosphereRef.current
        ) {
            return;
        }

        const t = state.clock.elapsedTime;

        // posizione del mini pianeta accanto alla Terra
        groupRef.current.position.set(2.35, 1.82, 1.9);

        // rotazione lenta del pianeta
        planetRef.current.rotation.y += 0.0035;

        // glow morbido
        glowRef.current.scale.setScalar(1 + Math.sin(t * 1.7 + 0.4) * 0.12);

        // atmosfera / aura leggerissima
        atmosphereRef.current.scale.setScalar(1 + Math.sin(t * 1.7) * 0.035);

        // micro movimento elegante
        groupRef.current.rotation.z = Math.sin(t * 0.45) * 0.04;
        groupRef.current.rotation.y = Math.sin(t * 0.25) * 0.03;
    });

    if (!enabled) return null;

    return (
        <group ref={groupRef} position={[2.35, 1.82, 1.9]}>
            <mesh ref={glowRef}>
                <sphereGeometry args={[0.19, 24, 24]} />
                <meshBasicMaterial
                    color={glowColor}
                    transparent
                    opacity={0.12}
                    depthWrite={false}
                />
            </mesh>

            <mesh ref={atmosphereRef}>
                <sphereGeometry args={[0.078, 24, 24]} />
                <meshBasicMaterial
                    color="#7dd3fc"
                    transparent
                    opacity={0.12}
                    depthWrite={false}
                    side={THREE.BackSide}
                />
            </mesh>

            <mesh ref={planetRef}>
                <sphereGeometry args={[0.068, 32, 32]} />
                <meshStandardMaterial
                    map={guardianMap}
                    emissive={new THREE.Color("#0ea5e9")}
                    emissiveIntensity={0.18}
                    roughness={0.95}
                    metalness={0.03}
                />
            </mesh>

            <Billboard position={[0, 0.22, 0]}>
                <Text
                    fontSize={0.05}
                    color="#e6fbff"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.0035}
                    outlineColor="#67e8f9"
                    maxWidth={2.5}
                >
                    PLANET GUARDIAN
                </Text>
            </Billboard>
        </group>
    );
}