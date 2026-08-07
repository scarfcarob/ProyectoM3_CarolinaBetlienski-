
import { isSessionQuotaExceeded, recordUsage } from "./quotaSimulator.js";

import { estimateContentsTokens, estimateTokens } from "./tokenEstimator.js";


let callCount = 0;

function pickRandomPhrase(phrases) {
  const index = Math.floor(Math.random() * phrases.length);
  return phrases[index];
}

export async function mockFetchAI(payload, phrases) {
  callCount++;
  await new Promise(r => setTimeout(r, 800));

  if (callCount % 5 === 0) {
    const err = new Error("Rate limit");
    err.status = 429;
    err.errorCode = "RESOURCE_EXHAUSTED";
    err.retryAfterSeconds = 3;
    throw err;
  }

  if (isSessionQuotaExceeded()) {
    const err = new Error("Session token quota exceeded");
    err.status = 429;
    err.errorCode = "RESOURCE_EXHAUSTED";
    err.retryAfterSeconds = 5;
    err.quotaReason = "TOKENS";
    throw err;
  }

  const maxOutputTokens = payload?.generationConfig?.maxOutputTokens ?? 150;
  const lastUserMessage = payload?.contents.at(-1)?.parts?.[0]?.text ?? "";

  const systemText = payload?.systemInstruction?.parts?.[0]?.text ?? "";
  const promptTokenCount = estimateContentsTokens(payload.contents) + estimateTokens(systemText);

  console.log(
    `📊 Request #${callCount} — historial: ${payload.contents.length} mensajes, ~${promptTokenCount} tokens de entrada estimados`
  );

  let responseText =
    Array.isArray(phrases) && phrases.length > 0
      ? pickRandomPhrase(phrases)
      : `Respuesta mock a: "${lastUserMessage}"`;
  let candidatesTokenCount = estimateTokens(responseText);
  let finishReason = "STOP";

  if (candidatesTokenCount > maxOutputTokens) {
    const maxChars = maxOutputTokens * 4;
    responseText = responseText.slice(0, maxChars).trim() + "…";
    candidatesTokenCount = maxOutputTokens;
    finishReason = "MAX_TOKENS";
  }

  recordUsage(promptTokenCount, candidatesTokenCount);

  return {
    candidates: [
      {
        content: { role: "model", parts: [{ text: responseText }] },
        finishReason
      }
    ],
    usageMetadata: { promptTokenCount, candidatesTokenCount }
  };
}