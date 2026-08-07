
const SESSION_TOKEN_LIMIT = 4000;

let sessionPromptTokens = 0;
let sessionCandidateTokens = 0;
let requestCount = 0;

export function recordUsage(promptTokenCount, candidatesTokenCount) {
  sessionPromptTokens += promptTokenCount;
  sessionCandidateTokens += candidatesTokenCount;
  requestCount++;
}

export function recordRealUsage(raw) {
  const usage = raw?.usageMetadata;
  if (!usage) return;
  recordUsage(usage.promptTokenCount ?? 0, usage.candidatesTokenCount ?? 0);
}

export function getSessionUsage() {
  const totalTokens = sessionPromptTokens + sessionCandidateTokens;
  return {
    requestCount,
    promptTokens: sessionPromptTokens,
    candidateTokens: sessionCandidateTokens,
    totalTokens,
    limit: SESSION_TOKEN_LIMIT,
    remaining: Math.max(0, SESSION_TOKEN_LIMIT - totalTokens),
  };
}

export function isSessionQuotaExceeded() {
  return sessionPromptTokens + sessionCandidateTokens >= SESSION_TOKEN_LIMIT;
}

export function resetSessionUsage() {
  sessionPromptTokens = 0;
  sessionCandidateTokens = 0;
  requestCount = 0;
}