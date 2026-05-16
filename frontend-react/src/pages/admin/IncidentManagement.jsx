import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  MapPin, 
  Clock, 
  RefreshCw,
  Search,
  FileText
} from 'lucide-react';
import { getPendingIncidentReportsApi, reviewIncidentReportApi } from '../../api/incidentApi';

export default function IncidentManagement() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await getPendingIncidentReportsApi();
      setIncidents(res.data || []);
    } catch (error) {
      console.error("Error fetching pending incidents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleReview = async (id, status) => {
    if (!window.confirm(`Bạn có chắc chắn muốn ${status === 'APPROVED' ? 'duyệt' : 'từ chối'} báo cáo này?`)) return;
    
    try {
      await reviewIncidentReportApi(id, { status });
      fetchIncidents();
    } catch (error) {
      alert("Lỗi khi xử lý báo cáo sự cố.");
    }
  };

  const filteredIncidents = incidents.filter(inc => 
    (inc.incidentType + (inc.description || '') + (inc.locationName || '')).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page-container">
      <div className="admin-header">
          <div className="admin-header-info">
              <h1>Duyệt báo cáo từ hiện trường</h1>
              <p>Phê duyệt hoặc từ chối các báo cáo sự cố khẩn cấp do người dân gửi về</p>
          </div>
          <button className="btn-admin btn-admin-outline" onClick={fetchIncidents} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <RefreshCw size={16} /> Làm mới
          </button>
      </div>

      <div className="filter-bar">
        <div className="search-box" style={{flex: 1, position: 'relative'}}>
          <Search size={18} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b'}} />
          <input 
            type="text" 
            className="filter-input"
            style={{paddingLeft: '40px', width: '100%'}}
            placeholder="Tìm theo loại sự cố, mô tả, địa điểm..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{color: '#64748b', fontSize: '0.9rem'}}>
            Đang chờ: <strong>{incidents.length}</strong>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Đang tải dữ liệu báo cáo...</div>
      ) : filteredIncidents.length > 0 ? (
        <div className="admin-grid">
          {filteredIncidents.map(inc => (
            <div key={inc.id} className="admin-card">
              <div className="card-title">
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <FileText size={18} color="#ef4444"/>
                    <span>{inc.incidentType}</span>
                </div>
                <span className="admin-badge badge-pending">ĐANG CHỜ</span>
              </div>
              
              <p style={{fontSize: '0.9rem', color: '#475569', marginBottom: '16px', lineHeight: '1.5', minHeight: '4.5em'}}>
                {inc.description}
              </p>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b'}}>
                    <MapPin size={14}/> {inc.locationName || 'Không rõ tọa độ'}
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b'}}>
                    <Clock size={14}/> {new Date(inc.createdAt).toLocaleString('vi-VN')}
                  </div>
              </div>

              {inc.latitude && inc.longitude && (
                <div className="text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded border border-gray-100">
                  Tọa độ: <strong>{inc.latitude}, {inc.longitude}</strong>
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  className="btn-admin btn-admin-primary flex-1"
                  style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
                  onClick={() => handleReview(inc.id, 'APPROVED')}
                >
                  <CheckCircle size={16} /> Duyệt
                </button>
                <button 
                  className="btn-admin btn-admin-danger flex-1"
                  style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
                  onClick={() => handleReview(inc.id, 'REJECTED')}
                >
                  <XCircle size={16} /> Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-dashed border-gray-300">
          <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700">Không có báo cáo nào đang chờ duyệt</h3>
          <p className="text-gray-500">Tất cả báo cáo sự cố từ hiện trường đã được xử lý.</p>
        </div>
      )}
    </div>
  );
}
