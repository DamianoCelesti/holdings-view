const { buildAnalysisPrompt, buildSummaryPromptIT } = require("./prompts");
const { runOllamaPrompt } = require("./ollama");
const { parseMaybeJson, normalizeClassification } = require("./parser");

async function classifyPostWithAI(post) {
    const prompt = buildAnalysisPrompt(post);
    const response = await runOllamaPrompt(prompt, { temperature: 0.1 });

    const parsed = parseMaybeJson(response);
    return normalizeClassification(parsed);
}

async function summarizePostToMarkdownIT(post) {
    const prompt = buildSummaryPromptIT(post);
    return runOllamaPrompt(prompt, { temperature: 0.2 });
}

function buildAIData(analysis) {
    return {
        confidence: analysis.confidence,
        category: analysis.category,
        tickers: analysis.tickers,
        sentiment: analysis.sentiment,
        thesisStrength: analysis.thesisStrength,
        reason: analysis.reason,
        translation: {
            titleIt: analysis.translatedTitle,
            bodyIt: analysis.translatedBody,
        },
        keyFacts: analysis.keyFacts,
        trendSignals: analysis.trendSignals,
        metrics: analysis.metrics,
        topics: analysis.topics,
        entities: analysis.entities,
        riskFlags: analysis.riskFlags,
        dataQuality: analysis.dataQuality,
    };
}

async function runManualAIPipeline(post) {
    const [analysis, aiSummaryMd] = await Promise.all([
        classifyPostWithAI(post),
        summarizePostToMarkdownIT(post),
    ]);

    return {
        aiSummaryMd,
        aiScore: analysis.score,
        aiDataJson: buildAIData(analysis),
        analysis,
    };
}

module.exports = {
    summarizePostToMarkdownIT,
    classifyPostWithAI,
    runManualAIPipeline,
};