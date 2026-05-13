'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatCurrency, cn } from '@/lib/utils';
import {
  DEFAULT_TOOL_STATE,
  TOOL_DEFINITIONS,
  USE_CASES,
  type ToolEntry,
  type UseCase,
} from '@/lib/pricing';

const STORAGE_KEY = 'credx-audit-form';

type FormState = {
  teamSize: number;
  useCase: UseCase;
  tools: ToolEntry[];
};

export default function HomePage() {
  const [teamSize, setTeamSize] = useState(3);
  const [useCase, setUseCase] = useState<UseCase>('coding');
  const [tools, setTools] = useState<ToolEntry[]>(DEFAULT_TOOL_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as FormState;
        setTeamSize(parsed.teamSize ?? 3);
        setUseCase(parsed.useCase ?? 'coding');
        setTools(parsed.tools ?? DEFAULT_TOOL_STATE);
      } catch {
        setTools(DEFAULT_TOOL_STATE);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ teamSize, useCase, tools }));
  }, [teamSize, useCase, tools]);

  const enabledToolCount = useMemo(() => tools.filter(tool => tool.enabled).length, [tools]);

  const handleToolChange = (toolId: string, field: keyof Omit<ToolEntry, 'id'>, value: string | number | boolean) => {
    setTools(prev =>
      prev.map(tool =>
        tool.id === toolId
          ? {
              ...tool,
              [field]: value,
            }
          : tool,
      ),
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const payload: FormState = { teamSize, useCase, tools };

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data?.id) {
        setError(data?.error || 'Unable to create audit.');
        setSubmitting(false);
        return;
      }
      // Store the full audit data in localStorage for immediate display
      if (data.audit) {
        window.localStorage.setItem(`audit-${data.id}`, JSON.stringify(data.audit));
      }
      window.location.assign(`/audit/${data.id}`);
    } catch (err) {
      setError('Network error submitting the audit.');
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-glow shadow-slate-200/40">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Credex Audit</p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              AI spend audit for teams that want real savings.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              Tell us the tools you pay for, your plan, current monthly spend, seats, team size, and use case. Get an instant audit, a shareable report, and a lead capture flow after value is shown.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-950 p-6 text-slate-50 shadow-xl shadow-slate-900/10">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">MVP coverage</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <li>Spend form with 8 supported tools</li>
              <li>Audit logic by plan fit, cheaper alternatives, and credits</li>
              <li>Shareable public report URLs</li>
              <li>AI summary using Anthropic with fallback</li>
              <li>Lead capture and backend storage</li>
            </ul>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-900">
              Team size
              <input
                type="number"
                min={1}
                value={teamSize}
                onChange={e => setTeamSize(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-900">
              Primary use case
              <select
                value={useCase}
                onChange={e => setUseCase(e.target.value as UseCase)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              >
                {USE_CASES.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">AI tools & spend</h2>
              <p className="mt-1 text-sm text-slate-600">Enable the tools you use, choose the plan, and enter the current monthly spend.</p>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-800">
              {enabledToolCount} selected
            </div>
          </div>

          <div className="space-y-6">
            {TOOL_DEFINITIONS.map(tool => {
              const state = tools.find(item => item.id === tool.id)!;
              return (
                <div key={tool.id} className="rounded-3xl border border-slate-200/80 p-5 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={state.enabled}
                        onChange={e => handleToolChange(tool.id, 'enabled', e.target.checked)}
                        className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                      />
                      <div>
                        <p className="text-base font-semibold text-slate-900">{tool.label}</p>
                        <p className="text-sm text-slate-500">{tool.help}</p>
                      </div>
                    </label>
                    <div className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      {tool.vendor}
                    </div>
                  </div>

                  <div className={cn('mt-5 grid gap-4 sm:grid-cols-3', !state.enabled && 'opacity-60')}>
                    <label className="space-y-2 text-sm font-medium text-slate-900">
                      Plan
                      <select
                        value={state.plan}
                        onChange={e => handleToolChange(tool.id, 'plan', e.target.value)}
                        disabled={!state.enabled}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 disabled:bg-slate-100"
                      >
                        {tool.plans.map(plan => (
                          <option key={plan.value} value={plan.value}>
                            {plan.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2 text-sm font-medium text-slate-900">
                      Seats
                      <input
                        type="number"
                        min={1}
                        value={state.seats}
                        onChange={e => handleToolChange(tool.id, 'seats', Number(e.target.value))}
                        disabled={!state.enabled}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 disabled:bg-slate-100"
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-slate-900">
                      Current monthly spend
                      <input
                        type="number"
                        min={0}
                        step={5}
                        value={state.monthlySpend}
                        onChange={e => handleToolChange(tool.id, 'monthlySpend', Number(e.target.value))}
                        disabled={!state.enabled}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 disabled:bg-slate-100"
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-slate-600">Form state persists in your browser so you can tweak inputs and reload without losing progress.</p>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </div>
          <button
            type="submit"
            disabled={submitting || enabledToolCount === 0}
            className="inline-flex items-center justify-center rounded-2xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting ? 'Generating audit…' : 'Run my audit'}
          </button>
        </div>
      </form>

      <section className="mt-10 rounded-3xl border border-slate-200/80 bg-slate-50 p-6 text-slate-700 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">How the audit works</h2>
        <div className="mt-4 space-y-3 text-sm leading-7">
          <p>We use current retail pricing data and your current spend to determine whether you are on the right tier, whether a cheaper plan fits, and whether API credit programs may lower cost.</p>
          <p>The public report link strips identifying details and is optimized for sharing on social media.</p>
        </div>
      </section>
    </main>
  );
}
