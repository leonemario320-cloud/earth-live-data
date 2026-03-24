export type AccessTier = "free" | "supporter" | "pro";

export const SUPPORTER_FEATURES = [
    "supporter_badge",
    "supporter_glow",
    "extra_satellite",
] as const;

export const PRO_FEATURES = [
    "pro_layers",
    "advanced_filters",
    "premium_panel",
] as const;

export type SupporterFeature = (typeof SUPPORTER_FEATURES)[number];
export type ProFeature = (typeof PRO_FEATURES)[number];

export function isSupporter(tier: AccessTier) {
    return tier === "supporter" || tier === "pro";
}

export function isPro(tier: AccessTier) {
    return tier === "pro";
}