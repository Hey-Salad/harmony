// Model pricing per 1M tokens
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gemini-2.5-flash': { input: 0.15, output: 0.60 },
  'gemini-2.5-pro': { input: 1.25, output: 10.00 },
  'gemini-2.0-flash': { input: 0.10, output: 0.40 },
  'claude-sonnet': { input: 3.00, output: 15.00 },
  'claude-opus': { input: 15.00, output: 75.00 },
  'claude-haiku': { input: 0.25, output: 1.25 },
  'gpt-4o': { input: 2.50, output: 10.00 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
};

export function calculateCost(
  modelName: string,
  tokensInput: number,
  tokensOutput: number,
): number {
  // Normalize model name for lookup
  const normalized = modelName.toLowerCase().replace(/[_\s]/g, '-');
  const pricing = Object.entries(MODEL_PRICING).find(([key]) =>
    normalized.includes(key)
  );

  if (!pricing) return 0;

  const [, rates] = pricing;
  const inputCost = (tokensInput / 1_000_000) * rates.input;
  const outputCost = (tokensOutput / 1_000_000) * rates.output;
  return inputCost + outputCost;
}
