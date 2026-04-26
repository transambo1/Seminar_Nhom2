import React, { useEffect, useState } from 'react';
import { getMyNotificationsApi, markNotificationReadApi, markAllNotificationsReadApi } from '../api/apiServices';
import { NotificationItem } from '../components/Cards';

const Notifications = () => {
  const [notifs, setNotifs] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id || user.userId;

  useEffect(() => {
    const load = () => {
      if (userId) {
        getMyNotificationsApi(userId).then(res => setNotifs(res.data));
      }
    };
    load();

    if (userId) {
      // SSE Connection for real-time list update
      const eventSource = new EventSource(`http://localhost:8080/api/v1/notifications/stream?userId=${userId}`);
      
      eventSource.addEventListener('notification', (event) => {
        const newNotif = JSON.parse(event.data);
        setNotifs(prev => [newNotif, ...prev]);
      });

      return () => eventSource.close();
    }
  }, [userId]);

  const onRead = async (id) => {
    await markNotificationReadApi(id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, status: 'READ' } : n));
  };

  const onReadAll = async () => {
    if (userId) {
      await markAllNotificationsReadApi(userId);
      setNotifs(prev => prev.map(n => ({ ...n, status: 'READ' })));
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Thông báo</h2>
        {notifs.some(n => n.status === 'UNREAD') && (
          <button className="btn btn-outline" onClick={onReadAll}>Đánh dấu tất cả là đã đọc</button>
        )}
      </div>
      <div style={{ marginTop: '20px' }}>
        {notifs.length > 0 ? (
          notifs.map(n => <NotificationItem key={n.id} notif={n} onRead={onRead} />)
        ) : (
          <p style={{ textAlign: 'center', color: '#888', marginTop: '50px' }}>Không có thông báo nào.</p>
        )}
      </div>
    </div>
  );
};
export default Notifications;
