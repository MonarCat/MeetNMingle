export function renderTabbar(active) {
  const items = [
    { key: 'discover', href: 'discover.html', label: 'Discover', icon: '🔥' },
    { key: 'matches', href: 'matches.html', label: 'Matches', icon: '💬' },
    { key: 'live', href: 'live.html', label: 'Live', icon: '📡' },
    { key: 'pricing', href: 'pricing.html', label: 'Premium', icon: '⭐' },
    { key: 'profile', href: 'profile.html', label: 'Profile', icon: '👤' },
  ];
  const el = document.createElement('div');
  el.className = 'tabbar';
  el.innerHTML = items.map(i => `
    <a href="${i.href}" class="${i.key === active ? 'active' : ''}" style="position:relative;">
      <span style="font-size:19px;">${i.icon}</span>
      <span>${i.label}</span>
      ${i.key === 'matches' ? '<span id="unreadBadge" class="unread-badge" style="display:none;"></span>' : ''}
    </a>
  `).join('');
  document.body.appendChild(el);

  if (!document.getElementById('unread-badge-style')) {
    const style = document.createElement('style');
    style.id = 'unread-badge-style';
    style.textContent = `
      .unread-badge {
        position: absolute; top: 2px; right: 18%;
        min-width: 16px; height: 16px; padding: 0 4px;
        border-radius: 999px; background: var(--coral, #FF6F91);
        color: #fff; font-size: 0.62rem; font-weight: 800;
        display: flex; align-items: center; justify-content: center;
        line-height: 1;
      }
    `;
    document.head.appendChild(style);
  }

  initUnreadTracking();
}

// Plays a short two-tone chime for an incoming message, entirely via
// Web Audio -- no audio asset needed.
function playMessageChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    [660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + i * 0.11);
      gain.gain.linearRampToValueAtTime(0.16, now + i * 0.11 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.11 + 0.22);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.11);
      osc.stop(now + i * 0.11 + 0.24);
    });
    setTimeout(() => ctx.close(), 600);
  } catch (e) { /* audio not available -- ignore */ }
}

function setUnreadBadge(count) {
  const badge = document.getElementById('unreadBadge');
  if (!badge) return;
  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : String(count);
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

async function initUnreadTracking() {
  const { supabase } = await import('./supabaseClient.js');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  const meId = session.user.id;

  async function refreshCount() {
    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .neq('sender_id', meId)
      .is('read_at', null);
    setUnreadBadge(count || 0);
  }

  await refreshCount();

  // RLS scopes this to messages in conversations the current user is part
  // of, so no extra filter is needed here.
  supabase
    .channel(`inbox-${meId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
      if (payload.new.sender_id === meId) return;
      playMessageChime();
      refreshCount();
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, () => {
      refreshCount();
    })
    .subscribe();
}
