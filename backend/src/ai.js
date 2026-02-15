
function buildPromptIT(post) {
    const title = post.title || "";
    const body = (post.selftext || "").trim();

    const author = post.author || "n/d";
    const subreddit = post.subreddit || "n/d";
    const link = post.permalink || post.url || "n/d";

    return `
Sei un assistente che riassume un post di Reddit.
Scrivi un riassunto in ITALIANO in MARKDOWN, ben strutturato.

Regole IMPORTANTI:
- Non inventare dettagli.
- Se mancano informazioni, scrivi "n/d".
- Mantieni tono neutro.
- Output SOLO markdown.
- I campi Autore/Subreddit/Link DEVONO essere COPIATI ESATTAMENTE dai metadati qui sotto (non usare link nel testo).

METADATI (da copiare):
Titolo: ${title}
Autore: ${author}
Subreddit: ${subreddit}
Link: ${link}

TESTO DEL POST:
${body ? body : "(nessun testo, solo link)"}

Formato obbligatorio:
# Titolo: <titolo>
- Autore: <autore>
- Subreddit: <subreddit>
- Link: <link>

## Riassunto (3-6 punti)
- ...

## Dettagli importanti
- ...

## Cosa chiede / obiettivo dell’autore
- ...
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
                temperature: 0.2
            }
        })
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
