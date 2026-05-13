export type UseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed';
export type ToolId = 'cursor' | 'github' | 'claude' | 'chatgpt' | 'anthropic' | 'openai' | 'gemini' | 'windsurf';

export interface PlanOption {
  value: string;
  label: string;
  monthly: number;
  perSeat?: boolean;
}

export interface ToolDefinition {
  id: ToolId;
  label: string;
  vendor: string;
  plans: PlanOption[];
  help: string;
}

export interface ToolEntry {
  id: ToolId;
  enabled: boolean;
  plan: string;
  seats: number;
  monthlySpend: number;
}

export interface AuditItem {
  toolId: ToolId;
  label: string;
  currentMonthly: number;
  currentPlan: string;
  recommendedAction: string;
  savings: number;
  reason: string;
}

export interface AuditTotals {
  currentMonthly: number;
  recommendedMonthly: number;
  monthlySavings: number;
  annualSavings: number;
  highSavings: boolean;
}

export interface AuditResult {
  items: AuditItem[];
  totals: AuditTotals;
  topReason: string;
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    id: 'cursor',
    label: 'Cursor',
    vendor: 'Cursor',
    help: 'AI coding assistant with workflow tools.',
    plans: [
      { value: 'hobby', label: 'Hobby', monthly: 0 },
      { value: 'pro', label: 'Pro', monthly: 15 },
      { value: 'business', label: 'Business', monthly: 25, perSeat: true },
      { value: 'enterprise', label: 'Enterprise', monthly: 60, perSeat: true },
    ],
  },
  {
    id: 'github',
    label: 'GitHub Copilot',
    vendor: 'GitHub',
    help: 'Coding AI assistant for developers and teams.',
    plans: [
      { value: 'individual', label: 'Individual', monthly: 10 },
      { value: 'business', label: 'Business', monthly: 19, perSeat: true },
      { value: 'enterprise', label: 'Enterprise', monthly: 25, perSeat: true },
    ],
  },
  {
    id: 'claude',
    label: 'Claude',
    vendor: 'Anthropic',
    help: 'General-purpose assistant with strong reasoning for research and writing.',
    plans: [
      { value: 'free', label: 'Free', monthly: 0 },
      { value: 'pro', label: 'Pro', monthly: 20 },
      { value: 'max', label: 'Max', monthly: 99 },
      { value: 'team', label: 'Team', monthly: 30, perSeat: true },
      { value: 'enterprise', label: 'Enterprise', monthly: 45, perSeat: true },
      { value: 'api', label: 'API direct', monthly: 0 },
    ],
  },
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    vendor: 'OpenAI',
    help: 'Popular assistant for writing, research, and team collaboration.',
    plans: [
      { value: 'plus', label: 'Plus', monthly: 20 },
      { value: 'team', label: 'Team', monthly: 30, perSeat: true },
      { value: 'enterprise', label: 'Enterprise', monthly: 50, perSeat: true },
      { value: 'api', label: 'API direct', monthly: 0 },
    ],
  },
  {
    id: 'anthropic',
    label: 'Anthropic API',
    vendor: 'Anthropic',
    help: 'Direct Anthropic API spend for models used in apps.',
    plans: [{ value: 'api', label: 'API direct', monthly: 0 }],
  },
  {
    id: 'openai',
    label: 'OpenAI API',
    vendor: 'OpenAI',
    help: 'OpenAI API spend for custom applications and tooling.',
    plans: [{ value: 'api', label: 'API direct', monthly: 0 }],
  },
  {
    id: 'gemini',
    label: 'Gemini',
    vendor: 'Google',
    help: 'Google Gemini for creative and research workflows.',
    plans: [
      { value: 'pro', label: 'Pro', monthly: 20 },
      { value: 'ultra', label: 'Ultra', monthly: 40 },
      { value: 'api', label: 'API direct', monthly: 0 },
    ],
  },
  {
    id: 'windsurf',
    label: 'Windsurf / v0',
    vendor: 'Windsurf',
    help: 'Alternative AI model access for teams and API use.',
    plans: [
      { value: 'v0', label: 'v0', monthly: 0 },
      { value: 'pro', label: 'Pro', monthly: 12 },
      { value: 'api', label: 'API direct', monthly: 0 },
    ],
  },
];

