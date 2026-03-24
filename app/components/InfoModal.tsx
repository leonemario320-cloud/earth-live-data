"use client";

import React from "react";
import { createPortal } from "react-dom";
import { earthCopy, type AppLanguage } from "@/lib/earthCopy";

type BottomModalType = "supporter" | "insights" | "donation" | null;

type InfoModalProps = {
    lang: AppLanguage;
    activeModal: BottomModalType;
    onClose: () => void;
    onStartCheckout: (tier: "supporter" | "pro" | "earth") => void;
    onDonate: (amount: number) => void;
};

export default function InfoModal({
                                      lang,
                                      activeModal,
                                      onClose,
                                      onStartCheckout,
                                      onDonate,
                                  }: InfoModalProps) {
    if (!activeModal || typeof document === "undefined") return null;

    const copy = earthCopy[lang];

    return createPortal(
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 999999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.72)",
                backdropFilter: "blur(8px)",
                padding: "16px",
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "760px",
                    borderRadius: "30px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(6,11,20,0.96)",
                    boxShadow: "0 0 80px rgba(0,0,0,0.45)",
                    padding: "28px",
                    color: "white",
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        right: "16px",
                        top: "16px",
                        borderRadius: "999px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.05)",
                        color: "rgba(255,255,255,0.75)",
                        padding: "6px 12px",
                        cursor: "pointer",
                    }}
                >
                    {copy.common.close}
                </button>

                {activeModal === "supporter" && (
                    <>
                        <div style={eyebrowStyle}>{copy.access.openAccess}</div>

                        <h3 style={titleStyle}>{copy.supporter.title}</h3>

                        <p style={textStyle}>{copy.supporter.subtitle}</p>

                        <div style={chipWrapStyle}>
                            {copy.supporter.chips.map((chip) => (
                                <div key={chip} style={chipStyle}>
                                    {chip}
                                </div>
                            ))}
                        </div>

                        <div
                            style={{
                                marginTop: "28px",
                                display: "flex",
                                gap: "12px",
                                flexWrap: "wrap",
                            }}
                        >
                            <button
                                onClick={() => onStartCheckout("earth")}
                                style={cyanButtonStyleCompact}
                            >
                                {copy.access.goToEarthInsights}
                            </button>

                            <button onClick={onClose} style={ghostButtonStyle}>
                                {copy.common.close}
                            </button>
                        </div>
                    </>
                )}

                {activeModal === "insights" && (
                    <>
                        <div style={eyebrowStyle}>{copy.access.earthInsights}</div>

                        <h3 style={titleStyle}>{copy.insights.title}</h3>

                        <p style={textStyle}>{copy.insights.subtitle}</p>

                        <div style={chipWrapStyle}>
                            {copy.insights.chips.map((chip) => (
                                <div key={chip} style={chipStyle}>
                                    {chip}
                                </div>
                            ))}
                        </div>

                        <p style={{ ...textStyle, marginTop: "18px" }}>
                            {copy.insights.extra}
                        </p>

                        <div
                            style={{
                                marginTop: "28px",
                                display: "flex",
                                gap: "12px",
                                flexWrap: "wrap",
                            }}
                        >
                            <button
                                onClick={() => onStartCheckout("earth")}
                                style={cyanButtonStyleCompact}
                            >
                                {copy.insights.unlock}
                            </button>

                            <button onClick={onClose} style={ghostButtonStyle}>
                                {copy.common.close}
                            </button>
                        </div>
                    </>
                )}

                {activeModal === "donation" && (
                    <>
                        <div style={eyebrowStyle}>{copy.donation.eyebrow}</div>

                        <h3 style={titleStyle}>{copy.donation.title}</h3>

                        <p style={textStyle}>{copy.donation.subtitle}</p>

                        <div style={chipWrapStyle}>
                            {copy.donation.chips.map((chip) => (
                                <div key={chip} style={chipStyle}>
                                    {chip}
                                </div>
                            ))}
                        </div>

                        <p style={{ ...textStyle, marginTop: "18px" }}>
                            {copy.donation.extra}
                        </p>

                        <div style={donationGridStyle}>
                            {[1, 3, 5, 10, 15, 20, 30, 50, 75, 100].map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => onDonate(amount)}
                                    style={donationButtonStyle}
                                >
                                    {copy.donation.donate} {amount}€
                                </button>
                            ))}
                        </div>

                        <div
                            style={{
                                marginTop: "24px",
                                display: "flex",
                                gap: "12px",
                                flexWrap: "wrap",
                            }}
                        >
                            <button onClick={onClose} style={ghostButtonStyle}>
                                {copy.common.close}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
}

const eyebrowStyle: React.CSSProperties = {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.24em",
    color: "rgba(103,232,249,0.7)",
};

const titleStyle: React.CSSProperties = {
    marginTop: "12px",
    marginBottom: 0,
    fontSize: "34px",
    fontWeight: 700,
};

const textStyle: React.CSSProperties = {
    marginTop: "16px",
    lineHeight: 1.8,
    color: "rgba(255,255,255,0.68)",
};

const chipWrapStyle: React.CSSProperties = {
    marginTop: "24px",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
};

const chipStyle: React.CSSProperties = {
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "999px",
    padding: "10px 14px",
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    fontSize: "11px",
    color: "rgba(255,255,255,0.5)",
    width: "fit-content",
    maxWidth: "100%",
};

const cyanButtonStyleCompact: React.CSSProperties = {
    borderRadius: "18px",
    padding: "12px 20px",
    border: "1px solid rgba(34,211,238,0.2)",
    background: "rgba(34,211,238,0.1)",
    color: "#d9faff",
    fontWeight: 700,
    cursor: "pointer",
};

const donationGridStyle: React.CSSProperties = {
    marginTop: "28px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
    gap: "12px",
};

const donationButtonStyle: React.CSSProperties = {
    borderRadius: "18px",
    padding: "12px 14px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
};

const ghostButtonStyle: React.CSSProperties = {
    borderRadius: "18px",
    padding: "12px 20px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
};