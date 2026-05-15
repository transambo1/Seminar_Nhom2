import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Map, AdvancedMarker, useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import { createIncidentReportApi } from '../../api/incidentApi';
import { MapPin, Navigation, Search, CheckCircle2, LocateFixed, RotateCcw } from 'lucide-react';

const PlaceAutocomplete = ({ onPlaceSelect }) => {
  const [placeAutocomplete, setPlaceAutocomplete] = useState(null);
  const inputRef = useRef(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;
    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, {
      fields: ['geometry', 'name', 'formatted_address']
    }));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;
    const listener = placeAutocomplete.addListener('place_changed', () => {
      onPlaceSelect(placeAutocomplete.getPlace());
    });
    return () => {
      if (window.google) window.google.maps.event.removeListener(listener);
    }
  }, [onPlaceSelect, placeAutocomplete]);

  return (
    <div className="search-box-modern" style={{ marginBottom: '12px' }}>
      <Search size={18} style={{ marginLeft: '12px', color: '#94a3b8' }} />
      <input
        ref={inputRef}
        type="text"
        placeholder="Tìm kiếm địa điểm hoặc địa chỉ..."
        style={{ border: 'none', background: 'transparent', width: '100%', padding: '12px', fontSize: '0.9rem' }}
        onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
      />
    </div>
  );
};

const MapAutoPan = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !target) return;
    map.panTo(target);
    map.setZoom(16);
  }, [map, target]);
  return null;
};

const INCIDENT_TYPE_OPTIONS = [
  { label: 'Ngập lụt', value: 'FLOOD' },
  { label: 'Bão', value: 'STORM' },
  { label: 'Sạt lở đất', value: 'LANDSLIDE' },
  { label: 'Di tản', value: 'EVACUATION' },
  { label: 'Hỏa hoạn', value: 'FIRE' },
  { label: 'Núi lửa', value: 'VOLCANO' },
  { label: 'Hạn hán', value: 'DROUGHT' },
  { label: 'Khác', value: 'OTHER' }
];

