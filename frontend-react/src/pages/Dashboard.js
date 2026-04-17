import React, {useEffect, useState, useMemo} from 'react';
import StormShieldMap from '../components/StormShieldMap';
import { ShelterCard } from '../components/Cards';
import { getSheltersApi, getApprovedReportsApi, getActiveAlertsApi } from '../api/apiServices';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [shelters, setShelters] = useState([]);
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [userLoc, setUserLoc] = useState({ lat: 10.8231, lng: 106.6297 }); // HCM Fallback

  useEffect(() => {
    getSheltersApi().then(res => setShelters(res.data)).catch(console.error);
    getApprovedReportsApi().then(res => setReports(res.data)).catch(console.error);
    getActiveAlertsApi().then(res => setAlerts(res.data)).catch(console.error);
    
    // Geolocation listener for Dashboard features
    navigator.geolocation.getCurrentPosition(
      pos => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => console.warn('Dashboard Geo fallback: ', err)
    );
  }, []);

  const nearestShelters = useMemo(() => {
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };
    
    const available = shelters.filter(s => s.status === 'AVAILABLE' && s.latitude && s.longitude);
    const withDist = available.map(s => ({
      ...s,
      distance: calculateDistance(userLoc.lat, userLoc.lng, s.latitude, s.longitude)
    }));
    return withDist.sort((a,b) => a.distance - b.distance).slice(0, 10);
  }, [shelters, userLoc]);

  return (
    <>
      <style>{`
        /* Override global container constraints specifically for the dashboard layout */
        body { margin: 0; overflow-x: hidden; }
        .dashboard-full-layout {
          display: flex;
          height: calc(100vh - 65px) !important; /* Account for Navbar */
          background-color: #f8fafc;
        }
        /* Target the StormShieldMap strictly via CSS override to make it full height without editing its file */
        .dashboard-map-wrapper > div {
          height: 100% !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }
        
        /* Pulse Animation for Critical Alerts */
        @keyframes alert-pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>

      <div className="dashboard-full-layout">
        
        {/* Left Sidebar Control Panel */}
        <div style={{
          width: '380px',
          minWidth: '380px',
          backgroundColor: '#ffffff',
          boxShadow: '4px 0 24px rgba(0,0,0,0.06)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}>
          
          {/* Dashboard Header Actions */}
          <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Bảng điều khiển StormShield
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <Link to="/report-hazard" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', borderColor: '#F59E0B', color: '#D97706' }}>
                <svg style={{width:'16px', marginRight:'6px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Báo cáo sự cố
              </Link>
              <Link to="/request-support" className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', padding: '12px' }}>
                <svg style={{width:'18px', marginRight:'8px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 3a3 3 0 100-6 3 3 0 000 6z" /></svg>
                Yêu cầu hỗ trợ khẩn cấp
              </Link>
            </div>
          </div>

          {/* Scrollable Data Area */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: '#f8fafc' }}>
            
            {/* Active Alert Banner */}
            {alerts.length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                color: 'white',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '24px',
                boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)',
                animation: 'alert-pulse 2s infinite',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em', opacity: 0.9, marginBottom: '4px' }}>
                  ⚠ CẢNH BÁO MỚI
                </div>
                <strong style={{ fontSize: '1.05rem', lineHeight: '1.4', display: 'block' }}>{alerts[0].title}</strong>
              </div>
            )}

            {/* Quick Shelters Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', color: '#334155', fontWeight: '700', margin: 0 }}>
                10 điểm trú ẩn gần bạn nhất
              </h3>
              <div style={{ background: '#e2e8f0', color: '#475569', padding: '2px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>
                {nearestShelters.length} điểm
              </div>
            </div>

            {/* Render Shelter Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '20px' }}>
              {nearestShelters.map(s => (
                <ShelterCard 
                  key={s.id} 
                  shelter={s} 
                  onClick={() => setSelectedShelter(s)}
                  isSelected={selectedShelter?.id === s.id}
                  distance={s.distance}
                />
              ))}
              
              {shelters.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px 20px', color: '#94a3b8', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>Đang nạp dữ liệu...</p>
                </div>
              )}
            </div>
            
          </div>
        </div>

        {/* Full View Map Area */}
        <div className="dashboard-map-wrapper" style={{ flex: 1, position: 'relative' }}>
          <StormShieldMap 
            shelters={shelters} 
            reports={reports} 
            alerts={alerts} 
            selectedShelter={selectedShelter} 
          />
        </div>

      </div>
    </>
  );
};

export default Dashboard;
