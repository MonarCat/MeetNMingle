// Shared Supabase client for MeetNMingle
// Project: MeetNMingle (eu-west-1)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const SUPABASE_URL = 'https://wstbqyvamueahmmvgqjl.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzdGJxeXZhbXVlYWhtbXZncWpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MjU0ODEsImV4cCI6MjEwMzAwMTQ4MX0.x6E9HR8OrEemgDN9oXZhVEgE6uROLRuDFWRyz8EhHOA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Kenyan counties for the county picker
export const KENYAN_COUNTIES = [
  'Nairobi','Mombasa','Kwale','Kilifi','Tana River','Lamu','Taita-Taveta','Garissa','Wajir','Mandera',
  'Marsabit','Isiolo','Meru','Tharaka-Nithi','Embu','Kitui','Machakos','Makueni','Nyandarua','Nyeri',
  'Kirinyaga','Murang\'a','Kiambu','Turkana','West Pokot','Samburu','Trans Nzoia','Uasin Gishu','Elgeyo-Marakwet',
  'Nandi','Baringo','Laikipia','Nakuru','Narok','Kajiado','Kericho','Bomet','Kakamega','Vihiga','Bungoma',
  'Busia','Siaya','Kisumu','Homa Bay','Migori','Kisii','Nyamira',
];

// Guard: redirect to /auth.html if there is no active session. Returns the session.
export async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = '/auth.html';
    return null;
  }
  return session;
}

// Guard: if profile onboarding isn't complete, send the user to finish it.
// If the account is banned, show a clear message instead of bouncing into onboarding.
export async function requireProfile(session) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();
  if (error) console.error(error);
  if (!data) {
    window.location.href = '/onboarding.html';
    return null;
  }
  if (data.is_banned) {
    document.body.innerHTML = `<div style="max-width:420px; margin:15vh auto; text-align:center; padding:24px; font-family:sans-serif; color:#4A2438;">
      <h2 style="font-family:'Fraunces',serif;">Account suspended</h2>
      <p style="color:#8C6B78;">${data.ban_reason ? data.ban_reason : 'Your account was suspended for violating MeetNMingle\'s Terms of Service.'}</p>
      <p style="color:#8C6B78; font-size:0.85rem;">Contact support via afams.co.ke if you believe this is a mistake.</p>
    </div>`;
    return null;
  }
  return data;
}

export function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function calcAge(dob) {
  const d = new Date(dob);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}
