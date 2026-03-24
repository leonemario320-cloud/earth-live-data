"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useFBX } from "@react-three/drei";
import * as THREE from "three";

export default function Satellite() {
    const group = useRef<THREE.Group | null>(null);
    const model = useFBX("/models/satellite/Dawn.fbx");

    const orbitRadius = 2.75;
    const orbitSpeed = 0.22;

    useEffect(() => {
        model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = false;
                mesh.receiveShadow = false;

                if (Array.isArray(mesh.material)) {
                    mesh.material = mesh.material.map((mat) => {
                        const next = (mat as THREE.MeshStandardMaterial).clone();
                        next.side = THREE.DoubleSide;
                        next.metalness = 0.35;
                        next.roughness = 0.65;
                        next.needsUpdate = true;
                        return next;
                    });
                } else if (mesh.material) {
                    const next = (mesh.material as THREE.MeshStandardMaterial).clone();
                    next.side = THREE.DoubleSide;
                    next.metalness = 0.35;
                    next.roughness = 0.65;
                    next.needsUpdate = true;
                    mesh.material = next;
                }
            }
        });
    }, [model]);

    useFrame(({ clock }) => {
        if (!group.current) return;

        const t = clock.getElapsedTime() * orbitSpeed;

        const x = Math.cos(t) * orbitRadius;
        const z = Math.sin(t) * orbitRadius;
        const y = Math.sin(t * 0.45) * 0.16;

        group.current.position.set(x, y, z);

        group.current.lookAt(0, 0, 0);

        group.current.rotateZ(0.003);
    });

    return (
        <primitive
            ref={group}
            object={model}
            scale={0.0008}
        />
    );
}