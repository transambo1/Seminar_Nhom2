import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap
} from '@vis.gl/react-google-maps';
import { MarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer';

const FALLBACK_LOCATION = { lat: 10.8231, lng: 106.6297 };

const ClusteredMarkers = ({ markers, onMarkerClick }) => {
  const map = useMap();
  const clustererRef = useRef(null);
  const markerRefs = useRef({});
  const rafRef = useRef(null);

  const syncClusterer = useCallback(() => {
    if (!clustererRef.current) return;

    const markerList = Object.values(markerRefs.current).filter(Boolean);

    clustererRef.current.clearMarkers();

    if (markerList.length > 0) {
      clustererRef.current.addMarkers(markerList);
    }
  }, []);

  useEffect(() => {
    if (!map || clustererRef.current) return;

    const customRenderer = {
      render: ({ count, position }) => {
        const el = document.createElement('div');
        el.className = 'custom-cluster-badge';
        el.innerText = String(count);

        return new window.google.maps.marker.AdvancedMarkerElement({
          position,
          content: el,
          zIndex: 1000 + count,
        });
      },
    };

    clustererRef.current = new MarkerClusterer({
      map,
      algorithm: new SuperClusterAlgorithm({ radius: 100 }),
      renderer: customRenderer,
    });

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current = null;
      }
    };
  }, [map]);

  useEffect(() => {
    if (!clustererRef.current) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      syncClusterer();
    });
  }, [markers, syncClusterer]);

  const setMarkerRef = useCallback(
    (key, marker) => {
      if (marker) {
        markerRefs.current[key] = marker;
      } else {
        delete markerRefs.current[key];
      }

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        syncClusterer();
      });
    },
    [syncClusterer]
  );

  return (
    <>
      {markers.map((marker) => (
        <AdvancedMarker
          key={marker.key}
          position={{ lat: marker.lat, lng: marker.lng }}
          ref={(ref) => setMarkerRef(marker.key, ref)}
          onClick={() => onMarkerClick(marker.data, marker.type)}
        >
          {marker.pin}
        </AdvancedMarker>
      ))}
    </>
  );
};

const ShelterPanner = ({ selectedShelter, onSelected }) => {
  const map = useMap();
  useEffect(() => {
    if (map && selectedShelter && selectedShelter.latitude != null && selectedShelter.longitude != null) {
      map.panTo({ lat: Number(selectedShelter.latitude), lng: Number(selectedShelter.longitude) });
      map.setZoom(16);
      onSelected({
        ...selectedShelter,
        elementType: 'SHELTER',
        lat: Number(selectedShelter.latitude),
        lng: Number(selectedShelter.longitude)
      });
    }
  }, [map, selectedShelter, onSelected]);
  return null;
};

const MyLocationButton = ({ myLocation }) => {
  const map = useMap();

  if (!myLocation) return null;

  const handleClick = () => {
    if (!map) return;
    map.panTo(myLocation);
    map.setZoom(15);
  };

  return (
    <button
      onClick={handleClick}
      style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: 10,
        background: '#2563EB',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}
    >
      Vị trí của tôi
    </button>
  );
};

