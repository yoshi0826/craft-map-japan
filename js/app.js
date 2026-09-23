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

  // ---- Lucide icons (inlined, stroke="currentColor" so they inherit color/size from CSS) ----
  const ICON_PATHS = {
    amphora: '<path d="M10 2v5.632c0 .424-.272.795-.653.982A6 6 0 0 0 6 14c.006 4 3 7 5 8" /><path d="M10 5H8a2 2 0 0 0 0 4h.68" /><path d="M14 2v5.632c0 .424.272.795.652.982A6 6 0 0 1 18 14c0 4-3 7-5 8" /><path d="M14 5h2a2 2 0 0 1 0 4h-.68" /><path d="M18 22H6" /><path d="M9 2h6" />',
    paintbrush: '<path d="m14.622 17.897-10.68-2.913" /><path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z" /><path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15" />',
    shirt: '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />',
    palette: '<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" /><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />',
    hammer: '<path d="m15 12-9.373 9.373a1 1 0 0 1-3.001-3L12 9" /><path d="m18 15 4-4" /><path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172v-.344a2 2 0 0 0-.586-1.414l-1.657-1.657A6 6 0 0 0 12.516 3H9l1.243 1.243A6 6 0 0 1 12 8.485V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5" />',
    scroll: '<path d="M19 17V5a2 2 0 0 0-2-2H4" /><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3" />',
    axe: '<path d="m14 12-8.381 8.38a1 1 0 0 1-3.001-3L11 9" /><path d="M15 15.5a.5.5 0 0 0 .5.5A6.5 6.5 0 0 0 22 9.5a.5.5 0 0 0-.5-.5h-1.672a2 2 0 0 1-1.414-.586l-5.062-5.062a1.205 1.205 0 0 0-1.704 0L9.352 5.648a1.205 1.205 0 0 0 0 1.704l5.062 5.062A2 2 0 0 1 15 13.828z" />',
    drama: '<path d="M10 11h.01" /><path d="M14 6h.01" /><path d="M18 6h.01" /><path d="M6.5 13.1h.01" /><path d="M22 5c0 9-4 12-6 12s-6-3-6-12c0-2 2-3 6-3s6 1 6 3" /><path d="M17.4 9.9c-.8.8-2 .8-2.8 0" /><path d="M10.1 7.1C9 7.2 7.7 7.7 6 8.6c-3.5 2-4.7 3.9-3.7 5.6 4.5 7.8 9.5 8.4 11.2 7.4.9-.5 1.9-2.1 1.9-4.7" /><path d="M9.1 16.5c.3-1.1 1.4-1.7 2.4-1.4" />',
    sparkles: '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" /><path d="M20 2v4" /><path d="M22 4h-4" /><circle cx="4" cy="20" r="2" />',
    x: '<path d="M18 6 6 18" /><path d="m6 6 12 12" />',
    'arrow-right': '<path d="M5 12h14" /><path d="m12 5 7 7-7 7" />',
    'external-link': '<path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />',
    search: '<path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" />',
    image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />',
  };

  function icon(name, { size = 16, className = '' } = {}) {
    const paths = ICON_PATHS[name] || '';
    return `<svg class="icon ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
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

  // ---- Map setup (MapLibre GL, custom label-free dark style) ----
  const map = new maplibregl.Map({
    container: 'map',
    style: window.CRAFT_MAP_STYLE,
    center: [137.5, 37.5],
    zoom: 4.3,
    minZoom: 4,
    maxZoom: 12,
    maxBounds: [
      [111, 12],
      [158, 56],
    ],
    attributionControl: {
      compact: true,
      customAttribution: '&copy; OpenStreetMap contributors &copy; OpenFreeMap',
    },
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');

  const markers = new Map(); // id -> maplibregl.Marker
  let markerSeq = 0;

  // Event delegation: popup HTML is injected by MapLibre outside our control,
  // so bind "read more" clicks once instead of per-popup.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('.popup-link');
    if (link && link.dataset.id) showDetail(link.dataset.id);
  });

  function createMarkerEl(craft) {
    // MapLibre applies its own positioning `transform` directly to the element
    // passed to Marker, so the rotated/animated pin must be a CHILD of that
    // element rather than the element itself (otherwise our CSS transform for
    // rotation/pop-in animation would fight with MapLibre's translate).
    const cat = categories[craft.category] || categories.other;
    const delay = Math.min(markerSeq++, 60) * 8;
    const wrap = document.createElement('div');
    wrap.className = 'craft-marker-wrap';
    const pin = document.createElement('div');
    pin.className = 'craft-marker';
    pin.style.background = cat.color;
    pin.style.width = '30px';
    pin.style.height = '30px';
    pin.style.animationDelay = `${delay}ms`;
    pin.style.setProperty('--glow', cat.color);
    pin.innerHTML = icon(cat.icon, { size: 16 });
    wrap.appendChild(pin);
    return wrap;
  }

  crafts.forEach((craft) => {
    const wrap = createMarkerEl(craft);
    const popupHtml = `<div class="popup-name">${escapeHtml(craft.name)}</div>
       <div class="popup-loc">${escapeHtml(craft.prefecture)}${craft.city ? ' ・ ' + escapeHtml(craft.city) : ''}</div>
       <div class="popup-link" data-id="${escapeHtml(craft.id)}">詳しく見る<span class="link-arrow">${icon('arrow-right', { size: 13 })}</span></div>`;
    const popup = new maplibregl.Popup({ offset: 22, closeButton: true, maxWidth: '240px' }).setHTML(popupHtml);
    const marker = new maplibregl.Marker({ element: wrap, anchor: 'bottom' })
      .setLngLat([craft.lon, craft.lat])
      .setPopup(popup)
      .addTo(map);
    wrap.addEventListener('click', () => highlightListItem(craft.id));
    markers.set(craft.id, marker);
  });

  // ---- Category filter chips ----
  const filtersEl = document.getElementById('category-filters');
  Object.entries(categories).forEach(([key, cat]) => {
    const chip = document.createElement('div');
    chip.className = 'cat-chip active';
    chip.style.borderColor = cat.color;
    chip.style.background = cat.color;
    chip.innerHTML = `${icon(cat.icon, { size: 14 })}<span>${escapeHtml(cat.label)}</span>`;
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
      const isOnMap = marker._craftOnMap !== false;
      if (shouldShow && !isOnMap) {
        marker.addTo(map);
        marker._craftOnMap = true;
      }
      if (!shouldShow && isOnMap) {
        marker.remove();
        marker._craftOnMap = false;
      }
    });

    list.forEach((craft, index) => {
      const cat = categories[craft.category] || categories.other;
      const li = document.createElement('li');
      li.className = 'craft-item' + (craft.id === state.selectedId ? ' selected' : '');
      li.dataset.id = craft.id;
      li.style.animationDelay = `${Math.min(index, 20) * 15}ms`;
      li.innerHTML = `
        <span class="dot" style="background:${cat.color}"></span>
        <span class="info">
          <div class="name">${craft.name}</div>
          <div class="loc">${craft.prefecture}${craft.city ? ' ・ ' + craft.city : ''}</div>
        </span>
      `;
      li.addEventListener('click', () => {
        showDetail(craft.id);
        map.flyTo({ center: [craft.lon, craft.lat], zoom: 8, duration: 600, essential: true });
        const marker = markers.get(craft.id);
        if (marker) {
          const popup = marker.getPopup();
          if (popup && !popup.isOpen()) marker.togglePopup();
        }
      });
      listEl.appendChild(li);
    });
  }

  let selectedMarkerEl = null;
  function setSelectedMarker(id) {
    if (selectedMarkerEl) selectedMarkerEl.classList.remove('marker-selected');
    const marker = markers.get(id);
    const wrap = marker && marker.getElement();
    selectedMarkerEl = (wrap && wrap.querySelector('.craft-marker')) || null;
    if (selectedMarkerEl) selectedMarkerEl.classList.add('marker-selected');
  }

  function highlightListItem(id) {
    state.selectedId = id;
    document.querySelectorAll('.craft-item').forEach((el) => {
      el.classList.toggle('selected', el.dataset.id === id);
    });
    setSelectedMarker(id);
  }

  // ---- Detail panel ----
  const detailPanel = document.getElementById('detail-panel');
  const detailContent = document.getElementById('detail-content');
  document.getElementById('detail-close').innerHTML = icon('x', { size: 16 });
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
      : icon(cat.icon, { size: 56 });

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
           <span>${escapeHtml(craft.association.name || '産地組合の公式サイト')}</span><span class="link-arrow">${icon('external-link', { size: 14 })}</span>
         </a>`
      );
    }
    if (sourceUrl) {
      linkButtons.push(
        `<a class="detail-link-btn secondary" href="${sourceUrl}" target="_blank" rel="noopener noreferrer">
           <span>伝統工芸 青山スクエアで見る</span><span class="link-arrow">${icon('external-link', { size: 14 })}</span>
         </a>`
      );
    }

    detailContent.innerHTML = `
      <div class="detail-hero" style="background:${cat.color}22; color:${cat.color};">${heroImg}</div>
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
            ? `<div class="detail-note">${icon('image', { size: 15 })}<span>写真は準備中です。images/${escapeHtml(craft.id)}.jpg を追加し、data/crafts.json の "image" 欄にパスを設定すると、ここに実際の写真を表示できます。</span></div>`
            : ''
        }
      </div>
    `;
    detailPanel.classList.remove('hidden');
    detailContent.classList.remove('detail-fade');
    void detailContent.offsetWidth;
    detailContent.classList.add('detail-fade');
  }

  // ---- Header count-up ----
  function animateCount(el, target, duration = 900) {
    if (!el) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      el.textContent = target;
      return;
    }
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  animateCount(document.getElementById('header-count'), crafts.length);

  render();
})();
