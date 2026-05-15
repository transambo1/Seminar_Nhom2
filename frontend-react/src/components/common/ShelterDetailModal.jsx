import React from 'react';
import { X, MapPin, Phone, Users, Home, Navigation } from 'lucide-react';

const ShelterDetailModal = ({ shelter, onClose, onOpenMap }) => {
  if (!shelter) return null;

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
        return { bg: '#F0FDF4', text: '#16A34A', border: '#DCFCE7', label: status || 'SẴN SÀNG' };
    }
  };

  const statusStyle = getStatusBadgeStyle(shelter.status);

  return (
    <div className="storm-modal-overlay" onClick={onClose}>
      <div className="storm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#F0FDF4', color: '#16A34A', padding: '10px', borderRadius: '12px' }}>
              <Home size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Chi tiết nơi trú ẩn</h2>
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: '700', 
                padding: '2px 8px', 
                borderRadius: '999px', 
                background: statusStyle.bg, 
                color: statusStyle.text, 
                border: `1px solid ${statusStyle.border}`,
                marginTop: '4px',
                display: 'inline-block'
              }}>
                {statusStyle.label}
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#0F172A' }}>{shelter.name}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', color: '#475569' }}>
                  <MapPin size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{shelter.address}</span>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', color: '#475569' }}>
                  <Users size={20} style={{ flexShrink: 0 }} />
                  <span>Sức chứa: <strong>{shelter.capacity || 'N/A'}</strong> người</span>
                </div>

                <div style={{ display: 'flex', gap: '12px', color: '#475569' }}>
                  <Phone size={20} style={{ flexShrink: 0 }} />
                  <span>Điện thoại: <strong>{shelter.contactPhone || 'N/A'}</strong></span>
                </div>
              </div>
            </div>

            {shelter.description && (
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#64748B' }}>Thông tin thêm</h4>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: 1.5 }}>{shelter.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-outline" 
            onClick={onClose}
            style={{ flex: 1, height: '44px' }}
          >
            Đóng
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => onOpenMap(shelter)}
            style={{ 
              flex: 1.5, 
              height: '44px', 
              background: '#2563EB', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600'
            }}
          >
            <Navigation size={18} />
            Xem trên bản đồ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShelterDetailModal;
