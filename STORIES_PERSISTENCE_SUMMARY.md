# Story Persistence Implementation Summary

## Summary

Adds Supabase persistence: POST /api/stories/save, GET /api/stories.
Adds Save button in StoryOutput and /stories history list.

## Motivation

Next milestone after ADR-008/009/023 (API contract done). This gives basic, per-device history without auth.

## Implementation Notes

- Supabase service role used server-side only (node runtime routes).
- HttpOnly cookie `deviceId` buckets history per browser.
- Upsert by (deviceId, articleHash). No ratings/auth yet.

## Manual Test Evidence

```bash
curl -i -X POST http://localhost:3000/api/stories/save \
  -H "Content-Type: application/json" \
  -d '{"articleHash":"sha256-abc","readingLevel":"early-elementary","story":"Once upon a time…"}'
```

## Files Added

- `lib/db.ts` - Supabase client helper
- `lib/device.ts` - Device ID management
- `app/api/stories/save/route.ts` - Save story endpoint
- `app/api/stories/route.ts` - List stories endpoint
- `app/(app)/stories/page.tsx` - Stories history page
- `sql/2025-01-16-stories.sql` - Database migration

## Files Modified

- `lib/env.ts` - Added Supabase environment variables
- `components/patterns/StoryOutput.tsx` - Added Save button functionality
- `docs/DECISIONS.md` - Added ADR-025 and updated status
- `docs/LLM_CONTEXT.md` - Added API contracts and environment variables

## Environment Variables Required

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE=your-service-role-key
```

## Database Migration

Run the SQL migration in `sql/2025-01-16-stories.sql` on your Supabase instance to create the stories table with proper indexes and RLS policies.

## Deployment Setup

- **Supabase Project**: Created with Vercel integration for automatic environment variable configuration
- **Database Schema**: Stories table created with proper RLS policies and indexes
- **Vercel Integration**: Environment variables automatically configured via Supabase dashboard
- **Production Status**: ✅ All deployments successful with full story persistence functionality
