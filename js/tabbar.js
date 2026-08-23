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
    <a href="${i.href}" class="${i.key === active ? 'active' : ''}">
      <span style="font-size:19px;">${i.icon}</span>
      <span>${i.label}</span>
    </a>
  `).join('');
  document.body.appendChild(el);
}
