function clampText(text, maxLen) {
    if (!text) return "";

    const value = String(text).trim();
    if (!value) return "";

    if (value.length <= maxLen) return value;

    return value.slice(0, maxLen) + "...";
}

function isUsefulComment(comment) {
    if (!comment || !comment.body) return false;

    const body = comment.body.trim();
    if (!body) return false;

    const lower = body.toLowerCase();
    if (lower === "[deleted]" || lower === "[removed]") return false;

    if (body.length < 5) return false;

    return true;
}

function getMinScore(total) {
    if (total <= 10) return 0;
    if (total <= 100) return 10;
    return 11;
}

function pickComments(rawComments, opts = {}) {
    const maxComments = opts.maxComments ?? 30;
    const maxChars = opts.maxCharsPerComment ?? 400;

    if (!Array.isArray(rawComments)) {
        return { total: 0, minScore: 0, selectedCount: 0, selected: [] };
    }

    const total = rawComments.length;
    const minScore = getMinScore(total);

    const selected = rawComments
        .filter(isUsefulComment)
        .filter((c) => c.score >= minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxComments)
        .map((c) => ({
            author: c.author || "n/d",
            score: c.score || 0,
            body: clampText(c.body, maxChars),
        }));

    return {
        total,
        minScore,
        selectedCount: selected.length,
        selected,
    };
}

function buildCommentsBlockForPrompt(post) {
    const raw =
        post?.comments ||
        post?.topComments ||
        post?.topCommentsRaw ||
        [];

    const { total, minScore, selectedCount, selected } = pickComments(raw, {
        maxComments: 30,
        maxCharsPerComment: 400,
    });

    if (total === 0) {
        return {
            info: "n/d (nessun commento fornito dal backend)",
            block: "- n/d",
        };
    }

    const info = `Totale commenti: ${total} - Soglia score: ${minScore}+ - Usati: ${selectedCount}`;

    if (selected.length === 0) {
        return {
            info,
            block: `- n/d (nessun commento supera la soglia score ${minScore}+)`,
        };
    }

    const block = selected
        .map((c) => `- (score ${c.score}) u/${c.author}: ${c.body}`)
        .join("\n");

    return { info, block };
}

module.exports = {
    pickComments,
    buildCommentsBlockForPrompt,
};