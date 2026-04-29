import React, { useState, useEffect } from "react";
import {
  Home,
  Bell,
  ClipboardList,
  FileWarning,
  LifeBuoy,
  Menu,
  Shield,
  Search,
  MapPin,
  Siren,
  TriangleAlert,
  House,
  Route,
  User,
  LogOut,
  ChevronDown,
  X,
  Minimize2,
  Eye,
  EyeOff
} from "lucide-react";
import '../../styles/CitizenDashboard.css';
import MapView from "../../components/map/MapView";
import { getActiveAlertsApi } from "../../api/alertApi";
import { getSheltersApi } from "../../api/shelterApi";
import { getAllSupportsApi } from "../../api/supportApi";

const menuItems = [
  {
    key: "home",
    label: "Trang chủ",
    icon: Home,
  },
  {
    key: "support",
    label: "Yêu cầu cứu trợ",
    icon: LifeBuoy,
  },
  {
    key: "report",
    label: "Báo cáo sự cố",
    icon: FileWarning,
  },
  {
    key: "my-requests",
    label: "Yêu cầu của tôi",
    icon: ClipboardList,
  },
  {
    key: "notifications",
    label: "Thông báo",
    icon: Bell,
  },
];

export default function CitizenDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [infoPanelOpen, setInfoPanelOpen] = useState(true);
  
  // Map Data State
  const [alerts, setAlerts] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [requests, setRequests] = useState([]);
  
  // Layer Visibility State
  const [showAlerts, setShowAlerts] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showRequests, setShowRequests] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      console.log("Dashboard: Starting data fetch...");
      try {
        const [alertRes, shelterRes, supportRes] = await Promise.all([
          getActiveAlertsApi(),
          getSheltersApi(),
          getAllSupportsApi()
        ]);
        
        console.log("Dashboard: Data fetched successfully", {
          alerts: alertRes.data?.length || 0,
          shelters: shelterRes.data?.length || 0,
          requests: supportRes.data?.length || 0
        });

        setAlerts(alertRes.data || []);
        setShelters(shelterRes.data || []);
        setRequests(supportRes.data || []);
      } catch (error) {
        console.error("Dashboard: Failed to fetch data:", error);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="storm-page">
      <aside className={`storm-sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Shield size={24} />
          </div>

          {!collapsed && (
            <div className="brand-text">
              <strong>StormShield</strong>
              <span>Hệ thống cứu hộ cộng đồng</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = item.key === "home";

            return (
              <button
                key={item.key}
                className={`sidebar-item ${active ? "active" : ""}`}
                title={collapsed ? item.label : ""}
              >
                <Icon size={22} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
          
          <div style={{ marginTop: '24px', padding: '0 16px' }}>
             {!collapsed && <h4 style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Lớp bản đồ</h4>}
             
             <button 
                onClick={() => setShowAlerts(!showAlerts)}
                className={`sidebar-item ${showAlerts ? "" : "inactive"}`}
                style={{ opacity: showAlerts ? 1 : 0.5 }}
                title={collapsed ? "Cảnh báo" : ""}
              >
                {showAlerts ? <Eye size={20} /> : <EyeOff size={20} />}
                {!collapsed && <span>Cảnh báo</span>}
             </button>

             <button 
                onClick={() => setShowShelters(!showShelters)}
                className={`sidebar-item ${showShelters ? "" : "inactive"}`}
                style={{ opacity: showShelters ? 1 : 0.5 }}
                title={collapsed ? "Nơi trú ẩn" : ""}
              >
                {showShelters ? <Eye size={20} /> : <EyeOff size={20} />}
                {!collapsed && <span>Nơi trú ẩn</span>}
             </button>

             <button 
                onClick={() => setShowRequests(!showRequests)}
                className={`sidebar-item ${showRequests ? "" : "inactive"}`}
                style={{ opacity: showRequests ? 1 : 0.5 }}
                title={collapsed ? "Yêu cầu SOS" : ""}
              >
                {showRequests ? <Eye size={20} /> : <EyeOff size={20} />}
                {!collapsed && <span>Yêu cầu SOS</span>}
             </button>
          </div>
        </nav>

        <button
          className="sidebar-collapse"
          onClick={() => setCollapsed((prev) => !prev)}
          title={collapsed ? "Mở menu" : "Thu gọn menu"}
        >
          <Menu size={22} />
          {!collapsed && <span>Thu gọn</span>}
        </button>
      </aside>

      <main className="storm-main">
        <header className="storm-header">
          <div className="header-left">
            <button
              className="icon-btn mobile-menu-btn"
              onClick={() => setCollapsed((prev) => !prev)}
            >
              <Menu size={22} />
            </button>

            <div>
              <h1>Bản đồ khẩn cấp</h1>
              <p>Theo dõi cứu trợ, sự cố và shelter quanh bạn</p>
            </div>
          </div>

          <div className="header-right">
            <button className="notification-btn">
              <Bell size={22} />
              <span>3</span>
            </button>

            <div className="user-box">
              <div className="avatar">
                <User size={20} />
              </div>

              <div className="user-info">
                <strong>{user.fullName || "Người dùng"}</strong>
                <span>{user.role === "CITIZEN" ? "Công dân" : user.role || "Thành viên"}</span>
              </div>

              <ChevronDown size={18} />
            </div>

            <button className="logout-btn" onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>
              <LogOut size={22} />
            </button>
          </div>
        </header>

        <section className="map-shell">
          <div className="map-top-controls">
            <div className="map-search">
              <Search size={20} />
              <input placeholder="Tìm địa điểm, địa chỉ..." />
            </div>

            <button className="nearby-filter">
              <MapPin size={19} />
              <span>Gần tôi</span>
              <ChevronDown size={16} />
            </button>

            <div className="map-actions">
              <button className="map-action sos">
                <Siren size={18} />
                <span>Yêu cầu cứu trợ</span>
              </button>

              <button className="map-action warning">
                <TriangleAlert size={18} />
                <span>Báo cáo sự cố</span>
              </button>

              <button className="map-action shelter">
                <House size={18} />
                <span>Shelter gần nhất</span>
              </button>

              <button className="map-action route">
                <Route size={18} />
                <span>Đường đi an toàn</span>
              </button>
            </div>
          </div>

          <div className="real-map-container" style={{ position: 'relative', height: 'calc(100vh - 132px)', minHeight: '620px', overflow: 'hidden', borderRadius: '16px', boxShadow: '0 18px 50px rgba(15, 23, 42, 0.12)', border: '1px solid #dbe2ea' }}>
            <MapView 
              alerts={showAlerts ? alerts : []}
              shelters={showShelters ? shelters : []}
              requests={showRequests ? requests : []}
            />

            {infoPanelOpen && (
              <aside className="nearby-panel">
                <div className="panel-header">
                  <h3>Thông tin gần bạn</h3>

                  <div>
                    <button>
                      <Minimize2 size={17} />
                    </button>
                    <button onClick={() => setInfoPanelOpen(false)}>
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="nearby-list">
                  {/* Show active alerts in the sidebar list if visible */}
                  {showAlerts && alerts.slice(0, 3).map((item) => (
                    <div key={`alert-${item.id}`} className="nearby-item">
                      <div className="nearby-icon warning">
                        <TriangleAlert size={19} />
                      </div>
                      <div className="nearby-content">
                        <strong>{item.title}</strong>
                        <span>{item.severityLevel}</span>
                      </div>
                    </div>
                  ))}

                  {/* Show support requests in the sidebar list if visible */}
                  {showRequests && requests.slice(0, 2).map((item) => (
                    <div key={`req-${item.id}`} className="nearby-item">
                      <div className="nearby-icon sos">
                        SOS
                      </div>
                      <div className="nearby-content">
                        <strong>Yêu cầu cứu trợ</strong>
                        <span>{item.requestType} • {item.status}</span>
                      </div>
                    </div>
                  ))}

                  {/* Show shelters in the sidebar list if visible */}
                  {showShelters && shelters.slice(0, 2).map((item) => (
                    <div key={`shelter-${item.id}`} className="nearby-item">
                      <div className="nearby-icon shelter">
                        <House size={18} />
                      </div>
                      <div className="nearby-content">
                        <strong>{item.name}</strong>
                        <span>{item.address}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="view-all-btn">Xem tất cả</button>
              </aside>
            )}

            <div className="map-legend">
              <div>
                <span className="dot sos" />
                Yêu cầu cứu trợ
              </div>

              <div>
                <span className="dot warning" />
                Sự cố
              </div>

              <div>
                <span className="dot shelter" />
                Shelter
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}