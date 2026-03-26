const { buildCommentsBlockForPrompt } = require("./comments");

function buildAnalysisPrompt(post) {
    const title = post?.title || "";
    const body = (post?.selftext || "").trim();

    const author = post?.author || "n/d";
    const subreddit = post?.subreddit || "n/d";
    const link = post?.permalink || post?.url || "n/d";

    const { info, block } = buildCommentsBlockForPrompt(post);

    return `
You are classifying Reddit posts for an investing workflow.

Use only the information present in the title, body, link and comments.
Do not use external knowledge.
Do not invent facts.
Return only valid JSON.

Return this exact shape:
{
  "score": 0,
  "confidence": 0,
  "isRelevant": false,
  "importance": 1,
  "category": "Other",
  "tickers": [],
  "sentiment": "neutral",
  "thesisStrength": 0,
  "reason": "",
  "translatedTitle": "",
  "translatedBody": "",
  "keyFacts": [],
  "trendSignals": [],
  "metrics": [],
  "topics": [],
  "entities": {
    "companies": [],
    "people": [],
    "products": [],
    "countries": [],
    "institutions": []
  },
  "riskFlags": [],
  "dataQuality": {
    "hasNumbers": false,
    "mentionsTicker": false,
    "isRumor": false,
    "hasSourceLink": false
  }
}

Rules:
- score must be 0-100
- confidence must be 0-1
- importance must be 1-5
- translatedTitle and translatedBody must be in Italian
- keyFacts, trendSignals, metrics, topics and riskFlags must be short arrays
- If data is missing, use empty strings, empty arrays, false, or "Other"

Metadata:
Title: ${title}
Author: ${author}
Subreddit: ${subreddit}
Link: ${link}

Post body:
${body || "(no body text)"}

Top comments:
${info}
${block}
`.trim();
}

function buildSummaryPromptIT(post) {
    const title = post?.title || "";
    const body = (post?.selftext || "").trim();

    const author = post?.author || "n/d";
    const subreddit = post?.subreddit || "n/d";
    const link = post?.permalink || post?.url || "n/d";

    const { info, block } = buildCommentsBlockForPrompt(post);

    return `
You are an analyst summarizing Reddit posts for investors.

Your goal is NOT to simply summarize.
Your goal is to extract the main investment idea, supporting facts, catalysts, risks, and useful signals from the post and comments.

Rules:
- Use ONLY information explicitly present in the title, post body, link and comments.
- Do NOT use external knowledge.
- Do NOT invent missing facts.
- If a section has no evidence, write "n/d".
- Prefer facts, numbers and concrete claims over opinions.
- Keep the writing concise and clear.
- Final output must be in Italian.
- Return ONLY markdown.

Metadata:
Title: ${title}
Author: ${author}
Subreddit: ${subreddit}
Link: ${link}

Post body:
${body || "(no body text)"}

Top comments:
${info}
${block}

...`.trim();
}

module.exports = {
    buildAnalysisPrompt,
    buildSummaryPromptIT,
};
