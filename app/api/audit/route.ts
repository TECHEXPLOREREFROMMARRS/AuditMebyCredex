import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { generateAnthropicSummary } from '@/lib/anthropic';
import { generateAudit } from '@/lib/pricing';
import { formatCurrency } from '@/lib/utils';

export async function POST(request: Request) {
  const body = await request.json();
  const { teamSize, useCase, tools } = body as {
    teamSize: number;
    useCase: string;
    tools: Array<{ id: string; enabled: boolean; plan: string; seats: number; monthlySpend: number }>;
  };

  if (!teamSize || !useCase || !Array.isArray(tools)) {
    return NextResponse.json({ error: 'Invalid audit payload' }, { status: 400 });
  }

  const sanitizedTools = tools.map(tool => ({
    ...tool,
    seats: Math.max(1, Number(tool.seats) || 1),
    monthlySpend: Math.max(0, Number(tool.monthlySpend) || 0),
  }));

  const audit = generateAudit(teamSize, useCase as any, sanitizedTools as any);

  let summary = '';
  try {
    summary = await generateAnthropicSummary({
      teamSize,
      useCase,
      items: audit.items.map(item => ({
        tool: item.label,
        currentMonthly: item.currentMonthly,
        reason: item.reason,
      })),
      totals: {
        monthlySavings: audit.totals.monthlySavings,
        annualSavings: audit.totals.annualSavings,
      },
    });
  } catch (error) {
    summary = `Your audit shows a potential savings of ${formatCurrency(audit.totals.monthlySavings)} per month (${formatCurrency(
      audit.totals.annualSavings,
    )} per year). ${audit.topReason}`;
  }

  const publicId = crypto.randomUUID();

  if (!isSupabaseConfigured()) {
    // Development mode: return a mock audit ID with full audit data
    const mockId = `dev-${publicId}`;
    console.log('Development mode: Mock audit created with ID:', mockId);
    console.log('Audit data:', { teamSize, useCase, tools: audit.items, totals: audit.totals, summary });
    return NextResponse.json({
      id: mockId,
      audit: {
        public_id: mockId,
        team_size: teamSize,
        use_case: useCase,
        tools: audit.items,
        totals: audit.totals,
        summary,
        created_at: new Date().toISOString(),
      },
    });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin.from('audits').insert({
    public_id: publicId,
    team_size: teamSize,
    use_case: useCase,
    tools: audit.items,
    totals: audit.totals,
    summary,
    source: 'web',
  });

  if (error) {
    return NextResponse.json({ error: error.message || 'Unable to store audit' }, { status: 500 });
  }

  return NextResponse.json({ id: publicId });
}
