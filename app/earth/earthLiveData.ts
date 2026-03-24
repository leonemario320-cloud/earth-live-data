type LiveDataId =
    | "population"
    | "births"
    | "deaths"
    | "flights"
    | "earthquakes"
    | "fires"
    | "suicides"
    | "roadDeaths"
    | "smokingDeaths"
    | "alcoholDeaths"
    | "abortions"
    | "illegalDrugSpend"
    | "storms"
    | "oceans"
    | "energy"
    | "food"
    | "water";

type LiveDatum = {
    id: LiveDataId;
    rawValue: number;
    value: string;
    updatedAt: number;
};

type LiveDataMap = Record<LiveDataId, LiveDatum>;

/**
 * POPOLAZIONE GLOBALE
 * Non deve mai ripartire al refresh o a mezzanotte.
 */
const WORLD_POPULATION_BASE = 8_200_000_000;
const POPULATION_BASE_TIMESTAMP = new Date("2026-01-01T00:00:00Z").getTime();

/**
 * RATE AL SECONDO
 */
const BIRTHS_PER_SECOND = 4.3;
const DEATHS_PER_SECOND = 1.8;

const SUICIDES_PER_YEAR = 727_000;
const ROAD_DEATHS_PER_YEAR = 1_190_000;
const SMOKING_DEATHS_PER_YEAR = 7_000_000;
const ALCOHOL_DEATHS_PER_YEAR = 2_600_000;
const ABORTIONS_PER_YEAR = 73_000_000;
const ILLEGAL_DRUG_SPEND_USD_PER_YEAR = 400_000_000_000;

/**
 * STIME GIORNALIERE
 * Energia resta una stima globale live.
 */
const ENERGY_PER_SECOND = 61_000; // MWh
const WATER_PER_SECOND = 126_000; // m³
const FOOD_PER_SECOND = 166_000; // kg

const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60;

function formatInteger(value: number, locale = "it-IT") {
    return new Intl.NumberFormat(locale).format(Math.floor(value));
}

function formatOneDecimal(value: number, locale = "it-IT") {
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(value);
}

function formatUsdInteger(value: number, locale = "it-IT") {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(Math.floor(value));
}

function formatTemperature(value: number, locale = "it-IT") {
    return `${new Intl.NumberFormat(locale, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(value)} °C`;
}

function getStartOfToday() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay.getTime();
}

function getElapsedSecondsToday(now = Date.now()) {
    return Math.max(0, (now - getStartOfToday()) / 1000);
}

function annualToTodayCount(perYear: number, now = Date.now()) {
    const perSecond = perYear / SECONDS_PER_YEAR;
    return getElapsedSecondsToday(now) * perSecond;
}

/**
 * POPOLAZIONE CONTINUA
 */
export function getEstimatedPopulation(now = Date.now()) {
    const elapsedSeconds = (now - POPULATION_BASE_TIMESTAMP) / 1000;

    return (
        WORLD_POPULATION_BASE +
        elapsedSeconds * (BIRTHS_PER_SECOND - DEATHS_PER_SECOND)
    );
}

/**
 * GIORNALIERO
 */
export function getEstimatedBirthsToday(now = Date.now()) {
    return getElapsedSecondsToday(now) * BIRTHS_PER_SECOND;
}

export function getEstimatedDeathsToday(now = Date.now()) {
    return getElapsedSecondsToday(now) * DEATHS_PER_SECOND;
}

export function getEstimatedSuicidesToday(now = Date.now()) {
    return annualToTodayCount(SUICIDES_PER_YEAR, now);
}

export function getEstimatedRoadDeathsToday(now = Date.now()) {
    return annualToTodayCount(ROAD_DEATHS_PER_YEAR, now);
}

export function getEstimatedSmokingDeathsToday(now = Date.now()) {
    return annualToTodayCount(SMOKING_DEATHS_PER_YEAR, now);
}

export function getEstimatedAlcoholDeathsToday(now = Date.now()) {
    return annualToTodayCount(ALCOHOL_DEATHS_PER_YEAR, now);
}