const StormShieldMap = ({ shelters = [], reports = [], alerts = [], selectedShelter = null }) => {
  const [initialCenter, setInitialCenter] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setInitialCenter(FALLBACK_LOCATION);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setMyLocation(loc);
        setInitialCenter(loc);
      },
      () => {
        console.warn('Không lấy được vị trí, dùng TP.HCM mặc định.');
        setInitialCenter(FALLBACK_LOCATION);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  const handleMarkerClick = (element, type) => {
    setSelectedElement({ ...element, elementType: type });
  };

  const shelterMarkers = useMemo(() => {
    return shelters
      .filter((s) => s.latitude != null && s.longitude != null)
      .map((s) => ({
        key: `s-${s.id}`,
        lat: Number(s.latitude),
        lng: Number(s.longitude),
        data: s,
        type: 'SHELTER',
        pin: <div className="marker-shelter-pulse"></div>
      }));
  }, [shelters]);

  const reportMarkers = useMemo(() => {
    return reports
      .filter((r) => r.latitude != null && r.longitude != null)
      .map((r) => ({
        key: `r-${r.id}`,
        lat: Number(r.latitude),
        lng: Number(r.longitude),
        data: r,
        type: 'REPORT',
        pin: (
          <Pin
            background="#F59E0B"
            borderColor="#92400E"
            glyphColor="#FFFFFF"
          />
        )
      }));
  }, [reports]);

  const alertMarkers = useMemo(() => {
    return alerts
      .filter((a) => a.latitude != null && a.longitude != null)
      .map((a) => ({
        key: `a-${a.id}`,
        lat: Number(a.latitude),
        lng: Number(a.longitude),
        data: a,
        type: 'ALERT',
        pin: <div className="marker-alert-pulse">!</div>
      }));
  }, [alerts]);

  const infoPosition = selectedElement
    ? {
      lat: selectedElement.lat ?? selectedElement.latitude,
      lng: selectedElement.lng ?? selectedElement.longitude
    }
    : null;

  if (!initialCenter) {
    return (
      <div
        style={{
          height: '500px',
          width: '100%',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f3f4f6',
          color: '#374151',
          fontWeight: 600
        }}
      >
        Đang tải bản đồ...
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        height: '500px',
        width: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
      }}
    >
      <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <Map
          defaultZoom={13}
          defaultCenter={initialCenter}
          mapId="DEMO_MAP_ID"
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          {/* Clustered Shelters */}
          <ClusteredMarkers
            key={`shelter-cluster-${shelterMarkers.length}`}
            markers={shelterMarkers}
            onMarkerClick={handleMarkerClick}
          />

          {/* Independent Static Markers (Not clustered to remain highly visible) */}
          {reportMarkers.map((marker) => (
            <AdvancedMarker
              key={marker.key}
              position={{ lat: marker.lat, lng: marker.lng }}
              onClick={() => handleMarkerClick(marker.data, marker.type)}
            >
              {marker.pin}
            </AdvancedMarker>
          ))}

          {alertMarkers.map((marker) => (
            <AdvancedMarker
              key={marker.key}
              position={{ lat: marker.lat, lng: marker.lng }}
              onClick={() => handleMarkerClick(marker.data, marker.type)}
            >
              {marker.pin}
            </AdvancedMarker>
          ))}

          {myLocation && (
            <AdvancedMarker
              position={myLocation}
              onClick={() =>
                handleMarkerClick(
                  {
                    lat: myLocation.lat,
                    lng: myLocation.lng,
                    title: 'Bạn đang ở đây'
                  },
                  'USER'
                )
              }
            >
              <Pin
                background="#2563EB"
                borderColor="#FFFFFF"
                glyphColor="#FFFFFF"
              />
            </AdvancedMarker>
          )}

          <MyLocationButton myLocation={myLocation} />

          <ShelterPanner selectedShelter={selectedShelter} onSelected={setSelectedElement} />

          {selectedElement && infoPosition && (
            <InfoWindow
              position={infoPosition}
              onCloseClick={() => setSelectedElement(null)}
            >
              <div style={{ padding: '4px', maxWidth: '220px', lineHeight: 1.5 }}>
                {selectedElement.elementType === 'USER' && (
                  <strong style={{ color: '#2563EB' }}>
                    {selectedElement.title}
                  </strong>
                )}

                {selectedElement.elementType === 'SHELTER' && (
                  <div>
                    <strong style={{ color: '#10B981' }}>
                      {selectedElement.name}
                    </strong>
                    <br />
                    Địa chỉ: {selectedElement.address}
                    <br />
                    Trạng thái: {selectedElement.status}
                    <br />
                    Sức chứa: {selectedElement.currentOccupancy}/
                    {selectedElement.capacity}
                  </div>
                )}

                {selectedElement.elementType === 'REPORT' && (
                  <div>
                    <strong style={{ color: '#F59E0B' }}>
                      NGUY HIỂM: {selectedElement.reportType}
                    </strong>
                    <br />
                    Mức độ: {selectedElement.dangerLevel}
                    <br />
                    Chi tiết: {selectedElement.description}
                  </div>
                )}

                {selectedElement.elementType === 'ALERT' && (
                  <div>
                    <strong style={{ color: '#EF4444' }}>
                      CẢNH BÁO: {selectedElement.title}
                    </strong>
                    <br />
                    Mức độ: {selectedElement.severityLevel}
                    <br />
                    {selectedElement.description}
                  </div>
                )}
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
};

export default StormShieldMap;