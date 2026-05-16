import React from 'react';
import { MapPin, Users, Home, ChevronRight } from 'lucide-react';

const ShelterCard = ({ shelter, onClick }) => {
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'AVAILABLE':
      case 'OPEN':
        return { bg: '#F0FDF4', text: '#16A34A', border: '#DCFCE7', label: 'SẴN SÀNG' };
      case 'FULL':
        return { bg: '#FEF2F2', text: '#DC2626', border: '#FEE2E2', label: 'HẾT CHỖ' };
      case 'CLOSED':
        return { bg: '#F9FAFB', text: '#64748B', border: '#E5E7EB', label: 'ĐÓNG CỬA' };
      default:
        return { bg: '#F0FDF4', text: '#16A34A', border: '#DCFCE7', label: 'SẴN SÀNG' };
    }
  };

  const statusStyle = getStatusBadgeStyle(shelter.status);

  return (
    <div className="support-card-modern shelter-card" onClick={() => onClick(shelter)}>
      <div className="card-top">
        <div className="status-priority">
          <span className="badge-status" style={{ background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}` }}>
            {statusStyle.label}
          </span>
        </div>
        <div className="card-icon-tag">
          <Home size={16} color="#10B981" />
        </div>
      </div>

      <div className="card-content">
        <h3 className="request-title">{shelter.name}</h3>
        <p className="description line-clamp-2">
          {shelter.description || "Nơi trú ẩn an toàn dành cho người dân trong khu vực chịu ảnh hưởng của bão lũ."}
        </p>
      </div>

      <div className="card-footer">
        <div className="info-row">
          <div className="info-item">
            <MapPin size={14} />
            <span className="truncate">{shelter.address}</span>
          </div>
        </div>
        <div className="info-row bottom">
          <div className="info-item">
            <Users size={14} />
            <span>Sức chứa: {shelter.capacity || 'N/A'} người</span>
          </div>
          <div className="view-detail">
            Chi tiết <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShelterCard;