export function getEstimatedAbortionsToday(now = Date.now()) {
    return annualToTodayCount(ABORTIONS_PER_YEAR, now);
}

export function getEstimatedIllegalDrugSpendToday(now = Date.now()) {
    return annualToTodayCount(ILLEGAL_DRUG_SPEND_USD_PER_YEAR, now);
}

export function getEstimatedEnergyToday(now = Date.now()) {
    return getElapsedSecondsToday(now) * ENERGY_PER_SECOND;
}

export function getEstimatedWaterToday(now = Date.now()) {
    return getElapsedSecondsToday(now) * WATER_PER_SECOND;
}

export function getEstimatedFoodToday(now = Date.now()) {
    return getElapsedSecondsToday(now) * FOOD_PER_SECOND;
}

/**
 * POLLED DATA
 */
export async function getEarthquakesCount(): Promise<number> {
    try {
        const res = await fetch(
            "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
            { cache: "no-store" }
        );

        if (!res.ok) return -1;

        const data = await res.json();
        return Array.isArray(data.features) ? data.features.length : -1;
    } catch {
        return -1;
    }
}

export async function getFlightsCount(): Promise<number> {
    try {
        const res = await fetch("/api/flights", {
            cache: "no-store",
        });

        if (!res.ok) return -1;

        const data = await res.json();
        return typeof data.count === "number" ? data.count : -1;
    } catch {
        return -1;
    }
}

export async function getFiresCount(): Promise<number> {
    try {
        const res = await fetch("/api/fires", {
            cache: "no-store",
        });

        if (!res.ok) return -1;

        const data = await res.json();
        return typeof data.count === "number" ? data.count : -1;
    } catch {
        return -1;
    }
}

/**
 * TEMPeste REALI NASA EONET
 * categoria severeStorms, default open events
 */
export async function getStormsCount(): Promise<number> {
    try {
        const res = await fetch(
            "https://eonet.gsfc.nasa.gov/api/v3/events?category=severeStorms&status=open",
            { cache: "no-store" }
        );

        if (!res.ok) return -1;

        const data = await res.json();

        if (Array.isArray(data.events)) return data.events.length;
        if (Array.isArray(data)) return data.length;

        return -1;
    } catch {
        return -1;
    }
}

/**
 * OCEANI REALI
 * Media SST di 4 punti oceanici usando Open-Meteo Marine current sea_surface_temperature
 */
export async function getOceanSurfaceTemp(): Promise<number> {
    try {
        const latitudes = "0,-30,20,45";
        const longitudes = "-140,20,150,-30";

        const url =
            `https://marine-api.open-meteo.com/v1/marine` +
            `?latitude=${latitudes}` +
            `&longitude=${longitudes}` +
            `&current=sea_surface_temperature` +
            `&timezone=GMT` +
            `&cell_selection=sea`;

        const res = await fetch(url, {
            cache: "no-store",
        });

        if (!res.ok) return -1;

        const data = await res.json();

        // Multi-location response
        if (Array.isArray(data)) {
            const values = data
                .map((item: any) => item?.current?.sea_surface_temperature)
                .filter((v: any) => typeof v === "number");

            if (!values.length) return -1;

            const avg = values.reduce((sum: number, v: number) => sum + v, 0) / values.length;
            return avg;
        }

        // Some deployments may return an object containing arrays/list
        if (Array.isArray(data?.responses)) {
            const values = data.responses
                .map((item: any) => item?.current?.sea_surface_temperature)
                .filter((v: any) => typeof v === "number");

            if (!values.length) return -1;

            const avg = values.reduce((sum: number, v: number) => sum + v, 0) / values.length;
            return avg;
        }

        // Fallback single location
        if (typeof data?.current?.sea_surface_temperature === "number") {
            return data.current.sea_surface_temperature;
        }

        return -1;
    } catch {
        return -1;
    }
}

