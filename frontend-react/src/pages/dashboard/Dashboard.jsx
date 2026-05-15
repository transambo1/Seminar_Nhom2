import React, { useState, useEffect } from "react";
import {
  Siren,
  TriangleAlert,
  House,
  X,
  Minimize2,
  ClipboardList
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import '../../styles/CitizenDashboard.css';
import MapView from "../../components/map/MapView";
import { getActiveAlertsApi } from "../../api/alertApi";
import { getSheltersApi } from "../../api/shelterApi";
import { getAllSupportsApi } from "../../api/supportApi";
import { getMyNotificationsApi, getUnreadCountApi } from "../../api/notificationApi";
import SupportRequestForm from "../../components/support/SupportRequestForm";
import IncidentReportForm from "../../components/incident/IncidentReportForm";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import { useMapState } from "../../context/MapContext";

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    alerts, shelters, requests, updateMapData, isDataFresh
  } = useMapState();

  const [collapsed, setCollapsed] = useState(false);
  const [infoPanelOpen, setInfoPanelOpen] = useState(true);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchTarget, setSearchTarget] = useState(null);
  const [notis, setNotis] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Local Focus State (transient, not persisted in Context to avoid auto-focus on return)
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState(null);

  // Layer Visibility State
  const [showAlerts, setShowAlerts] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showRequests, setShowRequests] = useState(true);
  
  // User Location
  const [myLocation, setMyLocation] = useState(null);
  const [locStatus, setLocStatus] = useState('loading'); // 'loading', 'ok', 'denied'

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371e3; 
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleFocusItem = (item, type) => {
    if (!item || item.latitude == null || item.longitude == null) {
      alert("Mục này không có thông tin vị trí chính xác.");
      return;
    }
    setSelectedItem({ ...item, _focusTs: Date.now() });
    setSelectedItemType(type);
    
    // Auto-open info panel if focused
    setInfoPanelOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchTasks = [];
        if (!isDataFresh('alerts')) fetchTasks.push(getActiveAlertsApi().then(res => updateMapData('alerts', res.data)));
        if (!isDataFresh('shelters')) fetchTasks.push(getSheltersApi().then(res => updateMapData('shelters', res.data)));
        if (!isDataFresh('requests')) fetchTasks.push(getAllSupportsApi().then(res => updateMapData('requests', res.data)));
        
        fetchTasks.push(user.id ? getMyNotificationsApi(user.id).then(res => setNotis(res.data || [])) : Promise.resolve());
        fetchTasks.push(user.id ? getUnreadCountApi(user.id).then(res => setUnreadCount(typeof res.data === 'object' ? res.data.unreadCount : (res.data || 0))) : Promise.resolve());

        await Promise.all(fetchTasks);
        
        // Handle target from state AFTER data is loaded to ensure marker exists
        if (location.state?.targetRequest) {
          const type = location.state.targetType || 'REQUEST';
          handleFocusItem(location.state.targetRequest, type);
          // Clear state to prevent re-focus on refresh
          window.history.replaceState({}, document.title);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchData();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocStatus('ok');
        },
        () => setLocStatus('denied')
      );
    } else {
      setLocStatus('denied');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, location.state]);

  const getNearbyItems = (items) => {
    if (!myLocation) return [];
    return items
      .map(item => ({
        ...item,
        distance: calculateDistance(myLocation.lat, myLocation.lng, Number(item.latitude), Number(item.longitude))
      }))
      .filter(item => item.distance <= 20000) 
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
  };

  const nearbyAlerts = getNearbyItems(alerts);
  const nearbyRequests = getNearbyItems(requests);
  const nearbyShelters = getNearbyItems(shelters);

  const mapLayers = [
    { key: "alerts", label: "Cảnh báo", visible: showAlerts, color: "#EF4444" },
    { key: "shelters", label: "Nơi trú ẩn", visible: showShelters, color: "#10B981" },
    { key: "requests", label: "Yêu cầu SOS", visible: showRequests, color: "#F59E0B" }
  ];

  const toggleLayer = (key) => {
    if (key === "alerts") setShowAlerts(!showAlerts);
    if (key === "shelters") setShowShelters(!showShelters);
    if (key === "requests") setShowRequests(!showRequests);
  };

  return (
    <div className="storm-page">
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        mapLayers={mapLayers} 
        onToggleLayer={toggleLayer} 
      />

      <main className="storm-main">
        <Topbar 
          title="Bản đồ khẩn cấp" 
          user={user} 
          notis={notis} 
          unreadCount={unreadCount} 
          onToggleSidebar={() => setCollapsed(!collapsed)} 
        />

        <section className="map-shell">
          <div className="map-top-controls">
            <div className="map-search">
              <input 
                placeholder="Tìm địa điểm, địa chỉ..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchInput.trim() && setSearchTarget(searchInput)}
              />
            </div>

            <div className="map-actions">
              <button className="map-action sos" onClick={() => setIsSupportModalOpen(true)}>
                <Siren size={18} color="#EA580C" />
                <span>Gửi yêu cầu</span>
              </button>
              <button className="map-action warning" onClick={() => setIsIncidentModalOpen(true)}>
                <TriangleAlert size={18} color="#EF4444" />
                <span>Gửi cảnh báo</span>
              </button>
            </div>
          </div>

          <div className="real-map-container">
            <MapView 
              alerts={showAlerts ? alerts : []}
              shelters={showShelters ? shelters : []}
              requests={showRequests ? requests : []}
              selectedItem={selectedItem}
              selectedItemType={selectedItemType}
              externalMyLocation={myLocation}
              searchTarget={searchTarget}
            />

            {infoPanelOpen ? (
              <aside className="nearby-panel">
                <div className="panel-header">
                  <h3>Thông tin gần bạn</h3>
                  <div>
                    <button><Minimize2 size={17} /></button>
                    <button onClick={() => setInfoPanelOpen(false)}><X size={18} /></button>
                  </div>
                </div>

                <div className="nearby-list">
                  {locStatus === 'denied' ? (
                    <p className="no-data">Chưa xác định được vị trí</p>
                  ) : (
                    <>
                      <div className="nearby-section">
                        <h4 className="section-title">Cảnh báo gần bạn</h4>
                        {nearbyAlerts.length > 0 ? nearbyAlerts.map(item => (
                          <div key={`alert-${item.id}`} className="nearby-item">
                             <div className="nearby-icon warning" style={{ background: '#EF4444' }}>
                                <TriangleAlert size={19} />
                            </div>
                            <div className="nearby-content">
                                <strong>{item.title}</strong>
                                <span style={{ color: '#EF4444', fontWeight: 'bold' }}>
                                    {item.source === 'WEATHER' ? 'NGUY CƠ THIÊN TAI' : item.severityLevel}
                                </span>
                            </div>
                            <button className="item-focus-btn" onClick={() => handleFocusItem(item, 'ALERT')}>Xem</button>
                          </div>
                        )) : <p className="no-data">Không có dữ liệu (20km)</p>}
                      </div>
                      <div className="nearby-section">
                        <h4 className="section-title">Yêu cầu SOS gần bạn</h4>
                        {nearbyRequests.length > 0 ? nearbyRequests.map(item => (
                          <div key={`req-${item.id}`} className="nearby-item">
                            <div className="nearby-icon sos" style={{ background: '#EA580C' }}>SOS</div>
                            <div className="nearby-content"><strong>{item.requestType}</strong><span>{item.status}</span></div>
                            <button className="item-focus-btn" onClick={() => handleFocusItem(item, 'REQUEST')}>Xem</button>
                          </div>
                        )) : <p className="no-data">Không có dữ liệu (20km)</p>}
                      </div>
                      <div className="nearby-section">
                        <h4 className="section-title">Nơi trú ẩn gần bạn</h4>
                        {nearbyShelters.length > 0 ? nearbyShelters.map(item => (
                          <div key={`shelter-${item.id}`} className="nearby-item">
                            <div className="nearby-icon shelter" style={{ background: '#16A34A' }}><House size={18} /></div>
                            <div className="nearby-content"><strong>{item.name}</strong><span>{item.address}</span></div>
                            <button className="item-focus-btn" onClick={() => handleFocusItem(item, 'SHELTER')}>Xem</button>
                          </div>
                        )) : <p className="no-data">Không có dữ liệu (20km)</p>}
                      </div>
                    </>
                  )}
                </div>
              </aside>
            ) : (
              <button className="nearby-reopen-btn" onClick={() => setInfoPanelOpen(true)}>
                <ClipboardList size={20} />
                <span>Thông tin gần bạn</span>
              </button>
            )}

            <div className="map-legend">
              <div><span className="dot sos" style={{ background: '#EA580C' }} />Yêu cầu SOS</div>
              <div><span className="dot warning" style={{ background: '#EF4444' }} />Cảnh báo</div>
              <div><span className="dot shelter" style={{ background: '#10B981' }} />Nơi trú ẩn</div>
            </div>
          </div>
        </section>
      </main>
      
      {isSupportModalOpen && (
        <div className="storm-modal-overlay" onClick={() => setIsSupportModalOpen(false)}>
          <div className="storm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Gửi yêu cầu cứu trợ</h2><button className="modal-close-btn" onClick={() => setIsSupportModalOpen(false)}><X size={20} /></button></div>
            <div className="modal-body"><SupportRequestForm onSuccess={() => setIsSupportModalOpen(false)} /></div>
          </div>
        </div>
      )}
      {isIncidentModalOpen && (
        <div className="storm-modal-overlay" onClick={() => setIsIncidentModalOpen(false)}>
          <div className="storm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2 style={{ color: '#EF4444' }}>Báo cáo sự cố khẩn cấp</h2><button className="modal-close-btn" onClick={() => setIsIncidentModalOpen(false)}><X size={20} /></button></div>
            <div className="modal-body"><IncidentReportForm onSuccess={() => setIsIncidentModalOpen(false)} /></div>
          </div>
        </div>
      )}
    </div>
  );
}