export const USE_CASES: { value: UseCase; label: string }[] = [
  { value: 'coding', label: 'Coding' },
  { value: 'writing', label: 'Writing' },
  { value: 'data', label: 'Data' },
  { value: 'research', label: 'Research' },
  { value: 'mixed', label: 'Mixed / multiple' },
];

export const DEFAULT_TOOL_STATE: ToolEntry[] = TOOL_DEFINITIONS.map(tool => ({
  id: tool.id,
  enabled: false,
  plan: tool.plans[0].value,
  seats: 1,
  monthlySpend: 0,
}));

export function getToolDefinition(toolId: ToolId) {
  const tool = TOOL_DEFINITIONS.find(item => item.id === toolId);
  if (!tool) {
    throw new Error(`Unknown tool ${toolId}`);
  }
  return tool;
}

export function getPlanOption(toolId: ToolId, planId: string) {
  return getToolDefinition(toolId).plans.find(plan => plan.value === planId);
}

export function getPotentialMonthly(toolId: ToolId, planId: string, seats: number) {
  const plan = getPlanOption(toolId, planId);
  if (!plan) {
    return 0;
  }
  const seatCount = Math.max(1, seats);
  return plan.perSeat ? plan.monthly * seatCount : plan.monthly;
}

export function buildRecommendations(tool: ToolEntry, useCase: UseCase) {
  const baseCost = Math.max(0, tool.monthlySpend);
  const currentPlanOption = getPlanOption(tool.id, tool.plan);
  const currentLabel = currentPlanOption?.label || tool.plan;
  const seats = Math.max(1, tool.seats);

  // First, check if they're paying the correct amount for their selected plan
  const planValidation = validatePlanCost(tool, baseCost);

  // Always check for API credits opportunity
  const credit = recommendCreditsOpportunity(tool, baseCost);

  // Check for better plan fits
  const planFit = assessPlanFit(tool);

  // Look for cheaper same-vendor plans
  const sameVendor = recommendSameVendorPlan(tool, baseCost);

  // Look for cheaper alternative tools
  const alternative = recommendAlternativeTool(tool, useCase, baseCost);

  const candidates = [planValidation, planFit, sameVendor, alternative, credit].filter(Boolean) as Array<{ action: string; savings: number; reason: string }>;
  const best = candidates.sort((a, b) => b.savings - a.savings)[0];

  if (!best || best.savings <= 0) {
    return {
      recommendedAction: `Your current ${currentLabel} plan is a good fit for this stack.`,
      savings: 0,
      reason: `No defensible cheaper upgrade was found for ${getToolDefinition(tool.id).label}.`,
    };
  }

  return {
    recommendedAction: best.action,
    savings: best.savings,
    reason: best.reason,
  };
}

function validatePlanCost(tool: ToolEntry, currentMonthly: number) {
  const currentPlanOption = getPlanOption(tool.id, tool.plan);
  if (!currentPlanOption) return null;

  const seats = Math.max(1, tool.seats);
  const expectedCost = currentPlanOption.perSeat ? currentPlanOption.monthly * seats : currentPlanOption.monthly;

  // If they're paying significantly more than expected, flag it
  if (currentMonthly > expectedCost * 1.2) {
    return {
      action: `Verify your ${currentPlanOption.label} plan pricing`,
      savings: Math.round(currentMonthly - expectedCost),
      reason: `Your stated spend of $${currentMonthly} exceeds the standard ${currentPlanOption.label} cost of $${expectedCost}. Check for add-ons, overages, or incorrect billing.`,
    };
  }

  // If they're paying significantly less, they might be getting a discount
  if (currentMonthly < expectedCost * 0.8 && expectedCost > 0) {
    return {
      action: `Your current ${currentPlanOption.label} plan appears discounted`,
      savings: 0,
      reason: `You're paying $${currentMonthly} which is below the standard $${expectedCost} for ${currentPlanOption.label}. This could indicate a valid discount or promotional pricing.`,
    };
  }

  return null; // Plan cost appears correct
}

