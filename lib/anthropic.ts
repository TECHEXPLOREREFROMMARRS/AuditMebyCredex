import { formatCurrency } from './utils';

export async function generateAnthropicSummary(payload: {
  teamSize: number;
  useCase: string;
  items: Array<{ tool: string; currentMonthly: number; reason: string }>;
  totals: { monthlySavings: number; annualSavings: number };
}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.includes('dummy')) {
    throw new Error('Anthropic API not configured');
  }

  const toolLines = payload.items
    .map(item => `- ${item.tool}: ${formatCurrency(item.currentMonthly)} — ${item.reason}`)
    .join('\n');

  const prompt = `You are an expert AI spend analyst.

The user has a team of ${payload.teamSize} people focused on ${payload.useCase}.
Their current stack is:
${toolLines}

Write a friendly, precise 100-word summary that highlights the biggest recommendation, explains why it saves money, and mentions Credex if the audit shows meaningful optimization potential.
`;

  const response = await fetch('https://api.anthropic.com/v1/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'claude-3.5',
      prompt,
      max_tokens_to_sample: 250,
      temperature: 0.25,
      stop_sequences: ['\n\n'],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic error ${response.status}`);
  }

  const data = await response.json();
  return data?.completion?.trim() || '';
}
