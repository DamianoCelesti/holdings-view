const { buildCommentsBlockForPrompt } = require("./comments");

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