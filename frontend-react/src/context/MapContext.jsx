import React, { createContext, useContext, useState, useCallback } from 'react';

const MapContext = createContext();

const DATA_TTL = 5 * 60 * 1000; // 5 minutes

export const MapProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [requests, setRequests] = useState([]);
  const [lastFetched, setLastFetched] = useState({
    alerts: 0,
    shelters: 0,
    requests: 0
  });

  const [mapViewState, setMapViewState] = useState({
    center: { lat: 10.8231, lng: 106.6297 }, // Default center (TP.HCM)
    zoom: 13
  });

  const updateMapData = useCallback((type, data) => {
    if (type === 'alerts') setAlerts(data);
    if (type === 'shelters') setShelters(data);
    if (type === 'requests') setRequests(data);
    
    setLastFetched(prev => ({
      ...prev,
      [type]: Date.now()
    }));
  }, []);

  const isDataFresh = useCallback((type) => {
    return Date.now() - lastFetched[type] < DATA_TTL;
  }, [lastFetched]);

  const updateMapViewState = useCallback((newViewState) => {
    setMapViewState(prev => ({
      ...prev,
      ...newViewState
    }));
  }, []);

  const value = {
    alerts,
    shelters,
    requests,
    lastFetched,
    updateMapData,
    isDataFresh,
    mapViewState,
    updateMapViewState
  };

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

export const useMapState = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapState must be used within a MapProvider');
  }
  return context;
};