export async function getPolledLiveData(
    locale = "it-IT"
): Promise<Partial<LiveDataMap>> {
    const [earthquakes, flights, fires, storms, oceans] = await Promise.all([
        getEarthquakesCount(),
        getFlightsCount(),
        getFiresCount(),
        getStormsCount(),
        getOceanSurfaceTemp(),
    ]);

    const now = Date.now();

    return {
        earthquakes: {
            id: "earthquakes",
            rawValue: earthquakes,
            value: earthquakes >= 0 ? formatInteger(earthquakes, locale) : "Updating...",
            updatedAt: now,
        },
        flights: {
            id: "flights",
            rawValue: flights,
            value: flights >= 0 ? formatInteger(flights, locale) : "Updating...",
            updatedAt: now,
        },
        fires: {
            id: "fires",
            rawValue: fires,
            value: fires >= 0 ? formatInteger(fires, locale) : "Updating...",
            updatedAt: now,
        },
        storms: {
            id: "storms",
            rawValue: storms,
            value: storms >= 0 ? `${formatInteger(storms, locale)} sistemi attivi` : "Updating...",
            updatedAt: now,
        },
        oceans: {
            id: "oceans",
            rawValue: oceans,
            value: oceans >= 0 ? formatTemperature(oceans, locale) : "Updating...",
            updatedAt: now,
        },
    };
}

export function getEstimatedLiveData(
    locale = "it-IT"
): Partial<LiveDataMap> {
    const now = Date.now();

    const population = getEstimatedPopulation(now);
    const births = getEstimatedBirthsToday(now);
    const deaths = getEstimatedDeathsToday(now);
    const suicides = getEstimatedSuicidesToday(now);
    const roadDeaths = getEstimatedRoadDeathsToday(now);
    const smokingDeaths = getEstimatedSmokingDeathsToday(now);
    const alcoholDeaths = getEstimatedAlcoholDeathsToday(now);
    const abortions = getEstimatedAbortionsToday(now);
    const illegalDrugSpend = getEstimatedIllegalDrugSpendToday(now);

    const energy = getEstimatedEnergyToday(now);
    const water = getEstimatedWaterToday(now);
    const food = getEstimatedFoodToday(now);

    return {
        population: {
            id: "population",
            rawValue: population,
            value: formatInteger(population, locale),
            updatedAt: now,
        },
        births: {
            id: "births",
            rawValue: births,
            value: `+${formatInteger(births, locale)}`,
            updatedAt: now,
        },
        deaths: {
            id: "deaths",
            rawValue: deaths,
            value: `+${formatInteger(deaths, locale)}`,
            updatedAt: now,
        },
        suicides: {
            id: "suicides",
            rawValue: suicides,
            value: `+${formatOneDecimal(suicides, locale)}`,
            updatedAt: now,
        },
        roadDeaths: {
            id: "roadDeaths",
            rawValue: roadDeaths,
            value: `+${formatOneDecimal(roadDeaths, locale)}`,
            updatedAt: now,
        },
        smokingDeaths: {
            id: "smokingDeaths",
            rawValue: smokingDeaths,
            value: `+${formatOneDecimal(smokingDeaths, locale)}`,
            updatedAt: now,
        },
        alcoholDeaths: {
            id: "alcoholDeaths",
            rawValue: alcoholDeaths,
            value: `+${formatOneDecimal(alcoholDeaths, locale)}`,
            updatedAt: now,
        },
        abortions: {
            id: "abortions",
            rawValue: abortions,
            value: `+${formatInteger(abortions, locale)}`,
            updatedAt: now,
        },
        illegalDrugSpend: {
            id: "illegalDrugSpend",
            rawValue: illegalDrugSpend,
            value: formatUsdInteger(illegalDrugSpend, locale),
            updatedAt: now,
        },
        energy: {
            id: "energy",
            rawValue: energy,
            value: `${formatInteger(energy, locale)} MWh`,
            updatedAt: now,
        },
        water: {
            id: "water",
            rawValue: water,
            value: `${formatInteger(water, locale)} m³`,
            updatedAt: now,
        },
        food: {
            id: "food",
            rawValue: food,
            value: `${formatInteger(food, locale)} kg`,
            updatedAt: now,
        },
    };
}