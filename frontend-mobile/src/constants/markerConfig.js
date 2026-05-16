export const MARKER_CONFIG = {
  earthquake: { emoji: '🌋', color: '#ba1a1a', bgColor: 'rgba(186,26,26,0.15)', label: 'Earthquake' },
  flood:      { emoji: '🌊', color: '#1565C0', bgColor: 'rgba(21,101,192,0.15)', label: 'Flood' },
  cyclone:    { emoji: '🌀', color: '#6A1B9A', bgColor: 'rgba(106,27,154,0.15)', label: 'Cyclone' },
  storm:      { emoji: '⛈️', color: '#4A148C', bgColor: 'rgba(74,20,140,0.15)',  label: 'Storm' },
  volcano:    { emoji: '🌋', color: '#E65100', bgColor: 'rgba(230,81,0,0.15)',   label: 'Volcano' },
  wildfire:   { emoji: '🔥', color: '#FF6F00', bgColor: 'rgba(255,111,0,0.15)', label: 'Wildfire' },
  drought:    { emoji: '☀️', color: '#F57F17', bgColor: 'rgba(245,127,23,0.15)',label: 'Drought' },
  weather_alert:{ emoji: '🌬️', color: '#00695C', bgColor:'rgba(0,105,92,0.15)',label: 'Weather Alert' },
  other:      { emoji: '⚠️', color: '#546E7A', bgColor: 'rgba(84,110,122,0.15)',label: 'Alert' },
};

export const SEVERITY_CONFIG = {
  critical: { label: 'CRITICAL', color: '#ba1a1a', bgColor: '#ffdad6', textColor: '#410002' },
  high:     { label: 'HIGH',     color: '#E65100', bgColor: '#FFE0B2', textColor: '#BF360C' },
  moderate: { label: 'MODERATE', color: '#F57F17', bgColor: '#FFF9C4', textColor: '#F57F17' },
  low:      { label: 'LOW',      color: '#546E7A', bgColor: '#ECEFF1', textColor: '#546E7A' },
};

export const SOURCE_LABELS = {
  USGS: '🔬 USGS', GDACS: '🌐 GDACS', NASA_EONET: '🛰️ NASA EONET', OWM: '🌤️ OpenWeather',
};
