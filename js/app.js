(async function () {
  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  function safeUrl(url) {
    if (typeof url !== 'string') return null;
    return /^https?:\/\//.test(url) ? url : null;
  }

  const [crafts, categories] = await Promise.all([
    fetch('data/crafts.json').then((r) => r.json()),
    fetch('data/categories.json').then((r) => r.json()),
  ]);

  const state = {
    query: '',
    activeCategories: new Set(Object.keys(categories)),
    selectedId: null,
  };

  // ---- Map setup ----
  const map = L.map('map', { zoomControl: true }).setView([37.5, 137.5], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  const markers = new Map(); // id -> L.marker

  function markerIcon(craft) {
    const cat = categories[craft.category] || categories.other;
    return L.divIcon({
      className: 'craft-marker-wrap',
      html: `<div class="craft-marker" style="background:${cat.color}; width:30px; height:30px;"><span>${cat.icon}</span></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -28],
    });
  }

  crafts.forEach((craft) => {
    const marker = L.marker([craft.lat, craft.lon], { icon: markerIcon(craft) });
    marker.bindPopup(
      `<div class="popup-name">${craft.name}</div>
       <div class="popup-loc">${craft.prefecture}${craft.city ? ' ・ ' + craft.city : ''}</div>
       <div class="popup-link" data-id="${craft.id}">詳しく見る →</div>`
    );
    marker.on('popupopen', () => {
      const el = document.querySelector(`.popup-link[data-id="${craft.id}"]`);
      if (el) el.addEventListener('click', () => showDetail(craft.id));
    });
    marker.on('click', () => highlightListItem(craft.id));
    marker.addTo(map);
    markers.set(craft.id, marker);
  });

  // ---- Category filter chips ----
  const filtersEl = document.getElementById('category-filters');
  Object.entries(categories).forEach(([key, cat]) => {
    const chip = document.createElement('div');
    chip.className = 'cat-chip active';
    chip.style.borderColor = cat.color;
    chip.style.background = cat.color;
    chip.textContent = `${cat.icon} ${cat.label}`;
    chip.dataset.key = key;
    chip.addEventListener('click', () => {
      if (state.activeCategories.has(key)) {
        state.activeCategories.delete(key);
        chip.classList.remove('active');
        chip.style.background = 'transparent';
        chip.style.borderColor = 'var(--border)';
        chip.style.color = cat.color;
      } else {
        state.activeCategories.add(key);
        chip.classList.add('active');
        chip.style.background = cat.color;
        chip.style.borderColor = cat.color;
        chip.style.color = '#fff';
      }
      render();
    });
    filtersEl.appendChild(chip);
  });

  // ---- Search ----
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    state.query = e.target.value.trim().toLowerCase();
    render();
  });

  // ---- List rendering ----
  const listEl = document.getElementById('craft-list');
  const countEl = document.getElementById('result-count');

  function filteredCrafts() {
    return crafts.filter((c) => {
      if (!state.activeCategories.has(c.category)) return false;
      if (!state.query) return true;
      const hay = `${c.name}${c.kana}${c.prefecture}${c.city}${c.products || ''}`.toLowerCase();
      return hay.includes(state.query);
    });
  }

  function render() {
    const list = filteredCrafts();
    countEl.textContent = `${list.length} 件の工芸品`;
    listEl.innerHTML = '';

    const visibleIds = new Set(list.map((c) => c.id));
    markers.forEach((marker, id) => {
      const shouldShow = visibleIds.has(id);
      const isOnMap = map.hasLayer(marker);
      if (shouldShow && !isOnMap) marker.addTo(map);
      if (!shouldShow && isOnMap) map.removeLayer(marker);
    });

    list.forEach((craft) => {
      const cat = categories[craft.category] || categories.other;
      const li = document.createElement('li');
      li.className = 'craft-item' + (craft.id === state.selectedId ? ' selected' : '');
      li.dataset.id = craft.id;
      li.innerHTML = `
        <span class="dot" style="background:${cat.color}"></span>
        <span class="info">
          <div class="name">${craft.name}</div>
          <div class="loc">${craft.prefecture}${craft.city ? ' ・ ' + craft.city : ''}</div>
        </span>
      `;
      li.addEventListener('click', () => {
        showDetail(craft.id);
        map.flyTo([craft.lat, craft.lon], 8, { duration: 0.6 });
        const marker = markers.get(craft.id);
        if (marker) marker.openPopup();
      });
      listEl.appendChild(li);
    });
  }

  function highlightListItem(id) {
    state.selectedId = id;
    document.querySelectorAll('.craft-item').forEach((el) => {
      el.classList.toggle('selected', el.dataset.id === id);
    });
  }

  // ---- Detail panel ----
  const detailPanel = document.getElementById('detail-panel');
  const detailContent = document.getElementById('detail-content');
  document.getElementById('detail-close').addEventListener('click', () => {
    detailPanel.classList.add('hidden');
  });

  function showDetail(id) {
    const craft = crafts.find((c) => c.id === id);
    if (!craft) return;
    state.selectedId = id;
    highlightListItem(id);

    const cat = categories[craft.category] || categories.other;
    const heroImg = craft.image
      ? `<img src="${escapeHtml(craft.image)}" alt="${escapeHtml(craft.name)}" />`
      : `<span>${cat.icon}</span>`;

    const metaRows = [
      ['産地', `${escapeHtml(craft.prefecture)}${craft.city ? ' ・ ' + escapeHtml(craft.city) : ''}`],
      ['指定・起源', escapeHtml(craft.since || '不明')],
    ];
    if (craft.products) metaRows.push(['主な製品', escapeHtml(craft.products)]);

    const assocUrl = craft.association && safeUrl(craft.association.url);
    const sourceUrl = safeUrl(craft.sourceUrl);

    const linkButtons = [];
    if (assocUrl) {
      linkButtons.push(
        `<a class="detail-link-btn" href="${assocUrl}" target="_blank" rel="noopener noreferrer">
           ${escapeHtml(craft.association.name || '産地組合の公式サイト')} ↗
         </a>`
      );
    }
    if (sourceUrl) {
      linkButtons.push(
        `<a class="detail-link-btn secondary" href="${sourceUrl}" target="_blank" rel="noopener noreferrer">
           伝統工芸 青山スクエアで見る ↗
         </a>`
      );
    }

    detailContent.innerHTML = `
      <div class="detail-hero" style="background:${cat.color}22;">${heroImg}</div>
      <div class="detail-body">
        <span class="detail-category-tag" style="background:${cat.color}">${cat.label}</span>
        <h2>${escapeHtml(craft.name)}</h2>
        <div class="detail-kana">${escapeHtml(craft.kana || '')}</div>
        <div class="detail-meta">
          ${metaRows.map(([k, v]) => `<strong>${k}</strong><span>${v}</span>`).join('')}
        </div>
        <p class="detail-desc">${escapeHtml(craft.description)}</p>
        ${
          linkButtons.length
            ? `<div class="detail-links">${linkButtons.join('')}</div>`
            : ''
        }
        ${
          !craft.image
            ? `<div class="detail-note">写真は準備中です。images/${escapeHtml(craft.id)}.jpg を追加し、data/crafts.json の "image" 欄にパスを設定すると、ここに実際の写真を表示できます。</div>`
            : ''
        }
      </div>
    `;
    detailPanel.classList.remove('hidden');
  }

  render();
})();
