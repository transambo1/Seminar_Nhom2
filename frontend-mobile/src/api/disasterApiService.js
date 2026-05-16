// StormShield – Disaster API Service
// Sources: USGS, GDACS, NASA EONET, OpenWeatherMap
import apiClient from './apiClient';
const OWM_API_KEY = 'e21c1a2b8eb0d658f6915654590ef161';

const ENDPOINTS = {
  USGS_24H: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
  GDACS: 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/map?eventtype=ALL',
  NASA_EONET: 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=50',
  OWM: (lat, lon) => `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily&appid=${OWM_API_KEY}`,
};

const usgsToSeverity = (mag) => {
  if (mag >= 6.0) return 'critical';
  if (mag >= 4.5) return 'high';
  if (mag >= 2.5) return 'moderate';
  return 'low';
};

const gdacsToSeverity = (level) => {
  const l = (level || '').toLowerCase();
  if (l === 'red') return 'critical';
  if (l === 'orange') return 'high';
  return 'low';
};

const eonetToType = (id) => ({
  wildfires: 'wildfire', severeStorms: 'storm', volcanoes: 'volcano',
  floods: 'flood', earthquakes: 'earthquake',
}[id] || 'other');

export const fetchInternalAlerts = async () => {
  try {
    const res = await apiClient.get('/api/v1/alerts/active');
    return res.data.map(item => ({
      id: `internal_${item.id}`,
      type: item.alertType?.toLowerCase() || 'other',
      severity: item.severityLevel?.toLowerCase() || 'low',
      title: item.title,
      description: item.description,
      coordinate: { latitude: item.latitude, longitude: item.longitude },
      source: 'StormShield', // Nguồn nội bộ
      time: item.startTime || new Date().toISOString(),
      provinceName: item.provinceName,
      url: null,
      placeName: item.affectedArea,
      magnitude: null,
      alertLevel: item.severityLevel,
      isInternal: true, // Đánh dấu để UI có thể phân biệt nếu muốn
    }));
  } catch (e) {
    console.warn('[Internal Alerts]', e.message);
    return [];
  }
};

// 🟢 MỚI: Fetch báo cáo hiện trường từ người dân
export const fetchInternalIncidents = async () => {
  try {
    const res = await apiClient.get('/api/v1/incident-reports');
    return res.data.map(item => ({
      id: `report_${item.id}`,
      type: item.incidentType?.toLowerCase() || 'other',
      severity: item.severityLevel?.toLowerCase() || 'low',
      title: `Report: ${item.title}`,
      description: item.description,
      coordinate: { latitude: item.latitude, longitude: item.longitude },
      source: 'Citizen Report',
      time: item.createdAt || new Date().toISOString(),
      url: item.imageUrl || null,
      placeName: item.affectedArea,
      magnitude: null,
      alertLevel: item.status,
    }));
  } catch (e) {
    console.warn('[Internal Incidents]', e.message);
    return [];
  }
};

