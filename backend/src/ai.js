
function clampText(text, maxLen) {
    const t = (text || "").toString().trim();
    if (!t) return "";
    return t.length > maxLen ? t.slice(0, maxLen) + "…" : t;
}

function isUsefulComment(c) {
    const body = (c?.body || "").trim();
    if (!body) return false;

    const lower = body.toLowerCase();
    if (lower === "[deleted]" || lower === "[removed]") return false;
    if (body.length < 5) return false;

    return true;
}

function pickComments(rawComments, opts = {}) {
    const maxComments = opts.maxComments ?? 30;
    const maxCharsPerComment = opts.maxCharsPerComment ?? 400;

    const comments = Array.isArray(rawComments) ? rawComments : [];
    const total = comments.length;

    let minScore = 0;
    if (total <= 10) minScore = 0;
    else if (total <= 100) minScore = 10;
    else minScore = 11;

    const selected = comments
        .filter(isUsefulComment)
        .filter((c) => (c.score ?? 0) >= minScore)
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, maxComments)
        .map((c) => ({
            author: c.author || "n/d",
            score: c.score ?? 0,
            body: clampText(c.body, maxCharsPerComment),
        }));

    return { total, minScore, selectedCount: selected.length, selected };
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

    if (!total) {
        return {
            info: "n/d (nessun commento fornito dal backend)",
            block: "- n/d",
        };
    }

    const info = `Totale commenti: ${total} — Soglia score: ${minScore}+ — Usati: ${selectedCount}`;

    const block = selectedCount
        ? selected
            .map((c) => `- (score ${c.score}) u/${c.author}: ${c.body}`)
            .join("\n")
        : `- n/d (nessun commento supera la soglia score ${minScore}+)`;

    return { info, block };
}

function buildPromptIT(post) {
    const title = post?.title || "";
    const body = (post?.selftext || "").trim();

    const author = post?.author || "n/d";
    const subreddit = post?.subreddit || "n/d";
    const link = post?.permalink || post?.url || "n/d";

    const { info: commentsInfo, block: commentsBlock } =
        buildCommentsBlockForPrompt(post);

    return `
Sei un assistente che TRASFORMA un post di Reddit in una spiegazione chiara in ITALIANO.
Scrivi in MARKDOWN, con frasi semplici e informative.

REGOLE IMPORTANTI
- Non inventare nulla. Se manca info scrivi "n/d".
- NON fare un riassunto troppo corto: voglio un output utile e leggibile.
- Evita ripetizioni e frasi vuote (es: "in sintesi", "il post parla di...").
- Se trovi ticker (es: AAPL, TSLA), numeri (es: 120M, 3.5B), percentuali (es: +12%), date (es: 2025, 14 Jan), prezzi (es: $45.30): estraili esattamente come scritti nel testo.
- Se il testo è confuso, ambiguo o incompleto, NON fare ipotesi e NON aggiungere conoscenze esterne. Scrivi solo quali informazioni mancano in base al testo fornito.
- I campi Autore/Subreddit/Link DEVONO essere copiati ESATTAMENTE dai metadati qui sotto.
- Output SOLO markdown.

METADATI (da copiare):
Titolo: ${title}
Autore: ${author}
Subreddit: ${subreddit}
Link: ${link}

TESTO DEL POST:
${body ? body : "(nessun testo, solo link)"}

COMMENTI TOP (selezionati):
${commentsInfo}
${commentsBlock}

FORMATO OBBLIGATORIO (usa sempre queste sezioni):

# Titolo: <titolo>
- Autore: <autore>
- Subreddit: <subreddit>
- Link: <link>

## Che cosa sta succedendo (spiegato semplice)
- 2–5 punti chiari: cosa è successo / cosa annuncia / qual è il tema.

## Punti chiave (con dettagli)
- 4–8 punti. Ogni punto deve aggiungere un'informazione diversa.

## Numeri / Dati trovati (se presenti)
- Ticker: ...
- Numeri importanti (prezzi, %, utenti, ricavi, valutazioni): ...
- Date / scadenze: ...
- Prezzi / livelli: ...

## Insight dai commenti (cosa aggiunge la community)
- 2–6 punti: differenze, dubbi, conferme, critiche, dati aggiunti dai commenti.
- Se i commenti sono pochi o inutili scrivi "n/d".

## Fatti vs Opinioni
- Fatti (cose verificabili nel testo o nei commenti): ...
- Opinioni / interpretazioni (autore o commentatori): ...

## Perché può essere importante (impatto possibile)
- 2–6 punti: cosa potrebbe cambiare e per chi (azienda, settore, investitori).

## TL;DR (1 frase)
- Una frase secca e utile, non generica.
`.trim();
}

async function summarizePostToMarkdownIT(post) {
    const baseUrl = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
    const model = process.env.OLLAMA_MODEL || "llama3:latest";

    const prompt = buildPromptIT(post);

    const resp = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model,
            prompt,
            stream: false,
            options: {
                temperature: 0.2,
            },
        }),
    });

    if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(`Ollama error ${resp.status}: ${text}`);
    }

    const data = await resp.json();
    const result = (data.response || "").trim();

    if (!result) {
        throw new Error("Empty response from Ollama");
    }

    return result;
}

module.exports = { summarizePostToMarkdownIT };