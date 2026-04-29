import React from 'react';

export const ShelterCard = ({ shelter, onClick, isSelected, distance }) => (
  <div
    className={`card ${onClick ? 'card-clickable' : ''} ${isSelected ? 'selected' : ''}`}
    onClick={onClick}
  >
    <div className="card-header">
      <span className="card-title">{shelter.name}</span>
      <span className={`badge ${shelter.status}`}>{shelter.status}</span>
    </div>
    <p>Sức chứa: {shelter.currentOccupancy} / {shelter.capacity}</p>
    <p>Địa chỉ: {shelter.address}</p>
    {distance != null && <p style={{ color: '#2563EB', fontWeight: '600', fontSize: '0.85rem', marginTop: '4px' }}>Cách đây: {distance.toFixed(1)} km</p>}

  </div>
);

export const AlertCard = ({ alert }) => (
  <div className="card" style={{ borderLeft: `4px solid ${alert.severityLevel === 'CRITICAL' ? 'red' : 'orange'}` }}>
    <div className="card-header">
      <span className="card-title">{alert.title}</span>
      <span className={`badge ${alert.severityLevel}`}>{alert.severityLevel}</span>
    </div>
    <p>{alert.description}</p>
    <small>Khu vực: {alert.affectedArea}</small>
  </div>
);

export const NotificationItem = ({ notif, onRead }) => (
  <div className="card" style={{ 
    borderLeft: notif.status === 'UNREAD' ? '4px solid #2563EB' : '1px solid #ddd',
    background: notif.status === 'UNREAD' ? '#f0f7ff' : '#fff',
    marginBottom: '10px'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
      <div style={{ flex: 1 }}>
        <strong style={{ display: 'block', marginBottom: '5px' }}>{notif.title}</strong>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#444' }}>{notif.message}</p>
        <small style={{ color: '#888', display: 'block', marginTop: '5px' }}>
          {new Date(notif.createdAt).toLocaleString('vi-VN')}
        </small>
      </div>
      {notif.status === 'UNREAD' && (
        <button className="btn btn-outline" onClick={() => onRead(notif.id)} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Đã đọc</button>
      )}
    </div>
  </div>
);
