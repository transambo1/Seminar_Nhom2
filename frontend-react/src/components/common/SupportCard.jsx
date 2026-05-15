import React, { useEffect, useState } from 'react';
import { MapPin, Users, Clock, ArrowRight } from 'lucide-react';

export const getStatusLabel = (status) => {
  const map = {
    PENDING: 'Chờ xử lý',
    ASSIGNED: 'Đã phân công',
    IN_PROGRESS: 'Đang hỗ trợ',
    RESOLVED: 'Đã hoàn thành',
    CANCELLED: 'Đã hủy'
  };
  return map[status] || status;
};

export const getStatusBadgeStyle = (status) => {
  const styles = {
    PENDING: { background: '#FFF7ED', color: '#EA580C', border: '1px solid #FFEDD5' },
    ASSIGNED: { background: '#EFF6FF', color: '#2563EB', border: '1px solid #DBEAFE' },
    IN_PROGRESS: { background: '#F0F9FF', color: '#0284C7', border: '1px solid #E0F2FE' },
    RESOLVED: { background: '#F0FDF4', color: '#16A34A', border: '1px solid #DCFCE7' },
    CANCELLED: { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FEE2E2' }
  };
  return styles[status] || { background: '#F9FAFB', color: '#4B5563', border: '1px solid #E5E7EB' };
};

export const getPriorityBadgeStyle = (priority) => {
  const styles = {
    CRITICAL: { background: '#FEF2F2', color: '#DC2626', label: 'Khẩn cấp' },
    HIGH: { background: '#FFF7ED', color: '#EA580C', label: 'Cao' },
    MEDIUM: { background: '#FEFCE8', color: '#CA8A04', label: 'Trung bình' },
    LOW: { background: '#F9FAFB', color: '#4B5563', label: 'Thấp' }
  };
  return styles[priority] || { background: '#F9FAFB', color: '#4B5563', label: priority };
};

const formatTimeAgo = (value) => {
  if (!value) return '';
  const now = new Date();
  const date = new Date(value);
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 30) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

const SupportCard = ({ req, isMine, onClick }) => {
  const [address, setAddress] = useState('');

  useEffect(() => {
    const resolveAddress = async () => {
      if (!req?.latitude || !req?.longitude) {
        setAddress('Không rõ vị trí');
        return;
      }
      if (window.google?.maps?.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat: Number(req.latitude), lng: Number(req.longitude) } }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            setAddress(results[0].formatted_address);
          } else {
            setAddress(`${req.latitude}, ${req.longitude}`);
          }
        });
      } else {
        setAddress(`${req.latitude}, ${req.longitude}`);
      }
    };
    resolveAddress();
  }, [req]);

  const statusStyle = getStatusBadgeStyle(req.status);
  const priorityInfo = getPriorityBadgeStyle(req.priorityLevel);

  return (
    <div className="support-card-modern" onClick={() => onClick(req)}>
      <div className="card-top">
        <div className="status-priority">
          <span className="badge-status" style={statusStyle}>
            {getStatusLabel(req.status)}
          </span>
          {req.priorityLevel && (
            <span className="badge-priority" style={{ background: priorityInfo.background, color: priorityInfo.color }}>
              {priorityInfo.label}
            </span>
          )}
        </div>
        <div className="time-ago">
          <Clock size={14} />
          <span>{formatTimeAgo(req.createdAt)}</span>
        </div>
      </div>

      <div className="card-content">
        <h3 className="request-title">
          {req.requestType === 'RESCUE' ? 'Yêu cầu Cứu hộ' : 
           req.requestType === 'MEDICAL' ? 'Hỗ trợ Y tế' :
           req.requestType === 'FOOD' ? 'Cần Lương thực' : 
           req.requestType === 'EVACUATION' ? 'Cần Sơ tán' : 'Yêu cầu hỗ trợ'}
        </h3>
        <p className="description">
          {req.description}
        </p>
      </div>

      <div className="card-footer">
        <div className="info-row">
          <div className="info-item">
            <MapPin size={16} />
            <span className="truncate" title={address}>{address || 'Đang tải...'}</span>
          </div>
        </div>
        <div className="info-row bottom">
          <div className="info-item">
            <Users size={16} />
            <span>{req.numberOfPeople} người</span>
          </div>
          {isMine && <span className="mine-tag">Yêu cầu của bạn</span>}
          <div className="view-detail">
            Chi tiết <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportCard;