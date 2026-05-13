import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import AuditPageContent from '@/components/AuditPageContent';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function getAudit(publicId: string) {
  // In development mode, check if the audit data is stored in localStorage
  // (This is accessed from the client, so we can't directly access it here)
  // Instead, we'll rely on the mock fallback for dev mode
  
  if (!isSupabaseConfigured()) {
    // Development mode: return mock data for dev- prefixed IDs
    if (publicId.startsWith('dev-')) {
      // Return a generic empty/default audit
      return {
        public_id: publicId,
        team_size: 1,
        use_case: 'coding',
        tools: [],
        totals: {
          currentMonthly: 0,
          monthlySavings: 0,
          annualSavings: 0,
          highSavings: false,
        },
        summary: 'Your audit is being prepared. If you see this, please refresh the page.',
        created_at: new Date().toISOString(),
      };
    }
    return null;
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from('audits')
    .select('*')
    .eq('public_id', publicId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as {
    public_id: string;
    team_size: number;
    use_case: string;
    tools: Array<{ toolId: string; label: string; currentMonthly: number; currentPlan: string; recommendedAction: string; savings: number; reason: string }>;
    totals: { currentMonthly: number; monthlySavings: number; annualSavings: number; highSavings: boolean };
    summary: string;
    created_at: string;
  };
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const audit = await getAudit(params.id);
  if (!audit) {
    return {
      title: 'Audit not found',
      description: 'No audit was found for this link.',
    };
  }

  const title = `AI spend audit — save ${formatCurrency(audit.totals.monthlySavings)} / mo`;
  const description = `${audit.summary.slice(0, 120)}...`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/audit/${audit.public_id}`,
      type: 'website',
      siteName: 'Credex Audit',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function AuditPage({ params }: { params: { id: string } }) {
  const audit = await getAudit(params.id);
  if (!audit) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <AuditPageContent audit={audit} />
    </main>
  );
}
