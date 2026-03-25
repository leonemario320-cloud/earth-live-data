"use client";

import { useEffect, useState } from "react";

export type DeviceTier = "phone" | "tablet" | "desktop";

function getTier(width: number): DeviceTier {
    if (width < 640) return "phone";
    if (width < 1024) return "tablet";
    return "desktop";
}

export function useDeviceTier() {
    const [tier, setTier] = useState<DeviceTier>(() => {
        if (typeof window === "undefined") return "desktop";
        return getTier(window.innerWidth);
    });

    useEffect(() => {
        const onResize = () => {
            setTier(getTier(window.innerWidth));
        };

        onResize();
        window.addEventListener("resize", onResize);
        window.addEventListener("orientationchange", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
            window.removeEventListener("orientationchange", onResize);
        };
    }, []);

    return {
        tier,
        isPhone: tier === "phone",
        isTablet: tier === "tablet",
        isDesktop: tier === "desktop",
    };
}