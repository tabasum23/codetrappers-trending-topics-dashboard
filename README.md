# CodeTrappers Trending Topics Dashboard

## Included
- React dashboard with category filters, search, status tabs, source links, shortlist/reject/finalize actions.
- Supabase schema with RLS.
- Supabase Edge Function that reads RSS feeds from OpenAI, GitHub, Google Developers, React, Flutter and Android Developers.
- Demo mode until Supabase is configured.

## Setup
1. Create a Supabase project: https://supabase.com
2. Copy `.env.example` to `.env` and add the project URL and anon/public key from Project Settings → API.
3. Run `supabase/schema.sql` in Supabase SQL Editor.
4. Install dependencies and start: `npm install` then `npm run dev`.
5. Install Supabase CLI, run `supabase login`, `supabase link --project-ref YOUR_PROJECT_REF`, then `supabase functions deploy collect-trending-topics`.
6. Edge Function uses Supabase `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` server-side automatically. Never place service role key in frontend `.env`.
7. Configure Supabase Cron (pg_cron + pg_net) to invoke the function daily. Example schedule: `0 3 * * *` (03:00 UTC = 08:30 India). Store the function auth token in Supabase Vault, not in source control.

## Security / production notes
- RLS is enabled; current policies allow authenticated users to read and update topics. Add your team's Supabase Auth sign-in/invite flow before production.
- The dashboard currently has no login screen. Until auth is added, queries may be blocked by RLS; add auth before team rollout.
- The relevance score is a keyword-based heuristic, not a measured search-volume trend score.
- RSS feeds can change or fail; check Edge Function logs and adjust feed URLs.
- This phase only discovers and finalizes topics. Blog writing, image creation and WordPress publishing are out of scope.