function recommendSameVendorPlan(tool: ToolEntry, currentMonthly: number) {
  const definition = getToolDefinition(tool.id);
  const seats = Math.max(1, tool.seats);
  const currentLabel = getPlanOption(tool.id, tool.plan)?.label;

  // Check if current plan is appropriate for team size
  const planFit = assessPlanFit(tool);
  if (planFit) {
    return planFit;
  }

  // Look for cheaper plans that would still fit
  const candidate = definition.plans.reduce<{
    plan: PlanOption;
    savings: number;
    reason: string;
  } | null>((chosen, plan) => {
    if (plan.value === tool.plan) return chosen;
    const cost = plan.perSeat ? plan.monthly * seats : plan.monthly;
    if (cost >= currentMonthly || cost <= 0) return chosen;
    const delta = currentMonthly - cost;
    if (!chosen || delta > chosen.savings) {
      const costDescription = plan.perSeat ? `${cost} for ${seats} seat${seats === 1 ? '' : 's'}` : `${cost}`;
      const reason = `The ${plan.label} tier for ${definition.label} costs ${costDescription} versus your ${currentLabel}.`;
      return { plan, savings: delta, reason };
    }
    return chosen;
  }, null);

  if (!candidate) {
    return null;
  }

  return {
    action: `Switch to ${definition.vendor} ${candidate.plan.label}`,
    savings: Math.round(candidate.savings),
    reason: `${candidate.reason} That makes it a better price fit for a ${Math.max(1, tool.seats)}-person stack.`,
  };
}

function assessPlanFit(tool: ToolEntry) {
  const seats = Math.max(1, tool.seats);
  const currentPlanOption = getPlanOption(tool.id, tool.plan);
  if (!currentPlanOption) return null;

  const definition = getToolDefinition(tool.id);

  // For individual plans with multiple seats, suggest team plans
  if (!currentPlanOption.perSeat && seats > 1) {
    const teamPlan = definition.plans.find(p => p.perSeat && p.monthly * seats < currentPlanOption.monthly * seats);
    if (teamPlan) {
      const teamCost = teamPlan.monthly * seats;
      const individualCost = currentPlanOption.monthly * seats;
      const savings = individualCost - teamCost;
      if (savings > 5) {
        return {
          action: `Switch to ${definition.vendor} ${teamPlan.label} for teams`,
          savings: Math.round(savings),
          reason: `Individual plans cost $${individualCost} for ${seats} seats, but the ${teamPlan.label} plan costs $${teamCost}. Much more efficient for teams.`,
        };
      }
    }
  }

  // For team plans with 1 seat, suggest individual plans
  if (currentPlanOption.perSeat && seats === 1) {
    const individualPlan = definition.plans.find(p => !p.perSeat && p.monthly <= currentPlanOption.monthly);
    if (individualPlan) {
      const savings = currentPlanOption.monthly - individualPlan.monthly;
      if (savings > 0) {
        return {
          action: `Switch to ${definition.vendor} ${individualPlan.label}`,
          savings: Math.round(savings),
          reason: `For single users, the ${individualPlan.label} plan at $${individualPlan.monthly} is cheaper than the ${currentPlanOption.label} plan at $${currentPlanOption.monthly}.`,
        };
      }
    }
  }

  return null;
}

