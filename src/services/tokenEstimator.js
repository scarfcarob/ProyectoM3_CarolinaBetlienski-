
export function estimateTokens(text) {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}


export function estimateContentsTokens(contents) {
  return contents.reduce((total, msg) => {
    const text = msg.parts?.[0]?.text ?? "";
    return total + estimateTokens(text);
  }, 0);
}