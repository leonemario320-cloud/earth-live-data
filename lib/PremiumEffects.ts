export type UserAccess = {
    supporter: boolean;
    pro: boolean;
    earthInsights: boolean;
    donator: boolean;
    donationAmount: number;
};

export type PremiumUnlocks = {
    supporter: {
        active: boolean;
        badge: boolean;
        heroGlow: boolean;
        cardGlow: boolean;
        shimmerBoost: boolean;
    };
    pro: {
        active: boolean;
        premiumBadge: boolean;
        strongGlow: boolean;
        premiumVisuals: boolean;
        premiumLayers: boolean;
    };
    earth: {
        active: boolean;
        earthBadge: boolean;
        insightsCards: boolean;
        analytics: boolean;
        trends: boolean;
    };
    donator: {
        active: boolean;
        guardianBadge: boolean;
        particles: boolean;
        aura: boolean;
        donationAmount: number;
    };
};

export function getPremiumUnlocks(userAccess: UserAccess): PremiumUnlocks {
    const hasSupporter = userAccess.supporter || userAccess.pro;
    const hasPro = userAccess.pro;
    const hasEarth = userAccess.earthInsights;
    const hasDonator = userAccess.donator || userAccess.donationAmount > 0;

    return {
        supporter: {
            active: hasSupporter,
            badge: hasSupporter,
            heroGlow: hasSupporter,
            cardGlow: hasSupporter,
            shimmerBoost: hasSupporter,
        },
        pro: {
            active: hasPro,
            premiumBadge: hasPro,
            strongGlow: hasPro,
            premiumVisuals: hasPro,
            premiumLayers: hasPro,
        },
        earth: {
            active: hasEarth,
            earthBadge: hasEarth,
            insightsCards: hasEarth,
            analytics: hasEarth,
            trends: hasEarth,
        },
        donator: {
            active: hasDonator,
            guardianBadge: hasDonator,
            particles: hasDonator,
            aura: hasDonator,
            donationAmount: userAccess.donationAmount,
        },
    };
}

export function getHeroGlowShadow(unlocks: PremiumUnlocks) {
    if (unlocks.pro.strongGlow) {
        return "0 0 80px rgba(16,185,129,0.16)";
    }

    if (unlocks.supporter.heroGlow) {
        return "0 0 55px rgba(34,211,238,0.14)";
    }

    return "0 0 0 rgba(0,0,0,0)";
}

export function getLiveCardShadow(unlocks: PremiumUnlocks, baseGlow: string) {
    if (unlocks.pro.strongGlow) {
        return `0 0 110px rgba(16,185,129,0.14), 0 0 30px ${baseGlow}20`;
    }

    if (unlocks.supporter.cardGlow) {
        return `0 0 90px ${baseGlow}20`;
    }

    return `0 0 90px ${baseGlow}16`;
}

export function getShimmerDuration(unlocks: PremiumUnlocks, isSlow: boolean) {
    if (unlocks.pro.premiumVisuals) {
        return isSlow ? "2.8s" : "1.6s";
    }

    if (unlocks.supporter.shimmerBoost) {
        return isSlow ? "3s" : "1.9s";
    }

    return isSlow ? "3.4s" : "2.2s";
}

export function getPlanetGuardianLabel(unlocks: PremiumUnlocks) {
    if (!unlocks.donator.guardianBadge) return null;
    return `🪐 Planet Guardian • ${unlocks.donator.donationAmount}€`;
}