function recommendAlternativeTool(tool: ToolEntry, useCase: UseCase, currentMonthly: number) {
  const useCaseAlternatives: Record<UseCase, Array<{ id: ToolId; plan: string; note: string }>> = {
    coding: [
      { id: 'github', plan: 'business', note: 'GitHub Copilot is optimized for developer workflows.' },
      { id: 'openai', plan: 'api', note: 'OpenAI API is often a cheaper route for coding automation.' },
    ],
    writing: [
      { id: 'chatgpt', plan: 'plus', note: 'ChatGPT Plus can cover most writing needs at $20.' },
      { id: 'claude', plan: 'pro', note: 'Claude Pro is a good writing alternative with a lower retail cost.' },
    ],
    data: [
      { id: 'openai', plan: 'api', note: 'OpenAI API direct is usually the best fit for data and analysis workloads.' },
      { id: 'anthropic', plan: 'api', note: 'Anthropic API is a strong cheaper alternative for data tooling.' },
    ],
    research: [
      { id: 'chatgpt', plan: 'plus', note: 'ChatGPT Plus is often enough for research and synthesis.' },
      { id: 'claude', plan: 'pro', note: 'Claude Pro is a lighter research tier than team plans.' },
    ],
    mixed: [
      { id: 'chatgpt', plan: 'team', note: 'ChatGPT Team supports mixed workflows with a reliable price point.' },
      { id: 'openai', plan: 'api', note: 'OpenAI API delivers broad mixed-workload value.' },
    ],
  };

  const alternatives = useCaseAlternatives[useCase];
  const candidate = alternatives.reduce<{
    action: string;
    savings: number;
    reason: string;
  } | null>((best, alt) => {
    if (tool.id === alt.id) return best;
    const altMonthly = getPotentialMonthly(alt.id, alt.plan, Math.max(1, tool.seats));
    const estimated = altMonthly || Math.round(currentMonthly * 0.85);
    const savings = currentMonthly - estimated;
    if (savings <= 15) return best;
    if (!best || savings > best.savings) {
      return {
        action: `Consider ${getToolDefinition(alt.id).label} ${getPlanOption(alt.id, alt.plan)?.label}`,
        savings: Math.round(savings),
        reason: `${alt.note} It is estimated to be cheaper than your current spend of ${currentMonthly}.`,
      };
    }
    return best;
  }, null);

  return candidate;
}

function recommendCreditsOpportunity(tool: ToolEntry, currentMonthly: number) {
  const apiTools: ToolId[] = ['chatgpt', 'openai', 'anthropic', 'gemini', 'claude', 'windsurf'];
  if (!apiTools.includes(tool.id)) {
    return null;
  }

  if (tool.plan !== 'api' || currentMonthly < 100) {
    return null;
  }

  const savings = Math.round(currentMonthly * 0.12);
  return {
    action: 'Apply API credits or volume discounts',
    savings,
    reason: `Direct API spend is often eligible for partner credits or prepaid discounts. A conservative 12% credit would save about ${savings} per month.`,
  };
}

export function generateAudit(teamSize: number, useCase: UseCase, tools: ToolEntry[]): AuditResult {
  const items = tools.filter(tool => tool.enabled).map(tool => {
    const currentMonthly = Math.max(0, tool.monthlySpend);
    const rec = buildRecommendations(tool, useCase);
    const label = getToolDefinition(tool.id).label;
    return {
      toolId: tool.id,
      label,
      currentMonthly,
      currentPlan: getPlanOption(tool.id, tool.plan)?.label || tool.plan,
      recommendedAction: rec.recommendedAction,
      savings: rec.savings,
      reason: rec.reason,
    };
  });

  const currentMonthly = items.reduce((sum, item) => sum + item.currentMonthly, 0);
  const recommendedMonthly = items.reduce((sum, item) => sum + Math.max(0, item.currentMonthly - item.savings), 0);
  const monthlySavings = Math.max(0, currentMonthly - recommendedMonthly);
  const annualSavings = monthlySavings * 12;
  const topReason = items.sort((a, b) => b.savings - a.savings)[0]?.reason || 'Your stack is already aligned with your use case.';

  return {
    items,
    totals: {
      currentMonthly,
      recommendedMonthly,
      monthlySavings,
      annualSavings,
      highSavings: monthlySavings >= 500,
    },
    topReason,
  };
}
