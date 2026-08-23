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
  onboarding, linked from `profile.html`. Includes a **photo/video gallery
  manager**: Free accounts get 3 photos, Premium gets 20 photos + 3 short
  (≤30s) highlight videos. The limit is enforced server-side by a
  `BEFORE INSERT` trigger on `profile_media` — not just the UI — so it can't
  be bypassed by calling the API directly. Gallery photos/videos also show
  up as a tap-through carousel on Discover cards, with a dot indicator.
- **Discover** (`discover.html`) — candidate profiles filtered by mutual
  gender preference, ranked by number of shared interests, with filters for
  gender, county, age range, minimum rating, and required shared interests.
  Like/Pass, with a mutual-like auto-creating a match (DB trigger).
- **Who liked you** (`likes-you.html`) — Premium feature; Free users see a
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
- **Live video sessions** (`live.html`) — anyone can host or watch via
  **Agora RTC**. Free accounts get **5 minutes/day** (host or watch, tracked
  together) via `daily_feature_usage` + the `consume_live_seconds()` /
  `get_live_seconds_remaining()` RPCs — the client polls every 15s and force-
  ends the session when the day's quota runs out. Premium and admin accounts
  are unlimited. Token issuance is server-side only (`agora-token` edge
  function): the client never sees your App Certificate, and host-vs-
  audience role is derived from `live_sessions.host_id` on the server, never
  trusted from the client. Tipping UI exists but is disabled ("coming soon")
  until a payment provider is live — see below.
- **Subscriptions** (`pricing.html`) — two tiers only: **Free** and
  **Premium** (KES 799/month or KES 7,990/year, picked via a toggle on the
  pricing page). Paid via **M-Pesa STK Push** through two Supabase Edge
  Functions (`mpesa-stkpush`, `mpesa-callback`). Photo sharing in chat,
  who-liked-you, unlimited live video, and the profile media gallery cap are
  all gated on `subscription_tier <> 'free'`. Currently shown as "coming
  soon" in the UI (`PAYMENTS_ENABLED = false` in `pricing.html`) pending the
  Paystack multi-business/webhook question below.

## Not yet wired up (needs your own accounts/keys)

1. **M-Pesa (Daraja API)** — the edge functions are deployed and will respond
   with a clear "not configured" error until you set these Supabase project
   secrets (Project Settings → Edge Functions → Secrets, or `supabase
   secrets set`):
   - `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_PASSKEY`,
     `MPESA_SHORTCODE`, `MPESA_ENV` (`sandbox` or `production`)
   - `MPESA_CALLBACK_URL` = `https://wstbqyvamueahmmvgqjl.supabase.co/functions/v1/mpesa-callback`
   Get these from the [Safaricom Daraja portal](https://developer.safaricom.co.ke/).
2. **Paystack** — decision pending on a multi-site question (Mikaju Software
   Solutions runs this alongside Salary Calculator and Mikaju Payroll — see
   "Paystack multi-site notes" below). `user_subscriptions.payment_provider`
   already supports either provider.
3. **Live video** — mostly done. `live.html` is built on **Agora RTC**
   (App ID `e1e84395fdd34a508bd8ad6c641bebe9`), with server-side token
   issuance via the `agora-token` edge function. It responds "not
   configured" until you set:
   - `AGORA_APP_ID`, `AGORA_APP_CERTIFICATE` (Supabase project secrets)
   Tipping (`live_session_tips`) is schema-ready but the UI button is
   disabled until a payment provider is live.
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

## Paystack multi-site notes

Running MeetNMingle, Salary Calculator, and Mikaju Payroll under one
Paystack login is normal and supported:

- Use Paystack's **"Add a Business"** feature (dropdown next to your
  business name) to create a separate business per product, reusing the
  same registration documents. Each gets its own API keys, its own
  transaction ledger, and its own **Plans** (MeetNMingle's Premium
  Monthly/Yearly won't collide with Salary Calculator's own plans).
- **Unconfirmed:** whether each added business also gets its own webhook
  URL, or whether webhooks stay account-wide regardless of how many
  businesses exist. Paystack's docs are only clear that *one business = one
  webhook URL* — ask Paystack support directly before building the
  MeetNMingle payment integration, since the answer changes the
  architecture (dedicated webhook vs. a shared router function that
  dispatches by a reference prefix, e.g. `MNM-xxxx` vs `SC-xxxx`).
- **Worth disclosing to Paystack upfront:** dating platforms are generally
  treated as higher-risk (more KYC, not necessarily rejection), and the
  Premium-tier live-session tipping feature resembles a "creator tipping"
  model, which is its own scrutinized category elsewhere. Better to mention
  both when registering the business than to find out after building on
  top of it.

## Database

All schema, RLS policies, triggers, and storage buckets are already applied
directly to the linked Supabase project — see the Supabase dashboard's
migration history for the exact SQL. Tables: `profiles`, `interests`,
`profile_interests`, `profile_media`, `swipes`, `matches`, `ratings`,
`reports`, `blocked_users`, `conversations`, `messages`,
`subscription_plans`, `user_subscriptions`, `live_sessions`,
`live_session_tips`, `daily_feature_usage`, `audit_log`, `email_log`.

Row Level Security is enabled on every table — users can only read/write
what they're supposed to (their own data, their matches' conversations,
etc.).

## Running locally

No build step needed. Serve the folder with any static server, e.g.:

```
npx serve .
```

Then open `index.html`.
