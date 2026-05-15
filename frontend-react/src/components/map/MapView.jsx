import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap
} from '@vis.gl/react-google-maps';
import { MarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer';
import { useMapState } from '../../context/MapContext';

const FALLBACK_LOCATION = { lat: 10.8231, lng: 106.6297 };

const isValidCoordinate = (alert) => {
  if (alert.latitude == null || alert.longitude == null) return false;
  const lat = Number(alert.latitude);
  const lng = Number(alert.longitude);
  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

const isAlertInsideBounds = (alert, bounds) => {
  if (!bounds) return true;
  const lat = Number(alert.latitude);
  const lng = Number(alert.longitude);
  return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
};

const getSeverityRank = (severityLevel) => {
  switch (severityLevel) {
    case 'CRITICAL': return 4;
    case 'HIGH': return 3;
    case 'MEDIUM': return 2;
    case 'LOW': return 1;
    default: return 0;
  }
};

const getRenderableAlerts = (alerts, bounds) => {
  const validAlerts = alerts.filter(isValidCoordinate);
  
  let visibleAlerts = validAlerts;
  if (bounds) {
    visibleAlerts = validAlerts.filter(a => isAlertInsideBounds(a, bounds));
  }
  
  const sortedAlerts = visibleAlerts.sort((a, b) => {
    const rankDiff = getSeverityRank(b.severityLevel) - getSeverityRank(a.severityLevel);
    if (rankDiff !== 0) return rankDiff;
    const timeA = new Date(a.startTime || a.createdAt).getTime();
    const timeB = new Date(b.startTime || b.createdAt).getTime();
    return timeB - timeA;
  });
  
  const renderableAlerts = sortedAlerts.slice(0, 300);
  
  return { validAlerts, renderableAlerts };
};

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
          zIndex: 1000 + count
        });
      }
    };

    clustererRef.current = new MarkerClusterer({
      map,
      algorithm: new SuperClusterAlgorithm({ radius: 100 }),
      renderer: customRenderer
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
    if (
      map &&
      selectedShelter &&
      selectedShelter.latitude != null &&
      selectedShelter.longitude != null
    ) {
      map.panTo({
        lat: Number(selectedShelter.latitude),
        lng: Number(selectedShelter.longitude)
      });

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

const getRadiusFromSeverity = (severityLevel) => {
  switch (severityLevel) {
    case 'CRITICAL':
      return 700;
    case 'HIGH':
      return 500;
    case 'MEDIUM':
      return 350;
    case 'LOW':
      return 200;
    default:
      return 350;
  }
};

const AlertDangerCircle = ({ lat, lng, radius }) => {
  const map = useMap();
  const circleRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    if (!circleRef.current) {
      circleRef.current = new window.google.maps.Circle({
        strokeColor: '#ef4444',
        strokeOpacity: 0.85,
        strokeWeight: 2,
        fillColor: '#ef4444',
        fillOpacity: 0.18
      });
    }

    circleRef.current.setMap(map);
    circleRef.current.setCenter({ lat, lng });
    circleRef.current.setRadius(radius);

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
      }
    };
  }, [map, lat, lng, radius]);

  return null;
};

const MapDirectionsRenderer = ({ originLat, originLng, destLat, destLng }) => {
  const map = useMap();
  const rendererRef = useRef(null);

  useEffect(() => {
    if (!map || !originLat || !originLng || !destLat || !destLng) {
      if (rendererRef.current) {
        rendererRef.current.setMap(null);
        rendererRef.current = null;
      }
      return;
    }

    if (!rendererRef.current) {
      rendererRef.current = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: false,
        preserveViewport: false,
        polylineOptions: {
          strokeColor: '#2563eb',
          strokeWeight: 6,
          strokeOpacity: 0.7
        }
      });
    } else {
      rendererRef.current.setMap(map);
    }

    const ds = new window.google.maps.DirectionsService();
    ds.route(
      {
        origin: { lat: originLat, lng: originLng },
        destination: { lat: destLat, lng: destLng },
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (res, status) => {
        if (status === 'OK' && rendererRef.current) {
          rendererRef.current.setDirections(res);
        } else {
          console.error("Directions request failed:", status);
        }
      }
    );

    return () => {
      if (rendererRef.current) {
        rendererRef.current.setMap(null);
      }
    };
  }, [map, originLat, originLng, destLat, destLng]);

  return null;
};

const MapHandler = ({ selectedItem, selectedItemType, searchTarget, onElementSelect }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedItem && selectedItemType && map) {
      const lat = Number(selectedItem.latitude);
      const lng = Number(selectedItem.longitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        // Use timeout to ensure map is ready and markers are rendered
        const timer = setTimeout(() => {
          map.panTo({ lat, lng });
          map.setZoom(16);
          
          onElementSelect({
            ...selectedItem,
            elementType: selectedItemType
          });
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedItem, selectedItemType, map, onElementSelect]);

  useEffect(() => {
    if (!searchTarget || !map) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchTarget }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const loc = results[0].geometry.location;
        map.panTo(loc);
        map.setZoom(15);
      } else {
        alert('Không tìm thấy địa điểm: ' + searchTarget);
      }
    });
  }, [searchTarget, map]);

  return null;
};

