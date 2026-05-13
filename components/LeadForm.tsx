'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface LeadFormProps {
  auditId: string;
  highSavings: boolean;
}

export default function LeadForm({ auditId, highSavings }: LeadFormProps) {
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('pending');
    setMessage('');

    const response = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auditId,
        email,
        companyName,
        role,
        teamSize: teamSize ? Number(teamSize) : null,
        website: '',
      }),
    });

    const data = await response.json();
    if (response.ok) {
      setStatus('success');
      setMessage(data.message || 'Thanks! We will follow up soon.');
    } else {
      setStatus('error');
      setMessage(data.error || 'Something went wrong.');
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-900">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-900">
            Company name
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-900">
            Role
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-900">
            Team size
            <input
              type="number"
              min={1}
              value={teamSize}
              onChange={e => setTeamSize(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
        </div>

        <input type="hidden" name="website" value="" />

        <button
          type="submit"
          disabled={status === 'pending'}
          className={cn(
            'inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition',
            highSavings ? 'bg-brand-700 hover:bg-brand-800' : 'bg-slate-700 hover:bg-slate-800',
          )}
        >
          {highSavings ? 'Capture my audit and schedule follow-up' : 'Notify me when more optimizations appear'}
        </button>
      </form>
      {message ? (
        <p className={cn('text-sm', status === 'success' ? 'text-emerald-700' : 'text-red-600')}>{message}</p>
      ) : null}
      <p className="text-xs text-slate-500">We only ask for email after delivering value. No login is required.</p>
    </div>
  );
}
