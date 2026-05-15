import React, { useState, useEffect, useMemo } from 'react';
import { getAllIncidentReportsApi } from '../../api/incidentApi';
import { TriangleAlert, Clock, MapPin, Search, RotateCcw, AlertCircle } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';

export default function IncidentList() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    getAllIncidentReportsApi()
      .then(res => {
        // Filter by current user
        const allReports = res.data || [];
        const myReports = allReports.filter(r => r.userId === user.id);
        setReports(myReports);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [user.id]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING': 
        return { bg: '#FFF7ED', text: '#EA580C', border: '#FFEDD5', label: 'Chờ xử lý' };
      case 'APPROVED': 
        return { bg: '#F0FDF4', text: '#16A34A', border: '#DCFCE7', label: 'Đã duyệt' };
      case 'REJECTED': 
        return { bg: '#FEF2F2', text: '#DC2626', border: '#FEE2E2', label: 'Từ chối' };
      default: 
        return { bg: '#F9FAFB', text: '#64748B', border: '#E5E7EB', label: status };
    }
  };

  const filteredReports = useMemo(() => {
    let result = [...reports];

    // Search
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(r => 
        r.description?.toLowerCase().includes(term) || 
        r.address?.toLowerCase().includes(term) ||
        r.incidentType?.toLowerCase().includes(term)
      );
    }

    // Status Filter
    if (statusFilter !== 'ALL') {
      result = result.filter(r => r.status === statusFilter);
    }

    // Sort by newest
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return result;
  }, [reports, searchTerm, statusFilter]);

  const isFilterActive = searchTerm.trim() !== '' || statusFilter !== 'ALL';

  const handleReset = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
  };

  return (
    <MainLayout 
      title="Báo cáo của tôi" 
      subtitle="Theo dõi trạng thái các sự cố bạn đã báo cáo lên hệ thống"
    >
      <div className="support-list-container">
        {/* Filter Section */}
        <div className="filter-section">
          <div className="controls-row">
            <div className="search-box-modern">
              <Search size={18} />
              <input 
                placeholder="Tìm kiếm nội dung, địa chỉ..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <select className="modern-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Chờ xử lý</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Từ chối</option>
              </select>

              <button 
                onClick={handleReset} 
                className={`btn ${isFilterActive ? 'btn-outline' : 'btn-disabled'}`}
                disabled={!isFilterActive}
                style={{ height: '48px', padding: '0 20px', borderRadius: '12px' }}
              >
                <RotateCcw size={18} style={{ marginRight: '8px' }} />
                Xóa lọc
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}><p>Đang tải dữ liệu...</p></div>
        ) : filteredReports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            <AlertCircle size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
            <h3 style={{ color: '#64748b' }}>{isFilterActive ? 'Không tìm thấy báo cáo phù hợp' : 'Bạn chưa gửi báo cáo sự cố nào'}</h3>
            <p style={{ color: '#94a3b8' }}>{isFilterActive ? 'Vui lòng thay đổi từ khóa hoặc bộ lọc.' : 'Các báo cáo bạn gửi sẽ xuất hiện tại đây để theo dõi.'}</p>
          </div>
        ) : (
          <div className="requests-grid">
            {filteredReports.map(r => {
              const statusStyle = getStatusStyle(r.status);
              return (
                <div key={r.id} className="support-card-modern">
                  <div className="card-top">
                    <div className="status-priority">
                      <span className="badge-status" style={{ background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}` }}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <div className="time-ago">
                      <Clock size={14} />
                      <span>{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  <div className="card-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <TriangleAlert size={16} color="#EF4444" />
                      <span style={{ fontWeight: '600', color: '#1E293B', fontSize: '0.85rem' }}>
                        {r.incidentType || 'SỰ CỐ'}
                      </span>
                    </div>
                    <h3 className="request-title" style={{ WebkitLineClamp: 1 }}>{r.description}</h3>
                    <p className="description" style={{ WebkitLineClamp: 2 }}>
                      Vị trí báo cáo tại {r.address || 'vị trí hiện trường'}. Trạng thái: {statusStyle.label}.
                    </p>
                  </div>

                  <div className="card-footer" style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                    <div className="info-row">
                      <div className="info-item">
                        <MapPin size={16} />
                        <span>{r.address || `${parseFloat(r.latitude).toFixed(4)}, ${parseFloat(r.longitude).toFixed(4)}`}</span>
                      </div>
                    </div>
                    
                    {r.adminNote && (
                      <div style={{ marginTop: '12px', padding: '8px 12px', background: '#F8FAFC', borderRadius: '8px', borderLeft: '3px solid #64748B' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                          <strong>Ghi chú từ quản trị viên:</strong> {r.adminNote}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