export const fetchAllDisasterData = async (userLocation = null) => {
  const tasks = [
    fetchUSGSEarthquakes(), 
    fetchGDACSEvents(), 
    fetchNASAEONET(),
    fetchInternalAlerts(),   // 🟢 Thêm BE vào đây
    fetchInternalIncidents() // 🟢 Thêm BE vào đây
  ];
  
  if (userLocation) tasks.push(fetchOWMAlerts(userLocation.latitude, userLocation.longitude));
  
  const results = await Promise.allSettled(tasks);
  const markers = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
  
  const seen = new Set();
  return markers.filter(m => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
};

export const fetchInternalShelters = async (status = null) => {
  try {
    // Gọi endpoint GET /api/v1/shelters từ BE
    const res = await apiClient.get('/api/v1/shelters', {
      params: status ? { status } : {}
    });
    
    return res.data.map(item => ({
      id: `internal_shelter_${item.id}`,
      name: item.name,
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude,
      coordinate: { latitude: item.latitude, longitude: item.longitude },
      capacity: item.currentOccupancy || 0, // Số người đang ở
      maxCapacity: item.capacity,           // Sức chứa tối đa
      status: item.status,                  // AVAILABLE, FULL, v.v.
      contactPhone: item.contactPhone,
      managedBy: item.managedBy,
      petFriendly: true, // BE hiện chưa có trường này, tạm để true
      isInternal: true
    }));
  } catch (e) {
    console.warn('[Internal Shelters Error]', e.message);
    return [];
  }
};

























export const fetchUSGSEarthquakes = async () => {
  try {
    const res = await fetch(ENDPOINTS.USGS_24H);
    if (!res.ok) throw new Error('USGS error');
    const json = await res.json();
    return json.features.filter(f => f.geometry?.coordinates).map(f => {
      const [lon, lat] = f.geometry.coordinates;
      const mag = f.properties.mag ?? 0;
      return {
        id: `usgs_${f.id}`, type: 'earthquake',
        severity: usgsToSeverity(mag), magnitude: mag,
        title: f.properties.place || 'Earthquake',
        description: `M${mag.toFixed(1)} – ${f.properties.place || 'Unknown location'}`,
        coordinate: { latitude: lat, longitude: lon },
        source: 'USGS', time: new Date(f.properties.time).toISOString(),
        url: f.properties.url || null, alertLevel: null,
      };
    });
  } catch (e) { console.warn('[USGS]', e.message); return []; }
};

export const fetchGDACSEvents = async () => {
  try {
    const res = await fetch(ENDPOINTS.GDACS, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('GDACS error');
    const data = await res.json();
    return (data?.features || []).filter(f => f.geometry?.coordinates).map(f => {
      const p = f.properties || {};
      const coords = f.geometry.coordinates;
      const lon = Array.isArray(coords[0]) ? coords[0][0] : coords[0];
      const lat = Array.isArray(coords[0]) ? coords[0][1] : coords[1];
      const t = (p.eventtype || '').toLowerCase();
      const type = { fl: 'flood', tc: 'cyclone', eq: 'earthquake', vo: 'volcano', wf: 'wildfire', dr: 'drought' }[t] || 'other';
      return {
        id: `gdacs_${p.eventid || Math.random()}`, type,
        severity: gdacsToSeverity(p.alertlevel),
        title: p.eventname || p.name || 'GDACS Alert',
        description: `${p.eventtype} – Alert level: ${p.alertlevel}`,
        coordinate: { latitude: lat, longitude: lon },
        source: 'GDACS', time: p.fromdate ? new Date(p.fromdate).toISOString() : new Date().toISOString(),
        url: p.url || null, magnitude: p.magnitude ?? null, alertLevel: p.alertlevel || null,
      };
    });
  } catch (e) { console.warn('[GDACS]', e.message); return []; }
};

export const fetchNASAEONET = async () => {
  try {
    const res = await fetch(ENDPOINTS.NASA_EONET);
    if (!res.ok) throw new Error('EONET error');
    const data = await res.json();
    const markers = [];
    (data.events || []).forEach(ev => {
      const geo = ev.geometry || [];
      if (!geo.length) return;
      const latest = geo[geo.length - 1];
      if (!latest?.coordinates) return;
      const [lon, lat] = latest.coordinates;
      markers.push({
        id: `eonet_${ev.id}`, type: eonetToType(ev.categories?.[0]?.id),
        severity: 'high', title: ev.title || 'Natural Event',
        description: `${ev.title} – NASA EONET`,
        coordinate: { latitude: lat, longitude: lon },
        source: 'NASA_EONET', time: latest.date || new Date().toISOString(),
        url: ev.sources?.[0]?.url || null, magnitude: null, alertLevel: null,
      });
    });
    return markers;
  } catch (e) { console.warn('[EONET]', e.message); return []; }
};

export const fetchOWMAlerts = async (lat, lon) => {
  if (!OWM_API_KEY || OWM_API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') return [];
  try {
    const res = await fetch(ENDPOINTS.OWM(lat, lon));
    if (!res.ok) throw new Error('OWM error');
    const data = await res.json();
    return (data.alerts || []).map((a, i) => ({
      id: `owm_${i}_${a.start}`, type: 'weather_alert',
      severity: 'high', title: a.event || 'Weather Alert',
      description: a.description || `Sender: ${a.sender_name}`,
      coordinate: { latitude: lat, longitude: lon },
      source: 'OWM', time: new Date(a.start * 1000).toISOString(),
      url: null, magnitude: null, alertLevel: null,
    }));
  } catch (e) { console.warn('[OWM]', e.message); return []; }
};

