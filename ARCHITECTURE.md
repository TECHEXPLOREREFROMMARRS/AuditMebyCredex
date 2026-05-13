# Architecture

## Framework choice
This app uses **Next.js** with the App Router because:
- It combines a React frontend with server-side API routes in a single codebase.
- It supports dynamic metadata for Open Graph previews.
- It is widely accepted for modern web products and fits the requirement for React/Next.js.

## Language
The app is built with **TypeScript** for stronger correctness, safer data shaping, and easier maintenance.

## Styling
Tailwind CSS provides the UI foundation without using page builders or pre-built dashboard templates.

## Backend
The project uses **Supabase** for storage and lead capture. Supabase is a real backend with a Postgres database and simple authentication option.

## AI summary
The audit engine uses a hardcoded rule-based model for spend evaluation and then calls the **Anthropic** API for the personalized summary. This keeps the audit math defensible while still satisfying the AI requirement.
