<<<<<<< HEAD
# AuditMebyCredex
=======
# Credex Audit

A lightweight Next.js audit app for AI tool spend, savings, and shareable reports.

## What it does
- Collects AI tools, current plans, spend, seats, team size, and primary use case
- Shows per-tool audit results with defensible recommendations
- Generates a personalized AI summary using Anthropic
- Stores audit leads in Supabase and sends transactional email via Resend
- Publishes shareable audit URLs with Open Graph metadata

## Setup
1. Copy `.env.example` to `.env.local`.
2. Add your Supabase project URL and service role key.
3. Optionally add `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.
4. Install packages:
   ```bash
   npm install
   ```
5. Run locally:
   ```bash
   npm run dev
   ```

## Required Supabase tables
Create tables using SQL:

```sql
create table audits (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null,
  created_at timestamp with time zone default now(),
  team_size int not null,
  use_case text not null,
  tools jsonb not null,
  totals jsonb not null,
  summary text not null,
  source text default 'web'
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid references audits(id) on delete cascade,
  email text not null,
  company_name text,
  role text,
  team_size int,
  created_at timestamp with time zone default now()
);
```

## Notes
- Form state is persisted in local storage.
- The app uses server-side audit calculations and a server-side Anthropic summary call.
- Public audit pages strip identifying details.
>>>>>>> 45a389e (feat: initial Credex project setup)
