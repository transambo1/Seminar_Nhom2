import React, { useState, useRef, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import { createSupportApi } from '../api/apiServices';
import { useNavigate } from 'react-router-dom';


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
    <div style={{ marginBottom: '8px' }}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Tìm kiếm địa điểm..."
        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
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
export const RequestSupport = () => {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [form, setForm] = useState({ userId: user.id, requestType: 'RESCUE', description: '', numberOfPeople: 1, latitude: null, longitude: null, priorityLevel: 'URGENT' });
  const [locationMode, setLocationMode] = useState('current');
  const [locError, setLocError] = useState('');
  const [mapTarget, setMapTarget] = useState(null);

  const handleGetLocation = (e) => {
    e.preventDefault();
    setLocError('');

    if (!navigator.geolocation) {
      setLocError('Trình duyệt của bạn không hỗ trợ định vị.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nextLat = pos.coords.latitude;
        const nextLng = pos.coords.longitude;

        setForm((prev) => ({
          ...prev,
          latitude: nextLat,
          longitude: nextLng
        }));

        setMapTarget({ lat: nextLat, lng: nextLng });
      },
      () => {
        setLocError('Không thể lấy vị trí. Vui lòng cho phép quyền truy cập vị trí hoặc chọn trên bản đồ.');
      }
    );
  };

  const handleMapClick = (e) => {
    if (e.detail.latLng) {
      const nextLat = e.detail.latLng.lat;
      const nextLng = e.detail.latLng.lng;

      setForm((prev) => ({
        ...prev,
        latitude: nextLat,
        longitude: nextLng
      }));
    }
  };

  const handlePlaceSelect = (place) => {
    if (place.geometry?.location) {
      const nextLat = place.geometry.location.lat();
      const nextLng = place.geometry.location.lng();

      setForm((prev) => ({
        ...prev,
        latitude: nextLat,
        longitude: nextLng
      }));

      setMapTarget({
        lat: nextLat,
        lng: nextLng
      });
    }
  };

  const REQUEST_TYPE_OPTIONS = [
    { label: "Cứu hộ", value: "RESCUE" },
    { label: "Y tế", value: "MEDICAL" },
    { label: "Lương thực", value: "FOOD" },
    { label: "Sơ tán", value: "EVACUATION" }
  ];

  const PRIORITY_OPTIONS = [
    { label: "Bình thường", value: "NORMAL" },
    { label: "Khẩn cấp", value: "URGENT" },
    { label: "Nguy kịch", value: "CRITICAL" }
  ];

  const submit = async (e) => {
    e.preventDefault();
    if (form.latitude == null || form.longitude == null) {
      alert('Vui lòng cung cấp vị trí cứu hộ (Cấp quyền vị trí hoặc chọn trên bản đồ).');
      return;
    }
    await createSupportApi(form);
    alert('Yêu cầu cứu hộ đã được gửi!');
    nav('/my-supports');
  }

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <div className="card">
        <h1>Yêu cầu Hỗ trợ khẩn cấp:</h1>
        <form onSubmit={submit} style={{ marginTop: '20px' }}>
          <div className="form-group">
            <label>Loại yêu cầu:</label>
            <select value={form.requestType} onChange={e => setForm({ ...form, requestType: e.target.value })}>
              {REQUEST_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Mức độ ưu tiên:</label>
            <select value={form.priorityLevel} onChange={e => setForm({ ...form, priorityLevel: e.target.value })}>
              {PRIORITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Số người cần giúp:</label><input type="number" value={form.numberOfPeople} onChange={e => setForm({ ...form, numberOfPeople: e.target.value })} /></div>

          {/* LOCATION SECTION CAPTURE */}
          <div className="form-group">
            <label>Vị trí gặp nạn:</label>
            <div style={{ display: 'flex', gap: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', fontWeight: '400', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input type="radio" value="current" checked={locationMode === 'current'} onChange={() => setLocationMode('current')} style={{ width: 'auto', marginRight: '6px' }} />
                Dùng vị trí hiện tại
              </label>
              <label style={{ display: 'flex', alignItems: 'center', fontWeight: '400', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input type="radio" value="map" checked={locationMode === 'map'} onChange={() => setLocationMode('map')} style={{ width: 'auto', marginRight: '6px' }} />
                Chọn trên bản đồ
              </label>
            </div>

            {locationMode === 'current' && (
              <div>
                <button onClick={handleGetLocation} className="btn btn-outline" style={{ display: 'block', marginBottom: '8px' }}>
                  📍 Lấy vị trí ngay
                </button>
                {locError && <p style={{ color: '#EF4444', fontSize: '0.85rem' }}>{locError}</p>}
              </div>
            )}

            {locationMode === 'map' && (
              <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={['places']}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} />
                  <div style={{ height: '280px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                    <Map
                      defaultZoom={14}
                      defaultCenter={{ lat: 10.8231, lng: 106.6297 }}
                      disableDefaultUI={true}
                      zoomControl={true}
                      gestureHandling="greedy"
                      onClick={handleMapClick}
                      mapId="DEMO_MAP_ID_SUPPORT"
                    >
                      <MapAutoPan target={mapTarget} />

                      {form.latitude && form.longitude && (
                        <AdvancedMarker position={{ lat: form.latitude, lng: form.longitude }}>
                          <div
                            style={{
                              background: '#EF4444',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              border: '3px solid white',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
                            }}
                          />
                        </AdvancedMarker>
                      )}
                    </Map>
                  </div>
                </div>
              </APIProvider>
            )}

            {form.latitude && form.longitude ? (
              <p style={{ marginTop: '10px', fontSize: '0.85rem', color: '#10B981', fontWeight: '600' }}>
                ✅ Đã xác định tọa độ: {parseFloat(form.latitude).toFixed(4)}, {parseFloat(form.longitude).toFixed(4)}
              </p>
            ) : (
              <p style={{ marginTop: '10px', fontSize: '0.85rem', color: '#EF4444', fontWeight: '600' }}>
                ⚠ Bắt buộc: Vui lòng cung cấp tọa độ.
              </p>
            )}
          </div>
          {/* END LOCATION SECTION */}

          <div className="form-group"><label>Mô tả chi tiết / Details</label><textarea onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <button className="btn">Gửi yêu cầu hỗ trợ ngay</button>
        </form>
      </div>
    </div>
  );
};
