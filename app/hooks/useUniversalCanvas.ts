"use client";

import { RefObject, useEffect, useState } from "react";

export type DeviceTier = "phone" | "tablet" | "desktop";

export type UniversalCanvasState = {
    ready: boolean;
    tier: DeviceTier;
    width: number;
    height: number;
    scale: number;
    offsetX: number;
    offsetY: number;
    designWidth: number;
    designHeight: number;
    isTouch: boolean;
    isLowPerf: boolean;
};

function getTier(width: number): DeviceTier {
    if (width < 640) return "phone";
    if (width < 1024) return "tablet";
    return "desktop";
}

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function buildState(
    viewportWidth: number,
    viewportHeight: number,
    designWidth: number,
    designHeight: number
): UniversalCanvasState {
    const tier = getTier(viewportWidth);

    const scaleX = viewportWidth / designWidth;
    const scaleY = viewportHeight / designHeight;
    const rawScale = Math.min(scaleX, scaleY);
    const scale = clamp(rawScale, 0.34, 1);

    const scaledWidth = designWidth * scale;
    const scaledHeight = designHeight * scale;

    const offsetX = (viewportWidth - scaledWidth) / 2;
    const offsetY = (viewportHeight - scaledHeight) / 2;

    const isTouch =
        typeof window !== "undefined" &&
        ("ontouchstart" in window || window.matchMedia("(pointer: coarse)").matches);

    const isLowPerf = viewportWidth < 1024;

    return {
        ready: true,
        tier,
        width: viewportWidth,
        height: viewportHeight,
        scale,
        offsetX,
        offsetY,
        designWidth,
        designHeight,
        isTouch,
        isLowPerf,
    };
}

export function useUniversalCanvas(
    containerRef: RefObject<HTMLElement | null>,
    designWidth = 1500,
    designHeight = 920
): UniversalCanvasState {
    const [state, setState] = useState<UniversalCanvasState>({
        ready: false,
        tier: "desktop",
        width: designWidth,
        height: designHeight,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        designWidth,
        designHeight,
        isTouch: false,
        isLowPerf: false,
    });

    useEffect(() => {
        if (typeof window === "undefined") return;

        const update = () => {
            const el = containerRef.current;

            const width = el?.clientWidth ?? window.innerWidth;
            const height = el?.clientHeight ?? window.innerHeight;

            if (!width || !height) return;

            setState(buildState(width, height, designWidth, designHeight));
        };

        update();

        const el = containerRef.current;
        const resizeObserver =
            typeof ResizeObserver !== "undefined"
                ? new ResizeObserver(() => update())
                : null;

        if (el && resizeObserver) {
            resizeObserver.observe(el);
        }

        window.addEventListener("resize", update);
        window.addEventListener("orientationchange", update);

        return () => {
            resizeObserver?.disconnect();
            window.removeEventListener("resize", update);
            window.removeEventListener("orientationchange", update);
        };
    }, [containerRef, designWidth, designHeight]);

    return state;
}