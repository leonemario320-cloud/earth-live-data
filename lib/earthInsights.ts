import type { AppLanguage } from "@/lib/earthCopy";

type InsightTone = {
    label: string;
    value: string;
    description: string;
    border: string;
    glow: string;
    pulse: boolean;
};

type EarthInsightsResult = {
    worldMood: InsightTone;
    activePressure: InsightTone;
    dominantSignal: InsightTone;
};

export function getEarthInsights(
    liveValues: Record<string, string>,
    lang: AppLanguage = "en"
): EarthInsightsResult {
    const t =
        lang === "it"
            ? {
                worldMood: "Umore del mondo",
                activePressure: "Pressione attiva",
                dominantSignal: "Segnale dominante",

                calm: "Calmo",
                stable: "Stabile",
                active: "Attivo",
                tense: "Teso",
                underPressure: "Sotto pressione",
                critical: "Critico",

                worldMoodDescriptions: {
                    calm: "L'attività globale appare contenuta e relativamente tranquilla.",
                    stable: "Il pianeta mostra un equilibrio generale abbastanza stabile.",
                    active: "L'attività globale è viva e chiaramente in movimento.",
                    tense: "Più sistemi globali stanno mostrando una pressione crescente.",
                    underPressure:
                        "Diversi segnali indicano una fase di forte pressione globale.",
                    critical:
                        "Il pianeta sta mostrando un livello di pressione molto elevato in questo momento.",
                },

                activePressureDescriptions: {
                    StormSystems:
                        "I sistemi meteorologici severi stanno guidando la pressione globale attuale.",
                    SeismicActivity:
                        "L'attività sismica è uno dei segnali più forti in questo momento.",
                    Wildfires:
                        "Gli incendi attivi stanno contribuendo in modo rilevante alla pressione globale.",
                    AirTraffic:
                        "Il traffico aereo è uno dei segnali dominanti del pianeta in questo momento.",
                    HumanConsumption:
                        "I consumi globali stanno pesando fortemente sul ritmo attuale del pianeta.",
                    GlobalSystems:
                        "Più sistemi globali stanno contribuendo insieme alla pressione attuale.",
                },

                dominantSignalDescriptions: {
                    Flights:
                        "Il traffico aereo è il segnale dominante tra i flussi live attuali.",
                    Energy:
                        "Il consumo energetico è il segnale più forte in questo momento.",
                    Water: "Il consumo d'acqua sta emergendo come segnale dominante.",
                    Food:
                        "Il consumo alimentare è uno dei movimenti globali più forti del momento.",
                    Births:
                        "Le nascite stanno guidando il flusso umano globale di oggi.",
                    Fires: "Gli incendi stanno dominando i segnali live del pianeta.",
                    Storms:
                        "Le tempeste stanno guidando i segnali atmosferici globali.",
                    Population:
                        "La popolazione resta il segnale di fondo dominante del pianeta.",
                },

                pressureValueMap: {
                    StormSystems: "Sistemi di tempesta",
                    SeismicActivity: "Attività sismica",
                    Wildfires: "Incendi attivi",
                    AirTraffic: "Traffico aereo",
                    HumanConsumption: "Consumo umano",
                    GlobalSystems: "Sistemi globali",
                },

                signalValueMap: {
                    Flights: "Voli",
                    Energy: "Energia",
                    Water: "Acqua",
                    Food: "Cibo",
                    Births: "Nascite",
                    Fires: "Incendi",
                    Storms: "Tempeste",
                    Population: "Popolazione",
                },
            }
            : {
                worldMood: "World Mood",
                activePressure: "Active Pressure",
                dominantSignal: "Dominant Signal",

                calm: "Calm",
                stable: "Stable",
                active: "Active",
                tense: "Tense",
                underPressure: "Under Pressure",
                critical: "Critical",

                worldMoodDescriptions: {
                    calm: "Global activity appears contained and relatively calm.",
                    stable: "The planet is showing a fairly balanced global state.",
                    active: "Global activity is clearly moving at a strong pace.",
                    tense: "Multiple global systems are showing rising pressure.",
                    underPressure:
                        "Several signals suggest a phase of strong global pressure.",
                    critical:
                        "The planet is showing a very high level of pressure right now.",
                },

                activePressureDescriptions: {
                    StormSystems:
                        "Severe weather systems are driving the current global pressure.",
                    SeismicActivity:
                        "Seismic activity is one of the strongest signals right now.",
                    Wildfires:
                        "Active wildfires are contributing strongly to global pressure.",
                    AirTraffic:
                        "Air traffic is one of the dominant global signals right now.",
                    HumanConsumption:
                        "Global consumption is heavily shaping the planet's current pace.",
                    GlobalSystems:
                        "Multiple global systems are contributing to the current pressure.",
                },

                dominantSignalDescriptions: {
                    Flights:
                        "Air traffic is the dominant signal among current live flows.",
                    Energy: "Energy consumption is the strongest signal right now.",
                    Water: "Water consumption is emerging as the dominant signal.",
                    Food:
                        "Food consumption is one of the strongest global movements at the moment.",
                    Births: "Births are driving today's global human flow.",
                    Fires: "Wildfires are dominating the planet's live signals.",
                    Storms:
                        "Storm systems are leading the current atmospheric signals.",
                    Population:
                        "Population remains the planet's dominant background signal.",
                },

                pressureValueMap: {
                    StormSystems: "Storm Systems",
                    SeismicActivity: "Seismic Activity",
                    Wildfires: "Wildfires",
                    AirTraffic: "Air Traffic",
                    HumanConsumption: "Human Consumption",
                    GlobalSystems: "Global Systems",
                },

                signalValueMap: {
                    Flights: "Flights",
                    Energy: "Energy",
                    Water: "Water",
                    Food: "Food",
                    Births: "Births",
                    Fires: "Fires",
                    Storms: "Storms",
                    Population: "Population",
                },
            };

    const parse = (value: string) => {
        if (!value) return 0;

        const cleaned = value
            .replace(/\./g, "")
            .replace(/,/g, ".")
            .replace(/[^\d.-]/g, "");

        const parsed = Number(cleaned);
        return Number.isFinite(parsed) ? parsed : 0;
    };

    const storms = parse(liveValues.storms ?? "0");
    const earthquakes = parse(liveValues.earthquakes ?? "0");
    const fires = parse(liveValues.fires ?? "0");

    const pressureScore = storms * 3 + earthquakes * 2 + fires;

    let moodValue = t.calm;
    let moodDescription = t.worldMoodDescriptions.calm;
    let moodBorder = "rgba(34,197,94,0.35)";
    let moodGlow = "0 0 35px rgba(34,197,94,0.12)";
    let moodPulse = false;

    if (pressureScore >= 600) {
        moodValue = t.critical;
        moodDescription = t.worldMoodDescriptions.critical;
        moodBorder = "rgba(244,63,94,0.4)";
        moodGlow = "0 0 35px rgba(244,63,94,0.16)";
        moodPulse = true;
    } else if (pressureScore >= 300) {
        moodValue = t.underPressure;
        moodDescription = t.worldMoodDescriptions.underPressure;
        moodBorder = "rgba(249,115,22,0.4)";
        moodGlow = "0 0 35px rgba(249,115,22,0.16)";
        moodPulse = true;
    } else if (pressureScore >= 140) {
        moodValue = t.tense;
        moodDescription = t.worldMoodDescriptions.tense;
        moodBorder = "rgba(245,158,11,0.38)";
        moodGlow = "0 0 35px rgba(245,158,11,0.14)";
    } else if (pressureScore >= 60) {
        moodValue = t.active;
        moodDescription = t.worldMoodDescriptions.active;
        moodBorder = "rgba(56,189,248,0.35)";
        moodGlow = "0 0 35px rgba(56,189,248,0.14)";
    } else if (pressureScore >= 20) {
        moodValue = t.stable;
        moodDescription = t.worldMoodDescriptions.stable;
        moodBorder = "rgba(125,211,252,0.3)";
        moodGlow = "0 0 35px rgba(125,211,252,0.1)";
    }

    const pressureCandidates = [
        { key: "StormSystems", raw: storms * 3 },
        { key: "SeismicActivity", raw: earthquakes * 2 },
        { key: "Wildfires", raw: fires * 1.5 },
        { key: "AirTraffic", raw: parse(liveValues.flights ?? "0") / 1000 },
        { key: "HumanConsumption", raw: parse(liveValues.energy ?? "0") / 1000000 },
    ].sort((a, b) => b.raw - a.raw);

    const topPressure =
        (pressureCandidates[0]?.key as keyof typeof t.pressureValueMap | undefined) ??
        "GlobalSystems";

    const dominantCandidates = [
        { key: "Flights", raw: parse(liveValues.flights ?? "0") },
        { key: "Energy", raw: parse(liveValues.energy ?? "0") },
        { key: "Water", raw: parse(liveValues.water ?? "0") },
        { key: "Food", raw: parse(liveValues.food ?? "0") },
        { key: "Births", raw: parse(liveValues.births ?? "0") },
        { key: "Fires", raw: parse(liveValues.fires ?? "0") * 1000 },
        { key: "Storms", raw: parse(liveValues.storms ?? "0") * 1000 },
    ].sort((a, b) => b.raw - a.raw);

    const topSignal =
        (dominantCandidates[0]?.key as keyof typeof t.signalValueMap | undefined) ??
        "Population";

    return {
        worldMood: {
            label: t.worldMood,
            value: moodValue,
            description: moodDescription,
            border: moodBorder,
            glow: moodGlow,
            pulse: moodPulse,
        },
        activePressure: {
            label: t.activePressure,
            value: t.pressureValueMap[topPressure],
            description: t.activePressureDescriptions[topPressure],
            border: "rgba(56,189,248,0.35)",
            glow: "0 0 35px rgba(56,189,248,0.14)",
            pulse: false,
        },
        dominantSignal: {
            label: t.dominantSignal,
            value: t.signalValueMap[topSignal],
            description: t.dominantSignalDescriptions[topSignal],
            border: "rgba(168,85,247,0.35)",
            glow: "0 0 35px rgba(168,85,247,0.14)",
            pulse: false,
        },
    };
}