const MapView = ({
  shelters = [],
  alerts = [],
  requests = [],
  selectedItem = null,
  selectedItemType = null,
  selectedShelter = null,
  initialRoutingDestination = null,
  externalMyLocation = null,
  searchTarget = null
}) => {
  const { mapViewState, updateMapViewState } = useMapState();
  const [initialCenter, setInitialCenter] = useState(mapViewState.center || null);
  const [myLocation, setMyLocation] = useState(externalMyLocation);
  const [selectedElement, setSelectedElement] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(mapViewState.zoom || 13);
  const [mapBounds, setMapBounds] = useState(null);
  const [routingDestination, setRoutingDestination] = useState(initialRoutingDestination || null);

  useEffect(() => {
    if (externalMyLocation) {
      setMyLocation(externalMyLocation);
      if (!initialCenter) setInitialCenter(externalMyLocation);
    }
  }, [externalMyLocation, initialCenter]);

  useEffect(() => {
    if (initialRoutingDestination) {
      setRoutingDestination(initialRoutingDestination);
    }
  }, [initialRoutingDestination]);

  useEffect(() => {
    if (myLocation || !navigator.geolocation) {
      if (!initialCenter) setInitialCenter(FALLBACK_LOCATION);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setMyLocation(loc);
        if (!initialCenter) setInitialCenter(loc);
      },
      () => {
        console.warn('Không lấy được vị trí, dùng cached hoặc mặc định.');
        if (!initialCenter) setInitialCenter(mapViewState.center || FALLBACK_LOCATION);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [myLocation, mapViewState.center, initialCenter]);

  const handleMarkerClick = (element, type) => {
    setSelectedElement({
      ...element,
      elementType: type
    });
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
      pin: (
        <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: '#10B981',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '18px',
              border: '3px solid #fff',
              boxShadow: '0 4px 12px rgba(57, 199, 83, 0.5)'
            }}
          >
          +
        </div>
      )
    }));
}, [shelters]);

  const alertMarkers = useMemo(() => {
    const { renderableAlerts } = getRenderableAlerts(alerts, mapBounds);
    
    return renderableAlerts.map((a) => ({
        key: `a-${a.id}`,
        lat: Number(a.latitude),
        lng: Number(a.longitude),
        data: a,
        type: 'ALERT',
        pin: (
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: '#ef4444',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '18px',
              border: '3px solid #fff',
              boxShadow: '0 4px 12px rgba(239,68,68,0.5)'
            }}
          >
            !
          </div>
        )
      }));
  }, [alerts, mapBounds]);

  const requestMarkers = useMemo(() => {
    return requests
      .filter((r) => r.latitude != null && r.longitude != null)
      .map((r) => ({
        key: `r-${r.id}`,
        lat: Number(r.latitude),
        lng: Number(r.longitude),
        data: r,
        type: 'REQUEST',
        pin: (
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: '#F59E0B',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '18px',
              border: '3px solid #fff',
              boxShadow: '0 4px 12px rgba(245,158,11,0.5)'
            }}
          >
            SOS
          </div>
        )
      }));
  }, [requests]);

  useEffect(() => {
    if (alerts.length > 0 || shelters.length > 0 || requests.length > 0) {
      console.log("Map data updated:", { alerts: alerts.length, shelters: shelters.length, requests: requests.length });
    }
  }, [alerts, shelters, requests]);

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
          height: '100%',
          width: '100%',
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
        height: '100%',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      <Map
          style={{ width: '100%', height: '100%' }}
          defaultZoom={13}
          defaultCenter={initialCenter}
          mapId="DEMO_MAP_ID"
          gestureHandling="greedy"
          disableDefaultUI={false}
          onCameraChanged={(ev) => {
            setCurrentZoom(ev.detail.zoom);
            // Persist camera state to context
            updateMapViewState({
              center: ev.detail.center,
              zoom: ev.detail.zoom
            });
          }}
          onBoundsChanged={(ev) => {
            setMapBounds(ev.detail.bounds);
          }}
        >
          <MapHandler 
            selectedItem={selectedItem} 
            selectedItemType={selectedItemType} 
            searchTarget={searchTarget}
            onElementSelect={setSelectedElement} 
          />

          <ClusteredMarkers
            key={`shelter-cluster-${shelterMarkers.length}`}
            markers={shelterMarkers}
            onMarkerClick={handleMarkerClick}
          />

          {alertMarkers.map((marker) => (
            <AdvancedMarker
              key={marker.key}
              position={{ lat: marker.lat, lng: marker.lng }}
              onClick={() => handleMarkerClick(marker.data, marker.type)}
            >
              {marker.pin}
            </AdvancedMarker>
          ))}

          {requestMarkers.map((marker) => (
            <AdvancedMarker
              key={marker.key}
              position={{ lat: marker.lat, lng: marker.lng }}
              onClick={() => handleMarkerClick(marker.data, marker.type)}
            >
              {marker.pin}
            </AdvancedMarker>
          ))}

          {currentZoom >= 14 &&
            alertMarkers.map((marker) => (
              <AlertDangerCircle
                key={`danger-zone-${marker.key}`}
                lat={marker.lat}
                lng={marker.lng}
                radius={getRadiusFromSeverity(marker.data.severityLevel)}
              />
            ))}

          <MapDirectionsRenderer
            originLat={myLocation?.lat}
            originLng={myLocation?.lng}
            destLat={routingDestination?.lat}
            destLng={routingDestination?.lng}
          />

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

          <ShelterPanner
            selectedShelter={selectedShelter}
            onSelected={setSelectedElement}
          />

          {selectedElement && infoPosition && (
            <InfoWindow
              position={infoPosition}
              onCloseClick={() => setSelectedElement(null)}
            >
              <div
                style={{
                  padding: '4px',
                  maxWidth: '220px',
                  lineHeight: 1.5
                }}
              >
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

                    {routingDestination && routingDestination.lat === Number(selectedElement.latitude) ? (
                      <button
                        onClick={() => setRoutingDestination(null)}
                        style={{
                          display: 'block',
                          marginTop: '10px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          width: '100%',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        Huỷ lộ trình
                      </button>
                    ) : (
                      <button
                        onClick={() => setRoutingDestination({ lat: Number(selectedElement.latitude), lng: Number(selectedElement.longitude) })}
                        style={{
                          display: 'block',
                          marginTop: '10px',
                          background: '#103ab9ff',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          width: '100%',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        Đường đi
                      </button>
                    )}
                  </div>
                )}

                {selectedElement.elementType === 'ALERT' && (
                  <div>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ 
                            fontSize: '10px', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            background: selectedElement.source === 'WEATHER' ? '#ef4444' : '#4B5563', 
                            color: 'white',
                            fontWeight: 'bold'
                        }}>
                            {selectedElement.source === 'WEATHER' ? 'NGUY CƠ THỜI TIẾT' : 'XÁC MINH HIỆN TRƯỜNG'}
                        </span>
                        <span style={{ 
                            fontSize: '10px', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            background: selectedElement.severityLevel === 'CRITICAL' ? '#EF4444' : '#F59E0B', 
                            color: 'white',
                            fontWeight: 'bold'
                        }}>
                            {selectedElement.severityLevel}
                        </span>
                    </div>
                    <strong style={{ color: '#EF4444', display: 'block', marginBottom: '4px' }}>
                      {selectedElement.title}
                    </strong>
                    {selectedElement.provinceName && (
                        <div style={{ fontSize: '11px', color: '#4B5563', fontWeight: 'bold', marginBottom: '2px' }}>
                            Khu vực: {selectedElement.provinceName}
                        </div>
                    )}
                    <div style={{ fontSize: '12px', marginBottom: '6px' }}>
                        {selectedElement.description}
                    </div>
                    {selectedElement.endTime && (
                        <div style={{ fontSize: '10px', color: '#6B7280', borderTop: '1px solid #E5E7EB', paddingTop: '4px' }}>
                            Hiệu lực đến: {new Date(selectedElement.endTime).toLocaleString('vi-VN')}
                        </div>
                    )}
                  </div>
                )}

                {selectedElement.elementType === 'REQUEST' && (
                  <div>
                    <strong style={{ color: '#F59E0B' }}>
                      YÊU CẦU: {selectedElement.requestType}
                    </strong>
                    <br />
                    Số người: {selectedElement.numberOfPeople}
                    <br />
                    {selectedElement.description}
                    
                    {routingDestination && routingDestination.lat === Number(selectedElement.latitude) ? (
                      <button
                        onClick={() => setRoutingDestination(null)}
                        style={{
                          display: 'block',
                          marginTop: '10px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          width: '100%',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        Huỷ lộ trình
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (!myLocation) {
                            alert("Không thể xác định vị trí của bạn để chỉ đường. Vui lòng kiểm tra quyền truy cập vị trí.");
                            return;
                          }
                          setRoutingDestination({ lat: Number(selectedElement.latitude), lng: Number(selectedElement.longitude) });
                        }}
                        style={{
                          display: 'block',
                          marginTop: '10px',
                          background: '#EA580C',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          width: '100%',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        Đường đi
                      </button>
                    )}
                  </div>
                )}
              </div>
            </InfoWindow>
          )}
        </Map>
    </div>
  );
};

export default MapView;