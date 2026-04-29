import React, { useEffect, useState } from 'react';

export const getStatusLabel = (status) => {
  const map = {
    PENDING: 'Chờ xử lý',
    ASSIGNED: 'Đã phân công',
    IN_PROGRESS: 'Đang hỗ trợ',
    RESOLVED: 'Đã xong',
    CANCELLED: 'Đã hủy'
  };
  return map[status] || status;
};

export const getStatusStyle = (status) => {
  const styles = {
    PENDING: { background: '#FEF3C7', color: '#B45309' },
    ASSIGNED: { background: '#DBEAFE', color: '#1D4ED8' },
    IN_PROGRESS: { background: '#E0F2FE', color: '#0369A1' },
    RESOLVED: { background: '#22C55E', color: '#FFFFFF' },
    CANCELLED: { background: '#FEE2E2', color: '#B91C1C' }
  };
  return styles[status] || { background: '#E2E8F0', color: '#475569' };
};

const formatTimeAgo = (value) => {
  if (!value) return '';
  const now = new Date();
  const date = new Date(value);
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Hôm nay';
  if (diffDays < 30) return `${diffDays} ngày trước`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} tháng trước`;

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} năm trước`;
};

const SupportCard = ({ req, isMine, onClick }) => {
  const [address, setAddress] = useState('');

  useEffect(() => {
    const resolveAddress = async () => {
      if (!req?.latitude || !req?.longitude) {
        setAddress('Không có vị trí');
        return;
      }

      if (
        window.google &&
        window.google.maps &&
        window.google.maps.Geocoder
      ) {
        const geocoder = new window.google.maps.Geocoder();

        geocoder.geocode(
          {
            location: {
              lat: Number(req.latitude),
              lng: Number(req.longitude)
            }
          },
          (results, status) => {
            if (status === 'OK' && results && results.length > 0) {
              setAddress(results[0].formatted_address);
            } else {
              setAddress(
                `${req.latitude}, ${req.longitude}`
              );
            }
          }
        );
      } else {
        setAddress(`${req.latitude}, ${req.longitude}`);
      }
    };

    resolveAddress();
  }, [req]);

  const statusStyle = getStatusStyle(req.status);

  return (
    <div
      onClick={() => onClick(req)}
      style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '16px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        cursor: 'pointer'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
          marginBottom: '10px'
        }}
      >
        <span
          style={{
            ...statusStyle,
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: '700',
            whiteSpace: 'nowrap'
          }}
        >
          {getStatusLabel(req.status)}
        </span>

        <span
          style={{
            color: '#6B7280',
            fontSize: '0.85rem',
            whiteSpace: 'nowrap'
          }}
        >
          {formatTimeAgo(req.createdAt)}
        </span>
      </div>

      <div
        style={{
          fontSize: '1.1rem',
          fontWeight: '700',
          color: '#111827',
          lineHeight: 1.4,
          marginBottom: '10px'
        }}
      >
        {req.description?.length > 90
          ? `${req.description.substring(0, 90)}...`
          : req.description}
      </div>

      <div
        style={{
          color: '#6B7280',
          fontSize: '0.95rem',
          lineHeight: 1.5,
          marginBottom: '10px'
        }}
      >
        📍 {address || 'Đang tải địa chỉ...'}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '16px',
          color: '#64748B',
          fontSize: '0.9rem'
        }}
      >
        <span>👥 {req.numberOfPeople} người</span>
      </div>

      {isMine && (
        <div
          style={{
            marginTop: '10px',
            color: '#2563EB',
            fontWeight: '700',
            fontSize: '0.82rem'
          }}
        >
          YÊU CẦU CỦA BẠN
        </div>
      )}
    </div>
  );
};

export default SupportCard;