export default function IncidentReportForm({ onSuccess }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [form, setForm] = useState({ 
    description: '', 
    incidentType: 'OTHER',
    severityLevel: 'MEDIUM', 
    latitude: null, 
    longitude: null,
    affectedArea: ''
  });
  
  const [locationMode, setLocationMode] = useState('current');
  const [mapTarget, setMapTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const geocodingLib = useMapsLibrary('geocoding');

  const reverseGeocode = useCallback((lat, lng) => {
    if (!geocodingLib) return;
    setIsGeocoding(true);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      setIsGeocoding(false);
      if (status === 'OK' && results[0]) {
        setForm(prev => ({ ...prev, affectedArea: results[0].formatted_address }));
      }
    });
  }, [geocodingLib]);

  const handleGetLocation = (e) => {
    e.preventDefault();
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm(prev => ({ ...prev, latitude, longitude }));
        setMapTarget({ lat: latitude, lng: longitude });
        reverseGeocode(latitude, longitude);
      },
      () => alert('Không thể lấy vị trí. Vui lòng cấp quyền truy cập vị trí.')
    );
  };

  const handleMapClick = (e) => {
    if (e.detail.latLng) {
      const { lat, lng } = e.detail.latLng;
      setForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
      reverseGeocode(lat, lng);
    }
  };

  const handlePlaceSelect = (place) => {
    if (place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setForm(prev => ({ 
        ...prev, 
        latitude: lat, 
        longitude: lng,
        affectedArea: place.formatted_address || place.name || ''
      }));
      setMapTarget({ lat, lng });
    }
  };

  const validate = () => {
    if (!form.description.trim()) return 'Vui lòng nhập mô tả chi tiết.';
    if (!form.affectedArea.trim()) return 'Vui lòng chọn hoặc nhập vị trí sự cố.';
    if (form.latitude == null || form.longitude == null) return 'Vui lòng xác định vị trí trên bản đồ.';
    if (!user.id) return 'Bạn cần đăng nhập để thực hiện hành động này.';
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    setIsSubmitting(true);
    try {
      const typeLabel = INCIDENT_TYPE_OPTIONS.find(o => o.value === form.incidentType)?.label || 'Sự cố';
      const payload = {
        ...form,
        title: `${typeLabel} tại ${form.affectedArea.split(',')[0]}`, // Auto-generate title
        userId: user.id
      };
      
      await createIncidentReportApi(payload);
      alert('Báo cáo sự cố đã được gửi thành công!');
      if (onSuccess) onSuccess();
    } catch (err) {
      const backendError = err.response?.data?.message || 'Lỗi hệ thống';
      alert(`Không thể gửi báo cáo: ${backendError}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasLocation = form.latitude !== null;

  return (
    <form onSubmit={submit} className="incident-report-form modern-form">
      {/* 1. Incident Type & Severity */}
      <div className="form-row-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div className="form-group">
          <label className="form-label">Loại sự cố <span className="required">*</span></label>
          <select 
            className="modern-select" 
            value={form.incidentType} 
            onChange={e => setForm({...form, incidentType: e.target.value})}
          >
            {INCIDENT_TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">Mức độ khẩn cấp <span className="required">*</span></label>
          <select 
            className="modern-select" 
            value={form.severityLevel} 
            onChange={e => setForm({...form, severityLevel: e.target.value})}
          >
            <option value="LOW">Thấp</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="HIGH">Cao</option>
            <option value="CRITICAL">Nguy kịch</option>
          </select>
        </div>
      </div>

      {/* 2. Unified Location Section */}
      <div className="form-group location-refactor-section" style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <MapPin size={20} color="#6366f1" />
          <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Vị trí sự cố</h4>
        </div>

        <div className="source-toggle" style={{ display: 'flex', background: '#e2e8f0', padding: '4px', borderRadius: '10px', marginBottom: '16px' }}>
          <button 
            type="button"
            className={`toggle-btn ${locationMode === 'current' ? 'active' : ''}`}
            onClick={() => setLocationMode('current')}
            style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', background: locationMode === 'current' ? 'white' : 'transparent', fontWeight: locationMode === 'current' ? '600' : '400', boxShadow: locationMode === 'current' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
          >
            <Navigation size={14} style={{ marginRight: '6px' }} />
            Vị trí của tôi
          </button>
          <button 
            type="button"
            className={`toggle-btn ${locationMode === 'map' ? 'active' : ''}`}
            onClick={() => setLocationMode('map')}
            style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', background: locationMode === 'map' ? 'white' : 'transparent', fontWeight: locationMode === 'map' ? '600' : '400', boxShadow: locationMode === 'map' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
          >
            <Search size={14} style={{ marginRight: '6px' }} />
            Chọn từ bản đồ
          </button>
        </div>

        {locationMode === 'current' ? (
          <div style={{ textAlign: 'center' }}>
            {!hasLocation ? (
              <button onClick={handleGetLocation} className="btn btn-primary" style={{ width: '100%', height: '50px', background: '#6366f1' }}>
                <LocateFixed size={18} style={{ marginRight: '8px' }} />
                Xác định vị trí GPS
              </button>
            ) : (
              <button onClick={handleGetLocation} className="btn btn-outline" style={{ width: '100%', height: '50px' }}>
                <RotateCcw size={18} style={{ marginRight: '8px' }} />
                Cập nhật lại vị trí
              </button>
            )}
          </div>
        ) : (
          <div>
            <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} />
            <div style={{ height: '200px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
              <Map
                defaultZoom={14}
                defaultCenter={{ lat: 10.8231, lng: 106.6297 }}
                onClick={handleMapClick}
                mapId="MODAL_INCIDENT_MAP"
                disableDefaultUI={true}
                zoomControl={true}
                gestureHandling="greedy"
              >
                <MapAutoPan target={mapTarget} />
                {hasLocation && (
                  <AdvancedMarker position={{ lat: form.latitude, lng: form.longitude }}>
                    <div style={{ background: '#EF4444', width: '22px', height: '22px', borderRadius: '50%', border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} />
                  </AdvancedMarker>
                )}
              </Map>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px', textAlign: 'center' }}>
              Mẹo: Bạn có thể click trực tiếp lên bản đồ để chọn vị trí
            </p>
          </div>
        )}

        {/* Display Resolved Location */}
        {hasLocation && (
          <div style={{ marginTop: '16px', padding: '12px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div className="result-item" style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Địa chỉ xác định</label>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '4px' }}>
                {isGeocoding ? (
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Đang xác định địa chỉ...</span>
                ) : (
                  <>
                    <CheckCircle2 size={16} color="#10b981" style={{ marginTop: '2px' }} />
                    <input 
                      type="text"
                      className="inline-edit-input"
                      value={form.affectedArea}
                      onChange={e => setForm({...form, affectedArea: e.target.value})}
                      style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.85rem', color: '#1e293b', fontWeight: '500', padding: 0 }}
                    />
                  </>
                )}
              </div>
            </div>
            <div className="result-item">
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Tọa độ</label>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace' }}>
                {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Detailed Description */}
      <div className="form-group">
        <label className="form-label">Mô tả chi tiết <span className="required">*</span></label>
        <textarea 
          className="modern-textarea"
          value={form.description} 
          onChange={e => setForm({...form, description: e.target.value})} 
          placeholder="Hãy mô tả rõ tình hình hiện tại (số người bị kẹt, mức độ thiệt hại, nhu cầu khẩn cấp...)" 
          style={{ minHeight: '120px' }}
          required
        />
      </div>

      <button 
        className="btn btn-primary btn-lg" 
        disabled={isSubmitting || isGeocoding} 
        style={{ background: '#EF4444', width: '100%', marginTop: '10px', height: '54px', fontSize: '1rem', fontWeight: '700' }}
      >
        {isSubmitting ? 'ĐANG GỬI BÁO CÁO...' : 'GỬI BÁO CÁO NGAY'}
      </button>
    </form>
  );
}

