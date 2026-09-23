// Custom MapLibre style built on the free OpenFreeMap vector tiles.
// Deliberately includes ONLY fill/line/background layers (no "symbol" layers),
// so no place names, city names, or any text ever render on the map —
// just landmass, water, and a faint "digital circuit" road/boundary network.
window.CRAFT_MAP_STYLE = {
  version: 8,
  sources: {
    openmaptiles: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#0a0908' },
    },
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: { 'fill-color': '#10161c' },
    },
    {
      id: 'landcover_wood',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landcover',
      filter: ['==', 'class', 'wood'],
      minzoom: 6,
      paint: { 'fill-color': '#0f1310', 'fill-opacity': 0.7 },
    },
    {
      id: 'park',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'park',
      paint: { 'fill-color': '#0f1310', 'fill-opacity': 0.5 },
    },
    {
      id: 'building',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'building',
      minzoom: 12,
      paint: { 'fill-color': '#171512', 'fill-opacity': 0.8 },
    },
    {
      id: 'waterway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'waterway',
      paint: { 'line-color': '#141a20', 'line-width': 1 },
    },
    {
      id: 'boundary_admin',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      filter: ['<=', 'admin_level', 4],
      paint: {
        'line-color': 'rgba(224, 118, 44, 0.35)',
        'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.5, 10, 1.4],
        'line-dasharray': [3, 2],
      },
    },
    {
      id: 'highway_minor',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'minor', 'service'],
      minzoom: 9,
      paint: {
        'line-color': 'rgba(246, 241, 231, 0.08)',
        'line-width': 0.6,
      },
    },
    {
      id: 'highway_major',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'primary', 'secondary', 'tertiary', 'trunk'],
      minzoom: 6,
      paint: {
        'line-color': 'rgba(224, 118, 44, 0.3)',
        'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.4, 12, 1.6],
      },
    },
    {
      id: 'highway_motorway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'motorway'],
      minzoom: 5,
      paint: {
        'line-color': 'rgba(224, 118, 44, 0.55)',
        'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.5, 12, 2.2],
      },
    },
  ],
};
