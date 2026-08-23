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

- **Auth** — email/password sign up & login (`auth.html`), Supabase Auth,
  plus forgot/reset password (`forgot-password.html`, `reset-password.html`).
- **Legal** — `terms.html` and `privacy.html`, linked from the landing page
  footer and required (checkbox) at sign-up.
- **Onboarding** (`onboarding.html`) — profile creation: display name, DOB
  (18+ enforced both client- and DB-side), gender & who you're interested in,
  county/town, bio, avatar upload, and interest selection.
- **Edit profile** (`edit-profile.html`) — update any of the above after
  onboarding, linked from `profile.html`.
- **Discover** (`discover.html`) — candidate profiles filtered by mutual
  gender preference, ranked by number of shared interests, with filters for
  county, age range, minimum rating, and required shared interests. Like/Pass,
  with a mutual-like auto-creating a match (DB trigger).
- **Who liked you** (`likes-you.html`) — Silver+ feature; Free users see a
  blurred teaser with an upgrade prompt.
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
- **Moderation & admin dashboard** (`admin.html`) — visible only to accounts
  with `profiles.is_admin = true` (currently `mwombe007@gmail.com`). Five
  sections, all backed by `SECURITY DEFINER` RPCs (no broad RLS bypass):
  - **Overview** — user/tier counts, 7-day growth & activity, matches,
    messages, swipes, pending reports, with Chart.js breakdowns.
  - **Users** — searchable, filterable (all/premium/free/banned/admin),
    paginated table. Ban/unban, and **manually grant a subscription tier**
    (bridges the gap until Paystack/M-Pesa are live).
  - **Revenue** — current MRR, active/pending subscriptions, live-session
    tips, revenue-by-tier chart.
  - **Email Center** — template picker (welcome, upgrade nudge, safety
    reminder, custom) with `{{name}}` merge, sends to a segment (all/premium/
    free) via a Brevo-backed edge function (`send-admin-email`), logs every
    send to `email_log`.
  - **Audit Log** — every ban/unban, report status change, subscription
    grant, and email send, with who/what/when (`audit_log` table, populated
    automatically by the RPCs above).
  To add another admin: `update public.profiles set is_admin = true where id
  = '<user-id>';`
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
2. **Paystack** — planned as an alternative/additional payment provider.
   `user_subscriptions.payment_provider` already supports either value.
3. **Live video calls & public live sessions** (Gold/Diamond perk) — the
   database has scaffolding (`live_sessions`, `live_session_tips`) but actual
   video needs a WebRTC provider (e.g. Agora, Daily.co, or Twilio Video).
   Wire the provider's SDK into a new `live.html` once you've picked one.
4. **Google AdSense** — once the site is live on a real domain, apply for
   AdSense, then drop your `ca-pub-XXXXXXXXXXXX` script tag into the `<head>`
   of `index.html` (and any other pages you want ads on).
5. **Email templates** — Supabase's default confirmation/reset emails are
   plain. Customize them under Auth → Email Templates in the dashboard.
   Separately, the admin Email Center needs its own secrets before it can
   actually send: `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, and optionally
   `BREVO_SENDER_NAME` (get a key from [Brevo](https://www.brevo.com)).
   Until set, it responds with a clear "not configured" error.
6. **Content moderation on uploads** — nothing currently screens photos
   before they hit storage; worth adding before wide public launch.

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
