import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import StormShieldMap from '../components/StormShieldMap';
import { ShelterCard } from '../components/Cards';
import { getSheltersApi, getActiveAlertsApi } from '../api/apiServices';

const Dashboard = () => {
  const location = useLocation();

  const [shelters, setShelters] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [userLoc, setUserLoc] = useState({ lat: 10.8231, lng: 106.6297 });

  useEffect(() => {
    getSheltersApi()
      .then((res) => setShelters(res.data || []))
      .catch(console.error);

    getActiveAlertsApi()
      .then((res) => setAlerts(res.data || []))
      .catch(console.error);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserLoc({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }),
        (err) => console.warn('Dashboard Geo fallback:', err)
      );
    }
  }, []);

  const nearestShelters = useMemo(() => {
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const available = shelters.filter(
      (s) =>
        s.status === 'AVAILABLE' &&
        s.latitude != null &&
        s.longitude != null
    );

    const withDistance = available.map((s) => ({
      ...s,
      distance: calculateDistance(
        userLoc.lat,
        userLoc.lng,
        s.latitude,
        s.longitude
      )
    }));

    return withDistance.sort((a, b) => a.distance - b.distance).slice(0, 3);
  }, [shelters, userLoc]);

  const activeAlertText =
    alerts?.[0]?.message ||
    alerts?.[0]?.title ||
    'Cảnh báo: Mực nước sông đang dâng cao tại khu vực Quận 7';

  return (
    <>
      <style>{`
        body {
          margin: 0;
          overflow: hidden;
          background: #f3f6fb;
        }

        .dashboard-full-layout {
          display: flex;
          height: calc(100vh - 72px);
          background: #f3f6fb;
        }

        .dashboard-sidebar {
          width: 408px;
          min-width: 408px;
          background: #e9eef7;
          border-right: 1px solid #dbe3f0;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .dashboard-sidebar-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 28px 26px 28px;
        }

        .dashboard-map-area {
          flex: 1;
          position: relative;
          background: #f4f1eb;
        }

        .dashboard-map-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .dashboard-map-wrapper > div {
          height: 100% !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }

        .dashboard-title {
          font-size: 3rem;
          line-height: 1.08;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.03em;
          margin: 0 0 14px;
        }

        .dashboard-subtitle {
          font-size: 1rem;
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 28px;
        }

        .dashboard-action-btn {
          width: 100%;
          border-radius: 16px;
          min-height: 62px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          text-decoration: none;
          font-weight: 700;
          font-size: 1.05rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
        }

        .dashboard-action-btn:hover {
          transform: translateY(-1px);
        }

        .dashboard-action-danger {
          background: #c91420;
          color: white;
          margin-bottom: 16px;
        }

        .dashboard-action-warning {
          background: #facc15;
          color: #111827;
          margin-bottom: 26px;
        }

        .dashboard-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 26px;
        }

        .dashboard-stat-card {
          background: white;
          border: 1px solid #cfd8e6;
          border-radius: 16px;
          padding: 18px 18px 16px;
          min-height: 86px;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
        }

        .dashboard-stat-label {
          font-size: 0.9rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #4b5563;
          margin-bottom: 10px;
        }

        .dashboard-stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #2563eb;
          line-height: 1;
        }

        .dashboard-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .dashboard-section-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .dashboard-section-link {
          font-size: 0.95rem;
          color: #2563eb;
          text-decoration: none;
          font-weight: 700;
        }

        .dashboard-shelter-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-bottom: 16px;
        }

        .dashboard-map-alert {
          position: absolute;
          top: 18px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          min-width: 500px;
          max-width: 70%;
          background: #fde8e8;
          border: 1px solid #f5b5b5;
          color: #b91c1c;
          border-radius: 999px;
          padding: 18px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          box-shadow: 0 12px 30px rgba(220, 38, 38, 0.12);
        }

        .dashboard-map-alert-left {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 700;
          font-size: 1rem;
        }

        .dashboard-map-alert-close {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: #dc2626;
          font-size: 1.2rem;
          cursor: pointer;
        }

        .dashboard-empty-card {
          text-align: center;
          padding: 28px 20px;
          color: #94a3b8;
          background: white;
          border-radius: 16px;
          border: 1px dashed #cbd5e1;
        }

        @media (max-width: 1200px) {
          .dashboard-sidebar {
            width: 360px;
            min-width: 360px;
          }

          .dashboard-title {
            font-size: 2.4rem;
          }
        }
      `}</style>

      <div className="dashboard-full-layout">
        <aside className="dashboard-sidebar">
          <div className="dashboard-sidebar-scroll">
            

          

            <Link
              to="/request-support"
              className="dashboard-action-btn dashboard-action-danger"
            >
              <span style={{ fontSize: '1.25rem' }}>✱</span>
              <span>Yêu cầu hỗ trợ khẩn cấp</span>
            </Link>

            <Link
              to="/report-alert"
              className="dashboard-action-btn dashboard-action-warning"
            >
              <span style={{ fontSize: '1.15rem' }}>⚠</span>
              <span>Gửi cảnh báo</span>
            </Link>

            

            <div className="dashboard-section-head">
              <h3 className="dashboard-section-title">Điểm trú ẩn gần bạn nhất</h3>
              
            </div>

            <div className="dashboard-shelter-list">
              {nearestShelters.map((s) => (
                <ShelterCard
                  key={s.id}
                  shelter={s}
                  onClick={() => setSelectedShelter(s)}
                  isSelected={selectedShelter?.id === s.id}
                  distance={s.distance}
                />
              ))}

              {nearestShelters.length === 0 && (
                <div className="dashboard-empty-card">
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>
                    Chưa có dữ liệu điểm trú ẩn khả dụng.
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        <section className="dashboard-map-area">
          <div className="dashboard-map-alert">
            <div className="dashboard-map-alert-left">
              <span style={{ fontSize: '1.3rem' }}>⚠</span>
              <span>{activeAlertText}</span>
            </div>
            <button className="dashboard-map-alert-close">×</button>
          </div>

          <div className="dashboard-map-wrapper">
            <StormShieldMap
              shelters={shelters}
              alerts={alerts}
              selectedShelter={selectedShelter}
              initialRoutingDestination={location.state?.routeToDest}
            />
          </div>
        </section>
      </div>
    </>
  );
};

export default Dashboard;