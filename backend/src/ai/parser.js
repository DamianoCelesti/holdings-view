function stripCodeFence(text) {
    if (!text) return "";

    const value = text.trim();
    if (!value.startsWith("```")) return value;

    return value
        .replace(/^```(?:json)?/i, "")
        .replace(/```$/i, "")
        .trim();
}

function parseMaybeJson(rawText) {
    const clean = stripCodeFence(rawText);

    try {
        return JSON.parse(clean);
    } catch {
        throw new Error("Invalid JSON from AI");
    }
}

function normalizeStringArray(value) {
    if (Array.isArray(value)) {
        return value.map((v) => String(v).trim()).filter(Boolean);
    }

    if (typeof value === "string") {
        return value
            .split(/[\n,;]+/)
            .map((v) => v.trim())
            .filter(Boolean);
    }

    return [];
}

function normalizeTickers(value) {
    return normalizeStringArray(value).map((t) => t.toUpperCase());
}

function normalizeClassification(raw) {
    const score = Math.max(0, Math.min(100, Math.round(Number(raw.score) || 0)));

    const confidence = Math.max(
        0,
        Math.min(1, Number(raw.confidence) || 0)
    );

    const category = raw.category || "Other";

    const tickers = normalizeTickers(raw.tickers);

    const sentiment = raw.sentiment || "neutral";

    const thesisStrength = Math.max(
        0,
        Math.min(5, Math.round(Number(raw.thesisStrength) || 0))
    );

    const entities = raw.entities || {
        companies: [],
        people: [],
        products: [],
        countries: [],
        institutions: [],
    };

    const dataQuality = raw.dataQuality || {
        hasNumbers: false,
        mentionsTicker: false,
        isRumor: false,
        hasSourceLink: false,
    };

    return {
        score,
        confidence,
        isRelevant: Boolean(raw.isRelevant),
        importance: Math.max(1, Math.min(5, Math.round(Number(raw.importance) || 1))),
        category,
        tickers,
        sentiment,
        thesisStrength,
        reason: raw.reason || "",
        translatedTitle: raw.translatedTitle || "",
        translatedBody: raw.translatedBody || "",
        keyFacts: normalizeStringArray(raw.keyFacts).slice(0, 8),
        trendSignals: raw.trendSignals || [],
        metrics: raw.metrics || [],
        topics: normalizeStringArray(raw.topics).slice(0, 10),
        entities,
        riskFlags: normalizeStringArray(raw.riskFlags).slice(0, 6),
        dataQuality,
    };
}

module.exports = {
    parseMaybeJson,
    normalizeClassification,
};
