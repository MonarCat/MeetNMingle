# MeetNMingle

MeetNMingle is a free dating platform built for Kenya — find matches by real
shared interests, anywhere from Nairobi to Kisumu to Mombasa, with safety and
accountability built in from day one.

## Stack

- Plain HTML/CSS/JS (no build step) — served as static files from any host
  (GitHub Pages, Netlify, Vercel, or a plain web server).
- [Supabase](https://supabase.com) for auth, Postgres database, storage, and
  Edge Functions. Project: `MeetNMingle` (`wstbqyvamueahmmvgqjl`, `eu-west-1`).

## Features implemented

- **Auth** — email/password sign up & login (`auth.html`), Supabase Auth.
- **Onboarding** (`onboarding.html`) — profile creation: display name, DOB
  (18+ enforced both client- and DB-side), gender & who you're interested in,
  county/town, bio, avatar upload, and interest selection.
- **Discover** (`discover.html`) — candidate profiles filtered by mutual
  gender preference, ranked by number of shared interests. Like/Pass, with a
  mutual-like auto-creating a match (DB trigger).
- **Matches & chat** (`matches.html`, `chat.html`) — real-time messaging
  (Supabase Realtime), photo sharing with:
  - **View once** — media is deleted from storage the instant the recipient
    opens it (`consume_view_once_message` RPC, enforced server-side).
  - **Allow saving** toggle — when off, the client disables right-click/drag
    on the image. (Note: this cannot block OS-level screenshots — no client
    can guarantee that. The messaging in the UI reflects this honestly.)
- **Ratings** — 5-star behaviour/interaction ratings between matched users,
  averaged onto each profile (`profile.html`, trigger-maintained aggregates).
- **Safety** — report fraud/scam/harassment/etc. profiles, and block users,
  both from the Discover card menu.
- **Subscriptions** (`pricing.html`) — Silver (KES 199), Gold (KES 299),
  Diamond (KES 399) tiers, paid via **M-Pesa STK Push** through two Supabase
  Edge Functions (`mpesa-stkpush`, `mpesa-callback`). Photo sharing in chat is
  gated to Silver+.

## Not yet wired up (needs your own accounts/keys)

1. **M-Pesa (Daraja API)** — the edge functions are deployed and will respond
   with a clear "not configured" error until you set these Supabase project
   secrets (Project Settings → Edge Functions → Secrets, or `supabase
   secrets set`):
   - `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_PASSKEY`,
     `MPESA_SHORTCODE`, `MPESA_ENV` (`sandbox` or `production`)
   - `MPESA_CALLBACK_URL` = `https://wstbqyvamueahmmvgqjl.supabase.co/functions/v1/mpesa-callback`
   Get these from the [Safaricom Daraja portal](https://developer.safaricom.co.ke/).
2. **Live video calls & public live sessions** (Gold/Diamond perk) — the
   database has scaffolding (`live_sessions`, `live_session_tips`) but actual
   video needs a WebRTC provider (e.g. Agora, Daily.co, or Twilio Video).
   Wire the provider's SDK into a new `live.html` once you've picked one.
3. **Google AdSense** — once the site is live on a real domain, apply for
   AdSense, then drop your `ca-pub-XXXXXXXXXXXX` script tag into the `<head>`
   of `index.html` (and any other pages you want ads on).

## Database

All schema, RLS policies, triggers, and storage buckets are already applied
directly to the linked Supabase project — see the Supabase dashboard's
migration history for the exact SQL. Tables: `profiles`, `interests`,
`profile_interests`, `swipes`, `matches`, `ratings`, `reports`,
`blocked_users`, `conversations`, `messages`, `subscription_plans`,
`user_subscriptions`, `live_sessions`, `live_session_tips`.

Row Level Security is enabled on every table — users can only read/write
what they're supposed to (their own data, their matches' conversations,
etc.).

## Running locally

No build step needed. Serve the folder with any static server, e.g.:

```
npx serve .
```

Then open `index.html`.
