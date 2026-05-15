import React, { useState } from 'react';
import { Bell, User, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ title, subtitle, user, notis, unreadCount, onToggleSidebar }) {
  const navigate = useNavigate();
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  return (
    <header className="storm-header">
      <div className="header-left">
        <button className="icon-btn mobile-menu-btn" onClick={onToggleSidebar}>
          <Menu size={22} />
        </button>
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      <div className="header-right">
        <div className="dropdown-wrapper">
          <button className="notification-btn" onClick={() => setIsNotiOpen(!isNotiOpen)}>
            <Bell size={22} />
            {unreadCount > 0 && <span>{unreadCount}</span>}
          </button>

          {isNotiOpen && (
            <div className="dropdown-panel notifications">
              <div className="dropdown-header">
                <strong>Thông báo mới ({unreadCount})</strong>
              </div>
              <div className="dropdown-body">
                {notis.length > 0 ? notis.slice(0, 5).map(n => (
                  <div key={n.id} className={`noti-item ${n.status === 'UNREAD' ? 'unread' : ''}`}>
                    <div className="noti-text">
                      <p>{n.message}</p>
                      <small>{new Date(n.createdAt).toLocaleString('vi-VN')}</small>
                    </div>
                  </div>
                )) : (
                  <p className="no-data">Chưa có thông báo mới nào</p>
                )}
              </div>
              <button className="dropdown-footer" onClick={() => navigate('/notifications')}>
                Xem tất cả
              </button>
            </div>
          )}
        </div>

        <div className="dropdown-wrapper">
          <div className="user-box" onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}>
            <div className="avatar">
              <User size={20} />
            </div>
            <div className="user-info">
              <strong>{user.fullName || "Người dùng"}</strong>
              <span>{user.role === "CITIZEN" ? "Công dân" : user.role || "Thành viên"}</span>
            </div>
            <ChevronDown size={18} />
          </div>

          {isUserDropdownOpen && (
            <div className="dropdown-panel user-menu">
              <button className="dropdown-item" onClick={() => navigate('/profile')}>
                <User size={18} />
                <span>Thông tin tài khoản</span>
              </button>
              <hr />
              <button className="dropdown-item logout" onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>
                <LogOut size={18} />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
