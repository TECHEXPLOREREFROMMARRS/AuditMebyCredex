import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

const rateLimitMap = new Map<string, { count: number; last: number }>();

async function sendConfirmationEmail(email: string, publicUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    return;
  }

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: 'Your Credex AI Spend Audit',
      html: `<p>Thanks for requesting the audit capture. Your shared audit is available at <a href="${publicUrl}">${publicUrl}</a>.</p><p>If your stack shows high savings, Credex may follow up with a consultation.</p>`,
    }),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { auditId, email, companyName, role, teamSize, website } = body as {
    auditId: string;
    email: string;
    companyName?: string;
    role?: string;
    teamSize?: number | null;
    website?: string;
  };

  if (website) {
    return NextResponse.json({ error: 'Spam detected' }, { status: 400 });
  }

  if (!auditId || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const address = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const ip = address.split(',')[0].trim();
  const now = Date.now();
  const existing = rateLimitMap.get(ip);
  if (existing && now - existing.last < 30_000) {
    existing.count += 1;
    existing.last = now;
    rateLimitMap.set(ip, existing);
    if (existing.count > 3) {
      return NextResponse.json({ error: 'Too many requests, try again later' }, { status: 429 });
    }
  } else {
    rateLimitMap.set(ip, { count: 1, last: now });
  }

  if (!isSupabaseConfigured()) {
    // Development mode: log lead data and return success
    console.log('Development mode: Lead captured:', {
      auditId,
      email,
      companyName,
      role,
      teamSize,
    });
    return NextResponse.json({ message: 'Lead captured (development mode)' });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin.from('audits').select('id, public_id').eq('public_id', auditId).single();
  if (!data) {
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
  }

  const { error } = await supabaseAdmin.from('leads').insert({
    audit_id: data.id,
    email,
    company_name: companyName || null,
    role: role || null,
    team_size: teamSize || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message || 'Unable to store lead' }, { status: 500 });
  }

  try {
    const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/audit/${auditId}`;
    await sendConfirmationEmail(email, publicUrl);
  } catch {
    // swallow email failures; storage is the priority
  }

  return NextResponse.json({ message: 'Audit details captured. Confirmation sent if email delivery is configured.' });
}
