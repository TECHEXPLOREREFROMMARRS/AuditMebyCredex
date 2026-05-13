import type { Metadata } from 'next';
import { DM_Serif_Display, DM_Mono, Instrument_Sans } from 'next/font/google';
import './globals.css';

/* ── Font loading via next/font (no <link> needed) ─────────
   next/font self-hosts fonts at build time:
   - zero layout shift (no FOUT)
   - no external network request at runtime
   - automatic preload injection into <head>
   - CSS variables wired to the names in globals.css
──────────────────────────────────────────────────────────── */
const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

/* ── Metadata ───────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default: 'Credex Audit',
    template: '%s · Credex Audit',
  },
  description:
    'Free AI spend audit: plan recommendations, savings, and shareable reports.',
  openGraph: {
    title: 'Credex Audit',
    description:
      'Free AI spend audit: plan recommendations, savings, and shareable reports.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Credex Audit',
    description:
      'Free AI spend audit: plan recommendations, savings, and shareable reports.',
  },
};

/* ── Root Layout ────────────────────────────────────────── */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSerifDisplay.variable} ${dmMono.variable} ${instrumentSans.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}