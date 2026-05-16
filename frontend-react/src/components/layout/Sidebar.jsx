import React from 'react';
import { Shield, Home, ClipboardList, House, FileWarning, Menu, Eye, EyeOff, LayoutDashboard, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const citizenMenuItems = [
  {
    key: "home",
    label: "Trang chủ",
    icon: Home,
    path: "/dashboard"
  },
  {
    key: "requests",
    label: "Danh sách yêu cầu",
    icon: ClipboardList,
    path: "/request-list"
  },
  {
    key: "shelters",
    label: "Danh sách nơi trú ẩn",
    icon: House,
    path: "/shelters"
  },
  {
    key: "reports",
    label: "Báo cáo từ hiện trường",
    icon: FileWarning,
    path: "/incidents"
  },
];

const adminMenuItems = [
  {
    key: "admin-dashboard",
    label: "Tổng quan",
    icon: LayoutDashboard,
    path: "/admin/weather" // Tạm thời trỏ về weather cho đến khi có Dashboard admin riêng
  },
  {
    key: "admin-supports",
    label: "Yêu cầu cứu hộ",
    icon: Shield,
    path: "/admin/supports"
  },
  {
    key: "admin-incidents",
    label: "Báo cáo sự cố",
    icon: ClipboardList,
    path: "/admin/incidents"
  },
  {
    key: "admin-alerts",
    label: "Cảnh báo",
    icon: FileWarning,
    path: "/admin/alerts"
  },
  {
    key: "admin-shelters",
    label: "Nơi trú ẩn",
    icon: House,
    path: "/admin/shelters"
  },
  {
    key: "admin-rescue-teams",
    label: "Đội cứu hộ",
    icon: Users,
    path: "/admin/rescue-teams"
  },
  {
    key: "admin-weather",
    label: "Giám sát thời tiết",
    icon: Eye,
    path: "/admin/weather"
  },
];

const leaderMenuItems = [
  {
    key: "leader-home",
    label: "Trang chủ",
    icon: Home,
    path: "/dashboard"
  },
  {
    key: "leader-requests",
    label: "Danh sách nhiệm vụ",
    icon: Shield,
    path: "/leader/requests"
  },
  {
    key: "leader-team",
    label: "Đội của tôi",
    icon: Users,
    path: "/leader/team"
  },
  {
    key: "leader-notifications",
    label: "Thông báo",
    icon: FileWarning,
    path: "/notifications"
  }
];

export default function Sidebar({ collapsed, setCollapsed, mapLayers, onToggleLayer }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user role from localStorage
  const userStr = localStorage.getItem('user') || localStorage.getItem('currentUser');
  const user = userStr ? JSON.parse(userStr) : null;
  const userRole = user?.role || 'CITIZEN';

  let filteredMenuItems = citizenMenuItems;
  if (userRole === 'ADMIN') {
    filteredMenuItems = adminMenuItems;
  } else if (userRole === 'RESCUE_LEADER') {
    filteredMenuItems = leaderMenuItems;
  }

  return (
    <aside className={`storm-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Shield size={24} />
        </div>
        {!collapsed && (
          <div className="brand-text">
            <strong>StormShield</strong>              
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;

          return (
            <button
              key={item.key}
              className={`sidebar-item ${active ? "active" : ""}`}
              title={collapsed ? item.label : ""}
              onClick={() => navigate(item.path)}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
        
        {mapLayers && (
          <div style={{ marginTop: '24px', padding: '0 16px' }}>
            {!collapsed && <h4 style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Lớp bản đồ</h4>}
            
            {mapLayers.map(layer => (
              <button 
                key={layer.key}
                onClick={() => onToggleLayer(layer.key)}
                className={`sidebar-item ${layer.visible ? "" : "inactive"}`}
                style={{ opacity: layer.visible ? 1 : 0.5 }}
                title={collapsed ? layer.label : ""}
              >
                {layer.visible ? <Eye size={20} color={layer.color} /> : <EyeOff size={20} />}
                {!collapsed && <span>{layer.label}</span>}
              </button>
            ))}
          </div>
        )}
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
  );
}
