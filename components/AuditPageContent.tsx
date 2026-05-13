'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import LeadForm from '@/components/LeadForm';

interface AuditPageProps {
  audit: {
    public_id: string;
    team_size: number;
    use_case: string;
    tools: Array<{
      toolId: string;
      label: string;
      currentMonthly: number;
      currentPlan: string;
      recommendedAction: string;
      savings: number;
      reason: string;
    }>;
    totals: {
      currentMonthly: number;
      monthlySavings: number;
      annualSavings: number;
      highSavings: boolean;
    };
    summary: string;
  };
}

export default function AuditPageContent({ audit: serverAudit }: AuditPageProps) {
  const [audit, setAudit] = useState(serverAudit);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Try to get audit from localStorage if it was just created
    const auditId = serverAudit.public_id;
    const cachedAudit = window.localStorage.getItem(`audit-${auditId}`);
    if (cachedAudit) {
      try {
        const parsed = JSON.parse(cachedAudit);
        setAudit(parsed);
        // Clean up after displaying
        window.localStorage.removeItem(`audit-${auditId}`);
      } catch {
        // If parsing fails, use server version
      }
    }
  }, [serverAudit.public_id]);

  if (!mounted) {
    return null;
  }

  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/audit/${audit.public_id}`;
  const headline =
    audit.totals.monthlySavings >= 100 ? 'Your AI spend audit is ready' : 'Your audit looks efficient';

  return (
    <>
      <section className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-glow shadow-slate-200/40">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Audit report</p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">{headline}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">{audit.summary}</p>
          </div>
          <div className="rounded-3xl bg-slate-950 p-6 text-slate-100 shadow-xl shadow-slate-900/10">
            <div className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Total monthly savings</p>
                <p className="mt-2 text-4xl font-semibold text-white">{formatCurrency(audit.totals.monthlySavings)}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Total annual savings</p>
                <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(audit.totals.annualSavings)}</p>
              </div>
              <div className="rounded-3xl bg-slate-900/95 p-4 text-xs uppercase tracking-[0.25em] text-slate-400">
                Shareable public URL
                <div className="mt-2 break-all text-slate-100">{publicUrl}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Per-tool audit</h2>
                <p className="mt-1 text-sm text-slate-600">Plan breakdown, recommendations, and reasoned savings.</p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                {audit.tools.length} tool{audit.tools.length !== 1 ? 's' : ''} analyzed
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {audit.tools.length === 0 ? (
                <p className="text-sm text-slate-500">No tools selected in this audit.</p>
              ) : (
                audit.tools.map(item => (
                  <div key={item.toolId} className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-slate-900">{item.label}</p>
                        <p className="text-sm text-slate-600">Current plan: {item.currentPlan}</p>
                      </div>
                      <div className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
                        {formatCurrency(item.currentMonthly)}/mo
                      </div>
                    </div>
                    <div className="mt-4 text-sm leading-6 text-slate-700">
                      <p className="font-semibold text-slate-900">Recommendation</p>
                      <p className="mt-2">{item.recommendedAction}</p>
                      <p className="mt-3 text-sm text-slate-600">{item.reason}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Why this is defensible</h2>
            <p className="mt-4 text-sm leading-7 text-slate-700">
              The audit compares your stated spend against current vendor plan pricing and seat fit, then recommends
              cheaper same-vendor options or lower-cost alternatives for your use case. API spend also receives a
              credits review, which is a real, documented savings channel.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Next step</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              {audit.totals.highSavings
                ? 'Your stack shows strong optimization potential. Capture your audit and Credex can help you realize the full savings.'
                : 'Your audit is already efficient. Submit your email to get notified when new optimizations are identified.'}
            </p>
            <div className="mt-6">
              <LeadForm auditId={audit.public_id} highSavings={audit.totals.highSavings} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-6 text-sm leading-7 text-slate-700 shadow-sm">
            <p className="font-semibold text-slate-900">Public audit details</p>
            <p className="mt-3">
              This public version removes identifying fields like company name or email. It keeps the tool list,
              spending totals, and audit reasoning so teams can share the result without leaking internal data.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
