import React, { useEffect, useState } from 'react';
import { getStatusLabel, getStatusStyle } from './SupportCard';
export const getRequestTypeLabel = (type) => {
  const map = {
    RESCUE: 'Cứu hộ',
    MEDICAL: 'Y tế',
    FOOD: 'Lương thực',
    EVACUATION: 'Sơ tán'
  };

  return map[type] || type;
};
const SupportDetailModal = ({ req, onClose, onUpdateStatus, onOpenMap, currentUser }) => {
  const [resolvedAddress, setResolvedAddress] = useState('');

  useEffect(() => {
    if (!req?.latitude || !req?.longitude) {
      setResolvedAddress('Không có vị trí');
      return;
    }

    if (window.google && window.google.maps && window.google.maps.Geocoder) {
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
            setResolvedAddress(results[0].formatted_address);
          } else {
            setResolvedAddress(`${req.latitude.toFixed(6)}, ${req.longitude.toFixed(6)}`);
          }
        }
      );
    } else {
      setResolvedAddress(`${req.latitude.toFixed(6)}, ${req.longitude.toFixed(6)}`);
    }
  }, [req]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '24px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          width: '100%',
          maxWidth: '500px',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '800',
              color: '#0F172A'
            }}
          >
            Chi tiết yêu cầu
          </h3>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '2rem',
              color: '#64748B',
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            fontSize: '1rem',
            color: '#334155'
          }}
        >
          <div>
            <strong>Loại hỗ trợ:</strong> {getRequestTypeLabel(req.requestType)}
          </div>

          <div>
            <strong>Trạng thái:</strong>
            <span
              style={{
                ...getStatusStyle(req.status),
                padding: '6px 12px',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: '700',
                marginLeft: '8px'
              }}
            >
              {getStatusLabel(req.status)}
            </span>
          </div>

          <div>
            <strong>Số người:</strong> {req.numberOfPeople}
          </div>

          <div>
            <strong>Địa chỉ:</strong> {resolvedAddress || 'Đang tải địa chỉ...'}
          </div>

          <div>
            <strong>Mô tả:</strong>
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '8px'
              }}
            >
              {req.description}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: '32px',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            flexWrap: 'wrap'
          }}
        >
          <button
            className="btn btn-outline"
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: '600'
            }}
            onClick={onClose}
          >
            Đóng
          </button>

          {req.isMine ? (
            req.status === 'PENDING' && (
              <button
                className="btn btn-danger"
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: '600'
                }}
                onClick={() => onUpdateStatus(req.id, 'CANCELLED')}
              >
                Hủy yêu cầu
              </button>
            )
          ) : (
            <>
              <button
                className="btn btn-primary"
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  color: '#fff',
                  border: 'none'
                }}
                onClick={() => onOpenMap(req)}
              >
                Xem trên bản đồ
              </button>

              {req.status === 'PENDING' && currentUser.role !== 'CITIZEN' && (
                <button
                  onClick={() => onUpdateStatus(req.id, 'ASSIGNED')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    background: '#10B981',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Đến giúp
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportDetailModal;