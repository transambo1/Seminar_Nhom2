import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { getMyNotificationsApi, getUnreadCountApi } from '../../api/notificationApi';
import '../../styles/CitizenDashboard.css';

export default function MainLayout({ children, title, subtitle, mapLayers, onToggleLayer }) {
  const [collapsed, setCollapsed] = useState(false);
  const [notis, setNotis] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchNotis = async () => {
      if (!user.id) return;
      try {
        const [notiRes, unreadRes] = await Promise.all([
          getMyNotificationsApi(user.id),
          getUnreadCountApi(user.id)
        ]);
        setNotis(notiRes.data || []);
        setUnreadCount(typeof unreadRes.data === 'object' ? unreadRes.data.unreadCount : (unreadRes.data || 0));
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotis();
    // Setup simple interval for refresh or SSE could be here
  }, [user.id]);

  return (
    <div className="storm-page">
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        mapLayers={mapLayers}
        onToggleLayer={onToggleLayer}
      />
      <main className="storm-main">
        <Topbar 
          title={title} 
          subtitle={subtitle} 
          user={user} 
          notis={notis} 
          unreadCount={unreadCount}
          onToggleSidebar={() => setCollapsed(!collapsed)}
        />
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
