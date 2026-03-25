"use client";

import React, { ReactNode, useRef } from "react";
import {
    UniversalCanvasState,
    useUniversalCanvas,
} from "../hooks/useUniversalCanvas";

type Props = {
    designWidth?: number;
    designHeight?: number;
    className?: string;
    children: (state: UniversalCanvasState) => ReactNode;
};

export default function UniversalSceneStage({
                                                designWidth = 1500,
                                                designHeight = 920,
                                                className = "",
                                                children,
                                            }: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const stage = useUniversalCanvas(containerRef, designWidth, designHeight);

    return (
        <div
            ref={containerRef}
            className={`relative w-full overflow-hidden ${className}`}
        >
            <div
                className="absolute left-0 top-0"
                style={{
                    width: designWidth,
                    height: designHeight,
                    transform: `translate(${stage.offsetX}px, ${stage.offsetY}px) scale(${stage.scale})`,
                    transformOrigin: "top left",
                    willChange: "transform",
                }}
            >
                {children(stage)}
            </div>
        </div>
    );
}