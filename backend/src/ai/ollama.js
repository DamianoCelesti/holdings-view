async function runOllamaPrompt(prompt, opts = {}) {
    const baseUrl = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
    const model = process.env.OLLAMA_MODEL || "llama3:latest";
    const temperature =
        typeof opts.temperature === "number" ? opts.temperature : 0.2;

    const response = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model,
            prompt,
            stream: false,
            options: {
                temperature,
                top_p: 0.9,
                num_predict: 1400,
            },
        }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Ollama error ${response.status}: ${text}`);
    }

    const data = await response.json();

    if (!data.response) {
        throw new Error("Empty response from Ollama");
    }

    return data.response.trim();
}

module.exports = {
    runOllamaPrompt,
};