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
  <div className="card" style={{ opacity: notif.isRead ? 0.6 : 1 }}>
    <strong>{notif.title}</strong>
    <p>{notif.message}</p>
    {!notif.isRead && <button className="btn" onClick={() => onRead(notif.id)} style={{ marginTop: '10px', padding: '5px 10px' }}>Đã đọc</button>}
  </div>
);
