// Model registry with pricing per 1K tokens (approximate)
export const MODELS = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    costPer1k: 0.00015, // input
    costPer1kOutput: 0.0006,
    description: 'Fast & affordable. Great for most tasks.',
    tier: 'free',
    icon: '⚡',
    color: '#22c55e',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    costPer1k: 0.0025,
    costPer1kOutput: 0.01,
    description: 'Powerful multimodal model. Excellent reasoning.',
    tier: 'builder',
    icon: '🧠',
    color: '#3b82f6',
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    costPer1k: 0.003,
    costPer1kOutput: 0.015,
    description: 'Best for writing, analysis, and nuanced tasks.',
    tier: 'builder',
    icon: '✨',
    color: '#d97706',
  },
  {
    id: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    costPer1k: 0.0008,
    costPer1kOutput: 0.004,
    description: 'Fast Claude model. Great balance of speed & quality.',
    tier: 'free',
    icon: '🌸',
    color: '#ec4899',
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    costPer1k: 0.01,
    costPer1kOutput: 0.03,
    description: 'Most capable OpenAI model. Best for complex tasks.',
    tier: 'scale',
    icon: '🚀',
    color: '#8b5cf6',
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    costPer1k: 0.00125,
    costPer1kOutput: 0.005,
    description: 'Google\'s best model. Strong at reasoning and code.',
    tier: 'builder',
    icon: '💎',
    color: '#06b6d4',
  },
];

export function getModel(id) {
  return MODELS.find(m => m.id === id) || MODELS[0];
}

export function estimateCost(model, inputTokens, outputTokens) {
  const m = typeof model === 'string' ? getModel(model) : model;
  return (inputTokens / 1000) * m.costPer1k + (outputTokens / 1000) * m.costPer1kOutput;
}
